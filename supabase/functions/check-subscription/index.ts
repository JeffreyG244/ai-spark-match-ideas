
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
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

    // Check user subscription
    const { data: subscription, error: subError } = await supabaseClient
      .from('user_subscriptions')
      .select(`
        *,
        membership_plans:plan_id (
          name,
          monthly_price,
          features
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      logStep("Subscription check error", { error: subError });
      throw subError;
    }

    if (!subscription) {
      logStep("No subscription found, returning free plan");
      return new Response(JSON.stringify({
        subscribed: false,
        plan_type: 'free',
        status: null,
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const isActive = subscription.status === 'active' && 
                    subscription.current_period_end && 
                    new Date(subscription.current_period_end) > new Date();

    let planType = 'free';
    if (isActive && subscription.membership_plans) {
      planType = subscription.membership_plans.name.toLowerCase();
    }

    logStep("Subscription status", { 
      subscribed: isActive, 
      planType, 
      status: subscription.status,
      endDate: subscription.current_period_end 
    });

    return new Response(JSON.stringify({
      subscribed: isActive,
      plan_type: planType,
      status: subscription.status,
      subscription_end: subscription.current_period_end
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ 
      error: errorMessage,
      subscribed: false,
      plan_type: 'free'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
