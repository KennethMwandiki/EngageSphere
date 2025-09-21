// API router for external live interaction platforms
const express = require('express');
const router = express.Router();


const SUPPORTED_LIVE_PLATFORMS = [
  'zoom', 'vm', 'innchat', 'teams', 'googlemeet', 'whatsapp'
];

// --- GOOGLE OAUTH2 + MULTIPLATFORM + MULTI-API SUPPORT ---
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/live/google/callback';
const GOOGLE_ANDROID_CLIENT_ID = process.env.GOOGLE_ANDROID_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.GOOGLE_IOS_CLIENT_ID;
const GOOGLE_DESKTOP_CLIENT_ID = process.env.GOOGLE_DESKTOP_CLIENT_ID;
let googleAccessToken = null;
let googleRefreshToken = null;

// Supported Google API scopes
const GOOGLE_SCOPES = {
  calendar: 'https://www.googleapis.com/auth/calendar.events',
  drive: 'https://www.googleapis.com/auth/drive.file',
  contacts: 'https://www.googleapis.com/auth/contacts.readonly',
  gmail: 'https://www.googleapis.com/auth/gmail.send'
};

// Step 1: Redirect user to Google OAuth (web, mobile, desktop)
router.get('/live/google/auth', (req, res) => {
  // Accept ?scope=calendar,drive,gmail,contacts&platform=web|android|ios|desktop
  const scopeParam = req.query.scope || 'calendar';
  const platform = req.query.platform || 'web';
  const scopes = scopeParam.split(',').map(s => GOOGLE_SCOPES[s] || s).join(' ');
  let clientId = GOOGLE_CLIENT_ID;
  let redirectUri = GOOGLE_REDIRECT_URI;
  if (platform === 'android' && GOOGLE_ANDROID_CLIENT_ID) clientId = GOOGLE_ANDROID_CLIENT_ID;
  if (platform === 'ios' && GOOGLE_IOS_CLIENT_ID) clientId = GOOGLE_IOS_CLIENT_ID;
  if (platform === 'desktop' && GOOGLE_DESKTOP_CLIENT_ID) clientId = GOOGLE_DESKTOP_CLIENT_ID;
  // For mobile/desktop, you may need to adjust redirectUri and flow
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent`;
  res.redirect(authUrl);
});

// Step 2: OAuth callback to exchange code for access token
router.get('/live/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing code');
  try {
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token',
      querystring.stringify({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code'
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );
    googleAccessToken = tokenRes.data.access_token;
    googleRefreshToken = tokenRes.data.refresh_token;
    res.send('Google authorization successful. You may now use Calendar, Drive, Contacts, and Gmail features.');
  } catch (err) {
    res.status(500).send('Google OAuth failed: ' + err.message);
  }
});

// Google Drive: Upload a file (example endpoint)
router.post('/live/google/drive/upload', async (req, res) => {
  if (!googleAccessToken) return res.status(401).json({ error: 'Google not authorized. Please <a href="/api/live/google/auth?scope=drive">authorize Google Drive</a>.' });
  try {
    // Example: upload a text file
    const fileMetadata = { name: 'sample.txt' };
    const media = { mimeType: 'text/plain', body: 'Hello from EngageSphere!' };
    const uploadRes = await axios.post('https://www.googleapis.com/upload/drive/v3/files?uploadType=media', media.body, {
      headers: {
        Authorization: `Bearer ${googleAccessToken}`,
        'Content-Type': media.mimeType
      },
      params: fileMetadata
    });
    res.json({ fileId: uploadRes.data.id, info: 'File uploaded to Google Drive.' });
  } catch (err) {
    res.status(500).json({ error: 'Drive upload failed: ' + (err.response?.data?.error?.message || err.message) });
  }
});

// Google Contacts: List contacts (example endpoint)
router.get('/live/google/contacts', async (req, res) => {
  if (!googleAccessToken) return res.status(401).json({ error: 'Google not authorized. Please <a href="/api/live/google/auth?scope=contacts">authorize Google Contacts</a>.' });
  try {
    const contactsRes = await axios.get('https://people.googleapis.com/v1/people/me/connections', {
      headers: { Authorization: `Bearer ${googleAccessToken}` },
      params: { personFields: 'names,emailAddresses' }
    });
    res.json({ contacts: contactsRes.data.connections });
  } catch (err) {
    res.status(500).json({ error: 'Contacts fetch failed: ' + (err.response?.data?.error?.message || err.message) });
  }
});

// Gmail: Send email (example endpoint)
router.post('/live/google/gmail/send', async (req, res) => {
  if (!googleAccessToken) return res.status(401).json({ error: 'Google not authorized. Please <a href="/api/live/google/auth?scope=gmail">authorize Gmail</a>.' });
  try {
    const { to, subject, message } = req.body;
    const email = [
      `To: ${to}`,
      'Subject: ' + subject,
      '',
      message
    ].join('\r\n');
    const encodedMessage = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const sendRes = await axios.post('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      raw: encodedMessage
    }, {
      headers: { Authorization: `Bearer ${googleAccessToken}` }
    });
    res.json({ id: sendRes.data.id, info: 'Email sent via Gmail.' });
  } catch (err) {
    res.status(500).json({ error: 'Gmail send failed: ' + (err.response?.data?.error?.message || err.message) });
  }
});

// --- ZOOM OAUTH2 + MEETING CREATION ---
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
const ZOOM_REDIRECT_URI = process.env.ZOOM_REDIRECT_URI || 'http://localhost:3000/api/live/zoom/callback';
let zoomAccessToken = null; // In production, use a persistent store

const axios = require('axios');
const querystring = require('querystring');

// Step 1: Redirect user to Zoom OAuth
router.get('/live/zoom/auth', (req, res) => {
  const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${ZOOM_CLIENT_ID}&redirect_uri=${encodeURIComponent(ZOOM_REDIRECT_URI)}`;
  res.redirect(authUrl);
});

// Step 2: OAuth callback to exchange code for access token
router.get('/live/zoom/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing code');
  try {
    const tokenRes = await axios.post('https://zoom.us/oauth/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: ZOOM_REDIRECT_URI
      }),
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    zoomAccessToken = tokenRes.data.access_token;
    // In production, store refresh_token and handle expiry
    res.send('Zoom authorization successful. You may now create meetings.');
  } catch (err) {
    res.status(500).send('Zoom OAuth failed: ' + err.message);
  }
});

// POST /api/live/start
router.post('/live/start', async (req, res) => {
  const { platform, meetingInfo } = req.body;
  if (!SUPPORTED_LIVE_PLATFORMS.includes((platform || '').toLowerCase())) {
    return res.status(400).json({ error: 'Unsupported live platform' });
  }

  if (platform === 'zoom') {
    if (!zoomAccessToken) {
      // Not authorized yet
      return res.status(401).json({
        error: 'Zoom not authorized. Please <a href="/api/live/zoom/auth">authorize Zoom</a>.'
      });
    }
    try {
      // Create a Zoom meeting
      const userRes = await axios.get('https://api.zoom.us/v2/users/me', {
        headers: { Authorization: `Bearer ${zoomAccessToken}` }
      });
      const userId = userRes.data.id;
      const meetingRes = await axios.post(`https://api.zoom.us/v2/users/${userId}/meetings`, {
        topic: (meetingInfo && meetingInfo.topic) || 'Live Meeting',
        type: 1 // Instant meeting
      }, {
        headers: { Authorization: `Bearer ${zoomAccessToken}` }
      });
      const joinUrl = meetingRes.data.join_url;
      return res.json({ platform, joinUrl, info: 'Zoom meeting created' });
    } catch (err) {
      return res.status(500).json({ error: 'Zoom meeting creation failed: ' + (err.response?.data?.message || err.message) });
    }
  }

  if (platform === 'googlemeet' || platform === 'google') {
    if (!googleAccessToken) {
      return res.status(401).json({
        error: 'Google not authorized. Please <a href="/api/live/google/auth">authorize Google</a>.'
      });
    }
    try {
      // Create a Google Calendar event with Meet link
      const now = new Date();
      const end = new Date(now.getTime() + 30 * 60000); // 30 min
      const event = {
        summary: (meetingInfo && meetingInfo.topic) || 'Live Meeting',
        start: { dateTime: now.toISOString() },
        end: { dateTime: end.toISOString() },
        conferenceData: { createRequest: { requestId: Math.random().toString(36).slice(2,10), conferenceSolutionKey: { type: 'hangoutsMeet' } } }
      };
      const eventRes = await axios.post('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', event, {
        headers: { Authorization: `Bearer ${googleAccessToken}` }
      });
      const joinUrl = eventRes.data.hangoutLink || eventRes.data.htmlLink;
      return res.json({ platform, joinUrl, info: 'Google Meet event created' });
    } catch (err) {
      return res.status(500).json({ error: 'Google event creation failed: ' + (err.response?.data?.error?.message || err.message) });
    }
  }

  // Simulated join for other platforms
  let joinUrl = `https://join.${platform}.com/meeting/${Math.random().toString(36).slice(2,10)}`;
  res.json({ platform, joinUrl, info: `Simulated join for ${platform}` });
});

module.exports = router;
