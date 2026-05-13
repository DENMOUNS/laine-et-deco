import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  setDoc,
  serverTimestamp,
  QueryConstraint,
  where,
  limit
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../backend/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const PUBLIC_COLLECTIONS = [
  'product',
  'category',
  'pack',
  'blog_post',
  'promo_event',
  'lookbook_post',
  'lookbook',
  'flash_sale',
  'review',
  'site_config',
  'currency',
  'badge',
  'city',
  'community_post',
  'member_portfolio'
];

interface UseEntityOptions {
  enabled?: boolean;
  constraints?: QueryConstraint[];
  deps?: any[];
}

export function useEntity<T>(entityType: string, initialData: T[] = [], options: UseEntityOptions = {}) {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { enabled = true, constraints = [], deps = [] } = options;

  useEffect(() => {
    if (!db) {
      console.warn(`Firebase db is not initialized. Using initialData for ${entityType}.`);
      setData(initialData);
      setIsLoading(false);
      return;
    }

    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let unsubscribe: () => void = () => {};

    const startSnapshotListener = () => {
      // Basic query with optional constraints and a default limit of 200 for performance
      const finalConstraints = [...constraints];
      if (!finalConstraints.some(c => c.type === 'limit')) {
        finalConstraints.push(limit(200));
      }
      const q = query(collection(db, entityType), ...finalConstraints);
      
      unsubscribe = onSnapshot(q, (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as T);
        });
        
        setData(items.length > 0 ? items : initialData);
        setIsLoading(false);
        setError(null);
      }, (err) => {
        // If we get permission-denied but we were not logged in, just stay in loading or fallback silently
        if (err.code === 'permission-denied' && !auth.currentUser) {
          console.warn(`Permission denied for ${entityType} (unauthenticated). Waiting...`);
          setData(initialData);
          setIsLoading(true);
          return;
        }

        console.error(`Error fetching ${entityType} from Firebase:`, err);
        setData(initialData);
        setError(err as Error);
        setIsLoading(false);
        
        try {
          handleFirestoreError(err, OperationType.LIST, entityType);
        } catch (e) {
          // Error info already logged
        }
      });
    };

    // If it's a protected collection, wait for auth to be initialized
    if (!PUBLIC_COLLECTIONS.includes(entityType) && !auth.currentUser) {
      const authUnsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          authUnsubscribe(); // Stop listening for auth changes once we have a user
          startSnapshotListener();
        } else {
          // Still no user, if it's protected, we might want to stop loading or show empty
          setIsLoading(false);
        }
      });
      return () => {
        authUnsubscribe();
        unsubscribe();
      };
    } else {
      startSnapshotListener();
      return () => unsubscribe();
    }
  }, [entityType, enabled, auth.currentUser?.uid, ...deps]);

  const addEntity = async (newItem: any) => {
    if (!db) {
      console.warn(`Firebase db is not initialized. Cannot add ${entityType}.`);
      return `temp_${Date.now()}`;
    }
    if (!auth.currentUser) {
      window.dispatchEvent(new CustomEvent('auth-required'));
      return;
    }
    try {
      const docRef = await addDoc(collection(db, entityType), {
        ...newItem,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, entityType);
      throw err;
    }
  };

  const updateEntity = async (id: string, updates: any) => {
    if (!db) {
      console.warn(`Firebase db is not initialized. Cannot update ${entityType}.`);
      return;
    }
    if (!auth.currentUser) {
      window.dispatchEvent(new CustomEvent('auth-required'));
      return;
    }
    try {
      console.log(`Updating ${entityType}/${id} with updates:`, updates);
      const docRef = doc(db, entityType, String(id));
      await setDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${entityType}/${id}`);
      throw err;
    }
  };

  const setEntity = async (id: string, data: any) => {
    if (!db) {
      console.warn(`Firebase db is not initialized. Cannot set ${entityType}.`);
      return;
    }
    if (!auth.currentUser) {
      window.dispatchEvent(new CustomEvent('auth-required'));
      return;
    }
    try {
      const docRef = doc(db, entityType, String(id));
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${entityType}/${id}`);
      throw err;
    }
  };

  const deleteEntity = async (id: string) => {
    if (!db) {
      console.warn(`Firebase db is not initialized. Cannot delete ${entityType}.`);
      return;
    }
    if (!auth.currentUser) {
      window.dispatchEvent(new CustomEvent('auth-required'));
      return;
    }
    try {
      await deleteDoc(doc(db, entityType, String(id)));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${entityType}/${id}`);
      throw err;
    }
  };

  return { 
    data, 
    setData,
    isLoading, 
    error,
    addEntity,
    updateEntity,
    setEntity,
    deleteEntity
  };
}
