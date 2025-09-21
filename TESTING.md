# Testing the Admin Health UI (Local)

This document shows quick, PowerShell-friendly steps to test the Admin-only health/status endpoint and the admin UI in `frontend-prototype.html`.

Prerequisites
- Node.js installed
- Project dependencies installed (if any). This repo runs a plain `node server.js` entrypoint.
- Ensure you run commands in PowerShell (the workspace default) or adjust for your shell.

1) Prepare a local `.env` (recommended)

Create a `.env` in the project root (do NOT commit it). Example contents:

```
JWT_SECRET=your_local_jwt_secret
# Optional: add provider/test keys so the health check shows "configured"
VERTEX_AI_KEY=your_vertex_key
AZURE_OPENAI_KEY=your_azure_key
GPT5_MINI_KEY=your_gpt5_key
GOOGLE_CLIENT_ID=your_google_client_id
ZOOM_CLIENT_ID=your_zoom_client_id
NODE_ENV=development
```

2) Start the server

From the project root:

```powershell
# start the server (default entrypoint)
node server.js
```

You should see a log like `Server running on port 3000`.

3) Obtain an admin JWT

Option A — Use the built-in login route (recommended for dev):

```powershell
# This will POST { username: 'admin', password: 'adminpass' }
# and print the JSON response containing the token.
Invoke-RestMethod -Uri http://localhost:3000/api/auth/login -Method Post \
  -Body (@{ username = 'admin'; password = 'adminpass' } | ConvertTo-Json) \
  -ContentType 'application/json' | ConvertTo-Json
```

Look for the `token` value in the response.

Option B — Create a signed token locally with Node (useful if you don't want to hit the login route):

```powershell
# Replace the secret if you used a custom JWT_SECRET in .env
$env:JWT_SECRET='your_local_jwt_secret'
node -e "console.log(require('jsonwebtoken').sign({ username: 'admin', role: 'admin' }, process.env.JWT_SECRET || 'your_local_jwt_secret', { expiresIn: '1h' }))"
```

Copy the token string from the output.

4) Configure your browser (localStorage) for the UI

Open the web UI at http://localhost:3000/ and open the browser DevTools Console. Run:

```js
localStorage.setItem('userRole', 'admin');
localStorage.setItem('authToken', '<PASTE_ADMIN_JWT_HERE>');
```

Refresh the page. The Admin section should now be visible.

5) Use the Admin UI

- Navigate to Admin → click "Check Key Status".
- You should see a table with provider keys showing ✅ (configured) or ❌ (missing) and a timestamp.

6) Direct API test (without UI)

If you prefer curl/PowerShell to test the endpoint directly:

```powershell
# Example using Invoke-RestMethod (PowerShell)
$token = '<PASTE_ADMIN_JWT_HERE>'
Invoke-RestMethod -Uri http://localhost:3000/api/admin/health -Method Get -Headers @{ Authorization = "Bearer $token" }

# Or with curl (WSL or if curl available):
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/admin/health
```

Expected outputs
- UI: styled table and a timestamp. If you see an error message in the UI, check the console/network tab for more details.
- Direct API: JSON with boolean flags, e.g.:

```json
{
  "VERTEX_AI_KEY": false,
  "AZURE_OPENAI_KEY": true,
  "GPT5_MINI_KEY": false,
  "JWT_SECRET": true,
  "GOOGLE_CLIENT_ID": false,
  "ZOOM_CLIENT_ID": false,
  "NODE_ENV": "development",
  "timestamp": "2025-09-18T...Z"
}
```

Troubleshooting
- 401 No token provided: Make sure the Authorization header is present or use localStorage.authToken for the UI.
- 403 Invalid token or Admin access required: Ensure token payload includes `role: 'admin'` and the token is signed with the same `JWT_SECRET` the server uses.
- Token expired: create a fresh token or adjust expiresIn during dev.

Developer notes (optional improvements)
- You can add a small development-only helper to mint tokens on the server to simplify testing; do NOT include such a helper in production.
- To normalize roles server-side, you can update `authenticateJWT` to set `req.user.role = (user.role||'').toLowerCase()`.

If you'd like, I can add a tiny `scripts/generate-admin-token.js` helper and a short `TESTING` npm script — tell me and I'll add it.