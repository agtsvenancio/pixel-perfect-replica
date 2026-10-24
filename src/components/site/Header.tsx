import { Phone, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { money, useCart } from "@/lib/cart";

/** Thin urgency bar + minimal header: logo, phone, order button. No navigation — every click leads to ordering. */
export function Header() {
  const { count, subtotal, setOpen } = useCart();
  return (
    <>
      <div className="bg-primary px-4 py-2 text-center text-xs font-semibold text-primary-foreground md:text-sm">
        Now booking holiday &amp; year-end parties — popular dates fill up fast.{" "}
        <a href="#menu" className="underline underline-offset-4 hover:no-underline">
          Reserve your order
        </a>
      </div>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
          <a href="#top" className="font-serif text-xl font-semibold leading-none md:text-2xl">
            Italian Bites <span className="italic text-primary">Catering</span>
          </a>
          <div className="flex items-center gap-3">
            <a
              href={site.phoneHref}
              className="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary md:flex"
            >
              <Phone className="size-4 text-primary" /> {site.phone}
            </a>
            <Button
              variant="hero"
              onClick={() => setOpen(true)}
              className="relative h-10 px-4 md:px-5"
            >
              <ShoppingBag />
              {count > 0 ? (
                <span>
                  <span className="hidden sm:inline">My order · </span>
                  {money(subtotal)}
                </span>
              ) : (
                <span>Order Now</span>
              )}
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-price px-1 text-[11px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}

export function MobileBar() {
  const { setOpen, count, subtotal } = useCart();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-[auto_1fr] gap-2 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
      <Button variant="soft" asChild className="h-12 px-5">
        <a href={site.phoneHref} aria-label="Call us">
          <Phone /> Call
        </a>
      </Button>
      <Button variant="hero" className="h-12" onClick={() => setOpen(true)}>
        <ShoppingBag />
        {count > 0 ? `View order · ${money(subtotal)}` : "Order Now"}
      </Button>
    </div>
  );
}
