import { getMenuItem } from "./menu";
import office from "@/assets/office.jpg";
import holiday from "@/assets/holiday.jpg";
import party from "@/assets/party.jpg";

export type PartyPackage = {
  id: string;
  name: string;
  guests: string;
  image: string;
  mostPopular: boolean;
  items: { id: string; quantity: number }[];
};

export const packages: PartyPackage[] = [
  {
    id: "office-lunch",
    name: "Office Lunch",
    guests: "10–15 guests",
    image: office,
    mostPopular: false,
    items: ["caesar-salad", "penne-vodka", "roasted-chicken", "garlic-bread", "cannoli"].map((id) => ({ id, quantity: 1 })),
  },
  {
    id: "holiday-party",
    name: "Holiday Party",
    guests: "25–30 guests",
    image: holiday,
    mostPopular: true,
    items: ["antipasto-platter", "bruschetta", "lasagna-bolognese", "skirt-steak", "mixed-vegetables", "bread-basket", "cheesecake"].map((id) => ({ id, quantity: 1 })),
  },
  {
    id: "corporate-celebration",
    name: "Corporate Celebration",
    guests: "40–50 guests",
    image: party,
    mostPopular: false,
    items: ["antipasto-platter", "baked-wings", "lasagna-bolognese", "penne-vodka", "short-ribs", "tilapia", "garden-salad", "baked-potatoes", "chocolate-cake", "fruit-platter"].map((id) => ({ id, quantity: 1 })),
  },
];

/** Total is always computed from menu prices — never hardcoded. */
export function packageTotal(p: PartyPackage): number {
  return p.items.reduce((sum, i) => sum + (getMenuItem(i.id)?.price ?? 0) * i.quantity, 0);
}
