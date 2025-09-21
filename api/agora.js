const express = require("express");
const axios = require("axios");
const router = express.Router();

// Example: Proxy call to a 3rd-party platform
router.post("/integrate/:platform", async (req, res) => {
  const { platform } = req.params;
  const { payload } = req.body;

  // Use real Agora app information for integration
  const agoraAppId = "89d780c544f44ee38c36f54a108913a8";
  const agoraRestApiKey = "a41.chat.agora.io";
  const chatConfig = {
    AppKey: "411111872#1555202",
    OrgName: "411111872",
    AppName: "1555202"
  };

  // Only handle 'agora' platform for real integration
  if (platform !== "agora") {
    return res.status(400).json({ error: "Unsupported platform. Only 'agora' is supported in this integration." });
  }

  // Agora chat service REST API endpoint for user management (example)
  const apiUrl = `https://${agoraRestApiKey}/dev/v1/${chatConfig.OrgName}/${chatConfig.AppName}/users`;

  try {
    // Forward payload to Agora chat service (customize as needed for your use case)
    const response = await axios.post(apiUrl, payload, {
      headers: {
        "X-Agora-App-Id": agoraAppId,
        "X-Agora-AppKey": chatConfig.AppKey,
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
