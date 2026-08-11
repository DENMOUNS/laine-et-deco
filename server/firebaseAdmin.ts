import './loadEnv.js';
import firebaseAdmin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import config from '../firebase-applet-config.json' with { type: 'json' };
import type { Firestore } from 'firebase-admin/firestore';

const maskEmail = (value?: string) => {
  if (!value) return 'missing';
  const [name, domain] = value.split('@');
  return `${name?.slice(0, 3) || '???'}***@${domain || 'unknown'}`;
};

function parseServiceAccount(rawKey?: string) {
  if (!rawKey) return null;
  let normalizedRawKey = rawKey.trim();
  if (
    (normalizedRawKey.startsWith("'") && normalizedRawKey.endsWith("'")) ||
    (normalizedRawKey.startsWith('"') && normalizedRawKey.endsWith('"'))
  ) {
    normalizedRawKey = normalizedRawKey.slice(1, -1).trim();
  }

  try {
    const serviceAccount = JSON.parse(normalizedRawKey);
    if (serviceAccount && typeof serviceAccount === 'object') {
      if (typeof serviceAccount.private_key === 'string') {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      return serviceAccount;
    }
  } catch (err: any) {
    try {
      const decoded = Buffer.from(normalizedRawKey, 'base64').toString('utf8');
      const serviceAccount = JSON.parse(decoded);
      if (serviceAccount && typeof serviceAccount === 'object') {
        if (typeof serviceAccount.private_key === 'string') {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        return serviceAccount;
      }
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
      if (serviceAccount) {
        firebaseAdmin.initializeApp({
          credential: firebaseAdmin.credential.cert(serviceAccount as any),
          projectId: resolvedProjectId || undefined,
          storageBucket: storageBucket || undefined,
        } as any);
      } else {
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
