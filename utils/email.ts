"use server";

import { getValidAccessToken } from "@/utils/zohoTokenManager";
import { TicketEmailParams } from "@/types";

export async function sendTicketEmail({
  email,
  eventTitle,
  eventSubtitle,
  eventImage,
  orderId,
  totalAmount,
  quantity,
  firstName,
  priceCategories,
}: TicketEmailParams & {
  priceCategories?: { name: string; price: string; quantity: number }[];
}) {
  const accountId = process.env.ZOHO_ACCOUNT_ID;
  if (!accountId) {
    throw new Error("Zoho account ID is missing");
  }

  let accessToken;
  try {
    accessToken = await getValidAccessToken();
  } catch {
    throw new Error("Failed to authenticate with Zoho API");
  }

  const ticketUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/verify-ticket?orderId=${orderId}`;
  const dashboardUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/dashboard`;

  const priceCategoriesHtml =
    priceCategories && priceCategories.length > 0
      ? priceCategories
          .map(
            (cat) => `
          <p style="color: #666; margin: 0;">
            ${cat.quantity} x ${cat.name}
            ${
              cat.price !== "0"
                ? `- ₦${(Number(cat.price) * cat.quantity).toLocaleString()}`
                : ""
            }
          </p>
        `,
          )
          .join("")
      : `<p style="color: #666; margin: 0;">${quantity} x Ticket</p>`;

  const emailContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px;">
    <div style="text-align: center; padding: 10px 0;">
      <h1 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 48px; font-weight: normal; line-height: 48px; color: #3870af; margin-bottom: 30px; background: none; text-align: center;">Vitiket</h1>
    </div>
    <div style="background-color: #fff; border-radius: 8px; padding: 20px; border: 1px solid #ddd;">
      <h1 style="color: #333; font-size: 24px; margin: 0 0 10px;">Hi ${firstName}, you've got tickets!</h1>
      <p style="color: #666; font-size: 14px; margin: 0 0 20px;">
        View and save your tickets before the event.
      </p>
      <div style="text-align: center; margin-bottom: 20px;">
        <a href="${ticketUrl}" style="display: inline-block; padding: 10px 20px; background-color: #123f70; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to My Tickets</a>
      </div>
      <p style="color: #666; font-size: 12px; margin: 0 0 20px; text-align: center;">
        Access your tickets in your Vitiket account under the Tickets section, or download a printable PDF.
      </p>
      <div style="background-color: #e6f7fa; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <img src="${eventImage}" alt="${eventTitle}" style="max-width: 100%; height: auto; border-radius: 4px; margin-bottom: 10px;" />
        <h2 style="color: #333; font-size: 18px; margin: 0 0 5px;">${eventTitle}</h2>
        ${eventSubtitle ? `<p style="color: #666; font-size: 14px; margin: 0 0 10px;">${eventSubtitle}</p>` : ""}
        <p style="color: #666; font-size: 14px; margin: 0;">
          ${priceCategoriesHtml}
        </p>
        <p style="color: #666; font-size: 14px; margin: 5px 0 0;">
          Order total: ₦${parseFloat(totalAmount).toLocaleString()}
        </p>
      </div>
      <p style="color: #333; font-size: 14px; margin: 0 0 20px;">
        Questions about this event? <a href="mailto:support@vitiket.com" style="color: #1a73e8; text-decoration: none;">Contact the organizer</a>
      </p>
      <h2 style="color: #333; font-size: 18px; margin: 0 0 10px;">Order Summary</h2>
      <p style="color: #666; font-size: 14px; margin: 0 0 5px;">Order #${orderId}</p>
      <p style="color: #666; font-size: 14px; margin: 0 0 5px;">
        ${firstName}
      </p>
      <p style="color: #666; font-size: 14px; margin: 0 0 5px;">
        ${priceCategoriesHtml}
      </p>
      <p style="color: #666; font-size: 14px; margin: 0 0 20px;">
        Total: ₦${parseFloat(totalAmount).toLocaleString()}
      </p>
      <p style="color: #666; font-size: 12px; margin: 0 0 20px;">
        View and manage your order in your <a href="${dashboardUrl}" style="color: #1a73e8; text-decoration: none;">Vitiket dashboard</a>.
      </p>
    </div>
    <div style="text-align: center; padding: 20px 0; font-size: 12px; color: #666;">
      <div style="margin-top: 20px; font-family: Arial, sans-serif; color: #666; text-align: center;">
        <h1 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 48px; font-weight: normal; line-height: 48px; color: #3870af; margin-bottom: 30px; background: none; text-align: center;">Vitiket</h1>
        <p style="margin: 0;">Vitiket Support Team</p>
        <p style="margin: 0;"><a href="mailto:support@vitiket.com" style="color: #1a73e8; text-decoration: none;">support@vitiket.com</a></p>
      </div>
      <p style="margin: 10px 0 0;">
        This order is subject to Vitiket's <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/terms" style="color: #1a73e8; text-decoration: none;">Terms of Service</a> and <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/privacy" style="color: #1a73e8; text-decoration: none;">Privacy Policy</a>.
      </p>
      <p style="margin: 5px 0 0;">
        Vitiket, All rights reserved.
      </p>
    </div>
  </div>
`;

  const mailOptions = {
    fromAddress: `"Vitiket" <support@vitiket.com>`,
    toAddress: email,
    subject: `Your Tickets for ${eventTitle}`,
    content: emailContent,
  };

  try {
    const response = await fetch(
      `https://mail.zoho.com/api/accounts/${accountId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mailOptions),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.message ||
          `Failed to send email via Zoho API (status: ${response.status})`,
      );
    }
  } catch (error) {
    throw error;
  }
}
