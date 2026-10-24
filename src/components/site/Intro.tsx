import { Phone, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { images, occasions } from "@/data/content";
import { getMenuItem, signatureDishIds, type MenuItem } from "@/data/menu";
import { money, useCart } from "@/lib/cart";
import { SafeImage, scrollTo } from "./primitives";

export function Hero() {
  const facts = [
    { k: "Half trays feed", v: `${site.portions.halfTray} people` },
    { k: "Minimum order", v: money(site.minimumOrder) },
    { k: "Order ahead", v: `${site.leadTimeDays} days` },
    { k: "Payment", v: "On delivery or pickup" },
  ];
  return (
    <section id="top" className="border-b-2 border-foreground">
      <div className="grid lg:grid-cols-2">
        <div className="flex flex-col justify-center px-4 py-12 md:px-6 md:py-16 lg:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] lg:pr-12">
          <h1 className="text-[2.6rem] sm:text-6xl lg:text-[3.5rem] xl:text-[4rem]">
            Italian catering trays, delivered across New York.
          </h1>
          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-muted-foreground md:text-xl">
            Lasagna, penne vodka, grilled skirt steak and fresh cannoli, cooked in our Astoria
            kitchen for office lunches, holiday parties and family gatherings.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="hero" className="h-12 px-6 text-base" onClick={() => scrollTo("menu")}>
              See the menu and prices
            </Button>
            <Button variant="soft" className="h-12 px-5 text-base" asChild>
              <a href={site.phoneHref}>
                <Phone /> {site.phone}
              </a>
            </Button>
          </div>
          <dl className="mt-10 grid grid-cols-2 border-t-2 border-foreground sm:grid-cols-4">
            {facts.map((f) => (
              <div key={f.k} className="border-b border-border py-3 pr-3 sm:border-b-0">
                <dt className="text-sm text-muted-foreground">{f.k}</dt>
                <dd className="mt-0.5 font-bold leading-tight">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <figure className="relative min-h-[320px] lg:min-h-[560px]">
          <SafeImage
            src={images.hero}
            alt="Catering buffet with trays of lasagna, penne and antipasto"
            eager
            className="absolute inset-0 h-full w-full"
          />
          <figcaption className="absolute bottom-0 left-0 bg-background px-3 py-2 text-sm">
            Lasagna, penne vodka and antipasto trays from our kitchen
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/** Big, appetizing photos of the signature trays, each addable straight to the order. */
export function KitchenStrip() {
  const { add, qtyOf } = useCart();
  const dishes = signatureDishIds.map(getMenuItem).filter(Boolean) as MenuItem[];
  return (
    <section aria-labelledby="kitchen-title" className="py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 id="kitchen-title" className="text-3xl md:text-5xl">
            What people order most
          </h2>
          <button
            onClick={() => scrollTo("menu")}
            className="inline-flex min-h-11 items-center font-semibold underline decoration-2 underline-offset-4 hover:text-primary"
          >
            Full menu with prices
          </button>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 md:scroll-px-6 md:px-6">
        {dishes.map((d) => {
          const inOrder = qtyOf(d.id);
          return (
            <figure
              key={d.id}
              className="w-[78%] shrink-0 snap-start sm:w-[42%] lg:w-[calc((100%-3rem)/4)]"
            >
              <SafeImage
                src={d.image}
                alt={d.name}
                sizes="(min-width: 1024px) 300px, (min-width: 640px) 42vw, 78vw"
                className="aspect-[4/5] w-full"
              />
              <figcaption className="mt-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-lg font-bold leading-snug">{d.name}</span>
                  <span className="tabular text-lg font-bold text-price">{money(d.price)}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {d.sizeLabel}, feeds about {d.servesApprox}
                </p>
                <button
                  onClick={() => {
                    add(d.id);
                    toast.success(`Added ${d.name}`);
                  }}
                  className="mt-1 inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary hover:underline"
                >
                  <Plus className="size-4" />
                  {inOrder ? `Add another (${inOrder} in your order)` : "Add to order"}
                </button>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      title: "Pick your trays",
      text: "Every price and portion is on the menu. Add what you need.",
    },
    {
      title: "Tell us when and where",
      text: "Delivery anywhere in NYC, or pickup at our kitchen. Pick the date and time.",
    },
    {
      title: "We call, you pay at the door",
      text: `We confirm within ${site.responseHours} hours. You pay when the food is delivered or picked up.`,
    },
  ];
  return (
    <section id="how-it-works" className="border-y-2 border-foreground bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
        <h2 className="text-3xl md:text-4xl">How ordering works</h2>
        <ol className="mt-8 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="sign text-5xl leading-none text-primary" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3 className="text-xl">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Plain list of what we cater; choosing one remembers the event type for checkout. */
export function Occasions() {
  const { openWithEvent } = useCart();
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <h2 className="text-3xl md:text-4xl">We cater</h2>
      <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-xl font-semibold md:text-2xl">
        {occasions.map((o) => (
          <li key={o.title}>
            <button
              onClick={() => {
                openWithEvent(o.eventType);
                toast(`Got it: ${o.eventType.toLowerCase()}. Now pick your trays.`);
              }}
              className="min-h-11 text-left underline decoration-foil decoration-2 underline-offset-[6px] hover:text-primary hover:decoration-primary"
            >
              {o.title}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
