# Rent Hub

Rent Hub is a property-management web application for landlords, initially focused on Portugal. It is intended to bring property, tenant, contract, payment, expense, maintenance, document, notification, and reporting workflows into one place.

> **Project status:** planning and documentation baseline. Application features and deployment workflows have not been implemented yet.

## Initial product defaults

- Language and locale: Portuguese (Portugal), `pt-PT`
- Currency: EUR
- Date display: `DD/MM/YYYY`
- Timezone: `Europe/Lisbon`
- Client: responsive website for desktop, tablet, and mobile
- Source control: public GitHub repository, default branch `main`
- License: no open-source license is granted

## Documentation

- [Product requirements](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Decision log](docs/DECISIONS.md)
- [Database model](docs/DATABASE.md)
- [API contracts](docs/API.md)
- [Development workflow](docs/DEVELOPMENT.md)
- [Testing strategy](docs/TESTING.md)
- [Deployment and environments](docs/DEPLOYMENT.md)
- [Security and data handling](docs/SECURITY.md)
- [Configuration](docs/CONFIGURATION.md)
- [Operational runbooks](docs/RUNBOOKS.md)
- [Releases](docs/RELEASES.md)
- [Glossary](docs/GLOSSARY.md)
- [Contribution guide](CONTRIBUTING.md)

## Repository status

The [public GitHub repository](https://github.com/Cgcnnunes/rent-hub) is initialized on `main`. The product brief calls for an npm/Nx monorepo containing a Next.js web app, a portable TypeScript API, and reusable packages. Those application packages and their commands will be added in the repository-foundation phase.

## Source use

This repository is public for viewing and intentionally has no license file. No permission to reuse, distribute, or create derivative works is granted by this repository. Public visibility is not the same as an open-source license.
