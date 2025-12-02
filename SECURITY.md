# Security & Runtime Secrets

This file lists the runtime environment variables and secrets required by EngageSphere and guidance for storing them securely.

Required runtime environment variables (minimum for production):

- `JWT_SECRET` — Secret used to sign JSON Web Tokens for authentication.
- `DEFAULT_AI_PROVIDER` — Optional: `gpt5mini`, `azure`, or `vertex`. Defaults to `gpt5mini` if unset.
- `GPT5_MINI_KEY` — Key/token for the GPT-5 / Raptor mini preview provider (required if `DEFAULT_AI_PROVIDER=gpt5mini`).
- `AZURE_OPENAI_KEY` — Key for Azure OpenAI (required if using Azure provider).
- `VERTEX_AI_KEY` — Key for Vertex AI (required if using Vertex provider).

OAuth / External integrations:

- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` — For Google OAuth (Calendar, Drive, Gmail, Contacts).
- `GOOGLE_REDIRECT_URI` — Optional override for callback URL (defaults to `http://localhost:3000/api/live/google/callback`).
- `GOOGLE_ANDROID_CLIENT_ID`, `GOOGLE_IOS_CLIENT_ID`, `GOOGLE_DESKTOP_CLIENT_ID` — Optional platform-specific Google client IDs.
- `ZOOM_CLIENT_ID` and `ZOOM_CLIENT_SECRET` — For Zoom OAuth/meetings.
- `ZOOM_REDIRECT_URI` — Optional override for Zoom callback URL.
- Agora integration:
  - `AGORA_APP_ID`
  - `AGORA_REST_API_KEY`
  - `AGORA_CHAT_APPKEY`
  - `AGORA_ORGNAME`
  - `AGORA_APPNAME`

Other environment variables:

- `PORT` — HTTP port (defaults to 3000).

Where to store secrets:

- Production runtime: use Vercel Project Environment Variables (or your chosen host's secrets manager). Do NOT commit secrets to the repository.
- CI: store secrets in GitHub Actions Secrets only if a workflow needs to perform authenticated calls during CI. Avoid putting long-lived production keys in CI unless necessary.
- Local development: use a `.env` file (copy `.env.example`) and do not commit it.

Startup behavior:

- The server prints warnings if keys are missing during startup. In production (`NODE_ENV=production`), the server will exit with a non-zero code if critical keys (such as `JWT_SECRET` or the key required by `DEFAULT_AI_PROVIDER`) are missing. This prevents accidental deployment without required secrets.

Recommendations:

- Rotate keys regularly and follow provider best practices.
- Use fine-grained service accounts where possible (e.g., for Google APIs).
- Review `api/` files to ensure no secrets are hard-coded (Agora values were migrated to env vars).
