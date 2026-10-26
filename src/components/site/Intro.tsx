import {
  ArrowRight,
  Banknote,
  CalendarClock,
  Check,
  PhoneCall,
  Phone,
  Truck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { images, occasions } from "@/data/content";
import { menu } from "@/data/menu";
import { money, useCart } from "@/lib/cart";
import { SafeImage, scrollTo } from "./primitives";

const lowest = Math.min(...menu.map((m) => m.price));

export function Hero() {
  const points = [
    "Homemade lasagna, pastas, steak, salads and desserts",
    `Each half tray feeds ${site.portions.halfTray} people`,
    "Delivered across NYC, or pick up in Astoria",
    "Order online now, pay when you receive the food",
  ];
  return (
    <section id="top" className="relative isolate overflow-hidden bg-foreground">
      <SafeImage
        src={images.hero}
        alt="Trays of penne, lasagna and antipasto on a catering buffet"
        eager
        sizes="100vw"
        className="absolute inset-0 -z-10 h-full w-full"
      />
      <div className="overlay-hero absolute inset-0 -z-10" />
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-14 md:px-6 md:pb-24 md:pt-24">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl leading-[1.08] md:text-6xl">
            Italian catering trays for your next event in New York
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85 md:text-xl">
            Pick your trays, choose delivery or pickup, and we take care of the food. Trays from{" "}
            {money(lowest)}.
          </p>
          <ul className="mt-6 grid gap-2.5">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-white/90">
                <Check className="mt-0.5 size-5 shrink-0 text-[#7fd49b]" strokeWidth={2.5} />
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="hero" className="h-13 px-7 text-base" onClick={() => scrollTo("menu")}>
              See the menu & order
              <ArrowRight />
            </Button>
            <Button variant="glass" className="h-13 px-6 text-base" asChild>
              <a href={site.phoneHref}>
                <Phone /> Call {site.phone}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The four things people worry about before ordering catering, answered up front. */
export function Assurances() {
  const items = [
    { icon: Banknote, title: "No payment online", text: "You pay on delivery or at pickup." },
    {
      icon: PhoneCall,
      title: "We confirm by phone",
      text: `A real person calls you within ${site.responseHours} hours.`,
    },
    {
      icon: Users,
      title: "The right amount of food",
      text: `Each half tray feeds ${site.portions.halfTray} people.`,
    },
    {
      icon: CalendarClock,
      title: `Order ${site.leadTimeDays} days ahead`,
      text: `Minimum order ${money(site.minimumOrder)}.`,
    },
  ];
  return (
    <section aria-label="Why ordering is easy" className="border-b border-border bg-background">
      <ul className="mx-auto grid max-w-7xl grid-cols-1 gap-x-8 gap-y-5 px-4 py-8 sm:grid-cols-2 md:px-6 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3.5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="font-semibold leading-snug">{title}</p>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** "What's the event?" — lets visitors recognise their situation and jump to the menu. */
export function Occasions() {
  const { openWithEvent } = useCart();
  const picks = occasions.filter((o) =>
    ["Office Lunch/Meeting", "Holiday Party", "Family Gathering", "Corporate Event"].includes(
      o.eventType,
    ),
  );
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
      <h2 className="text-3xl md:text-4xl">What are you planning?</h2>
      <p className="mt-2 max-w-xl text-lg text-muted-foreground">
        Office lunches for 15 or holiday parties for 200. Pick your event and go straight to the
        menu.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {picks.map((o) => (
          <button
            key={o.title}
            onClick={() => {
              openWithEvent(o.eventType);
              toast(`${o.title}: now pick your trays`);
            }}
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl text-left focus-visible:outline-offset-4"
          >
            <SafeImage
              src={o.image}
              alt=""
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105"
            />
            <span className="overlay-card absolute inset-0" />
            <span className="absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
              <span className="block text-lg font-bold leading-snug md:text-xl">{o.title}</span>
              <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-white/85 group-hover:text-white">
                See the menu <ArrowRight className="size-4" />
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      icon: Users,
      title: "Choose your trays",
      text: "Prices and portions are on every dish. Not sure how much? Call us and we will help.",
    },
    {
      icon: Truck,
      title: "Delivery or pickup",
      text: "Tell us the date, time and address. Delivery anywhere in NYC, or pick up in Astoria.",
    },
    {
      icon: PhoneCall,
      title: "We confirm, you pay at the door",
      text: `We call within ${site.responseHours} hours to confirm. You pay when the food arrives.`,
    },
  ];
  return (
    <section id="how-it-works" className="bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <h2 className="text-3xl md:text-4xl">How ordering works</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl bg-background p-6 md:p-7">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="text-xl">{s.title}</h3>
              </div>
              <p className="mt-3 text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <Button variant="hero" className="h-12 px-6 text-base" onClick={() => scrollTo("menu")}>
            Start my order <ArrowRight />
          </Button>
        </div>
      </div>
    </section>
  );
}
