import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/buchen");
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center max-w-lg px-4">
        <h1 className="text-5xl font-bold mb-4">Parkplatz</h1>
        <p className="text-xl text-gray-500 mb-8">
          Flexible Tiefgaragen-Buchung für alle Mitarbeiter.
          <br />
          Wähle deinen Slot, zahle per PayPal – fertig!
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/anmelden"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Anmelden
          </a>
          <a
            href="/registrieren"
            className="bg-white text-gray-700 px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Registrieren
          </a>
        </div>
      </div>
    </div>
  );
}
