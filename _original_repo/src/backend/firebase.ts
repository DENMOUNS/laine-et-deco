import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, enableIndexedDbPersistence } from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

const firebaseConfig = (config as any).default || config;

let app: any = null;
let db: any = null;
let auth: any = null;

if (firebaseConfig && firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    
    const databaseId = firebaseConfig.firestoreDatabaseId && typeof firebaseConfig.firestoreDatabaseId === 'string' && firebaseConfig.firestoreDatabaseId.trim() !== '' 
      ? firebaseConfig.firestoreDatabaseId 
      : '(default)';
    
    db = getFirestore(app, databaseId);
    auth = getAuth(app);

    // Enable persistence (Disabled for troubleshooting)
    // enableIndexedDbPersistence(db).catch((err) => {
    //     if (err.code == 'failed-precondition') {
    //         console.warn("Multiple tabs open, persistence failed.");
    //     } else if (err.code == 'unimplemented') {
    //         console.warn("Browser does not support persistence.");
    //     }
    // });

    // Validate Connection to Firestore (Silent check)
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log("Firestore connected successfully.");
      } catch (error: any) {
        if (error.code === 'unavailable' || (error instanceof Error && error.message.includes('the client is offline'))) {
          console.warn("Firestore is operating in offline mode. It will sync automatically when possible.");
        } else {
          console.error("Firestore connectivity issue:", error);
        }
      }
    };
    testConnection();
    
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Firebase:", error);
  }
} else {
  console.error("Erreur de l'initialisation de la base de données: projectId est manquant dans la configuration Firebase.");
}

export { db, auth };
