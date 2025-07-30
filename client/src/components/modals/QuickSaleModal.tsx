import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface QuickSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function QuickSaleModal({ open, onOpenChange }: QuickSaleModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: open,
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => 
    sum + (parseFloat(item.product.price) * item.quantity), 0
  );
  const taxRate = 0.085; // 8.5%
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const createSaleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      await apiRequest("POST", "/api/sales", saleData);
    },
    onSuccess: () => {
      toast({
        title: "Sale completed",
        description: "The sale has been processed successfully.",
      });
      setCart([]);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process sale. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProcessPayment = () => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Please add items to cart before processing payment.",
        variant: "destructive",
      });
      return;
    }

    // For demo purposes, we'll use the first store ID from the query
    // In a real app, this would come from user selection or current store context
    const saleData = {
      storeId: "store-1", // This should be dynamic
      customerId: null, // Quick sale without customer
      subtotal: subtotal.toFixed(2),
      taxAmount: tax.toFixed(2),
      total: total.toFixed(2),
      paymentMethod: "card", // Default to card
      paymentStatus: "completed",
      items: cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: (parseFloat(item.product.price) * item.quantity).toFixed(2),
      })),
    };

    createSaleMutation.mutate(saleData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Sale - Point of Sale</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Search & Selection */}
          <div>
            <div className="mb-4">
              <Label htmlFor="search">Search Products</Label>
              <div className="relative mt-2">
                <Input
                  id="search"
                  placeholder="Search by name, SKU, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-600">
                      SKU: {product.sku} | ${product.price}
                    </p>
                  </div>
                  <Button
                    onClick={() => addToCart(product)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add
                  </Button>
                </div>
              ))}
              
              {filteredProducts.length === 0 && searchTerm && (
                <div className="text-center py-8 text-slate-500">
                  No products found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>

          {/* Cart & Checkout */}
          <div>
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Shopping Cart</h4>
            
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{item.product.name}</p>
                    <p className="text-sm text-slate-600">
                      Qty: {item.quantity} × ${item.product.price}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {cart.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  Cart is empty
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <>
                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (8.5%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-slate-200 pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mt-6 space-y-3">
                  <Button
                    onClick={handleProcessPayment}
                    disabled={createSaleMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {createSaleMutation.isPending ? "Processing..." : "Process Payment"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setCart([])}
                  >
                    Clear Cart
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
