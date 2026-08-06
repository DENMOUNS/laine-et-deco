import './loadEnv.js';
import express from 'express';
import rateLimit from 'express-rate-limit';
import entityRoutes from './routes/entityRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import storageRoutes from './routes/storageRoutes.js';
import { logWriteRequests } from './utils/requestLogger.js';

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

    const db = (await import('./firebaseAdmin.js')).db;
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

    return role;
  } catch {
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
app.use('/entity', entityRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/storage', storageRoutes);

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
    ],
  });
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
