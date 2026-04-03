"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Calendar from "@/components/Calendar";
import SpotGrid from "@/components/SpotGrid";

export default function HomePage() {
  const { data: session } = useSession();
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateSelected, setDateSelected] = useState(false);

  useEffect(() => {
    if (!dateSelected) return;

    setLoading(true);
    fetch(`/api/verfuegbarkeit?date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        setSpots(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedDate, dateSelected]);

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setDateSelected(true);
  }

  const dateFormatted = new Date(selectedDate + "T00:00:00").toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Parkplatz buchen</h1>
        <p className="text-gray-500 text-lg">
          Wähle ein Datum im Kalender und sieh sofort, welche Plätze frei sind.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
        {/* Calendar */}
        <div>
          <Calendar selectedDate={selectedDate} onSelectDate={handleSelectDate} />
        </div>

        {/* Spot availability */}
        <div>
          {!dateSelected ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-5xl mb-4">📅</div>
              <p className="text-gray-400 text-lg">
                Wähle ein Datum im Kalender, um die verfügbaren Parkplätze zu sehen.
              </p>
            </div>
          ) : (
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
                <>
                  <SpotGrid spots={spots} date={selectedDate} isLoggedIn={!!session?.user} />

                  {!session?.user && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                      <p className="text-blue-700 font-medium mb-2">
                        Zum Buchen bitte anmelden
                      </p>
                      <div className="flex gap-3 justify-center">
                        <a
                          href="/anmelden"
                          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Anmelden
                        </a>
                        <a
                          href="/registrieren"
                          className="bg-white text-blue-700 px-5 py-2 rounded-lg text-sm font-medium border border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          Registrieren
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
