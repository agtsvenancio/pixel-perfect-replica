// Server functions for orders and the admin panel.
// Server-only modules are imported lazily inside handlers so they never reach the browser bundle.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { site } from "@/config/site";
import { eventTypes } from "@/data/content";
import { getMenuItem } from "@/data/menu";
import { ORDER_STATUSES, type OrderItem, type OrderRecord } from "./types";

/* ----------------------------- Public: create ----------------------------- */

const orderInput = z
  .object({
    customer: z.object({
      name: z.string().trim().min(2).max(200),
      company: z.string().trim().max(200).default(""),
      email: z.string().trim().email().max(200),
      phone: z
        .string()
        .trim()
        .max(50)
        .refine((p) => p.replace(/\D/g, "").length >= 10, "Invalid phone"),
      preferredContact: z.enum(["Phone", "Text", "Email"]).default("Phone"),
    }),
    fulfillment: z.enum(["delivery", "pickup"]),
    address: z.string().trim().max(500).optional().default(""),
    event: z.object({
      type: z.enum(eventTypes),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      time: z.string().regex(/^\d{2}:\d{2}$/),
      guests: z.number().int().min(1).max(5000),
    }),
    notes: z.string().trim().max(2000).default(""),
    items: z
      .array(
        z.object({ id: z.string(), size: z.string(), quantity: z.number().int().min(1).max(500) }),
      )
      .min(1)
      .max(100),
    website: z.string().optional(), // honeypot — must stay empty
  })
  .superRefine((o, ctx) => {
    if (o.fulfillment === "delivery" && o.address.length < 6)
      ctx.addIssue({ code: "custom", path: ["address"], message: "Delivery address is required" });
  });

export type CreateOrderInput = z.input<typeof orderInput>;

function generateReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `IB-${s}`;
}

export const createOrder = createServerFn({ method: "POST" })
  .validator((data: CreateOrderInput) => orderInput.parse(data))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true as const, reference: generateReference() }; // silently drop bots

    // Prices always come from the server-side menu, never from the browser.
    const items: OrderItem[] = data.items.map((l) => {
      const m = getMenuItem(l.id);
      if (!m) throw new Error(`Unknown menu item: ${l.id}`);
      const size = m.sizes?.find((s) => s.label === l.size);
      const unitPrice = size?.price ?? m.price;
      return {
        id: m.id,
        name: m.name,
        category: m.category,
        size: size?.label ?? m.sizeLabel,
        unitPrice,
        quantity: l.quantity,
        lineTotal: unitPrice * l.quantity,
      };
    });
    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    if (subtotal < site.minimumOrder) throw new Error(`Minimum order is $${site.minimumOrder}`);

    // Lead time (1 day of slack for time zones)
    const earliest = new Date();
    earliest.setDate(earliest.getDate() + site.leadTimeDays - 1);
    if (data.event.date < earliest.toISOString().slice(0, 10))
      throw new Error(`Please order at least ${site.leadTimeDays} days ahead`);

    const { getStore } = await import("./db.server");
    const store = await getStore();
    const rec = await store.insert({
      reference: generateReference(),
      createdAt: new Date().toISOString(),
      customer: data.customer,
      fulfillment: data.fulfillment,
      address: data.fulfillment === "delivery" ? data.address : null,
      event: data.event,
      notes: data.notes,
      items,
      subtotal,
    });
    return { ok: true as const, reference: rec.reference };
  });

/* --------------------------------- Admin --------------------------------- */

export const adminSession = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await import("./auth.server");
  const { storageMode } = await import("./db.server");
  return { configured: auth.adminConfigured(), loggedIn: auth.isAdmin(), storage: storageMode() };
});

const failedLogins = new Map<string, { n: number; until: number }>();

export const adminLogin = createServerFn({ method: "POST" })
  .validator((d: { password: string }) => z.object({ password: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const auth = await import("./auth.server");
    const key = "global";
    const f = failedLogins.get(key);
    if (f && f.until > Date.now())
      return { ok: false as const, error: "Too many attempts. Wait a minute and try again." };
    if (!auth.adminConfigured())
      return { ok: false as const, error: "ADMIN_PASSWORD is not set on the server." };
    if (!auth.checkPassword(data.password)) {
      const n = (f?.n ?? 0) + 1;
      failedLogins.set(key, { n, until: n >= 5 ? Date.now() + 60_000 : 0 });
      await new Promise((r) => setTimeout(r, 600));
      return { ok: false as const, error: "Wrong password." };
    }
    failedLogins.delete(key);
    auth.startSession();
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const auth = await import("./auth.server");
  auth.endSession();
  return { ok: true };
});

export const adminListOrders = createServerFn({ method: "GET" }).handler(
  async (): Promise<OrderRecord[]> => {
    const auth = await import("./auth.server");
    auth.requireAdmin();
    const { getStore } = await import("./db.server");
    return (await getStore()).list();
  },
);

export const adminUpdateOrder = createServerFn({ method: "POST" })
  .validator(
    (d: { id: number; status?: (typeof ORDER_STATUSES)[number]; adminNotes?: string }) =>
      z
        .object({
          id: z.number().int(),
          status: z.enum(ORDER_STATUSES).optional(),
          adminNotes: z.string().max(5000).optional(),
        })
        .parse(d),
  )
  .handler(async ({ data }) => {
    const auth = await import("./auth.server");
    auth.requireAdmin();
    const { getStore } = await import("./db.server");
    const patch: { status?: (typeof ORDER_STATUSES)[number]; adminNotes?: string } = {};
    if (data.status) patch.status = data.status;
    if (data.adminNotes !== undefined) patch.adminNotes = data.adminNotes;
    const rec = await (await getStore()).update(data.id, patch);
    if (!rec) throw new Error("Order not found");
    return rec;
  });

export const adminDeleteOrder = createServerFn({ method: "POST" })
  .validator((d: { id: number }) => z.object({ id: z.number().int() }).parse(d))
  .handler(async ({ data }) => {
    const auth = await import("./auth.server");
    auth.requireAdmin();
    const { getStore } = await import("./db.server");
    return { ok: await (await getStore()).remove(data.id) };
  });
