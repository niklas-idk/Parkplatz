"use client";

import { TIME_SLOTS } from "@/lib/constants";
import Link from "next/link";

interface BookingInfo {
  id: string;
  slotId: string;
  status: string;
  userId: string;
}

interface SpotWithBookings {
  id: string;
  label: string;
  description: string;
  bookings: BookingInfo[];
}

interface SpotGridProps {
  spots: SpotWithBookings[];
  date: string;
}

function getAvailability(bookings: BookingInfo[]) {
  const bookedSlots = bookings.map((b) => b.slotId);
  const hasGanzerTag = bookedSlots.includes("ganzer-tag");
  const hasVormittag = bookedSlots.includes("vormittag");
  const hasNachmittag = bookedSlots.includes("nachmittag");

  if (hasGanzerTag || (hasVormittag && hasNachmittag)) {
    return { status: "full" as const, label: "Belegt", color: "bg-red-100 border-red-300 text-red-700" };
  }
  if (hasVormittag || hasNachmittag) {
    return { status: "partial" as const, label: "Teilweise frei", color: "bg-yellow-100 border-yellow-300 text-yellow-700" };
  }
  return { status: "free" as const, label: "Frei", color: "bg-green-100 border-green-300 text-green-700" };
}

export default function SpotGrid({ spots, date }: SpotGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {spots.map((spot) => {
        const avail = getAvailability(spot.bookings);
        const freeSlots = TIME_SLOTS.filter((ts) => {
          const bookedIds = spot.bookings.map((b) => b.slotId);
          if (bookedIds.includes(ts.id)) return false;
          if (ts.id === "ganzer-tag" && (bookedIds.includes("vormittag") || bookedIds.includes("nachmittag"))) return false;
          if ((ts.id === "vormittag" || ts.id === "nachmittag") && bookedIds.includes("ganzer-tag")) return false;
          return true;
        });

        return (
          <Link
            key={spot.id}
            href={avail.status === "full" ? "#" : `/buchen/${spot.id}?date=${date}`}
            className={`block p-4 rounded-xl border-2 transition-all ${
              avail.status === "full"
                ? "opacity-60 cursor-not-allowed"
                : "hover:shadow-lg hover:scale-105 cursor-pointer"
            } ${avail.color}`}
          >
            <div className="text-2xl font-bold text-center">{spot.label}</div>
            <div className="text-sm text-center mt-1 font-medium">{avail.label}</div>
            {avail.status !== "full" && (
              <div className="text-xs text-center mt-2 opacity-75">
                {freeSlots.length} Slot{freeSlots.length !== 1 && "s"} frei
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
