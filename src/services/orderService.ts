// Single integration point for the future back-end.
// Set VITE_ORDER_API_URL to POST real orders; when unset, success is simulated.

export type OrderPayload = {
  reference: string;
  createdAt: string;
  customer: {
    name: string;
    company: string;
    email: string;
    phone: string;
    preferredContact: string;
  };
  event: {
    type: string;
    date: string;
    time: string;
    guests: number;
    fulfillment: "delivery" | "pickup";
    address: string;
    notes: string;
  };
  items: {
    id: string;
    name: string;
    category: string;
    size: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
  packageIds: string[];
  subtotal: number;
  source: "website";
};

export function generateReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `IB-${s}`;
}

export async function submitOrder(payload: OrderPayload): Promise<{ ok: true; reference: string }> {
  const url = import.meta.env["VITE_ORDER_API_URL"] as string | undefined;
  if (!url) {
    console.log("[orderService] VITE_ORDER_API_URL not set — simulating success", payload);
    await new Promise((r) => setTimeout(r, 900));
    return { ok: true, reference: payload.reference };
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Order submission failed (${res.status})`);
  return { ok: true, reference: payload.reference };
}
