
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYPAL-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const webhookData = await req.json();
    logStep("Webhook data received", { eventType: webhookData.event_type });

    // Verify webhook signature (implement according to PayPal docs)
    // TODO: Add webhook signature verification for security

    // Handle different PayPal webhook events
    switch (webhookData.event_type) {
      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(supabaseClient, webhookData);
        break;
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(supabaseClient, webhookData);
        break;
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(supabaseClient, webhookData);
        break;
      default:
        logStep("Unhandled webhook event", { eventType: webhookData.event_type });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handlePaymentCompleted(supabaseClient: any, webhookData: any) {
  logStep("Processing payment completion");
  
  // Extract user info from PayPal data
  const paymentData = webhookData.resource;
  
  // Update user subscription status
  // TODO: Map PayPal payment to user and plan based on your button configuration
  
  logStep("Payment processed successfully");
}

async function handleSubscriptionActivated(supabaseClient: any, webhookData: any) {
  logStep("Processing subscription activation");
  
  const subscriptionData = webhookData.resource;
  
  // Update user subscription in database
  // TODO: Implement subscription activation logic
  
  logStep("Subscription activated successfully");
}

async function handleSubscriptionCancelled(supabaseClient: any, webhookData: any) {
  logStep("Processing subscription cancellation");
  
  const subscriptionData = webhookData.resource;
  
  // Update user subscription status to cancelled
  // TODO: Implement subscription cancellation logic
  
  logStep("Subscription cancelled successfully");
}
