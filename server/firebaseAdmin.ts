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

  if (!rawKey) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      console.info('[firebase-admin] using split env service account', {
        projectId,
        clientEmail: maskEmail(clientEmail),
        hasPrivateKey: true,
      });
      return {
        project_id: projectId,
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      };
    }

    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY missing');
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
    console.error('[firebase-admin] invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON', {
      rawLength: rawKey.length,
      startsWithBrace: normalizedRawKey.startsWith('{'),
      endsWithBrace: normalizedRawKey.endsWith('}'),
      message: error?.message,
    });
    throw error;
  }

  if (typeof serviceAccount.private_key === 'string') {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  console.info('[firebase-admin] using JSON service account', {
    projectId: serviceAccount.project_id,
    clientEmail: maskEmail(serviceAccount.client_email),
    hasPrivateKey: Boolean(serviceAccount.private_key),
  });

  return serviceAccount;
}

const firebaseConfig = (config as any).default || config;
// Prefer VITE_FIREBASE_STORAGE_BUCKET (set in env) for local/dev usage, fallback to FIREBASE_STORAGE_BUCKET or config
const storageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket;

if (!firebaseAdmin.apps.length) {
  console.info('[firebase-admin] initializing app', {
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    storageBucket: storageBucket || 'none',
  });
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

console.info('[firebase-admin] firestore ready', {
  projectId: firebaseAdmin.app().options.projectId,
  databaseId,
});

export { firebaseAdmin, db, auth };
