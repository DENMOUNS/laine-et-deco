import type { FirebaseApp, FirebaseOptions } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

type FirebaseConfigInput = { default?: FirebaseOptions } & FirebaseOptions;
const firebaseConfig = ((config as FirebaseConfigInput).default ?? config) as FirebaseOptions;

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

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
  const err = error as Error;
  const errInfo: FirestoreErrorInfo = {
    error: err?.message || String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) ?? []
    },
    operationType,
    path
  };
  
  void errInfo;
}

if (firebaseConfig && firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    
    const databaseId = firebaseConfig.firestoreDatabaseId && typeof firebaseConfig.firestoreDatabaseId === 'string' && firebaseConfig.firestoreDatabaseId.trim() !== '' 
      ? firebaseConfig.firestoreDatabaseId 
      : '(default)';
    
    db = initializeFirestore(app, {}, databaseId);
    auth = getAuth(app);

    // Validate Connection to Firestore (MANDATORY)
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error: any) {
        void error;
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
