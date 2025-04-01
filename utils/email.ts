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
  });

  const qrCodeUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/verify-ticket?orderId=${orderId}`;

  // Build price categories HTML
  const priceCategoriesHtml =
    priceCategories && priceCategories.length > 0
      ? priceCategories
          .map(
            (cat) => `
          <p style="color: #666;">
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
      : `<p style="color: #666;">${quantity} x Ticket</p>`;

  const ticketHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h1 style="color: #333;">Hi ${firstName}, Thank You for Your Purchase!</h1>
      <p style="color: #666;">Here are your ticket details for <strong>${eventTitle}</strong>:</p>
      ${eventSubtitle ? `<p style="color: #666;">${eventSubtitle}</p>` : ""}
      <img src="${eventImage}" alt="${eventTitle}" style="max-width: 100%; height: auto; border-radius: 4px;" />
      <h2 style="color: #333; margin-top: 20px;">Order Summary</h2>
      <p style="color: #666;">Order ID: ${orderId}</p>
      <div style="margin-top: 10px;">
        <h3 style="color: #333; font-weight: bold;">Tickets</h3>
        ${priceCategoriesHtml}
      </div>
      <div style="margin-top: 10px;">
        <h3 style="color: #333; font-weight: bold;">Total = <span style="color: #666; font-size: 18px; font-weight: bold;">₦${parseFloat(
          totalAmount,
        ).toLocaleString()}</span></h3>    
      </div>
      <h3 style="color: #333; margin-top: 20px;">Your Ticket</h3>
      <p style="color: #666;">Scan the QR code below to verify your ticket:</p>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
        qrCodeUrl,
      )}" alt="QR Code" />
      <p style="color: #666; font-size: 12px; margin-top: 10px;">Keep this email safe or download your ticket for easy access.</p>
    </div>
  `;

  const mailOptions = {
    from: `"Vitiket" <support@vitiket.com>`,
    to: email,
    subject: `Your Ticket for ${eventTitle}`,
    html: ticketHtml,
  };

  await transporter.sendMail(mailOptions);
}
