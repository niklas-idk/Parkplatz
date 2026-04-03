export const TIME_SLOTS = [
  { id: "ganzer-tag", label: "Ganzer Tag", start: "08:00", end: "18:00", price: 5.0 },
  { id: "vormittag", label: "Vormittag", start: "08:00", end: "13:00", price: 3.0 },
  { id: "nachmittag", label: "Nachmittag", start: "13:00", end: "18:00", price: 3.0 },
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

export function getSlotById(slotId: string): TimeSlot | undefined {
  return TIME_SLOTS.find((s) => s.id === slotId);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}
