import { ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { lineInfo, money, useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { QtyStepper } from "./primitives";

/** Plain-language progress toward the minimum order. */
export function MinimumProgress({ subtotal, className }: { subtotal: number; className?: string }) {
  const missing = site.minimumOrder - subtotal;
  const pct = Math.min(100, Math.round((subtotal / site.minimumOrder) * 100));
  return (
    <div className={className}>
      <div className="h-2 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500",
            missing > 0 ? "bg-primary" : "bg-olive",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {missing > 0 ? (
          <>
            Add <strong className="tabular text-foreground">{money(missing)}</strong> more to reach
            the {money(site.minimumOrder)} minimum
          </>
        ) : (
          <span className="font-medium text-olive">Minimum order reached</span>
        )}
      </p>
    </div>
  );
}

/** Order panel beside the menu on large screens. */
export function OrderSlip() {
  const { lines, subtotal, count, servesApprox, setQty, remove, checkout } = useCart();
  const below = subtotal < site.minimumOrder;
  return (
    <aside aria-label="Your order" className="sticky top-24 hidden self-start lg:block">
      <div className="flex max-h-[calc(100vh-7.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-soft">
        <div className="border-b border-border px-5 py-4">
          <p className="text-lg font-bold">Your order</p>
          <p className="text-sm text-muted-foreground">
            {count
              ? `${count} ${count === 1 ? "tray" : "trays"}, feeds about ${servesApprox}`
              : "Nothing added yet"}
          </p>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-10 text-center text-muted-foreground">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <ShoppingBag className="size-5" />
            </span>
            <p className="mt-3 text-sm">Tap “Add” on any dish to start your order.</p>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
            {lines.map((l) => {
              const info = lineInfo(l);
              if (!info) return null;
              return (
                <li key={`${l.id}-${l.size}`} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold leading-snug">{info.item.name}</p>
                    <button
                      aria-label={`Remove ${info.item.name}`}
                      onClick={() => remove(l.id, l.size)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <QtyStepper
                      value={l.quantity}
                      min={0}
                      onChange={(n) => setQty(l.id, l.size, n)}
                    />
                    <span className="tabular text-sm font-semibold">{money(info.lineTotal)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="space-y-3 border-t border-border bg-secondary/60 px-5 py-4">
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">Subtotal</span>
            <span className="tabular text-2xl font-bold">{money(subtotal)}</span>
          </div>
          {lines.length > 0 && <MinimumProgress subtotal={subtotal} />}
          <Button
            variant="hero"
            className="h-12 w-full text-base"
            disabled={lines.length === 0 || below}
            onClick={checkout}
          >
            Checkout
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            No payment now. Pay on delivery or pickup.
          </p>
        </div>
      </div>
    </aside>
  );
}
