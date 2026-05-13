import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, doc, getDocFromServer, enableIndexedDbPersistence } from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

const firebaseConfig = (config as any).default || config;

let app: any = null;
let db: any = null;
let auth: any = null;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

if (firebaseConfig && firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    
    const databaseId = firebaseConfig.firestoreDatabaseId && typeof firebaseConfig.firestoreDatabaseId === 'string' && firebaseConfig.firestoreDatabaseId.trim() !== '' 
      ? firebaseConfig.firestoreDatabaseId 
      : '(default)';
    
    db = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true
    }, databaseId);
    auth = getAuth(app);

    // Validate Connection to Firestore (MANDATORY)
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log("Firestore connected successfully.");
      } catch (error: any) {
        if (error.code === 'unavailable' || (error instanceof Error && error.message.includes('the client is offline'))) {
          console.warn("Please check your Firebase configuration. Firestore is operating in offline mode.");
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
