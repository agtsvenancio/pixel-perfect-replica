import { site, type CategoryId } from "@/config/site";
import { categories } from "@/data/menu";

export type Recommendation = Record<CategoryId, number>;

export function recommendTrays(
  guests: number,
  servings: Record<CategoryId, number> = site.servingsPerTray,
): Recommendation {
  const g = Math.max(0, Math.floor(guests));
  const out = {} as Recommendation;
  for (const c of categories) out[c.id] = g > 0 ? Math.ceil(g / servings[c.id]) : 0;
  return out;
}
