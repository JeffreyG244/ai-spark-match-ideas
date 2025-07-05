import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  firstName: string;
  lastName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName }: WelcomeEmailRequest = await req.json();

    console.log('Sending welcome email to:', email);

    const displayName = lastName ? `${firstName} ${lastName}` : firstName;

    const emailResponse = await resend.emails.send({
      from: "Welcome <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to our Dating Community! 💕",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome!</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; }
              .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 40px 20px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
              .content { padding: 40px 30px; }
              .welcome-text { font-size: 18px; color: #1f2937; line-height: 1.6; margin-bottom: 30px; }
              .tips { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 8px; }
              .tips h3 { color: #92400e; margin-top: 0; }
              .tips ul { color: #78350f; margin: 10px 0; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome, ${displayName}! 💕</h1>
              </div>
              <div class="content">
                <div class="welcome-text">
                  <p>We're thrilled to have you join our dating community! Your journey to finding meaningful connections starts here.</p>
                  
                  <p>Your profile is now live and ready to start making matches. Here's what happens next:</p>
                </div>
                
                <div class="tips">
                  <h3>🚀 Get Started Tips:</h3>
                  <ul>
                    <li><strong>Complete your profile</strong> - Add photos and write a compelling bio</li>
                    <li><strong>Set your preferences</strong> - Let us know what you're looking for</li>
                    <li><strong>Start swiping</strong> - Discover amazing people in your area</li>
                    <li><strong>Be authentic</strong> - Genuine connections start with being yourself</li>
                  </ul>
                </div>
                
                <div style="text-align: center;">
                  <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'https://your-app.com'}/dashboard" class="cta-button">
                    Start Finding Matches
                  </a>
                </div>
                
                <p style="margin-top: 30px; color: #6b7280;">
                  Need help? Reply to this email and our support team will be happy to assist you.
                </p>
              </div>
              <div class="footer">
                <p>Happy dating! 💝<br>The Dating App Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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