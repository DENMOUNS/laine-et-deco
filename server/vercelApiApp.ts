import './loadEnv.js';
import express from 'express';
import rateLimit from 'express-rate-limit';
import entityRoutes from './routes/entityRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import storageRoutes from './routes/storageRoutes.js';
import { logWriteRequests } from './utils/requestLogger.js';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(logWriteRequests);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Trop de requetes, veuillez reessayer plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
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
  res.status(500).json({ error: err?.message || 'Internal Server Error' });
});

export default app;
