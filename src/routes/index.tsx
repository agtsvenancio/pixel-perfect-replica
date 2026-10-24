import { createFileRoute } from "@tanstack/react-router";
import { CartDrawer } from "@/components/site/CartDrawer";
import { Header, MobileBar } from "@/components/site/Header";
import {
  Hero,
  HowItWorks,
  Occasions,
  PainSolution,
  Promise,
  TrustBar,
} from "@/components/site/Intro";
import { GuestCalculator, MenuSection, SignatureDishes } from "@/components/site/Menu";
import { FAQ, faqs, FinalCta, Footer, Gallery, Reviews } from "@/components/site/Outro";
import { site } from "@/config/site";
import { CartProvider } from "@/lib/cart";

const title = "Italian Bites Catering | Italian Catering in Astoria & NYC";
const description =
  "Authentic Italian catering in New York City. Homemade trays of lasagna, penne vodka, steak and cannoli for holiday parties, corporate events and office lunches. Order online — delivery across NYC.";

const dayCodes: Record<string, string> = {
  Monday: "Mo",
  Tuesday: "Tu",
  Wednesday: "We",
  Thursday: "Th",
  Friday: "Fr",
  Saturday: "Sa",
  Sunday: "Su",
};
const to24 = (t: string) => {
  const [hm = "0:00", ap] = t.split(" ");
  const [hh = 0, m = 0] = hm.split(":").map(Number);
  let h = hh;
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["FoodEstablishment", "LocalBusiness"],
      name: site.name,
      description,
      telephone: site.phoneHref.replace("tel:", ""),
      email: site.email,
      servesCuisine: "Italian",
      priceRange: "$$",
      areaServed: "New York City",
      address: {
        "@type": "PostalAddress",
        streetAddress: site.address.street,
        addressLocality: site.address.city,
        addressRegion: site.address.region,
        postalCode: site.address.postalCode,
        addressCountry: site.address.country,
      },
      openingHours: site.hours.map((h) => `${dayCodes[h.day]} ${to24(h.open)}-${to24(h.close)}`),
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

// og:image is intentionally omitted so the hosting can inject the project's social preview.
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "theme-color", content: "#a3272a" },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
  }),
  component: Index,
});

function Index() {
  return (
    <CartProvider>
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <PainSolution />
        <SignatureDishes />
        <MenuSection />
        <GuestCalculator />
        <Occasions />
        <HowItWorks />
        <Gallery />
        <Reviews />
        <Promise />
        <FAQ />
        <FinalCta />
      </main>
      <Footer />
      <MobileBar />
      <CartDrawer />
    </CartProvider>
  );
}
