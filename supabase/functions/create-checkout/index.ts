
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

    // Get and clean the Stripe key
    const rawStripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!rawStripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found");
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    
    // Trim whitespace from the key
    const stripeKey = rawStripeKey.trim();
    
    if (!stripeKey.startsWith('sk_')) {
      logStep("ERROR: Invalid Stripe key format", { 
        keyStart: stripeKey.substring(0, 7),
        hasLeadingSpace: rawStripeKey !== stripeKey,
        originalLength: rawStripeKey.length,
        trimmedLength: stripeKey.length
      });
      throw new Error("Invalid Stripe secret key format. Key should start with 'sk_'");
    }
    
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { planType, billingCycle } = await req.json();
    logStep("Request data", { planType, billingCycle });

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

    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2023-10-16",
      typescript: true
    });
    
    // Check if customer exists
    let customers;
    try {
      customers = await stripe.customers.list({ email: user.email, limit: 1 });
    } catch (error) {
      logStep("ERROR: Failed to list customers", { error: error.message });
      throw new Error("Failed to connect to Stripe. Please check your API key.");
    }

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
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
    
    logStep("Pricing calculated", { planType: planTypeLower, billingCycle: billingCycleLower, amount, interval });

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
      success_url: `${req.headers.get("origin")}/membership?success=true&plan=${planTypeLower}`,
      cancel_url: `${req.headers.get("origin")}/membership?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_type: planTypeLower,
        billing_cycle: billingCycleLower
      }
    });

    logStep("Checkout session created", { sessionId: session.id });

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
