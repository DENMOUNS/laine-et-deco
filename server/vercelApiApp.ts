import './loadEnv.js';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import entityRoutes from './routes/entityRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import storageRoutes from './routes/storageRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';
import { logWriteRequests } from './utils/requestLogger.js';
import { ensureFirestoreConnection, initializationError, getDb, getAuth } from './firebaseAdmin.js';

const app = express();

const isAdminRole = (role: string | undefined | null) => {
  return ['super-admin', 'admin', 'editor', 'stock-manager', 'support-client'].includes(role ?? '');
};

const resolveUserRoleFromToken = async (token: string) => {
  try {
    const { auth } = await import('./firebaseAdmin.js');
    const decoded = await auth.verifyIdToken(token);
    const uid = decoded.uid;
    const email = decoded.email;
    let role: string | null = null;

    const firestoreDb = (await import('./firebaseAdmin.js')).getDb();
    if (!firestoreDb) {
      return null;
    }

    const userSnap = await firestoreDb.collection('user').doc(uid).get();
    if (userSnap.exists) {
      role = userSnap.data()?.role;
    }

    if (!role && email) {
      const emailQuery = await firestoreDb.collection('user').where('email', '==', email).limit(1).get();
      if (!emailQuery.empty) {
        role = emailQuery.docs[0].data()?.role;
      }
    }

    if (!role) {
      const uidQuery = await firestoreDb.collection('user').where('uid', '==', uid).limit(1).get();
      if (!uidQuery.empty) {
        role = uidQuery.docs[0].data()?.role;
      }
    }

    return role;
  } catch (error: any) {
    console.error('[vercelApiApp] resolveUserRoleFromToken catch', {
      tokenPrefix: token?.slice(0, 8),
      errorName: error?.name,
      errorMessage: error?.message,
      errorStack: error?.stack,
    });
    return null;
  }
};

const attachAuthRole = async (req: any, _res: any, next: any) => {
  if (req.method === 'GET') {
    return next();
  }

  const bearer = req.headers.authorization;
  if (bearer?.startsWith('Bearer ')) {
    const token = bearer.replace('Bearer ', '');
    req.authRole = await resolveUserRoleFromToken(token);
  }
  next();
};

app.use(express.json({ limit: '10mb' }));
app.use(logWriteRequests);

// Middleware de garantie d'initialisation Firebase pour Vercel Serverless
app.use(async (_req: any, _res: any, next: any) => {
  if (getDb() && getAuth()) return next();
  try {
    await ensureFirestoreConnection(2, 200);
  } catch (e) {
    console.error('[vercelApiApp] Firebase auto-connect attempt failed:', e);
  }
  next();
});

app.use('/api/', attachAuthRole);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000,
  message: { error: 'Trop de requetes, veuillez reessayer plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.method === 'GET' || isAdminRole((req as any).authRole);
  },
});

app.use(apiLimiter);
app.use('/api/entity', entityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/entity', entityRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/storage', storageRoutes);
app.use('/checkout', checkoutRoutes);

const gemini = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
const geminiModels = (process.env.GEMINI_MODELS || 'gemini-3.6-flash,gemini-3.5-flash,gemini-3.1-flash,gemini-3.0-flash')
  .split(',').map((model) => model.trim()).filter(Boolean);
const isQuotaError = (error: any) => {
  const message = String(error?.message || error || '').toLowerCase();
  return error?.status === 429 || error?.code === 429 || message.includes('resource_exhausted') || message.includes('quota') || message.includes('rate limit') || message.includes('too many requests') || message.includes('model not found') || message.includes('not_found') || message.includes('unsupported model');
};
const chatSchema = z.object({
  message: z.string().min(1).max(5000),
  systemInstruction: z.string().max(15000).optional(),
  responseSchema: z.any().optional(),
  imagePart: z.object({ mimeType: z.string().max(100), data: z.string().max(12000000) }).optional(),
});

app.post('/api/chat', async (req, res) => {
  try {
    if (!gemini) return res.status(500).json({ error: 'Gemini API key is missing on the server.' });
    const parsed = chatSchema.parse(req.body);
    const contents = parsed.imagePart
      ? [{ text: DOMPurify.sanitize(parsed.message) }, { inlineData: parsed.imagePart }]
      : DOMPurify.sanitize(parsed.message);
    let lastError: any;
    for (const model of geminiModels) {
      try {
        const response = await gemini.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: parsed.systemInstruction ? DOMPurify.sanitize(parsed.systemInstruction) : 'Tu es un assistant IA.',
            responseMimeType: parsed.responseSchema ? 'application/json' : 'text/plain',
            responseSchema: parsed.responseSchema || undefined,
          },
        });
        return res.json({ text: response.text, model });
      } catch (error) {
        lastError = error;
        if (!isQuotaError(error)) throw error;
      }
    }
    throw lastError || new Error('Tous les modèles Gemini configurés ont atteint leur quota.');
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input data', details: error.issues });
    return res.status(500).json({ error: error?.message || 'Erreur Gemini' });
  }
});

app.get('/api/test', (_req, res) => {
  res.json({ ok: true, message: 'API routing works' });
});

app.get('/test', (_req, res) => {
  res.json({ ok: true, message: 'API routing works' });
});

// Handler de debug : affiche les routes disponibles (utile en prod pour vérifier le routing)
app.get('/api/debug/routes', (_req, res) => {
  res.json({
    ok: true,
    env: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
    routes: [
      'POST /api/entity/:entity',
      'PUT /api/entity/:entity/:id',
      'PATCH /api/entity/:entity/:id',
      'DELETE /api/entity/:entity/:id',
      'GET /api/entity/:entity',
      'GET /api/entity/:entity/:id',
      'PUT /api/dashboard/order/status',
      'POST /api/dashboard/stock/transaction',
      'PUT /api/dashboard/config/:collectionName/:id',
      'POST /api/dashboard/invoice/generate',
      'POST /api/checkout',
    ],
  });
});

// Endpoint to check Firebase status without guessing
app.get('/api/debug/firebase-status', async (_req, res) => {
  const ok = await ensureFirestoreConnection(2, 200).catch(() => false);
  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim() || '';
  res.json({
    ok,
    env: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
    serviceAccountPresent: Boolean(rawKey),
    serviceAccountLength: rawKey.length,
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || null,
    dbReady: Boolean(getDb()),
    authReady: Boolean(getAuth()),
    initError: initializationError ? initializationError.message : null,
    timestamp: new Date().toISOString(),
  });
});

// Log unhandled rejections and uncaught exceptions for improved observability
process.on('unhandledRejection', (reason) => {
  try {
    process.stderr.write(JSON.stringify({ tag: '[unhandledRejection]', reason: String(reason) }) + '\n');
  } catch (e) {}
});

process.on('uncaughtException', (err) => {
  try {
    process.stderr.write(JSON.stringify({ tag: '[uncaughtException]', message: err?.message, stack: err?.stack }) + '\n');
    // In serverless env, best effort logging; do not exit
  } catch (e) {}
});

const serializeError = (error: any) => {
  if (!error) {
    return { error: 'Internal Server Error' };
  }

  if (typeof error === 'string') {
    return { error };
  }

  const payload: any = {
    error: error.message || String(error),
    name: error.name || undefined,
    code: error.code || undefined,
    details: error.details || undefined,
    stack: error.stack || undefined,
  };

  if (typeof error === 'object') {
    for (const key of Object.keys(error)) {
      if (['message', 'name', 'code', 'details', 'stack', 'response', 'request'].includes(key)) continue;
      payload[key] = (error as any)[key];
    }

    if (error.response && typeof error.response === 'object') {
      payload.response = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      };
    }

    if (error.request && typeof error.request === 'object') {
      payload.request = {
        method: error.request.method,
        path: error.request.path || error.request._currentUrl,
        headers: error.request._header || error.request.headers,
      };
    }
  }

  return payload;
};

// Handler d'erreur global — utilise process.stderr.write pour ne PAS être supprimé par esbuild drop:console
app.use((err: any, req: any, res: any, next: any) => {
  process.stderr.write(
    JSON.stringify({
      tag: '[server:unhandled-error]',
      method: req.method,
      path: req.originalUrl || req.url,
      errorName: err?.name,
      errorMessage: err?.message,
      errorCode: err?.code,
      errorStack: err?.stack,
      requestId: req.requestId || null,
      uid: req.user?.uid ? `${req.user.uid.slice(0, 6)}...` : null,
      bodyKeys: req.body && typeof req.body === 'object' ? Object.keys(req.body) : [],
    }) + '\n'
  );
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json(serializeError(err));
});

export default app;
