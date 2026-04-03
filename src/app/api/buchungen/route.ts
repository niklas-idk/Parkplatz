import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSlotById } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "Datum fehlt" }, { status: 400 });
  }

  const spots = await prisma.parkingSpot.findMany({
    orderBy: { label: "asc" },
    include: {
      bookings: {
        where: {
          date,
          status: { not: "CANCELLED" },
        },
        select: {
          id: true,
          slotId: true,
          status: true,
          userId: true,
        },
      },
    },
  });

  return NextResponse.json(spots);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const body = await request.json();
  const { spotId, date, slotId } = body;

  const slot = getSlotById(slotId);
  if (!slot) {
    return NextResponse.json({ error: "Ungültiger Zeitslot" }, { status: 400 });
  }

  // Check for conflicts
  const existing = await prisma.booking.findFirst({
    where: {
      spotId,
      date,
      status: { not: "CANCELLED" },
      OR: [
        { slotId },
        // ganzer-tag conflicts with vormittag/nachmittag and vice versa
        ...(slotId === "ganzer-tag"
          ? [{ slotId: "vormittag" }, { slotId: "nachmittag" }]
          : [{ slotId: "ganzer-tag" }]),
      ],
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Dieser Slot ist bereits gebucht" },
      { status: 409 }
    );
  }

  try {
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        spotId,
        date,
        slotId: slot.id,
        startTime: slot.start,
        endTime: slot.end,
        status: "PENDING",
      },
    });

    return NextResponse.json(booking);
  } catch {
    return NextResponse.json(
      { error: "Buchung fehlgeschlagen – Slot möglicherweise bereits vergeben" },
      { status: 409 }
    );
  }
}
