"use server";

import { NextRequest, NextResponse } from "next/server";
import { sendTicketEmail } from "@/utils/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      eventTitle,
      eventSubtitle,
      eventImage,
      orderId,
      totalAmount,
      quantity,
      firstName,
      priceCategories,
    } = body;

    await sendTicketEmail({
      email,
      eventTitle,
      eventSubtitle,
      eventImage,
      orderId,
      totalAmount,
      quantity,
      firstName,
      priceCategories,
      currency: "NGN",
    });

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to send email", error: String(error) },
      { status: 500 },
    );
  }
}
