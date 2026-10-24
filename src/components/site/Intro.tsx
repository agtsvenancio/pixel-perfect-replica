import { Award, ChefHat, Clock, Users, Heart, Soup, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { images, occasions } from "@/data/content";
import { useCart } from "@/lib/cart";
import { Reveal, SafeImage, SectionHeading, scrollTo } from "./primitives";

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-[88vh] items-end overflow-hidden">
      <SafeImage
        src={images.hero}
        alt="Abundant Italian catering buffet with lasagna, penne and antipasto trays"
        eager
        className="absolute inset-0 h-full w-full scale-105 animate-in fade-in zoom-in-110 duration-[2000ms]"
      />
      <div className="overlay-hero absolute inset-0" />
      <div className="relative mx-auto w-full max-w-7xl px-4 pb-20 pt-32 md:px-6 md:pb-28">
        <div className="max-w-3xl text-cream animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-cream/80">
            Astoria, Queens · New York City
          </p>
          <h1 className="text-5xl font-semibold leading-[1.05] md:text-7xl">
            Authentic Italian Catering for New York's{" "}
            <em className="text-price">Best Celebrations</em>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-cream/85 md:text-xl">
            From holiday parties to corporate lunches, we bring generous trays of homemade Italian
            food straight to your table — fresh, hot and ready to impress.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button variant="hero" size="xl" onClick={() => scrollTo("menu")}>
              Build Your Order <ArrowRight />
            </Button>
            <Button variant="glass" size="xl" onClick={() => scrollTo("menu")}>
              View Menu
            </Button>
          </div>
          <p className="mt-7 text-sm text-cream/75">
            <span className="text-price">★★★★★</span> Loved by NYC offices & families · Delivery
            across NYC · Easy online ordering
          </p>
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
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4 md:px-6">
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

export function About() {
  const values = [
    {
      icon: Heart,
      title: "Homemade Recipes",
      text: "Slow-cooked sauces and family recipes, made fresh daily.",
    },
    {
      icon: Users,
      title: "Generous Portions",
      text: "Trays that truly feed a crowd — nobody leaves hungry.",
    },
    {
      icon: Clock,
      title: "On-Time, Every Time",
      text: "NYC delivery that respects your schedule.",
    },
  ];
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-24 md:px-6">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal className="relative">
          <SafeImage
            src={images.kitchen}
            alt="Italian chef preparing trays in the Astoria kitchen"
            className="aspect-[4/5] w-full rounded-3xl shadow-soft"
          />
          <div className="absolute -bottom-6 -right-4 hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-warm md:block">
            <p className="font-serif text-4xl font-semibold">{site.yearsOfExperience}+</p>
            <p className="text-sm">years of Italian tradition</p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <p className="eyebrow mb-3">About Italian Bites</p>
          <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
            Italian Tradition, New York Style
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            At Italian Bites Catering, we believe the best moments happen around the table. Our
            recipes come from classic Italian tradition — slow-cooked sauces, fresh herbs, real
            cheeses and bread baked golden — prepared fresh in our Astoria kitchen and delivered
            across New York City.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Feeding a team of 15 at a Monday meeting or hosting 200 guests at a holiday party? We
            take care of everything, so you can enjoy the event. Generous portions, on-time delivery
            and food that gets people talking.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {values.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <Icon className="mb-3 size-6 text-olive" />
                <h3 className="font-serif text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Occasions() {
  const { openWithEvent } = useCart();
  return (
    <section id="occasions" className="bg-secondary/60 py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Occasions"
          title="Every Event Deserves a Feast"
          subtitle="Ten guests or five hundred — we know how to feed New York."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {occasions.map((o, i) => (
            <Reveal key={o.title} delay={i * 60}>
              <button
                onClick={() => openWithEvent(o.eventType)}
                className="group relative block aspect-[4/3] w-full overflow-hidden rounded-3xl text-left shadow-soft"
              >
                <SafeImage
                  src={o.image}
                  alt={o.title}
                  className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-110"
                />
                <div className="overlay-card absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-cream">
                  <h3 className="text-2xl font-semibold">{o.title}</h3>
                  <p className="mt-1 text-sm text-cream/85">{o.line}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-price">
                    Order for this event{" "}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
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
      title: "Choose your food",
      text: "Pick your favorite trays from our menu.",
    },
    {
      icon: Users,
      title: "Tell us about your event",
      text: "Date, time, number of guests and delivery address.",
    },
    {
      icon: Truck,
      title: "We cook & deliver",
      text: "Fresh, hot and on time. You enjoy the party.",
    },
  ];
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-24 md:px-6">
      <SectionHeading eyebrow="How It Works" title="Ordering Is Easy as 1-2-3" />
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
      <p className="mt-10 text-center text-muted-foreground">
        Need help choosing? Call us at{" "}
        <a
          href={site.phoneHref}
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          {site.phone}
        </a>{" "}
        and we'll build the perfect menu with you.
      </p>
    </section>
  );
}
