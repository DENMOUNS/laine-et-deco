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
import entityRoutes from './server/routes/entityRoutes';
import dashboardRoutes from './server/routes/dashboardRoutes';
import storageRoutes from './server/routes/storageRoutes';

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
    max: 100, // Limit each IP to 100 requests per window
    message: { error: "Trop de requêtes, veuillez réessayer plus tard." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      return isAdminRole(req.authRole);
    },
  });


  /** Vite middleware (dev) sauf si NODE_ENV=production (npm run start après build). */
  const useViteDevServer =
    process.env.SERVE_WITH_VITE === 'true' || process.env.NODE_ENV !== 'production';

  app.use(express.json({ limit: '10mb' }));
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

  // Simple request logger to aid debugging (dev only)
  app.use((req, _res, next) => {
    next();
  });

 

  // Test route to verify API routing works
  app.get('/api/test', (_req, res) => {
    return res.json({ ok: true, message: 'API routing works' });
  });

  // --- API Routes ---
  app.use('/api/entity', entityRoutes);
  app.use('/api/dashboard', dashboardRoutes);

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

  // Input Validation Schemas
  const chatSchema = z.object({
    message: z.string().min(1, "Message is required").max(5000, "Message is too long"),
    systemInstruction: z.string().max(2000, "Instruction is too long").optional(),
    responseSchema: z.any().optional(),
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

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: safeMessage,
        config: {
          systemInstruction: safeSystemInstruction,
          responseMimeType: parsedData.responseSchema ? "application/json" : "text/plain",
          responseSchema: parsedData.responseSchema || undefined,
        }
      });
      res.json({ text: response.text });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input data", details: error.issues });
      }
      res.status(500).json({ error: error.message });
    }
  });

  const analyzeImageSchema = z.object({
    prompt: z.string().max(1000),
    imagePart: z.any(), // Keeping it flexible but validated for max payload length indirectly by express.json limit, could be stricter
  });

  app.post("/api/analyze-image", async (req, res) => {
    try {
      if (!ai) return res.status(500).json({ error: "Gemini API key is missing on the server." });

      const parsedData = analyzeImageSchema.parse(req.body);
      const safePrompt = DOMPurify.sanitize(parsedData.prompt);

      const response = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
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
      const db = (await import('./server/firebaseAdmin.js')).db;
      const snap = await db.collection('qr_config').doc('global').get();
      if (snap.exists) {
        const docs = await db.collection('qr_config').limit(5).get();
        const invDocs = await db.collection('invoice_config').limit(5).get();
      }
    } catch (e) {
    }
  });
}

startServer();
