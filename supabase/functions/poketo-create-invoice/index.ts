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
    const poketoKey = Deno.env.get("POKETO_SECRET_KEY") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const appBaseUrl = Deno.env.get("APP_BASE_URL") ?? "";
    if (!poketoKey.startsWith("sk_test_")) return json({ error: "sandbox_key_required" }, 500);
    if (!supabaseUrl || !serviceRoleKey || !appBaseUrl.startsWith("https://")) {
      return json({ error: "server_configuration_error" }, 500);
    }

    const input = await req.json();
    const bookingRef = String(input.bookingRef ?? "").trim().toUpperCase();
    const amount = Number(input.amount);
    const customer = input.customer ?? {};
    const orderData = input.orderData ?? {};

    if (!/^[A-Z0-9._:-]{1,64}$/.test(bookingRef)) return json({ error: "invalid_booking_reference" }, 400);
    if (!Number.isSafeInteger(amount) || amount < 10000) return json({ error: "invalid_amount" }, 400);
    const name = String(customer.name ?? "").trim().slice(0, 120);
    const email = String(customer.email ?? "").trim().toLowerCase().slice(0, 254);
    const phone = String(customer.phone ?? "").trim().slice(0, 32);
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "invalid_customer" }, 400);

    const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const safeOrderData = {
      tripId: String(orderData.tripId ?? "").slice(0, 80),
      operator: String(orderData.operator ?? "").slice(0, 120),
      origin: String(orderData.origin ?? "").slice(0, 120),
      destination: String(orderData.destination ?? "").slice(0, 120),
      departureDate: String(orderData.departureDate ?? "").slice(0, 20),
      passengerCount: Math.max(1, Math.min(20, Number(orderData.passengerCount) || 1)),
    };

    const { data: existing, error: lookupError } = await db
      .from("asriva_orders")
      .select("booking_ref, amount, customer_email, poketo_invoice_id, poketo_payment_url, status")
      .eq("booking_ref", bookingRef)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (existing && (existing.amount !== amount || existing.customer_email !== email)) {
      return json({ error: "booking_reference_conflict" }, 409);
    }
    if (existing?.poketo_payment_url && existing.status === "PENDING") {
      return json({ bookingRef, paymentUrl: existing.poketo_payment_url, invoiceId: existing.poketo_invoice_id, reused: true });
    }
    if (existing && existing.status !== "PENDING") return json({ error: "order_not_payable", status: existing.status }, 409);

    if (!existing) {
      const { error: insertError } = await db.from("asriva_orders").insert({
        booking_ref: bookingRef, amount, customer_name: name, customer_email: email,
        customer_phone: phone || null, order_data: safeOrderData, poketo_environment: "sandbox",
      });
      if (insertError && insertError.code !== "23505") throw insertError;
    }

    const invoiceResponse = await fetch("https://poketo.id/api/v1/invoices", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${poketoKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `asriva-${bookingRef}`,
      },
      body: JSON.stringify({
        referenceId: bookingRef,
        amount,
        title: `ASRIVA TRAVEL - ${bookingRef}`,
        description: `Pembayaran tiket perjalanan ${safeOrderData.origin} ke ${safeOrderData.destination}`,
        customer: { name, email, phone: phone || undefined },
        items: [{ name: `Tiket perjalanan ${safeOrderData.origin} - ${safeOrderData.destination}`, quantity: 1, price: amount }],
        expiresInMinutes: 900,
        redirectUrl: `${appBaseUrl.replace(/\/$/, "")}/?poketo=return&bookingRef=${encodeURIComponent(bookingRef)}`,
        metadata: { bookingRef, source: "asriva-travel" },
      }),
    });
    const invoiceBody = await invoiceResponse.json();
    if (!invoiceResponse.ok || invoiceBody.error) {
      return json({ error: invoiceBody.error?.code ?? "poketo_invoice_failed", message: invoiceBody.error?.message ?? "Invoice creation failed" }, invoiceResponse.status >= 400 ? invoiceResponse.status : 502);
    }

    const invoice = invoiceBody.data;
    if (!invoice?.id || !invoice?.paymentUrl) return json({ error: "invalid_poketo_response" }, 502);
    const { error: updateError } = await db.from("asriva_orders").update({
      poketo_invoice_id: invoice.id, poketo_payment_url: invoice.paymentUrl, updated_at: new Date().toISOString(),
    }).eq("booking_ref", bookingRef);
    if (updateError) throw updateError;

    return json({ bookingRef, invoiceId: invoice.id, paymentUrl: invoice.paymentUrl, status: invoice.status });
  } catch (error) {
    console.error("poketo-create-invoice error", error);
    return json({ error: "internal_error" }, 500);
  }
});
