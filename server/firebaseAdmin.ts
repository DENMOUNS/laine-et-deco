import firebaseAdmin from 'firebase-admin';

if (!firebaseAdmin.apps.length) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY missing');
  }

  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    ),
  });
}

const db = firebaseAdmin.firestore();
const auth = firebaseAdmin.auth();

export { firebaseAdmin, db, auth };