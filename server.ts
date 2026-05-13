import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Security: Rate Limiting (DDoS & Brute Force protection) ---
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { error: "Trop de requêtes, veuillez réessayer plus tard." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/api/", apiLimiter);

  // --- API Routes ---
  
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
        console.error("Validation error:", error.issues);
        return res.status(400).json({ error: "Invalid input data", details: error.issues });
      }
      console.error("Error calling Gemini API:", error);
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
      console.error("Error analyzing image:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Vite Middleware (Development) or Static Serve (Production) ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
