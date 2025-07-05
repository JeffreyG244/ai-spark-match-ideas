import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProfileViewNotificationRequest {
  userEmail: string;
  userName: string;
  viewerName: string;
  totalViews: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, viewerName, totalViews }: ProfileViewNotificationRequest = await req.json();

    console.log('Sending profile view notification to:', userEmail);

    const emailResponse = await resend.emails.send({
      from: "Profile Activity <activity@resend.dev>",
      to: [userEmail],
      subject: `👀 ${viewerName} viewed your profile!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Profile View</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; }
              .header { background: linear-gradient(135deg, #06b6d4, #0891b2); padding: 40px 20px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
              .content { padding: 40px 30px; text-align: center; }
              .view-card { background: linear-gradient(135deg, #f0fdfa, #ccfbf1); border-radius: 16px; padding: 30px; margin: 30px 0; }
              .view-card h2 { color: #065f46; margin: 0 0 15px 0; font-size: 24px; }
              .greeting { font-size: 18px; color: #1f2937; line-height: 1.6; margin-bottom: 20px; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; font-size: 16px; }
              .stats { background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .stat-number { font-size: 32px; font-weight: bold; color: #92400e; display: block; }
              .stat-label { color: #78350f; font-size: 14px; }
              .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>👀 Someone's Interested!</h1>
              </div>
              <div class="content">
                <div class="greeting">
                  <p>Hi ${userName}!</p>
                </div>
                
                <div class="view-card">
                  <h2>🌟 ${viewerName} checked out your profile!</h2>
                  <p style="color: #065f46; margin: 0; font-size: 16px;">This could be your chance to make a connection...</p>
                </div>
                
                <div class="stats">
                  <span class="stat-number">${totalViews}</span>
                  <span class="stat-label">Total profile views this week</span>
                </div>
                
                <div style="text-align: center;">
                  <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'https://your-app.com'}/discover" class="cta-button">
                    Check Them Out
                  </a>
                </div>
                
                <p style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 30px 0; color: #0c4a6e; font-size: 14px; border-radius: 4px;">
                  💡 <strong>Tip:</strong> Update your photos regularly to keep getting more views!
                </p>
              </div>
              <div class="footer">
                <p>Keep shining! ✨<br>The Dating App Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Profile view notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-profile-view-notification function:", error);
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