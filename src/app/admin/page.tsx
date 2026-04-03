"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Booking {
  id: string;
  date: string;
  slotId: string;
  status: string;
  startTime: string;
  endTime: string;
  user: { name: string; email: string };
  spot: { label: string };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || session.user.role !== "ADMIN") {
      router.push("/buchen");
      return;
    }

    fetch("/api/admin/buchungen")
      .then((res) => res.json())
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session, status, router]);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  if (status === "loading" || loading) {
    return <div className="text-center py-12 text-gray-400">Lade...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin – Alle Buchungen</h1>

      {bookings.length === 0 ? (
        <p className="text-gray-500">Keine Buchungen vorhanden.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Datum</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Platz</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Zeit</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nutzer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 text-sm">
                    {new Date(b.date + "T00:00:00").toLocaleDateString("de-DE")}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{b.spot.label}</td>
                  <td className="px-4 py-3 text-sm">
                    {b.startTime}–{b.endTime}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div>{b.user.name}</div>
                    <div className="text-gray-400 text-xs">{b.user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[b.status] || ""}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
