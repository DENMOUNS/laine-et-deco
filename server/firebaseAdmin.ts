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
  
  // Remove wrapping quotes
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // Replace literal escaped \n with actual newlines
  cleaned = cleaned.replace(/\\n/g, '\n').replace(/\\r/g, '');

  // Remove wrapping quotes if double wrapped
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // Extract the PEM contents
  const beginMarker = '-----BEGIN PRIVATE KEY-----';
  const endMarker = '-----END PRIVATE KEY-----';
  
  if (cleaned.includes(beginMarker) && cleaned.includes(endMarker)) {
    const beginIndex = cleaned.indexOf(beginMarker) + beginMarker.length;
    const endIndex = cleaned.indexOf(endMarker);
    let body = cleaned.substring(beginIndex, endIndex).trim();
    
    // In case the body has spaces instead of newlines (common when copying env vars as a single line)
    if (!body.includes('\n') && body.includes(' ')) {
      body = body.replace(/\s+/g, '\n');
    }
    
    // Reconstruct PEM exactly
    cleaned = `${beginMarker}\n${body}\n${endMarker}\n`;
  }
  
  return cleaned;
}

function parseServiceAccount(rawKey?: string) {
  if (!rawKey) return null;
  let normalizedRawKey = rawKey.trim();
  if (
    (normalizedRawKey.startsWith("'") && normalizedRawKey.endsWith("'")) ||
    (normalizedRawKey.startsWith('"') && normalizedRawKey.endsWith('"'))
  ) {
    normalizedRawKey = normalizedRawKey.slice(1, -1).trim();
  }

  const processAccount = (account: any) => {
    if (account && typeof account === 'object') {
      if (typeof account.private_key === 'string') {
        account.private_key = cleanPrivateKey(account.private_key);
      }
      return account;
    }
    return null;
  };

  try {
    const serviceAccount = JSON.parse(normalizedRawKey);
    return processAccount(serviceAccount);
  } catch (err: any) {
    try {
      const decoded = Buffer.from(normalizedRawKey, 'base64').toString('utf8');
      const serviceAccount = JSON.parse(decoded);
      return processAccount(serviceAccount);
    } catch (err2: any) {
      console.error('[firebaseAdmin] Invalid FIREBASE_SERVICE_ACCOUNT_KEY (JSON and base64 parsing failed):', err2?.message);
    }
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
