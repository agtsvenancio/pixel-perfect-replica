import type { CategoryId } from "@/config/site";
import antipasto from "@/assets/antipasto.webp";
import bruschetta from "@/assets/bruschetta.webp";
import wings from "@/assets/wings.webp";
import chicken from "@/assets/chicken.webp";
import steak from "@/assets/steak.webp";
import shortribs from "@/assets/shortribs.webp";
import penne from "@/assets/penne.webp";
import lasagna from "@/assets/lasagna.webp";
import spaghetti from "@/assets/spaghetti.webp";
import salad from "@/assets/salad.webp";
import vegetables from "@/assets/vegetables.webp";
import cheesecake from "@/assets/cheesecake.webp";
import chocolate from "@/assets/chocolate.webp";
import cannoli from "@/assets/cannoli.webp";

export type MenuSize = { label: string; price: number; servesApprox: number };

export type MenuItem = {
  id: string;
  category: CategoryId;
  name: string;
  description: string;
  price: number;
  sizeLabel: string;
  servesApprox: number;
  image?: string;
  isPopular: boolean;
  tagline?: string; // sensory line for signature dishes
  /** Optional extra sizes (e.g. Full Tray). When present, a size selector is shown. */
  sizes?: MenuSize[];
};

export const categories: { id: CategoryId; label: string }[] = [
  { id: "appetizers", label: "Appetizers" },
  { id: "entrees", label: "Entrees" },
  { id: "pastas", label: "Pastas & Salads" },
  { id: "sides", label: "Sides" },
  { id: "desserts", label: "Desserts" },
];

export const menu: MenuItem[] = [
  // APPETIZERS
  { id: "antipasto-platter", category: "appetizers", name: "Antipasto Platter", description: "Assorted Italian cheeses and cold cuts.", price: 25, sizeLabel: "Platter", servesApprox: 10, image: antipasto, isPopular: true, tagline: "Prosciutto, salami, aged cheeses, olives and roasted peppers — the perfect opening act." },
  { id: "bruschetta", category: "appetizers", name: "Bruschetta", description: "Classic fresh tomatoes and basil on a toasted garlic baguette.", price: 18, sizeLabel: "Half tray", servesApprox: 10, image: bruschetta, isPopular: false },
  { id: "garlic-bread", category: "appetizers", name: "Garlic Bread", description: "Homemade roasted garlic paste on toasted bread.", price: 15, sizeLabel: "Half tray", servesApprox: 10, image: bruschetta, isPopular: false },
  { id: "cheese-poppers", category: "appetizers", name: "Cheese Poppers", description: "Mozzarella cheese poppers served with herbed mayo.", price: 30, sizeLabel: "Half tray", servesApprox: 10, isPopular: false },
  { id: "baked-wings", category: "appetizers", name: "Salt & Pepper Baked Wings", description: "Freshly made, baked (never fried), served with ranch.", price: 30, sizeLabel: "Half tray", servesApprox: 10, image: wings, isPopular: false },

  // ENTREES
  { id: "roasted-chicken", category: "entrees", name: "Rosemary & Sage Roasted Chicken", description: "Golden, crispy-skinned chicken roasted with fresh rosemary, sage and garlic.", price: 50, sizeLabel: "Half tray", servesApprox: 10, image: chicken, isPopular: false },
  { id: "skirt-steak", category: "entrees", name: "Grilled Skirt Steak & Seasoned Peppers", description: "Char-grilled skirt steak, sliced and served over sweet seasoned peppers and onions.", price: 95, sizeLabel: "Half tray", servesApprox: 10, image: steak, isPopular: true, tagline: "Smoky, juicy, char-grilled steak over blistered sweet peppers." },
  { id: "tilapia", category: "entrees", name: "Parmesan Crusted Baked Tilapia", description: "Flaky tilapia baked under a golden parmesan and herb crust, finished with lemon.", price: 45, sizeLabel: "Half tray", servesApprox: 10, isPopular: false },
  { id: "short-ribs", category: "entrees", name: "BBQ Slow-Cooked Short Ribs", description: "Fall-off-the-bone short ribs, slow-cooked for hours in a sticky BBQ glaze.", price: 50, sizeLabel: "Half tray", servesApprox: 10, image: shortribs, isPopular: false, tagline: "Slow-cooked for hours until they fall right off the bone." },

  // PASTAS & SALADS
  { id: "penne-vodka", category: "pastas", name: "Penne in Creamy Vodka Sauce", description: "Penne tossed in a silky tomato-cream vodka sauce with parmesan and basil.", price: 30, sizeLabel: "Half tray", servesApprox: 10, image: penne, isPopular: true, tagline: "Silky tomato-cream sauce, fresh basil and a snow of parmesan." },
  { id: "pasta-primavera", category: "pastas", name: "Pasta Primavera", description: "Pasta with seasonal vegetables, garlic, olive oil and parmesan. Vegetarian.", price: 32, sizeLabel: "Half tray", servesApprox: 10, isPopular: false },
  { id: "lasagna-bolognese", category: "pastas", name: "Lasagna Bolognese", description: "Layers of slow-simmered meat sauce, ricotta and bubbling mozzarella.", price: 40, sizeLabel: "Half tray", servesApprox: 10, image: lasagna, isPopular: true, tagline: "Layers of slow-simmered meat sauce, ricotta and bubbling mozzarella." },
  { id: "cheese-lasagna", category: "pastas", name: "All Cheese Lasagna", description: "Ricotta, mozzarella and parmesan layered with tomato sauce. Vegetarian.", price: 40, sizeLabel: "Half tray", servesApprox: 10, image: lasagna, isPopular: false },
  { id: "spaghetti-tomato", category: "pastas", name: "Classic Italian Spaghetti & Tomato Sauce", description: "Spaghetti in our bright, slow-cooked tomato and basil sauce.", price: 30, sizeLabel: "Half tray", servesApprox: 10, image: spaghetti, isPopular: false },
  { id: "caesar-salad", category: "pastas", name: "Caesar Salad with Homemade Dressing", description: "Crisp romaine, parmesan and golden croutons with our homemade Caesar dressing.", price: 22, sizeLabel: "Bowl", servesApprox: 10, image: salad, isPopular: false },
  { id: "garden-salad", category: "pastas", name: "Green Garden Salad", description: "Choice of homemade Italian dressing or balsamic.", price: 25, sizeLabel: "Bowl", servesApprox: 10, isPopular: false },

  // SIDES
  { id: "baked-potatoes", category: "sides", name: "Baked Seasoned Potatoes", description: "Golden roasted potatoes with herbs, garlic and olive oil.", price: 25, sizeLabel: "Half tray", servesApprox: 10, image: vegetables, isPopular: false },
  { id: "mixed-vegetables", category: "sides", name: "Roasted Mixed Vegetables", description: "Caramelized seasonal vegetables roasted with olive oil and herbs.", price: 30, sizeLabel: "Half tray", servesApprox: 10, image: vegetables, isPopular: false },
  { id: "green-beans", category: "sides", name: "Crispy Baked Green Beans", description: "Tender-crisp green beans baked with garlic and parmesan.", price: 30, sizeLabel: "Half tray", servesApprox: 10, isPopular: false },
  { id: "herbed-rice", category: "sides", name: "Herbed Rice", description: "Fluffy rice with butter, parsley and fresh herbs.", price: 20, sizeLabel: "Half tray", servesApprox: 10, isPopular: false },
  { id: "bread-basket", category: "sides", name: "Bread Basket", description: "Fresh-baked Italian bread, sliced and ready for the table.", price: 15, sizeLabel: "Basket", servesApprox: 10, isPopular: false },

  // DESSERTS
  { id: "cheesecake", category: "desserts", name: "Strawberry New York Cheesecake", description: "Creamy New York cheesecake crowned with glossy strawberries.", price: 100, sizeLabel: "Whole cake", servesApprox: 16, image: cheesecake, isPopular: false },
  { id: "chocolate-cake", category: "desserts", name: "Chocolate Fudge Cake", description: "Rich, moist chocolate layers with a thick fudge ganache.", price: 120, sizeLabel: "Whole cake", servesApprox: 16, image: chocolate, isPopular: false },
  { id: "cannoli", category: "desserts", name: "Fresh Crispy Cannoli", description: "Crisp shells filled to order with sweet ricotta and chocolate chips.", price: 30, sizeLabel: "Tray", servesApprox: 10, image: cannoli, isPopular: true, tagline: "Shatter-crisp shells, sweet ricotta cream, filled fresh." },
  { id: "fruit-platter", category: "desserts", name: "Fresh Fruit Platter", description: "A colorful platter of fresh seasonal fruit.", price: 30, sizeLabel: "Platter", servesApprox: 10, isPopular: false },
];

export const signatureDishIds = ["lasagna-bolognese", "penne-vodka", "skirt-steak", "short-ribs", "antipasto-platter", "cannoli"];

export const getMenuItem = (id: string) => menu.find((m) => m.id === id);
