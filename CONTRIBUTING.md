# Contributing to EngageSphere

Thanks for your interest in contributing! This document outlines the preferred
workflow for contributions and clarifies permissions and licensing policies for
the project.

## Owner-only permissions and licensing

The repository is licensed under the MIT License (see `LICENSE`). That license
grants broad rights to use and distribute the code. However, any additional or
exclusive permissions, alternate licenses, or formal agreements that grant
rights beyond the MIT License may only be granted by the repository owner(s).
In this repository the owner is the account `KennethMwandiki`.

Contributors do not, by submitting a PR, transfer exclusive rights or the
ability to re-license the project. If you need an alternative license to be
granted for a contribution, contact the repository owner and obtain explicit
written permission before submitting.

## Preferred contribution workflow

1. Fork the repository and create a feature branch on your fork named like
   `feat/your-feature` or `fix/issue-123`.
2. Make changes in small, well-scoped commits. Include tests where applicable.
3. Keep your branch up to date with `main` to minimize merge conflicts.
4. Open a Pull Request (PR) targeting `main` in this repository. In the PR
   description include:
   - A short summary of what the change does and why.
   - Any breaking changes or migration notes.
   - How to test the change locally (commands and expected results).
5. CI runs automatically on PRs; address any failing checks.
6. Respond to review comments. Once approved, the maintainers will merge the
   PR. Only repository maintainers (designated reviewers) may merge a PR.

## Tests and CI

- Add or update tests when changing logic. The repository uses GitHub Actions
  for CI. PRs must pass all required checks before they can be merged.
- If your change requires additional CI configuration, describe it in the PR.

## DCO / CLA

If you prefer to use a Developer Certificate of Origin (DCO) workflow, sign
off commits with `git commit -s` and ensure your PR includes the sign-off.
The repository may adopt a Contributor License Agreement (CLA) later; if so,
maintainers will add the CLA and document how to sign it.

## Code style and review

- Follow existing project style conventions. Keep code modular and well-documented.
- Large or risky changes may require an RFC or issue discussion before a PR.

## Security disclosures

If you find a security vulnerability, do not open a public issue. Instead
contact the repository owner privately via the contact method listed in the
README or use GitHub's private security advisory flow.

## Thank you

Contributions are welcome. If you have questions about the process or the
permissions/licensing policy, open an issue and tag `@KennethMwandiki`.
