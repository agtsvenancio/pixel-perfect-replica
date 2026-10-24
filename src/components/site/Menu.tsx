import { useEffect, useMemo, useState } from "react";
import { ArrowUp, Flame, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { categories, getMenuItem, menu, signatureDishIds, type MenuItem } from "@/data/menu";
import { recommendTrays } from "@/lib/calculator";
import { money, useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { CtaRow } from "./Intro";
import { OrderSidebar } from "./OrderSummary";
import { QtyStepper, Reveal, SafeImage, scrollTo } from "./primitives";

/** Add button that turns into a quantity stepper once the item is in the order. */
function AddControl({ item, size = "md" }: { item: MenuItem; size?: "md" | "sm" }) {
  const { add, setQty, qtyOf } = useCart();
  const qty = qtyOf(item.id);
  if (qty > 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-xs font-semibold text-olive sm:inline">In order</span>
        <QtyStepper value={qty} min={0} onChange={(n) => setQty(item.id, item.sizeLabel, n)} />
      </div>
    );
  }
  return (
    <Button
      variant="hero"
      className={cn("rounded-full", size === "sm" ? "h-9 px-4" : "h-10 px-5")}
      onClick={() => {
        add(item.id);
        toast.success(`${item.name} added`, {
          description: `${item.sizeLabel} · ${money(item.price)}`,
        });
      }}
      aria-label={`Add ${item.name}`}
    >
      <Plus /> Add
    </Button>
  );
}

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

function MenuCard({ item }: { item: MenuItem }) {
  return (
    <article className="group flex overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-shadow hover:shadow-warm sm:flex-col">
      <div className="relative w-32 shrink-0 overflow-hidden sm:aspect-[4/3] sm:w-full">
        <SafeImage
          src={item.image}
          alt={item.name}
          className="h-full w-full transition-transform duration-700 group-hover:scale-105"
        />
        {item.isPopular && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground shadow sm:left-3 sm:top-3">
            <Flame className="size-3" /> Popular
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-serif text-lg font-semibold leading-snug">{item.name}</h4>
          <span className="shrink-0 font-serif text-xl font-semibold text-price">
            {money(item.price)}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">{item.description}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-xs font-medium text-olive">
            <Users className="size-3.5" /> {item.sizeLabel} · serves ~{item.servesApprox}
          </span>
          <AddControl item={item} />
        </div>
      </div>
    </article>
  );
}

function CategoryNav() {
  const [active, setActive] = useState<string>(categories[0]!.id);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id.replace("cat-", ""));
      },
      { rootMargin: "-140px 0px -60% 0px" },
    );
    categories.forEach((c) => {
      const el = document.getElementById(`cat-${c.id}`);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return (
    <nav
      aria-label="Menu categories"
      className="sticky top-16 z-30 -mx-4 mb-8 overflow-x-auto border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:mx-0 md:px-0"
    >
      <div className="flex w-max gap-2">
        {categories.map((c) => {
          const n = menu.filter((m) => m.category === c.id).length;
          return (
            <a
              key={c.id}
              href={`#cat-${c.id}`}
              className={cn(
                "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                active === c.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary hover:text-primary",
              )}
            >
              {c.label} <span className="opacity-60">{n}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

export function MenuSection() {
  const grouped = useMemo(
    () => categories.map((c) => ({ ...c, items: menu.filter((m) => m.category === c.id) })),
    [],
  );
  return (
    <section id="menu" className="mx-auto max-w-7xl px-4 pb-24 pt-14 md:px-6">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-2">Menu &amp; prices</p>
          <h2 className="text-4xl font-semibold leading-tight md:text-5xl">Choose Your Trays</h2>
        </div>
        <p className="max-w-md text-muted-foreground md:text-right">
          Half trays serve {site.portions.halfTray} guests. Full trays ({site.portions.fullTray}{" "}
          guests) on request — just add a note at checkout.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <CategoryNav />
          <div className="space-y-14">
            {grouped.map((g) => (
              <div key={g.id} id={`cat-${g.id}`} className="scroll-mt-32">
                <h3 className="mb-5 text-3xl font-semibold">{g.label}</h3>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-5">
                  {g.items.map((item) => (
                    <MenuCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <OrderSidebar />
      </div>
    </section>
  );
}

export function GuestCalculator() {
  const [guests, setGuests] = useState(30);
  const rec = useMemo(() => recommendTrays(guests), [guests]);
  return (
    <section id="calculator" className="bg-secondary/60 py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:px-6 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="eyebrow mb-3">How Much Food Do I Need?</p>
          <h2 className="text-4xl font-semibold leading-tight">
            Enter your guest count. We'll do the math.
          </h2>
          <label htmlFor="guests" className="mt-8 block text-sm font-semibold">
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
        </div>
        <div className="rounded-3xl bg-card p-6 shadow-soft md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Half trays for {guests} guests
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {categories.map((c) => (
              <div key={c.id} className="rounded-2xl bg-secondary/70 p-4 text-center">
                <p className="font-serif text-3xl font-semibold text-primary">{rec[c.id]}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{c.label}</p>
              </div>
            ))}
          </div>
          <Button variant="hero" className="mt-6 h-12 px-6" onClick={() => scrollTo("menu")}>
            Pick your trays <ArrowUp />
          </Button>
        </div>
      </div>
    </section>
  );
}
