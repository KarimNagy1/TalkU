# TalkU Community Fund

A bilingual English/Arabic community fund website built with static HTML,
CSS, and JavaScript, Cloudflare Pages Functions, and Cloudflare D1.

## Features

- English and Arabic interfaces with right-to-left Arabic layout.
- Public donation and spending ledger.
- Separate private donor names and public display names.
- Public monthly fund summaries and historical records.
- Administrator authentication and protected management operations.
- Server-side validation, login rate limiting, and session management.
- Audit logging for administrative changes.
- Configurable monthly or yearly subscription renewal settings.
- TalkU API connectivity status and connected-user count.
- Public CSV export and protected administrative operations.

## Architecture

- `index.html`: website interface.
- `app.js`: browser-side application logic.
- `../functions/api/`: Cloudflare Pages API functions.
- `migrations/`: SQL migrations for the D1 database.
- `../wrangler.jsonc`: local test configuration; it targets a
  local test database and must not be used as production configuration.

The website uses the D1 database through the `DB` binding.

## Local development

Prerequisites:
- Node.js and npm.
- Access to the repository dependencies and Wrangler.
- A local-only `OWNER_SETUP_SECRET` for testing initial administrator setup.

From the repository root, open Git Bash and run:

```bash
export OWNER_SETUP_SECRET='replace-with-a-local-test-only-secret'

npx wrangler pages dev community-fund \
  --persist-to /tmp/talku-fund-wrangler-test \
  --ip 127.0.0.1 \
  --port 8788 \
  --binding "OWNER_SETUP_SECRET=$OWNER_SETUP_SECRET"
```

Open http://127.0.0.1:8788 in a browser.

Use only fictional test data in local development. Never reuse a local
test secret as a production secret.

## Database migrations

Review each SQL migration before applying it.

The existing production database already contains tables from earlier
versions. Do not blindly apply every migration to production: inspect the
current schema, back up the database, and prepare a migration plan that
accounts for existing tables and data.

Apply and verify migrations against the local test database first.
Do not use the local `wrangler.jsonc` configuration as production
configuration.

## Production deployment checklist

Before launch:

1. Back up the existing production D1 database.
2. Review the Cloudflare Pages project, deployment branch, build output,
   and D1 binding.
3. Prepare and review schema migrations for the existing production schema.
4. Configure production secrets in Cloudflare; never commit or share them.
5. Create the initial administrator through the approved secure setup flow.
6. Deploy only after the database and rollback plans are ready.
7. Verify public data privacy, administrator access, ledger operations,
   renewal settings, and TalkU server status on the deployed website.
8. Confirm all production readiness checks pass before announcing the website as ready for public use.

## Security notes

- Public responses must never expose private donor names or administrator
  credentials.
- Administrative operations must require valid authentication and
  authorization.
- Do not commit credentials, session secrets, production database exports,
  or private donor backups.
- Treat exported data containing private information as confidential.
- Never run production migrations or destructive database operations
  during local testing.
