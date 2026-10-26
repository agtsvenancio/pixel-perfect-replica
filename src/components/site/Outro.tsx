import { ArrowRight, Phone } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { gallery, images } from "@/data/content";
import { reviews } from "@/data/reviews";
import { money, useCart } from "@/lib/cart";
import { SafeImage, scrollTo } from "./primitives";

/** Photo grid: real trays, so visitors see what arrives. */
export function Gallery() {
  const shots = gallery.slice(0, 8);
  const spans = ["col-span-2 row-span-2", "", "", "", "", "col-span-2", "", ""];
  return (
    <section
      aria-labelledby="gallery-title"
      className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20"
    >
      <h2 id="gallery-title" className="text-3xl md:text-4xl">
        From our kitchen to your table
      </h2>
      <div className="mt-8 grid auto-rows-[9rem] grid-cols-2 gap-2.5 sm:auto-rows-[12rem] md:grid-cols-4 md:gap-3">
        {shots.map((g, i) => (
          <SafeImage
            key={g.alt}
            src={g.src}
            alt={g.alt}
            sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
            className={`h-full w-full rounded-xl ${spans[i] ?? ""}`}
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
    <section id="reviews" className="bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <h2 className="text-3xl md:text-4xl">What our customers say</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {reviews.map((r, i) => (
            <figure key={r.name + i} className="rounded-2xl bg-background p-6">
              <p className="text-primary" aria-label={`${r.rating} out of 5 stars`}>
                {"★".repeat(r.rating)}
              </p>
              <blockquote className="mt-3 leading-relaxed">“{r.text}”</blockquote>
              <figcaption className="mt-4 font-semibold">
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
    q: "Do I have to pay online?",
    a: "No. Placing your order is free and nothing is charged online. You pay when the food is delivered or when you pick it up.",
  },
  {
    q: "Will there be enough food?",
    a: `A half tray serves about ${site.portions.halfTray} people and a full tray about ${site.portions.fullTray}. Each dish shows how many people it serves, and we double-check your order when we call.`,
  },
  {
    q: "How far in advance should I order?",
    a: `At least ${site.leadTimeDays} days before your event. For 100+ guests or holiday dates, order 1 to 2 weeks ahead. Need it sooner? Call ${site.phone}.`,
  },
  {
    q: "Where do you deliver?",
    a: "Across all five boroughs of New York City. You can also pick up at our kitchen in Astoria. Delivery fees depend on distance and are confirmed when we call you.",
  },
  {
    q: "Is there a minimum order?",
    a: `Yes, ${money(site.minimumOrder)} before tax and delivery.`,
  },
  { q: "Do you provide setup, chafing dishes and utensils?", a: site.faqAnswers.setup },
  {
    q: "Do you have vegetarian options?",
    a: "Yes: Pasta Primavera, All Cheese Lasagna, the salads and most sides. For allergies or special requests, add a note to your order.",
  },
  {
    q: "What happens after I place my order?",
    a: `You get an order number right away. We call or text you within ${site.responseHours} hours to confirm the menu, time and final total.`,
  },
];

export function FAQ() {
  return (
    <section id="faq" className="bg-secondary">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:px-6 md:py-20 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div>
          <h2 className="text-3xl md:text-4xl">Questions before you order</h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Still unsure? Call us at{" "}
            <a
              href={site.phoneHref}
              className="font-semibold text-foreground underline underline-offset-4"
            >
              {site.phone}
            </a>
            . We answer every day, {site.hours[0]?.open} to {site.hours[0]?.close}.
          </p>
        </div>
        <Accordion
          type="single"
          collapsible
          defaultValue="f0"
          className="rounded-2xl bg-background px-5 md:px-6"
        >
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`f${i}`} className="last:border-b-0">
              <AccordionTrigger className="py-5 text-left text-base font-semibold hover:no-underline md:text-lg">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export function FinalCta() {
  const { setOpen, count, subtotal } = useCart();
  return (
    <section className="relative isolate overflow-hidden bg-foreground">
      <SafeImage
        src={images.finalCta}
        alt=""
        sizes="100vw"
        className="absolute inset-0 -z-10 h-full w-full opacity-40"
      />
      <div className="mx-auto max-w-7xl px-4 py-16 text-white md:px-6 md:py-24">
        <h2 className="max-w-2xl text-3xl md:text-5xl">
          {count > 0 ? "Your order is almost ready" : "Ready to feed your guests?"}
        </h2>
        <p className="mt-4 max-w-xl text-lg text-white/85">
          Order online in a few minutes. No payment until your food arrives, and we confirm
          everything by phone.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {count > 0 ? (
            <Button variant="hero" className="h-13 px-7 text-base" onClick={() => setOpen(true)}>
              Finish my order ({money(subtotal)}) <ArrowRight />
            </Button>
          ) : (
            <Button variant="hero" className="h-13 px-7 text-base" onClick={() => scrollTo("menu")}>
              See the menu & order <ArrowRight />
            </Button>
          )}
          <Button variant="glass" className="h-13 px-6 text-base" asChild>
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
    <footer className="bg-[#171b19] pb-28 text-white/75 lg:pb-10">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 pt-12 text-sm md:grid-cols-3 md:px-6">
        <div>
          <p className="text-lg font-extrabold text-white">Italian Bites Catering</p>
          <p className="mt-2 max-w-xs">
            Italian catering trays from our kitchen in Astoria, Queens. Delivery across NYC.
          </p>
        </div>
        <address className="not-italic leading-relaxed">
          <p className="mb-1 font-semibold text-white">Contact</p>
          {site.address.full}
          <br />
          <a
            href={site.phoneHref}
            className="inline-flex min-h-8 items-center hover:text-white hover:underline"
          >
            {site.phone}
          </a>
          <br />
          <a
            href={`mailto:${site.email}`}
            className="inline-flex min-h-8 items-center hover:text-white hover:underline"
          >
            {site.email}
          </a>
        </address>
        <div className="leading-relaxed">
          <p className="mb-1 font-semibold text-white">Hours</p>
          <p>
            Every day, {site.hours[0]?.open} to {site.hours[0]?.close}
          </p>
          <p className="mt-2 flex gap-6">
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center hover:text-white hover:underline"
            >
              Instagram
            </a>
            <a
              href={site.social.facebook}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center hover:text-white hover:underline"
            >
              Facebook
            </a>
          </p>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-7xl border-t border-white/10 px-4 pt-6 text-xs text-white/70 md:px-6">
        © {new Date().getFullYear()} {site.name}
      </p>
    </footer>
  );
}
