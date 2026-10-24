import { describe, expect, it } from "vitest";
import { recommendTrays, suggestedItems } from "./calculator";
import { packageTotal, packages } from "@/data/packages";

describe("guest calculator", () => {
  it("rounds trays up per category using servings per tray", () => {
    const r = recommendTrays(25, { appetizers: 12, entrees: 10, pastas: 12, sides: 15, desserts: 15 });
    expect(r).toEqual({ appetizers: 3, entrees: 3, pastas: 3, sides: 2, desserts: 2 });
  });
  it("suggested items sum to recommended trays", () => {
    const r = recommendTrays(100);
    const total = Object.values(r).reduce((a, b) => a + b, 0);
    expect(suggestedItems(r).reduce((a, b) => a + b.quantity, 0)).toBe(total);
  });
});

describe("packages", () => {
  it("totals come from menu prices", () => {
    const byId = Object.fromEntries(packages.map((p) => [p.id, packageTotal(p)]));
    expect(byId["office-lunch"]).toBe(22 + 30 + 50 + 15 + 30);
    expect(byId["holiday-party"]).toBe(25 + 18 + 40 + 95 + 30 + 15 + 100);
  });
});
