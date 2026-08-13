import * as crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function loadFirebaseConfig() {
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) {
    console.warn('[firestoreRest] Failed to read firebase-applet-config.json:', e);
  }
  return {};
}

const config = loadFirebaseConfig();

interface ServiceAccount {
  type: string;
  project_id: string;
  private_key: string;
  client_email: string;
}

interface AccessTokenCache {
  token: string;
  expiresAt: number;
}

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const FIRESTORE_SCOPE = 'https://www.googleapis.com/auth/datastore';
let tokenCache: AccessTokenCache | null = null;
const firebaseConfig = (config as any).default ?? config;

const normalizeDatabaseId = (value?: string | null): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === '(default)') return null;
  return trimmed;
};

function cleanPrivateKey(key: string): string {
  if (typeof key !== 'string') return '';
  let cleaned = key.trim();

  // Remove surrounding single or double quotes repeatedly
  while (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // Convert literal backslash-n (\n) or \r\n into real newlines
  cleaned = cleaned.replace(/\\n/g, '\n').replace(/\\r/g, '');

  // Remove surrounding quotes again if double-encoded
  while (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  const beginMarker = '-----BEGIN PRIVATE KEY-----';
  const endMarker = '-----END PRIVATE KEY-----';

  if (!cleaned.includes(beginMarker) || !cleaned.includes(endMarker)) {
    const upper = cleaned.toUpperCase();
    if (upper.includes('BEGIN PRIVATE KEY') && upper.includes('END PRIVATE KEY')) {
      cleaned = cleaned
        .replace(/-----?BEGIN PRIVATE KEY-----?/i, beginMarker)
        .replace(/-----?END PRIVATE KEY-----?/i, endMarker);
    }
  }

  if (cleaned.includes(beginMarker) && cleaned.includes(endMarker)) {
    const beginIndex = cleaned.indexOf(beginMarker) + beginMarker.length;
    const endIndex = cleaned.indexOf(endMarker);
    let body = cleaned.substring(beginIndex, endIndex).trim();

    body = body.replace(/[^A-Za-z0-9+/=]/g, '\n');
    const lines = body.split('\n').map((line) => line.trim()).filter(Boolean);

    cleaned = `${beginMarker}\n${lines.join('\n')}\n${endMarker}\n`;
  }

  return cleaned;
}

const parseServiceAccount = (rawKey?: string): ServiceAccount | null => {
  let account: any = null;

  if (rawKey) {
    let s = rawKey.trim();

    // Remove leading export / variable assignment if pasted directly like FIREBASE_SERVICE_ACCOUNT_KEY='...'
    s = s.replace(/^(export\s+)?FIREBASE_SERVICE_ACCOUNT_KEY\s*=\s*/i, '').trim();

    // Strip wrapping single or double quotes repeatedly
    while (
      (s.startsWith("'") && s.endsWith("'")) ||
      (s.startsWith('"') && s.endsWith('"'))
    ) {
      s = s.slice(1, -1).trim();
    }

    // Extract JSON object if wrapped in text or extra quotes
    const firstBrace = s.indexOf('{');
    const lastBrace = s.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      s = s.substring(firstBrace, lastBrace + 1);
    }

    // Attempt 1: Direct JSON.parse
    try {
      account = JSON.parse(s);
    } catch (err1) {
      // Attempt 2: Fix unescaped newlines inside string values
      try {
        const fixedKey = s.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match) => {
          return match.replace(/\r?\n/g, '\\n');
        });
        account = JSON.parse(fixedKey);
      } catch (err2) {
        // Attempt 3: Only try Base64 if s looks like pure Base64 (no { or })
        const trimmedOriginal = rawKey.trim();
        if (!trimmedOriginal.includes('{') && /^[A-Za-z0-9+/=\s]+$/.test(trimmedOriginal)) {
          try {
            const decoded = Buffer.from(trimmedOriginal, 'base64').toString('utf8');
            account = JSON.parse(decoded);
          } catch (err3) {
            console.error('[firestoreRest] Base64 decode failed');
          }
        } else {
          console.error('[firestoreRest] Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON string');
        }
      }
    }
  }

  if (!account || typeof account !== 'object') {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

    if (privateKey && clientEmail) {
      account = {
        type: 'service_account',
        project_id: projId,
        client_email: clientEmail,
        private_key: privateKey,
      };
    }
  }

  if (account && typeof account === 'object') {
    if (typeof account.private_key === 'string') {
      account.private_key = cleanPrivateKey(account.private_key);
    }
    return account as ServiceAccount;
  }

  return null;
};

const getServiceAccount = (): ServiceAccount => {
  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  const serviceAccount = parseServiceAccount(rawKey);
  if (!serviceAccount) {
    throw new Error('Missing or invalid FIREBASE_SERVICE_ACCOUNT_KEY');
  }
  return serviceAccount;
};

const getProjectId = (): string => {
  return (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    firebaseConfig?.projectId ||
    getServiceAccount().project_id ||
    ''
  );
};

const getDatabaseId = (): string => {
  return (
    normalizeDatabaseId(process.env.FIRESTORE_DATABASE_ID) ||
    normalizeDatabaseId(process.env.VITE_FIRESTORE_DATABASE_ID) ||
    normalizeDatabaseId(firebaseConfig?.firestoreDatabaseId) ||
    '(default)'
  );
};

const base64UrlEncode = (value: Buffer) => value.toString('base64url');

const createJwt = (serviceAccount: ServiceAccount) => {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: serviceAccount.client_email,
    scope: FIRESTORE_SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(Buffer.from(JSON.stringify(header), 'utf8'));
  const encodedClaims = base64UrlEncode(Buffer.from(JSON.stringify(claimSet), 'utf8'));
  const unsignedToken = `${encodedHeader}.${encodedClaims}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  signer.end();

  const signature = signer.sign(serviceAccount.private_key);
  const encodedSignature = base64UrlEncode(Buffer.from(signature));

  return `${unsignedToken}.${encodedSignature}`;
};

const getAccessToken = async (): Promise<string> => {
  if (tokenCache && tokenCache.expiresAt - Date.now() > 60_000) {
    return tokenCache.token;
  }

  const serviceAccount = getServiceAccount();
  const jwt = createJwt(serviceAccount);

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }).toString(),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Failed to fetch access token: ${response.status} ${payload}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  };

  return tokenCache.token;
};

const getFirestoreBaseUrl = (): { projectId: string; databaseId: string } => {
  const projectId = getProjectId();
  const databaseId = getDatabaseId();
  if (!projectId) {
    throw new Error('Missing Firebase project ID');
  }
  return { projectId, databaseId };
};

const parseFirestoreValue = (value: any): any => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'object') {
    return value;
  }

  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return value.timestampValue;
  if ('geoPointValue' in value) return value.geoPointValue;
  if ('referenceValue' in value) return value.referenceValue;
  if ('bytesValue' in value) return value.bytesValue;
  if ('mapValue' in value) {
    const mapValue = value.mapValue.fields || {};
    return Object.fromEntries(
      Object.entries(mapValue).map(([key, nested]) => [key, parseFirestoreValue(nested)])
    );
  }
  if ('arrayValue' in value) {
    const values = value.arrayValue.values || [];
    return values.map(parseFirestoreValue);
  }

  return value;
};

const parseFirestoreDocument = (document: any) => {
  const rawFields = document.fields || {};
  const data = Object.fromEntries(
    Object.entries(rawFields).map(([key, fieldValue]) => [key, parseFirestoreValue(fieldValue)])
  );

  const nameParts = String(document.name || '').split('/');
  const id = nameParts[nameParts.length - 1] || null;
  return id ? { id, ...data } : data;
};

const buildDocumentUrl = (collection: string, id: string) => {
  const { projectId, databaseId } = getFirestoreBaseUrl();
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/${encodeURIComponent(databaseId)}/documents/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`;
};

const buildCollectionUrl = (collection: string) => {
  const { projectId, databaseId } = getFirestoreBaseUrl();
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/${encodeURIComponent(databaseId)}/documents/${encodeURIComponent(collection)}`;
};

const buildRunQueryUrl = () => {
  const { projectId, databaseId } = getFirestoreBaseUrl();
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/${encodeURIComponent(databaseId)}/documents:runQuery`;
};

const toFirestoreValue = (value: unknown): Record<string, unknown> => {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }
  if (typeof value === 'string') {
    return { stringValue: value };
  }
  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }
  return { stringValue: String(value) };
};

const fetchJson = async (url: string, opts: RequestInit) => {
  const headers: Record<string, string> = {
    ...(opts.headers || {}),
  } as Record<string, string>;

  const token = await getAccessToken();
  headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, {
    ...opts,
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Firestore REST request failed ${response.status}: ${message}`);
  }

  return response.json();
};

export const firestoreRestGetDocument = async (collection: string, id: string) => {
  const url = buildDocumentUrl(collection, id);
  const document = await fetchJson(url, { method: 'GET' });
  return parseFirestoreDocument(document);
};

export const firestoreRestGetCollection = async (collection: string) => {
  const url = buildCollectionUrl(collection);
  const response = await fetchJson(url, { method: 'GET' }) as { documents?: any[] };
  const documents = response.documents || [];
  return documents.map(parseFirestoreDocument);
};

export const firestoreRestQueryByField = async (collection: string, fieldPath: string, op: string, value: unknown) => {
  const url = buildRunQueryUrl();
  const body = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where: {
        fieldFilter: {
          field: { fieldPath },
          op,
          value: toFirestoreValue(value),
        },
      },
      limit: 1000,
    },
  };

  const response = await fetchJson(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }) as any[];

  return response
    .filter((item) => item.document)
    .map((item) => parseFirestoreDocument(item.document));
};
