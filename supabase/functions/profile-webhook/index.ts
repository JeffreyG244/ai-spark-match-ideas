
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

    // Get profile data from dating_profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from('dating_profiles')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get compatibility answers
    const { data: compatibility } = await supabaseClient
      .from('compatibility_answers')
      .select('*')
      .eq('user_id', user_id)
      .single();

    // Prepare data for N8N webhook
    const webhookData: ProfileData = {
      user_id: user_id,
      name: `${profile.first_name} ${profile.last_name}`,
      match_score: 0.95,
      timestamp: new Date().toISOString(),
      event_type: event_type,
      data: {
        profile: profile,
        compatibility: compatibility?.answers || {},
        preferences: {
          age_range: [profile.age - 5, profile.age + 5],
          location: `${profile.city}, ${profile.state}`,
          interests: profile.interests
        }
      }
    };

    // Get secure N8N webhook URL
    const N8N_WEBHOOK_URL = await getN8NWebhookUrl();
    
    console.log('Sending to N8N webhook (secure)');
    console.log('Payload:', JSON.stringify(webhookData, null, 2));

    // Send to N8N webhook with enhanced security
    const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
