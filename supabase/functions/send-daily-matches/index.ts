import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DailyMatchesRequest {
  userEmail: string;
  userName: string;
  matchCount: number;
  topMatches: Array<{
    name: string;
    age: number;
    bio: string;
    interests: string[];
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, matchCount, topMatches }: DailyMatchesRequest = await req.json();

    console.log('Sending daily matches email to:', userEmail);

    const matchesHtml = topMatches.map((match, index) => `
      <div style="background-color: white; border-radius: 12px; padding: 20px; margin: 15px 0; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">${match.name}, ${match.age}</h3>
        <p style="color: #6b7280; margin: 0 0 15px 0; line-height: 1.5;">${match.bio}</p>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${match.interests.slice(0, 3).map(interest => 
            `<span style="background-color: #ddd6fe; color: #5b21b6; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">${interest}</span>`
          ).join('')}
        </div>
      </div>
    `).join('');

    const emailResponse = await resend.emails.send({
      from: "Daily Matches <matches@resend.dev>",
      to: [userEmail],
      subject: `✨ ${matchCount} new potential matches for you!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Daily Matches</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; }
              .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 40px 20px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
              .content { padding: 40px 30px; }
              .greeting { font-size: 18px; color: #1f2937; line-height: 1.6; margin-bottom: 30px; }
              .matches-section { background-color: #fefbf3; border-radius: 12px; padding: 25px; margin: 30px 0; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; font-size: 16px; }
              .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
              .stats { display: flex; background-color: #ecfdf5; border-radius: 8px; padding: 20px; margin: 20px 0; justify-content: space-around; text-align: center; }
              .stat { color: #065f46; }
              .stat-number { font-size: 24px; font-weight: bold; display: block; }
              .stat-label { font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✨ Your Daily Matches</h1>
              </div>
              <div class="content">
                <div class="greeting">
                  <p>Good morning, ${userName}!</p>
                  <p>We've found <strong>${matchCount} new people</strong> who might be perfect for you. Here are your top matches:</p>
                </div>
                
                <div class="stats">
                  <div class="stat">
                    <span class="stat-number">${matchCount}</span>
                    <span class="stat-label">New Matches</span>
                  </div>
                  <div class="stat">
                    <span class="stat-number">${topMatches.length}</span>
                    <span class="stat-label">Top Picks</span>
                  </div>
                  <div class="stat">
                    <span class="stat-number">24h</span>
                    <span class="stat-label">Fresh</span>
                  </div>
                </div>
                
                <div class="matches-section">
                  <h2 style="color: #92400e; margin: 0 0 20px 0; text-align: center;">🌟 Today's Top Picks</h2>
                  ${matchesHtml}
                </div>
                
                <div style="text-align: center;">
                  <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'https://your-app.com'}/discover" class="cta-button">
                    View All Matches
                  </a>
                </div>
                
                <p style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 30px 0; color: #0c4a6e; font-size: 14px; border-radius: 4px;">
                  💡 <strong>Pro tip:</strong> Profiles with multiple photos and complete bios get 3x more matches!
                </p>
                
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px; text-align: center;">
                  Want to change how often you receive these emails? Update your preferences in settings.
                </p>
              </div>
              <div class="footer">
                <p>Happy matching! 💕<br>The Dating App Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Daily matches email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-daily-matches function:", error);
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