import { useEffect, useMemo, useState } from "react";
import { Calculator, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { site } from "@/config/site";
import { categories, menu, type MenuItem } from "@/data/menu";
import { recommendTrays } from "@/lib/calculator";
import { money, useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { OrderSlip } from "./OrderSummary";
import { QtyStepper, SafeImage } from "./primitives";

/** "Add" button that turns into a quantity stepper once the dish is in the order. */
function AddControl({ item, compact }: { item: MenuItem; compact?: boolean }) {
  const { add, setQty, qtyOf } = useCart();
  const qty = qtyOf(item.id);
  if (qty > 0)
    return <QtyStepper value={qty} min={0} onChange={(n) => setQty(item.id, item.sizeLabel, n)} />;
  return (
    <button
      onClick={() => {
        add(item.id);
        toast.success(`${item.name} added to your order`);
      }}
      aria-label={`Add ${item.name}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg bg-primary font-semibold text-primary-foreground hover:bg-[#9a1f16]",
        compact ? "h-9 px-3.5 text-sm" : "h-10 px-4",
      )}
    >
      <Plus className="size-4" /> Add
    </button>
  );
}

function DishCard({ item }: { item: MenuItem }) {
  return (
    <article className="flex overflow-hidden rounded-2xl border border-border bg-background transition-shadow hover:shadow-warm sm:flex-col">
      <SafeImage
        src={item.image}
        alt={item.name}
        sizes="(min-width: 1280px) 280px, (min-width: 640px) 45vw, 120px"
        className="aspect-square w-28 shrink-0 self-stretch sm:aspect-[4/3] sm:w-full sm:self-auto"
      />
      <div className="flex min-w-0 flex-1 flex-col p-3.5 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-base font-bold leading-snug sm:text-lg">{item.name}</h4>
          <span className="tabular shrink-0 font-bold text-primary sm:text-lg">
            {money(item.price)}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground sm:line-clamp-none sm:text-[0.95rem]">
          {item.description}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 sm:mt-4">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium">
            <Users className="size-4 text-olive" /> Serves ~{item.servesApprox}
          </span>
          <AddControl item={item} compact />
        </div>
      </div>
    </article>
  );
}

/** Dishes without a photo: a clean list row instead of an empty image box. */
function DishRow({ item }: { item: MenuItem }) {
  return (
    <li className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="font-bold leading-snug">
          {item.name}{" "}
          <span className="tabular ml-1 font-bold text-primary">{money(item.price)}</span>
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {item.description} {item.sizeLabel}, serves ~{item.servesApprox}.
        </p>
      </div>
      <AddControl item={item} compact />
    </li>
  );
}

function CategoryTabs() {
  const [active, setActive] = useState<string>(categories[0]!.id);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id.replace("cat-", ""));
      },
      { rootMargin: "-140px 0px -55% 0px" },
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
      className="sticky top-16 z-30 -mx-4 mt-8 overflow-x-auto bg-background/95 px-4 py-3 backdrop-blur md:top-[4.5rem] md:mx-0 md:px-0"
    >
      <div className="flex w-max gap-2">
        {categories.map((c) => (
          <a
            key={c.id}
            href={`#cat-${c.id}`}
            aria-current={active === c.id ? "true" : undefined}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              active === c.id
                ? "bg-foreground text-background"
                : "bg-secondary text-foreground hover:bg-border",
            )}
          >
            {c.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function GuestCalculator() {
  const [guests, setGuests] = useState(25);
  const rec = useMemo(() => recommendTrays(guests), [guests]);
  return (
    <div id="calculator" className="rounded-2xl border border-border bg-secondary/60 p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-background text-primary">
          <Calculator className="size-5" />
        </span>
        <label htmlFor="guests" className="text-lg font-bold">
          How much food do I need?
        </label>
        <div className="flex items-center gap-2">
          <input
            id="guests"
            type="number"
            min={1}
            max={1000}
            inputMode="numeric"
            value={guests}
            onChange={(e) => setGuests(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
            className="h-11 w-24 rounded-lg border border-input bg-background text-center text-lg font-bold tabular"
          />
          <span className="font-medium">guests</span>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">Recommended number of half trays:</p>
      <div className="mt-2 grid grid-cols-5 gap-2">
        {categories.map((c) => (
          <div key={c.id} className="rounded-xl bg-background px-2 py-3 text-center">
            <p className="tabular text-2xl font-bold">{rec[c.id]}</p>
            <p className="mt-0.5 text-xs leading-tight text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MenuSection() {
  const grouped = useMemo(
    () =>
      categories.map((c) => {
        const items = menu.filter((m) => m.category === c.id);
        return {
          ...c,
          withPhoto: items.filter((i) => i.image),
          noPhoto: items.filter((i) => !i.image),
        };
      }),
    [],
  );
  return (
    <section id="menu" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
      <div className="max-w-2xl">
        <h2 className="text-3xl md:text-5xl">Menu & prices</h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Prices are per tray. A half tray serves {site.portions.halfTray} people. Need full trays (
          {site.portions.fullTray} people)? Add a note at checkout.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <GuestCalculator />
          <CategoryTabs />
          {grouped.map((g) => (
            <div key={g.id} id={`cat-${g.id}`} className="scroll-mt-36 pt-8">
              <h3 className="text-2xl md:text-3xl">{g.label}</h3>
              {g.withPhoto.length > 0 && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
                  {g.withPhoto.map((item) => (
                    <DishCard key={item.id} item={item} />
                  ))}
                </div>
              )}
              {g.noPhoto.length > 0 && (
                <ul className="mt-4 divide-y divide-border border-y border-border">
                  {g.noPhoto.map((item) => (
                    <DishRow key={item.id} item={item} />
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <OrderSlip />
      </div>
    </section>
  );
}
