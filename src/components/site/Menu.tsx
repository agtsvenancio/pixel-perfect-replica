import { useMemo, useState } from "react";
import { ArrowUp, Check, Flame, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { categories, menu, signatureDishIds, getMenuItem, type MenuItem } from "@/data/menu";
import { recommendTrays } from "@/lib/calculator";
import { money, useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { CtaRow } from "./Intro";
import { QtyStepper, Reveal, SafeImage, SectionHeading, scrollTo } from "./primitives";

export function SignatureDishes() {
  const { add } = useCart();
  const dishes = signatureDishIds.map(getMenuItem).filter(Boolean) as MenuItem[];
  const [lead, ...rest] = dishes;
  return (
    <section className="bg-charcoal py-24 text-cream">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="mb-12 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-price">
            Our bestsellers
          </p>
          <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
            The Dishes Your Guests Will Remember
          </h2>
          <p className="mt-4 text-lg text-cream/70">
            Made from scratch in our Astoria kitchen and delivered hot, ready to serve.
          </p>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          {lead && (
            <Reveal className="md:col-span-2 lg:row-span-2">
              <DishTile
                item={lead}
                large
                onAdd={() => {
                  add(lead.id);
                  toast.success(`${lead.name} added to your order`);
                }}
              />
            </Reveal>
          )}
          {rest.slice(0, 4).map((d, i) => (
            <Reveal key={d.id} delay={(i + 1) * 70}>
              <DishTile
                item={d}
                onAdd={() => {
                  add(d.id);
                  toast.success(`${d.name} added to your order`);
                }}
              />
            </Reveal>
          ))}
        </div>
        <CtaRow className="mt-12" dark label="See All Dishes & Prices" />
      </div>
    </section>
  );
}

function DishTile({ item, large, onAdd }: { item: MenuItem; large?: boolean; onAdd: () => void }) {
  return (
    <div
      className={cn(
        "group relative h-full overflow-hidden rounded-3xl",
        large ? "min-h-[420px]" : "min-h-[260px]",
      )}
    >
      <SafeImage
        src={item.image}
        alt={item.name}
        className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-110"
      />
      <div className="overlay-card absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <h3 className={cn("font-semibold", large ? "text-3xl md:text-4xl" : "text-xl")}>
          {item.name}
        </h3>
        {item.tagline && (
          <p
            className={cn(
              "mt-1 text-cream/80",
              large ? "max-w-md text-base" : "line-clamp-2 text-sm",
            )}
          >
            {item.tagline}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-sm text-cream/80">
            <span className="font-semibold text-price">{money(item.price)}</span> · {item.sizeLabel}{" "}
            · serves ~{item.servesApprox}
          </span>
          <Button
            variant="hero"
            size="sm"
            className="h-9 rounded-full px-4"
            onClick={onAdd}
            aria-label={`Add ${item.name}`}
          >
            <Plus /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MenuSection() {
  const [cat, setCat] = useState(categories[0]!.id);
  const items = useMemo(() => menu.filter((m) => m.category === cat), [cat]);
  return (
    <section id="menu" className="mx-auto max-w-7xl px-4 py-24 md:px-6">
      <SectionHeading
        eyebrow="Menu & prices"
        title="Choose Your Trays"
        subtitle={`Pick your trays, set the quantity and add them to your order. Half trays serve ${site.portions.halfTray} guests — full trays (${site.portions.fullTray} guests) available on request.`}
      />
      <div className="sticky top-16 z-30 -mx-4 mb-10 overflow-x-auto bg-background/95 px-4 py-3 backdrop-blur md:top-16 md:mx-0 md:px-0">
        <div role="tablist" aria-label="Menu categories" className="mx-auto flex w-max gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={cat === c.id}
              onClick={() => setCat(c.id)}
              className={cn(
                "whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors",
                cat === c.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary hover:text-primary",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div
        key={cat}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-500"
      >
        {items.map((item) => (
          <MenuCard key={item.id} item={item} />
        ))}
      </div>
      <p className="mt-10 text-center text-sm text-muted-foreground">
        Minimum order {money(site.minimumOrder)} · Please order at least {site.leadTimeDays} days
        ahead · Prices before tax and delivery
      </p>
    </section>
  );
}

function MenuCard({ item }: { item: MenuItem }) {
  const { add } = useCart();
  const sizes = item.sizes?.length
    ? [{ label: item.sizeLabel, price: item.price, servesApprox: item.servesApprox }, ...item.sizes]
    : null;
  const [size, setSize] = useState(item.sizeLabel);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const current = sizes?.find((s) => s.label === size) ?? {
    price: item.price,
    servesApprox: item.servesApprox,
  };

  const onAdd = () => {
    add(item.id, qty, size);
    toast.success(`${qty} × ${item.name} added`, {
      description: `${size} · ${money(current.price * qty)}`,
    });
    setAdded(true);
    setQty(1);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-shadow hover:shadow-warm">
      <div className="relative aspect-[4/3] overflow-hidden">
        <SafeImage
          src={item.image}
          alt={item.name}
          className="h-full w-full transition-transform duration-700 group-hover:scale-105"
        />
        {item.isPopular && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
            <Flame className="size-3.5" /> Popular
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold leading-snug">{item.name}</h3>
          <span className="shrink-0 font-serif text-2xl font-semibold text-price">
            {money(current.price)}
          </span>
        </div>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
        <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-olive">
          <Users className="size-3.5" /> {size} · serves approx. {current.servesApprox}
        </p>
        {sizes && (
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s.label}
                onClick={() => setSize(s.label)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold",
                  size === s.label ? "border-primary text-primary" : "border-border",
                )}
              >
                {s.label} · {money(s.price)}
              </button>
            ))}
          </div>
        )}
        <div className="mt-5 flex items-center justify-between gap-3">
          <QtyStepper value={qty} onChange={setQty} />
          <Button variant="hero" className="h-10 flex-1 px-4" onClick={onAdd}>
            {added ? (
              <>
                <Check /> Added
              </>
            ) : (
              <>
                <Plus /> Add to order
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}

export function GuestCalculator() {
  const [guests, setGuests] = useState(30);
  const rec = useMemo(() => recommendTrays(guests), [guests]);

  return (
    <section id="calculator" className="mx-auto max-w-7xl px-4 py-24 md:px-6">
      <div className="grid gap-10 rounded-[2rem] border border-border bg-card p-6 shadow-soft md:p-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="eyebrow mb-3">How Much Food Do I Need?</p>
          <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
            Tell us your guest count. We'll do the math.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our recommendation is based on generous portions, so nobody leaves hungry.
          </p>
          <label htmlFor="guests" className="mt-10 block text-sm font-semibold">
            Number of guests
          </label>
          <div className="mt-3 flex items-center gap-4">
            <input
              id="guests"
              type="range"
              min={10}
              max={300}
              step={5}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="h-2 flex-1 cursor-pointer accent-[var(--primary)]"
            />
            <input
              type="number"
              min={1}
              max={1000}
              value={guests}
              aria-label="Guests"
              onChange={(e) => setGuests(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
              className="h-12 w-24 rounded-xl border border-input bg-background text-center font-serif text-2xl font-semibold"
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Over 300 guests? Type the number or call {site.phone}.
          </p>
        </div>
        <div className="rounded-3xl bg-secondary/70 p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Recommended for {guests} guests
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {categories.map((c) => (
              <div key={c.id} className="rounded-2xl bg-card p-4 text-center">
                <p className="font-serif text-3xl font-semibold text-primary">{rec[c.id]}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{c.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            Number of half trays per category for {guests} guests. Pick your favorite dishes in each
            category from the menu above.
          </p>
          <Button variant="hero" className="mt-5 h-12 px-6" onClick={() => scrollTo("menu")}>
            Choose from the menu <ArrowUp />
          </Button>
        </div>
      </div>
    </section>
  );
}
