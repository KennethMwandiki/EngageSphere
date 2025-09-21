# Backend endpoint for behavioral analysis of forum/feedback
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Use the same AI/ML providers as before
const AZURE_OPENAI_URL = 'https://write-mar5lw3u-swedencentral.cognitiveservices.azure.com/openai/deployments/Codeflow/chat/completions?api-version=2025-01-01-preview';
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const VERTEX_AI_URL = 'https://us-central1-aiplatform.googleapis.com/v1/projects/vertex-ai-ml-demo/locations/us-central1/publishers/google/models/text-bison:predict';
const VERTEX_AI_KEY = process.env.VERTEX_AI_KEY;

function getProvider(req) {
  return req.body.provider === 'vertex' ? 'vertex' : 'azure';
}

// POST /api/ai/behavioral-analysis
router.post('/ai/behavioral-analysis', async (req, res) => {
  const { texts, provider } = req.body; // texts: array of forum/feedback strings
  if (!Array.isArray(texts) || texts.length === 0) {
    return res.status(400).json({ error: 'texts (array) is required' });
  }
  try {
    let aiPrompt = `Analyze the following forum/feedback messages. Identify behavioral triggers that lead to positive conversations. Return a summary and highlight any common positive patterns.\n\nMessages:\n`;
    aiPrompt += texts.map((t, i) => `${i + 1}. ${t}`).join('\n');
    let response;
    if (getProvider(req) === 'vertex') {
      response = await axios.post(
        VERTEX_AI_URL,
        { instances: [{ content: aiPrompt }] },
        { headers: { 'Authorization': `Bearer ${VERTEX_AI_KEY}`, 'Content-Type': 'application/json' } }
      );
      res.json(response.data);
    } else {
      response = await axios.post(
        AZURE_OPENAI_URL,
        { messages: [{ role: 'user', content: aiPrompt }] },
        { headers: { 'api-key': AZURE_OPENAI_KEY, 'Content-Type': 'application/json' } }
      );
      res.json(response.data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
