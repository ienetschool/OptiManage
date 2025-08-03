import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { insertInvoiceSchema, type Product } from "@shared/schema";
import { 
  Menu, 
  X, 
  Bell, 
  MessageSquare, 
  Settings, 
  User, 
  LogOut, 
  Globe,
  Search,
  ChevronDown,
  ShoppingCart,
  Plus
} from "lucide-react";
import { Link, useLocation } from "wouter";
import LiveChat from "@/components/LiveChat";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [quickSaleOpen, setQuickSaleOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Simplified form schema for Quick Sale
  const quickSaleSchema = z.object({
    customerName: z.string().min(1, "Customer name is required"),
    productName: z.string().min(1, "Product name is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.number().min(0, "Unit price must be positive"),
    taxRate: z.number().min(0).max(100).default(10),
    discountAmount: z.number().min(0).default(0),
    paymentMethod: z.enum(["cash", "card", "check", "digital"]),
    notes: z.string().optional()
  });

  const quickSaleForm = useForm({
    resolver: zodResolver(quickSaleSchema),
    defaultValues: {
      customerName: "Walk-in Customer",
      productName: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 10,
      discountAmount: 0,
      paymentMethod: "cash" as const,
      notes: ""
    }
  });

  // Get stores for store selection
  const { data: stores = [] } = useQuery({
    queryKey: ["/api/stores"]
  });

  // Quick Sale mutation
  const quickSaleMutation = useMutation({
    mutationFn: async (data: any) => {
      const invoiceData = {
        ...data,
        storeId: stores[0]?.id || "default",
        customerId: "guest"
      };
      return await apiRequest("POST", "/api/invoices", invoiceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({
        title: "Success",
        description: "Quick sale invoice created successfully!",
      });
      setQuickSaleOpen(false);
      quickSaleForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create quick sale invoice.",
        variant: "destructive",
      });
    }
  });

  const onQuickSaleSubmit = (data: any) => {
    // Calculate totals
    const subtotal = data.quantity * data.unitPrice;
    const tax = subtotal * (data.taxRate / 100);
    const discount = data.discountAmount || 0;
    const total = subtotal + tax - discount;

    const invoiceData = {
      customerName: data.customerName,
      storeId: stores[0]?.id || "default-store",
      customerId: "guest",
      subtotal: subtotal.toFixed(2),
      taxRate: data.taxRate,
      taxAmount: tax.toFixed(2),
      discountAmount: discount.toFixed(2),
      total: total.toFixed(2),
      status: "pending",
      paymentMethod: data.paymentMethod,
      notes: data.notes || "",
      items: [{
        productName: data.productName,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        discount: 0,
        total: subtotal
      }]
    };

    quickSaleMutation.mutate(invoiceData);
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-50">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <Link href="/">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OP</span>
              </div>
              <span className="font-bold text-lg text-slate-900 hidden sm:block">OptiStore Pro</span>
            </div>
          </Link>
        </div>

        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search patients, appointments, products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchTerm.trim()) {
                  // Navigate to search results or relevant page based on search term
                  if (searchTerm.toLowerCase().includes('patient')) {
                    navigate('/patients');
                  } else if (searchTerm.toLowerCase().includes('appointment')) {
                    navigate('/appointments');
                  } else if (searchTerm.toLowerCase().includes('product') || searchTerm.toLowerCase().includes('inventory')) {
                    navigate('/inventory');
                  } else {
                    navigate('/dashboard');
                  }
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick Sale Button */}
          <Button 
            variant="default" 
            size="sm"
            onClick={() => setQuickSaleOpen(true)}
            className="bg-green-600 hover:bg-green-700 hidden sm:flex"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Quick Sale
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs p-0 flex items-center justify-center">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3 border-b">
                <h3 className="font-medium">Notifications</h3>
              </div>
              <div className="p-3 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bell className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New appointment scheduled</p>
                    <p className="text-xs text-slate-500">Sarah Johnson - 2:00 PM today</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Bell className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Low stock alert</p>
                    <p className="text-xs text-slate-500">Contact lens solution - 5 units left</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Bell className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Payment received</p>
                    <p className="text-xs text-slate-500">Invoice #INV-001 - $299.00</p>
                  </div>
                </div>
              </div>
              <div className="p-3 border-t">
                <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/notifications')}>
                  View All Notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Messages */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <MessageSquare className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-500 text-white text-xs p-0 flex items-center justify-center">
                  2
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3 border-b">
                <h3 className="font-medium">Messages</h3>
              </div>
              <div className="p-3 space-y-3">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/api/placeholder/32/32" />
                    <AvatarFallback>DR</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Dr. Rodriguez</p>
                    <p className="text-xs text-slate-500">Prescription ready for pickup</p>
                    <p className="text-xs text-slate-400">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/api/placeholder/32/32" />
                    <AvatarFallback>MJ</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Michael Johnson</p>
                    <p className="text-xs text-slate-500">Question about insurance coverage</p>
                    <p className="text-xs text-slate-400">1 hour ago</p>
                  </div>
                </div>
              </div>
              <div className="p-3 border-t">
                <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/communication')}>
                  View All Messages
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Website Management */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Globe className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Website</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/pages">Manage Pages</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/themes">Themes & Design</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/domains">Domain Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/seo">SEO & Analytics</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={(user as any)?.profileImageUrl} />
                  <AvatarFallback>
                    {(user as any)?.firstName?.[0]}{(user as any)?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">{(user as any)?.firstName} {(user as any)?.lastName}</p>
                  <p className="text-xs text-slate-500">{(user as any)?.email}</p>
                </div>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = "/api/logout"}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {children}
      </div>

      {/* Simple Footer for CRM */}
      <footer className="bg-white border-t border-slate-200 px-6 py-2">
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>© 2025 OptiStore Pro</span>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">v2.1.0</Badge>
            <Badge variant="outline" className="text-xs text-green-600">Online</Badge>
          </div>
        </div>
      </footer>

      {/* Quick Sale Modal */}

      
      {/* Live Chat for mobile */}
      <div className="block sm:hidden">
        <LiveChat />
      </div>

      {/* Quick Sale Dialog */}
      <Dialog open={quickSaleOpen} onOpenChange={setQuickSaleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quick Sale Invoice</DialogTitle>
            <DialogDescription>
              Create a quick invoice for immediate sale
            </DialogDescription>
          </DialogHeader>
          
          <Form {...quickSaleForm}>
            <form onSubmit={quickSaleForm.handleSubmit(onQuickSaleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={quickSaleForm.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter customer name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={quickSaleForm.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">💵 Cash</SelectItem>
                          <SelectItem value="card">💳 Card</SelectItem>
                          <SelectItem value="check">📄 Check</SelectItem>
                          <SelectItem value="digital">📱 Digital</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={quickSaleForm.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product/Service Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product or service name..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={quickSaleForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={quickSaleForm.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={quickSaleForm.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          min="0" 
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={quickSaleForm.control}
                  name="discountAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Amount ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-700 mb-2">Total Amount</label>
                  <div className="h-10 px-3 py-2 border border-slate-300 rounded-md bg-slate-50 flex items-center">
                    <span className="text-lg font-bold text-slate-900">
                      ${(() => {
                        const values = quickSaleForm.watch();
                        const subtotal = (values.quantity || 0) * (values.unitPrice || 0);
                        const tax = subtotal * ((values.taxRate || 0) / 100);
                        const discount = values.discountAmount || 0;
                        return (subtotal + tax - discount).toFixed(2);
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              <FormField
                control={quickSaleForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Additional notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setQuickSaleOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={quickSaleMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {quickSaleMutation.isPending ? "Creating..." : "Create Quick Sale Invoice"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}