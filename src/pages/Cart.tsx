import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart, cartItemPrice, cartItemVariationLabel, cartItemKey } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Cart = () => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { t, language } = useLanguage();

  const hasAllFreeShipping = cartItems.every(item => item.product.free_shipping === true);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 bg-secondary/30 pb-20 lg:pb-12">
          <div className="text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t('cart.empty')}</h1>
            <p className="text-muted-foreground mb-6">{t('cart.empty_desc')}</p>
            <Button asChild className="bg-gradient-brand">
              <Link to="/products">{t('cart.start_shopping')}</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 bg-secondary/30 pb-20 lg:pb-8">
        <div className="container">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">{t('cart.title')}</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const itemKey = cartItemKey(item);
                const itemPrice = cartItemPrice(item);
                const variationLabel = cartItemVariationLabel(item);
                const displayName = language === 'en' ? (item.product.name || item.product.name_bn) : item.product.name_bn;
                
                return (
                  <Card key={itemKey}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-secondary rounded-lg flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                          {item.product.image_url ? (
                            <img 
                              src={item.product.image_url} 
                              alt={displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            "📦"
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${item.product.slug}`}
                            className="font-medium text-foreground hover:text-primary line-clamp-2"
                          >
                            {displayName}
                          </Link>
                          {variationLabel && (
                            <p className="text-xs text-muted-foreground">{variationLabel}</p>
                          )}
                          <p className="text-lg font-bold text-primary mt-1">
                            ৳{itemPrice.toLocaleString()}
                          </p>

                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center border rounded-lg">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variation?.id, itemKey)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variation?.id, itemKey)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removeFromCart(item.product.id, item.variation?.id, itemKey)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="text-right hidden sm:block">
                          <p className="text-sm text-muted-foreground">{t('cart.subtotal')}</p>
                          <p className="text-lg font-bold text-primary">
                            ৳{(itemPrice * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <Button variant="outline" onClick={clearCart} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                {t('cart.clear')}
              </Button>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>{t('cart.order_summary')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                    <span className="font-medium">৳{cartTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.delivery_charge')}</span>
                    <span className="font-medium">
                      {hasAllFreeShipping ? (
                        <span className="text-green-600">{t('cart.free_delivery')}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">{t('cart.at_checkout')}</span>
                      )}
                    </span>
                  </div>
                  {hasAllFreeShipping && (
                    <p className="text-xs text-green-600">
                      {t('cart.free_delivery_all')}
                    </p>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t('cart.total')}</span>
                    <span className="text-primary">৳{cartTotal}{!hasAllFreeShipping && ` ${t('cart.plus_delivery')}`}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-gradient-brand hover:opacity-90 shadow-brand">
                    <Link to="/checkout">{t('cart.checkout')}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
