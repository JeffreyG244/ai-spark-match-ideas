import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();

    console.log('Processing password reset request for:', email);

    // Create Supabase client with service role key for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Check if user exists
    const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (userError || !user) {
      console.log('User not found:', email);
      // Still return success for security (don't reveal if email exists)
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Generate password reset link using Supabase Admin API
    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'https://your-app.com'}/auth?reset=true`
      }
    });

    if (resetError) {
      console.error('Error generating reset link:', resetError);
      throw new Error('Failed to generate reset link');
    }

    const resetLink = resetData.properties?.action_link;
    const userName = user.user_metadata?.first_name || email.split('@')[0];

    console.log('Sending password reset email to:', email);

    const emailResponse = await resend.emails.send({
      from: "Password Reset <security@resend.dev>",
      to: [email],
      subject: "Reset Your Password 🔐",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; }
              .header { background: linear-gradient(135deg, #dc2626, #ef4444); padding: 40px 20px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
              .content { padding: 40px 30px; }
              .greeting { font-size: 18px; color: #1f2937; line-height: 1.6; margin-bottom: 30px; }
              .reset-card { background: linear-gradient(135deg, #fef2f2, #fee2e2); border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center; }
              .reset-card h2 { color: #991b1b; margin: 0 0 15px 0; font-size: 24px; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; font-size: 16px; }
              .security-notice { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px; }
              .security-notice h3 { color: #92400e; margin-top: 0; }
              .security-notice p { color: #78350f; margin: 10px 0; font-size: 14px; }
              .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Password Reset Request</h1>
              </div>
              <div class="content">
                <div class="greeting">
                  <p>Hi ${userName},</p>
                  <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
                </div>
                
                <div class="reset-card">
                  <h2>Reset Your Password</h2>
                  <p style="color: #991b1b; margin: 0 0 20px 0;">Click the button below to create a new password</p>
                  <a href="${resetLink}" class="cta-button">
                    Reset Password
                  </a>
                </div>
                
                <div class="security-notice">
                  <h3>🛡️ Security Notice</h3>
                  <p><strong>This link will expire in 1 hour</strong> for your security.</p>
                  <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
                  <p>Never share this link with anyone else.</p>
                </div>
                
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${resetLink}" style="color: #dc2626; word-break: break-all;">${resetLink}</a>
                </p>
              </div>
              <div class="footer">
                <p>Stay secure! 🔒<br>The Dating App Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);