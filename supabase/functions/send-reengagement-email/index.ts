import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReengagementEmailRequest {
  userEmail: string;
  userName: string;
  daysSinceLastActive: number;
  pendingMatches: number;
  unreadMessages: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, daysSinceLastActive, pendingMatches, unreadMessages }: ReengagementEmailRequest = await req.json();

    console.log('Sending re-engagement email to:', userEmail);

    const emailResponse = await resend.emails.send({
      from: "We Miss You <hello@resend.dev>",
      to: [userEmail],
      subject: `💕 ${userName}, someone special might be waiting for you...`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>We Miss You</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; }
              .header { background: linear-gradient(135deg, #e11d48, #be185d); padding: 40px 20px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
              .content { padding: 40px 30px; text-align: center; }
              .miss-you-card { background: linear-gradient(135deg, #fef2f2, #fecaca); border-radius: 16px; padding: 30px; margin: 30px 0; }
              .miss-you-card h2 { color: #991b1b; margin: 0 0 15px 0; font-size: 24px; }
              .greeting { font-size: 18px; color: #1f2937; line-height: 1.6; margin-bottom: 20px; }
              .activity-stats { display: flex; justify-content: space-around; background-color: #f0fdf4; border-radius: 12px; padding: 25px; margin: 30px 0; }
              .stat { text-align: center; }
              .stat-number { font-size: 28px; font-weight: bold; color: #15803d; display: block; }
              .stat-label { color: #166534; font-size: 12px; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; font-size: 16px; }
              .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💕 We Miss You!</h1>
              </div>
              <div class="content">
                <div class="greeting">
                  <p>Hey ${userName},</p>
                  <p>It's been ${daysSinceLastActive} days since we last saw you, and we've been thinking about you!</p>
                </div>
                
                <div class="miss-you-card">
                  <h2>❤️ Your love story is still waiting to be written...</h2>
                  <p style="color: #991b1b; margin: 0; font-size: 16px;">Don't let the perfect match slip away!</p>
                </div>
                
                <div class="activity-stats">
                  <div class="stat">
                    <span class="stat-number">${pendingMatches}</span>
                    <span class="stat-label">Potential Matches</span>
                  </div>
                  <div class="stat">
                    <span class="stat-number">${unreadMessages}</span>
                    <span class="stat-label">Unread Messages</span>
                  </div>
                  <div class="stat">
                    <span class="stat-number">NEW</span>
                    <span class="stat-label">Features Added</span>
                  </div>
                </div>
                
                <div style="text-align: center;">
                  <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'https://your-app.com'}/dashboard" class="cta-button">
                    Continue Your Journey
                  </a>
                </div>
                
                <p style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 30px 0; color: #92400e; font-size: 14px; border-radius: 4px;">
                  🔥 <strong>Hot tip:</strong> Users who log in regularly get 5x more matches than inactive users!
                </p>
                
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                  If you're not interested in finding love right now, you can <a href="#" style="color: #6b7280;">pause your account</a> or <a href="#" style="color: #6b7280;">unsubscribe from these emails</a>.
                </p>
              </div>
              <div class="footer">
                <p>Come back soon! 🌟<br>The Dating App Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Re-engagement email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-reengagement-email function:", error);
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