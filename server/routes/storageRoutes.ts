import { Router, Request, Response, NextFunction } from 'express';
import { db, firebaseAdmin, auth } from '../firebaseAdmin.js';
import fs from 'node:fs';
import path from 'node:path';

function loadFirebaseConfig() {
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) {
    console.warn('[storageRoutes] Failed to read firebase-applet-config.json:', e);
  }
  return {};
}

const config = loadFirebaseConfig();

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
  if (!db) return null;

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

import crypto from 'node:crypto';

const sanitizeFolder = (folder?: string) => {
  if (!folder) return 'images';
  return folder.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30) || 'images';
};

const getExtensionFromMime = (mime: string): string => {
  switch (mime.toLowerCase()) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    case 'image/svg+xml':
      return 'svg';
    default:
      return 'webp';
  }
};

const saveBase64ToFile = (dataUrl: string, folder = 'images'): string | null => {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return null;

  const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = getExtensionFromMime(parsed.contentType);
  const safeFolder = sanitizeFolder(folder);
  const filename = `${safeFolder}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${ext}`;
  const filePath = path.join(uploadsDir, filename);

  const buffer = Buffer.from(parsed.base64, 'base64');
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${filename}`;
};

// POST /api/storage/upload
router.post('/upload', (req: Request, res: Response) => {
  try {
    const { image, images, folder } = req.body;

    if (image && typeof image === 'string') {
      if (!image.startsWith('data:image/')) {
        // Already a URL
        return res.json({ url: image, success: true });
      }
      const savedUrl = saveBase64ToFile(image, folder);
      if (!savedUrl) {
        return res.status(400).json({ error: 'Invalid image format' });
      }
      return res.json({ url: savedUrl, success: true });
    }

    if (Array.isArray(images)) {
      const urls = images.map((img: string) => {
        if (typeof img === 'string' && img.startsWith('data:image/')) {
          return saveBase64ToFile(img, folder) || img;
        }
        return img;
      });
      return res.json({ urls, success: true });
    }

    return res.status(400).json({ error: 'No image provided' });
  } catch (err: any) {
    console.error('[storageRoutes] Upload error:', err);
    return res.status(500).json({ error: err.message || 'Failed to save image' });
  }
});

export default router;
