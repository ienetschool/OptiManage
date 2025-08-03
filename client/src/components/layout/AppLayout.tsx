import { useState, useEffect } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
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
  Plus,
  Check
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

  // Quick Sale form schema matching invoice schema
  const quickSaleSchema = z.object({
    customerId: z.string().min(1, "Customer is required"),
    storeId: z.string().min(1, "Store is required"),
    taxRate: z.coerce.number().min(0).max(100),
    discountAmount: z.coerce.number().min(0),
    paymentMethod: z.string().optional(),
    notes: z.string().optional(),
  });

  const quickSaleItemSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    productName: z.string().optional(),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.coerce.number().min(0, "Price must be positive"),
    discount: z.coerce.number().min(0).max(100),
  });

  // Get data for dropdowns first (typed)
  const { data: stores = [] } = useQuery<any[]>({
    queryKey: ["/api/stores"]
  });
  
  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ["/api/customers"]
  });
  
  const { data: patients = [] } = useQuery<any[]>({
    queryKey: ["/api/patients"]
  });
  
  const { data: products = [] } = useQuery<any[]>({
    queryKey: ["/api/products"]
  });

  // Combine customers and patients for dropdown with proper filtering
  const allCustomers = [
    ...customers.filter((c: any) => c && c.name).map((c: any) => ({ 
      ...c, 
      type: 'customer',
      displayName: c.name,
      subtitle: c.email || c.phone || 'Customer'
    })),
    ...patients.filter((p: any) => p && (p.name || (p.firstName && p.lastName))).map((p: any) => ({ 
      ...p, 
      type: 'patient',
      displayName: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
      subtitle: p.email || p.phone || 'Patient'
    }))
  ];

  const quickSaleForm = useForm({
    resolver: zodResolver(quickSaleSchema),
    defaultValues: {
      customerId: "",
      storeId: "",
      taxRate: 8.5,
      discountAmount: 0,
      notes: "",
      paymentMethod: "cash"
    }
  });

  // Auto-select first available customer and store when dialog opens
  useEffect(() => {
    if (quickSaleOpen && stores.length > 0 && !quickSaleForm.getValues("storeId")) {
      quickSaleForm.setValue("storeId", stores[0].id);
    }
    if (quickSaleOpen && allCustomers.length > 0 && !quickSaleForm.getValues("customerId")) {
      quickSaleForm.setValue("customerId", allCustomers[0].id);
    }
  }, [quickSaleOpen, stores, allCustomers]);

  const quickSaleItemForm = useForm({
    resolver: zodResolver(quickSaleItemSchema),
    defaultValues: {
      productId: "",
      productName: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
    },
  });

  // State for invoice items and search
  const [quickSaleItems, setQuickSaleItems] = useState<any[]>([]);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");

  // Calculate totals
  const subtotal = quickSaleItems.reduce((sum, item) => sum + parseFloat(item.total.toString()), 0);
  const discountAmount = parseFloat(quickSaleForm.watch("discountAmount")?.toString() || "0");
  const taxRate = parseFloat(quickSaleForm.watch("taxRate")?.toString() || "0");
  const discountedSubtotal = subtotal - discountAmount;
  const taxAmount = (discountedSubtotal * taxRate) / 100;
  const grandTotal = discountedSubtotal + taxAmount;

  // Quick Sale mutation
  const quickSaleMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/invoices", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({
        title: "Success",
        description: "Quick sale invoice created successfully!",
      });
      setQuickSaleOpen(false);
      setQuickSaleItems([]);
      quickSaleForm.reset({
        customerId: "",
        storeId: "",
        taxRate: 8.5,
        discountAmount: 0,
        notes: "",
        paymentMethod: "cash"
      });
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
    if (quickSaleItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the invoice.",
        variant: "destructive",
      });
      return;
    }

    // Ensure we have a valid customer ID - use the first available customer if none selected
    let customerId = data.customerId;
    if (!customerId && customers.length > 0) {
      customerId = customers[0].id;
    } else if (!customerId && patients.length > 0) {
      customerId = patients[0].id;
    } else if (!customerId) {
      toast({
        title: "Error",
        description: "Please select a customer or add customers to the system.",
        variant: "destructive",
      });
      return;
    }

    const invoiceData = {
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      status: "paid", // Quick sale is immediately paid
      items: quickSaleItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      total: parseFloat(grandTotal.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      taxRate: data.taxRate || 8.5,
      customerId: customerId,
      storeId: data.storeId || stores[0]?.id,
      dueDate: new Date().toISOString(), // Quick sale due immediately
      notes: data.notes || "",
      paymentMethod: "cash" // Default for quick sale
    };

    quickSaleMutation.mutate(invoiceData);
  };

  // Add item to quick sale
  const addQuickSaleItem = (data: any) => {
    let productName = "";
    
    if (data.productId === "custom") {
      if (!data.productName || !data.productName.trim()) {
        toast({
          title: "Error",
          description: "Please enter a custom product name.",
          variant: "destructive",
        });
        return;
      }
      productName = data.productName.trim();
    } else {
      const product = products.find((p: any) => p.id === data.productId);
      if (!product) {
        toast({
          title: "Error",
          description: "Selected product not found.",
          variant: "destructive",
        });
        return;
      }
      productName = product.name;
    }

    const unitPrice = parseFloat(data.unitPrice.toString());
    const quantity = parseInt(data.quantity.toString());
    const discount = parseFloat(data.discount.toString());
    
    const discountAmount = (unitPrice * discount) / 100;
    const discountedPrice = unitPrice - discountAmount;
    const total = discountedPrice * quantity;

    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId: data.productId,
      productName: productName,
      quantity: quantity,
      unitPrice: parseFloat(unitPrice.toFixed(2)),
      discount: discount,
      total: parseFloat(total.toFixed(2)),
    };

    setQuickSaleItems([...quickSaleItems, newItem]);
    quickSaleItemForm.reset({ 
      productId: "",
      productName: "",
      quantity: 1, 
      discount: 0, 
      unitPrice: 0 
    });
  };

  // Remove item from quick sale
  const removeQuickSaleItem = (itemId: string) => {
    setQuickSaleItems(quickSaleItems.filter(item => item.id !== itemId));
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

          {/* Website Link */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open('/', '_blank')} 
            title="Visit Frontend Website"
            className="hidden sm:flex items-center space-x-2"
          >
            <Globe className="h-4 w-4" />
            <span>Visit Website</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.open('/', '_blank')} 
            title="Visit Frontend Website"
            className="sm:hidden"
          >
            <Globe className="h-5 w-5" />
          </Button>

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
              <DropdownMenuItem onClick={() => {
                window.location.href = '/api/logout';
              }}>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Create a quick invoice for immediate sale
            </DialogDescription>
          </DialogHeader>
          
          <Form {...quickSaleForm}>
            <form onSubmit={quickSaleForm.handleSubmit(onQuickSaleSubmit)} className="space-y-6">
              {/* Invoice Header - matching /invoices layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={quickSaleForm.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="walk-in" className="py-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-sm font-medium">W</span>
                              </div>
                              <div>
                                <div className="font-medium">Walk-in Customer</div>
                                <div className="text-xs text-slate-500">Cash customer</div>
                              </div>
                            </div>
                          </SelectItem>
                          
                          {customers.length > 0 && (
                            <>
                              <div className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border-t border-b">
                                CUSTOMERS ({customers.length})
                              </div>
                              {customers.map((customer: any) => (
                                <SelectItem key={customer.id} value={customer.id} className="py-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                      <span className="text-green-600 text-sm font-medium">
                                        {customer.firstName?.charAt(0).toUpperCase() || 'C'}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                                      <div className="text-xs text-slate-500">
                                        {customer.email || customer.phone || 'Customer'}
                                      </div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </>
                          )}
                          
                          {patients.length > 0 && (
                            <>
                              <div className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border-t border-b">
                                PATIENTS ({patients.length})
                              </div>
                              {patients.map((patient: any) => (
                                <SelectItem key={patient.id} value={patient.id} className="py-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                      <span className="text-purple-600 text-sm font-medium">
                                        {patient.firstName?.charAt(0).toUpperCase() || 'P'}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                                      <div className="text-xs text-slate-500">
                                        {patient.email || patient.phone || 'Patient'}
                                      </div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={quickSaleForm.control}
                  name="storeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select store" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stores.map((store: any) => (
                            <SelectItem key={store.id} value={store.id}>
                              {store.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Due Date</FormLabel>
                  <Input 
                    type="date" 
                    value={new Date().toISOString().split('T')[0]}
                    disabled
                    className="bg-slate-50"
                  />
                </div>
              </div>

              {/* Add Items Section - matching /invoices layout */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Invoice Items</h3>
                
                <Form {...quickSaleItemForm}>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                    <FormField
                      control={quickSaleItemForm.control}
                      name="productId"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Product</FormLabel>
                          <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={productSearchOpen}
                                  className="w-full justify-between"
                                >
                                  {field.value === "custom" 
                                    ? "Custom Item"
                                    : field.value
                                    ? products.find((product: any) => product.id === field.value)?.name || "Select product"
                                    : "Select product"}
                                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput 
                                  placeholder="Search products..." 
                                  value={productSearchTerm}
                                  onValueChange={setProductSearchTerm}
                                />
                                <CommandEmpty>No product found.</CommandEmpty>
                                <CommandGroup className="max-h-48 overflow-y-auto">
                                  <CommandItem
                                    value="custom"
                                    onSelect={() => {
                                      field.onChange("custom");
                                      quickSaleItemForm.setValue("unitPrice", 0);
                                      setProductSearchOpen(false);
                                      setProductSearchTerm("");
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        field.value === "custom" ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                        <span className="text-orange-600 text-sm font-medium">✏</span>
                                      </div>
                                      <div>
                                        <div className="font-medium">Custom Item</div>
                                        <div className="text-xs text-slate-500">Enter custom product details</div>
                                      </div>
                                    </div>
                                  </CommandItem>
                                  
                                  {products.length > 0 && (
                                    <div className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border-t border-b">
                                      AVAILABLE PRODUCTS ({products.length})
                                    </div>
                                  )}
                                  
                                  {products
                                    .filter((product: any) => 
                                      product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                                      (product.category && product.category.toLowerCase().includes(productSearchTerm.toLowerCase()))
                                    )
                                    .map((product: any) => (
                                      <CommandItem
                                        key={product.id}
                                        value={product.id}
                                        onSelect={() => {
                                          field.onChange(product.id);
                                          quickSaleItemForm.setValue("unitPrice", Number(product.price || 0));
                                          setProductSearchOpen(false);
                                          setProductSearchTerm("");
                                        }}
                                      >
                                        <Check
                                          className={`mr-2 h-4 w-4 ${
                                            field.value === product.id ? "opacity-100" : "opacity-0"
                                          }`}
                                        />
                                        <div className="flex flex-col">
                                          <span className="font-medium">{product.name}</span>
                                          <span className="text-sm text-gray-500">
                                            {product.category || 'Product'} - ${Number(product.price || 0).toFixed(2)}
                                          </span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Custom Product Name Field */}
                    {quickSaleItemForm.watch("productId") === "custom" && (
                      <FormField
                        control={quickSaleItemForm.control}
                        name="productName"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Custom Product Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter product name..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={quickSaleItemForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qty</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={quickSaleItemForm.control}
                      name="unitPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Price</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={quickSaleItemForm.control}
                      name="discount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount %</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-end">
                      <Button 
                        type="button" 
                        onClick={quickSaleItemForm.handleSubmit(addQuickSaleItem)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </Form>

                {/* Items List */}
                {quickSaleItems.length > 0 && (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Discount</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quickSaleItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                            <TableCell>{item.discount}%</TableCell>
                            <TableCell>${item.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuickSaleItem(item.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Invoice Totals - matching /invoices layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={quickSaleForm.control}
                      name="taxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Rate %</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={quickSaleForm.control}
                      name="discountAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Amount</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={quickSaleForm.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
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

                  <FormField
                    control={quickSaleForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({taxRate}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setQuickSaleOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={quickSaleMutation.isPending}>
                  {quickSaleMutation.isPending ? "Creating..." : "Create Invoice"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}