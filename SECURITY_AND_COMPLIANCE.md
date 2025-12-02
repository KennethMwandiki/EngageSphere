# Security and Compliance

This document outlines the security and compliance policies for EngageSphere, including vulnerability disclosure, automated auditing, and licensing standards.

## Security Policy
The EngageSphere team is committed to ensuring the security of the platform and its users. We follow industry best practices to identify and mitigate security risks. Our CI/CD pipeline includes automated security checks to maintain a high standard of security.

## Vulnerability Disclosure Policy
We encourage security researchers to report any vulnerabilities they discover in EngageSphere. To report a vulnerability, please email us at **[SECURITY CONTACT EMAIL]**.

When reporting a vulnerability, please include the following information:
- A detailed description of the vulnerability, including steps to reproduce it.
- The version of EngageSphere you are using.
- Any relevant logs or screenshots.

We will acknowledge receipt of your report within 48 hours and will work to resolve the issue as quickly as possible. We ask that you do not publicly disclose the vulnerability until we have had a chance to address it.

## CI/CD Integration
Our CI/CD pipeline integrates several tools to automate security and compliance checks:
- **CodeQL:** We use CodeQL to perform static analysis of our codebase to identify potential security vulnerabilities.
- **Gitleaks:** We use Gitleaks to scan our repository for secrets and other sensitive information.
- **Dependency Scanning:** We use `npm audit` and other tools to scan our dependencies for known vulnerabilities.

These checks are run on every pull request and on every commit to the `main` branch. The results of these scans are available in the "Security" tab of our GitHub repository.

## Secret Management

### Local Development
For local development, all secrets, API keys, and other sensitive credentials must be stored in a `.env` file. This file is included in the `.gitignore` and should never be committed to the repository. A `.env.example` file is provided in the root of the repository to serve as a template.

### Production Environment
For production and other sensitive environments, secrets must be managed using a dedicated secret management service, such as:
- AWS Secrets Manager
- Azure Key Vault
- Google Secret Manager
- HashiCorp Vault

Using a dedicated service provides enhanced security, access control, auditing, and secret rotation capabilities.

### Automated Scanning
The CI/CD pipeline is configured to use `gitleaks` to automatically scan for any hardcoded secrets in pull requests and commits. This serves as a preventative measure to stop secrets from being accidentally exposed.

## Compliance
EngageSphere is licensed under the MIT License. All contributions to the project must be licensed under the MIT License. To ensure compliance, all source files must include an SPDX license identifier.

For more information on licensing, please see our [LEGAL.md](./LEGAL.md) file.
