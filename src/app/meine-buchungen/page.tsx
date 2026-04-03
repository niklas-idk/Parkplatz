"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import BookingCard from "@/components/BookingCard";

interface Booking {
  id: string;
  date: string;
  slotId: string;
  status: string;
  spot: { label: string };
}

function MeineBuchungenContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchBookings() {
    const res = await fetch("/api/meine-buchungen");
    const data = await res.json();
    setBookings(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  async function handleCancel(id: string) {
    await fetch(`/api/buchungen/${id}`, { method: "PATCH" });
    fetchBookings();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Meine Buchungen</h1>

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4">
          Buchung erfolgreich! Dein Parkplatz ist reserviert.
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Lade Buchungen...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>Noch keine Buchungen vorhanden.</p>
          <a href="/buchen" className="text-blue-600 hover:underline mt-2 inline-block">
            Jetzt einen Parkplatz buchen
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MeineBuchungenPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-400">Lade...</div>}>
      <MeineBuchungenContent />
    </Suspense>
  );
}
