## EngageSphere — azd deployment guide

This file documents how to provision and deploy the EngageSphere web service using Azure Developer CLI (`azd`). It assumes the repo contains `azure.yaml` and `infra/main.bicep`.

Prerequisites
- Install Azure CLI: https://learn.microsoft.com/cli/azure/install-azure-cli
- Install Azure Developer CLI (azd): https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd
- Install Node.js (for the app) and `npm install` inside the repo.
- You must have an Azure subscription and be logged in (`az login`).

Recommended env vars (set these before `azd up`):
- `AZURE_SUBSCRIPTION_ID` (or specify during `azd` prompts)
- `AZURE_LOCATION` (e.g., `eastus`)
- Secrets for runtime (store in Key Vault or set as app settings later):
  - `JWT_SECRET`
  - `GPT5_MINI_KEY` / `AZURE_OPENAI_KEY` / `VERTEX_AI_KEY` (as required)

Quick deploy (interactive):
1. Install dependencies locally:
```bash
npm install
```
2. Login to Azure:
```bash
az login
az account set --subscription "<your-subscription-id>"
```
3. Provision and deploy using `azd up` (runs provisioning then deploy):
```bash
# from repository root
azd up --location "<azure-region>"
```
Follow prompts: choose resource group name, confirm deployment. `azd up` will deploy resources defined in `azure.yaml` and `infra/main.bicep`.

Non-interactive example (CI):
```bash
export AZURE_SUBSCRIPTION_ID="<sub-id>"
export AZURE_LOCATION="eastus"
# Login via service principal (CI)
az login --service-principal -u <appId> -p <password-or-cert> --tenant <tenantId>
azd up --location "$AZURE_LOCATION" --yes
```

After deploy
- `azd show` will display outputs including the web app URL (Bicep outputs `webAppUrl`).
- Use `az webapp config appsettings set -g <rg> -n <webAppName> --settings "JWT_SECRET=<secret>"` to set runtime secrets, or better: add to Key Vault and reference them.

Teardown
```bash
azd down
```

Notes & recommendations
- `infra/main.bicep` already declares an App Service, Managed Identity, Key Vault, Log Analytics and Application Insights. Ensure `appServicePlanName`, `webAppName`, and other parameter values are unique per subscription.
- For production, configure Key Vault secrets and grant the managed identity access; do not store secrets in source code.
- If using the WebSocket features added in `server.js`, ensure App Service plan supports WebSockets (Linux or Windows with WebSockets enabled) and set `WEBSOCKETS_ENABLED` in app settings.

If you want, I can:
- Add a CI workflow that runs `azd up` with a service principal (GitHub Actions example).
- Create Key Vault secret setup scripts or `az` commands to store required keys.
- Run a validation check of the `main.bicep` via the Azure CLI (I cannot run it for you, but I can generate commands).
