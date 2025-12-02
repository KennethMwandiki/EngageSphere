const express = require("express");
const axios = require("axios");
const path = require("path");
const cors = require("cors");
const app = express();
require("dotenv").config();

// Global default AI provider (can be overridden by env or per-request)
const DEFAULT_AI_PROVIDER = (process.env.DEFAULT_AI_PROVIDER || 'gpt5mini').toLowerCase();

// Enable CORS for deployment (adjust origin as needed)
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Auth endpoints and middleware
const { router: authRouter, authenticateJWT } = require("./api/auth");
app.use("/api", authRouter);

// Mount Agora integration API (real integration)
app.use("/api", require("./api/agora"));

// Mount multi-platform streaming API
app.use("/api", require("./api/stream"));

// Mount AI/ML API (Azure OpenAI and Vertex AI) - protected
app.use("/api", authenticateJWT, require("./api/ai"));

// Mount behavioral analysis API - protected
app.use("/api", authenticateJWT, require("./api/behavioral"));

// Mount batch sentiment analysis API - protected
app.use("/api", require("./api/sentiment-batch"));


// Mount external live interaction API
app.use("/api", require("./api/live"));

// Mount admin API (admin-only health/status)
app.use("/api", authenticateJWT, require("./api/admin"));

// Serve static frontend (for deployment, serve root and frontend)
app.use(express.static(path.join(__dirname, "frontend")));
app.use(express.static(__dirname));

// Fallback to index.html for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Agora live integration is ready for deployment.");

  // Startup environment checks for AI provider keys
  const missingKeys = [];
  if (!process.env.VERTEX_AI_KEY) missingKeys.push('VERTEX_AI_KEY');
  if (!process.env.AZURE_OPENAI_KEY) missingKeys.push('AZURE_OPENAI_KEY');
  if (!process.env.GPT5_MINI_KEY) missingKeys.push('GPT5_MINI_KEY');

  // Check for critically missing keys: JWT_SECRET and the default provider key
  const criticalMissing = [];
  if (!process.env.JWT_SECRET) criticalMissing.push('JWT_SECRET');
  if (DEFAULT_AI_PROVIDER === 'gpt5mini' && !process.env.GPT5_MINI_KEY) criticalMissing.push('GPT5_MINI_KEY');
  if (DEFAULT_AI_PROVIDER === 'azure' && !process.env.AZURE_OPENAI_KEY) criticalMissing.push('AZURE_OPENAI_KEY');
  if (DEFAULT_AI_PROVIDER === 'vertex' && !process.env.VERTEX_AI_KEY) criticalMissing.push('VERTEX_AI_KEY');

  if (missingKeys.length > 0) {
    console.warn('\n[WARNING] Missing environment variables for AI providers:');
    missingKeys.forEach(k => console.warn(` - ${k}`));
    console.warn('\nAdd them to your local .env (copy .env.example) or set them in your deployment/CI secrets.');
  } else {
    console.log('All AI provider keys present.');
  }

  if (criticalMissing.length > 0) {
    console.warn('\n[CRITICAL] Missing required runtime secrets:');
    criticalMissing.forEach(k => console.warn(` - ${k}`));
    if (process.env.NODE_ENV === 'production') {
      console.error('\nMissing critical secrets in production - exiting to avoid running without required secrets.');
      process.exit(1);
    } else {
      console.warn('\nRunning in non-production mode; set these secrets before deploying to production.');
    }
  }
});
