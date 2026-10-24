// Server-only order storage.
// Production: MySQL (set DATABASE_URL, or DB_HOST / DB_USER / DB_PASSWORD / DB_NAME [/ DB_PORT]).
// Development fallback: a JSON file in DATA_DIR (default ./data) when no database is configured.
import type { OrderRecord, OrderStatus } from "./types";

export type NewOrder = Omit<OrderRecord, "id" | "status" | "adminNotes" | "updatedAt">;

export interface OrderStore {
  insert(o: NewOrder): Promise<OrderRecord>;
  list(): Promise<OrderRecord[]>;
  update(
    id: number,
    patch: { status?: OrderStatus; adminNotes?: string },
  ): Promise<OrderRecord | null>;
  remove(id: number): Promise<boolean>;
}

const env = (k: string) => (typeof process !== "undefined" ? process.env[k] : undefined);

export function storageMode(): "mysql" | "file" {
  return env("DATABASE_URL") || env("DB_HOST") ? "mysql" : "file";
}

let storePromise: Promise<OrderStore> | undefined;
export function getStore(): Promise<OrderStore> {
  if (!storePromise) {
    storePromise = (storageMode() === "mysql" ? createMysqlStore() : createFileStore()).catch(
      (e) => {
        storePromise = undefined; // retry on next request
        throw e;
      },
    );
  }
  return storePromise;
}

/* ------------------------------- MySQL ------------------------------- */

type Row = {
  id: number;
  reference: string;
  created_at: Date | string;
  updated_at: Date | string;
  status: OrderStatus;
  customer_name: string;
  company: string;
  email: string;
  phone: string;
  preferred_contact: string;
  fulfillment: "delivery" | "pickup";
  address: string | null;
  event_type: string;
  event_date: string;
  event_time: string;
  guests: number;
  notes: string;
  items_json: string;
  subtotal: number | string;
  admin_notes: string;
};

const iso = (v: Date | string) => (v instanceof Date ? v.toISOString() : new Date(v).toISOString());

function fromRow(r: Row): OrderRecord {
  return {
    id: Number(r.id),
    reference: r.reference,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
    status: r.status,
    customer: {
      name: r.customer_name,
      company: r.company,
      email: r.email,
      phone: r.phone,
      preferredContact: r.preferred_contact,
    },
    fulfillment: r.fulfillment,
    address: r.address,
    event: { type: r.event_type, date: r.event_date, time: r.event_time, guests: Number(r.guests) },
    notes: r.notes,
    items: JSON.parse(r.items_json || "[]"),
    subtotal: Number(r.subtotal),
    adminNotes: r.admin_notes ?? "",
  };
}

async function createMysqlStore(): Promise<OrderStore> {
  const mysql = await import("mysql2/promise");
  const url = env("DATABASE_URL");
  const pool = url
    ? mysql.createPool({ uri: url, connectionLimit: 5 })
    : mysql.createPool({
        host: env("DB_HOST") ?? "localhost",
        port: Number(env("DB_PORT") || 3306),
        user: env("DB_USER") ?? "",
        password: env("DB_PASSWORD") ?? "",
        database: env("DB_NAME") ?? "",
        connectionLimit: 5,
      });

  await pool.query(`CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(20) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    customer_name VARCHAR(200) NOT NULL,
    company VARCHAR(200) NOT NULL DEFAULT '',
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    preferred_contact VARCHAR(20) NOT NULL DEFAULT 'Phone',
    fulfillment VARCHAR(10) NOT NULL,
    address VARCHAR(500) NULL,
    event_type VARCHAR(60) NOT NULL,
    event_date VARCHAR(10) NOT NULL,
    event_time VARCHAR(5) NOT NULL,
    guests INT NOT NULL,
    notes TEXT NOT NULL,
    items_json LONGTEXT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    admin_notes TEXT NOT NULL,
    INDEX idx_status (status),
    INDEX idx_event_date (event_date)
  ) DEFAULT CHARSET=utf8mb4`);

  const byId = async (id: number) => {
    const [rows] = await pool.query("SELECT * FROM orders WHERE id = ?", [id]);
    const r = (rows as Row[])[0];
    return r ? fromRow(r) : null;
  };

  return {
    async insert(o) {
      const now = new Date(o.createdAt);
      const [res] = await pool.execute(
        `INSERT INTO orders (reference, created_at, updated_at, status, customer_name, company, email, phone,
          preferred_contact, fulfillment, address, event_type, event_date, event_time, guests, notes, items_json, subtotal, admin_notes)
         VALUES (?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '')`,
        [
          o.reference,
          now,
          now,
          o.customer.name,
          o.customer.company,
          o.customer.email,
          o.customer.phone,
          o.customer.preferredContact,
          o.fulfillment,
          o.address,
          o.event.type,
          o.event.date,
          o.event.time,
          o.event.guests,
          o.notes,
          JSON.stringify(o.items),
          o.subtotal,
        ],
      );
      const id = (res as { insertId: number }).insertId;
      return (await byId(id))!;
    },
    async list() {
      const [rows] = await pool.query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 2000");
      return (rows as Row[]).map(fromRow);
    },
    async update(id, patch) {
      const sets: string[] = [];
      const vals: unknown[] = [];
      if (patch.status) {
        sets.push("status = ?");
        vals.push(patch.status);
      }
      if (patch.adminNotes !== undefined) {
        sets.push("admin_notes = ?");
        vals.push(patch.adminNotes);
      }
      if (!sets.length) return byId(id);
      sets.push("updated_at = ?");
      vals.push(new Date(), id);
      await pool.execute(`UPDATE orders SET ${sets.join(", ")} WHERE id = ?`, vals as never[]);
      return byId(id);
    },
    async remove(id) {
      const [res] = await pool.execute("DELETE FROM orders WHERE id = ?", [id]);
      return (res as { affectedRows: number }).affectedRows > 0;
    },
  };
}

/* ------------------------------ JSON file ----------------------------- */

async function createFileStore(): Promise<OrderStore> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = env("DATA_DIR") || path.join(process.cwd(), "data");
  const file = path.join(dir, "orders.json");
  await fs.mkdir(dir, { recursive: true });

  let chain: Promise<unknown> = Promise.resolve();
  const read = async (): Promise<OrderRecord[]> => {
    try {
      return JSON.parse(await fs.readFile(file, "utf8"));
    } catch {
      return [];
    }
  };
  const write = async (all: OrderRecord[]) => {
    const tmp = `${file}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(all, null, 2));
    await fs.rename(tmp, file);
  };
  // serialize writes
  const locked = <T>(fn: () => Promise<T>): Promise<T> => {
    const p = chain.then(fn, fn);
    chain = p.catch(() => undefined);
    return p;
  };

  return {
    insert: (o) =>
      locked(async () => {
        const all = await read();
        const rec: OrderRecord = {
          ...o,
          id: all.reduce((m, x) => Math.max(m, x.id), 0) + 1,
          status: "new",
          adminNotes: "",
          updatedAt: o.createdAt,
        };
        all.push(rec);
        await write(all);
        return rec;
      }),
    list: async () => (await read()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    update: (id, patch) =>
      locked(async () => {
        const all = await read();
        const rec = all.find((x) => x.id === id);
        if (!rec) return null;
        if (patch.status) rec.status = patch.status;
        if (patch.adminNotes !== undefined) rec.adminNotes = patch.adminNotes;
        rec.updatedAt = new Date().toISOString();
        await write(all);
        return rec;
      }),
    remove: (id) =>
      locked(async () => {
        const all = await read();
        const next = all.filter((x) => x.id !== id);
        if (next.length === all.length) return false;
        await write(next);
        return true;
      }),
  };
}
