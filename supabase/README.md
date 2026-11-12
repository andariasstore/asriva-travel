# Poketo payments (Supabase)

## Functions

- `poketo-create-invoice`: creates/reuses an order and a Poketo sandbox invoice, then returns `paymentUrl`.
- `poketo-webhook`: verifies the raw-body HMAC-SHA256 signature, enforces a five-minute timestamp tolerance, validates `Poketo-Event` and `Poketo-Event-Id`, and applies event deduplication plus order status transitions atomically.
- `poketo-order-status`: returns a limited order status only when both booking reference and customer email match. The storefront polls this endpoint after Poketo redirects the buyer back.

## Database

Apply `migrations/20261112000000_poketo_payments.sql`. Both tables have RLS enabled and no browser-role policies. Only Edge Functions using the service-role key can access them. The SQL RPC that processes webhook events is executable only by `service_role`.

## Secrets

Set these in Supabase Edge Function secrets (never commit real values):

- `POKETO_SECRET_KEY`: sandbox key beginning `sk_test_`.
- `POKETO_WEBHOOK_SECRET`: webhook signing secret beginning `whsec_`.
- `APP_BASE_URL`: public HTTPS origin for the storefront.

Supabase injects `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; do not add them to frontend variables.

For local development, copy `functions/.env.example` to `functions/.env` and keep that file untracked.

The browser needs only the public values in the root `.env.example`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## Deploy and configure

1. Link the correct Supabase project.
2. Apply the migration.
3. Set the three Edge Function secrets above.
4. Deploy all three functions. Their JWT verification is disabled because the webhook authenticates with Poketo HMAC and guest checkout/status are public endpoints; use additional abuse controls before a live launch.
5. Configure the Poketo dashboard webhook URL as `https://<project-ref>.supabase.co/functions/v1/poketo-webhook`.
6. Keep the Poketo key in sandbox until the fare is calculated from trusted server-side inventory.

## Sandbox simulation

After an invoice is created, simulate a successful payment using its Poketo invoice ID:

```bash
POKETO_SECRET_KEY=sk_test_... POKETO_INVOICE_ID=INV-PKT-... bash supabase/tests/simulate-poketo-invoice.sh
```

Poketo will deliver the same signed `invoice.paid` webhook used in production. Verify the order transitions to `PAID` in `asriva_orders` and that repeating the same event does not apply it twice.

## Important prototype limitation

The current ASRIVA TRAVEL storefront still uses mock trip inventory and client-calculated fares. The invoice function validates the amount format and pins it to the unique booking reference, but cannot independently prove the fare. This integration is sandbox-only until trip inventory and pricing move to trusted server-side data. Do not switch to a live key yet.
