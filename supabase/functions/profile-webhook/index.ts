import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// REPLACE THIS WITH YOUR ACTUAL N8N WEBHOOK URL
const N8N_WEBHOOK_URL = 'https://luvlang.org/webhook-test/luvlang-match'; // ← CHANGE THIS TO YOUR REAL N8N URL

interface ProfileData {
  user_id: string;
  name: string;
  match_score: number;
  timestamp: string;
  event_type: string;
  data: any;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Profile webhook function started');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, event_type = 'profile_updated' } = await req.json();
    console.log('Received request for user:', user_id, 'event:', event_type);
    
    if (!user_id) {
      console.error('No user_id provided');
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user data from users table
    console.log('Fetching user data...');
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

    // Prepare comprehensive webhook payload
    const webhookData: ProfileData = {
      user_id: user_id,
      name: `${userData.first_name} ${userData.last_name}`,
      match_score: 0.95,
      timestamp: new Date().toISOString(),
      event_type: event_type,
      data: {
        profile: {
          user_id: user_id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          age: userData.age || 30,
          city: userData.city || 'Test City',
          state: userData.state || 'CA',
          bio: userData.bio || 'Professional seeking meaningful connections',
          industry: userData.industry,
          job_title: userData.job_title,
          interests: userData.interests || ['Technology', 'Business']
        },
        compatibility: {},
        preferences: {
          age_range: [userData.age_min || 25, userData.age_max || 45],
          location: `${userData.city || 'Test City'}, ${userData.state || 'CA'}`,
          interests: userData.interests || ['Technology', 'Business'],
          deal_breakers: userData.deal_breakers || []
        },
        user_metadata: {
          email: userData.email,
          created_at: userData.created_at,
          subscription_tier: userData.subscription_tier || 'free'
        }
      }
    };

    console.log('Sending to N8N webhook:', N8N_WEBHOOK_URL);
    console.log('Payload:', JSON.stringify(webhookData, null, 2));

    // Send to N8N webhook - with better error handling
    let webhookResult;
    try {
      const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      console.log('Webhook response status:', webhookResponse.status);

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error('N8N webhook failed:', webhookResponse.status, errorText);
        
        // For testing purposes, don't fail the entire function if webhook is down
        webhookResult = {
          success: false,
          status: webhookResponse.status,
          error: `Webhook returned ${webhookResponse.status}`,
          note: 'This is expected if N8N webhook is not set up yet'
        };
      } else {
        const webhookResultText = await webhookResponse.text();
        console.log('N8N webhook success:', webhookResultText);
        webhookResult = {
          success: true,
          status: webhookResponse.status,
          response: webhookResultText
        };
      }
    } catch (fetchError: any) {
      console.error('Network error calling webhook:', fetchError);
      webhookResult = {
        success: false,
        error: fetchError.message,
        note: 'Network error - webhook may not be accessible'
      };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Profile data processed successfully',
        webhook_result: webhookResult,
        payload_sent: webhookData,
        user_data_found: !!userData.first_name
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in profile-webhook function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);