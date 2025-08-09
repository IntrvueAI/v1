
/**
 * Supabase Edge Function: verify-payment
 * Verifies a Stripe Checkout Session, marks the order as paid, and credits the user's balance.
 */
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "npm:stripe@13.11.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

function cors(res: Response) {
  const headers = new Headers(res.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Headers", "authorization, x-client-info, apikey, content-type");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  return new Response(res.body, { status: res.status, headers });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return cors(new Response(null, { status: 204 }));
  }

  try {
    if (req.method !== "POST") {
      return cors(new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 }));
    }

    const { session_id } = await req.json().catch(() => ({}));
    if (!session_id) {
      return cors(new Response(JSON.stringify({ error: "Missing session_id" }), { status: 400 }));
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session) {
      return cors(new Response(JSON.stringify({ error: "Session not found" }), { status: 404 }));
    }

    if (session.payment_status !== "paid") {
      return cors(new Response(JSON.stringify({ error: "Payment not completed" }), { status: 400 }));
    }

    const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find order
    const { data: order, error: orderErr } = await service
      .from("orders")
      .select("*")
      .eq("stripe_session_id", session.id)
      .single();

    if (orderErr || !order) {
      return cors(new Response(JSON.stringify({ error: "Order not found" }), { status: 404 }));
    }

    // Idempotency: if already paid, return current balance
    if (order.status === "paid") {
      // Get balance to display
      const { data: balanceRow } = await service
        .from("credits_balance")
        .select("credits")
        .eq("user_id", order.user_id)
        .maybeSingle();
      return cors(
        new Response(JSON.stringify({ ok: true, alreadyProcessed: true, credits_added: 0, balance: balanceRow?.credits ?? 0 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    }

    // Mark order as paid
    await service.from("orders").update({ status: "paid" }).eq("id", order.id);

    // Update credits balance (increment or insert)
    let newBalance = 0;
    const { data: existing } = await service
      .from("credits_balance")
      .select("credits")
      .eq("user_id", order.user_id)
      .maybeSingle();

    if (existing) {
      const updated = existing.credits + (order.credits_purchased ?? 0);
      await service.from("credits_balance").update({ credits: updated }).eq("user_id", order.user_id);
      newBalance = updated;
    } else {
      await service.from("credits_balance").insert({
        user_id: order.user_id,
        credits: order.credits_purchased ?? 0,
      });
      newBalance = order.credits_purchased ?? 0;
    }

    return cors(
      new Response(JSON.stringify({ ok: true, credits_added: order.credits_purchased ?? 0, balance: newBalance }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  } catch (e) {
    console.error("verify-payment error", e);
    return cors(new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 }));
  }
});
