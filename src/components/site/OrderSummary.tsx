import { ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { lineInfo, money, useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { PayLaterNote } from "./CartDrawer";
import { QtyStepper } from "./primitives";

export function MinimumProgress({ subtotal, className }: { subtotal: number; className?: string }) {
  const pct = Math.min(100, Math.round((subtotal / site.minimumOrder) * 100));
  const missing = site.minimumOrder - subtotal;
  return (
    <div className={className}>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            missing > 0 ? "bg-price" : "bg-olive",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {missing > 0 ? (
          <>
            Add <strong className="text-foreground">{money(missing)}</strong> more to reach the{" "}
            {money(site.minimumOrder)} minimum
          </>
        ) : (
          <span className="font-medium text-olive">✓ Minimum order reached</span>
        )}
      </p>
    </div>
  );
}

/** Sticky order panel shown beside the menu on large screens. */
export function OrderSidebar() {
  const { lines, subtotal, count, servesApprox, setQty, remove, checkout, setOpen } = useCart();
  const below = subtotal < site.minimumOrder;
  return (
    <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft lg:flex">
      <div className="border-b border-border px-5 py-4">
        <p className="font-serif text-xl font-semibold">Your Order</p>
        <p className="text-xs text-muted-foreground">
          {count
            ? `${count} tray${count > 1 ? "s" : ""} · serves approx. ${servesApprox}`
            : "Add trays from the menu"}
        </p>
      </div>
      {lines.length === 0 ? (
        <div className="flex flex-col items-center px-5 py-10 text-center text-sm text-muted-foreground">
          <ShoppingBag className="mb-3 size-8 text-primary/40" />
          <p>
            Your order is empty. Tap <strong className="text-foreground">Add</strong> on any tray to
            start.
          </p>
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
          {lines.map((l) => {
            const info = lineInfo(l);
            if (!info) return null;
            return (
              <li key={`${l.id}-${l.size}`} className="py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-snug">{info.item.name}</p>
                  <button
                    aria-label={`Remove ${info.item.name}`}
                    onClick={() => remove(l.id, l.size)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <QtyStepper
                    value={l.quantity}
                    min={0}
                    onChange={(n) => setQty(l.id, l.size, n)}
                  />
                  <span className="text-sm font-semibold tabular-nums">
                    {money(info.lineTotal)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div className="space-y-3 border-t border-border bg-secondary/40 px-5 py-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="font-serif text-2xl font-semibold text-price">{money(subtotal)}</span>
        </div>
        {lines.length > 0 && <MinimumProgress subtotal={subtotal} />}
        <Button
          variant="hero"
          className="h-12 w-full"
          disabled={lines.length === 0 || below}
          onClick={checkout}
        >
          Checkout
        </Button>
        {lines.length > 0 && (
          <button
            onClick={() => setOpen(true)}
            className="w-full text-center text-xs font-medium text-muted-foreground hover:text-primary"
          >
            Review full order
          </button>
        )}
        <PayLaterNote className="text-xs" />
      </div>
    </aside>
  );
}
