import { ArrowRight, Facebook, Instagram, Phone, Star } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { CtaRow } from "./Intro";
import { Reveal, SafeImage, SectionHeading, scrollTo } from "./primitives";

export function Gallery() {
  const shots = gallery.slice(0, 8);
  return (
    <section className="overflow-hidden bg-secondary/60 py-20">
      <SectionHeading
        eyebrow="Made fresh, delivered hot"
        title="This Is What Arrives at Your Event"
      />
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 md:grid-cols-4 md:gap-4 md:px-6">
        {shots.map((g, i) => (
          <Reveal key={g.alt} delay={(i % 4) * 60}>
            <div className="group overflow-hidden rounded-2xl">
              <SafeImage
                src={g.src}
                alt={g.alt}
                className="aspect-square w-full transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </Reveal>
        ))}
      </div>
      <CtaRow className="mt-12 px-4" label="I Want This at My Event" />
    </section>
  );
}

/** Renders only when real reviews exist in src/data/reviews.ts */
export function Reviews() {
  if (reviews.length === 0) return null;
  return (
    <section id="reviews" className="bg-secondary/60 py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading eyebrow="Reviews" title="What New Yorkers Say" />
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal
              key={r.name + i}
              delay={i * 80}
              className="rounded-3xl border border-border bg-card p-7 shadow-soft"
            >
              <div className="flex gap-0.5 text-price">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={cn("size-4", s < r.rating ? "fill-current" : "opacity-30")}
                  />
                ))}
              </div>
              <p className="mt-4 leading-relaxed">“{r.text}”</p>
              <p className="mt-5 font-semibold">{r.name}</p>
              {(r.source || r.date) && (
                <p className="text-xs text-muted-foreground">
                  {[r.source, r.date].filter(Boolean).join(" · ")}
                </p>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export const faqs = [
  {
    q: "How far in advance should I order?",
    a: `Please place your order at least ${site.leadTimeDays} days before your event. For large events (100+ guests) or holiday season dates, we recommend ordering 1–2 weeks ahead. Last-minute? Call us at ${site.phone} and we'll do our best.`,
  },
  {
    q: "How many people does a tray serve?",
    a: `A half tray serves approximately ${site.portions.halfTray} guests and a full tray ${site.portions.fullTray} guests. Use our guest calculator above for a personalized recommendation.`,
  },
  {
    q: "Is there a minimum order?",
    a: `Yes, the minimum order is ${money(site.minimumOrder)} before tax and delivery.`,
  },
  {
    q: "Do you deliver? Where?",
    a: "We deliver across all five boroughs of New York City, and pickup is available at our Astoria kitchen. Delivery fees depend on distance and are confirmed when we finalize your order.",
  },
  { q: "Do you offer setup, chafing dishes and utensils?", a: site.faqAnswers.setup },
  {
    q: "Can you accommodate vegetarian or dietary needs?",
    a: "Absolutely. Several dishes are vegetarian (Pasta Primavera, All Cheese Lasagna, salads and sides), and we're happy to discuss allergies or special requests — just add a note to your order.",
  },
  { q: "How do I pay?", a: site.faqAnswers.payment },
  {
    q: "What happens after I submit my order?",
    a: `Submitting your order online doesn't charge you anything. A member of our team will contact you within ${site.responseHours} hours to confirm the menu, delivery details and final total.`,
  },
];

export function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-24 md:px-6">
      <SectionHeading
        eyebrow="FAQ"
        title="Before You Order"
        subtitle="The questions hosts ask us most."
      />
      <Reveal>
        <Accordion
          type="single"
          collapsible
          className="rounded-3xl border border-border bg-card px-6 shadow-soft"
        >
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`f${i}`} className="last:border-b-0">
              <AccordionTrigger className="py-5 text-left font-serif text-lg font-semibold hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
      <CtaRow className="mt-12" label="Start My Order" />
    </section>
  );
}

export function FinalCta() {
  const { setOpen, count, subtotal } = useCart();
  return (
    <section className="relative overflow-hidden">
      <SafeImage
        src={images.finalCta}
        alt="Festive Italian holiday table"
        className="absolute inset-0 h-full w-full"
      />
      <div className="overlay-hero absolute inset-0" />
      <div className="relative mx-auto max-w-4xl px-4 py-24 text-center text-cream md:px-6 md:py-28">
        <p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-cream/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur">
          <span className="size-2 animate-pulse rounded-full bg-price" /> Holiday season is booking
          now
        </p>
        <h2 className="text-4xl font-semibold leading-tight md:text-6xl">
          Don't Let Your Date Get Taken.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-cream/85">
          Pick your trays, send your order in 2 minutes and we'll call you within{" "}
          {site.responseHours} hours to confirm. No payment until then.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          {count > 0 ? (
            <Button variant="hero" size="xl" onClick={() => setOpen(true)}>
              Finish My Order · {money(subtotal)} <ArrowRight />
            </Button>
          ) : (
            <Button variant="hero" size="xl" onClick={() => scrollTo("menu")}>
              Start My Order <ArrowRight />
            </Button>
          )}
          <Button variant="glass" size="xl" asChild>
            <a href={site.phoneHref}>
              <Phone /> Call {site.phone}
            </a>
          </Button>
        </div>
        <p className="mt-6 text-sm text-cream/70">
          Prefer email?{" "}
          <a href={`mailto:${site.email}`} className="underline underline-offset-4">
            {site.email}
          </a>
        </p>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-charcoal pb-28 pt-10 text-sm text-cream/70 md:pb-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="font-serif text-xl font-semibold text-cream">
            Italian Bites <span className="italic text-price">Catering</span>
          </p>
          <p className="mt-2">
            {site.address.full} ·{" "}
            <a href={site.phoneHref} className="hover:text-price">
              {site.phone}
            </a>{" "}
            · {site.hoursSummary}
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="flex size-10 items-center justify-center rounded-full border border-cream/20 hover:border-price hover:text-price"
          >
            <Instagram className="size-4" />
          </a>
          <a
            href={site.social.facebook}
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            className="flex size-10 items-center justify-center rounded-full border border-cream/20 hover:border-price hover:text-price"
          >
            <Facebook className="size-4" />
          </a>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-cream/10 px-4 pt-5 text-xs text-cream/40 md:px-6">
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </div>
    </footer>
  );
}
