import { create } from 'zustand';
import type { User } from 'firebase/auth';
import { readCache, writeCache } from '../frontend/utils/cacheStorage';

const userProfileCacheKey = (uid: string) => `user-profile:${uid}:v1`;

interface AuthState {
  user: User | null;
  isAuthLoading: boolean;
  currentUserDoc: any | null;
  userRole: string;

  _setUser: (user: User | null) => void;
  _setAuthLoading: (loading: boolean) => void;
  _setCurrentUserDoc: (doc: any | null) => void;

  initAuthListener: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthLoading: true,
  currentUserDoc: null,

  get userRole() {
    return get().currentUserDoc?.role || 'customer';
  },

  _setUser: (user) => set({ user }),
  _setAuthLoading: (loading) => set({ isAuthLoading: loading }),
  _setCurrentUserDoc: (doc) => set({ currentUserDoc: doc }),

  initAuthListener: () => {
    let unsubscribe = () => {};
    let cancelled = false;

    void (async () => {
      const [{ onAuthStateChanged }, { doc, getDoc }, { initFirebase }] = await Promise.all([
        import('firebase/auth'),
        import('firebase/firestore'),
        import('../backend/firebase'),
      ]);

      if (cancelled) return;

      const { auth, db } = initFirebase();
      if (!auth) {
        set({ isAuthLoading: false });
        return;
      }

      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        set({ user: currentUser, isAuthLoading: false });

        if (currentUser?.uid) {
          // readCache is async (IndexedDB) — must be awaited
          readCache(userProfileCacheKey(currentUser.uid)).then((cached) => {
            if (cached) {
              set({ currentUserDoc: cached });
            }
          });

          if (db) {
            void getDoc(doc(db, 'user', currentUser.uid)).then((snap) => {
              if (!snap.exists()) return;
              const profile = { id: snap.id, ...snap.data() };
              set({ currentUserDoc: profile });
              void writeCache(userProfileCacheKey(currentUser.uid), profile);
            });
          }
        } else {
          set({ currentUserDoc: null });
        }
      });
    })();

    const timeout = setTimeout(() => {
      set({ isAuthLoading: false });
    }, 5000);

    return () => {
      cancelled = true;
      unsubscribe();
      clearTimeout(timeout);
    };
  },
}));
