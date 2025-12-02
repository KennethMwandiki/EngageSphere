const express = require("express");
const axios = require("axios");
const router = express.Router();

// Example: Proxy call to a 3rd-party platform
router.post("/integrate/:platform", async (req, res) => {
  const { platform } = req.params;
  const { payload } = req.body;

  // Use Agora app information from environment variables (do NOT commit secrets)
  const AGORA_APP_ID = process.env.AGORA_APP_ID;
  const AGORA_REST_API_KEY = process.env.AGORA_REST_API_KEY;
  const AGORA_CHAT_APPKEY = process.env.AGORA_CHAT_APPKEY;
  const AGORA_ORGNAME = process.env.AGORA_ORGNAME;
  const AGORA_APPNAME = process.env.AGORA_APPNAME;

  if (!AGORA_APP_ID || !AGORA_REST_API_KEY || !AGORA_CHAT_APPKEY || !AGORA_ORGNAME || !AGORA_APPNAME) {
    return res.status(500).json({ error: 'Agora integration is not configured. Set AGORA_APP_ID, AGORA_REST_API_KEY, AGORA_CHAT_APPKEY, AGORA_ORGNAME and AGORA_APPNAME in environment.' });
  }

  // Only handle 'agora' platform for real integration
  if (platform !== "agora") {
    return res.status(400).json({ error: "Unsupported platform. Only 'agora' is supported in this integration." });
  }

  // Agora chat service REST API endpoint for user management (example)
  const apiUrl = `https://${AGORA_REST_API_KEY}/dev/v1/${AGORA_ORGNAME}/${AGORA_APPNAME}/users`;

  try {
    // Forward payload to Agora chat service (customize as needed for your use case)
    const response = await axios.post(apiUrl, payload, {
      headers: {
        "X-Agora-App-Id": AGORA_APP_ID,
        "X-Agora-AppKey": AGORA_CHAT_APPKEY,
        "Content-Type": "application/json"
      },
    });
    res.json(response.data);
  } catch (err) {
    // For deployment, log error for diagnostics
    console.error("Agora integration error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
