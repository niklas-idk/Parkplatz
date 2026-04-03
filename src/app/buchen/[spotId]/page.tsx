"use client";

import { Suspense, useState, useEffect, use } from "react";
import { useSearchParams } from "next/navigation";
import { TIME_SLOTS, formatPrice } from "@/lib/constants";
import PayPalCheckout from "@/components/PayPalCheckout";
import Link from "next/link";

interface SpotData {
  id: string;
  label: string;
  bookings: { slotId: string }[];
}

function SpotBookingContent({ spotId }: { spotId: string }) {
  const searchParams = useSearchParams();
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const [spot, setSpot] = useState<SpotData | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetch(`/api/buchungen?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((s: SpotData) => s.id === spotId);
        setSpot(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [date, spotId]);

  const bookedSlotIds = spot?.bookings.map((b) => b.slotId) || [];

  const availableSlots = TIME_SLOTS.filter((ts) => {
    if (bookedSlotIds.includes(ts.id)) return false;
    if (ts.id === "ganzer-tag" && (bookedSlotIds.includes("vormittag") || bookedSlotIds.includes("nachmittag"))) return false;
    if ((ts.id === "vormittag" || ts.id === "nachmittag") && bookedSlotIds.includes("ganzer-tag")) return false;
    return true;
  });

  async function handleBook() {
    if (!selectedSlot) return;
    setBooking(true);
    setError("");

    try {
      const res = await fetch("/api/buchungen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotId, date, slotId: selectedSlot }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        setBooking(false);
        return;
      }

      setBookingId(data.id);
    } catch {
      setError("Buchung fehlgeschlagen");
      setBooking(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Lade...</div>;
  }

  if (!spot) {
    return <div className="text-center py-12 text-red-500">Parkplatz nicht gefunden</div>;
  }

  const dateFormatted = new Date(date + "T00:00:00").toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link href={`/buchen?date=${date}`} className="text-blue-600 hover:underline text-sm">
        &larr; Zurück zur Übersicht
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-bold">Parkplatz {spot.label}</h1>
        <p className="text-gray-500">{dateFormatted}</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
      )}

      {bookingId ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Jetzt bezahlen</h2>
          <p className="text-sm text-gray-500 mb-4">
            Schließe die Buchung ab, indem du über PayPal bezahlst.
          </p>
          <PayPalCheckout bookingId={bookingId} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Zeitslot wählen</h2>

          {availableSlots.length === 0 ? (
            <p className="text-gray-500">Keine Slots verfügbar für diesen Tag.</p>
          ) : (
            <div className="space-y-3">
              {availableSlots.map((slot) => (
                <label
                  key={slot.id}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedSlot === slot.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="slot"
                      value={slot.id}
                      checked={selectedSlot === slot.id}
                      onChange={() => setSelectedSlot(slot.id)}
                      className="text-blue-600"
                    />
                    <div>
                      <div className="font-medium">{slot.label}</div>
                      <div className="text-sm text-gray-500">
                        {slot.start} – {slot.end} Uhr
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold text-lg">{formatPrice(slot.price)}</div>
                </label>
              ))}
            </div>
          )}

          <button
            onClick={handleBook}
            disabled={!selectedSlot || booking}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {booking ? "Wird gebucht..." : "Weiter zur Bezahlung"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function SpotBookingPage({ params }: { params: Promise<{ spotId: string }> }) {
  const { spotId } = use(params);

  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-400">Lade...</div>}>
      <SpotBookingContent spotId={spotId} />
    </Suspense>
  );
}
