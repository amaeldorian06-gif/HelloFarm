import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes (Backend MVP) ---

  // Auth Placeholder
  app.post("/api/auth/register", (req, res) => {
    res.json({ id: "user-123", status: "registered" });
  });

  // Farms Placeholder
  app.get("/api/farms", (req, res) => {
    res.json([]);
  });

  // Marketplace Placeholder
  app.get("/api/marketplace", (req, res) => {
    res.json([]);
  });

  // AI Prediction Placeholder
  app.post("/api/ai/predict-price", (req, res) => {
    const { crop_type } = req.body;
    res.json({
      predicted_price: 13500,
      confidence_score: 0.85,
      recommendation: `Vendez votre ${crop_type} maintenant pour maximiser vos profits.`
    });
  });

  // Payments MoMo
  app.post("/api/payments/momo", (req, res) => {
    const { amount, provider } = req.body;
    res.json({
      transaction_id: `MOMO-${Math.random().toString(36).substring(7).toUpperCase()}`,
      status: "pending",
      message: `Paiement ${provider.toUpperCase()} initié pour ${amount} FCFA. Veuillez valider sur votre téléphone.`
    });
  });

  // --- Vite Middleware ---
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
