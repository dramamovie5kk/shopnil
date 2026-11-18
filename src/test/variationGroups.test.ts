import { describe, it, expect } from "vitest";
import {
  groupVariations,
  defaultSelection,
  selectionPrice,
  selectionLabel,
  selectionKey,
  isSelectionComplete,
  selectionStock,
} from "@/lib/variationGroups";
import { ProductVariation } from "@/types";

const v = (over: Partial<ProductVariation>): ProductVariation => ({
  id: over.id || Math.random().toString(36).slice(2),
  product_id: "p1",
  variation_type: "custom",
  variation_name: "অপশন",
  price: 0,
  stock: 0,
  sort_order: 0,
  is_default: false,
  image_url: null,
  created_at: "",
  ...over,
});

describe("groupVariations", () => {
  it("keeps legacy rows without group_name in a single group", () => {
    const groups = groupVariations([
      v({ id: "a", variation_type: "size", variation_name: "M" }),
      v({ id: "b", variation_type: "size", variation_name: "L" }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe("");
    expect(groups[0].type).toBe("size");
    expect(groups[0].options.map((o) => o.id)).toEqual(["a", "b"]);
  });

  it("splits rows into separate named groups preserving order", () => {
    const groups = groupVariations([
      v({ id: "c1", group_name: "কালার", variation_type: "color", variation_name: "লাল" }),
      v({ id: "s1", group_name: "সাইজ", variation_type: "size", variation_name: "M" }),
      v({ id: "c2", group_name: "কালার", variation_type: "color", variation_name: "নীল" }),
      v({ id: "s2", group_name: "সাইজ", variation_type: "size", variation_name: "L" }),
    ]);
    expect(groups.map((g) => g.key)).toEqual(["কালার", "সাইজ"]);
    expect(groups[0].options.map((o) => o.id)).toEqual(["c1", "c2"]);
    expect(groups[1].options.map((o) => o.id)).toEqual(["s1", "s2"]);
  });
});

describe("defaultSelection", () => {
  it("picks the is_default option of each group, else the first", () => {
    const groups = groupVariations([
      v({ id: "c1", group_name: "কালার" }),
      v({ id: "c2", group_name: "কালার", is_default: true }),
      v({ id: "s1", group_name: "সাইজ" }),
      v({ id: "s2", group_name: "সাইজ" }),
    ]);
    expect(defaultSelection(groups).map((o) => o.id)).toEqual(["c2", "s1"]);
  });
});

describe("selectionPrice", () => {
  it("sums the prices of the selected options", () => {
    const price = selectionPrice([v({ price: 1200 }), v({ price: 50 })], 999);
    expect(price).toBe(1250);
  });

  it("falls back to the base price when the sum is 0 or nothing is selected", () => {
    expect(selectionPrice([v({ price: 0 })], 999)).toBe(999);
    expect(selectionPrice([], 999)).toBe(999);
  });
});

describe("selectionLabel / selectionKey", () => {
  it("joins option names with a slash", () => {
    expect(selectionLabel([v({ variation_name: "লাল" }), v({ variation_name: "XL" })])).toBe("লাল / XL");
  });

  it("builds an order-independent identity key", () => {
    const a = v({ id: "a" });
    const b = v({ id: "b" });
    expect(selectionKey([a, b])).toBe(selectionKey([b, a]));
    expect(selectionKey([a])).not.toBe(selectionKey([a, b]));
  });
});

describe("isSelectionComplete", () => {
  it("requires one chosen option per group", () => {
    const groups = groupVariations([
      v({ id: "c1", group_name: "কালার" }),
      v({ id: "s1", group_name: "সাইজ" }),
    ]);
    expect(isSelectionComplete(groups, [])).toBe(false);
    expect(isSelectionComplete(groups, [v({ id: "c1" })])).toBe(false);
    expect(isSelectionComplete(groups, [v({ id: "c1" }), v({ id: "s1" })])).toBe(true);
  });

  it("is complete when there are no groups", () => {
    expect(isSelectionComplete([], [])).toBe(true);
  });
});

describe("selectionStock", () => {
  it("returns the lowest stock across selected options", () => {
    expect(selectionStock([v({ stock: 10 }), v({ stock: 3 })])).toBe(3);
    expect(selectionStock([])).toBeNull();
  });
});
