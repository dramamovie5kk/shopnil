import { ProductVariation } from "@/types";

/**
 * Multi-group product variations.
 *
 * A product may have several variation groups (e.g. কালার + সাইজ). Each row in
 * product_variations carries an optional `group_name`; rows with a null/empty
 * group_name belong to the single legacy group so older products keep working.
 * The customer picks one option per group and the final price is the sum of the
 * selected option prices (falling back to the base price when the sum is 0).
 */

export interface VariationGroup {
  /** Stable key: the stored group_name, or "" for the legacy single group. */
  key: string;
  /** variation_type shared by the group's options (size/color/pack/custom). */
  type: string;
  /** Display label: stored group name when present, otherwise the type. */
  label: string;
  options: ProductVariation[];
}

/** Group a flat variation list into ordered groups, preserving sort order. */
export const groupVariations = (variations: ProductVariation[]): VariationGroup[] => {
  const groups: VariationGroup[] = [];
  const byKey = new Map<string, VariationGroup>();
  for (const v of variations) {
    const key = (v.group_name || "").trim();
    let group = byKey.get(key);
    if (!group) {
      group = { key, type: v.variation_type || "custom", label: key || v.variation_type || "custom", options: [] };
      byKey.set(key, group);
      groups.push(group);
    }
    group.options.push(v);
  }
  return groups;
};

/** Pick the default (or first) option of every group. */
export const defaultSelection = (groups: VariationGroup[]): ProductVariation[] =>
  groups
    .map((g) => g.options.find((o) => o.is_default) || g.options[0])
    .filter((o): o is ProductVariation => !!o);

/**
 * Final unit price for a selection: the sum of the selected option prices.
 * Falls back to the product's base price when nothing is selected or the
 * selected prices add up to 0 (e.g. options saved without a price).
 */
export const selectionPrice = (selected: ProductVariation[], basePrice: number): number => {
  const sum = selected.reduce((acc, v) => acc + (Number(v.price) || 0), 0);
  return sum > 0 ? sum : basePrice;
};

/** Combined human label, e.g. "লাল / XL". */
export const selectionLabel = (selected: ProductVariation[]): string =>
  selected.map((v) => v.variation_name).filter(Boolean).join(" / ");

/** Stable identity key for a selection (used for cart item matching). */
export const selectionKey = (selected: ProductVariation[]): string =>
  selected.map((v) => v.id).sort().join("+");

/** True when every group has exactly one chosen option. */
export const isSelectionComplete = (
  groups: VariationGroup[],
  selected: ProductVariation[]
): boolean => {
  if (groups.length === 0) return true;
  const ids = new Set(selected.map((v) => v.id));
  return groups.every((g) => g.options.some((o) => ids.has(o.id)));
};

/** Lowest available stock across the selected options (null when unknown). */
export const selectionStock = (selected: ProductVariation[]): number | null => {
  if (selected.length === 0) return null;
  const stocks = selected.map((v) => v.stock ?? 0);
  return Math.min(...stocks);
};
