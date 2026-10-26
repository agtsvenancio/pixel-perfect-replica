// Central business configuration. Edit values here — components read from this file only.
export const site = {
  name: "Italian Bites Catering",
  tagline: "Authentic Italian catering for New York's best celebrations.",
  phone: "(917) 325-8744",
  phoneHref: "tel:+19173258744",
  email: "orders@italianbitescatering.com", // PLACEHOLDER — replace with the real email
  address: {
    street: "31-88 30th Street",
    city: "Astoria",
    region: "NY",
    postalCode: "11106",
    country: "US",
    full: "31-88 30th Street, Astoria, NY 11106",
    mapQuery: "31-88 30th St, Astoria, NY 11106",
  },
  hours: [
    { day: "Monday", open: "9:00 AM", close: "10:00 PM" },
    { day: "Tuesday", open: "9:00 AM", close: "10:00 PM" },
    { day: "Wednesday", open: "9:00 AM", close: "10:00 PM" },
    { day: "Thursday", open: "9:00 AM", close: "10:00 PM" },
    { day: "Friday", open: "9:00 AM", close: "10:00 PM" },
    { day: "Saturday", open: "9:00 AM", close: "10:00 PM" },
    { day: "Sunday", open: "9:00 AM", close: "10:00 PM" },
  ],
  hoursSummary: "Monday – Sunday · 9:00 AM – 10:00 PM",

  // PLACEHOLDERS — replace with real numbers
  yearsOfExperience: 15,
  eventsCatered: 2500,
  guestRange: "10 to 500+",

  minimumOrder: 150, // USD, PLACEHOLDER
  leadTimeDays: 2, // minimum days in advance, PLACEHOLDER
  responseHours: 24, // we contact customers within X hours, PLACEHOLDER

  portions: {
    halfTray: "8–10",
    fullTray: "18–20",
  },

  // Guests served by one tray, per category — used by the guest calculator
  servingsPerTray: {
    appetizers: 12,
    entrees: 10,
    pastas: 12,
    sides: 15,
    desserts: 15,
  },

  faqAnswers: {
    setup:
      "Yes — buffet setup, chafing dishes and serving utensils are available on request. Mention it in your order notes and we'll confirm options and pricing.", // EDITABLE
    payment:
      "You pay when you receive your food — on delivery or at pickup. Nothing is charged online when you place your order.", // EDITABLE
  },

  social: {
    instagram: "https://instagram.com/", // PLACEHOLDER
    facebook: "https://facebook.com/", // PLACEHOLDER
  },
} as const;

export type CategoryId = keyof typeof site.servingsPerTray;
