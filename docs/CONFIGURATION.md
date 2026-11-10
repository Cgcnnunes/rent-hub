# Environment Configuration

## Status

No application environment variables or provider bindings have been defined yet. Create an inventory with each application and infrastructure adapter; do not guess variable names in active setup instructions.

## Separation

TEST and PROD must use separate configuration and credentials, including:

- Database and storage bindings.
- Authentication/signing secrets.
- API credentials.
- Email credentials.
- Environment-specific URLs and feature configuration.

Local development must use local/test resources and must not require PROD credentials.

## Secret handling

- Commit only documented variable names and safe placeholder examples.
- Never commit secret values, `.env` files, production credentials, or private keys.
- Supply secrets through the environment's secret manager; do not print them in logs.
- Rotate credentials without changing application/domain code.

## Documentation requirement

When configuration is implemented, maintain a table for each variable containing its name, purpose, required/optional status, environment scope, safe example (if applicable), and the place where its value is configured. Keep values out of the documentation.
