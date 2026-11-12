import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  try {
    const { bookingRef, email } = await req.json();
    const ref = String(bookingRef ?? "").trim().toUpperCase();
    const normalizedEmail = String(email ?? "").trim().toLowerCase();
    if (!/^[A-Z0-9._:-]{1,64}$/.test(ref) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return json({ error: "invalid_lookup" }, 400);
    }
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });
    const { data, error } = await db.from("asriva_orders")
      .select("booking_ref,status,paid_at,amount")
      .eq("booking_ref", ref)
      .eq("customer_email", normalizedEmail)
      .maybeSingle();
    if (error) throw error;
    if (!data) return json({ error: "order_not_found" }, 404);
    return json({ bookingRef: data.booking_ref, status: data.status, paidAt: data.paid_at, amount: data.amount });
  } catch (error) {
    console.error("poketo-order-status error", error);
    return json({ error: "internal_error" }, 500);
  }
});
