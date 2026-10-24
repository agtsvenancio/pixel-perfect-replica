import { ArrowRight, Clock, Facebook, Instagram, Mail, MapPin, Phone, Star } from "lucide-react";
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
import { navLinks } from "./Header";
import { Reveal, SafeImage, SectionHeading, scrollTo } from "./primitives";

export function Gallery() {
  return (
    <section id="gallery" className="py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Gallery"
          title="Straight From Our Kitchen"
          subtitle="Real trays, real events, real New York appetites."
        />
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
          {gallery.map((g, i) => (
            <Reveal key={g.alt} delay={(i % 4) * 60} className="break-inside-avoid">
              <div className="group overflow-hidden rounded-2xl">
                <SafeImage
                  src={g.src}
                  alt={g.alt}
                  className={cn(
                    "w-full transition-transform duration-700 group-hover:scale-105",
                    i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/3]",
                  )}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
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
      <SectionHeading eyebrow="FAQ" title="Questions? We've Got Answers" />
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
    </section>
  );
}

export function Contact() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(site.address.mapQuery)}&output=embed`;
  const rows = [
    { icon: Phone, label: "Phone", value: site.phone, href: site.phoneHref },
    { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    {
      icon: MapPin,
      label: "Kitchen",
      value: site.address.full,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address.mapQuery)}`,
    },
    { icon: Clock, label: "Hours", value: site.hoursSummary },
  ];
  return (
    <section id="contact" className="bg-secondary/60 py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-6 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow mb-3">Contact</p>
          <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
            Let's Plan Your Event
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Call, email or start your order online — we'll take it from there.
          </p>
          <ul className="mt-8 space-y-5">
            {rows.map(({ icon: Icon, label, value, href }) => (
              <li key={label} className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="text-lg font-semibold hover:text-primary"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-lg font-semibold">{value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="hero" size="xl" asChild>
              <a href={site.phoneHref}>
                <Phone /> Call {site.phone}
              </a>
            </Button>
          </div>
        </Reveal>
        <Reveal
          delay={120}
          className="min-h-[360px] overflow-hidden rounded-3xl border border-border shadow-soft"
        >
          <iframe
            title={`Map to ${site.name}`}
            src={mapSrc}
            loading="lazy"
            className="h-full min-h-[360px] w-full border-0"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Reveal>
      </div>
    </section>
  );
}

export function FinalCta() {
  const { setOpen } = useCart();
  return (
    <section className="relative overflow-hidden">
      <SafeImage
        src={images.finalCta}
        alt="Festive Italian holiday table"
        className="absolute inset-0 h-full w-full"
      />
      <div className="overlay-hero absolute inset-0" />
      <div className="relative mx-auto max-w-4xl px-4 py-28 text-center text-cream md:px-6">
        <h2 className="text-4xl font-semibold leading-tight md:text-6xl">
          Your guests deserve a real Italian feast.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-cream/85">
          Holiday dates fill up fast. Reserve your order today — no payment needed until we confirm.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button variant="hero" size="xl" onClick={() => scrollTo("menu")}>
            Build Your Order <ArrowRight />
          </Button>
          <Button variant="glass" size="xl" onClick={() => setOpen(true)}>
            Review My Order
          </Button>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-charcoal pb-28 pt-16 text-cream/80 md:pb-12">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <p className="font-serif text-2xl font-semibold text-cream">
            Italian Bites <span className="italic text-price">Catering</span>
          </p>
          <p className="mt-3 max-w-sm text-sm">
            {site.tagline} Homemade trays delivered across New York City from our kitchen in
            Astoria, Queens.
          </p>
          <div className="mt-5 flex gap-3">
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
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-cream">Explore</p>
          <ul className="space-y-2 text-sm">
            {navLinks.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} className="hover:text-price">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-cream">
            Visit & Order
          </p>
          <ul className="space-y-2 text-sm">
            <li>{site.address.full}</li>
            <li>
              <a href={site.phoneHref} className="hover:text-price">
                {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-price">
                {site.email}
              </a>
            </li>
            <li>{site.hoursSummary}</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-cream/10 px-4 pt-6 text-xs text-cream/50 md:px-6">
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </div>
    </footer>
  );
}
