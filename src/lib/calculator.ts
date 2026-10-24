import { site, type CategoryId } from "@/config/site";
import { categories, menu } from "@/data/menu";

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

/** Spread recommended trays across items in each category, popular items first. */
export function suggestedItems(rec: Recommendation): { id: string; quantity: number }[] {
  const result: { id: string; quantity: number }[] = [];
  for (const c of categories) {
    const items = menu
      .filter((m) => m.category === c.id)
      .sort((a, b) => Number(b.isPopular) - Number(a.isPopular))
      .slice(0, 3);
    const counts = new Map<string, number>();
    for (let i = 0; i < rec[c.id]; i++) {
      const it = items[i % items.length];
      if (!it) break;
      counts.set(it.id, (counts.get(it.id) ?? 0) + 1);
    }
    counts.forEach((quantity, id) => result.push({ id, quantity }));
  }
  return result;
}
