import { useState } from "react";
import { Menu, Phone, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { useCart } from "@/lib/cart";

export const navLinks = [
  { id: "about", label: "About" },
  { id: "occasions", label: "Occasions" },
  { id: "menu", label: "Menu" },
  { id: "packages", label: "Packages" },
  { id: "how-it-works", label: "How It Works" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

export function Header() {
  const { count, setOpen } = useCart();
  const [mobile, setMobile] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-20 md:px-6">
        <a href="#top" className="font-serif text-xl font-semibold leading-none md:text-2xl">
          Italian Bites <span className="italic text-primary">Catering</span>
        </a>
        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={site.phoneHref}
            className="hidden items-center gap-2 text-sm font-semibold hover:text-primary md:flex"
          >
            <Phone className="size-4 text-primary" /> {site.phone}
          </a>
          <Button
            variant="hero"
            onClick={() => setOpen(true)}
            className="relative h-10 px-4 md:px-5"
          >
            <ShoppingBag />
            <span className="hidden sm:inline">Start Your Order</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-price px-1 text-[11px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Button>
          <button
            className="p-2 lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobile((m) => !m)}
          >
            {mobile ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {mobile && (
        <nav className="border-t border-border bg-background px-4 py-3 lg:hidden">
          {navLinks.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={() => setMobile(false)}
              className="block py-2.5 font-medium"
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

export function MobileBar() {
  const { setOpen, count } = useCart();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
      <Button variant="soft" asChild className="h-12">
        <a href={site.phoneHref}>
          <Phone /> Call
        </a>
      </Button>
      <Button variant="hero" className="h-12" onClick={() => setOpen(true)}>
        <ShoppingBag /> Order Now{count > 0 ? ` (${count})` : ""}
      </Button>
    </div>
  );
}
