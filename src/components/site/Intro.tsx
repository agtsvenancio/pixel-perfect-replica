import {
  ArrowRight,
  Award,
  Check,
  ChefHat,
  Clock,
  CreditCard,
  Phone,
  PhoneCall,
  Plus,
  ShieldCheck,
  Soup,
  Truck,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { images, occasions } from "@/data/content";
import { getMenuItem, menu, signatureDishIds, type MenuItem } from "@/data/menu";
import { money, useCart } from "@/lib/cart";
import { Reveal, SafeImage, SectionHeading, scrollTo } from "./primitives";

const lowestPrice = Math.min(...menu.map((m) => m.price));

/** Reusable call-to-action row placed after each persuasive block. */
export function CtaRow({
  label = "See the Menu & Prices",
  dark,
  className = "",
}: {
  label?: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
      <Button variant="hero" size="xl" onClick={() => scrollTo("menu")}>
        {label} <ArrowRight />
      </Button>
      <Button variant={dark ? "glass" : "soft"} size="xl" asChild>
        <a href={site.phoneHref}>
          <Phone /> {site.phone}
        </a>
      </Button>
    </div>
  );
}

export function Hero() {
  const { add, setOpen } = useCart();
  const bestsellers = signatureDishIds.slice(0, 3).map(getMenuItem).filter(Boolean) as MenuItem[];
  const benefits = [
    "Homemade Italian recipes, cooked fresh for your event",
    `Generous trays — a half tray feeds ${site.portions.halfTray} people`,
    "Delivered hot and on time anywhere in NYC",
    "Order online in 2 minutes — pay on delivery or pickup",
  ];
  return (
    <section id="top" className="relative overflow-hidden">
      <SafeImage
        src={images.hero}
        alt="Abundant Italian catering buffet with lasagna, penne and antipasto trays"
        eager
        className="absolute inset-0 h-full w-full"
      />
      <div className="overlay-hero absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-16 pt-12 md:px-6 md:pb-24 md:pt-20 lg:grid-cols-[1.25fr_1fr]">
        <div className="min-w-0 text-cream animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-cream/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cream/90 backdrop-blur">
            <span className="size-2 animate-pulse rounded-full bg-price" /> Italian catering ·
            Astoria → all of NYC
          </p>
          <h1 className="text-4xl font-semibold leading-[1.05] md:text-6xl">
            Your Next Party, Fed With <em className="text-price">Real Italian Food</em> Everyone
            Will Talk About
          </h1>
          <p className="mt-5 max-w-xl text-lg text-cream/85">
            Holiday parties, office lunches, corporate events and family celebrations — trays of
            homemade lasagna, penne vodka, grilled steak and fresh cannoli, delivered ready to
            serve.
          </p>
          <ul className="mt-6 space-y-2.5">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-cream/90">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-price text-charcoal">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="hero" size="xl" onClick={() => scrollTo("menu")}>
              Start My Order <ArrowRight />
            </Button>
            <Button variant="glass" size="xl" asChild>
              <a href={site.phoneHref}>
                <Phone /> Call {site.phone}
              </a>
            </Button>
          </div>
          <p className="mt-5 text-sm text-cream/70">
            Trays from <span className="font-semibold text-price">{money(lowestPrice)}</span> ·
            Minimum order {money(site.minimumOrder)} · Book {site.leadTimeDays}+ days ahead
          </p>
        </div>

        {/* Quick-order card: put food in the cart without scrolling */}
        <div className="min-w-0 rounded-3xl bg-card/95 p-5 text-foreground shadow-warm backdrop-blur animate-in fade-in slide-in-from-right-8 duration-1000 md:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Crowd favorites
          </p>
          <p className="mt-1 font-serif text-2xl font-semibold">Add in one click</p>
          <ul className="mt-4 space-y-3">
            {bestsellers.map((d) => (
              <li key={d.id} className="flex items-center gap-3">
                <SafeImage src={d.image} alt={d.name} className="size-16 shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold leading-tight">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-price">{money(d.price)}</span> ·{" "}
                    {d.sizeLabel} · serves ~{d.servesApprox}
                  </p>
                </div>
                <Button
                  variant="hero"
                  size="icon"
                  className="size-10 shrink-0 rounded-full"
                  aria-label={`Add ${d.name}`}
                  onClick={() => {
                    add(d.id);
                    toast.success(`${d.name} added`, {
                      action: { label: "View order", onClick: () => setOpen(true) },
                    });
                  }}
                >
                  <Plus />
                </Button>
              </li>
            ))}
          </ul>
          <button
            onClick={() => scrollTo("menu")}
            className="mt-5 flex w-full items-center justify-center gap-1 rounded-full border border-border py-3 text-sm font-semibold hover:border-primary hover:text-primary"
          >
            See the full menu ({menu.length} dishes) <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

export function TrustBar() {
  const items = [
    { icon: Award, label: `${site.yearsOfExperience}+ Years of Experience` },
    { icon: ChefHat, label: `${site.eventsCatered.toLocaleString()}+ Events Catered` },
    { icon: Users, label: `Serving ${site.guestRange} Guests` },
    { icon: Soup, label: "Fresh, Homemade Every Day" },
  ];
  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-7 md:grid-cols-4 md:px-6">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <span className="text-sm font-semibold leading-tight md:text-base">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Problem → solution: the core sales argument. */
export function PainSolution() {
  const pains = [
    "Guessing how much food to order — and running out",
    "Cold, bland catering trays nobody finishes",
    "Late deliveries while your guests wait",
    "Juggling five vendors and endless phone calls",
  ];
  const wins = [
    "We tell you exactly how many trays you need",
    "Homemade Italian food your guests ask about afterwards",
    "Delivered hot and on time, ready to serve",
    "One order, one call — we handle everything",
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-24">
      <SectionHeading
        eyebrow="Why hosts choose us"
        title="Feeding a Crowd Shouldn't Be Stressful"
        subtitle="You have an event to run. Let us take the food completely off your plate."
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Reveal className="rounded-3xl border border-border bg-muted/60 p-7 md:p-9">
          <p className="font-serif text-2xl font-semibold text-muted-foreground">
            Typical catering
          </p>
          <ul className="mt-5 space-y-4">
            {pains.map((p) => (
              <li key={p} className="flex items-start gap-3 text-muted-foreground">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground/10">
                  <X className="size-3.5" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal
          delay={120}
          className="relative overflow-hidden rounded-3xl border-2 border-primary bg-card p-7 shadow-warm md:p-9"
        >
          <p className="font-serif text-2xl font-semibold">
            With Italian Bites <span className="italic text-primary">Catering</span>
          </p>
          <ul className="mt-5 space-y-4">
            {wins.map((w) => (
              <li key={w} className="flex items-start gap-3 font-medium">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {w}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
      <CtaRow className="mt-12" label="Show Me the Food" />
    </section>
  );
}

/** Who it's for — compact, each tile opens the order with the event pre-selected. */
export function Occasions() {
  const { openWithEvent } = useCart();
  return (
    <section className="bg-secondary/60 py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading eyebrow="Perfect for" title="Whatever You're Celebrating, We'll Feed It" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
          {occasions.map((o, i) => (
            <Reveal key={o.title} delay={i * 50}>
              <button
                onClick={() => openWithEvent(o.eventType)}
                className="group relative block aspect-[3/4] w-full overflow-hidden rounded-2xl text-left shadow-soft"
              >
                <SafeImage
                  src={o.image}
                  alt={o.title}
                  className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-110"
                />
                <div className="overlay-card absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-cream">
                  <h3 className="text-lg font-semibold leading-tight">{o.title}</h3>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-price">
                    Order now <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      icon: Soup,
      title: "Pick your trays",
      text: "Choose from the menu below — prices and portions are right there.",
    },
    {
      icon: Users,
      title: "Tell us about your event",
      text: "Date, time, number of guests and delivery address. Takes 2 minutes.",
    },
    {
      icon: Truck,
      title: "We cook & deliver",
      text: "Fresh, hot and on time. You enjoy the party.",
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-24">
      <SectionHeading eyebrow="How it works" title="Order in 3 Simple Steps" />
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, text }, i) => (
          <Reveal
            key={title}
            delay={i * 100}
            className="relative rounded-3xl border border-border bg-card p-8 shadow-soft"
          >
            <span className="absolute right-6 top-4 font-serif text-6xl font-semibold text-primary/10">
              {i + 1}
            </span>
            <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Icon className="size-5" />
            </span>
            <h3 className="mt-5 text-2xl font-semibold">{title}</h3>
            <p className="mt-2 text-muted-foreground">{text}</p>
          </Reveal>
        ))}
      </div>
      <CtaRow className="mt-12" label="Start My Order" />
    </section>
  );
}

/** Risk reversal — everything here reflects how the order flow actually works. */
export function Promise() {
  const points = [
    {
      icon: CreditCard,
      title: "No payment online",
      text: "Placing your order costs nothing. You pay when the food is delivered or when you pick it up.",
    },
    {
      icon: PhoneCall,
      title: `A real person calls you within ${site.responseHours}h`,
      text: "We review your menu, portions and delivery time together — and adjust anything you need.",
    },
    {
      icon: Clock,
      title: "On time, ready to serve",
      text: "Hot, fresh food arrives when you need it, so you can focus on your guests.",
    },
  ];
  return (
    <section className="bg-charcoal py-20 text-cream md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <ShieldCheck className="mx-auto size-12 text-price" strokeWidth={1.5} />
          <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
            Order With Zero Risk
          </h2>
          <p className="mt-4 text-lg text-cream/70">
            Reserve your date now. Nothing is final until we've talked.
          </p>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {points.map(({ icon: Icon, title, text }, i) => (
            <Reveal
              key={title}
              delay={i * 100}
              className="rounded-3xl border border-cream/10 bg-cream/5 p-7"
            >
              <Icon className="size-7 text-price" />
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-cream/70">{text}</p>
            </Reveal>
          ))}
        </div>
        <CtaRow className="mt-12" dark label="Reserve My Date" />
      </div>
    </section>
  );
}
