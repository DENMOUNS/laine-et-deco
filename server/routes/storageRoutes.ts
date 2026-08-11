import { Router, Request, Response, NextFunction } from 'express';
import { getDb, firebaseAdmin, getAuth } from '../firebaseAdmin.js';
import config from '../../firebase-applet-config.json' with { type: 'json' };

const db = new Proxy({} as any, {
  get(target, prop) {
    const currentDb = getDb();
    if (!currentDb) throw new Error("Firestore database is not initialized");
    const val = (currentDb as any)[prop];
    if (typeof val === 'function') {
      return val.bind(currentDb);
    }
    return val;
  }
});

const auth = new Proxy({} as any, {
  get(target, prop) {
    const currentAuth = getAuth();
    if (!currentAuth) throw new Error("Firebase auth is not initialized");
    const val = (currentAuth as any)[prop];
    if (typeof val === 'function') {
      return val.bind(currentAuth);
    }
    return val;
  }
});

const router = Router();

type UserRole =
  | 'super-admin'
  | 'admin'
  | 'editor'
  | 'stock-manager'
  | 'support-client'
  | 'customer';

const validRoles: UserRole[] = ['super-admin', 'admin', 'editor', 'stock-manager', 'support-client', 'customer'];

async function getUserRole(uid: string, email?: string, existingRole?: string): Promise<UserRole | null> {
  if (email === 'landrymoutongo97@gmail.com') {
    return 'super-admin';
  }

  if (!getDb()) return null;

  let role: string | undefined | null = null;
  const userSnap = await db.collection('user').doc(uid).get();
  if (userSnap.exists) {
    role = userSnap.data()?.role;
  }

  if (!role && email) {
    const emailQuery = await db.collection('user').where('email', '==', email).limit(1).get();
    if (!emailQuery.empty) {
      role = emailQuery.docs[0].data()?.role;
    }
  }

  if (!role) {
    const uidQuery = await db.collection('user').where('uid', '==', uid).limit(1).get();
    if (!uidQuery.empty) {
      role = uidQuery.docs[0].data()?.role;
    }
  }

  if (role && validRoles.includes(role as UserRole)) {
    return role as UserRole;
  }

  return null;
}

const isAdminLevel = (role: UserRole | null) => role === 'super-admin' || role === 'admin';

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bearer = req.headers.authorization;
    if (!bearer?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = bearer.replace('Bearer ', '');
    const decoded = await auth.verifyIdToken(token);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const resolveRole = async (req: Request, _res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) {
    return next();
  }
  user.role = await getUserRole(user.uid, user.email, user.role as string);
  next();
};

const parseDataUrl = (dataUrl: string) => {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { contentType: match[1], base64: match[2] };
};

// Debug endpoint disabled - Storage no longer used

// Storage routes disabled - using Firestore with 1 MB limit instead
// File upload and image storage via Firebase Storage has been removed
// Images are now stored directly as base64 in Firestore documents (max 1 MB per document)

export default router;
