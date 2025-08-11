
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use the direct webhook URL for testing
function getN8NWebhookUrl(): string {
  return 'https://luvlang.org/webhook-test/luvlang-match';
}

interface ProfileData {
  user_id: string;
  name: string;
  match_score: number;
  timestamp: string;
  event_type: string;
  data: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, event_type = 'profile_updated' } = await req.json();
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user data from users table
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', user_id)
      .maybeSingle();

    if (userError) {
      console.error('User fetch error:', userError);
      return new Response(
        JSON.stringify({ error: 'Database error', details: userError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get profile data from executive_dating_profiles if it exists
    const { data: profile } = await supabaseClient
      .from('executive_dating_profiles')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    // Use user data or create test data
    const userData = user || {
      id: user_id,
      first_name: 'Test',
      last_name: 'User',
      age: 30,
      city: 'San Francisco',
      state: 'CA',
      interests: ['Technology', 'Business'],
      bio: 'Test user for webhook testing'
    };

    console.log('User data found:', userData.first_name, userData.last_name);

    // Combine user data with profile data
    const combinedData = {
      user_id: user_id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      age: userData.age || profile?.age || 30,
      primary_location: profile?.primary_location || `${userData.city || 'San Francisco'}, ${userData.state || 'CA'}`,
      age_range_min: profile?.age_range_min || (userData.age_min || 25),
      age_range_max: profile?.age_range_max || (userData.age_max || 35),
      cultural_interests: profile?.cultural_interests || userData.cultural_interests || userData.interests || ['Technology', 'Business'],
      weekend_activities: profile?.weekend_activities || ['Networking', 'Reading'],
      sexual_orientation: profile?.sexual_orientation || ['Heterosexual'],
      deal_breakers: profile?.deal_breakers || userData.deal_breakers || [],
      bio: userData.bio || 'Professional seeking meaningful connections',
      industry: userData.industry,
      job_title: userData.job_title
    };

    // Prepare data for N8N webhook
    const webhookData: ProfileData = {
      user_id: user_id,
      name: `${combinedData.first_name} ${combinedData.last_name}`,
      match_score: 0.95,
      timestamp: new Date().toISOString(),
      event_type: event_type,
      data: {
        profile: combinedData,
        compatibility: {}, // Empty for now since table doesn't exist
        preferences: {
          age_range: [combinedData.age_range_min, combinedData.age_range_max],
          location: combinedData.primary_location,
          interests: combinedData.cultural_interests,
          sexual_orientation: combinedData.sexual_orientation,
          deal_breakers: combinedData.deal_breakers
        },
        user_metadata: {
          industry: combinedData.industry,
          job_title: combinedData.job_title,
          bio: combinedData.bio
        }
      }
    };

    // Get N8N webhook URL
    const N8N_WEBHOOK_URL = getN8NWebhookUrl();
    
    console.log('Sending to N8N webhook:', N8N_WEBHOOK_URL);
    console.log('Payload:', JSON.stringify(webhookData, null, 2));

    // Send to N8N webhook
    const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    if (!webhookResponse.ok) {
      console.error('N8N webhook failed:', webhookResponse.status, await webhookResponse.text());
      return new Response(
        JSON.stringify({ 
          error: 'Webhook failed', 
          status: webhookResponse.status 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const webhookResult = await webhookResponse.text();
    console.log('N8N webhook success:', webhookResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Profile data sent to N8N workflow',
        webhook_response: webhookResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in profile-webhook function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
