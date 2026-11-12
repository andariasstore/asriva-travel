import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const hex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index++) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

async function verifySignature(rawBody: string, header: string, secret: string): Promise<boolean> {
  const parts = header.split(",");
  const values: Record<string, string> = {};
  for (const part of parts) {
    const separator = part.indexOf("=");
    if (separator > 0) values[part.slice(0, separator).trim()] = part.slice(separator + 1).trim();
  }

  const timestamp = values.t ?? "";
  const signature = values.v1 ?? "";
  if (!/^\d{10,}$/.test(timestamp) || !/^[a-f0-9]{64}$/i.test(signature)) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signedPayload = new TextEncoder().encode(`${timestamp}.${rawBody}`);
  const expected = hex(new Uint8Array(await crypto.subtle.sign("HMAC", key, signedPayload)));
  return safeEqual(expected.toLowerCase(), signature.toLowerCase());
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  try {
    const webhookSecret = Deno.env.get("POKETO_WEBHOOK_SECRET") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!webhookSecret.startsWith("whsec_") || !supabaseUrl || !serviceRoleKey) {
      return new Response("server configuration error", { status: 500 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("Poketo-Signature") ?? "";
    if (!(await verifySignature(rawBody, signature, webhookSecret))) {
      return new Response("invalid signature", { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const headerEventId = req.headers.get("Poketo-Event-Id") ?? "";
    const headerEventType = req.headers.get("Poketo-Event") ?? "";
    if (!event || typeof event !== "object" || event.id !== headerEventId ||
        typeof event.type !== "string" || event.type !== headerEventType) {
      return new Response("invalid event headers", { status: 400 });
    }

    if (event.type === "ping") return new Response("ok", { status: 200 });

    const supportedEvents = new Set([
      "invoice.paid",
      "invoice.expired",
      "invoice.cancelled",
      "invoice.refunded",
    ]);
    if (!supportedEvents.has(event.type)) return new Response("ignored", { status: 200 });

    const invoice = event.data;
    const environment = event.environment;
    if (!invoice || typeof invoice !== "object" ||
        typeof invoice.referenceId !== "string" || typeof invoice.id !== "string" ||
        !["sandbox", "live"].includes(environment) ||
        (invoice.environment && invoice.environment !== environment)) {
      return new Response("invalid invoice event", { status: 400 });
    }

    const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const { data, error } = await db.rpc("process_poketo_webhook", {
      p_event_id: headerEventId,
      p_event_type: event.type,
      p_environment: environment,
      p_reference_id: invoice.referenceId,
      p_invoice_id: invoice.id,
      p_payload: event,
    });

    if (error) throw error;
    if (data?.notFound || data?.invoiceMismatch) {
      console.error("poketo-webhook invoice reconciliation failed", {
        eventId: headerEventId,
        referenceId: invoice.referenceId,
        invoiceId: invoice.id,
      });
      return new Response("invoice reconciliation failed", { status: 500 });
    }

    return Response.json({ received: true, ...data }, { status: 200 });
  } catch (error) {
    console.error("poketo-webhook", error instanceof Error ? error.message : "unknown error");
    return new Response("webhook processing failed", { status: 500 });
  }
});
