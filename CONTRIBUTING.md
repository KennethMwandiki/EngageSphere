# Contributing to EngageSphere

Thank you for your interest in contributing! 🎉

## How to Contribute
1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/my-feature`
3. **Commit changes**: `git commit -s -m "Add my feature"`
4. **Push branch**: `git push origin feature/my-feature`
5. **Open a Pull Request**

## Contribution Guidelines
- Follow the [Code of Conduct](./CODE_OF_CONDUCT.md).
- Ensure all commits are signed (`git commit -s`).
- **Do not commit secrets.** All API keys, passwords, and other secrets must be stored in a local `.env` file. Use the `.env.example` file as a template.
- Add/update tests for new features.
- Document changes in [CHANGELOG.md](./CHANGELOG.md).
- Respect the **MIT License**: contributions are accepted under the same license.

## Development Setup
- Install dependencies: `npm ci`
- Run backend: `python backend/main.py`
- Run frontend: `npm run dev`

## Reporting Issues
- Use GitHub Issues for bugs and feature requests.
- Include steps to reproduce, expected vs. actual behavior, and environment details.

## Attribution
This guide is adapted from best practices in the open-source community.
