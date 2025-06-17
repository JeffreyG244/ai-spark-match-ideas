
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CAPTURE-PAYPAL-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { orderID, planType, billingCycle } = await req.json();
    logStep("Capturing payment", { orderID, planType, billingCycle });

    // PayPal configuration
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalClientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const isProduction = Deno.env.get("PAYPAL_ENVIRONMENT") === "production";
    const paypalBaseUrl = isProduction ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

    if (!paypalClientId || !paypalClientSecret) {
      throw new Error("PayPal credentials not configured");
    }

    // Get PayPal access token
    const authResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Language": "en_US",
        "Authorization": `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const authData = await authResponse.json();

    // Capture the payment
    const captureResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authData.access_token}`,
      },
    });

    if (!captureResponse.ok) {
      throw new Error("Failed to capture PayPal payment");
    }

    const captureData = await captureResponse.json();
    logStep("Payment captured", { captureData });

    // Get plan details
    const { data: plan, error: planError } = await supabaseClient
      .from('membership_plans')
      .select('*')
      .eq('name', planType.charAt(0).toUpperCase() + planType.slice(1))
      .single();

    if (planError || !plan) {
      throw new Error('Plan not found');
    }

    const amount = billingCycle === 'yearly' ? (plan.annual_price || plan.monthly_price * 12) : plan.monthly_price;
    const payerInfo = captureData.payment_source?.paypal || captureData.payer;
    
    // Record the payment
    const { error: paymentError } = await supabaseClient
      .from('paypal_payments')
      .insert({
        user_id: user.id,
        paypal_order_id: orderID,
        paypal_payer_id: payerInfo?.payer_id || payerInfo?.account_id,
        amount: amount,
        currency: 'USD',
        status: captureData.status
      });

    if (paymentError) {
      logStep("Payment record error", { error: paymentError });
    }

    // Update user subscription
    const subscriptionEndDate = new Date();
    if (billingCycle === 'yearly') {
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
    } else {
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    }

    const { error: subscriptionError } = await supabaseClient
      .from('user_subscriptions')
      .upsert({
        user_id: user.id,
        plan_id: plan.id,
        status: 'active',
        current_period_end: subscriptionEndDate.toISOString(),
        paypal_subscription_id: orderID,
        paypal_payer_id: payerInfo?.payer_id || payerInfo?.account_id,
        payment_amount: amount,
        payment_currency: 'USD',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (subscriptionError) {
      logStep("Subscription update error", { error: subscriptionError });
      throw new Error('Failed to update subscription');
    }

    logStep("Subscription updated successfully");

    return new Response(JSON.stringify({ 
      success: true,
      subscription: {
        plan_id: plan.id,
        status: 'active',
        current_period_end: subscriptionEndDate.toISOString()
      }
    }), {
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
