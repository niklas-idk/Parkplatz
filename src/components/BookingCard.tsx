"use client";

import { formatPrice, getSlotById } from "@/lib/constants";
import { useState } from "react";

interface BookingCardProps {
  booking: {
    id: string;
    date: string;
    slotId: string;
    status: string;
    spot: {
      label: string;
    };
  };
  onCancel?: (id: string) => void;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Ausstehend", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Bestätigt", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Storniert", color: "bg-red-100 text-red-800" },
};

export default function BookingCard({ booking, onCancel }: BookingCardProps) {
  const [cancelling, setCancelling] = useState(false);
  const slot = getSlotById(booking.slotId);
  const statusInfo = statusLabels[booking.status] || statusLabels.PENDING;
  const isFuture = new Date(booking.date) >= new Date(new Date().toISOString().split("T")[0]);
  const canCancel = booking.status !== "CANCELLED" && isFuture && onCancel;

  async function handleCancel() {
    if (!confirm("Buchung wirklich stornieren?")) return;
    setCancelling(true);
    try {
      await onCancel?.(booking.id);
    } finally {
      setCancelling(false);
    }
  }

  const dateFormatted = new Date(booking.date + "T00:00:00").toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-2xl font-bold text-gray-800">{booking.spot.label}</div>
        <div>
          <div className="font-medium">{dateFormatted}</div>
          <div className="text-sm text-gray-500">
            {slot ? `${slot.label} (${slot.start}–${slot.end})` : booking.slotId}
          </div>
          {slot && (
            <div className="text-sm text-gray-400">{formatPrice(slot.price)}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            {cancelling ? "..." : "Stornieren"}
          </button>
        )}
      </div>
    </div>
  );
}
