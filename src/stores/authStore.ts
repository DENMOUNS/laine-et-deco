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
    const user = get().user;
    if (user?.email === 'landrymoutongo97@gmail.com') return 'super-admin';
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
            // Try to read the profile by UID first. If not found, fallback to a
            // lookup by email — this handles legacy data where the document id
            // might not match the auth UID.
            void (async () => {
              try {
                const snap = await getDoc(doc(db, 'user', currentUser.uid));
                if (snap.exists()) {
                  const profile = { id: snap.id, ...snap.data() };
                  set({ currentUserDoc: profile });
                  void writeCache(userProfileCacheKey(currentUser.uid), profile);
                  return;
                }

                // If no doc by UID, try to find by email (may match an existing admin record)
                if (currentUser.email) {
                  const { collection, query, where, getDocs, limit } = await import('firebase/firestore');
                  let snaps = await getDocs(query(collection(db, 'user'), where('email', '==', currentUser.email), limit(1)));
                  if (snaps.empty) {
                    snaps = await getDocs(query(collection(db, 'user'), where('uid', '==', currentUser.uid), limit(1)));
                  }

                  if (!snaps.empty) {
                    const first = snaps.docs[0];
                    const profile = { id: first.id, ...first.data() };
                    set({ currentUserDoc: profile });
                    // Cache under the current UID key to speed up next loads.
                    void writeCache(userProfileCacheKey(currentUser.uid), profile as any);
                    return;
                  }
                }
              } catch (err) {
                // Don't block auth flow on cache/DB lookup errors.
                console.warn('Erreur lecture profil utilisateur:', err);
              }
            })();
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
