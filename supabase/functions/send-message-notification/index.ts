import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MessageNotificationRequest {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  messagePreview: string;
  conversationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, recipientName, senderName, messagePreview, conversationId }: MessageNotificationRequest = await req.json();

    console.log('Sending message notification to:', recipientEmail);

    // Truncate message preview if too long
    const shortPreview = messagePreview.length > 100 ? messagePreview.substring(0, 100) + "..." : messagePreview;

    const emailResponse = await resend.emails.send({
      from: "Messages <messages@resend.dev>",
      to: [recipientEmail],
      subject: `💬 ${senderName} sent you a message`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Message</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; }
              .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 40px 20px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
              .content { padding: 40px 30px; }
              .message-card { background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 25px; margin: 30px 0; }
              .sender-name { color: #1e40af; font-weight: bold; font-size: 18px; margin-bottom: 10px; }
              .message-preview { color: #374151; font-size: 16px; line-height: 1.6; font-style: italic; background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
              .greeting { font-size: 18px; color: #1f2937; line-height: 1.6; margin-bottom: 20px; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; font-size: 16px; }
              .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
              .tips { background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 30px 0; }
              .tips p { color: #92400e; margin: 0; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💬 New Message</h1>
              </div>
              <div class="content">
                <div class="greeting">
                  <p>Hi ${recipientName}!</p>
                </div>
                
                <div class="message-card">
                  <div class="sender-name">${senderName} sent you a message:</div>
                  <div class="message-preview">"${shortPreview}"</div>
                </div>
                
                <div style="text-align: center;">
                  <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'https://your-app.com'}/messages?conversation=${conversationId}" class="cta-button">
                    Reply Now
                  </a>
                </div>
                
                <div class="tips">
                  <p>💡 <strong>Tip:</strong> Quick responses help keep conversations flowing and show you're interested!</p>
                </div>
                
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px; text-align: center;">
                  Don't want these notifications? You can adjust your email preferences in your account settings.
                </p>
              </div>
              <div class="footer">
                <p>Happy chatting! 💝<br>The Dating App Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Message notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-message-notification function:", error);
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