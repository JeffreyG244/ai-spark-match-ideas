import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchNotificationRequest {
  userEmail: string;
  userName: string;
  matchName: string;
  matchId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, matchName, matchId }: MatchNotificationRequest = await req.json();

    console.log('Sending match notification to:', userEmail);

    const emailResponse = await resend.emails.send({
      from: "Matches <matches@resend.dev>",
      to: [userEmail],
      subject: `🎉 You have a new match with ${matchName}!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Match!</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; }
              .header { background: linear-gradient(135deg, #10b981, #059669); padding: 40px 20px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
              .content { padding: 40px 30px; text-align: center; }
              .match-card { background: linear-gradient(135deg, #fef3c7, #fed7aa); border-radius: 16px; padding: 30px; margin: 30px 0; }
              .match-card h2 { color: #92400e; margin: 0 0 15px 0; font-size: 24px; }
              .match-text { font-size: 18px; color: #1f2937; line-height: 1.6; margin-bottom: 30px; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; font-size: 16px; }
              .tips { background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 30px 0; border-radius: 8px; text-align: left; }
              .tips h3 { color: #0c4a6e; margin-top: 0; }
              .tips ul { color: #0c4a6e; margin: 10px 0; }
              .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 It's a Match!</h1>
              </div>
              <div class="content">
                <div class="match-text">
                  <p>Hey ${userName}!</p>
                </div>
                
                <div class="match-card">
                  <h2>💕 You and ${matchName} liked each other!</h2>
                  <p style="color: #92400e; margin: 0;">This could be the start of something special...</p>
                </div>
                
                <div style="text-align: center;">
                  <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'https://your-app.com'}/messages?match=${matchId}" class="cta-button">
                    Start Chatting Now
                  </a>
                </div>
                
                <div class="tips">
                  <h3>💬 Great Conversation Starters:</h3>
                  <ul>
                    <li>Ask about something interesting from their profile</li>
                    <li>Share a fun fact about yourself</li>
                    <li>Suggest a local activity you both might enjoy</li>
                    <li>Ask an open-ended question about their interests</li>
                  </ul>
                </div>
                
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                  Remember: Be respectful, be yourself, and have fun! 
                </p>
              </div>
              <div class="footer">
                <p>Good luck! 🍀<br>The Dating App Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Match notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-match-notification function:", error);
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