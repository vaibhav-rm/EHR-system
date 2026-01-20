'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MEDICINE_CATALOG, Medicine } from '@/lib/store-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type CartItem = Medicine & { quantity: number };

export default function MedicineStore() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const addToCart = (medicine: Medicine) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === medicine.id);
      if (existing) {
        return prev.map((item) =>
          item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...medicine, quantity: 1 }];
    });
    toast.success(`Added ${medicine.name} to cart`);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    toast.success('Order placed successfully! In a real app, this would process payment.');
    setCart([]);
    setIsSheetOpen(false);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pharmacy Store</h1>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 h-auto min-w-[1.25rem] flex justify-center bg-primary text-white">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Your Cart</SheetTitle>
            </SheetHeader>
            <div className="mt-8 space-y-4 flex-1 overflow-y-auto max-h-[70vh]">
              {cart.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Your cart is empty.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                    <div className="relative h-16 w-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                         {/* Placeholder image logic if external images behave badly */}
                         <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <div className="text-xs text-muted-foreground">
                        ${item.price.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                         <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, -1)}>
                            <Minus className="h-3 w-3" />
                         </Button>
                         <span className="text-xs w-4 text-center">{item.quantity}</span>
                         <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, 1)}>
                            <Plus className="h-3 w-3" />
                         </Button>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
                <SheetFooter className="mt-auto border-t pt-4 sm:justify-center flex-col gap-4">
                    <div className="flex justify-between w-full font-bold text-lg">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <Button className="w-full" onClick={handleCheckout}>Checkout</Button>
                </SheetFooter>
            )}
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {MEDICINE_CATALOG.map((med) => (
          <Card key={med.id} className="overflow-hidden flex flex-col">
            <div className="relative h-48 w-full bg-gray-100">
               <Image src={med.image} alt={med.name} fill className="object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <CardHeader className="p-4 pb-0">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant="secondary" className="mb-2 text-xs">{med.category}</Badge>
                        <CardTitle className="text-lg">{med.name}</CardTitle>
                    </div>
                    <span className="font-bold text-primary">${med.price.toFixed(2)}</span>
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-1">
              <CardDescription className="line-clamp-2">
                {med.description}
              </CardDescription>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button className="w-full" onClick={() => addToCart(med)}>
                <Plus className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
