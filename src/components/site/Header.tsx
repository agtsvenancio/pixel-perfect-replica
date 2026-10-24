import { useState } from "react";
import { Menu, Phone, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { money, useCart } from "@/lib/cart";

const nav = [
  { href: "#menu", label: "Menu & prices" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
  const { count, subtotal, setOpen } = useCart();
  const [mobile, setMobile] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-[4.5rem] md:px-6">
        <a href="#top" className="leading-tight">
          <span className="block text-xl font-extrabold tracking-tight md:text-[1.4rem]">
            Italian Bites
          </span>
          <span className="block text-xs font-medium text-muted-foreground">
            Italian catering in Astoria, NYC
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-[0.95rem] font-medium text-foreground/80 hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <a href={site.phoneHref} className="hidden items-center gap-2 font-semibold md:flex">
            <Phone className="size-4 text-primary" /> {site.phone}
          </a>
          <Button
            variant="hero"
            onClick={() => setOpen(true)}
            className="relative h-11 px-4 md:px-5"
          >
            <ShoppingBag />
            {count > 0 ? (
              <span className="tabular">
                <span className="hidden sm:inline">Order · </span>
                {money(subtotal)}
              </span>
            ) : (
              <span>Order now</span>
            )}
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-[11px] font-bold text-background">
                {count}
              </span>
            )}
          </Button>
          <button
            className="flex size-11 items-center justify-center rounded-lg lg:hidden"
            aria-label={mobile ? "Close menu" : "Open menu"}
            aria-expanded={mobile}
            onClick={() => setMobile((m) => !m)}
          >
            {mobile ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {mobile && (
        <nav
          className="border-t border-border bg-background px-4 py-2 lg:hidden"
          aria-label="Mobile"
        >
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setMobile(false)}
              className="block py-3 text-lg font-semibold"
            >
              {n.label}
            </a>
          ))}
          <a
            href={site.phoneHref}
            className="flex items-center gap-2 py-3 text-lg font-semibold text-primary"
          >
            <Phone className="size-5" /> Call {site.phone}
          </a>
        </nav>
      )}
    </header>
  );
}

/** Phone-sized bottom bar: call, or open the order. */
export function MobileBar() {
  const { setOpen, count, subtotal } = useCart();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-[auto_1fr] gap-2 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
      <Button variant="soft" asChild className="h-12 px-4">
        <a href={site.phoneHref} aria-label={`Call ${site.phone}`}>
          <Phone /> Call
        </a>
      </Button>
      <Button variant="hero" className="h-12 justify-between px-4" onClick={() => setOpen(true)}>
        <span className="flex items-center gap-2">
          <ShoppingBag /> {count > 0 ? `View order (${count})` : "Start your order"}
        </span>
        {count > 0 && <span className="tabular font-bold">{money(subtotal)}</span>}
      </Button>
    </div>
  );
}
