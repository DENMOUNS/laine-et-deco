import firebaseAdmin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import config from '../../firebase-applet-config.json';

const firebaseConfig = (config as any).default || config;

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

function getDb() {
  if (!firebaseAdmin.apps.length) {
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(getServiceAccount()),
    });
  }

  const databaseId =
    process.env.FIRESTORE_DATABASE_ID ||
    firebaseConfig.firestoreDatabaseId ||
    '(default)';

  return getFirestore(firebaseAdmin.app(), databaseId);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = getDb();
    await db.collection('analytics').doc('visitors').set(
      {
        count: firebaseAdmin.firestore.FieldValue.increment(1),
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to track visitor' });
  }
}
