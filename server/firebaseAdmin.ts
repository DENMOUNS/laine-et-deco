import admin from 'firebase-admin';

let db: admin.firestore.Firestore | null = null;
let auth: admin.auth.Auth | null = null;

try {
  // Initialize Firebase Admin
  // In a real production environment, you would use:
  // admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)) });
  
  // For this environment, we try to initialize with default credentials if available
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
    });
    db = admin.firestore();
    auth = admin.auth();
    console.log('Firebase Admin initialized successfully.');
  } else {
    console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY is missing. Backend writes will be simulated.');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

export { admin, db, auth };
