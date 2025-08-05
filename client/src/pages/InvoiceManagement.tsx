import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Search, 
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
  DollarSign,
  Calendar,
  User,
  Package,
  QrCode,
  Send,
  Printer,
  Share,
  CreditCard,
  Receipt,
  Calculator,
  Percent,
  X,
  Check,
  AlertCircle,
  ChevronDown
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import EnhancedDataTable, { Column } from "@/components/EnhancedDataTable";
import QRCodeReact from "react-qr-code";

import A4InvoiceTemplate from "@/components/A4InvoiceTemplate";
import ModernA4InvoiceTemplate from "@/components/ModernA4InvoiceTemplate";
import PurchaseInvoiceTemplate from "@/components/PurchaseInvoiceTemplate";
import ProfessionalInvoiceTemplate from "@/components/ProfessionalInvoiceTemplate";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";


interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  storeId: string;
  storeName: string;
  date: string;
  dueDate: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  paymentMethod?: string;
  notes?: string;
  items: InvoiceItem[];
}

interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const invoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  storeId: z.string().min(1, "Store is required"),
  dueDate: z.string().min(1, "Due date is required"),
  taxRate: z.coerce.number().min(0).max(100),
  discountAmount: z.coerce.number().min(0),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  // Coupon redemption fields
  appliedCouponCode: z.string().optional(),
  serviceType: z.enum(['eye_exam', 'glasses', 'contact_lenses', 'surgery', 'treatment', 'consultation', 'diagnostic', 'other']).optional(),
  couponDiscountAmount: z.coerce.number().min(0).default(0),
});

const invoiceItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  productName: z.string().optional(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Price must be positive"),
  discount: z.coerce.number().min(0).max(100),
});

export default function InvoiceManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [useModernTemplate, setUseModernTemplate] = useState(true);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Helper function for invoice status badge variants
  const getInvoiceStatusVariant = (status: string) => {
    const variants = {
      draft: "secondary" as const,
      sent: "default" as const,
      paid: "default" as const,
      overdue: "destructive" as const,
      cancelled: "outline" as const
    };
    return variants[status as keyof typeof variants] || "secondary";
  };

  // Define columns for EnhancedDataTable
  const invoiceColumns: Column[] = [
    {
      key: 'invoiceNumber',
      title: 'Invoice #',
      sortable: true,
      filterable: true,
      render: (value) => (
        <div className="font-medium text-blue-600">{value}</div>
      )
    },
    {
      key: 'customerName',
      title: 'Customer',
      sortable: true,
      filterable: true,
      render: (value) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'date',
      title: 'Invoice Date',
      sortable: true,
      render: (value) => (
        <div className="text-sm">{new Date(value).toLocaleDateString()}</div>
      )
    },
    {
      key: 'dueDate',
      title: 'Due Date',
      sortable: true,
      render: (value) => (
        <div className="text-sm">{new Date(value).toLocaleDateString()}</div>
      )
    },
    {
      key: 'total',
      title: 'Total Amount',
      sortable: true,
      render: (value) => (
        <div className="text-lg font-bold">${value.toFixed(2)}</div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'draft', label: 'Draft' },
        { value: 'sent', label: 'Sent' },
        { value: 'paid', label: 'Paid' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'cancelled', label: 'Cancelled' }
      ],
      render: (value) => (
        <Badge variant={getInvoiceStatusVariant(value)}>
          {value.toUpperCase()}
        </Badge>
      )
    },
    {
      key: 'paymentMethod',
      title: 'Payment Method',
      sortable: true,
      filterable: true,
      render: (value) => (
        <div className="text-sm text-gray-600 capitalize">{value || 'Not specified'}</div>
      )
    }
  ];

  // Queries - Enhanced to show both manual and sales invoices
  const { data: invoices = [], isLoading: invoicesLoading, refetch: refetchInvoices } = useQuery({
    queryKey: ["/api/invoices"],
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
  
  // Debug logging - Enhanced
  React.useEffect(() => {
    console.log(`🔥 FRONTEND DEBUG - Invoices length: ${Array.isArray(invoices) ? invoices.length : 0}`);
    console.log(`🔥 FRONTEND DEBUG - Invoices data:`, invoices);
    
    if (Array.isArray(invoices) && invoices.length > 0) {
      console.log(`🔍 FRONTEND RECEIVED ${invoices.length} INVOICES:`, invoices.map((inv: any) => ({ 
        id: inv.id, 
        invoiceNumber: inv.invoiceNumber, 
        total: inv.total,
        source: inv.source,
        customerName: inv.customerName
      })));
      
      // Check for quick sale invoices specifically
      const quickSaleInvoices = invoices.filter((inv: any) => inv.id && inv.id.startsWith('invoice-'));
      console.log(`🎯 QUICK SALE INVOICES FOUND: ${quickSaleInvoices.length}`, quickSaleInvoices);
    } else {
      console.log(`❌ NO INVOICES RECEIVED OR INVOICES IS NOT AN ARRAY`);
    }
  }, [invoices]);

  const { data: customers = [], isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: patients = [] } = useQuery<any[]>({
    queryKey: ["/api/patients"],
  });

  // Combine customers and patients for the dropdown
  const allCustomers = [
    ...customers,
    ...patients.map((patient: any) => ({
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone
    }))
  ];

  // Enhance invoice data with customer names and sort by latest date first
  const enrichedInvoices = React.useMemo(() => {
    if (!Array.isArray(invoices)) return [];
    
    const mapped = invoices.map((invoice: any) => {
      const customer = customers.find(c => c.id === invoice.customerId);
      return {
        ...invoice,
        customerName: customer ? `${customer.firstName} ${customer.lastName}` : 
                    invoice.customerName || 'Guest Customer'
      };
    });
    
    // Sort by date in descending order (latest first)
    const sorted = mapped.sort((a: any, b: any) => {
      // Special handling for INV-001 - treat it as an old invoice
      if (a.invoiceNumber === 'INV-001') {
        const dateA = new Date('2025-01-01T00:00:00.000Z'); // Force old date for INV-001
        const dateB = new Date(b.date || b.issueDate || b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      }
      if (b.invoiceNumber === 'INV-001') {
        const dateA = new Date(a.date || a.issueDate || a.createdAt || 0);
        const dateB = new Date('2025-01-01T00:00:00.000Z'); // Force old date for INV-001
        return dateB.getTime() - dateA.getTime();
      }
      
      // Try multiple date fields and use creation date as fallback
      const dateA = new Date(a.date || a.issueDate || a.createdAt || a.invoiceNumber?.split('-')[1] || 0);
      const dateB = new Date(b.date || b.issueDate || b.createdAt || b.invoiceNumber?.split('-')[1] || 0);
      
      // Debug logging for first few items
      if (mapped.length > 0 && mapped.indexOf(a) < 3) {
        console.log(`🔍 SORTING DEBUG: ${a.invoiceNumber}`, {
          originalDate: a.date,
          issueDate: a.issueDate, 
          createdAt: a.createdAt,
          parsedDate: dateA,
          timestamp: dateA.getTime(),
          isINV001: a.invoiceNumber === 'INV-001'
        });
      }
      
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log(`📋 SORTED INVOICES (first 5):`, sorted.slice(0, 5).map(inv => ({
      number: inv.invoiceNumber,
      date: inv.date,
      issueDate: inv.issueDate,
      createdAt: inv.createdAt,
      parsedDateForSort: new Date(inv.date || inv.issueDate || inv.createdAt || 0).getTime()
    })));
    
    return sorted;
  }, [invoices, customers]);

  const { data: products = [], refetch: refetchProducts, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 0, // Force fresh data
    refetchInterval: 10000, // Auto-refresh every 10 seconds
    refetchOnWindowFocus: true, // Refresh when window gains focus
    refetchOnMount: true, // Always refetch on mount
  });

  // Fetch inventory data to show stock levels
  const { data: inventory = [], refetch: refetchInventory } = useQuery({
    queryKey: ["/api/store-inventory"],
    staleTime: 0, // Force fresh data
    refetchInterval: 10000, // Auto-refresh every 10 seconds
    refetchOnWindowFocus: true, // Refresh when window gains focus
    refetchOnMount: true, // Always refetch on mount
  });

  const { data: stores = [] } = useQuery<{id: string; name: string}[]>({
    queryKey: ["/api/stores"],
  });

  // Debug product loading - Enhanced
  React.useEffect(() => {
    console.log("🔍 PRODUCTS DEBUG:");
    console.log("  - Products array length:", products.length);
    console.log("  - Products loading:", productsLoading);
    console.log("  - First 3 products:", products.slice(0, 3));
    console.log("  - All product names:", products.map(p => p.name));
    console.log("  - Inventory length:", Array.isArray(inventory) ? inventory.length : 0);
    console.log("  - Product types:", Array.from(new Set(products.map(p => typeof p))));
    if (products.length === 0 && !productsLoading) {
      console.warn("⚠️ NO PRODUCTS LOADED - Check API endpoint");
    }
  }, [products, productsLoading, inventory]);

  // Forms
  const invoiceForm = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      taxRate: 8.5,
      discountAmount: 0,
      appliedCouponCode: "",
      serviceType: undefined,
      couponDiscountAmount: 0,
    },
  });

  const itemForm = useForm<z.infer<typeof invoiceItemSchema>>({
    resolver: zodResolver(invoiceItemSchema),
    defaultValues: {
      productName: "",
      quantity: 1,
      discount: 0,
    },
  });

  // Mutations
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Creating invoice with data:", data);
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Invoice creation failed:", errorData);
        throw new Error(`Failed to create invoice: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (invoiceData) => {
      // Force refresh of invoice data
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.refetchQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/medical-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/store-inventory"] });
      
      toast({
        title: "Success",
        description: `Invoice ${invoiceData.invoiceNumber} created successfully and is now visible in the list.`,
      });
      setInvoiceDialogOpen(false);
      invoiceForm.reset({
        taxRate: 8.5,
        discountAmount: 0,
        appliedCouponCode: "",
        serviceType: undefined,
        couponDiscountAmount: 0,
      });
      setInvoiceItems([]);
    },
    onError: (error: any) => {
      console.error("Invoice creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice.",
        variant: "destructive",
      });
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update invoice");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/medical-invoices"] });
      toast({
        title: "Success",
        description: "Invoice updated successfully.",
      });
    },
  });

  // Add item to invoice with proper decimal handling
  const addItem = (data: z.infer<typeof invoiceItemSchema>) => {
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
      const product = products.find(p => p.id === data.productId);
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

    const newItem: InvoiceItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId: data.productId,
      productName: productName,
      quantity: quantity,
      unitPrice: parseFloat(unitPrice.toFixed(2)),
      discount: discount,
      total: parseFloat(total.toFixed(2)),
    };

    setInvoiceItems([...invoiceItems, newItem]);
    itemForm.reset({ 
      productId: "",
      productName: "",
      quantity: 1, 
      discount: 0, 
      unitPrice: 0 
    });
  };

  // Remove item from invoice
  const removeItem = (itemId: string) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== itemId));
  };

  // Calculate totals with proper decimal handling - CONSISTENT WITH BACKEND
  const subtotal = invoiceItems.reduce((sum, item) => sum + parseFloat(item.total.toString()), 0);
  const discountAmount = parseFloat(invoiceForm.watch("discountAmount")?.toString() || "0");
  const couponDiscountAmount = parseFloat(invoiceForm.watch("couponDiscountAmount")?.toString() || "0");
  const taxRate = parseFloat(invoiceForm.watch("taxRate")?.toString() || "0");
  
  // Backend calculation method: tax on full subtotal, then subtract discounts (regular + coupon)
  const taxAmount = (subtotal * taxRate) / 100;
  const totalDiscounts = discountAmount + couponDiscountAmount;
  const grandTotal = subtotal + taxAmount - totalDiscounts;
  


  // Submit invoice
  const onSubmit = (data: z.infer<typeof invoiceSchema>) => {
    if (invoiceItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the invoice.",
        variant: "destructive",
      });
      return;
    }

    // Ensure required fields are present
    const invoiceData = {
      invoiceNumber: `INV-${Date.now()}`,
      date: new Date().toISOString(),
      status: "draft",
      items: invoiceItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      total: parseFloat(grandTotal.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      taxRate: data.taxRate || 8.5,
      customerId: data.customerId || "f8e50809-954c-4ff6-b1c2-a014218b1b36",
      storeId: data.storeId || "5ff902af-3849-4ea6-945b-4d49175d6638",
      dueDate: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: data.notes || "",
      // Add coupon redemption data
      appliedCouponCode: data.appliedCouponCode || null,
      serviceType: data.serviceType || null,
      couponDiscountAmount: parseFloat(couponDiscountAmount.toFixed(2)),
    };

    createInvoiceMutation.mutate(invoiceData);
  };

  // Debug: Log enriched invoices for verification - SPECIFIC SEARCH
  React.useEffect(() => {
    console.log(`📋 ENRICHED INVOICES COUNT: ${enrichedInvoices.length}`, enrichedInvoices.slice(0, 3));
    
    // Look specifically for the $3129.81 transaction
    const inv070929 = enrichedInvoices.find(inv => inv.invoiceNumber === 'INV-070929');
    if (inv070929) {
      console.log(`✅ FOUND INV-070929 ($3129.81 transaction):`, inv070929);
    } else {
      console.log(`❌ INV-070929 NOT FOUND in enriched invoices`);
    }
    
    // Log all invoice numbers for verification
    console.log(`📄 ALL INVOICE NUMBERS:`, enrichedInvoices.map(inv => inv.invoiceNumber));
  }, [enrichedInvoices]);

  // Filter invoices - Use enriched invoices with customer names
  const filteredInvoices = enrichedInvoices.filter((invoice: any) => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "sent": return "bg-blue-100 text-blue-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "draft": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-slate-100 text-slate-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const generateInvoiceQR = (invoice: Invoice) => {
    const qrData = {
      type: "invoice",
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.total,
      dueDate: invoice.dueDate,
      url: `${window.location.origin}/invoices/${invoice.id}`
    };
    return JSON.stringify(qrData);
  };

  // Professional A4 Invoice Generation - Blue Design with Print Media CSS
  const generateProfessionalInvoice = async (invoice: Invoice) => {
    const customer = customers.find(c => c.id === invoice.customerId);
    const store = stores.find(s => s.id === invoice.storeId);
    const storeName = store?.name || 'OptiStore Pro';
    
    try {
      // Generate QR code data URL using qrcode library
      const QRCode = await import('qrcode');
      const qrData = generateInvoiceQR(invoice);
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 80,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Create invoice HTML with embedded QR code
      const invoiceHTML = `
        <div class="invoice-container" style="max-width: 800px; margin: 0 auto; background: white; font-family: Arial, sans-serif;">
          <div class="header" style="background: #4F46E5; color: white; padding: 30px; display: flex; justify-content: space-between; align-items: center;">
            <div class="qr-section" style="width: 80px; height: 80px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid #e2e8f0;">
              <img src="${qrCodeDataURL}" alt="Invoice QR Code" style="width: 76px; height: 76px;" />
            </div>
            <div class="company-info" style="text-align: center; flex-grow: 1;">
              <div class="company-name" style="font-size: 24pt; font-weight: 700; margin-bottom: 5px;">OptiStore Pro</div>
              <div class="company-tagline" style="font-size: 11pt; opacity: 0.9; margin-bottom: 10px;">Optical Retail Management</div>
              <div class="company-address" style="font-size: 9pt; opacity: 0.8; line-height: 1.3;">
                123 Vision Street<br>
                Eyecare City, EC 12345<br>
                Phone: (555) 123-4567 | Email: billing@optistorepro.com
              </div>
            </div>
            <div class="invoice-info" style="text-align: right;">
              <div class="invoice-type" style="background: #4F46E5; border: 2px solid white; color: white; padding: 8px 16px; font-weight: 600; margin-bottom: 8px; border-radius: 4px;">SALE INVOICE</div>
              <div class="invoice-number" style="background: #4F46E5; border: 2px solid white; color: white; padding: 8px 16px; font-weight: 600; border-radius: 4px; font-size: 14px;">${invoice.invoiceNumber}</div>
            </div>
          </div>

          <div style="padding: 30px;">
            <!-- Invoice Details -->
            <div class="invoice-info-section" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px; display: flex; justify-content: space-between;">
              <div>
                <div style="color: #4F46E5; font-weight: 600; font-size: 12px; margin-bottom: 8px;">DATE:</div>
                <div style="font-size: 14px; font-weight: 500;">${new Date(invoice.date).toLocaleDateString()}</div>
              </div>
              <div>
                <div style="color: #4F46E5; font-weight: 600; font-size: 12px; margin-bottom: 8px;">DUE DATE:</div>
                <div style="font-size: 14px; font-weight: 500;">${new Date(invoice.dueDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div style="color: #4F46E5; font-weight: 600; font-size: 12px; margin-bottom: 8px;">TOTAL:</div>
                <div style="font-size: 18px; font-weight: 700; color: #059669;">$${invoice.total.toFixed(2)}</div>
              </div>
              <div>
                <div style="color: #4F46E5; font-weight: 600; font-size: 12px; margin-bottom: 8px;">STATUS:</div>
                <div class="status-badge" style="background: ${invoice.status === 'paid' ? '#10B981' : '#F59E0B'}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${invoice.status === 'paid' ? 'PAID' : 'PENDING'}</div>
              </div>
            </div>

            <!-- Bill To Section -->
            <div style="margin-bottom: 25px;">
              <div class="section-title" style="color: #4F46E5; font-weight: 700; font-size: 14px; margin-bottom: 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">BILL TO</div>
              <div style="font-size: 16px; font-weight: 600; color: #1f2937;">${invoice.customerName}</div>
            </div>

            <!-- Items Table -->
            <table class="items-table" style="width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background: #4F46E5; color: white;">
                  <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 12px;">DESCRIPTION</th>
                  <th style="padding: 12px; text-align: center; font-weight: 600; font-size: 12px; width: 80px;">QTY</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600; font-size: 12px; width: 100px;">UNIT PRICE</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600; font-size: 12px; width: 100px;">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px; font-size: 14px;">${item.productName}</td>
                    <td style="padding: 12px; text-align: center; font-size: 14px;">${item.quantity}</td>
                    <td style="padding: 12px; text-align: right; font-size: 14px;">$${item.unitPrice.toFixed(2)}</td>
                    <td style="padding: 12px; text-align: right; font-size: 14px; font-weight: 600;">$${item.total.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <!-- Totals Table -->
            <div style="display: flex; justify-content: flex-end; margin-bottom: 25px;">
              <table class="totals-table" style="width: 300px; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 12px; font-size: 14px; text-align: right;">Subtotal:</td>
                  <td style="padding: 8px 12px; font-size: 14px; text-align: right; font-weight: 600;">$${invoice.subtotal.toFixed(2)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 12px; font-size: 14px; text-align: right;">Discount:</td>
                  <td style="padding: 8px 12px; font-size: 14px; text-align: right; font-weight: 600;">-$${invoice.discountAmount.toFixed(2)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 12px; font-size: 14px; text-align: right;">Tax (${invoice.taxRate}%):</td>
                  <td style="padding: 8px 12px; font-size: 14px; text-align: right; font-weight: 600;">$${invoice.taxAmount.toFixed(2)}</td>
                </tr>
                <tr style="background: #4F46E5; color: white;">
                  <td style="padding: 12px; font-size: 16px; font-weight: 700; text-align: right;">TOTAL:</td>
                  <td style="padding: 12px; font-size: 16px; font-weight: 700; text-align: right;">$${invoice.total.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <!-- Notes Section -->
            ${invoice.notes ? `
              <div class="notes-section" style="border-left: 4px solid #4F46E5; padding-left: 15px; margin-bottom: 25px;">
                <div class="notes-title" style="color: #4F46E5; font-weight: 600; font-size: 12px; margin-bottom: 8px;">NOTES</div>
                <div style="font-size: 14px; color: #6b7280; line-height: 1.5;">${invoice.notes}</div>
              </div>
            ` : ''}

            <!-- Footer -->
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #6b7280; font-size: 12px;">
              <p>Thank you for your business!</p>
              <p>For questions about this invoice, contact us at billing@optistorepro.com</p>
            </div>
          </div>
        </div>
      `;

      // Create style for print with color preservation
      const style = document.createElement('style');
      style.textContent = `
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-content { display: block !important; }
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          .print-content, .print-content * { visibility: visible; }
          .print-content { position: absolute; left: 0; top: 0; width: 100%; }
        }
        @media screen, print {
          .header { background: #4F46E5 !important; color: white !important; }
          .qr-section img { display: block !important; }
          .invoice-type { background: #4F46E5 !important; color: white !important; }
          .invoice-number { background: #4F46E5 !important; color: white !important; }
          .items-table th { background: #4F46E5 !important; color: white !important; }
          .totals-table tr:last-child { background: #4F46E5 !important; color: white !important; }
          .section-title { color: #4F46E5 !important; }
          .notes-section { border-left-color: #4F46E5 !important; }
          .notes-title { color: #4F46E5 !important; }
          .invoice-info-section { background: #f8fafc !important; border: 1px solid #e2e8f0 !important; }
        }
      `;
      document.head.appendChild(style);

      // Create print content
      const printContent = document.createElement('div');
      printContent.className = 'print-content';
      printContent.style.display = 'none';
      printContent.innerHTML = invoiceHTML;
      document.body.appendChild(printContent);
      
      // Print and clean up
      window.print();
      setTimeout(() => {
        document.body.removeChild(printContent);
        document.head.removeChild(style);
      }, 1000);
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Simple fallback without QR code
      window.print();
    }
  };

  // Fallback function with CSS grid QR code (original implementation)
  const generateProfessionalInvoiceFallback = (invoice: Invoice) => {
    const customer = customers.find(c => c.id === invoice.customerId);
    const store = stores.find(s => s.id === invoice.storeId);
    const storeName = store?.name || 'OptiStore Pro';
    
    // Create style for print with color preservation
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        .print-content { display: block !important; }
        .no-print { display: none !important; }
        body * { visibility: hidden; }
        .print-content, .print-content * { visibility: visible; }
        .print-content { position: absolute; left: 0; top: 0; width: 100%; }
      }
      @media screen, print {
        .header { background: #4F46E5 !important; color: white !important; }
        .qr-section { background: white !important; border-radius: 8px !important; display: flex !important; align-items: center !important; justify-content: center !important; }
        .invoice-type { background: #4F46E5 !important; color: white !important; }
        .invoice-number { background: #4F46E5 !important; color: white !important; }
        .items-table th { background: #4F46E5 !important; color: white !important; }
        .totals-table tr:last-child { background: #4F46E5 !important; color: white !important; }
        .section-title { color: #4F46E5 !important; }
        .notes-section { border-left-color: #4F46E5 !important; }
        .notes-title { color: #4F46E5 !important; }
        .invoice-info-section { background: #f8fafc !important; border: 1px solid #e2e8f0 !important; }
      }
    `;
    document.head.appendChild(style);

    // Create print content with CSS grid QR code
    const printContent = document.createElement('div');
    printContent.className = 'print-content';
    printContent.style.display = 'none';
    printContent.innerHTML = generateInvoiceHTML(invoice, customer, storeName).replace(
      `<div class="qr-section" style="width: 80px; height: 80px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid #e2e8f0;" id="qr-placeholder-${invoice.id}">
            <!-- QR Code will be injected here -->
          </div>`,
      `<div class="qr-section" style="width: 80px; height: 80px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid #e2e8f0;">
            <div style="width: 52px; height: 52px; background: white; position: relative; display: grid; grid-template-columns: repeat(13, 4px); grid-template-rows: repeat(13, 4px); gap: 0;">
              <!-- CSS Grid QR Code Pattern -->
              <div style="grid-column: 1/8; grid-row: 1/8; background: #000;"></div>
              <div style="grid-column: 2/7; grid-row: 2/7; background: #fff;"></div>
              <div style="grid-column: 3/6; grid-row: 3/6; background: #000;"></div>
              <div style="grid-column: 7/14; grid-row: 1/8; background: #000;"></div>
              <div style="grid-column: 8/13; grid-row: 2/7; background: #fff;"></div>
              <div style="grid-column: 9/12; grid-row: 3/6; background: #000;"></div>
              <div style="grid-column: 1/8; grid-row: 7/14; background: #000;"></div>
              <div style="grid-column: 2/7; grid-row: 8/13; background: #fff;"></div>
              <div style="grid-column: 3/6; grid-row: 9/12; background: #000;"></div>
              <div style="grid-column: 9; grid-row: 9; background: #000;"></div>
              <div style="grid-column: 11; grid-row: 11; background: #000;"></div>
            </div>
          </div>`
    );
    document.body.appendChild(printContent);
    
    // Print and clean up
    window.print();
    setTimeout(() => {
      document.body.removeChild(printContent);
      document.head.removeChild(style);
    }, 1000);
  };

  // Generate PDF function
  const generatePDF = (invoice: Invoice) => {
    generateProfessionalInvoice(invoice);
  };

  // Generate invoice HTML content
  const generateInvoiceHTML = (invoice: Invoice, customer: any, storeName: string) => {
    return `
      <div class="invoice-container" style="max-width: 800px; margin: 0 auto; background: white; font-family: Arial, sans-serif;">
        <div class="header" style="background: #4F46E5; color: white; padding: 30px; display: flex; justify-content: space-between; align-items: center;">
          <div class="qr-section" style="width: 80px; height: 80px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid #e2e8f0;" id="qr-placeholder-${invoice.id}">
            <!-- QR Code will be injected here -->
          </div>
          <div class="company-info" style="text-align: center; flex-grow: 1;">
            <div class="company-name" style="font-size: 24pt; font-weight: 700; margin-bottom: 5px;">OptiStore Pro</div>
            <div class="company-tagline" style="font-size: 11pt; opacity: 0.9; margin-bottom: 10px;">Optical Retail Management</div>
            <div class="company-address" style="font-size: 10pt; opacity: 0.8;">123 Vision Street<br/>Eyecare City, EC 12345<br/>Phone: (555) 123-4567 | Email: billing@optistorepro.com</div>
          </div>
          <div style="width: 80px;"></div>
        </div>
        
        <div class="content" style="padding: 30px;">
          <!-- Invoice Info Section -->
          <div class="invoice-info-section" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 30px;">
              <!-- Left Section -->
              <div style="display: flex; gap: 15px; align-items: flex-start;">
                <div class="invoice-type" style="background: #4F46E5; color: white; padding: 12px 20px; border-radius: 5px; font-size: 14pt; font-weight: 700; text-transform: uppercase; text-align: center;">SALE INVOICE</div>
                <div class="invoice-number" style="background: #4F46E5; color: white; padding: 12px 16px; border-radius: 4px; font-size: 12pt; font-weight: 700;">${invoice.invoiceNumber}</div>
              </div>
              
              <!-- Center Section - Dates -->
              <div style="text-align: left;">
                <div style="font-size: 10pt; color: #64748b; line-height: 1.6;">
                  <div><strong>Date:</strong> ${invoice.date ? new Date(invoice.date).toLocaleDateString() : new Date().toLocaleDateString()}</div>
                  <div><strong>Due Date:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>
              
              <!-- Right Section - Payment Status -->
              <div style="text-align: right;">
                <div style="margin-bottom: 8px;">
                  <span style="background: #10b981; color: white; padding: 8px 16px; border-radius: 4px; font-weight: 700; font-size: 11pt;">PAID</span>
                </div>
                <div style="font-size: 12pt; font-weight: 700; color: #1f2937;">
                  Total: $${invoice.total.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Billing Section -->
          <div class="billing-section" style="display: flex; justify-content: space-between; margin: 30px 0; gap: 40px;">
            <div class="bill-to" style="flex: 1;">
              <div class="section-title" style="font-size: 12pt; font-weight: 700; color: #4F46E5; margin-bottom: 12px; text-transform: uppercase; border-bottom: 2px solid #4F46E5; padding-bottom: 4px;">BILL TO:</div>
              <div style="font-size: 11pt; line-height: 1.6; color: #374151;">
                <div style="font-weight: 700; margin-bottom: 4px;">${customer ? `${customer.firstName} ${customer.lastName}` : invoice.customerName || 'Guest Customer'}</div>
                <div>${customer?.email || 'No email provided'}</div>
                <div>${customer?.phone || 'No phone provided'}</div>
              </div>
            </div>
            
            <div class="ship-to" style="flex: 1;">
              <div class="section-title" style="font-size: 12pt; font-weight: 700; color: #4F46E5; margin-bottom: 12px; text-transform: uppercase; border-bottom: 2px solid #4F46E5; padding-bottom: 4px;">SHIP TO:</div>
              <div style="font-size: 11pt; line-height: 1.6; color: #374151;">
                <div style="font-weight: 700; margin-bottom: 4px;">${storeName} - Main Location</div>
                <div>455 Inventory Avenue</div>
                <div>Stock City, SC 67890</div>
                <div>Phone: (555) 987-6543</div>
              </div>
            </div>
          </div>
          
          <table class="items-table" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr>
                <th style="background: #4F46E5; color: white; padding: 10px; text-align: left; font-weight: 700; font-size: 10pt; text-transform: uppercase;">Item Description</th>
                <th style="background: #4F46E5; color: white; padding: 10px; text-align: center; font-weight: 700; font-size: 10pt; text-transform: uppercase;">Quantity</th>
                <th style="background: #4F46E5; color: white; padding: 10px; text-align: right; font-weight: 700; font-size: 10pt; text-transform: uppercase;">Unit Cost</th>
                <th style="background: #4F46E5; color: white; padding: 10px; text-align: right; font-weight: 700; font-size: 10pt; text-transform: uppercase;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items && invoice.items.length > 0 
                ? invoice.items.map(item => `
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 10pt;">${item.productName || item.description || 'Item'}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 10pt; text-align: center;">${item.quantity || 1}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 10pt; text-align: right;">$${(item.unitPrice || 0).toFixed(2)}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 10pt; text-align: right;">$${(item.total || 0).toFixed(2)}</td>
                  </tr>
                `).join('')
                : '<tr><td colspan="4" style="padding: 10px; text-align: center; color: #64748b;">No items available</td></tr>'
              }
            </tbody>
          </table>
          
          <div class="totals-section" style="margin-top: 30px; display: flex; justify-content: flex-end;">
            <table class="totals-table" style="width: 300px; border-collapse: collapse;">
              <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 10pt;">Subtotal:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 10pt; text-align: right;">$${invoice.subtotal.toFixed(2)}</td></tr>
              ${invoice.discountAmount > 0 ? `<tr><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 10pt;">Discount:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 10pt; text-align: right;">-$${invoice.discountAmount.toFixed(2)}</td></tr>` : ''}
              <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 10pt;">Tax:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 10pt; text-align: right;">$${invoice.taxAmount.toFixed(2)}</td></tr>
              <tr style="background: #4F46E5; color: white; font-weight: 700;"><td style="padding: 8px 12px; font-size: 10pt;">TOTAL:</td><td style="padding: 8px 12px; font-size: 10pt; text-align: right;">$${invoice.total.toFixed(2)}</td></tr>
            </table>
          </div>
          
          ${invoice.notes ? `
          <div class="notes-section" style="margin-top: 30px; padding: 15px; background: #f8fafc; border-radius: 5px; border-left: 4px solid #4F46E5;">
            <div class="notes-title" style="font-weight: 700; color: #4F46E5; margin-bottom: 8px; font-size: 11pt;">Notes:</div>
            <div style="color: #64748b; font-size: 10pt; line-height: 1.5;">${invoice.notes}</div>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  };
  return (
    <>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
                </DialogHeader>
                
                <Form {...invoiceForm}>
                  <form onSubmit={invoiceForm.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Invoice Header */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={invoiceForm.control}
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
                                
                                {customersLoading ? (
                                  <SelectItem value="" disabled>Loading customers...</SelectItem>
                                ) : allCustomers.length === 0 ? (
                                  <SelectItem value="" disabled>No customers found</SelectItem>
                                ) : (
                                  <>
                                    <div className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border-t border-b">
                                      CUSTOMERS ({allCustomers.length})
                                    </div>
                                    {allCustomers.map((customer) => (
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
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={invoiceForm.control}
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

                      <FormField
                        control={invoiceForm.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Coupon Redemption Section */}
                    <div className="border rounded-lg p-4 bg-green-50">
                      <h3 className="text-lg font-medium text-green-800 mb-4 flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        Coupon Redemption
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={invoiceForm.control}
                          name="appliedCouponCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Coupon Code</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter coupon code" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={invoiceForm.control}
                          name="serviceType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select service type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="eye_exam">Eye Exam</SelectItem>
                                  <SelectItem value="glasses">Glasses</SelectItem>
                                  <SelectItem value="contact_lenses">Contact Lenses</SelectItem>
                                  <SelectItem value="surgery">Surgery</SelectItem>
                                  <SelectItem value="treatment">Treatment</SelectItem>
                                  <SelectItem value="consultation">Consultation</SelectItem>
                                  <SelectItem value="diagnostic">Diagnostic Tests</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={invoiceForm.control}
                          name="couponDiscountAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Coupon Amount ($)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                  placeholder="0.00"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Add Items Section */}
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium mb-4">Invoice Items</h3>
                      
                      <Form {...itemForm}>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                          <FormField
                            control={itemForm.control}
                            name="productId"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel className="flex items-center justify-between">
                                  <span>Product</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={async () => {
                                      // Force complete cache invalidation and refetch
                                      queryClient.removeQueries({ queryKey: ["/api/products"] });
                                      queryClient.removeQueries({ queryKey: ["/api/store-inventory"] });
                                      await Promise.all([
                                        queryClient.refetchQueries({ queryKey: ["/api/products"] }),
                                        queryClient.refetchQueries({ queryKey: ["/api/store-inventory"] })
                                      ]);
                                      // Also manually refetch with fresh timestamps
                                      await Promise.all([refetchProducts(), refetchInventory()]);
                                      toast({
                                        title: "Products Refreshed",
                                        description: "Product list and inventory completely refreshed with latest items.",
                                      });
                                    }}
                                    className="h-6 px-2 text-xs"
                                  >
                                    🔄 Refresh
                                  </Button>
                                </FormLabel>
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
                                          ? products.find(product => product.id === field.value)?.name || "Select product"
                                          : "Select product"}
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0 max-h-[400px]">
                                    <Command>
                                      <CommandInput 
                                        placeholder="Search products..." 
                                        value={productSearchTerm}
                                        onValueChange={setProductSearchTerm}
                                      />
                                      <CommandEmpty>
                                        {productsLoading ? "Loading products..." : `No products found. (Total available: ${products.length})`}
                                      </CommandEmpty>
                                      <ScrollArea className="h-[300px]">
                                        <CommandGroup>
                                        <CommandItem
                                          value="custom"
                                          onSelect={() => {
                                            field.onChange("custom");
                                            itemForm.setValue("unitPrice", 0);
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
                                          <div className="px-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50 border-t border-b">
                                            🔄 LOADED PRODUCTS: {products.length} total 
                                            {productsLoading ? " (Loading...)" : " (Ready)"}
                                          </div>
                                        )}
                                        
                                        {products
                                          .filter(product => {
                                            if (!productSearchTerm) return true; // Show all if no search term
                                            return product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                                                   (product.category && product.category.toLowerCase().includes(productSearchTerm.toLowerCase()));
                                          })
                                          .map((product) => {
                                            // Find stock for this product in inventory
                                            const inventoryItem = Array.isArray(inventory) ? inventory.find(
                                              (productInventory: any) => productInventory.productId === product.id
                                            ) : null;
                                            const stockLevel = inventoryItem?.quantity || 0;
                                            const stockStatus = stockLevel === 0 ? 'Out of Stock' : 
                                                              stockLevel < 10 ? 'Low Stock' : 'In Stock';
                                            const stockColor = stockLevel === 0 ? 'text-red-600' : 
                                                             stockLevel < 10 ? 'text-orange-600' : 'text-green-600';
                                            const isOutOfStock = stockLevel === 0;
                                            
                                            return (
                                              <CommandItem
                                                key={product.id}
                                                value={`${product.name} ${product.category || ''}`}
                                                disabled={isOutOfStock}
                                                onSelect={() => {
                                                  if (!isOutOfStock) {
                                                    field.onChange(product.id);
                                                    itemForm.setValue("unitPrice", Number(product.price));
                                                    setProductSearchOpen(false);
                                                    setProductSearchTerm("");
                                                  }
                                                }}
                                                className={isOutOfStock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                              >
                                                <Check
                                                  className={`mr-2 h-4 w-4 ${
                                                    field.value === product.id ? "opacity-100" : "opacity-0"
                                                  }`}
                                                />
                                                <div className="flex items-center justify-between w-full">
                                                  <div className="flex flex-col">
                                                    <span className="font-medium">{product.name}</span>
                                                    <span className="text-sm text-gray-500">
                                                      ${Number(product.price).toFixed(2)}
                                                    </span>
                                                  </div>
                                                  <div className="flex flex-col items-end">
                                                    <span className={`text-xs font-medium ${stockColor}`}>
                                                      {stockStatus}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                      Stock: {stockLevel}
                                                    </span>
                                                  </div>
                                                </div>
                                              </CommandItem>
                                            );
                                          })}
                                        </CommandGroup>
                                      </ScrollArea>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Custom Product Name Field */}
                          {itemForm.watch("productId") === "custom" && (
                            <FormField
                              control={itemForm.control}
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
                            control={itemForm.control}
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
                            control={itemForm.control}
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
                            control={itemForm.control}
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
                              onClick={itemForm.handleSubmit(addItem)}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add
                            </Button>
                          </div>
                        </div>
                      </Form>

                      {/* Items List */}
                      {invoiceItems.length > 0 && (
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
                              {invoiceItems.map((item) => (
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
                                      onClick={() => removeItem(item.id)}
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

                    {/* Invoice Totals */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={invoiceForm.control}
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
                            control={invoiceForm.control}
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
                          control={invoiceForm.control}
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
                          control={invoiceForm.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
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
                        {couponDiscountAmount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Coupon Discount:</span>
                            <span>-${couponDiscountAmount.toFixed(2)}</span>
                          </div>
                        )}
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
                      <Button variant="outline" onClick={() => setInvoiceDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createInvoiceMutation.isPending}>
                        {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{Array.isArray(invoices) ? invoices.length : 0}</p>
                    <p className="text-xs text-slate-500">Total Invoices</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">${Array.isArray(invoices) ? invoices.filter((i: any) => i.status === 'paid').reduce((sum: number, i: any) => sum + i.total, 0).toLocaleString() : '0'}</p>
                    <p className="text-xs text-slate-500">Paid Amount</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{Array.isArray(invoices) ? invoices.filter((i: any) => i.status === 'overdue').length : 0}</p>
                    <p className="text-xs text-slate-500">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Receipt className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">${Array.isArray(invoices) ? invoices.filter((i: any) => i.status === 'sent').reduce((sum: number, i: any) => sum + i.total, 0).toLocaleString() : '0'}</p>
                    <p className="text-xs text-slate-500">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Invoices Table with Pagination, Filtering, and Sorting */}
          <EnhancedDataTable
            data={filteredInvoices}
            columns={invoiceColumns}
            title="Invoice Management"
            searchPlaceholder="Search invoices by invoice number, customer name, or store..."
            isLoading={invoicesLoading}
            onRefresh={refetchInvoices}
            onView={(invoice) => setSelectedInvoice(invoice)}
            onEdit={(invoice) => {
              // TODO: Implement edit functionality
              console.log("Edit invoice:", invoice);
            }}
            actions={(invoice) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedInvoice(invoice)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <QrCode className="h-4 w-4 mr-2" />
                    Show QR Code
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Send className="h-4 w-4 mr-2" />
                    Send to Customer
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            pageSize={10}
            showPagination={true}
            emptyMessage="No invoices found. Create your first invoice to get started."
            totalCount={filteredInvoices.length}
          />

          {/* Invoice Preview Dialog */}
          {selectedInvoice && (
            <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Invoice {selectedInvoice.invoiceNumber}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Invoice Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">INVOICE</h2>
                      <p className="text-lg">{selectedInvoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Store: {selectedInvoice.storeName}</p>
                      <p>Date: {new Date(selectedInvoice.date).toLocaleDateString()}</p>
                      <p>Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h3 className="font-medium mb-2">Bill To:</h3>
                    <p className="font-medium">{selectedInvoice.customerName}</p>
                  </div>

                  {/* Items Table */}
                  <div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                            <TableCell>${item.total.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-between">
                    <div className="w-1/2">
                      <QRCodeReact 
                        value={generateInvoiceQR(selectedInvoice)} 
                        size={128}
                        className="border p-2"
                      />
                      <p className="text-xs text-slate-500 mt-2">Scan for payment</p>
                    </div>
                    <div className="w-1/2 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-${selectedInvoice.discountAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>${selectedInvoice.taxAmount.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${selectedInvoice.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => generateProfessionalInvoice(selectedInvoice)}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => generatePDF(selectedInvoice)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.share?.({
                            title: `Invoice ${selectedInvoice.invoiceNumber}`,
                            text: `Invoice ${selectedInvoice.invoiceNumber} - $${selectedInvoice.total.toFixed(2)}`,
                            url: window.location.href
                          }) || navigator.clipboard.writeText(window.location.href);
                          toast({
                            title: "Share Link Copied",
                            description: "Invoice link copied to clipboard",
                          });
                        }}
                      >
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                    
                    {/* Payment Status Action */}
                    {selectedInvoice.status !== 'paid' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Status Updated",
                            description: "Invoice marked as paid",
                          });
                        }}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Mark as Paid
                      </Button>
                    )}
                    
                    {selectedInvoice.status === 'paid' && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Paid
                      </Badge>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Professional Invoice Template Preview */}
          {showInvoicePreview && selectedInvoice && (
            <ProfessionalInvoiceTemplate
              invoice={{
                ...selectedInvoice,
                discount: selectedInvoice?.discountAmount || 0,
                appliedCouponCode: (selectedInvoice as any)?.appliedCouponCode,
                couponDiscount: (selectedInvoice as any)?.couponDiscount || 0
              }}
              storeName={stores?.find(s => s.id === selectedInvoice?.storeId)?.name || 'OptiStore Pro'}
              storeAddress="123 Vision Street, Eyecare City, EC 12345"
              storePhone="(555) 123-4567"
              storeEmail="billing@optistorepro.com"
              onClose={() => setShowInvoicePreview(false)}
            />
          )}
        </div>
      </main>
    </>
  );
}
