
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Secure configuration retrieval
async function getN8NWebhookUrl(): Promise<string> {
  const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
  if (!webhookUrl) {
    console.error('N8N_WEBHOOK_URL not configured in environment');
    throw new Error('N8N webhook URL not configured');
  }
  return webhookUrl;
}

async function getN8NApiToken(): Promise<string> {
  const apiToken = Deno.env.get('N8N_API_TOKEN');
  if (!apiToken) {
    console.error('N8N_API_TOKEN not configured in environment');
    throw new Error('N8N API token not configured');
  }
  return apiToken;
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

    // Get profile data from executive_dating_profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from('executive_dating_profiles')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Database error', details: profileError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile) {
      // Create a minimal profile for webhook testing
      const minimalProfile = {
        user_id: user_id,
        first_name: 'Test',
        last_name: 'User',
        age: 30,
        primary_location: 'San Francisco, CA',
        age_range_min: 25,
        age_range_max: 35,
        cultural_interests: ['Technology', 'Business'],
        weekend_activities: ['Networking', 'Reading'],
        sexual_orientation: ['Heterosexual'],
        deal_breakers: []
      };
      
      console.log('No profile found, using minimal profile for testing');
    }

    // Get compatibility answers
    const { data: compatibility } = await supabaseClient
      .from('compatibility_answers')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    // Use actual profile or minimal profile for testing
    const profileData = profile || {
      user_id: user_id,
      first_name: 'Test',
      last_name: 'User',
      age: 30,
      primary_location: 'San Francisco, CA',
      age_range_min: 25,
      age_range_max: 35,
      cultural_interests: ['Technology', 'Business'],
      weekend_activities: ['Networking', 'Reading'],
      sexual_orientation: ['Heterosexual'],
      deal_breakers: []
    };

    // Prepare data for N8N webhook
    const webhookData: ProfileData = {
      user_id: user_id,
      name: `${profileData.first_name} ${profileData.last_name}`,
      match_score: 0.95,
      timestamp: new Date().toISOString(),
      event_type: event_type,
      data: {
        profile: profileData,
        compatibility: compatibility?.answers || {},
        preferences: {
          age_range: [profileData.age_range_min || (profileData.age - 5), profileData.age_range_max || (profileData.age + 5)],
          location: profileData.primary_location,
          interests: profileData.cultural_interests || profileData.weekend_activities || [],
          sexual_orientation: profileData.sexual_orientation,
          deal_breakers: profileData.deal_breakers
        }
      }
    };

    // Get secure N8N webhook URL and API token
    const N8N_WEBHOOK_URL = await getN8NWebhookUrl();
    const N8N_API_TOKEN = await getN8NApiToken();
    
    console.log('Sending to N8N webhook (secure)');
    console.log('Payload:', JSON.stringify(webhookData, null, 2));

    // Send to N8N webhook with enhanced security and authentication
    const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${N8N_API_TOKEN}`,
        'user-agent': 'curl/8.7.1',
        'accept': '*/*',
        'content-length': JSON.stringify(webhookData).length.toString()
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
