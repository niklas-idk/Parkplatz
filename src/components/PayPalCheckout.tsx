"use client";

import { PayPalButtons } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";

interface PayPalCheckoutProps {
  bookingId: string;
  onSuccess?: () => void;
}

export default function PayPalCheckout({ bookingId, onSuccess }: PayPalCheckoutProps) {
  const router = useRouter();

  return (
    <PayPalButtons
      style={{ layout: "vertical", label: "pay" }}
      createOrder={async () => {
        const res = await fetch("/api/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        });
        const data = await res.json();
        return data.orderID;
      }}
      onApprove={async (data) => {
        const res = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderID: data.orderID }),
        });
        const result = await res.json();
        if (result.success) {
          onSuccess?.();
          router.push("/meine-buchungen?success=1");
        }
      }}
      onError={() => {
        alert("Zahlung fehlgeschlagen. Bitte versuche es erneut.");
      }}
    />
  );
}
