"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          🅿️ Parkplatz
        </Link>

        {session?.user ? (
          <div className="flex items-center gap-4">
            <Link
              href="/buchen"
              className="hover:text-blue-300 transition-colors"
            >
              Buchen
            </Link>
            <Link
              href="/meine-buchungen"
              className="hover:text-blue-300 transition-colors"
            >
              Meine Buchungen
            </Link>
            {session.user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="hover:text-yellow-300 transition-colors"
              >
                Admin
              </Link>
            )}
            <span className="text-gray-400 text-sm">{session.user.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/anmelden" })}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm transition-colors"
            >
              Abmelden
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/anmelden"
              className="hover:text-blue-300 transition-colors"
            >
              Anmelden
            </Link>
            <Link
              href="/registrieren"
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded transition-colors"
            >
              Registrieren
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
