import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const input = await req.json();
    const referenceId = String(input?.bookingRef ?? "").trim();
    const email = String(input?.email ?? "").trim().toLowerCase();
    if (!/^[A-Za-z0-9._:-]{1,64}$/.test(referenceId) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "invalid_lookup" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const poketoKey = Deno.env.get("POKETO_SECRET_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey || !/^(sk_test_|sk_live_)/.test(poketoKey)) {
      return json({ error: "server_configuration_error" }, 500);
    }
    const environment = poketoKey.startsWith("sk_test_") ? "sandbox" : "live";
    const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const { data, error } = await db.from("invoices")
      .select("reference_id,status,amount,currency,paid_at,expires_at,payment_url,customer")
      .eq("environment", environment)
      .eq("reference_id", referenceId)
      .maybeSingle();
    if (error) throw error;
    if (!data || String(data.customer?.email ?? "").trim().toLowerCase() !== email) {
      return json({ error: "invoice_not_found" }, 404);
    }

    return json({
      referenceId: data.reference_id,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      paidAt: data.paid_at,
      expiresAt: data.expires_at,
      paymentUrl: data.payment_url,
    });
  } catch (error) {
    console.error("poketo-order-status", error instanceof Error ? error.message : "unknown error");
    return json({ error: "internal_error" }, 500);
  }
});
