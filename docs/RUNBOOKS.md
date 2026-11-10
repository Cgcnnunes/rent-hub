# Operations and Runbooks

## Status

No deployed application or operational commands exist yet. The following runbooks must be completed and tested before production use.

## Required runbooks

### Deploy to TEST

Document how a merge to `main` enters the reliable TEST deployment queue, how affected apps are selected, how the deployment is verified, and how a failed deployment is diagnosed. Do not describe a GitHub Actions concurrency group as a FIFO queue.

### Deploy to PROD

Document manual dispatch from an eligible Git tag, validation of the tag, environment approval/credentials, smoke tests, release promotion, and durable recording of successful deployment.

### Roll back PROD

Document how to select an older eligible tag, verify the intended rollback, deploy it, run smoke tests, record the rollback, and communicate the result. A failed deployment must be retryable; a successful tag must not be redeployed as a normal release.

### Database migration

Document migration review, TEST application and verification, production backup/recovery considerations, execution, post-migration checks, and recovery limitations before applying schema changes to PROD.

### Restore a deleted record

Document how an authorized user restores a record within the 30-day retention window and how to verify related documents and child records. After the retention period, the record is permanently deleted and cannot be restored through the application.

### Authentication and account access

Document registration/email verification, password recovery, account invitations, membership/access changes, token revocation, and incident response. Test the normal authentication flow; never use an authentication bypass.

### Secrets and service incidents

Document how to rotate compromised credentials, investigate service/provider errors, protect logs from sensitive data, and verify environment isolation.

## Completion rule

Every runbook must use implemented commands and actual environment names. Replace this planning document with verified procedures before the first production release.
