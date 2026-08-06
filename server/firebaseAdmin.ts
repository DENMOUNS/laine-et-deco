import './loadEnv.js';
import firebaseAdmin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import config from '../firebase-applet-config.json';

const maskEmail = (value?: string) => {
  if (!value) return 'missing';
  const [name, domain] = value.split('@');
  return `${name?.slice(0, 3) || '???'}***@${domain || 'unknown'}`;
};

function getServiceAccount() {
  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  const envSummary = {
    hasFIREBASE_SERVICE_ACCOUNT_KEY: Boolean(rawKey),
    hasFIREBASE_PROJECT_ID: Boolean(projectId),
    hasFIREBASE_CLIENT_EMAIL: Boolean(clientEmail),
    hasFIREBASE_PRIVATE_KEY: Boolean(privateKey),
  };

  if (!rawKey && projectId && clientEmail && privateKey) {
    return {
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n'),
    };
  }

  if (!rawKey) {
    return null;
  }

  const normalizedRawKey =
    (rawKey.startsWith("'") && rawKey.endsWith("'")) ||
    (rawKey.startsWith('"') && rawKey.endsWith('"'))
      ? rawKey.slice(1, -1)
      : rawKey;

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(normalizedRawKey);
  } catch (error: any) {
    console.error('[firebaseAdmin] Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON', {
      error: error?.message,
      envSummary,
    });
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY contains invalid JSON: ' + error?.message);
  }

  if (typeof serviceAccount.private_key === 'string') {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  return serviceAccount;
}

const firebaseConfig = (config as any).default || config;
// Prefer VITE_FIREBASE_STORAGE_BUCKET (set in env) for local/dev usage, fallback to FIREBASE_STORAGE_BUCKET or config
const storageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket;
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId;
const databaseId =
  process.env.FIRESTORE_DATABASE_ID ||
  process.env.VITE_FIRESTORE_DATABASE_ID ||
  firebaseConfig.firestoreDatabaseId ||
  '(default)';

let initializationError: Error | null = null;
export let db: any = null;
export let auth: any = null;

if (!firebaseAdmin.apps.length) {
  const serviceAccount = getServiceAccount();

  try {
    if (serviceAccount) {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
        storageBucket: storageBucket || undefined,
      });
    } else {
      firebaseAdmin.initializeApp({
        projectId: projectId || undefined,
        storageBucket: storageBucket || undefined,
      });
    }
  } catch (error: any) {
    initializationError = new Error('Firebase Admin initialization failed: ' + error?.message);
    console.error('[firebaseAdmin] Initialization failed, retrying with application default credentials', error);

    try {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.applicationDefault(),
        projectId: projectId || undefined,
        storageBucket: storageBucket || undefined,
      });
    } catch (fallbackError: any) {
      initializationError = new Error('Firebase Admin initialization failed: ' + fallbackError?.message);
      console.error('[firebaseAdmin] Application default credentials also failed', fallbackError);
    }
  }
}

if (firebaseAdmin.apps.length) {
  try {
    db = getFirestore(firebaseAdmin.app(), databaseId);
    auth = firebaseAdmin.auth();
  } catch (error: any) {
    initializationError = new Error('Firebase Firestore/Auth initialization failed: ' + error?.message);
    console.error('[firebaseAdmin] Firestore/Auth initialization failed', error);
  }
}

if (!db || !auth) {
  console.error('[firebaseAdmin] Firebase backend unavailable for API routes', {
    projectId,
    databaseId,
    hasServiceAccount: Boolean(getServiceAccount()),
    initializationError: initializationError?.message || null,
  });
}

export { firebaseAdmin, initializationError };
