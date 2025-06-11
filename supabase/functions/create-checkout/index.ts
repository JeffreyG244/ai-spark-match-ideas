
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    // Get and validate the Stripe key
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      logStep("ERROR: STRIPE_SECRET_KEY environment variable not found");
      return new Response(JSON.stringify({ 
        error: "Stripe configuration missing. Please contact support." 
      }), {
        headers: corsHeaders,
        status: 500,
      });
    }
    
    // Clean and validate the key format
    const cleanKey = stripeSecretKey.trim();
    logStep("Stripe key validation", { 
      keyExists: !!cleanKey,
      keyLength: cleanKey.length,
      keyPrefix: cleanKey.substring(0, 3),
      isValidFormat: cleanKey.startsWith('sk_')
    });
    
    if (!cleanKey.startsWith('sk_')) {
      logStep("ERROR: Invalid Stripe key format detected", { 
        actualPrefix: cleanKey.substring(0, 10),
        expectedPrefix: "sk_",
        keyLength: cleanKey.length
      });
      return new Response(JSON.stringify({ 
        error: "Invalid Stripe secret key format. Please check your Stripe configuration." 
      }), {
        headers: corsHeaders,
        status: 500,
      });
    }

    logStep("Stripe key validated successfully");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: "No authorization header provided" 
      }), {
        headers: corsHeaders,
        status: 401,
      });
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) {
      return new Response(JSON.stringify({ 
        error: "User not authenticated or email not available" 
      }), {
        headers: corsHeaders,
        status: 401,
      });
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      logStep("ERROR: Invalid request body", { error: error.message });
      return new Response(JSON.stringify({ 
        error: "Invalid request body. Expected JSON." 
      }), {
        headers: corsHeaders,
        status: 400,
      });
    }

    const { planType, billingCycle } = requestBody;
    logStep("Request data received", { planType, billingCycle });

    if (!planType || !billingCycle) {
      return new Response(JSON.stringify({ 
        error: "Missing planType or billingCycle" 
      }), {
        headers: corsHeaders,
        status: 400,
      });
    }

    // Validate plan types
    if (!['plus', 'premium'].includes(planType.toLowerCase())) {
      return new Response(JSON.stringify({ 
        error: "Invalid plan type. Must be 'plus' or 'premium'" 
      }), {
        headers: corsHeaders,
        status: 400,
      });
    }

    // Validate billing cycles
    if (!['monthly', 'yearly'].includes(billingCycle.toLowerCase())) {
      return new Response(JSON.stringify({ 
        error: "Invalid billing cycle. Must be 'monthly' or 'yearly'" 
      }), {
        headers: corsHeaders,
        status: 400,
      });
    }

    // Initialize Stripe with validated key
    let stripe;
    try {
      stripe = new Stripe(cleanKey, { 
        apiVersion: "2023-10-16",
        typescript: true
      });
      logStep("Stripe client initialized");
    } catch (error) {
      logStep("ERROR: Failed to initialize Stripe", { error: error.message });
      return new Response(JSON.stringify({ 
        error: "Failed to initialize payment system" 
      }), {
        headers: corsHeaders,
        status: 500,
      });
    }
    
    // Test Stripe connection by checking customer list
    let customers;
    try {
      customers = await stripe.customers.list({ email: user.email, limit: 1 });
      logStep("Stripe connection successful", { customersFound: customers.data.length });
    } catch (error) {
      logStep("ERROR: Stripe API call failed", { 
        error: error.message,
        type: error.type || 'unknown'
      });
      return new Response(JSON.stringify({ 
        error: `Stripe connection failed: ${error.message}` 
      }), {
        headers: corsHeaders,
        status: 500,
      });
    }

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      logStep("No existing customer found, will create new one in checkout");
    }

    // Define pricing in cents
    const prices = {
      plus: {
        monthly: 2499, // $24.99
        yearly: 23990  // $239.90
      },
      premium: {
        monthly: 4999, // $49.99
        yearly: 47990  // $479.90
      }
    };

    const planTypeLower = planType.toLowerCase() as 'plus' | 'premium';
    const billingCycleLower = billingCycle.toLowerCase() as 'monthly' | 'yearly';
    const amount = prices[planTypeLower][billingCycleLower];
    const interval = billingCycleLower === 'yearly' ? 'year' : 'month';
    
    logStep("Pricing calculated", { 
      planType: planTypeLower, 
      billingCycle: billingCycleLower, 
      amount, 
      interval 
    });

    // Get the origin for redirect URLs
    const origin = req.headers.get("origin") || "https://id-preview--016dc165-a1fe-4ce7-adef-dbf00d3eba8a.lovable.app";
    
    logStep("Creating checkout session", { origin, customerId: customerId || "new" });

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { 
                name: `Luvlang ${planTypeLower.charAt(0).toUpperCase() + planTypeLower.slice(1)} Plan`,
                description: `Luvlang ${planTypeLower.charAt(0).toUpperCase() + planTypeLower.slice(1)} subscription - ${billingCycleLower} billing`
              },
              unit_amount: amount,
              recurring: { interval: interval as 'month' | 'year' },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${origin}/membership?success=true&plan=${planTypeLower}`,
        cancel_url: `${origin}/membership?canceled=true`,
        metadata: {
          user_id: user.id,
          plan_type: planTypeLower,
          billing_cycle: billingCycleLower
        }
      });

      logStep("Checkout session created successfully", { 
        sessionId: session.id,
        url: session.url,
        mode: session.mode
      });
    } catch (error) {
      logStep("ERROR: Failed to create checkout session", { error: error.message });
      return new Response(JSON.stringify({ 
        error: `Failed to create checkout session: ${error.message}` 
      }), {
        headers: corsHeaders,
        status: 500,
      });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: corsHeaders,
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});
