import { cn } from "@/lib/utils";
import { ProductVariation } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { groupVariations, selectionPrice, selectionStock } from "@/lib/variationGroups";

interface VariationSelectorProps {
  variations: ProductVariation[];
  variationType: string;
  /** Currently selected options (one per group). */
  selected: ProductVariation[];
  onSelect: (selected: ProductVariation[]) => void;
  /** Base product price, used when option prices add up to 0. */
  basePrice?: number;
}

const VariationSelector = ({
  variations,
  variationType,
  selected,
  onSelect,
  basePrice = 0,
}: VariationSelectorProps) => {
  const { t } = useLanguage();

  const VARIATION_TYPE_LABELS: Record<string, string> = {
    size: t('card.select_size'),
    color: t('card.select_color'),
    pack: t('card.select_pack'),
    custom: t('card.select_option'),
  };

  if (variations.length === 0) return null;

  const groups = groupVariations(variations);
  const selectedIds = new Set(selected.map((v) => v.id));

  const handleSelect = (groupKey: string, option: ProductVariation) => {
    const group = groups.find((g) => g.key === groupKey);
    if (!group) return;
    const groupOptionIds = new Set(group.options.map((o) => o.id));
    const rest = selected.filter((v) => !groupOptionIds.has(v.id));
    onSelect([...rest, option]);
  };

  const totalPrice = selectionPrice(selected, basePrice);
  const stock = selectionStock(selected);

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div key={group.key || "legacy"} className="space-y-2">
          <p className="text-base md:text-lg font-semibold text-foreground" style={{ fontSize: '17px' }}>
            {group.key || VARIATION_TYPE_LABELS[group.type] || VARIATION_TYPE_LABELS[variationType] || t('card.select_option')}:
          </p>
          <div className="flex flex-wrap gap-2">
            {group.options.map((variation) => {
              const isSelected = selectedIds.has(variation.id);
              return (
                <button
                  key={variation.id}
                  type="button"
                  onClick={() => handleSelect(group.key, variation)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/50 border-border text-foreground hover:bg-secondary hover:border-primary/50"
                  )}
                >
                  {variation.variation_name}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selected Variation Price & Stock */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 text-sm mt-2 p-2 bg-secondary/30 rounded-md">
          <span className="font-semibold text-primary">
            ৳{totalPrice.toLocaleString()}
          </span>
          {stock !== null && (
            <span className="text-muted-foreground">
              {t('product.stock')}: {stock}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default VariationSelector;
