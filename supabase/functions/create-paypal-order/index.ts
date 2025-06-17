
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYPAL-ORDER] ${step}${detailsStr}`);
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
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { planType, billingCycle } = await req.json();
    logStep("Request data", { planType, billingCycle });

    // Get plan details from database
    const { data: plan, error: planError } = await supabaseClient
      .from('membership_plans')
      .select('*')
      .eq('name', planType.charAt(0).toUpperCase() + planType.slice(1))
      .single();

    if (planError || !plan) {
      throw new Error('Invalid plan selected');
    }

    const amount = billingCycle === 'yearly' ? (plan.annual_price || plan.monthly_price * 12) : plan.monthly_price;
    logStep("Plan details", { planName: plan.name, amount, billingCycle });

    // Use sandbox for testing
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

    if (!authResponse.ok) {
      throw new Error("Failed to get PayPal access token");
    }

    const authData = await authResponse.json();
    logStep("PayPal access token obtained");

    // Create PayPal order
    const orderData = {
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: "USD",
          value: amount.toFixed(2)
        },
        description: `${plan.name} Plan - ${billingCycle === 'yearly' ? 'Annual' : 'Monthly'} Subscription`
      }],
      application_context: {
        return_url: `${req.headers.get("origin")}/membership?success=true`,
        cancel_url: `${req.headers.get("origin")}/membership?cancelled=true`,
        brand_name: "Luvlang",
        user_action: "PAY_NOW"
      }
    };

    const orderResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authData.access_token}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.text();
      logStep("PayPal order creation failed", { error: errorData });
      throw new Error("Failed to create PayPal order");
    }

    const order = await orderResponse.json();
    logStep("PayPal order created", { orderId: order.id });

    return new Response(JSON.stringify({ 
      orderID: order.id,
      amount: amount
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
