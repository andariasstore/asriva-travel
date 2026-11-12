import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

type JsonObject = Record<string, unknown>;
const isObject = (value: unknown): value is JsonObject =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function stable(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(stable).join(",") + "]";
  if (isObject(value)) return "{" + Object.keys(value).sort().map((key) => JSON.stringify(key) + ":" + stable(value[key])).join(",") + "}";
  return JSON.stringify(value);
}

function validateAndBuildPayload(input: unknown): { payload?: JsonObject; error?: string } {
  if (!isObject(input)) return { error: "invalid_request_body" };

  const allowed = new Set([
    "referenceId", "amount", "title", "description", "customer", "items",
    "expiresInMinutes", "redirectUrl", "metadata", "merchantName",
  ]);
  for (const key of Object.keys(input)) {
    if (!allowed.has(key)) return { error: "unsupported_field:" + key };
  }

  const referenceId = input.referenceId;
  if (typeof referenceId !== "string" || !/^[A-Za-z0-9._:-]{1,64}$/.test(referenceId)) {
    return { error: "invalid_referenceId" };
  }

  const amount = input.amount;
  if (!Number.isSafeInteger(amount) || (amount as number) < 10000) return { error: "invalid_amount" };

  const payload: JsonObject = { referenceId, amount };

  for (const key of ["title", "description", "merchantName"] as const) {
    const value = input[key];
    if (value !== undefined) {
      if (typeof value !== "string") return { error: "invalid_" + key };
      payload[key] = value;
    }
  }

  if (input.customer !== undefined) {
    if (!isObject(input.customer)) return { error: "invalid_customer" };
    const customer: JsonObject = {};
    for (const key of ["name", "email", "phone"] as const) {
      const value = input.customer[key];
      if (value !== undefined && value !== null) {
        if (typeof value !== "string") return { error: "invalid_customer_" + key };
        customer[key] = value;
      }
    }
    for (const key of Object.keys(input.customer)) {
      if (!["name", "email", "phone"].includes(key)) return { error: "unsupported_customer_field:" + key };
    }
    payload.customer = customer;
  }

  if (input.items !== undefined) {
    if (!Array.isArray(input.items) || input.items.length > 50) return { error: "invalid_items" };
    let total = 0;
    const items: JsonObject[] = [];
    for (const item of input.items) {
      if (!isObject(item) || typeof item.name !== "string" ||
          !Number.isSafeInteger(item.quantity) || (item.quantity as number) < 1 ||
          !Number.isSafeInteger(item.price) || (item.price as number) < 0) {
        return { error: "invalid_item" };
      }
      for (const key of Object.keys(item)) {
        if (!["name", "quantity", "price"].includes(key)) return { error: "unsupported_item_field:" + key };
      }
      total += (item.quantity as number) * (item.price as number);
      if (!Number.isSafeInteger(total)) return { error: "invalid_items_total" };
      items.push({ name: item.name, quantity: item.quantity, price: item.price });
    }
    if (total !== amount) return { error: "items_total_must_equal_amount" };
    payload.items = items;
  }

  if (input.expiresInMinutes !== undefined) {
    if (!Number.isInteger(input.expiresInMinutes) || (input.expiresInMinutes as number) < 5 ||
        (input.expiresInMinutes as number) > 43200) return { error: "invalid_expiresInMinutes" };
    payload.expiresInMinutes = input.expiresInMinutes;
  }

  if (input.redirectUrl !== undefined) {
    if (typeof input.redirectUrl !== "string") return { error: "invalid_redirectUrl" };
    try {
      if (new URL(input.redirectUrl).protocol !== "https:") return { error: "redirectUrl_must_be_https" };
    } catch {
      return { error: "invalid_redirectUrl" };
    }
    payload.redirectUrl = input.redirectUrl;
  }

  if (input.metadata !== undefined) {
    if (!isObject(input.metadata) || Object.keys(input.metadata).length > 20) return { error: "invalid_metadata" };
    for (const [key, value] of Object.entries(input.metadata)) {
      if (typeof value === "string" && value.length > 500) return { error: "metadata_string_too_long" };
      if (value !== null && !["string", "number", "boolean"].includes(typeof value)) return { error: "invalid_metadata_value" };
      if (typeof value === "number" && !Number.isFinite(value)) return { error: "invalid_metadata_value" };
    }
    if (new TextEncoder().encode(JSON.stringify(input.metadata)).length > 4096) return { error: "metadata_too_large" };
    payload.metadata = input.metadata;
  }

  return { payload };
}

function toInvoiceRow(environment: string, payload: JsonObject, invoice: JsonObject) {
  return {
    environment,
    reference_id: String(invoice.referenceId ?? payload.referenceId),
    poketo_invoice_id: String(invoice.id),
    creation_state: "created",
    status: invoice.status,
    amount: invoice.amount,
    currency: invoice.currency ?? "IDR",
    title: invoice.title ?? payload.title ?? null,
    description: invoice.description ?? payload.description ?? null,
    merchant_name: invoice.merchantName ?? payload.merchantName ?? null,
    customer: invoice.customer ?? payload.customer ?? null,
    items: invoice.items ?? payload.items ?? null,
    fees: invoice.fees ?? null,
    total_amount: invoice.totalAmount ?? null,
    payment_method: invoice.paymentMethod ?? null,
    payment_url: invoice.paymentUrl ?? null,
    redirect_url: invoice.redirectUrl ?? payload.redirectUrl ?? null,
    metadata: invoice.metadata ?? payload.metadata ?? {},
    expires_at: invoice.expiresAt ?? null,
    paid_at: invoice.paidAt ?? null,
    refunded_at: invoice.refundedAt ?? null,
    request_payload: payload,
    provider_payload: invoice,
    last_error_code: null,
    last_error_message: null,
    updated_at: new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: { code: "method_not_allowed", message: "Use POST." } }, 405);

  const parsed = validateAndBuildPayload(await req.json().catch(() => null));
  if (parsed.error || !parsed.payload) {
    return json({ error: { code: "invalid_request", message: parsed.error ?? "Invalid request body." } }, 400);
  }
  const payload = parsed.payload;
  const referenceId = String(payload.referenceId);

  const poketoKey = Deno.env.get("POKETO_SECRET_KEY") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceRoleKey || !/^(sk_test_|sk_live_)/.test(poketoKey)) {
    return json({ error: { code: "server_configuration_error", message: "Payment backend secrets are not configured." } }, 500);
  }
  const environment = poketoKey.startsWith("sk_test_") ? "sandbox" : "live";
  const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  try {
    let { data: local, error: lookupError } = await db.from("invoices")
      .select("*").eq("environment", environment).eq("reference_id", referenceId).maybeSingle();
    if (lookupError) throw lookupError;

    if (!local) {
      const { data: inserted, error: insertError } = await db.from("invoices")
        .insert({
          environment,
          reference_id: referenceId,
          amount: payload.amount,
          currency: "IDR",
          title: payload.title ?? null,
          description: payload.description ?? null,
          merchant_name: payload.merchantName ?? null,
          customer: payload.customer ?? null,
          items: payload.items ?? null,
          redirect_url: payload.redirectUrl ?? null,
          metadata: payload.metadata ?? {},
          request_payload: payload,
          creation_state: "creating",
          status: "pending",
        }).select("*").maybeSingle();

      if (insertError && insertError.code !== "23505") throw insertError;
      local = inserted;
      if (!local) {
        const retryLookup = await db.from("invoices").select("*")
          .eq("environment", environment).eq("reference_id", referenceId).maybeSingle();
        if (retryLookup.error) throw retryLookup.error;
        local = retryLookup.data;
      }
    }

    if (!local) throw new Error("invoice_row_unavailable");
    if (Number(local.amount) !== Number(payload.amount) || stable(local.request_payload) !== stable(payload)) {
      return json({ error: { code: "reference_id_conflict", message: "referenceId is already bound to a different invoice request." } }, 409);
    }

    if (local.provider_payload) {
      return json({ data: local.provider_payload, reused: true });
    }

    const base = "https://poketo.id/api/v1/invoices";
    const headers = { Authorization: `Bearer ${poketoKey}`, "Content-Type": "application/json" };

    // Recover an earlier request that may have timed out after Poketo created the invoice.
    const lookupResponse = await fetch(`${base}/${encodeURIComponent(referenceId)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${poketoKey}` },
      signal: AbortSignal.timeout(12000),
    });
    const lookupBody = await lookupResponse.json().catch(() => ({}));
    let invoice: JsonObject | null = null;

    if (lookupResponse.ok && isObject(lookupBody.data)) {
      invoice = lookupBody.data;
    } else if (!(lookupResponse.status === 404 && lookupBody.error?.code === "not_found")) {
      return json({ error: lookupBody.error ?? { code: "poketo_lookup_failed", message: "Unable to reconcile invoice by referenceId." } }, lookupResponse.status >= 400 ? lookupResponse.status : 502);
    }

    if (!invoice) {
      const createResponse = await fetch(base, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });
      const createBody = await createResponse.json().catch(() => ({}));
      if (!createResponse.ok || !isObject(createBody.data)) {
        const code = createBody.error?.code ?? "poketo_invoice_failed";
        const message = createBody.error?.message ?? "Poketo invoice creation failed.";
        await db.from("invoices").update({
          creation_state: createResponse.status >= 500 || createResponse.status === 409 ? "unknown" : "failed",
          last_error_code: code,
          last_error_message: message,
          updated_at: new Date().toISOString(),
        }).eq("environment", environment).eq("reference_id", referenceId);
        return json({ error: { code, message } }, createResponse.status >= 400 ? createResponse.status : 502);
      }
      invoice = createBody.data;
    }

    if (!invoice.id || invoice.referenceId !== referenceId || !["pending", "paid", "expired", "cancelled", "refunded"].includes(String(invoice.status))) {
      throw new Error("invalid_poketo_invoice_response");
    }

    const row = toInvoiceRow(environment, payload, invoice);
    const { error: updateError } = await db.from("invoices").update(row)
      .eq("environment", environment).eq("reference_id", referenceId);
    if (updateError) throw updateError;

    return json({ data: invoice, reused: Boolean(lookupResponse.ok) }, lookupResponse.ok ? 200 : 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected backend error";
    console.error("poketo-create-invoice", message);
    await db.from("invoices").update({
      creation_state: "unknown",
      last_error_code: "internal_error",
      last_error_message: message.slice(0, 500),
      updated_at: new Date().toISOString(),
    }).eq("environment", environment).eq("reference_id", referenceId);
    return json({ error: { code: "internal_error", message: "Unable to create or reconcile invoice." } }, 500);
  }
});
