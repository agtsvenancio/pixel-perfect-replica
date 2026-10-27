// One API surface for the order form and the admin panel, with two back-ends:
//  - Node build (Hostinger Node.js app, Vercel, Lovable): TanStack Start server functions.
//  - Static build for public_html (VITE_STATIC_API=1): PHP endpoints in /api.
// Call sites are identical in both builds.
import {
  adminDeleteOrder as fnDelete,
  adminListOrders as fnList,
  adminLogin as fnLogin,
  adminLogout as fnLogout,
  adminSession as fnSession,
  adminUpdateOrder as fnUpdate,
  createOrder as fnCreate,
  type CreateOrderInput,
} from "./functions";
import type { OrderRecord, OrderStatus } from "./types";

const STATIC = import.meta.env["VITE_STATIC_API"] === "1";

async function php<T>(file: string, action: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/${file}?action=${encodeURIComponent(action)}`, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? null : JSON.stringify(body),
    credentials: "same-origin",
  });
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON error page */
  }
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) {
    const msg = (json as { error?: string } | null)?.error ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return json as T;
}

type Session = { configured: boolean; loggedIn: boolean; storage: "mysql" | "file" };
type LoginResult = { ok: true } | { ok: false; error: string };

export function createOrder(args: { data: CreateOrderInput }): Promise<{ ok: true; reference: string }> {
  return STATIC ? php("orders.php", "create", args.data) : fnCreate(args);
}

export function adminSession(): Promise<Session> {
  return STATIC ? php("admin.php", "session") : fnSession();
}

export function adminLogin(args: { data: { email: string; password: string } }): Promise<LoginResult> {
  return STATIC ? php("admin.php", "login", args.data) : fnLogin(args);
}

export function adminLogout(): Promise<{ ok: boolean }> {
  return STATIC ? php("admin.php", "logout", {}) : fnLogout();
}

export function adminListOrders(): Promise<OrderRecord[]> {
  return STATIC ? php("admin.php", "list") : fnList();
}

export function adminUpdateOrder(args: {
  data: { id: number; status?: OrderStatus; adminNotes?: string };
}): Promise<OrderRecord> {
  return STATIC ? php("admin.php", "update", args.data) : fnUpdate(args);
}

export function adminDeleteOrder(args: { data: { id: number } }): Promise<{ ok: boolean }> {
  return STATIC ? php("admin.php", "delete", args.data) : fnDelete(args);
}
