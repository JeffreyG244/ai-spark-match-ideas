import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecureConfig {
  N8N_WEBHOOK_URL?: string;
  RATE_LIMIT_DEFAULTS?: {
    MESSAGE_LIMIT: number;
    PROFILE_UPDATE_LIMIT: number;
    LOGIN_ATTEMPT_LIMIT: number;
    WINDOW_MINUTES: number;
  };
  SESSION_CONFIG?: {
    MAX_AGE_HOURS: number;
    REFRESH_THRESHOLD_HOURS: number;
    DEVICE_TRACKING_ENABLED: boolean;
  };
  SECURITY_HEADERS?: {
    CSP_ENABLED: boolean;
    STRICT_TRANSPORT_SECURITY: boolean;
    X_FRAME_OPTIONS: string;
  };
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

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build secure configuration from environment variables
    const config: SecureConfig = {
      N8N_WEBHOOK_URL: Deno.env.get('N8N_WEBHOOK_URL'),
      RATE_LIMIT_DEFAULTS: {
        MESSAGE_LIMIT: parseInt(Deno.env.get('RATE_LIMIT_MESSAGE') || '10'),
        PROFILE_UPDATE_LIMIT: parseInt(Deno.env.get('RATE_LIMIT_PROFILE') || '5'),
        LOGIN_ATTEMPT_LIMIT: parseInt(Deno.env.get('RATE_LIMIT_LOGIN') || '3'),
        WINDOW_MINUTES: parseInt(Deno.env.get('RATE_LIMIT_WINDOW') || '15')
      },
      SESSION_CONFIG: {
        MAX_AGE_HOURS: parseInt(Deno.env.get('SESSION_MAX_AGE_HOURS') || '24'),
        REFRESH_THRESHOLD_HOURS: parseInt(Deno.env.get('SESSION_REFRESH_HOURS') || '20'),
        DEVICE_TRACKING_ENABLED: Deno.env.get('DEVICE_TRACKING_ENABLED') !== 'false'
      },
      SECURITY_HEADERS: {
        CSP_ENABLED: Deno.env.get('CSP_ENABLED') !== 'false',
        STRICT_TRANSPORT_SECURITY: Deno.env.get('HSTS_ENABLED') !== 'false',
        X_FRAME_OPTIONS: Deno.env.get('X_FRAME_OPTIONS') || 'DENY'
      }
    };

    // Log configuration access
    await supabaseClient
      .from('security_logs')
      .insert({
        event_type: 'config_access',
        severity: 'low',
        details: { 
          user_id: user.id,
          accessed_at: new Date().toISOString(),
          config_keys: Object.keys(config)
        },
        user_id: user.id
      });

    return new Response(
      JSON.stringify(config),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in get-secure-config function:', error);
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