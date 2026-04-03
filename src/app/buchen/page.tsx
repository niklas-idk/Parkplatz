"use client";

import { useState, useEffect } from "react";
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Parkplatz buchen</h1>

      <div className="mb-6">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Datum wählen
        </label>
        <input
          id="date"
          type="date"
          value={date}
          min={today}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <p className="text-gray-500 text-sm mb-4">
        Wähle einen freien Parkplatz für den{" "}
        {new Date(date + "T00:00:00").toLocaleDateString("de-DE", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
        :
      </p>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Lade Parkplätze...</div>
      ) : (
        <SpotGrid spots={spots} date={date} />
      )}
    </div>
  );
}
