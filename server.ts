import './server/loadEnv.js';
import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import fs from "node:fs";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";
import { auth, db } from './server/firebaseAdmin.js';
import entityRoutes from './server/routes/entityRoutes.js';
import dashboardRoutes from './server/routes/dashboardRoutes.js';
import storageRoutes from './server/routes/storageRoutes.js';
import checkoutRoutes from './server/routes/checkoutRoutes.js';
import { logWriteRequests } from './server/utils/requestLogger.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  const isAdminRole = (role: string | undefined | null) => {
    return ['super-admin', 'admin', 'editor', 'stock-manager', 'support-client'].includes(role ?? '');
  };

  const resolveUserRoleFromToken = async (token: string) => {
    try {
      const decoded = await auth.verifyIdToken(token);
      const uid = decoded.uid;
      const email = decoded.email;
      let role: string | null = null;
      const firestoreDb = db;
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
    } catch {
      return null;
    }
  };

  const attachAuthRole = async (req: any, _res: any, next: any) => {
    // Les requêtes GET d'entités ne nécessitent pas la résolution synchrone de rôle d'admin
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

   // --- Security: Rate Limiting (DDoS & Brute Force protection) ---
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3000, // Limit each IP to 3000 requests per window
    message: { error: "Trop de requêtes, veuillez réessayer plus tard." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      return req.method === 'GET' || isAdminRole((req as any).authRole);
    },
  });


  /** Vite middleware (dev) sauf si NODE_ENV=production (npm run start après build). */
  const useViteDevServer =
    process.env.SERVE_WITH_VITE === 'true' || process.env.NODE_ENV !== 'production';

  app.use(express.json({ limit: '10mb' }));
  app.use(logWriteRequests);

  // Auto-connect Firebase middleware
  app.use(async (_req: any, _res: any, next: any) => {
    if (db && auth) return next();
    try {
      const { ensureFirestoreConnection } = await import('./server/firebaseAdmin.js');
      await ensureFirestoreConnection(2, 200);
    } catch (e) {
      console.error('[server] Firebase auto-connect failed:', e);
    }
    next();
  });

  app.use('/api/', attachAuthRole);
  app.use("/api/", apiLimiter);
  const invoiceDir = path.join(process.cwd(), 'public', 'invoices');
  if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir, { recursive: true });
  }
  app.use('/invoices', express.static(invoiceDir, { maxAge: '1h' }));
  app.use('/api/entity', entityRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/storage', storageRoutes);
  app.use('/api/checkout', checkoutRoutes);
  app.use('/checkout', checkoutRoutes);

  // Test route to verify API routing works
  app.get('/api/test', (_req, res) => {
    return res.json({ ok: true, message: 'API routing works' });
  });

  app.use((err: any, _req: any, res: any, next: any) => {
    console.error('Unhandled server error:', err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  });

  // Initialize AI safely on backend
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  const geminiModels = (process.env.GEMINI_MODELS || [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.1-flash',
    'gemini-3.0-flash',
  ].join(',')).split(',').map((model) => model.trim()).filter(Boolean);

  const isQuotaError = (error: any) => {
    const message = String(error?.message || error || '').toLowerCase();
    return error?.status === 429 || error?.code === 429 || message.includes('resource_exhausted') || message.includes('quota') || message.includes('rate limit') || message.includes('too many requests') || message.includes('model not found') || message.includes('not_found') || message.includes('unsupported model');
  };

  const generateWithModelFallback = async (contents: any, config: any) => {
    if (!ai) throw new Error('Gemini API key is missing on the server.');
    let lastError: any;
    for (const model of geminiModels) {
      try {
        const response = await ai.models.generateContent({ model, contents, config });
        return { response, model };
      } catch (error) {
        lastError = error;
        if (!isQuotaError(error)) throw error;
        console.warn(`[gemini] quota épuisé pour ${model}, passage au modèle suivant`);
      }
    }
    throw lastError || new Error('Tous les modèles Gemini configurés ont atteint leur quota.');
  };

  // Input Validation Schemas
  const chatSchema = z.object({
    message: z.string().min(1, "Message is required").max(5000, "Message is too long"),
    systemInstruction: z.string().max(15000, "Instruction is too long").optional(),
    responseSchema: z.any().optional(),
    imagePart: z.object({ mimeType: z.string().max(100), data: z.string().max(12000000) }).optional(),
  });

  app.post("/api/chat", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ error: "Gemini API key is missing on the server." });
      }

      // Input validation using Zod
      const parsedData = chatSchema.parse(req.body);

      // Strict sanitization with DOMPurify
      const safeMessage = DOMPurify.sanitize(parsedData.message);
      const safeSystemInstruction = parsedData.systemInstruction 
        ? DOMPurify.sanitize(parsedData.systemInstruction) 
        : "Tu es un assistant IA.";

      const contents = parsedData.imagePart
        ? [{ text: safeMessage }, { inlineData: { mimeType: parsedData.imagePart.mimeType, data: parsedData.imagePart.data } }]
        : safeMessage;
      const { response, model } = await generateWithModelFallback(contents, {
        systemInstruction: safeSystemInstruction,
        responseMimeType: parsedData.responseSchema ? "application/json" : "text/plain",
        responseSchema: parsedData.responseSchema || undefined,
      });
      res.json({ text: response.text, model });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input data", details: error.issues });
      }
      res.status(500).json({ error: error.message });
    }
  });

  const analyzeImageSchema = z.object({
    prompt: z.string().max(1000),
    imagePart: z.any(), 
  });

  app.post("/api/analyze-image", async (req, res) => {
    try {
      if (!ai) return res.status(500).json({ error: "Gemini API key is missing on the server." });

      const parsedData = analyzeImageSchema.parse(req.body);
      const safePrompt = DOMPurify.sanitize(parsedData.prompt);

      const response = await ai.models.generateContent({
         model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
         contents: [safePrompt, parsedData.imagePart]
      });
      res.json({ text: response.text });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input data", details: error.issues });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // --- Vite Middleware (Development) or Static Serve (Production) ---
  if (useViteDevServer) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const indexHtml = path.join(distPath, 'index.html');
    if (!fs.existsSync(indexHtml)) {
      process.exit(1);
    }
    app.use(
      express.static(distPath, {
        maxAge: '1y',
        immutable: true,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      })
    );
    app.get(/(.*)/, (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", async () => {
    const mode = useViteDevServer ? "développement (Vite)" : "production (fichiers dist/)";
    try {
      const admin = (await import('./server/firebaseAdmin.js')).firebaseAdmin;
      const firestoreDb = (await import('./server/firebaseAdmin.js')).db;
      if (!firestoreDb) return;
      const snap = await firestoreDb.collection('qr_config').doc('global').get();
      if (snap.exists) {
        await firestoreDb.collection('qr_config').limit(5).get();
        await firestoreDb.collection('invoice_config').limit(5).get();
      }
    } catch (e) {
    }
  });
}

startServer();
