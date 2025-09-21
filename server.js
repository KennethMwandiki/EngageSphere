const express = require("express");
const axios = require("axios");
const path = require("path");
const cors = require("cors");
const app = express();
require("dotenv").config();

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
  if (missingKeys.length > 0) {
    console.warn('\n[WARNING] Missing environment variables for AI providers:');
    missingKeys.forEach(k => console.warn(` - ${k}`));
    console.warn('\nAdd them to your local .env (copy .env.example) or set them in your deployment/CI secrets.');
  } else {
    console.log('All AI provider keys present.');
  }
});
