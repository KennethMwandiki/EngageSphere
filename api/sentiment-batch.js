// Backend: Batch sentiment analysis for forum/feedback
const express = require('express');
const axios = require('axios');
const { authenticateJWT } = require('./auth');
const router = express.Router();

const AZURE_OPENAI_URL = 'https://write-mar5lw3u-swedencentral.cognitiveservices.azure.com/openai/deployments/Codeflow/chat/completions?api-version=2025-01-01-preview';
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const VERTEX_AI_URL = 'https://us-central1-aiplatform.googleapis.com/v1/projects/vertex-ai-ml-demo/locations/us-central1/publishers/google/models/text-bison:predict';
const VERTEX_AI_KEY = process.env.VERTEX_AI_KEY;

function getProvider(req) {
  return req.body.provider === 'vertex' ? 'vertex' : 'azure';
}

// POST /api/ai/sentiment-batch
router.post('/ai/sentiment-batch', authenticateJWT, async (req, res) => {
  const { texts, provider } = req.body;
  if (!Array.isArray(texts) || texts.length === 0) {
    return res.status(400).json({ error: 'texts (array) is required' });
  }
  try {
    let results = [];
    for (const text of texts) {
      let aiPrompt = `Analyze the sentiment of this message. Reply with only Positive, Neutral, or Negative.\nMessage: ${text}`;
      let response, sentiment = '';
      if (getProvider(req) === 'vertex') {
        response = await axios.post(
          VERTEX_AI_URL,
          { instances: [{ content: aiPrompt }] },
          { headers: { 'Authorization': `Bearer ${VERTEX_AI_KEY}`, 'Content-Type': 'application/json' } }
        );
        sentiment = response.data?.predictions?.[0]?.content || '';
      } else {
        response = await axios.post(
          AZURE_OPENAI_URL,
          { messages: [{ role: 'user', content: aiPrompt }] },
          { headers: { 'api-key': AZURE_OPENAI_KEY, 'Content-Type': 'application/json' } }
        );
        sentiment = response.data?.choices?.[0]?.message?.content || '';
      }
      results.push({ text, sentiment });
    }
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
