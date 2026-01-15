import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConnectionEmailRequest {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  senderTitle: string;
  senderOrganization: string;
  senderBio: string;
  connectionPageUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      recipientEmail,
      recipientName,
      senderName,
      senderTitle,
      senderOrganization,
      senderBio,
      connectionPageUrl,
    }: ConnectionEmailRequest = await req.json();

    console.log("Sending connection request email to:", recipientEmail);
    console.log("From:", senderName);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Codonyx <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: `${senderName} wants to connect with you on Codonyx`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 32px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Codonyx</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Professional Network</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 32px;">
                        <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0;">
                          Hi ${recipientName},
                        </p>
                        
                        <p style="color: #374151; font-size: 16px; margin: 0 0 32px 0; line-height: 1.6;">
                          <strong style="color: #16a34a;">${senderName}</strong> would like to connect with you on Codonyx.
                        </p>
                        
                        <!-- Profile Card -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                          <tr>
                            <td>
                              <h3 style="color: #111827; margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">${senderName}</h3>
                              ${senderTitle ? `<p style="color: #6b7280; margin: 0 0 4px 0; font-size: 14px;">${senderTitle}</p>` : ''}
                              ${senderOrganization ? `<p style="color: #6b7280; margin: 0 0 16px 0; font-size: 14px;">${senderOrganization}</p>` : ''}
                              ${senderBio ? `<p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.5;">${senderBio.substring(0, 200)}${senderBio.length > 200 ? '...' : ''}</p>` : ''}
                            </td>
                          </tr>
                        </table>
                        
                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center">
                              <a href="${connectionPageUrl}" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(22, 163, 74, 0.3);">
                                Accept Request
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="color: #6b7280; font-size: 14px; margin: 32px 0 0 0; text-align: center;">
                          Or visit your <a href="${connectionPageUrl}" style="color: #16a34a; text-decoration: none;">connections page</a> to manage your requests.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                          This email was sent by Codonyx. If you didn't expect this email, you can ignore it.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      }),
    });

    const emailResponse = await res.json();
    console.log("Email sent successfully:", emailResponse);

    if (!res.ok) {
      throw new Error(emailResponse.message || "Failed to send email");
    }

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-connection-email function:", error);
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
