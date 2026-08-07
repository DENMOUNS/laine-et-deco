import './loadEnv.js';
import firebaseAdmin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import config from '../firebase-applet-config.json';
import type { Firestore } from 'firebase-admin/firestore';

const maskEmail = (value?: string) => {
  if (!value) return 'missing';
  const [name, domain] = value.split('@');
  return `${name?.slice(0, 3) || '???'}***@${domain || 'unknown'}`;
};

function parseServiceAccount(rawKey?: string) {
  if (!rawKey) return null;
  const normalizedRawKey =
    (rawKey.startsWith("'") && rawKey.endsWith("'")) ||
    (rawKey.startsWith('"') && rawKey.endsWith('"'))
      ? rawKey.slice(1, -1)
      : rawKey;

  try {
    const serviceAccount = JSON.parse(normalizedRawKey);
    if (typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    return serviceAccount;
  } catch (err: any) {
    console.error('[firebaseAdmin] Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON', { error: err?.message });
    return null;
  }
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

let initializationError: Error | null = null;
export let db: Firestore | null = null;
export let auth: any = null;

let initialized = false;

const initializeFirebase = async () => {
  if (initialized) return;
  initialized = true;
  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  const serviceAccount = parseServiceAccount(rawKey) || undefined;

  try {
    if (!firebaseAdmin.apps.length) {
      if (serviceAccount) {
        firebaseAdmin.initializeApp({
          credential: firebaseAdmin.credential.cert(serviceAccount as any),
          storageBucket: storageBucket || undefined,
        } as any);
      } else {
        firebaseAdmin.initializeApp({
          projectId: projectId || undefined,
          storageBucket: storageBucket || undefined,
        } as any);
      }
    }

    db = getFirestore(firebaseAdmin.app(), databaseId);
    auth = firebaseAdmin.auth();
  } catch (error: any) {
    initializationError = new Error('Firebase Admin initialization failed: ' + error?.message);
    console.error('[firebaseAdmin] Initialization failed', error);
    // keep db/auth as null; ensureFirestoreConnection will retry later
    db = null;
    auth = null;
  }
};

export const ensureFirestoreConnection = async (attempts = 3, delayMs = 500) => {
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
        errorStack: e?.stack,
      });
    }
    // exponential backoff
    await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, i)));
  }
  console.error('[firebaseAdmin] ensureFirestoreConnection failed after retries', {
    attempts,
    initializationError: initializationError?.message,
  });
  return false;
};

export { firebaseAdmin, initializationError };
