Verifying the GitHub repository and setting CI secrets

1) Verify the repository on GitHub

   Visit: https://github.com/KennethMwandiki/EngageSphere

   You should see the repository contents and the `main` branch.

2) Set required GitHub Actions secrets

   - Recommended secrets (used by workflows in this repo):
     - VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
     - GOOGLE_PLAY_SERVICE_ACCOUNT
     - ANDROID_PACKAGE_NAME, ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD
     - APPLE_API_KEY, APPLE_API_ISSUER_ID
     - SLACK_WEBHOOK (optional)

   Option A — set secrets from environment (PowerShell):

   ```powershell
   # Ensure gh is installed and authenticated: gh auth login
   $env:VERCEL_TOKEN = 'your-vercel-token'
   # set other env vars similarly
   .\scripts\gh-set-secrets.ps1 -RepoOwner 'KennethMwandiki' -RepoName 'EngageSphere'
   ```

   Option B — use a JSON file `scripts\secrets.json` with name/value pairs and call the script.

3) Verify in GitHub

   Go to the repo Settings → Secrets and variables → Actions to confirm secrets are present.
