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
import { 
  Menu, 
  X, 
  Bell, 
  MessageSquare, 
  Settings as SettingsIcon, 
  User, 
  LogOut, 
  Globe,
  Search,
  ChevronDown,
  ShoppingCart,
  Plus,
  Check,
  Calendar
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Link, useLocation } from "wouter";
import LiveChat from "@/components/LiveChat";

// Page Components
import Dashboard from '@/pages/Dashboard';
import { StoreManagement } from '@/pages/StoreManagement';
import { InventoryManagement } from '@/pages/InventoryManagement';
import Sales from '@/pages/Sales';
import { CustomerManagement } from '@/pages/CustomerManagement';
import Appointments from '@/pages/Appointments';
import InvoiceManagement from '@/pages/InvoiceManagement';
import Payments from '@/pages/Payments';
import PatientManagement from '@/pages/PatientManagement';
import { MedicalAppointments } from '@/pages/MedicalAppointments';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [quickSaleDialogOpen, setQuickSaleDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Professional Quick Sale form schema with multiple items
  const quickSaleSchema = z.object({
    customerId: z.string().min(1, "Customer selection is required"),
    storeId: z.string().min(1, "Store selection is required"),
    items: z.array(z.object({
      productId: z.string().min(1, "Product selection is required"),
      productName: z.string().min(1, "Product name is required"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      unitPrice: z.number().min(0, "Unit price must be positive"),
    })).min(1, "At least one item is required"),
    taxRate: z.number().min(0).max(100).default(10),
    discountAmount: z.number().min(0).default(0),
    paymentMethod: z.enum(["cash", "card", "check", "digital"]),
    notes: z.string().optional()
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
      customerId: "walk-in",
      storeId: stores?.[0]?.id || "",
      items: [{ productId: "custom", productName: "Custom Item", quantity: 1, unitPrice: 0 }],
      taxRate: 10,
      discountAmount: 0,
      paymentMethod: "cash" as const,
      notes: ""
    }
  });

  // Watch for items changes to calculate totals
  const watchedItems = quickSaleForm.watch("items") || [];
  const watchedTaxRate = quickSaleForm.watch("taxRate") || 0;
  const watchedDiscount = quickSaleForm.watch("discountAmount") || 0;

  // Calculate totals safely
  const subtotal = watchedItems.reduce((sum, item) => {
    if (!item) return sum;
    return sum + ((item.quantity || 0) * (item.unitPrice || 0));
  }, 0);
  const taxAmount = subtotal * (watchedTaxRate / 100);
  const total = subtotal + taxAmount - watchedDiscount;

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
      setQuickSaleDialogOpen(false);
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
    // Get selected customer details
    const selectedCustomer = allCustomers.find((c: any) => c.id === data.customerId);
    
    // Calculate totals
    const subtotal = data.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * (data.taxRate / 100);
    const discount = data.discountAmount || 0;
    const total = subtotal + tax - discount;

    const invoiceData = {
      customerName: data.customerId === "walk-in" ? "Walk-in Customer" : (selectedCustomer?.name || "Walk-in Customer"),
      storeId: stores[0]?.id || "default-store",
      customerId: data.customerId === "walk-in" ? "guest" : data.customerId,
      subtotal: subtotal.toFixed(2),
      taxRate: data.taxRate,
      taxAmount: tax.toFixed(2),
      discountAmount: discount.toFixed(2),
      total: total.toFixed(2),
      status: "pending",
      paymentMethod: data.paymentMethod,
      notes: data.notes || "",
      items: data.items.map((item: any) => ({
        productName: item.productName,
        productId: item.productId === "custom" ? "custom" : item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: 0,
        total: item.quantity * item.unitPrice
      }))
    };

    quickSaleMutation.mutate(invoiceData);
  };

  // Add new item to the form
  const addNewItem = () => {
    const currentItems = quickSaleForm.getValues("items");
    quickSaleForm.setValue("items", [
      ...currentItems,
      { productId: "custom", productName: "Custom Item", quantity: 1, unitPrice: 0 }
    ]);
  };

  // Remove item from the form
  const removeItem = (index: number) => {
    const currentItems = quickSaleForm.getValues("items");
    if (currentItems.length > 1) {
      quickSaleForm.setValue("items", currentItems.filter((_, i) => i !== index));
    }
  };

  // Handle product selection for an item
  const handleProductChange = (index: number, productId: string) => {
    let product: any = null;
    let productName = "Custom Item";
    let unitPrice = 0;

    if (productId !== "custom") {
      product = products.find((p: any) => p.id === productId);
      if (product) {
        productName = product.name;
        unitPrice = parseFloat(product.price?.toString() || "0");
      }
    }

    const currentItems = quickSaleForm.getValues("items");
    currentItems[index] = {
      ...currentItems[index],
      productId,
      productName,
      unitPrice
    };
    quickSaleForm.setValue("items", currentItems);
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
            onClick={() => setQuickSaleDialogOpen(true)}
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
                  <SettingsIcon className="h-4 w-4 mr-2" />
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
      <Dialog open={quickSaleDialogOpen} onOpenChange={setQuickSaleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Quick sale invoice creation with professional search functionality
            </DialogDescription>
          </DialogHeader>
          
          <Form {...quickSaleForm}>
            <form onSubmit={quickSaleForm.handleSubmit(onQuickSaleSubmit)} className="space-y-6">
              {/* Header Section - Customer, Store, Payment */}
              <div className="grid grid-cols-3 gap-4">
                {/* Customer Search Combobox */}
                <FormField
                  control={quickSaleForm.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Customer</FormLabel>
                      <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={customerSearchOpen}
                              className="w-full justify-between"
                            >
                              {field.value && field.value !== "walk-in"
                                ? (() => {
                                    const selectedCustomer = allCustomers.find(c => c.id === field.value);
                                    return selectedCustomer?.displayName || "Select customer";
                                  })()
                                : field.value === "walk-in" 
                                  ? "Walk-in Customer"
                                  : "Select customer"}
                              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] p-0">
                          <Command>
                            <CommandInput 
                              placeholder="Search customers and patients..." 
                              value={customerSearchTerm}
                              onValueChange={setCustomerSearchTerm}
                            />
                            <CommandEmpty>No customer found.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-y-auto">
                              <CommandItem
                                value="walk-in"
                                onSelect={() => {
                                  field.onChange("walk-in");
                                  setCustomerSearchOpen(false);
                                  setCustomerSearchTerm("");
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    field.value === "walk-in" ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 text-xs font-medium">W</span>
                                  </div>
                                  <div>
                                    <div className="font-medium">Walk-in Customer</div>
                                    <div className="text-xs text-slate-500">Cash customer</div>
                                  </div>
                                </div>
                              </CommandItem>
                          
                              
                              {customers.filter((c: any) => c && c.name && 
                                c.name.toLowerCase().includes(customerSearchTerm.toLowerCase())).map((customer: any) => (
                                <CommandItem
                                  key={customer.id}
                                  value={customer.id}
                                  onSelect={() => {
                                    field.onChange(customer.id);
                                    setCustomerSearchOpen(false);
                                    setCustomerSearchTerm("");
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      field.value === customer.id ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                      <span className="text-green-600 text-xs font-medium">
                                        {customer.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="font-medium">{customer.name}</div>
                                      <div className="text-xs text-slate-500">Customer</div>
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}

                              {patients.filter((p: any) => p && (p.name || (p.firstName && p.lastName)) && 
                                (p.name || `${p.firstName} ${p.lastName}`).toLowerCase().includes(customerSearchTerm.toLowerCase())).map((patient: any) => {
                                const displayName = patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
                                return (
                                  <CommandItem
                                    key={patient.id}
                                    value={patient.id}
                                    onSelect={() => {
                                      field.onChange(patient.id);
                                      setCustomerSearchOpen(false);
                                      setCustomerSearchTerm("");
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        field.value === patient.id ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    <div className="flex items-center space-x-2">
                                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-purple-600 text-xs font-medium">
                                          {displayName.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                      <div>
                                        <div className="font-medium">{displayName}</div>
                                        <div className="text-xs text-slate-500">Patient</div>
                                      </div>
                                    </div>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Store Selection */}
                <FormField
                  control={quickSaleForm.control}
                  name="storeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || stores[0]?.id}>
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

                {/* Payment Method */}
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
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                          <SelectItem value="digital">Digital</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Invoice Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Invoice Items</h3>
                  <Button type="button" onClick={addNewItem} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                {/* Items Header */}
                <div className="grid grid-cols-12 gap-3 text-sm font-medium text-slate-600 px-3 py-2 bg-slate-50 rounded">
                  <div className="col-span-5">Product</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-2">Unit Price</div>
                  <div className="col-span-2">Discount %</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                {/* Dynamic Items */}
                {watchedItems.map((item: any, index: number) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-end p-3 border border-slate-200 rounded-lg">
                    {/* Product Search */}
                    <div className="col-span-5">
                      <FormField
                        control={quickSaleForm.control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                          <FormItem>
                            <Popover open={productSearchOpen && index === 0} onOpenChange={(open) => setProductSearchOpen(open && index === 0)}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between"
                                  >
                                    {field.value && field.value !== "custom"
                                      ? products.find(product => product.id === field.value)?.name || "Select product"
                                      : field.value === "custom" 
                                        ? "Custom Item"
                                        : "Select product"}
                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[400px] p-0">
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
                                        handleProductChange(index, "custom");
                                        setProductSearchOpen(false);
                                        setProductSearchTerm("");
                                      }}
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${
                                          field.value === "custom" ? "opacity-100" : "opacity-0"
                                        }`}
                                      />
                                      <div className="flex flex-col">
                                        <span className="font-medium">Custom Item</span>
                                        <span className="text-xs text-slate-500">Enter custom details</span>
                                      </div>
                                    </CommandItem>
                                    
                                    {products
                                      .filter(product => 
                                        product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                                        (product.category || "").toLowerCase().includes(productSearchTerm.toLowerCase())
                                      )
                                      .map((product) => (
                                        <CommandItem
                                          key={product.id}
                                          value={product.id}
                                          onSelect={() => {
                                            field.onChange(product.id);
                                            handleProductChange(index, product.id);
                                            setProductSearchOpen(false);
                                            setProductSearchTerm("");
                                          }}
                                        >
                                          <Check
                                            className={`mr-2 h-4 w-4 ${
                                              field.value === product.id ? "opacity-100" : "opacity-0"
                                            }`}
                                          />
                                          <div className="flex flex-col flex-1">
                                            <div className="flex items-center justify-between">
                                              <span className="font-medium">{product.name}</span>
                                              <span className="text-sm font-semibold text-green-600">
                                                ${parseFloat(product.price || 0).toFixed(2)}
                                              </span>
                                            </div>
                                            <span className="text-xs text-slate-500">{product.category || 'Product'}</span>
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
                      
                      {/* Custom Product Name */}
                      {item.productId === "custom" && (
                        <div className="mt-2">
                          <FormField
                            control={quickSaleForm.control}
                            name={`items.${index}.productName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Custom product name..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2">
                      <FormField
                        control={quickSaleForm.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
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
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-2">
                      <FormField
                        control={quickSaleForm.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
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
                    </div>

                    {/* Discount Percentage */}
                    <div className="col-span-2">
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        defaultValue="0"
                        placeholder="0"
                      />
                    </div>

                    {/* Remove Button */}
                    <div className="col-span-1 text-center">
                      {watchedItems.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Totals Summary */}
                <div className="mt-6 p-4 bg-slate-50 rounded-lg space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax ({watchedTaxRate}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discount:</span>
                    <span>-${watchedDiscount.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-blue-600">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
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
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setQuickSaleDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={quickSaleMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {quickSaleMutation.isPending ? "Processing..." : "Complete Sale"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {location === "/" && (
          <Dashboard />
        )}
        {location === "/stores" && (
          <StoreManagement />
        )}
        {location === "/inventory" && (
          <InventoryManagement />
        )}
        {location === "/sales" && (
          <Sales />
        )}
        {location === "/customers" && (
          <CustomerManagement />
        )}
        {location === "/appointments" && (
          <Appointments />
        )}
        {location === "/invoices" && (
          <InvoiceManagement />
        )}
        {location === "/payments" && (
          <Payments />
        )}
        {location === "/patients" && (
          <PatientManagement />
        )}
        {location === "/medical-appointments" && (
          <MedicalAppointments />
        )}
        {location === "/reports" && (
          <Reports />
        )}
        {location === "/settings" && (
          <Settings />
        )}
      </div>
    </div>
  );
}