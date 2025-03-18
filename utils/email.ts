import nodemailer from 'nodemailer';

import { TicketEmailParams } from '@/types';

export async function sendTicketEmail({
  email,
  eventTitle,
  eventSubtitle,
  eventImage,
  orderId,
  totalAmount,
  currency,
  quantity,
}: TicketEmailParams) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const qrCodeUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/verify-ticket?orderId=${orderId}`;
  const ticketHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #333;">Thank You for Your Purchase!</h2>
      <p style="color: #666;">Here are your ticket details for <strong>${eventTitle}</strong>:</p>
      ${eventSubtitle ? `<p style="color: #666;">${eventSubtitle}</p>` : ''}
      <img src="${eventImage}" alt="${eventTitle}" style="max-width: 100%; height: auto; border-radius: 4px;" />
      <h3 style="color: #333; margin-top: 20px;">Order Summary</h3>
      <p style="color: #666;">Order ID: ${orderId}</p>
      <p style="color: #666;">Quantity: ${quantity}</p>
      <p style="color: #666;">Total: ${currency} ${parseFloat(
    totalAmount
  ).toLocaleString()}</p>
      <h3 style="color: #333; margin-top: 20px;">Your Ticket</h3>
      <p style="color: #666;">Scan the QR code below to verify your ticket:</p>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
        qrCodeUrl
      )}" alt="QR Code" />
      <p style="color: #666; font-size: 12px; margin-top: 10px;">Keep this email safe or download your ticket for easy access.</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Your Ticket for ${eventTitle}`,
    html: ticketHtml,
  };

  await transporter.sendMail(mailOptions);
}
