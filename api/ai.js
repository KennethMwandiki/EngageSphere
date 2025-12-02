// AI/ML backend router for Azure OpenAI and Vertex AI
const express = require('express');
const axios = require('axios');
const router = express.Router();


// Azure OpenAI endpoint and key (from env)
const AZURE_OPENAI_URL = 'https://write-mar5lw3u-swedencentral.cognitiveservices.azure.com/openai/deployments/Codeflow/chat/completions?api-version=2025-01-01-preview';
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;

// Vertex AI endpoint and key
const VERTEX_AI_URL = 'https://us-central1-aiplatform.googleapis.com/v1/projects/vertex-ai-ml-demo/locations/us-central1/publishers/google/models/text-bison:predict';
const VERTEX_AI_KEY = process.env.VERTEX_AI_KEY;

// GPT-5 mini (preview) endpoint and key
const GPT5_MINI_URL = process.env.GPT5_MINI_URL || 'https://api.gpt5mini.com/v1/chat/completions';
const GPT5_MINI_KEY = process.env.GPT5_MINI_KEY;

// Default provider can be overridden per-request via `provider` in the body
// or globally via the `DEFAULT_AI_PROVIDER` environment variable.
const DEFAULT_AI_PROVIDER = (process.env.DEFAULT_AI_PROVIDER || 'gpt5mini').toLowerCase();

// Helper: choose provider ("azure", "vertex", "gpt5mini")
function getProvider(req) {
  // If request specifically asks for a provider, respect it (with a few aliases)
  const p = (req.body && req.body.provider) ? String(req.body.provider).toLowerCase() : null;
  if (p === 'vertex') return 'vertex';
  if (p === 'gpt5mini' || p === 'gpt-5-mini' || p === 'gpt5' || p === 'raptor' || p === 'raptor-mini') return 'gpt5mini';
  if (p === 'azure' || p === 'openai' || p === 'azureopenai') return 'azure';

  // Otherwise fall back to the configured default provider (env-controlled)
  return DEFAULT_AI_PROVIDER;
}

// POST /api/ai/personalize
router.post('/ai/personalize', async (req, res) => {
  const { prompt, provider } = req.body;
  try {
    let response;
    const provider = getProvider(req);
    if (provider === 'vertex') {
      response = await axios.post(
        VERTEX_AI_URL,
        { instances: [{ content: prompt }] },
        { headers: { 'Authorization': `Bearer ${VERTEX_AI_KEY}`, 'Content-Type': 'application/json' } }
      );
      res.json(response.data);
    } else if (provider === 'gpt5mini') {
      response = await axios.post(
        GPT5_MINI_URL,
        { messages: [{ role: 'user', content: prompt }] },
        { headers: { 'Authorization': `Bearer ${GPT5_MINI_KEY}`, 'Content-Type': 'application/json' } }
      );
      res.json(response.data);
    } else {
      response = await axios.post(
        AZURE_OPENAI_URL,
        { messages: [{ role: 'user', content: prompt }] },
        { headers: { 'api-key': AZURE_OPENAI_KEY, 'Content-Type': 'application/json' } }
      );
      res.json(response.data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/sentiment
router.post('/ai/sentiment', async (req, res) => {
  const { text, provider } = req.body;
  try {
    let response;
    const provider = getProvider(req);
    if (provider === 'vertex') {
      response = await axios.post(
        VERTEX_AI_URL,
        { instances: [{ content: `Analyze sentiment: ${text}` }] },
        { headers: { 'Authorization': `Bearer ${VERTEX_AI_KEY}`, 'Content-Type': 'application/json' } }
      );
      res.json(response.data);
    } else if (provider === 'gpt5mini') {
      response = await axios.post(
        GPT5_MINI_URL,
        { messages: [{ role: 'user', content: `Analyze sentiment: ${text}` }] },
        { headers: { 'Authorization': `Bearer ${GPT5_MINI_KEY}`, 'Content-Type': 'application/json' } }
      );
      res.json(response.data);
    } else {
      response = await axios.post(
        AZURE_OPENAI_URL,
        { messages: [{ role: 'user', content: `Analyze sentiment: ${text}` }] },
        { headers: { 'api-key': AZURE_OPENAI_KEY, 'Content-Type': 'application/json' } }
      );
      res.json(response.data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
