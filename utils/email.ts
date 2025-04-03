"use server";

import nodemailer from "nodemailer";

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
  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  // Verify the transporter connection with retry logic
  const maxRetries = 3;
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      await transporter.verify();
      console.log("SMTP connection verified successfully");
      break;
    } catch (error) {
      attempt++;
      console.error(`SMTP connection attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  const ticketUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/verify-ticket?orderId=${orderId}`;
  const dashboardUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/dashboard`;

  // Build price categories HTML and plain text
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

  const priceCategoriesText =
    priceCategories && priceCategories.length > 0
      ? priceCategories
          .map(
            (cat) =>
              `${cat.quantity} x ${cat.name}${
                cat.price !== "0"
                  ? ` - ₦${(Number(cat.price) * cat.quantity).toLocaleString()}`
                  : ""
              }`,
          )
          .join("\n")
      : `${quantity} x Ticket`;

  // Define the signature with the logo
  const signatureHtml = `
    <div style="margin-top: 20px; font-family: Arial, sans-serif; color: #666; text-align: center;">
      <img src="${process.env.NEXT_PUBLIC_LOGO_URL}" alt="Vitiket Logo" style="width: 150px; height: auto; margin-bottom: 10px;" />
      <p style="margin: 0;">Best regards,</p>
      <p style="margin: 0;">Greg Haris</p>
      <p style="margin: 0;">Vitiket Support Team</p>
      <p style="margin: 0;"><a href="mailto:support@vitiket.com" style="color: #1a73e8; text-decoration: none;">support@vitiket.com</a></p>
    </div>
  `;

  const signatureText = `
Best regards,
Greg Haris
Vitiket Support Team
support@vitiket.com
  `;

  // HTML version of the email
  const ticketHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px;">
      <!-- Header -->
      <div style="text-align: center; padding: 10px 0;">
        <img src="${process.env.NEXT_PUBLIC_LOGO_URL}" alt="Vitiket Logo" style="width: 150px; height: auto;" />
      </div>

      <!-- Main Content -->
      <div style="background-color: #fff; border-radius: 8px; padding: 20px; border: 1px solid #ddd;">
        <h1 style="color: #333; font-size: 24px; margin: 0 0 10px;">${firstName}, you've got tickets!</h1>
        <p style="color: #666; font-size: 14px; margin: 0 0 20px;">
          View and save your tickets before the event.
        </p>
        <div style="text-align: center; margin-bottom: 20px;">
          <a href="${ticketUrl}" style="display: inline-block; padding: 10px 20px; background-color: #ff4d4d; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to My Tickets</a>
        </div>
        <p style="color: #666; font-size: 12px; margin: 0 0 20px; text-align: center;">
          Access your tickets in your Vitiket account under the Tickets section, or download a printable PDF.
        </p>

        <!-- Event Details with Image -->
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

        <!-- Contact Organizer -->
        <p style="color: #333; font-size: 14px; margin: 0 0 20px;">
          Questions about this event? <a href="mailto:support@vitiket.com" style="color: #1a73e8; text-decoration: none;">Contact the organizer</a>
        </p>

        <!-- Order Summary -->
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

      <!-- Footer -->
      <div style="text-align: center; padding: 20px 0; font-size: 12px; color: #666;">
        ${signatureHtml}
        <p style="margin: 10px 0 0;">
          This order is subject to Vitiket's <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/terms" style="color: #1a73e8; text-decoration: none;">Terms of Service</a> and <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/privacy" style="color: #1a73e8; text-decoration: none;">Privacy Policy</a>.
        </p>
        <p style="margin: 5px 0 0;">
          Vitiket, All rights reserved.
        </p>
      </div>
    </div>
  `;

  // Plain text version of the email
  const ticketText = `
${firstName}, you've got tickets!

View and save your tickets before the event.
Go to My Tickets: ${ticketUrl}

Access your tickets in your Vitiket dashboard under the Tickets section, or download a printable PDF.

${eventTitle}
${eventSubtitle ? eventSubtitle : ""}
${priceCategoriesText}
Order total: ₦${parseFloat(totalAmount).toLocaleString()}

Questions about this event? Contact the organizer at support@vitiket.com

Order Summary
Order #${orderId}

${firstName}
${priceCategoriesText}
Total: ₦${parseFloat(totalAmount).toLocaleString()}

View and manage your order in your Vitiket account: ${dashboardUrl}

${signatureText}

This order is subject to Vitiket's Terms of Service (${process.env.NEXT_PUBLIC_SERVER_URL}/terms) and Privacy Policy (${process.env.NEXT_PUBLIC_SERVER_URL}/privacy).
Vitiket, All rights reserved.
  `;

  const mailOptions = {
    from: `"Vitiket" <support@vitiket.com>`,
    to: email,
    subject: `Your Tickets for ${eventTitle}`,
    text: ticketText,
    html: ticketHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
