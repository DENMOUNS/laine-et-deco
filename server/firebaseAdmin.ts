import './loadEnv.js';
import firebaseAdmin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import config from '../firebase-applet-config.json';

function getServiceAccount() {
  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!rawKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY missing');
  }

  const serviceAccount = JSON.parse(rawKey);

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
