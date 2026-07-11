import './server/loadEnv.js';
import express from 'express';
import rateLimit from 'express-rate-limit';
import entityRoutes from '../server/routes/entityRoutes.js';
import dashboardRoutes from '../server/routes/dashboardRoutes.js';
import storageRoutes from '../server/routes/storageRoutes.js';

const app = express();

app.use(express.json({ limit: '10mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Trop de requêtes, veuillez réessayer plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/api/entity', entityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/storage', storageRoutes);

app.get('/api/test', (_req, res) => {
  res.json({ ok: true, message: 'API routing works' });
});

app.use((err: any, _req: any, res: any, next: any) => {
  console.error('Unhandled server error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: err?.message || 'Internal Server Error' });
});

export default app;