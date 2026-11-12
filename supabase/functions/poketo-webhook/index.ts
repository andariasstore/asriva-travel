import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const hex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
const safeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

async function verifySignature(rawBody: string, header: string, secret: string) {
  const fields = Object.fromEntries(header.split(",").map((part) => {
    const index = part.indexOf("=");
    return index < 0 ? [part.trim(), ""] : [part.slice(0, index).trim(), part.slice(index + 1).trim()];
  }));
  const timestamp = fields.t ?? "";
  const signature = fields.v1 ?? "";
  if (!/^\d{10,}$/.test(timestamp) || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 300) return false;

  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signed = new TextEncoder().encode(`${timestamp}.${rawBody}`);
  const expected = hex(new Uint8Array(await crypto.subtle.sign("HMAC", key, signed)));
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
    if (!headerEventId || headerEventId !== event.id || !event.type || headerEventType !== event.type) {
      return new Response("invalid event headers", { status: 400 });
    }
    if (event.type === "ping") return new Response("ok", { status: 200 });
    if (!["invoice.paid", "invoice.expired", "invoice.cancelled", "invoice.refunded"].includes(event.type)) {
      return new Response("ignored", { status: 200 });
    }

    const invoice = event.data;
    if (!invoice?.referenceId || !invoice?.id) return new Response("invalid invoice event", { status: 400 });

    const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const { data, error } = await db.rpc("process_asriva_poketo_event", {
      p_event_id: headerEventId,
      p_event_type: event.type,
      p_reference_id: invoice.referenceId,
      p_invoice_id: invoice.id,
      p_payload: event,
    });
    if (error) throw error;
    return Response.json({ received: true, ...data }, { status: 200 });
  } catch (error) {
    console.error("poketo-webhook error", error);
    return new Response("webhook processing failed", { status: 500 });
  }
});
