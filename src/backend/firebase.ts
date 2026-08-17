import type { FirebaseApp, FirebaseOptions } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { initializeFirestore, memoryLocalCache } from 'firebase/firestore';
import config from '../../firebase-applet-config.json' with { type: 'json' };

type FirebaseOptionsWithFirestoreDb = FirebaseOptions & { firestoreDatabaseId?: string };
type FirebaseConfigInput = { default?: FirebaseOptionsWithFirestoreDb } & FirebaseOptionsWithFirestoreDb;
const firebaseConfig = ((config as FirebaseConfigInput).default ?? config) as FirebaseOptionsWithFirestoreDb;

let app: FirebaseApp | null = null;
let initialized = false;

function normalizeDatabaseId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === '(default)') return null;
  return trimmed;
}

export let db!: Firestore;
export let auth!: Auth;

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

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function ensureFirebaseInitialized() {
  if (initialized) return;
  initialized = true;

  if (!firebaseConfig?.projectId) {
    return;
  }

  try {
    app = initializeApp(firebaseConfig);

    const envDatabaseId = normalizeDatabaseId(import.meta.env.VITE_FIRESTORE_DATABASE_ID);
    const databaseId =
      envDatabaseId ||
      normalizeDatabaseId(firebaseConfig.firestoreDatabaseId) ||
      '(default)';

    // Direct long polling for fast and reliable connections in container / iframe environments
    db = initializeFirestore(
      app,
      {
        localCache: memoryLocalCache(),
        experimentalForceLongPolling: true,
      },
      databaseId
    );

    auth = getAuth(app);
    void setPersistence(auth, browserSessionPersistence).catch((error) => {
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
