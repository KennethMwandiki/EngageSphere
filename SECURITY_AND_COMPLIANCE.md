# Security & Compliance: End-to-end Encryption, GDPR, and Audit Plan

This document outlines a practical, implementable plan for protecting user and business data, meeting GDPR/global privacy requirements, and establishing regular security audits and controls.

## Goals
- End-to-end encryption (E2EE) for user-sensitive messages and business secrets where feasible.
- Strong server-side encryption at rest and in transit for all data.
- Key management using envelope encryption and a managed KMS/HSM (Azure Key Vault, AWS KMS, or GCP KMS).
- GDPR and global privacy compliance: data subject requests (DSR), data mapping, consent, retention and DPIA.
- Continuous assurance via SAST/DAST, dependency monitoring, and scheduled pentests.

---

## 1) End-to-End Encryption (E2EE) — architecture and options

High-level choices:

- Client-side E2EE (recommended for user-to-user sensitive messages):
  - Use the Signal Protocol (libsignal) or libsodium/X25519+XSalsa20-Poly1305 for message encryption/ratcheting when you need forward secrecy and deniability.
  - Browser: WebCrypto APIs + libsodium-wrappers for modern browsers; mobile SDKs can use libsignal implementations.
  - Key storage: private keys remain on client devices and are encrypted with a device passphrase or OS-provided secure storage (iOS Keychain, Android Keystore).
  - Server role: only transports ciphertext and stores public keys (or pre-keys). The server cannot read messages.

- Envelope encryption for server-side business data (recommended for logs, processed artifacts, AI prompts/results):
  - Data is encrypted with a data key (DEK). The DEK is encrypted with a KMS-managed key (KEK).
  - Store only encrypted DEKs in the DB with metadata (key version, KMS key id, nonce). KMS decrypts DEKs when the server needs to operate on plaintext (minimize scope/time).
  - Use a KMS offering (Azure Key Vault, AWS KMS, GCP KMS). For high assurance, use a customer-managed HSM-backed key.

Trade-offs and guidance:
- If absolute E2EE (server cannot read content) is required for parts of the product (e.g., private messages), use client-side Signal-style encryption and avoid sending plaintext or raw transcripts to server-side AI.
- For analytics or AI where decryption must occur server-side, use envelope encryption and strictly limit access via IAM policies and short-lived KMS grants.

Implementation sketch (envelope encryption):

1. On write:
   - Generate a random DEK (e.g., 256-bit AES-GCM key) per object or per-tenant.
   - Encrypt payload with DEK (AES-GCM or XChaCha20-Poly1305).
   - Request KMS to encrypt the DEK (Encrypt API) with a KEK. Store the encrypted DEK and ciphertext in DB.

2. On read:
   - Retrieve encrypted DEK, call KMS Decrypt to recover DEK (ensure IAM policies, audit logs).
   - Decrypt payload in-memory, process, then zeroize the key from memory.

3. Rotation:
   - Periodically rotate KEK in KMS and re-encrypt DEKs on a rolling schedule. Use key-version metadata and background jobs to rewrap DEKs.

Sample server-side helper (pseudo):

```js
// generate and encrypt a DEK, encrypt payload
const dek = crypto.randomBytes(32);
const ciphertext = encryptWithDEK(dek, plaintext);
const wrappedDek = await kms.encrypt({ KeyId: KEK_ID, Plaintext: dek });
// store { ciphertext, wrappedDek, kekVersion }
```

Security measures:
- Use AEAD algorithms (AES-GCM or XChaCha20-Poly1305).
- Enforce TLS 1.2+ for all transport and mutual TLS where appropriate between services.
- Limit KMS decrypt privileges to small, audited server roles.

---

## 2) Key Management & Operations

- Use a cloud-managed KMS/HSM (Azure Key Vault, AWS KMS, GCP KMS) for KEKs.
- Keep private keys for client-side E2EE only on devices; offer secure backup with user passphrase-encrypted key bundles (optional).
- Access control: use least-privilege IAM roles for services that call KMS. Use service identities (Managed Identities / Workload Identity Federation) instead of long-lived secrets.
- Logging: enable KMS audit logs (who/when/operation) forwarded to a secure SIEM.
- Rotation: establish a rotation policy (e.g., KEK rotation every 6-12 months, DEK rotation more frequently if required). Automate rewrapping.
- Emergency key compromise: have a key compromise playbook — rotate keys, revoke access, and re-encrypt affected DEKs with new KEK.

---

## 3) Data in transit and at rest

- Transport: TLS 1.2+ with strong ciphers. Consider mTLS for microservice-to-microservice communication.
- At-rest: all DB fields that contain PII, secrets, or AI prompts/results should be encrypted via envelope encryption or database-level TDE in addition to app-layer encryption.
- Backups: apply encryption for backups and store encryption keys in KMS; ensure backup retention policies meet compliance.

---

## 4) GDPR and global privacy controls

Core requirements and recommended implementation:

- Data mapping & inventory:
  - Create a data inventory listing personal data categories, storage locations, retention, and processors.
  - Maintain as `data-inventory.yml` or similar.

- Data Subject Requests (DSR):
  - Implement endpoints and processes: Export (data portability), Erasure (right to be forgotten), Rectification, Restriction.
  - Sample service endpoints:
    - GET /api/dsr/export — authenticated endpoint that returns a user's data archive (JSON/CSV), sanitized of other users' data.
    - POST /api/dsr/erase — submit and track erasure requests; process background jobs to remove or anonymize PII; keep an audit trail of actions taken.

- Consent & lawful basis:
  - Record consent events with timestamp, scope, and version (store a consent log table).
  - For features that process data (e.g., AI analytics), ensure user consent or contractual/legal basis is captured.

- Retention & minimization:
  - Define and enforce retention policies. Implement automatic deletion jobs (cron) and soft-delete plus purge windows.

- DPIA & Risk Assessment:
  - For high-risk processing (e.g., profiling, behavioral scoring), perform a Data Protection Impact Assessment and document mitigations.

- International transfers:
  - If transferring EU personal data outside the EEA, rely on appropriate safeguards (SCCs, adequacy decisions, or use of EU-hosted keys and processing).

- Breach notification:
  - Maintain a breach playbook (roles, timelines). GDPR requires notification to supervisory authority within 72 hours when feasible.

---

## 5) Regular security audits and continuous assurance

Recommended program:

- Automated CI checks:
  - SAST (GitHub Code Scanning, ESLint, semgrep), dependency scanning (Dependabot/Snyk), secret scanning.
  - Add CI job to run `npm audit`, `snyk test`, or code scanning on PRs.

- DAST & runtime checks:
  - Weekly OWASP ZAP scans against staging. Add automated scan jobs that run after deployment to staging.

- Dependency & supply-chain:
  - Enforce Dependabot PRs and automatic patch merges for non-breaking updates.

- Penetration testing:
  - Schedule annual third-party pentests and re-tests after major releases.

- Logging & monitoring:
  - Centralized logs (ELK / Azure Monitor / Cloud Logging) and SIEM with alerts for anomalous KMS usage, mass deletes, or failed auth attempts.

---

## 6) Implementation checklist (short-term priorities)

1. Define data classes and mark fields requiring encryption.
2. Implement envelope encryption helpers and integrate with KMS (choose provider).
3. Add DSR endpoints: `/api/dsr/export`, `/api/dsr/erase`, with audit logging.
4. Add consent logging and UI prompts for features that require consent.
5. Add SAST/DAST to CI (GitHub Actions): code scanning, Dependabot, and OWASP ZAP job.
6. Create a breach incident playbook and contact list; store securely (not in repo) and reference from README.

---

## 7) Example: Envelope encryption helper (Node.js pseudo)

```js
const crypto = require('crypto');

function encryptWithDek(dek, plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', dek, iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString('base64');
}

function decryptWithDek(dek, b64) {
  const buf = Buffer.from(b64, 'base64');
  const iv = buf.slice(0,12); const tag = buf.slice(12,28); const ct = buf.slice(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', dek, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

// Wrap/unwrap DEK with KMS is provider-specific; use their SDK encrypt/decrypt.
```

---

## 8) Incident response & breach playbook (summary)

1. Triage & contain — isolate affected systems and rotate keys if necessary.
2. Assess scope — identify impacted subjects and data categories.
3. Notify authorities — within 72 hours for GDPR if required; prepare subject notifications where necessary.
4. Remediate & improve — root cause analysis, patch, and test.

---

## 9) Next sprint-level tasks (what I can implement for you)

- Add envelope encryption helpers and example integration with your chosen KMS (Azure Key Vault or AWS KMS).
- Add DSR endpoints and implement basic export/erase flows (with admin audit logs).
- Add CI jobs for SAST and dependency scanning to `.github/workflows`.

If you want I can implement one of the items above now — tell me which (add KMS helper, add DSR endpoints, or add security CI jobs) and I'll start the changes and tests.
