import { describe, expect, it } from "vitest";
import { recommendTrays } from "./calculator";

describe("guest calculator", () => {
  it("rounds trays up per category using servings per tray", () => {
    const r = recommendTrays(25, {
      appetizers: 12,
      entrees: 10,
      pastas: 12,
      sides: 15,
      desserts: 15,
    });
    expect(r).toEqual({ appetizers: 3, entrees: 3, pastas: 3, sides: 2, desserts: 2 });
  });
  it("recommends nothing for zero guests", () => {
    expect(Object.values(recommendTrays(0)).every((n) => n === 0)).toBe(true);
  });
});
