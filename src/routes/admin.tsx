import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Printer,
  RefreshCw,
  Search,
  Store,
  Trash2,
  Truck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { site } from "@/config/site";
import { money } from "@/lib/cart";
import { cn } from "@/lib/utils";
import {
  adminDeleteOrder,
  adminListOrders,
  adminLogin,
  adminLogout,
  adminSession,
  adminUpdateOrder,
} from "@/orders/client";
import { ORDER_STATUSES, STATUS_LABEL, type OrderRecord, type OrderStatus } from "@/orders/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Orders · Italian Bites Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type Session = { configured: boolean; loggedIn: boolean; storage: "mysql" | "file" };

const STATUS_STYLE: Record<OrderStatus, string> = {
  new: "bg-price/15 text-[color:var(--price)] border-price/30",
  confirmed: "bg-primary/10 text-primary border-primary/30",
  completed: "bg-olive/15 text-olive border-olive/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

function fmtDate(d: string) {
  // d = YYYY-MM-DD (event date, local) — format without timezone shifts
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, day ?? 1).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
function fmtTime(t: string) {
  const [h = 0, m = 0] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${ap}`;
}
function fmtCreated(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
const trays = (o: OrderRecord) => o.items.reduce((s, i) => s + i.quantity, 0);
const todayStr = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    adminSession()
      .then(setSession)
      .catch(() => setSession({ configured: false, loggedIn: false, storage: "file" }));
  }, []);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!session.loggedIn)
    return (
      <Login
        configured={session.configured}
        onDone={() => setSession({ ...session, loggedIn: true })}
      />
    );
  return (
    <Dashboard
      storage={session.storage}
      onLogout={() => setSession({ ...session, loggedIn: false })}
    />
  );
}

function Login({ configured, onDone }: { configured: boolean; onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const r = await adminLogin({ data: { email, password: pw } });
      if (r.ok) onDone();
      else setErr(r.error);
    } catch {
      setErr("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-soft"
      >
        <p className="sign text-2xl">Italian Bites Admin</p>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to see and manage orders.</p>
        {!configured && (
          <p className="mt-5 flex gap-2 rounded-xl bg-price/10 p-3 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-price" />
            Set the <code className="font-mono">ADMIN_PASSWORD</code> environment variable on the
            server first.
          </p>
        )}
        <label htmlFor="email" className="mt-6 block text-sm font-semibold">
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoFocus
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 h-11"
        />
        <label htmlFor="pw" className="mt-4 block text-sm font-semibold">
          Password
        </label>
        <Input
          id="pw"
          type="password"
          autoComplete="current-password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="mt-2 h-11"
        />
        {err && <p className="mt-2 text-sm font-medium text-destructive">{err}</p>}
        <Button
          type="submit"
          variant="hero"
          className="mt-6 h-11 w-full"
          disabled={busy || !pw || !email}
        >
          {busy ? <Loader2 className="animate-spin" /> : "Sign in"}
        </Button>
      </form>
    </div>
  );
}

type Filter = "all" | "upcoming" | OrderStatus;

function Dashboard({ storage, onLogout }: { storage: "mysql" | "file"; onLogout: () => void }) {
  const [orders, setOrders] = useState<OrderRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>("new");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"created" | "event">("created");
  const [openId, setOpenId] = useState<number | null>(null);

  const load = useCallback(
    async (quiet = false) => {
      if (!quiet) setLoading(true);
      try {
        setOrders(await adminListOrders());
      } catch (e) {
        if (String(e).includes("UNAUTHORIZED")) onLogout();
        else toast.error("Could not load orders");
      } finally {
        setLoading(false);
      }
    },
    [onLogout],
  );

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 60_000);
    return () => clearInterval(t);
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: 0,
      upcoming: 0,
      new: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };
    const today = todayStr();
    for (const o of orders ?? []) {
      c.all++;
      c[o.status]++;
      if (o.event.date >= today && o.status !== "cancelled" && o.status !== "completed")
        c.upcoming++;
    }
    return c;
  }, [orders]);

  useEffect(() => {
    document.title = counts.new
      ? `(${counts.new}) Orders · Italian Bites`
      : "Orders · Italian Bites";
  }, [counts.new]);

  const visible = useMemo(() => {
    const today = todayStr();
    const term = q.trim().toLowerCase();
    let list = (orders ?? []).filter((o) => {
      if (filter === "upcoming")
        return o.event.date >= today && o.status !== "cancelled" && o.status !== "completed";
      return filter === "all" || o.status === filter;
    });
    if (term)
      list = list.filter((o) =>
        [
          o.reference,
          o.customer.name,
          o.customer.phone,
          o.customer.email,
          o.customer.company,
          o.address ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(term),
      );
    if (sort === "event" || filter === "upcoming")
      list = [...list].sort((a, b) =>
        (a.event.date + a.event.time).localeCompare(b.event.date + b.event.time),
      );
    return list;
  }, [orders, filter, q, sort]);

  const openOrder = orders?.find((o) => o.id === openId) ?? null;
  const replace = (rec: OrderRecord) =>
    setOrders((all) => all?.map((o) => (o.id === rec.id ? rec : o)) ?? null);

  const tabs: { id: Filter; label: string }[] = [
    { id: "new", label: "New" },
    { id: "upcoming", label: "Upcoming" },
    { id: "confirmed", label: "Confirmed" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
    { id: "all", label: "All" },
  ];

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
          <p className="sign text-xl">Italian Bites Orders</p>
          <div className="flex items-center gap-2">
            <Button
              variant="soft"
              className="h-9 px-3"
              onClick={() => load()}
              disabled={loading}
              aria-label="Refresh"
            >
              <RefreshCw className={cn(loading && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              variant="soft"
              className="h-9 px-3"
              onClick={async () => {
                await adminLogout();
                onLogout();
              }}
            >
              <LogOut /> <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {storage === "file" && (
          <p className="mb-5 flex gap-2 rounded-2xl border border-price/30 bg-price/10 p-4 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-price" />
            {import.meta.env["VITE_STATIC_API"] === "1" ? (
              <span>
                No database connected yet, so new orders can't be saved. Fill in the MySQL details
                in <code className="font-mono">api/config.php</code>.
              </span>
            ) : (
              <span>
                Orders are being saved to a local file (no database configured). Connect MySQL with
                the <code className="font-mono">DB_HOST / DB_USER / DB_PASSWORD / DB_NAME</code>{" "}
                variables so orders aren't lost on redeploy.
              </span>
            )}
          </p>
        )}

        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="New — need a call" value={counts.new} accent />
          <Stat label="Upcoming events" value={counts.upcoming} />
          <Stat label="Confirmed" value={counts.confirmed} />
          <Stat label="All orders" value={counts.all} />
        </div>

        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={cn(
                  "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold",
                  filter === t.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary",
                )}
              >
                {t.label} <span className="opacity-60">{counts[t.id]}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Name, phone, order #"
                className="h-10 bg-card pl-9"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "created" | "event")}
              className="h-10 rounded-md border border-input bg-card px-3 text-sm"
              aria-label="Sort"
            >
              <option value="created">Newest first</option>
              <option value="event">By event date</option>
            </select>
          </div>
        </div>

        {orders === null ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
            No orders here{q ? " matching your search" : ""}.
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="border-b border-border bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Event</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                  <th className="px-5 py-3 text-right font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setOpenId(o.id)}
                    className="cursor-pointer hover:bg-secondary/40"
                  >
                    <td className="px-5 py-4">
                      <p className="font-mono font-semibold">{o.reference}</p>
                      <p className="text-xs text-muted-foreground">{fmtCreated(o.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold">{o.customer.name}</p>
                      <p className="text-xs text-muted-foreground">{o.customer.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {fmtDate(o.event.date)} · {fmtTime(o.event.time)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {o.event.guests} guests · {trays(o)} trays
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <FulfillmentBadge f={o.fulfillment} />
                    </td>
                    <td className="px-5 py-4 text-right font-semibold tabular-nums">
                      {money(o.subtotal)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge s={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className="divide-y divide-border md:hidden">
              {visible.map((o) => (
                <li key={o.id}>
                  <button onClick={() => setOpenId(o.id)} className="w-full px-4 py-4 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{o.customer.name}</span>
                      <StatusBadge s={o.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {fmtDate(o.event.date)} · {fmtTime(o.event.time)} · {o.event.guests} guests
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <FulfillmentBadge f={o.fulfillment} />
                      <span className="font-semibold">{money(o.subtotal)}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <OrderSheet
        order={openOrder}
        onClose={() => setOpenId(null)}
        onChange={replace}
        onDeleted={(id) => {
          setOrders((all) => all?.filter((o) => o.id !== id) ?? null);
          setOpenId(null);
        }}
        onUnauthorized={onLogout}
      />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-4 shadow-soft",
        accent && value > 0 ? "border-price/40" : "border-border",
      )}
    >
      <p className={cn("font-serif text-3xl font-semibold", accent && value > 0 && "text-price")}>
        {value}
      </p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

function StatusBadge({ s }: { s: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        STATUS_STYLE[s],
      )}
    >
      {STATUS_LABEL[s]}
    </span>
  );
}

function FulfillmentBadge({ f }: { f: "delivery" | "pickup" }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
      {f === "delivery" ? (
        <Truck className="size-4 text-primary" />
      ) : (
        <Store className="size-4 text-olive" />
      )}
      {f === "delivery" ? "Delivery" : "Pickup"}
    </span>
  );
}

function OrderSheet({
  order,
  onClose,
  onChange,
  onDeleted,
  onUnauthorized,
}: {
  order: OrderRecord | null;
  onClose: () => void;
  onChange: (o: OrderRecord) => void;
  onDeleted: (id: number) => void;
  onUnauthorized: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => setNotes(order?.adminNotes ?? ""), [order?.id, order?.adminNotes]);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      if (String(e).includes("UNAUTHORIZED")) onUnauthorized();
      else toast.error("Something went wrong");
    } finally {
      setBusy(null);
    }
  };

  const setStatus = (status: OrderStatus) =>
    run(status, async () => {
      onChange(await adminUpdateOrder({ data: { id: order!.id, status } }));
      toast.success(`Marked as ${STATUS_LABEL[status]}`);
    });

  return (
    <Sheet open={!!order} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        {order && (
          <>
            <SheetHeader className="border-b border-border px-6 py-5 text-left">
              <div className="flex items-center gap-3">
                <SheetTitle className="font-mono text-xl">{order.reference}</SheetTitle>
                <StatusBadge s={order.status} />
              </div>
              <SheetDescription>Placed {fmtCreated(order.createdAt)}</SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <div className="flex flex-wrap gap-2">
                {ORDER_STATUSES.map((s) => (
                  <Button
                    key={s}
                    variant={order.status === s ? "hero" : "soft"}
                    className="h-9 px-4"
                    disabled={busy !== null || order.status === s}
                    onClick={() => setStatus(s)}
                  >
                    {busy === s && <Loader2 className="animate-spin" />}
                    {STATUS_LABEL[s]}
                  </Button>
                ))}
              </div>

              <Block title="Customer">
                <p className="text-lg font-semibold">{order.customer.name}</p>
                {order.customer.company && (
                  <p className="text-sm text-muted-foreground">{order.customer.company}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <LinkChip
                    href={`tel:${order.customer.phone.replace(/[^\d+]/g, "")}`}
                    icon={<Phone className="size-4" />}
                  >
                    {order.customer.phone}
                  </LinkChip>
                  <LinkChip
                    href={`sms:${order.customer.phone.replace(/[^\d+]/g, "")}`}
                    icon={<MessageSquare className="size-4" />}
                  >
                    Text
                  </LinkChip>
                  <LinkChip
                    href={`mailto:${order.customer.email}?subject=Your Italian Bites order ${order.reference}`}
                    icon={<Mail className="size-4" />}
                  >
                    {order.customer.email}
                  </LinkChip>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Prefers: {order.customer.preferredContact}
                </p>
              </Block>

              <Block title={order.fulfillment === "delivery" ? "Delivery" : "Pickup"}>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-primary" />
                    <strong>
                      {fmtDate(order.event.date)} at {fmtTime(order.event.time)}
                    </strong>
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="size-4 text-primary" /> {order.event.guests} guests ·{" "}
                    {order.event.type}
                  </p>
                  {order.fulfillment === "delivery" && order.address ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start gap-2 font-medium text-primary hover:underline"
                    >
                      <MapPin className="mt-0.5 size-4 shrink-0" /> {order.address}
                    </a>
                  ) : (
                    <p className="flex items-start gap-2">
                      <Store className="mt-0.5 size-4 shrink-0 text-olive" /> Customer picks up at
                      the kitchen
                    </p>
                  )}
                </div>
              </Block>

              <Block title="Items">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border">
                    {order.items.map((i) => (
                      <tr key={`${i.id}-${i.size}`}>
                        <td className="py-2 pr-2 font-semibold tabular-nums">{i.quantity}×</td>
                        <td className="py-2">
                          {i.name}
                          <span className="block text-xs text-muted-foreground">
                            {i.size} · {money(i.unitPrice)} each
                          </span>
                        </td>
                        <td className="py-2 text-right tabular-nums">{money(i.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
                  <span className="text-sm text-muted-foreground">
                    To collect {order.fulfillment === "delivery" ? "on delivery" : "at pickup"}{" "}
                    (before tax/fees)
                  </span>
                  <span className="font-serif text-2xl font-semibold text-price">
                    {money(order.subtotal)}
                  </span>
                </div>
              </Block>

              {order.notes && (
                <Block title="Customer notes">
                  <p className="whitespace-pre-wrap text-sm">{order.notes}</p>
                </Block>
              )}

              <Block title="Internal notes">
                <Textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Only visible here"
                />
                <Button
                  variant="soft"
                  className="mt-2 h-9 px-4"
                  disabled={busy !== null || notes === order.adminNotes}
                  onClick={() =>
                    run("notes", async () => {
                      onChange(
                        await adminUpdateOrder({ data: { id: order.id, adminNotes: notes } }),
                      );
                      toast.success("Notes saved");
                    })
                  }
                >
                  {busy === "notes" && <Loader2 className="animate-spin" />} Save notes
                </Button>
              </Block>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-border bg-card px-6 py-4">
              <Button variant="soft" className="h-10 px-4" onClick={() => printOrder(order)}>
                <Printer /> Print
              </Button>
              <Button
                variant="ghost"
                className="h-10 px-3 text-destructive hover:text-destructive"
                disabled={busy !== null}
                onClick={() => {
                  if (!confirm(`Delete order ${order.reference}? This can't be undone.`)) return;
                  run("delete", async () => {
                    await adminDeleteOrder({ data: { id: order.id } });
                    onDeleted(order.id);
                    toast.success("Order deleted");
                  });
                }}
              >
                <Trash2 /> Delete
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function LinkChip({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium hover:border-primary hover:text-primary"
    >
      {icon}
      {children}
    </a>
  );
}

function printOrder(o: OrderRecord) {
  const esc = (s: string) =>
    s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  const rows = o.items
    .map(
      (i) =>
        `<tr><td>${i.quantity}×</td><td>${esc(i.name)} <small>(${esc(i.size)})</small></td><td style="text-align:right">${money(i.lineTotal)}</td></tr>`,
    )
    .join("");
  const w = window.open("", "_blank", "width=720,height=900");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><title>${o.reference}</title><style>
    body{font-family:system-ui,sans-serif;padding:32px;color:#222} h1{margin:0 0 4px} table{width:100%;border-collapse:collapse;margin-top:12px}
    td{padding:6px 4px;border-bottom:1px solid #ddd} .muted{color:#666} .total{font-size:20px;font-weight:700;text-align:right;margin-top:12px}
    .box{border:1px solid #ccc;border-radius:8px;padding:12px;margin-top:16px}</style></head><body>
    <h1>${esc(site.name)} — ${o.reference}</h1><div class="muted">Placed ${fmtCreated(o.createdAt)} · Status: ${STATUS_LABEL[o.status]}</div>
    <div class="box"><strong>${esc(o.customer.name)}</strong>${o.customer.company ? ` · ${esc(o.customer.company)}` : ""}<br>${esc(o.customer.phone)} · ${esc(o.customer.email)}</div>
    <div class="box"><strong>${o.fulfillment === "delivery" ? "DELIVERY" : "PICKUP"}</strong> — ${fmtDate(o.event.date)} at ${fmtTime(o.event.time)}<br>
    ${o.fulfillment === "delivery" ? esc(o.address ?? "") : "At the kitchen: " + esc(site.address.full)}<br>${o.event.guests} guests · ${esc(o.event.type)}</div>
    <table>${rows}</table><div class="total">To collect: ${money(o.subtotal)}</div>
    ${o.notes ? `<div class="box"><strong>Notes:</strong> ${esc(o.notes)}</div>` : ""}
    <script>window.onload=()=>{window.print()}</script></body></html>`);
  w.document.close();
}
