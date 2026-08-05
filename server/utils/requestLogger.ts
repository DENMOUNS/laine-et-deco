import type { Request, Response, NextFunction } from 'express';

// Toutes les méthodes à surveiller (inclut DELETE pour les suppressions)
const LOGGED_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const SENSITIVE_KEYS = new Set([
  'authorization',
  'password',
  'token',
  'idToken',
  'apiKey',
  'privateKey',
  'private_key',
  'FIREBASE_SERVICE_ACCOUNT_KEY',
]);

const shortUid = (uid?: string) => (uid ? `${uid.slice(0, 6)}...${uid.slice(-4)}` : null);

const summarizeBody = (body: unknown) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { bodyType: typeof body, bodyKeys: [] };
  }

  const data = body as Record<string, unknown>;
  return {
    bodyKeys: Object.keys(data),
    bodyPreview: Object.fromEntries(
      Object.entries(data).slice(0, 12).map(([key, value]) => {
        if (SENSITIVE_KEYS.has(key)) return [key, '[redacted]'];
        if (typeof value === 'string') {
          return [key, value.length > 200 ? `${value.slice(0, 200)}...` : value];
        }
        if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
          return [key, value];
        }
        if (Array.isArray(value)) return [key, `[array:${value.length}]`];
        return [key, '[object]'];
      })
    ),
  };
};

/**
 * Middleware de logging pour toutes les requêtes POST, PUT, PATCH, DELETE.
 * En cas d'erreur (status >= 400), capture aussi le corps de la réponse
 * pour faciliter le debug en production (Vercel logs).
 */
export function logWriteRequests(req: Request, res: Response, next: NextFunction) {
  if (!LOGGED_METHODS.has(req.method)) {
    return next();
  }

  const startedAt = Date.now();
  const requestId =
    String(req.headers['x-vercel-id'] || '') ||
    `${startedAt.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  (req as any).requestId = (req as any).requestId || requestId;

  // --- Log de début de requête ---
  process.stdout.write(
    JSON.stringify({
      tag: '[write-api:start]',
      requestId: (req as any).requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      hasAuth: Boolean(req.headers.authorization),
      authHeader: req.headers.authorization ? req.headers.authorization.slice(0, 20) + '...' : null,
      contentLength: req.headers['content-length'] || '0',
      contentType: req.headers['content-type'] || null,
      vercelEnv: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
      ...summarizeBody(req.body),
    }) + '\n'
  );

  // --- Intercepter res.json() pour capturer le corps de la réponse d'erreur ---
  const originalJson = res.json.bind(res);
  let capturedResponseBody: unknown = undefined;

  res.json = function (body: unknown) {
    capturedResponseBody = body;
    return originalJson(body);
  };

  // --- Log de fin de requête ---
  res.on('finish', () => {
    const user = (req as any).user;
    const statusCode = res.statusCode;
    const isError = statusCode >= 400;
    const durationMs = Date.now() - startedAt;

    const logEntry: Record<string, unknown> = {
      tag: '[write-api:finish]',
      requestId: (req as any).requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode,
      durationMs,
      uid: shortUid(user?.uid),
      email: user?.email || null,
      role: user?.role || null,
    };

    // En cas d'erreur, inclure le corps complet de la réponse
    if (isError && capturedResponseBody !== undefined) {
      logEntry.responseError = capturedResponseBody;
      logEntry.requestBodyKeys = req.body && typeof req.body === 'object' ? Object.keys(req.body) : [];
    }

    if (isError) {
      process.stderr.write(JSON.stringify(logEntry) + '\n');
    } else {
      process.stdout.write(JSON.stringify(logEntry) + '\n');
    }
  });

  next();
}
