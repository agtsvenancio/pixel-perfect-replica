import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { money, useCart } from "@/lib/cart";

/** Shopfront header: name, phone, and the order button that always shows the running total. */
export function Header() {
  const { count, subtotal, setOpen } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <a href="#top" className="flex items-baseline gap-3 leading-none">
          <span className="sign text-xl md:text-2xl">Italian Bites</span>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Catering in Astoria, Queens
          </span>
        </a>
        <div className="flex items-center gap-4">
          <a
            href={site.phoneHref}
            className="hidden items-center gap-2 font-semibold hover:text-primary md:flex"
          >
            <Phone className="size-4" /> {site.phone}
          </a>
          <Button variant="hero" onClick={() => setOpen(true)} className="h-10 px-4">
            {count > 0 ? (
              <span className="tabular">
                Your order: {count} {count === 1 ? "tray" : "trays"}, {money(subtotal)}
              </span>
            ) : (
              <span>Order catering</span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}

/** Phone-sized bottom bar: call, or open the order. */
export function MobileBar() {
  const { setOpen, count, subtotal } = useCart();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-[auto_1fr] gap-2 border-t-2 border-foreground bg-background p-3 lg:hidden">
      <Button variant="soft" asChild className="h-12 px-4">
        <a href={site.phoneHref} aria-label={`Call ${site.phone}`}>
          <Phone /> Call
        </a>
      </Button>
      <Button variant="hero" className="h-12 justify-between px-4" onClick={() => setOpen(true)}>
        <span>{count > 0 ? `Your order (${count})` : "Start your order"}</span>
        {count > 0 && <span className="tabular font-bold">{money(subtotal)}</span>}
      </Button>
    </div>
  );
}
