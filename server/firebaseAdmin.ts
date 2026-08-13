import './loadEnv.js';
import firebaseAdmin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'node:fs';
import path from 'node:path';
import type { Firestore } from 'firebase-admin/firestore';

function loadFirebaseConfig() {
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) {
    console.warn('[firebaseAdmin] Failed to read firebase-applet-config.json:', e);
  }
  return {};
}

const config = loadFirebaseConfig();

const maskEmail = (value?: string) => {
  if (!value) return 'missing';
  const [name, domain] = value.split('@');
  return `${name?.slice(0, 3) || '???'}***@${domain || 'unknown'}`;
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
    // Try case-insensitive recovery if header/footer markers were damaged
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

    // Clean up base64 body: standard PEM base64 only contains A-Z, a-z, 0-9, +, /, = and newlines
    // Replace any space or invalid character with newlines
    body = body.replace(/[^A-Za-z0-9+/=]/g, '\n');
    const lines = body.split('\n').map((line) => line.trim()).filter(Boolean);
    const bodyLength = lines.join('').length;

    if (bodyLength < 500) {
      console.warn(`[firebaseAdmin] WARNING: private_key body length is only ${bodyLength} chars (expected ~1600+ chars for a valid RSA private key). The key in FIREBASE_SERVICE_ACCOUNT_KEY may be truncated or a placeholder.`);
    }

    cleaned = `${beginMarker}\n${lines.join('\n')}\n${endMarker}\n`;
  }

  return cleaned;
}

function parseServiceAccount(rawKey?: string) {
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
          } catch (err3: any) {
            console.error('[firebaseAdmin] Base64 decode failed:', err3?.message);
          }
        } else {
          console.error('[firebaseAdmin] Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON string');
        }
      }
    }
  }

  // Fallback to individual environment variables if rawKey was not valid JSON
  if (!account || typeof account !== 'object') {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

    if (privateKey && clientEmail) {
      account = {
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
    return account;
  }

  return null;
}

const firebaseConfig = (config as any).default || config;
const normalizeDatabaseId = (value?: string | null) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === '(default)') return null;
  return trimmed;
};
const storageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket;
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId;
const databaseId =
  normalizeDatabaseId(process.env.FIRESTORE_DATABASE_ID) ||
  normalizeDatabaseId(process.env.VITE_FIRESTORE_DATABASE_ID) ||
  normalizeDatabaseId(firebaseConfig.firestoreDatabaseId) ||
  '(default)';
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST?.trim() || '';

let initializationError: Error | null = null;
export let db: Firestore | null = null;
export let auth: any = null;

let initialized = false;

const initializeFirebase = async () => {
  if (initialized && db && auth) return;
  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  const serviceAccount = parseServiceAccount(rawKey) || undefined;
  const resolvedProjectId = serviceAccount?.project_id || projectId;

  try {
    if (!firebaseAdmin.apps.length) {
      let certSuccess = false;
      if (serviceAccount && serviceAccount.private_key && serviceAccount.client_email) {
        try {
          firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(serviceAccount as any),
            projectId: resolvedProjectId || undefined,
            storageBucket: storageBucket || undefined,
          } as any);
          certSuccess = true;
        } catch (certErr: any) {
          console.error('[firebaseAdmin] credential.cert initialization failed, falling back to default application credentials:', certErr?.message || certErr);
        }
      }

      if (!certSuccess && !firebaseAdmin.apps.length) {
        firebaseAdmin.initializeApp({
          projectId: resolvedProjectId || undefined,
          storageBucket: storageBucket || undefined,
        } as any);
      }
    }

    if (emulatorHost) {
      process.env.FIRESTORE_EMULATOR_HOST = emulatorHost;
    }

    db = getFirestore(firebaseAdmin.app(), databaseId);
    if (emulatorHost) {
      db.settings({ host: emulatorHost, ssl: false });
    }
    auth = firebaseAdmin.auth();
    initializationError = null;
    initialized = true;
  } catch (error: any) {
    initializationError = new Error('Firebase Admin initialization failed: ' + error?.message);
    console.error('[firebaseAdmin] Initialization failed', error);
    db = null;
    auth = null;
    initialized = false;
  }
};

export const ensureFirestoreConnection = async (attempts = 3, delayMs = 200) => {
  if (db && auth) return true;
  for (let i = 0; i < attempts; i++) {
    try {
      await initializeFirebase();
      if (db && auth) return true;
    } catch (e: any) {
      initializationError = e;
      console.error('[firebaseAdmin] ensureFirestoreConnection catch', {
        attempt: i + 1,
        attempts,
        errorName: e?.name,
        errorMessage: e?.message,
      });
    }
    if (i < attempts - 1) {
      await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, i)));
    }
  }
  return Boolean(db && auth);
};

export const getDb = (): Firestore | null => db;
export const getAuth = (): any => auth;

export { firebaseAdmin, initializationError };
