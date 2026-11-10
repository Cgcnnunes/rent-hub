# Project Guidelines

This repository is currently a planning baseline. Do not describe planned behavior, commands, or infrastructure as implemented until the corresponding code and configuration exist.

## Before changing the project

- Read the relevant product and technical documentation in [`docs/`](docs/).
- Keep changes within the documented layer and package boundaries.
- Update relevant documentation and the glossary when behavior or terminology changes.
- When proposing a UI, always present four variants for the user to choose from.

## Architecture constraints

- The web client is a responsive Next.js and TypeScript application.
- The API uses TypeScript and standard Web `Request`/`Response` APIs; do not add Hono or another server framework.
- Keep business rules independent of HTTP, Node.js, Cloudflare, database, and storage implementations.
- Isolate Node.js and Cloudflare Worker entry points and provider-specific code behind adapters.
- Nx is the selected monorepo task orchestrator; pnpm is the package manager.
- Check Cloudflare runtime compatibility feature by feature. Passing on local Node.js is not proof that code works on Workers.

## Quality and safety

- Use strict TypeScript; do not use `any` or unsafe assertions.
- Validate external input at system boundaries and enforce authorization in the backend.
- Never commit secrets, real customer data, or production credentials.
- Use the testing and deployment requirements in [`docs/TESTING.md`](docs/TESTING.md) and [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Current status

There are no application build or test commands yet. Add and document them with the repository foundation rather than inventing commands in the meantime.
