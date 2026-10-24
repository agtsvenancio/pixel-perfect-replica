import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { site } from "@/config/site";
import { categories, menu, type MenuItem } from "@/data/menu";
import { recommendTrays } from "@/lib/calculator";
import { money, useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { OrderSlip } from "./OrderSummary";
import { QtyStepper, SafeImage } from "./primitives";

/** Add button that becomes a quantity stepper once the dish is on the slip. */
function AddControl({ item }: { item: MenuItem }) {
  const { add, setQty, qtyOf } = useCart();
  const qty = qtyOf(item.id);
  if (qty > 0)
    return <QtyStepper value={qty} min={0} onChange={(n) => setQty(item.id, item.sizeLabel, n)} />;
  return (
    <button
      onClick={() => {
        add(item.id);
        toast.success(`Added ${item.name}`);
      }}
      aria-label={`Add ${item.name}`}
      className="h-9 rounded-md border-2 border-primary px-4 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground"
    >
      Add
    </button>
  );
}

/** One line of the deli price board: name ........ price. */
function BoardRow({ item }: { item: MenuItem }) {
  return (
    <li className="grid grid-cols-[4.5rem_1fr] gap-4 border-b border-border py-5 sm:grid-cols-[6rem_1fr]">
      <SafeImage src={item.image} alt={item.name} className="aspect-square w-full rounded-md" />
      <div className="min-w-0">
        <div className="flex items-baseline">
          <h4 className="min-w-0 font-sans text-lg font-bold leading-snug [font-stretch:100%] [letter-spacing:0] sm:text-xl">
            {item.name}
          </h4>
          <span className="leader" aria-hidden="true" />
          <span className="tabular text-lg font-bold text-price sm:text-xl">
            {money(item.price)}
          </span>
        </div>
        <p className="mt-1 max-w-[60ch] text-muted-foreground">{item.description}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm">
            {item.sizeLabel}, feeds about {item.servesApprox}
          </span>
          <AddControl item={item} />
        </div>
      </div>
    </li>
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
      { rootMargin: "-120px 0px -60% 0px" },
    );
    categories.forEach((c) => {
      const el = document.getElementById(`cat-${c.id}`);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return (
    <nav
      aria-label="Menu sections"
      className="sticky top-16 z-30 -mx-4 overflow-x-auto border-b-2 border-foreground bg-background px-4 md:mx-0 md:px-0"
    >
      <div className="flex w-max gap-6">
        {categories.map((c) => (
          <a
            key={c.id}
            href={`#cat-${c.id}`}
            aria-current={active === c.id ? "true" : undefined}
            className={cn(
              "-mb-0.5 whitespace-nowrap border-b-4 py-3 font-semibold",
              active === c.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {c.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

/** "How much do I need?" as one editable sentence, not a widget. */
function PortionHelper() {
  const [guests, setGuests] = useState(30);
  const rec = useMemo(() => recommendTrays(guests), [guests]);
  const parts = categories.map((c) => `${rec[c.id]} ${c.label.toLowerCase()}`);
  return (
    <div id="calculator" className="mb-8 border-l-4 border-olive bg-secondary px-5 py-4">
      <label htmlFor="guests" className="block text-lg font-bold">
        How much food for{" "}
        <input
          id="guests"
          type="number"
          min={1}
          max={1000}
          value={guests}
          onChange={(e) => setGuests(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
          className="mx-1 w-20 border-b-2 border-foreground bg-transparent text-center tabular focus:outline-none"
        />{" "}
        guests?
      </label>
      <p className="mt-1 text-muted-foreground">
        About {parts.slice(0, -1).join(", ")} and {parts.at(-1)} half trays.
      </p>
    </div>
  );
}

export function MenuSection() {
  const grouped = useMemo(
    () => categories.map((c) => ({ ...c, items: menu.filter((m) => m.category === c.id) })),
    [],
  );
  return (
    <section id="menu" className="mx-auto max-w-7xl px-4 pb-20 pt-14 md:px-6 md:pt-20">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-14">
        <div className="min-w-0">
          <h2 className="text-4xl md:text-6xl">Menu and prices</h2>
          <p className="mt-4 max-w-[60ch] text-lg text-muted-foreground">
            Prices are per tray. Half trays feed {site.portions.halfTray} people; full trays (
            {site.portions.fullTray} people) on request, just mention it in your order notes.
          </p>
          <div className="mt-8">
            <PortionHelper />
          </div>
          <CategoryNav />
          {grouped.map((g) => (
            <div key={g.id} id={`cat-${g.id}`} className="scroll-mt-32 pt-10">
              <h3 className="text-2xl md:text-3xl">{g.label}</h3>
              <ul className="mt-2">
                {g.items.map((item) => (
                  <BoardRow key={item.id} item={item} />
                ))}
              </ul>
            </div>
          ))}
        </div>
        <OrderSlip />
      </div>
    </section>
  );
}
