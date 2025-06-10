
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
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
      throw new Error("Stripe configuration missing. Please contact support.");
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
      throw new Error("Invalid Stripe secret key format. Please check your Stripe configuration.");
    }

    logStep("Stripe key validated successfully");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { planType, billingCycle } = await req.json();
    logStep("Request data received", { planType, billingCycle });

    if (!planType || !billingCycle) {
      throw new Error("Missing planType or billingCycle");
    }

    // Validate plan types
    if (!['plus', 'premium'].includes(planType.toLowerCase())) {
      throw new Error("Invalid plan type. Must be 'plus' or 'premium'");
    }

    // Validate billing cycles
    if (!['monthly', 'yearly'].includes(billingCycle.toLowerCase())) {
      throw new Error("Invalid billing cycle. Must be 'monthly' or 'yearly'");
    }

    // Initialize Stripe with validated key
    const stripe = new Stripe(cleanKey, { 
      apiVersion: "2023-10-16",
      typescript: true
    });
    
    logStep("Stripe client initialized");
    
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
      throw new Error(`Stripe connection failed: ${error.message}`);
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

    const session = await stripe.checkout.sessions.create({
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

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
