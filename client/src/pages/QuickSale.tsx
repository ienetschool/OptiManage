import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  ShoppingCart,
  Calculator,
  CreditCard,
  Banknote,
  X
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function QuickSale({ onClose }: { onClose?: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [taxRate, setTaxRate] = useState(10);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    }
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("Failed to fetch customers");
      return response.json();
    }
  });

  const processSaleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      return await apiRequest("POST", "/api/sales", saleData);
    },
    onSuccess: () => {
      toast({
        title: "Sale Completed",
        description: "Sale has been processed successfully.",
      });
      setCart([]);
      setSelectedCustomer("");
      setDiscountValue(0);
      if (onClose) onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
    },
    onError: () => {
      toast({
        title: "Sale Failed",
        description: "Failed to process sale. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        toast({
          title: "Insufficient Stock",
          description: `Only ${product.stock} items available.`,
          variant: "destructive",
        });
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === "percentage") {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  };

  const calculateTax = () => {
    const subtotalAfterDiscount = calculateSubtotal() - calculateDiscount();
    return (subtotalAfterDiscount * taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  };

  const handleProcessSale = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before processing sale.",
        variant: "destructive",
      });
      return;
    }

    const saleData = {
      customerId: selectedCustomer || null,
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity
      })),
      subtotal: calculateSubtotal(),
      discountAmount: calculateDiscount(),
      taxAmount: calculateTax(),
      total: calculateTotal(),
      paymentMethod,
      paymentStatus: "completed"
    };

    processSaleMutation.mutate(saleData);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Product Selection */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Product Selection
          </CardTitle>
          <CardDescription>Search and add products to cart</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 border rounded-md hover:bg-slate-50 cursor-pointer"
                onClick={() => addToCart(product)}
              >
                <div>
                  <h4 className="font-medium">{product.name}</h4>
                  <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <span>{product.category}</span>
                    <Badge variant="outline">Stock: {product.stock}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${product.price.toFixed(2)}</p>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cart and Checkout */}
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
            </CardTitle>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label>Customer (Optional)</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Select customer or leave blank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Walk-in Customer</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.firstName} {customer.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cart Items */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Cart is empty</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-xs text-slate-500">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Discount */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select value={discountType} onValueChange={setDiscountType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Discount Value</Label>
              <Input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">
                  <div className="flex items-center">
                    <Banknote className="h-4 w-4 mr-2" />
                    Cash
                  </div>
                </SelectItem>
                <SelectItem value="card">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Card
                  </div>
                </SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="digital">Digital Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Total Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Discount:</span>
              <span>-${calculateDiscount().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax ({taxRate}%):</span>
              <span>${calculateTax().toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Process Sale Button */}
          <Button
            onClick={handleProcessSale}
            disabled={cart.length === 0 || processSaleMutation.isPending}
            className="w-full"
            size="lg"
          >
            <Calculator className="h-4 w-4 mr-2" />
            {processSaleMutation.isPending ? "Processing..." : "Process Sale"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}