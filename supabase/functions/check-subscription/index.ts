
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
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    if (!stripeKey.startsWith('sk_')) {
      throw new Error("Invalid STRIPE_SECRET_KEY format - should start with 'sk_'");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("Authentication failed", { error: userError.message });
      throw new Error(`Authentication error: ${userError.message}`);
    }
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2023-10-16",
      typescript: true
    });
    
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      await supabaseClient.from("user_subscriptions").upsert({
        user_id: user.id,
        plan_id: 1, // Default to Free plan
        status: 'inactive',
        current_period_end: null,
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({ 
        subscribed: false, 
        plan_type: 'free',
        status: 'inactive'
      }), {
        headers: corsHeaders,
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let planType = 'free';
    let subscriptionEnd = null;
    let stripeSubscriptionId = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      stripeSubscriptionId = subscription.id;
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      // Determine plan type from price
      const price = subscription.items.data[0].price;
      const amount = price.unit_amount || 0;
      
      if (amount === 2499 || amount === 23990) {
        planType = 'plus';
      } else if (amount === 4999 || amount === 47990) {
        planType = 'premium';
      }
      
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        endDate: subscriptionEnd,
        planType,
        amount 
      });
    } else {
      logStep("No active subscription found");
    }

    // Map plan type to plan ID
    const planIdMap = { free: 1, plus: 2, premium: 3 };
    const planId = planIdMap[planType as keyof typeof planIdMap] || 1;

    await supabaseClient.from("user_subscriptions").upsert({
      user_id: user.id,
      plan_id: planId,
      status: hasActiveSub ? 'active' : 'inactive',
      current_period_end: subscriptionEnd,
      stripe_subscription_id: stripeSubscriptionId,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    logStep("Updated database with subscription info", { 
      subscribed: hasActiveSub, 
      planType,
      planId 
    });

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan_type: planType,
      subscription_end: subscriptionEnd,
      status: hasActiveSub ? 'active' : 'inactive'
    }), {
      headers: corsHeaders,
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ 
      error: errorMessage,
      subscribed: false,
      plan_type: 'free',
      status: 'error'
    }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});
