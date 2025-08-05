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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";


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

  // Enhance invoice data with customer names
  const enrichedInvoices = React.useMemo(() => {
    if (!Array.isArray(invoices)) return [];
    return invoices.map((invoice: any) => {
      const customer = customers.find(c => c.id === invoice.customerId);
      return {
        ...invoice,
        customerName: customer ? `${customer.firstName} ${customer.lastName}` : 
                    invoice.customerName || 'Guest Customer'
      };
    });
  }, [invoices, customers]);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: stores = [] } = useQuery<{id: string; name: string}[]>({
    queryKey: ["/api/stores"],
  });

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

  // Professional A4 Invoice Generation
  const generateProfessionalInvoice = (invoice: Invoice) => {
    const customer = customers.find(c => c.id === invoice.customerId);
    const store = stores.find(s => s.id === invoice.storeId);
    
    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Professional Invoice - ${invoice.invoiceNumber}</title>
        <style>
          @page { size: A4; margin: 10mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: 'Inter', 'Segoe UI', sans-serif; 
            font-size: 11pt; 
            color: #1a202c; 
            background: white; 
            line-height: 1.5;
          }
          
          .header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
            color: white;
            padding: 30px;
            margin-bottom: 30px;
            border-radius: 12px;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 300px;
            height: 300px;
            background: rgba(255,255,255,0.08);
            border-radius: 50%;
          }
          
          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
            z-index: 1;
          }
          
          .company h1 {
            font-size: 28pt;
            font-weight: 800;
            margin-bottom: 8px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          
          .company-tagline {
            font-size: 12pt;
            opacity: 0.9;
            margin-bottom: 12px;
          }
          
          .company-address {
            font-size: 10pt;
            opacity: 0.8;
          }
          
          .invoice-info {
            text-align: right;
          }
          
          .invoice-title {
            font-size: 24pt;
            font-weight: 900;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .invoice-number {
            background: rgba(255,255,255,0.15);
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14pt;
            font-weight: 700;
            display: inline-block;
          }
          
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
            margin-bottom: 30px;
          }
          
          .detail-card {
            background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            border-left: 4px solid #3b82f6;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          }
          
          .detail-card h3 {
            color: #1e40af;
            font-size: 11pt;
            font-weight: 700;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #f1f5f9;
          }
          
          .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          
          .detail-label {
            font-weight: 600;
            color: #475569;
            font-size: 9pt;
          }
          
          .detail-value {
            color: #1e293b;
            font-weight: 500;
            font-size: 9pt;
          }
          
          .items-section {
            margin: 30px 0;
          }
          
          .section-title {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 8px 8px 0 0;
            font-size: 12pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border: 1px solid #e2e8f0;
            border-top: none;
            border-radius: 0 0 8px 8px;
            overflow: hidden;
          }
          
          .items-table th {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            color: #1e40af;
            padding: 12px;
            text-align: left;
            font-weight: 700;
            font-size: 9pt;
            text-transform: uppercase;
            border-bottom: 2px solid #cbd5e1;
          }
          
          .items-table td {
            padding: 12px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 9pt;
          }
          
          .items-table tr:nth-child(even) {
            background: #fafbfc;
          }
          
          .item-name {
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 2px;
          }
          
          .item-description {
            font-size: 8pt;
            color: #64748b;
            font-style: italic;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          .totals-section {
            display: flex;
            gap: 25px;
            margin-top: 30px;
          }
          
          .payment-info {
            flex: 1;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
          }
          
          .payment-info h4 {
            color: #1e40af;
            font-size: 11pt;
            font-weight: 700;
            margin-bottom: 12px;
            text-transform: uppercase;
          }
          
          .totals-card {
            width: 350px;
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 6px 0;
            border-bottom: 1px solid #f1f5f9;
          }
          
          .total-row:last-child {
            border-bottom: none;
          }
          
          .total-label {
            font-weight: 600;
            color: #475569;
            font-size: 10pt;
          }
          
          .total-value {
            font-weight: 700;
            color: #1e293b;
            font-family: monospace;
            font-size: 10pt;
          }
          
          .grand-total {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            margin-top: 8px;
          }
          
          .grand-total .total-label {
            color: white;
            font-size: 11pt;
            text-transform: uppercase;
          }
          
          .grand-total .total-value {
            color: white;
            font-size: 16pt;
            font-weight: 900;
          }
          
          .notes {
            margin-top: 30px;
            padding: 16px;
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #f59e0b;
            border-radius: 8px;
            border-left: 4px solid #d97706;
          }
          
          .notes-title {
            font-weight: 700;
            color: #92400e;
            margin-bottom: 6px;
            font-size: 10pt;
          }
          
          .notes-content {
            color: #78350f;
            font-size: 9pt;
          }
          
          @media print {
            body { font-size: 10pt; }
            .header { padding: 20px; }
            .detail-card { padding: 16px; }
            .totals-card { padding: 16px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-content">
            <div class="company">
              <h1>OptiStore Pro</h1>
              <div class="company-tagline">Professional Medical & Optical Center</div>
              <div class="company-address">
                123 Healthcare Blvd, Medical District<br>
                New York, NY 10001 | (555) 123-4567<br>
                info@optistorepro.com | www.optistorepro.com
              </div>
            </div>
            <div class="invoice-info">
              <div class="invoice-title">Invoice</div>
              <div class="invoice-number">${invoice.invoiceNumber}</div>
            </div>
          </div>
        </div>
        
        <div class="details-grid">
          <div class="detail-card">
            <h3>Bill To</h3>
            <div class="detail-row">
              <span class="detail-label">Customer:</span>
              <span class="detail-value">${customer?.name || invoice.customerName || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Customer ID:</span>
              <span class="detail-value">${invoice.customerId ? invoice.customerId.substring(0, 8) + '...' : 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">${customer?.phone || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${customer?.email || 'N/A'}</span>
            </div>
          </div>
          
          <div class="detail-card">
            <h3>Invoice Details</h3>
            <div class="detail-row">
              <span class="detail-label">Issue Date:</span>
              <span class="detail-value">${new Date(invoice.date).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Due Date:</span>
              <span class="detail-value">${new Date(invoice.dueDate).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Store:</span>
              <span class="detail-value">${store?.name || 'Store1'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value" style="padding: 3px 8px; background: ${invoice.status === 'paid' ? '#dcfce7' : '#fef3c7'}; color: ${invoice.status === 'paid' ? '#15803d' : '#a16207'}; border-radius: 12px; font-weight: 700; text-transform: uppercase; font-size: 8pt;">${invoice.status}</span>
            </div>
          </div>
        </div>
        
        <div class="items-section">
          <div class="section-title">Services & Products</div>
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 45%">Description</th>
                <th style="width: 10%" class="text-center">Qty</th>
                <th style="width: 15%" class="text-right">Unit Price</th>
                <th style="width: 10%" class="text-right">Discount</th>
                <th style="width: 20%" class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items && invoice.items.length > 0 ? invoice.items.map(item => `
                <tr>
                  <td>
                    <div class="item-name">${item.productName}</div>
                    ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
                  </td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">$${item.unitPrice.toFixed(2)}</td>
                  <td class="text-right">${item.discount}%</td>
                  <td class="text-right">$${item.total.toFixed(2)}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="5" style="text-align: center; padding: 25px; color: #64748b; font-style: italic;">
                    No items available for this invoice
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
        
        <div class="totals-section">
          <div class="payment-info">
            <h4>Payment Information</h4>
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value" style="text-transform: capitalize;">${invoice.paymentMethod || 'cash'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Tax Rate:</span>
              <span class="detail-value">${invoice.taxRate}%</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Currency:</span>
              <span class="detail-value">USD ($)</span>
            </div>
          </div>
          
          <div class="totals-card">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-value">$${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Discount:</span>
              <span class="total-value">-$${(invoice.discountAmount || 0).toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Tax (${invoice.taxRate}%):</span>
              <span class="total-value">$${invoice.taxAmount.toFixed(2)}</span>
            </div>
            
            <div class="grand-total">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="total-label">Total Amount</span>
                <span class="total-value">$${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        ${invoice.notes ? `
          <div class="notes">
            <div class="notes-title">Additional Notes:</div>
            <div class="notes-content">${invoice.notes}</div>
          </div>
        ` : ''}
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
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
                                          ? products.find(product => product.id === field.value)?.name || "Select product"
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
                                          <div className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border-t border-b">
                                            AVAILABLE PRODUCTS ({products.length})
                                          </div>
                                        )}
                                        
                                        {products
                                          .filter(product => 
                                            product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                                            product.category.toLowerCase().includes(productSearchTerm.toLowerCase())
                                          )
                                          .map((product) => (
                                            <CommandItem
                                              key={product.id}
                                              value={product.id}
                                              onSelect={() => {
                                                field.onChange(product.id);
                                                itemForm.setValue("unitPrice", Number(product.price));
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
                                                  {product.category} - ${Number(product.price).toFixed(2)}
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
            data={enrichedInvoices}
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
                  <DropdownMenuItem onClick={() => generateProfessionalInvoice(invoice)}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print A4 Invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => generateProfessionalInvoice(invoice)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export A4 PDF
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

                  {/* Actions */}
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline"
                      onClick={() => setShowInvoicePreview(true)}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Modern Invoice Preview
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowInvoicePreview(true)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Modern PDF
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Email Sent",
                          description: "Invoice sent to customer email",
                        });
                      }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send to Customer
                    </Button>
                    <Button
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
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Modern A4 Invoice Template Preview */}
          {showInvoicePreview && selectedInvoice && (
            <ModernA4InvoiceTemplate
              invoice={selectedInvoice}
              onClose={() => setShowInvoicePreview(false)}
            />
          )}
        </div>
      </main>
    </>
  );
}
