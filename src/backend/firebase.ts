import type { FirebaseApp, FirebaseOptions } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { initializeFirestore, memoryLocalCache } from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

type FirebaseOptionsWithFirestoreDb = FirebaseOptions & { firestoreDatabaseId?: string };
type FirebaseConfigInput = { default?: FirebaseOptionsWithFirestoreDb } & FirebaseOptionsWithFirestoreDb;
const firebaseConfig = ((config as FirebaseConfigInput).default ?? config) as FirebaseOptionsWithFirestoreDb;

let app: FirebaseApp | null = null;
let initialized = false;

export let db: Firestore | null = null;
export let auth: Auth | null = null;

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
  };
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
      providerInfo:
        auth?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) ?? [],
    },
    operationType,
    path,
  };

  void errInfo;
}

function ensureFirebaseInitialized() {
  if (initialized) return;
  initialized = true;

  if (!firebaseConfig?.projectId) {
    console.error("Erreur de l'initialisation de la base de données: projectId est manquant dans la configuration Firebase.");
    return;
  }

  try {
    app = initializeApp(firebaseConfig);

    const databaseId =
      firebaseConfig.firestoreDatabaseId &&
      typeof firebaseConfig.firestoreDatabaseId === 'string' &&
      firebaseConfig.firestoreDatabaseId.trim() !== ''
        ? firebaseConfig.firestoreDatabaseId
        : '(default)';

    // Cache mémoire uniquement : pas d'IndexedDB Firestore (meilleur LCP / Lighthouse).
    db = initializeFirestore(app, { localCache: memoryLocalCache() }, databaseId);

    auth = getAuth(app);
    void setPersistence(auth, browserSessionPersistence).catch((error) => {
      console.warn('Impossible de définir la persistance Firebase Auth :', error);
    });
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Firebase:", error);
  }
}

/** Initialise Firebase à la demande (évite le coût au premier paint). */
export function initFirebase() {
  ensureFirebaseInitialized();
  return { app, db, auth };
}
