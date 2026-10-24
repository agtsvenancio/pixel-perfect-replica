// Shared order types (safe to import from client and server).

export const ORDER_STATUSES = ["new", "confirmed", "completed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export type OrderItem = {
  id: string;
  name: string;
  category: string;
  size: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type OrderRecord = {
  id: number;
  reference: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  customer: {
    name: string;
    company: string;
    email: string;
    phone: string;
    preferredContact: string;
  };
  fulfillment: "delivery" | "pickup";
  /** Delivery address. Null for pickup orders. */
  address: string | null;
  event: { type: string; date: string; time: string; guests: number };
  notes: string;
  items: OrderItem[];
  subtotal: number;
  adminNotes: string;
};
