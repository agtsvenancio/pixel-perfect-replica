import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { lineInfo, money, useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

/** Plain-language progress toward the minimum order. */
export function MinimumProgress({ subtotal, className }: { subtotal: number; className?: string }) {
  const missing = site.minimumOrder - subtotal;
  const pct = Math.min(100, Math.round((subtotal / site.minimumOrder) * 100));
  return (
    <div className={className}>
      <div className="h-1.5 bg-foreground/15" aria-hidden="true">
        <div
          className={cn(
            "h-full transition-[width] duration-500",
            missing > 0 ? "bg-primary" : "bg-olive",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-sm">
        {missing > 0 ? (
          <>
            Add <strong className="tabular">{money(missing)}</strong> more to reach the{" "}
            {money(site.minimumOrder)} minimum.
          </>
        ) : (
          <span className="font-semibold text-olive">Minimum order reached.</span>
        )}
      </p>
    </div>
  );
}

/**
 * The order slip: a yellow paper ticket that sits beside the menu board.
 * New and changed lines get a short "stamp" so you see what just changed.
 */
export function OrderSlip() {
  const { lines, subtotal, count, servesApprox, setQty, checkout } = useCart();
  const below = subtotal < site.minimumOrder;
  const ready = useRef(false);
  useEffect(() => {
    const t = setTimeout(() => (ready.current = true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <aside aria-label="Your order" className="sticky top-20 hidden self-start lg:block">
      <div className="perforated slip bg-ticket px-5 pb-7 pt-8 text-[#2b2410]">
        <div className="flex items-baseline justify-between border-b-2 border-dashed border-[#2b2410]/40 pb-3">
          <p className="sign text-2xl">Order slip</p>
          <p className="text-sm">{count ? `Feeds about ${servesApprox}` : "Empty"}</p>
        </div>

        {lines.length === 0 ? (
          <p className="py-8 text-base leading-relaxed">
            Nothing on the slip yet. Press <strong>Add</strong> next to any dish and it will show up
            here.
          </p>
        ) : (
          <ul className="max-h-[calc(100vh-24rem)] overflow-y-auto py-2">
            {lines.map((l) => {
              const info = lineInfo(l);
              if (!info) return null;
              return (
                <li
                  key={`${l.id}-${l.size}-${l.quantity}`}
                  className={cn(
                    "border-b border-dashed border-[#2b2410]/25 py-2.5",
                    ready.current && "stamp-in",
                  )}
                >
                  <div className="flex items-baseline text-base">
                    <span className="font-bold tabular">{l.quantity}×</span>
                    <span className="ml-2 min-w-0 leading-snug">{info.item.name}</span>
                    <span className="leader border-[#2b2410]/30" />
                    <span className="tabular font-bold">{money(info.lineTotal)}</span>
                  </div>
                  <div className="mt-1 flex gap-3 pl-7 text-sm">
                    <button
                      onClick={() => setQty(l.id, l.size, l.quantity - 1)}
                      className="underline underline-offset-2 hover:text-primary"
                      aria-label={`One less ${info.item.name}`}
                    >
                      one less
                    </button>
                    <button
                      onClick={() => setQty(l.id, l.size, l.quantity + 1)}
                      className="underline underline-offset-2 hover:text-primary"
                      aria-label={`One more ${info.item.name}`}
                    >
                      one more
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-2 flex items-baseline justify-between border-t-4 border-double border-[#2b2410] pt-3">
          <span className="text-lg font-bold">Total</span>
          <span className="sign tabular text-3xl">{money(subtotal)}</span>
        </div>
        <p className="mt-1 text-sm">
          Paid on delivery or at pickup. Tax and delivery confirmed by phone.
        </p>
        {lines.length > 0 && <MinimumProgress subtotal={subtotal} className="mt-4" />}
        <Button
          variant="hero"
          className="mt-4 h-12 w-full text-base"
          disabled={lines.length === 0 || below}
          onClick={checkout}
        >
          {lines.length === 0
            ? "Add trays to order"
            : below
              ? `Minimum is ${money(site.minimumOrder)}`
              : "Continue to delivery details"}
        </Button>
      </div>
    </aside>
  );
}
