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
  const projectId = process.env.FIREBASE_PROJECT_ID;
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
    console.error('[firebaseAdmin] Missing Firebase service account configuration', envSummary);
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY is missing in environment variables.'
    );
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

if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(getServiceAccount()),
    storageBucket: storageBucket || undefined,
  });
}

const databaseId =
  process.env.FIRESTORE_DATABASE_ID ||
  firebaseConfig.firestoreDatabaseId ||
  '(default)';

const db = getFirestore(firebaseAdmin.app(), databaseId);
const auth = firebaseAdmin.auth();

export { firebaseAdmin, db, auth };
