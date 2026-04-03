"use client";

import { useState, useEffect } from "react";
import Calendar from "@/components/Calendar";
import SpotGrid from "@/components/SpotGrid";

export default function BuchenPage() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/buchungen?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        setSpots(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [date]);

  const dateFormatted = new Date(date + "T00:00:00").toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Parkplatz buchen</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
        <Calendar selectedDate={date} onSelectDate={setDate} />

        <div>
          <h2 className="text-xl font-semibold mb-1">
            Verfügbarkeit am {dateFormatted}
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Klicke auf einen freien Parkplatz, um einen Zeitslot zu buchen.
          </p>

          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center text-gray-400">
              Lade Parkplätze...
            </div>
          ) : (
            <SpotGrid spots={spots} date={date} />
          )}
        </div>
      </div>
    </div>
  );
}
