import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/integrations/cloudflare/client";
import { useAuth } from "./AuthContext";
import { Product, ProductVariation } from "@/types";
import { selectionKey, selectionPrice, selectionLabel } from "@/lib/variationGroups";
import { toast } from "sonner";

export interface LocalCartItem {
  product: Product;
  quantity: number;
  /** Legacy single variation (older carts). */
  variation?: ProductVariation;
  /** Multi-group selection: one option per variation group. */
  variations?: ProductVariation[];
}

/** Unit price of a cart item: summed option prices, else legacy variation price, else product price. */
export const cartItemPrice = (item: LocalCartItem): number => {
  if (item.variations && item.variations.length > 0) {
    return selectionPrice(item.variations, item.product.price);
  }
  return item.variation?.price ?? item.product.price;
};

/** Display label of the chosen options, e.g. "লাল / XL". */
export const cartItemVariationLabel = (item: LocalCartItem): string | null => {
  if (item.variations && item.variations.length > 0) return selectionLabel(item.variations);
  return item.variation?.variation_name || null;
};

/** Stable identity key of a cart item (product + chosen options). */
export const cartItemKey = (item: LocalCartItem): string => {
  if (item.variations && item.variations.length > 0) {
    return `${item.product.id}-${selectionKey(item.variations)}`;
  }
  return item.variation ? `${item.product.id}-${item.variation.id}` : item.product.id;
};

const sameSelection = (a: LocalCartItem, productId: string, variation?: ProductVariation, variations?: ProductVariation[]) => {
  if (a.product.id !== productId) return false;
  if (variations && variations.length > 0) {
    return !!a.variations && selectionKey(a.variations) === selectionKey(variations);
  }
  if (variation) {
    return !a.variations?.length && a.variation?.id === variation.id;
  }
  return !a.variation && !a.variations?.length;
};

interface CartContextType {
  cartItems: LocalCartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, quantity?: number, variation?: ProductVariation, skipDrawer?: boolean, variations?: ProductVariation[]) => void;
  removeFromCart: (productId: string, variationId?: string, itemKey?: string) => void;
  updateQuantity: (productId: string, quantity: number, variationId?: string, itemKey?: string) => void;
  clearCart: () => void;
  loading: boolean;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<LocalCartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load cart from localStorage or database
  useEffect(() => {
    if (user) {
      loadCartFromDB();
    } else {
      loadCartFromLocal();
    }
  }, [user]);

  const loadCartFromLocal = () => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      setCartItems(JSON.parse(saved));
    }
  };

  const saveCartToLocal = (items: LocalCartItem[]) => {
    localStorage.setItem("cart", JSON.stringify(items));
  };

  const loadCartFromDB = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await api
      .from("cart_items")
      .select("*, products(*)")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error loading cart:", error);
    } else if (data) {
      const ids = data.map(item => item.product_id);
      const { data: variations = [] } = await api.from("product_variations").select("*").in("product_id", ids);
      const items: LocalCartItem[] = data.map((item: any) => {
        const selected = (item.variation_ids || []).map((id: string) => variations.find(v => v.id === id)).filter(Boolean);
        return { product: item.products, quantity: item.quantity, variations: selected, variation: selected[0] };
      });
      setCartItems(items);
    }
    setLoading(false);
  };

  const syncToDatabase = async (items: LocalCartItem[]) => {
    if (!user) return;

    const { error } = await api.rpc("sync_cart", {
      items: items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        variation_ids: (item.variations || (item.variation ? [item.variation] : [])).map(v => v.id),
      })),
    });
    if (error) console.error("Cart synchronization failed");
  };

  const addToCart = (product: Product, quantity = 1, variation?: ProductVariation, skipDrawer = false, variations?: ProductVariation[]) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => sameSelection(item, product.id, variation, variations));
      let newItems: LocalCartItem[];
      
      if (existing) {
        newItems = prev.map((item) =>
          sameSelection(item, product.id, variation, variations)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...prev, { product, quantity, variation, variations }];
      }

      if (user) {
        syncToDatabase(newItems);
      } else {
        saveCartToLocal(newItems);
      }

      if (!skipDrawer) {
        const lang = localStorage.getItem('language') || 'bn';
        toast.success(lang === 'en' ? 'Added to cart!' : 'কার্টে যোগ হয়েছে!');
        // Auto-open cart drawer only if not skipping
        setIsDrawerOpen(true);
      }
      return newItems;
    });
  };

  const removeFromCart = (productId: string, variationId?: string, itemKey?: string) => {
    setCartItems((prev) => {
      const newItems = prev.filter((item) => {
        if (itemKey) return cartItemKey(item) !== itemKey;
        return !(item.product.id === productId && 
          (variationId ? item.variation?.id === variationId : !item.variation && !item.variations?.length));
      });
      
      if (user) {
        syncToDatabase(newItems);
      } else {
        saveCartToLocal(newItems);
      }

      return newItems;
    });
  };

  const updateQuantity = (productId: string, quantity: number, variationId?: string, itemKey?: string) => {
    if (quantity < 1) {
      removeFromCart(productId, variationId, itemKey);
      return;
    }

    setCartItems((prev) => {
      const newItems = prev.map((item) => {
        if (itemKey) {
          return cartItemKey(item) === itemKey ? { ...item, quantity } : item;
        }
        return item.product.id === productId && 
          (variationId ? item.variation?.id === variationId : !item.variation && !item.variations?.length)
          ? { ...item, quantity } 
          : item;
      });

      if (user) {
        syncToDatabase(newItems);
      } else {
        saveCartToLocal(newItems);
      }

      return newItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    if (user) {
      api.from("cart_items").delete().eq("user_id", user.id);
    } else {
      localStorage.removeItem("cart");
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (acc, item) => acc + cartItemPrice(item) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        loading,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
