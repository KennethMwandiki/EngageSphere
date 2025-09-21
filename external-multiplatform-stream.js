// Multi-platform streaming trigger for external systems or partner platforms
// Adapt this file to trigger streaming on all supported platforms via your backend

const axios = require('axios');

// Replace with your backend URL
const BACKEND_URL = 'https://your-backend-domain.com/api/stream/start';

// Supported streaming platforms
const platforms = [
  'YouTube',
  'Facebook',
  'Twitch',
  'Instagram',
  'LinkedIn',
  'Twitter (X)',
  'WeChat',
  'Kick',
  'Trovo',
  'DLive',
  'Vimeo',
  'TikTok',
  'Custom RTMP'
];

/**
 * Trigger streaming on all supported platforms.
 * @param {string} channel - The channel or event name.
 * @param {string} token - The stream or auth token.
 * @param {string} [authToken] - Optional Bearer token for backend authentication.
 */
async function startStreamOnAllPlatforms(channel, token, authToken) {
  for (const platform of platforms) {
    try {
      const response = await axios.post(BACKEND_URL, {
        platform,
        channel,
        token
      }, {
        headers: {
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        }
      });
      console.log(`Started stream on ${platform}:`, response.data);
    } catch (err) {
      console.error(`Failed to start stream on ${platform}:`, err.response?.data || err.message);
    }
  }
}

// Usage example:
// startStreamOnAllPlatforms('GlobalEventChannel', 'STREAM_TOKEN', 'YOUR_AUTH_TOKEN');

module.exports = { startStreamOnAllPlatforms };
