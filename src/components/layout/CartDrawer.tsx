import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { useCart, cartItemPrice, cartItemVariationLabel, cartItemKey } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartDrawer = ({ open, onOpenChange }: CartDrawerProps) => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, cartCount } = useCart();
  const { t, language } = useLanguage();

  const hasAllFreeShipping = cartItems.every(item => item.product.free_shipping === true);

  if (cartItems.length === 0) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              {t('cart.title')}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('cart.empty')}</h3>
              <p className="text-muted-foreground text-sm mb-6">{t('cart.empty_desc')}</p>
              <SheetClose asChild>
                <Button asChild className="bg-gradient-brand">
                  <Link to="/products">{t('cart.start_shopping')}</Link>
                </Button>
              </SheetClose>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-4 py-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              {t('cart.title')} ({cartCount})
            </span>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="py-4 space-y-4">
            {cartItems.map((item) => {
              const itemKey = cartItemKey(item);
              const itemPrice = cartItemPrice(item);
              const variationLabel = cartItemVariationLabel(item);
              const displayName = language === 'en' ? (item.product.name || item.product.name_bn) : item.product.name_bn;
              
              return (
                <div key={itemKey} className="flex gap-3">
                  <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {item.product.image_url ? (
                      <img 
                        src={item.product.image_url} 
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <SheetClose asChild>
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="font-medium text-sm text-foreground hover:text-primary line-clamp-2"
                      >
                        {displayName}
                      </Link>
                    </SheetClose>
                    {variationLabel && (
                      <p className="text-xs text-muted-foreground">{variationLabel}</p>
                    )}
                    <p className="text-primary font-bold mt-1">৳{itemPrice.toLocaleString()}</p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variation?.id, itemKey)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variation?.id, itemKey)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(item.product.id, item.variation?.id, itemKey)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="border-t px-4 py-4 space-y-4 bg-background">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('cart.subtotal')}</span>
              <span className="font-medium">৳{cartTotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('cart.delivery')}</span>
              <span className="font-medium">
                {hasAllFreeShipping ? (
                  <span className="text-green-600">{t('cart.free_delivery')}</span>
                ) : (
                  <span className="text-muted-foreground">{t('cart.at_checkout_short')}</span>
                )}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>{t('cart.total')}</span>
              <span className="text-primary">৳{cartTotal}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SheetClose asChild>
              <Button variant="outline" asChild>
                <Link to="/cart">{t('cart.view_cart')}</Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button asChild className="bg-gradient-brand hover:opacity-90">
                <Link to="/checkout">{t('cart.checkout')}</Link>
              </Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
