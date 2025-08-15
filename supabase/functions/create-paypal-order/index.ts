
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
    if (userError) {
      logStep("Auth error details", { error: userError.message, token: token.substring(0, 20) + "..." });
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    
    // For anonymous users, use user.id as email fallback
    const userEmail = user.email || `${user.id}@anonymous.luvlang.org`;
    logStep("User authenticated", { userId: user.id, email: userEmail, isAnonymous: !user.email });

    const { planType, billingCycle } = await req.json();
    logStep("Request data", { planType, billingCycle });

    // Get plan details from database
    const { data: plan, error: planError } = await supabaseClient
      .from('membership_plans')
      .select('*')
      .eq('name', planType.charAt(0).toUpperCase() + planType.slice(1))
      .single();

    if (planError || !plan) {
      logStep("Plan fetch error", { error: planError });
      throw new Error('Invalid plan selected');
    }

    const amount = billingCycle === 'yearly' ? (plan.annual_price || plan.monthly_price * 12) : plan.monthly_price;
    logStep("Plan details", { planName: plan.name, amount, billingCycle });

    // Get PayPal credentials from Supabase secrets
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalClientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const isProduction = Deno.env.get("PAYPAL_ENVIRONMENT") === "production";
    const paypalBaseUrl = isProduction ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

    if (!paypalClientId || !paypalClientSecret) {
      logStep("PayPal credentials missing", { 
        hasClientId: !!paypalClientId, 
        hasClientSecret: !!paypalClientSecret 
      });
      throw new Error("PayPal credentials not configured. Please contact support.");
    }

    logStep("PayPal config", { 
      clientId: paypalClientId.substring(0, 8) + "...", 
      environment: isProduction ? "production" : "sandbox",
      baseUrl: paypalBaseUrl
    });

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
      const errorText = await authResponse.text();
      logStep("PayPal auth failed", { status: authResponse.status, error: errorText });
      throw new Error(`Failed to authenticate with PayPal: ${authResponse.status}`);
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
        return_url: `${req.headers.get("origin") || 'http://localhost:3000'}/membership?success=true`,
        cancel_url: `${req.headers.get("origin") || 'http://localhost:3000'}/membership?cancelled=true`,
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
      logStep("PayPal order creation failed", { status: orderResponse.status, error: errorData });
      throw new Error(`Failed to create PayPal order: ${orderResponse.status}`);
    }

    const order = await orderResponse.json();
    logStep("PayPal order created", { orderId: order.id, amount: amount });

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
