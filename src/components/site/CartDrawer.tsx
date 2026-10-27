import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Loader2,
  MapPin,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { site } from "@/config/site";
import { eventTypes } from "@/data/content";
import { lineInfo, money, useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { createOrder } from "@/orders/client";
import { MinimumProgress } from "./OrderSummary";
import { QtyStepper, SafeImage, scrollTo } from "./primitives";

type Form = {
  name: string;
  company: string;
  email: string;
  phone: string;
  preferredContact: "Phone" | "Text" | "Email";
  eventType: string;
  date: string;
  time: string;
  guests: string;
  fulfillment: "delivery" | "pickup";
  address: string;
  notes: string;
};

const emptyForm: Form = {
  name: "",
  company: "",
  email: "",
  phone: "",
  preferredContact: "Phone",
  eventType: "",
  date: "",
  time: "",
  guests: "",
  fulfillment: "delivery",
  address: "",
  notes: "",
};

const FORM_KEY = "ib-order-form-v1";

function isoDate(d: Date) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function CartDrawer() {
  const cart = useCart();
  const { open, setOpen, lines, subtotal, servesApprox, count, presetEvent, view, setView } = cart;
  const [done, setDone] = useState<null | {
    reference: string;
    firstName: string;
    fulfillment: Form["fulfillment"];
  }>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  // Restore a half-filled form
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FORM_KEY);
      if (raw) setForm({ ...emptyForm, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(FORM_KEY, JSON.stringify(form));
    } catch {
      /* ignore */
    }
  }, [form]);

  useEffect(() => {
    if (presetEvent) setForm((f) => ({ ...f, eventType: presetEvent }));
  }, [presetEvent]);

  useEffect(() => {
    if (!open) {
      setDone(null);
      if (lines.length === 0) setView("cart");
    }
  }, [open, lines.length, setView]);

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + site.leadTimeDays);
    return isoDate(d);
  }, []);

  const belowMinimum = subtotal < site.minimumOrder;
  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (form.name.trim().length < 2) e.name = "Please enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email";
    if (form.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a valid phone number";
    if (!form.eventType) e.eventType = "Choose an event type";
    if (!form.date) e.date = "Choose a date";
    else if (form.date < minDate)
      e.date = `Please order at least ${site.leadTimeDays} days ahead (or call us)`;
    if (!form.time) e.time = "Choose a time";
    const g = Number(form.guests);
    if (!g || g < 1) e.guests = "How many guests?";
    if (form.fulfillment === "delivery" && form.address.trim().length < 6)
      e.address = "Enter the delivery address";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error("Please check the highlighted fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createOrder({
        data: {
          customer: {
            name: form.name.trim(),
            company: form.company.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            preferredContact: form.preferredContact,
          },
          fulfillment: form.fulfillment,
          address: form.fulfillment === "delivery" ? form.address.trim() : "",
          event: {
            type: form.eventType as (typeof eventTypes)[number],
            date: form.date,
            time: form.time,
            guests: Number(form.guests),
          },
          notes: form.notes.trim(),
          items: lines.map((l) => ({ id: l.id, size: l.size, quantity: l.quantity })),
          website: honeypot,
        },
      });
      setDone({
        reference: res.reference,
        firstName: form.name.trim().split(" ")[0] ?? "",
        fulfillment: form.fulfillment,
      });
      cart.clear();
      setView("cart");
      setForm((f) => ({
        ...emptyForm,
        name: f.name,
        company: f.company,
        email: f.email,
        phone: f.phone,
        preferredContact: f.preferredContact,
        address: f.address,
      }));
    } catch (err) {
      console.error(err);
      toast.error(`We couldn't send your order. Please try again or call ${site.phone}.`);
    } finally {
      setSubmitting(false);
    }
  };

  const guestsNum = Number(form.guests) || 0;
  const step = done
    ? "done"
    : view === "details" && lines.length > 0 && !belowMinimum
      ? "details"
      : "cart";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border px-6 py-5 text-left">
          <SheetTitle className="font-serif text-2xl">
            {step === "cart" && "Your Order"}
            {step === "details" && "Checkout"}
            {step === "done" && "Order Received!"}
          </SheetTitle>
          <SheetDescription>
            {step === "cart" &&
              (count
                ? `${count} tray${count > 1 ? "s" : ""}, feeds about ${servesApprox}`
                : "Your order is empty — let's fix that.")}
            {step === "details" && "Pay at delivery or pickup — nothing is charged online."}
            {step === "done" && "Grazie! We're on it."}
          </SheetDescription>
        </SheetHeader>

        {step === "cart" && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                  <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
                    <ShoppingBag className="size-7" />
                  </span>
                  <p className="mt-4 font-serif text-xl font-semibold">Nothing here yet</p>
                  <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                    Browse the menu and add the trays you'd like.
                  </p>
                  <Button
                    variant="hero"
                    className="mt-6 h-11 px-6"
                    onClick={() => {
                      setOpen(false);
                      setTimeout(() => scrollTo("menu"), 250);
                    }}
                  >
                    Browse the menu
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {lines.map((l) => {
                    const info = lineInfo(l);
                    if (!info) return null;
                    return (
                      <li key={`${l.id}-${l.size}`} className="flex gap-4 py-4">
                        <SafeImage
                          src={info.item.image}
                          alt={info.item.name}
                          sizes="64px"
                          className="size-16 shrink-0 rounded-xl"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold leading-snug">{info.item.name}</p>
                            <button
                              aria-label={`Remove ${info.item.name}`}
                              onClick={() => cart.remove(l.id, l.size)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {l.size}, {money(info.unitPrice)} each, feeds about {info.serves}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <QtyStepper
                              value={l.quantity}
                              min={0}
                              onChange={(n) => cart.setQty(l.id, l.size, n)}
                            />
                            <span className="font-semibold tabular-nums">
                              {money(info.lineTotal)}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            {lines.length > 0 && (
              <div className="space-y-3 border-t border-border bg-card px-6 py-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-serif text-3xl font-semibold text-price">
                    {money(subtotal)}
                  </span>
                </div>
                <MinimumProgress subtotal={subtotal} />
                <PayLaterNote />
                <Button
                  variant="hero"
                  className="h-12 w-full"
                  disabled={belowMinimum}
                  onClick={() => setView("details")}
                >
                  Checkout
                </Button>
                <button
                  onClick={() => {
                    setOpen(false);
                    setTimeout(() => scrollTo("menu"), 250);
                  }}
                  className="w-full text-center text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  Keep adding trays
                </button>
              </div>
            )}
          </>
        )}

        {step === "details" && (
          <form onSubmit={onSubmit} noValidate className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <button
                type="button"
                onClick={() => setView("cart")}
                className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="size-4" /> Back to order ({money(subtotal)})
              </button>

              {/* honeypot */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                aria-hidden="true"
              />

              <fieldset className="space-y-3">
                <legend className="mb-1 font-serif text-lg font-semibold">
                  1. Delivery or pickup?
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  <ChoiceCard
                    active={form.fulfillment === "delivery"}
                    onClick={() => set("fulfillment", "delivery")}
                    icon={<Truck className="size-5" />}
                    title="Delivery"
                    text="Anywhere in NYC"
                  />
                  <ChoiceCard
                    active={form.fulfillment === "pickup"}
                    onClick={() => set("fulfillment", "pickup")}
                    icon={<Store className="size-5" />}
                    title="Pickup"
                    text="Our Astoria kitchen"
                  />
                </div>
                {form.fulfillment === "delivery" ? (
                  <Field label="Delivery address" error={errors.address} id="address">
                    <Input
                      id="address"
                      autoComplete="street-address"
                      placeholder="Street, apt/floor, borough, ZIP"
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                    />
                  </Field>
                ) : (
                  <p className="flex items-start gap-2 rounded-xl bg-secondary px-3 py-2.5 text-sm">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    Pick up at {site.address.full}
                  </p>
                )}
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="mb-1 font-serif text-lg font-semibold">2. When?</legend>
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label={form.fulfillment === "pickup" ? "Pickup date" : "Delivery date"}
                    error={errors.date}
                    id="date"
                  >
                    <Input
                      id="date"
                      type="date"
                      min={minDate}
                      value={form.date}
                      onChange={(e) => set("date", e.target.value)}
                    />
                  </Field>
                  <Field label="Time" error={errors.time} id="time">
                    <Input
                      id="time"
                      type="time"
                      value={form.time}
                      onChange={(e) => set("time", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Event type" error={errors.eventType} id="eventType">
                    <select
                      id="eventType"
                      value={form.eventType}
                      onChange={(e) => set("eventType", e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Select…</option>
                      {eventTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Guests" error={errors.guests} id="guests-f">
                    <Input
                      id="guests-f"
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={form.guests}
                      onChange={(e) => set("guests", e.target.value)}
                    />
                  </Field>
                </div>
                {guestsNum > 0 && servesApprox > 0 && servesApprox < guestsNum * 0.9 && (
                  <p className="flex items-start gap-2 rounded-xl bg-price/10 px-3 py-2 text-sm">
                    <Users className="mt-0.5 size-4 shrink-0 text-price" />
                    Your order serves about {servesApprox} — you may want more food for {guestsNum}{" "}
                    guests.
                  </p>
                )}
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="mb-1 font-serif text-lg font-semibold">3. Your contact</legend>
                <Field label="Full name" error={errors.name} id="name">
                  <Input
                    id="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Phone" error={errors.phone} id="phone">
                    <Input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                    />
                  </Field>
                  <Field label="Email" error={errors.email} id="email">
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Company (optional)" id="company">
                  <Input
                    id="company"
                    autoComplete="organization"
                    value={form.company}
                    onChange={(e) => set("company", e.target.value)}
                  />
                </Field>
                <div>
                  <Label className="mb-2 block">Best way to reach you</Label>
                  <Segmented
                    options={["Phone", "Text", "Email"]}
                    value={form.preferredContact}
                    onChange={(v) => set("preferredContact", v as Form["preferredContact"])}
                  />
                </div>
                <Field label="Notes (optional)" id="notes">
                  <Textarea
                    id="notes"
                    rows={3}
                    placeholder="Allergies, setup, building access…"
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                  />
                </Field>
              </fieldset>
            </div>
            <div className="space-y-3 border-t border-border bg-card px-6 py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">
                  Total to pay {form.fulfillment === "pickup" ? "at pickup" : "on delivery"}
                </span>
                <span className="font-serif text-2xl font-semibold text-price">
                  {money(subtotal)}
                </span>
              </div>
              <Button type="submit" variant="hero" className="h-12 w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" /> Placing order…
                  </>
                ) : (
                  "Place order"
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                No payment online. We'll confirm by {form.preferredContact.toLowerCase()} within{" "}
                {site.responseHours} hours.
              </p>
            </div>
          </form>
        )}

        {step === "done" && done && (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <CheckCircle2 className="size-16 text-olive" strokeWidth={1.5} />
            <p className="mt-5 font-serif text-2xl font-semibold">
              Grazie{done.firstName ? `, ${done.firstName}` : ""}!
            </p>
            <p className="mt-2 text-muted-foreground">
              Your order has been placed. We'll contact you within {site.responseHours} hours to
              confirm. You'll pay{" "}
              {done.fulfillment === "pickup" ? "when you pick it up" : "when it's delivered"}.
            </p>
            <p className="mt-6 rounded-2xl bg-secondary px-5 py-3 text-sm">
              Order number{" "}
              <span className="font-mono text-base font-bold tracking-wider text-primary">
                {done.reference}
              </span>
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              Questions? Call{" "}
              <a href={site.phoneHref} className="font-semibold text-primary">
                {site.phone}
              </a>
            </p>
            <Button variant="soft" className="mt-6 h-11 px-6" onClick={() => setOpen(false)}>
              Back to site
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function PayLaterNote({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-xl bg-olive/10 px-3 py-2 text-sm text-foreground",
        className,
      )}
    >
      <Banknote className="mt-0.5 size-4 shrink-0 text-olive" />
      <span>
        <strong>Pay at delivery or pickup.</strong> No card needed online.
      </span>
    </p>
  );
}

function ChoiceCard({
  active,
  onClick,
  icon,
  title,
  text,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left transition-colors",
        active
          ? "border-primary bg-primary/5"
          : "border-border bg-background hover:border-primary/50",
      )}
    >
      <span className={cn(active ? "text-primary" : "text-muted-foreground")}>{icon}</span>
      <span className="font-semibold">{title}</span>
      <span className="text-xs text-muted-foreground">{text}</span>
    </button>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className={cn(error && "[&_input]:border-destructive [&_select]:border-destructive")}>
      <Label htmlFor={id} className="mb-1.5 block">
        {label}
      </Label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
            value === o
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:border-primary",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
