import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PasswordResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Password reset request received');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email }: PasswordResetRequest = await req.json();
    
    if (!email) {
      console.error('No email provided');
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Sending password reset for email:', email);

    // Send password reset email
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.headers.get('origin') || req.headers.get('referer') || 'https://delightful-desert-023e80e0f.4.azurestaticapps.net'}/auth?reset=true`,
    });

    if (error) {
      console.error('Error sending password reset:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send password reset email',
          details: error.message 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Password reset email sent successfully');

    // Log security event
    try {
      await supabaseClient
        .from('security_events')
        .insert({
          event_type: 'password_reset_requested',
          severity: 'medium',
          details: `Password reset requested for email: ${email}`,
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown'
        });
    } catch (logError) {
      console.warn('Failed to log security event:', logError);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Password reset email sent successfully',
        success: true 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in password reset function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);