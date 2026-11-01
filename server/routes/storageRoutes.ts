import { Router, Request, Response, NextFunction } from 'express';
import { db, auth } from '../firebaseAdmin.js';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { resolveUserRole, isStaff, UserRole } from '../utils/authRoles.js';

const router = Router();

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bearer = req.headers.authorization;
    if (!bearer?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentification requise pour téléverser des fichiers' });
    }

    const token = bearer.replace('Bearer ', '');
    const decoded = await auth.verifyIdToken(token);
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Session invalide ou expirée' });
  }
};

const resolveRole = async (req: Request, _res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) return next();
  user.role = await resolveUserRole(user.uid, user.email, user.role as string, user);
  next();
};

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const parseDataUrl = (dataUrl: string) => {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { contentType: match[1].toLowerCase(), base64: match[2] };
};

const sanitizeFolder = (folder?: string): string => {
  if (!folder || typeof folder !== 'string') return 'images';
  const clean = folder.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30);
  return clean || 'images';
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

const validateImageMagicBytes = (buffer: Buffer, mime: string): boolean => {
  if (!buffer || buffer.length < 4) return false;

  if (mime === 'image/jpeg' || mime === 'image/jpg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mime === 'image/png') {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }
  if (mime === 'image/gif') {
    return (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    );
  }
  if (mime === 'image/webp') {
    // RIFF .... WEBP
    if (buffer.length < 12) return false;
    const isRiff = buffer.subarray(0, 4).toString('ascii') === 'RIFF';
    const isWebp = buffer.subarray(8, 12).toString('ascii') === 'WEBP';
    return isRiff && isWebp;
  }
  if (mime === 'image/svg+xml') {
    const text = buffer.toString('utf8').trim();
    const hasSvgTag = text.includes('<svg') && text.includes('</svg>');
    // Reject SVG if it contains dangerous script / event handler injections
    const hasDangerousScripts =
      /<script[\s\S]*?>[\s\S]*?<\/script>/i.test(text) ||
      /on\w+\s*=/i.test(text) ||
      /javascript:/i.test(text) ||
      /xlink:href\s*=\s*["']javascript:/i.test(text);
    return hasSvgTag && !hasDangerousScripts;
  }

  return false;
};

const saveBase64ToFile = (dataUrl: string, folder = 'images'): string | null => {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return null;

  if (!ALLOWED_MIME_TYPES.has(parsed.contentType)) {
    console.warn(`[storageRoutes] Tentative d'upload rejetée: type MIME non autorisé (${parsed.contentType})`);
    return null;
  }

  const buffer = Buffer.from(parsed.base64, 'base64');
  if (buffer.length === 0 || buffer.length > MAX_FILE_SIZE_BYTES) {
    console.warn(`[storageRoutes] Tentative d'upload rejetée: taille invalide (${buffer.length} bytes)`);
    return null;
  }

  if (!validateImageMagicBytes(buffer, parsed.contentType)) {
    console.warn(`[storageRoutes] Tentative d'upload rejetée: signature binaire invalide pour ${parsed.contentType}`);
    return null;
  }

  const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = getExtensionFromMime(parsed.contentType);
  const safeFolder = sanitizeFolder(folder);
  const randomId = crypto.randomUUID().replace(/-/g, '');
  const filename = `${safeFolder}_${Date.now()}_${randomId}.${ext}`;
  const filePath = path.resolve(uploadsDir, filename);

  // Path traversal defense check
  if (!filePath.startsWith(uploadsDir)) {
    console.error(`[storageRoutes] Tentative de path traversal détectée: ${filename}`);
    return null;
  }

  fs.writeFileSync(filePath, buffer);
  return `/uploads/${filename}`;
};

// POST /api/storage/upload - Protégé par token
router.post('/upload', verifyToken, resolveRole, (req: Request, res: Response) => {
  try {
    const { image, images, folder } = req.body || {};

    if (image && typeof image === 'string') {
      if (!image.startsWith('data:image/')) {
        // Validation basique de l'URL déjà existante
        if (/^https?:\/\//i.test(image) || /^\/uploads\/[a-zA-Z0-9._-]+$/i.test(image)) {
          return res.json({ url: image, success: true });
        }
        return res.status(400).json({ error: 'URL ou format d\'image invalide' });
      }
      const savedUrl = saveBase64ToFile(image, folder);
      if (!savedUrl) {
        return res.status(400).json({ error: 'Fichier invalide ou format non supporté (JPEG, PNG, WEBP, GIF, SVG acceptés, max 10MB)' });
      }
      return res.json({ url: savedUrl, success: true });
    }

    if (Array.isArray(images) && images.length > 0) {
      if (images.length > 20) {
        return res.status(400).json({ error: 'Nombre maximal de 20 images par envoi dépassé' });
      }
      const urls: string[] = [];
      for (const img of images) {
        if (typeof img === 'string' && img.startsWith('data:image/')) {
          const saved = saveBase64ToFile(img, folder);
          if (saved) {
            urls.push(saved);
          }
        } else if (typeof img === 'string' && (/^https?:\/\//i.test(img) || /^\/uploads\//i.test(img))) {
          urls.push(img);
        }
      }
      return res.json({ urls, success: true });
    }

    return res.status(400).json({ error: 'Aucune image fournie' });
  } catch (err: any) {
    console.error('[storageRoutes] Erreur lors du téléversement:', err);
    return res.status(500).json({ error: 'Une erreur est survenue lors de l\'enregistrement de l\'image' });
  }
});

export default router;
