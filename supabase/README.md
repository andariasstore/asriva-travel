# Poketo payments (Supabase)

## Functions

- `poketo-create-invoice`: creates/reuses an order and a Poketo sandbox invoice, then returns `paymentUrl`.
- `poketo-webhook`: verifies raw-body HMAC-SHA256 signatures, enforces a 5-minute timestamp tolerance, validates event headers, and applies event deduplication plus order status transitions atomically.

## Database

Apply `migrations/20261112000000_poketo_payments.sql`. The tables have RLS enabled and no browser-role policies. Only Edge Functions using the service-role key can access them.

## Secrets

Set these in Supabase Edge Function secrets (never commit real values):

- `POKETO_SECRET_KEY`: sandbox key beginning `sk_test_`.
- `POKETO_WEBHOOK_SECRET`: webhook signing secret beginning `whsec_`.
- `APP_BASE_URL`: public HTTPS origin for the storefront.

Supabase injects `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; do not add them to frontend variables.

For local development, copy `functions/.env.example` to `functions/.env` and keep that file untracked.

## Deploy

1. Link the correct Supabase project.
2. Apply the migration.
3. Set the three secrets above.
4. Deploy both functions with JWT verification disabled: webhook signature verification is handled by Poketo's HMAC signature; invoice creation is a public guest-checkout endpoint and must be protected with appropriate abuse controls before live use.
5. Configure the Poketo dashboard webhook URL as `https://<project-ref>.supabase.co/functions/v1/poketo-webhook`.

## Important sandbox limitation

The current ASRIVA TRAVEL storefront still uses mock trip inventory and client-calculated prices. The invoice function validates the amount format and pins it to the unique booking reference, but it cannot independently prove the fare. Keep the Poketo key in sandbox until trip inventory and pricing are moved to trusted server-side data. Do not switch to a live key yet.
