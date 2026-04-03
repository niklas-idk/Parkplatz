import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const bookings = await prisma.booking.findMany({
    include: {
      user: { select: { name: true, email: true } },
      spot: true,
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(bookings);
}
