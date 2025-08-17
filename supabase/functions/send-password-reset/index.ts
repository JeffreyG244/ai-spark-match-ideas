import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    // CRITICAL SECURITY FIX: Rate limiting protection
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';
    
    console.log(`Password reset request received from IP: ${clientIP}`);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check rate limiting - max 3 attempts per hour per IP, 5 per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const { data: recentRequests, error: rateLimitError } = await supabaseClient
      .from('password_reset_requests')
      .select('*')
      .eq('ip_address', clientIP)
      .gte('created_at', oneHourAgo.toISOString());

    if (recentRequests && recentRequests.length >= 3) {
      console.log(`Rate limit exceeded for IP: ${clientIP} (${recentRequests.length} attempts)`);
      
      // Log security event
      await supabaseClient.from('security_logs').insert({
        event_type: 'password_reset_rate_limit_exceeded',
        severity: 'medium',
        details: {
          ip_address: clientIP,
          attempts_in_hour: recentRequests.length,
          user_agent: req.headers.get('user-agent')
        }
      });

      return new Response(
        JSON.stringify({ 
          error: 'Too many password reset attempts from this IP. Please try again in 1 hour.' 
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

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

    // Validate email format
    if (!email.includes('@') || email.length < 5) {
      return new Response(
        JSON.stringify({ error: 'Valid email address is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Log the rate limiting attempt (track regardless of user existence)
    await supabaseClient.from('password_reset_requests').insert({
      ip_address: clientIP,
      email: email,
      attempts: 1
    });

    console.log('Processing password reset for email:', email);

    // Check if Resend API key is configured
    if (!Deno.env.get("RESEND_API_KEY")) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Email service not configured',
          details: 'Please configure RESEND_API_KEY' 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Verify user exists
    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserByEmail(email);
    
    if (userError || !userData.user) {
      console.log('User not found for email:', email);
      // Return success even if user doesn't exist for security
      return new Response(
        JSON.stringify({ 
          message: 'If an account with that email exists, we have sent a password reset link.',
          success: true 
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Generate password reset token
    const { data: resetData, error: resetError } = await supabaseClient.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${req.headers.get('origin') || 'https://016dc165-a1fe-4ce7-adef-dbf00d3eba8a.lovableproject.com'}/auth?reset=true`
      }
    });

    if (resetError) {
      console.error('Error generating reset link:', resetError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate password reset link',
          details: resetError.message 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Reset link generated, sending email via Resend');

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "LuvLang Support <support@luvlang.org>",
      to: [email],
      subject: "Reset Your Password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetData.properties?.action_link}" class="button">Reset Password</a>
            </p>
            <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
            <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            <p>If the button above doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px; font-family: monospace;">
              ${resetData.properties?.action_link}
            </p>
          </div>
          <div class="footer">
            <p>This email was sent because a password reset was requested for your account.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </body>
        </html>
      `,
    });

    if (emailResponse.error) {
      console.error('Error sending email via Resend:', emailResponse.error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send password reset email',
          details: emailResponse.error.message 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Password reset email sent successfully via Resend');

    // Log security event
    try {
      await supabaseClient
        .from('security_logs')
        .insert({
          event_type: 'password_reset_requested',
          severity: 'medium',
          details: {
            email: email,
            reset_link_id: resetData.properties?.email_otp,
            email_id: emailResponse.data?.id
          },
          user_agent: req.headers.get('user-agent') || 'unknown'
        });
    } catch (logError) {
      console.warn('Failed to log security event:', logError);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Password reset email sent successfully. Please check your inbox.',
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