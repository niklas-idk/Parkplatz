import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
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
        },
      },
    },
  });

  return NextResponse.json(spots);
}
