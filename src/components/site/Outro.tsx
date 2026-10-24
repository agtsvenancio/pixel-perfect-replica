import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { gallery } from "@/data/content";
import { reviews } from "@/data/reviews";
import { money, useCart } from "@/lib/cart";
import { SafeImage, scrollTo } from "./primitives";

/** Uneven photo grid: the food is the decoration. */
export function Gallery() {
  const shots = gallery.slice(0, 8);
  const spans = ["col-span-2 row-span-2", "", "", "", "", "col-span-2", "", ""];
  return (
    <section
      aria-label="Photos from our kitchen"
      className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20"
    >
      <div className="grid auto-rows-[9rem] grid-cols-2 gap-2 sm:auto-rows-[12rem] md:grid-cols-4">
        {shots.map((g, i) => (
          <SafeImage
            key={g.alt}
            src={g.src}
            alt={g.alt}
            className={`h-full w-full ${spans[i] ?? ""}`}
          />
        ))}
      </div>
    </section>
  );
}

/** Renders only when real reviews exist in src/data/reviews.ts */
export function Reviews() {
  if (reviews.length === 0) return null;
  return (
    <section id="reviews" className="border-y-2 border-foreground bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <h2 className="text-3xl md:text-4xl">From our customers</h2>
        <div className="mt-8 grid gap-10 md:grid-cols-3">
          {reviews.map((r, i) => (
            <figure key={r.name + i}>
              <blockquote className="text-lg leading-relaxed">“{r.text}”</blockquote>
              <figcaption className="mt-3 font-semibold">
                {r.name}
                {r.source && (
                  <span className="font-normal text-muted-foreground">, {r.source}</span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export const faqs = [
  {
    q: "How far in advance should I order?",
    a: `Please place your order at least ${site.leadTimeDays} days before your event. For large events (100+ guests) or holiday dates, order 1 to 2 weeks ahead. Need it sooner? Call ${site.phone}.`,
  },
  {
    q: "How many people does a tray serve?",
    a: `A half tray feeds about ${site.portions.halfTray} people and a full tray about ${site.portions.fullTray}. The guest helper above the menu gives you a tray count per course.`,
  },
  {
    q: "Is there a minimum order?",
    a: `Yes, ${money(site.minimumOrder)} before tax and delivery.`,
  },
  {
    q: "Where do you deliver?",
    a: "Across all five boroughs of New York City. Pickup is available at our Astoria kitchen. Delivery fees depend on distance and are confirmed when we call you.",
  },
  { q: "Do you offer setup, chafing dishes and utensils?", a: site.faqAnswers.setup },
  {
    q: "Do you have vegetarian dishes?",
    a: "Yes: Pasta Primavera, All Cheese Lasagna, the salads and most sides. For allergies or special requests, add a note to your order.",
  },
  { q: "How do I pay?", a: site.faqAnswers.payment },
  {
    q: "What happens after I place my order?",
    a: `Nothing is charged online. We call or text you within ${site.responseHours} hours to confirm the menu, time and final total.`,
  },
];

export function FAQ() {
  return (
    <section id="faq" className="border-t-2 border-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:px-6 md:py-20 lg:grid-cols-[1fr_2fr]">
        <div>
          <h2 className="text-3xl md:text-5xl">Questions before you order</h2>
          <p className="mt-4 text-muted-foreground">
            Anything else, call{" "}
            <a
              href={site.phoneHref}
              className="font-semibold text-foreground underline underline-offset-4"
            >
              {site.phone}
            </a>
            .
          </p>
        </div>
        <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="text-lg font-bold leading-snug">{f.q}</dt>
              <dd className="mt-2 max-w-[60ch] leading-relaxed text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function FinalCta() {
  const { setOpen, count, subtotal } = useCart();
  return (
    <section className="bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-14 md:flex-row md:items-end md:justify-between md:px-6 md:py-20">
        <h2 className="max-w-2xl text-4xl md:text-6xl">
          {count > 0
            ? "Your order is waiting on the slip."
            : "Feeding a group soon? Start with the menu."}
        </h2>
        <div className="flex flex-wrap gap-3">
          {count > 0 ? (
            <Button variant="hero" className="h-12 px-6 text-base" onClick={() => setOpen(true)}>
              Finish your order ({money(subtotal)})
            </Button>
          ) : (
            <Button variant="hero" className="h-12 px-6 text-base" onClick={() => scrollTo("menu")}>
              See the menu and prices
            </Button>
          )}
          <Button variant="glass" className="h-12 px-5 text-base" asChild>
            <a href={site.phoneHref}>
              <Phone /> {site.phone}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-background/20 bg-foreground pb-28 text-background/80 lg:pb-10">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 pt-10 text-sm md:grid-cols-3 md:px-6">
        <div>
          <p className="sign text-xl text-background">Italian Bites</p>
          <p className="mt-2 max-w-xs">
            Italian catering trays from our kitchen in Astoria, Queens.
          </p>
        </div>
        <address className="not-italic leading-relaxed">
          {site.address.full}
          <br />
          <a href={site.phoneHref} className="hover:text-background hover:underline">
            {site.phone}
          </a>
          <br />
          <a href={`mailto:${site.email}`} className="hover:text-background hover:underline">
            {site.email}
          </a>
        </address>
        <div className="leading-relaxed">
          <p>
            Open every day, {site.hours[0]?.open} to {site.hours[0]?.close}
          </p>
          <p className="mt-2 flex gap-4">
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noreferrer"
              className="hover:text-background hover:underline"
            >
              Instagram
            </a>
            <a
              href={site.social.facebook}
              target="_blank"
              rel="noreferrer"
              className="hover:text-background hover:underline"
            >
              Facebook
            </a>
          </p>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-7xl px-4 text-xs text-background/50 md:px-6">
        © {new Date().getFullYear()} {site.name}
      </p>
    </footer>
  );
}
