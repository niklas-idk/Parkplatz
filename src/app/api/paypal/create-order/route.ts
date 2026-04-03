import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSlotById } from "@/lib/constants";

const PAYPAL_API = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const { bookingId } = await request.json();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { spot: true },
  });

  if (!booking || booking.userId !== session.user.id) {
    return NextResponse.json({ error: "Buchung nicht gefunden" }, { status: 404 });
  }

  const slot = getSlotById(booking.slotId);
  if (!slot) {
    return NextResponse.json({ error: "Ungültiger Slot" }, { status: 400 });
  }

  const accessToken = await getPayPalAccessToken();

  const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          description: `Parkplatz ${booking.spot.label} – ${slot.label} am ${booking.date}`,
          amount: {
            currency_code: "EUR",
            value: slot.price.toFixed(2),
          },
        },
      ],
    }),
  });

  const orderData = await orderRes.json();

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      paypalOrderId: orderData.id,
      amount: slot.price,
      status: "PENDING",
    },
  });

  return NextResponse.json({ orderID: orderData.id });
}
