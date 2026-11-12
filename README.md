# ASRIVA TRAVEL — Poketo Backend

Supabase backend integration for Poketo invoices, based on the official API documentation at https://poketo.id/docs.

## Architecture

- PostgreSQL storage: one Poketo integration table, `public.invoices`.
- `poketo-create-invoice`: creates or reconciles an invoice using the merchant's `referenceId`.
- `poketo-webhook`: verifies Poketo's signed webhook and updates the same invoice row.
- `poketo-order-status`: retained compatibility endpoint; reads from `public.invoices`.

No separate order, payment, or webhook-event table is used by this integration.

## Idempotency

`referenceId` is required by this application and is the primary invoice deduplication key. The database enforces uniqueness on `(environment, reference_id)`, matching Poketo's documented uniqueness scope per project and environment.

Before creating an invoice, the Edge Function checks the local row and reconciles with `GET /v1/invoices/:id` using the same reference ID. If the earlier create request timed out after Poketo accepted it, the existing invoice is recovered instead of creating another one. No `Idempotency-Key` is required for this flow.

## Poketo request

The create function accepts the documented invoice fields:

- `referenceId` (required by this application)
- `amount` (required; integer, minimum 10000)
- `title`, `description`
- `customer: { name, email, phone }`
- `items: [{ name, quantity, price }]` (maximum 50; item totals must equal amount)
- `expiresInMinutes` (5–43200; Poketo default 1440)
- `redirectUrl` (HTTPS)
- `metadata` (maximum 20 keys and 4 KB)
- `merchantName`

Connect-only `applicationFeeAmount` is not enabled in this integration.

## Edge Function secrets

Configure these secrets in Supabase Edge Functions:

- `POKETO_SECRET_KEY`: Poketo project key (`sk_test_...` for sandbox or `sk_live_...` for live).
- `POKETO_WEBHOOK_SECRET`: Poketo webhook signing secret (`whsec_...`).

Supabase runtime variables `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are used server-side only. Never expose the service-role key or Poketo secret in the browser.

## Security and webhook handling

- `poketo-create-invoice` requires a valid Supabase JWT.
- `poketo-webhook` does not require a Supabase JWT; it verifies `Poketo-Signature` against the exact raw request body using HMAC-SHA256.
- Webhook timestamps outside the 5-minute tolerance are rejected.
- `Poketo-Event-Id` is checked against the event body and deduplicated atomically in the invoice row.
- Payment status is updated from signed invoice webhooks, not from the buyer's redirect.

## Local source

- `supabase/migrations/20261112151440_poketo_single_invoice_backend.sql`
- `supabase/functions/poketo-create-invoice/index.ts`
- `supabase/functions/poketo-webhook/index.ts`
- `supabase/functions/poketo-order-status/index.ts`
