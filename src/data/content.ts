import holiday from "@/assets/holiday.webp";
import office from "@/assets/office.webp";
import family from "@/assets/family.webp";
import party from "@/assets/party.webp";
import hero from "@/assets/hero.webp";
import antipasto from "@/assets/antipasto.webp";
import lasagna from "@/assets/lasagna.webp";
import penne from "@/assets/penne.webp";
import cannoli from "@/assets/cannoli.webp";
import cheesecake from "@/assets/cheesecake.webp";
import steak from "@/assets/steak.webp";
import kitchen from "@/assets/kitchen.webp";
import spaghetti from "@/assets/spaghetti.webp";
import chocolate from "@/assets/chocolate.webp";

export const images = { hero, kitchen, finalCta: holiday };

export const eventTypes = [
  "Holiday Party",
  "Corporate Event",
  "Office Lunch/Meeting",
  "Family Gathering",
  "Birthday",
  "Graduation",
  "Other",
] as const;

export const occasions = [
  { title: "Holiday & Year-End Parties", line: "Make the season unforgettable with a true Italian feast.", image: holiday, eventType: "Holiday Party" },
  { title: "Corporate Events", line: "Impress clients and reward your team.", image: party, eventType: "Corporate Event" },
  { title: "Office Lunches & Meetings", line: "Keep meetings productive with food everyone loves.", image: office, eventType: "Office Lunch/Meeting" },
  { title: "Family Gatherings", line: "Sunday-dinner comfort for the whole family.", image: family, eventType: "Family Gathering" },
  { title: "Birthdays & Celebrations", line: "Party trays that feed a crowd.", image: hero, eventType: "Birthday" },
  { title: "Graduations & Private Events", line: "Celebrate big moments the Italian way.", image: party, eventType: "Graduation" },
];

export const gallery = [
  { src: hero, alt: "Italian catering buffet with trays of lasagna, penne and antipasto" },
  { src: lasagna, alt: "Slice of lasagna bolognese with stretching melted mozzarella" },
  { src: holiday, alt: "Festive holiday table with Italian dishes and candles" },
  { src: cannoli, alt: "Fresh cannoli filled with ricotta and chocolate chips" },
  { src: office, alt: "Office lunch spread of pasta, salad and chicken in a NYC conference room" },
  { src: antipasto, alt: "Antipasto board with cured meats, cheeses and olives" },
  { src: penne, alt: "Tray of penne in creamy vodka sauce with basil" },
  { src: party, alt: "Outdoor graduation buffet with chafing dishes" },
  { src: steak, alt: "Grilled skirt steak with seasoned peppers" },
  { src: cheesecake, alt: "Strawberry New York cheesecake" },
  { src: spaghetti, alt: "Spaghetti in tomato sauce with basil and parmesan" },
  { src: chocolate, alt: "Chocolate fudge cake with ganache" },
];
