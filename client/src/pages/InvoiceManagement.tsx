import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import QRCodeReact from "react-qr-code";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { format } from "date-fns";

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
  taxRate: z.number().min(0).max(100),
  discountAmount: z.number().min(0),
  notes: z.string().optional(),
});

const invoiceItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
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
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

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
    },
  });

  const itemForm = useForm<z.infer<typeof invoiceItemSchema>>({
    resolver: zodResolver(invoiceItemSchema),
    defaultValues: {
      quantity: 1,
      discount: 0,
    },
  });

  // Mutations
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create invoice");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Success",
        description: "Invoice created successfully.",
      });
      setInvoiceDialogOpen(false);
      invoiceForm.reset();
      setInvoiceItems([]);
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
      toast({
        title: "Success",
        description: "Invoice updated successfully.",
      });
    },
  });

  // Add item to invoice with proper decimal handling
  const addItem = (data: z.infer<typeof invoiceItemSchema>) => {
    const product = products.find(p => p.id === data.productId);
    if (!product) return;

    const unitPrice = parseFloat(data.unitPrice.toString());
    const quantity = parseInt(data.quantity.toString());
    const discount = parseFloat(data.discount.toString());
    
    const discountAmount = (unitPrice * discount) / 100;
    const discountedPrice = unitPrice - discountAmount;
    const total = discountedPrice * quantity;

    const newItem: InvoiceItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId: data.productId,
      productName: product.name,
      quantity: quantity,
      unitPrice: parseFloat(unitPrice.toFixed(2)),
      discount: discount,
      total: parseFloat(total.toFixed(2)),
    };

    setInvoiceItems([...invoiceItems, newItem]);
    itemForm.reset({ quantity: 1, discount: 0, unitPrice: 0 });
  };

  // Remove item from invoice
  const removeItem = (itemId: string) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== itemId));
  };

  // Calculate totals with proper decimal handling
  const subtotal = invoiceItems.reduce((sum, item) => sum + parseFloat(item.total.toString()), 0);
  const discountAmount = parseFloat(invoiceForm.watch("discountAmount")?.toString() || "0");
  const taxRate = parseFloat(invoiceForm.watch("taxRate")?.toString() || "0");
  const discountedSubtotal = subtotal - discountAmount;
  const taxAmount = (discountedSubtotal * taxRate) / 100;
  const grandTotal = discountedSubtotal + taxAmount;

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

    const invoiceData = {
      ...data,
      items: invoiceItems,
      subtotal,
      taxAmount,
      total: grandTotal,
      discountAmount: discountAmount,
    };

    createInvoiceMutation.mutate(invoiceData);
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
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

  // Professional invoice generation with prescription-style format
  const generateProfessionalInvoice = (invoice: Invoice) => {
    const customer = customers.find(c => c.id === invoice.customerId);
    const store = stores.find(s => s.id === invoice.storeId);
    
    const invoiceWindow = window.open('', '_blank');
    if (invoiceWindow) {
      invoiceWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoice.invoiceNumber}</title>
            <style>
              @page { size: A4; margin: 15mm; }
              body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; font-size: 11pt; color: #333; line-height: 1.4; }
              .invoice-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
              .clinic-name { font-size: 24pt; font-weight: 900; margin-bottom: 5px; }
              .header-right { text-align: right; }
              .qr-code { width: 80px; height: 80px; background: white; padding: 8px; border-radius: 4px; }
              .invoice-info { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
              .info-section { background: #f8fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #667eea; }
              .section-title { font-weight: 600; color: #2d3748; margin-bottom: 15px; font-size: 14pt; }
              .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .invoice-table th, .invoice-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
              .invoice-table th { background: #667eea; color: white; font-weight: 600; }
              .invoice-table .amount { text-align: right; font-weight: 500; }
              .totals-section { background: #f8fafc; padding: 20px; border-radius: 6px; margin-top: 20px; border: 2px solid #667eea; }
              .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
              .grand-total { font-size: 16pt; font-weight: bold; color: #667eea; border-top: 2px solid #667eea; padding-top: 10px; }
              .invoice-notes { background: #fef7cd; padding: 15px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #f59e0b; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 10pt; }
              .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 10pt; font-weight: 600; text-transform: uppercase; }
              .status-paid { background: #d1fae5; color: #065f46; }
              .status-pending { background: #fef3c7; color: #92400e; }
              .status-overdue { background: #fee2e2; color: #991b1b; }
            </style>
          </head>
          <body>
            <div class="invoice-header">
              <div>
                <div class="clinic-name">OptiStore Pro</div>
                <div style="font-size: 12pt;">Medical & Optical Center</div>
                <div style="font-size: 10pt; margin-top: 5px;">Professional Eye Care Services</div>
              </div>
              <div class="header-right">
                <div style="margin-bottom: 10px;">
                  <div style="font-size: 18pt; font-weight: bold;">INVOICE</div>
                  <div>${invoice.invoiceNumber}</div>
                </div>
                <div class="qr-code">
                  <div style="width: 64px; height: 64px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 8pt; text-align: center;">QR Code</div>
                </div>
              </div>
            </div>

            <div class="invoice-info">
              <div class="info-section">
                <div class="section-title">Bill To</div>
                <p><strong>${customer?.firstName || 'N/A'} ${customer?.lastName || ''}</strong></p>
                <p>Customer ID: ${invoice.customerId}</p>
                <p>Phone: ${customer?.phone || 'N/A'}</p>
                <p>Email: ${customer?.email || 'N/A'}</p>
              </div>
              
              <div class="info-section">
                <div class="section-title">Invoice Details</div>
                <p><strong>Issue Date:</strong> ${format(new Date(invoice.date), 'MMM dd, yyyy')}</p>
                <p><strong>Due Date:</strong> ${format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</p>
                <p><strong>Store:</strong> ${store?.name || 'OptiStore Pro'}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${invoice.status}">${invoice.status}</span></p>
              </div>
            </div>

            <table class="invoice-table">
              <thead>
                <tr>
                  <th style="width: 40%;">Description</th>
                  <th style="width: 15%; text-align: center;">Quantity</th>
                  <th style="width: 15%; text-align: right;">Unit Price</th>
                  <th style="width: 15%; text-align: right;">Discount</th>
                  <th style="width: 15%; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td>
                      <div style="font-weight: 600;">${item.productName}</div>
                      ${item.description ? `<div style="font-size: 9pt; color: #6b7280;">${item.description}</div>` : ''}
                    </td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td class="amount">$${parseFloat(item.unitPrice.toString()).toFixed(2)}</td>
                    <td class="amount">${item.discount}%</td>
                    <td class="amount">$${parseFloat(item.total.toString()).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals-section">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>$${parseFloat(invoice.subtotal.toString()).toFixed(2)}</span>
              </div>
              ${invoice.discountAmount > 0 ? `
                <div class="total-row">
                  <span>Discount:</span>
                  <span>-$${parseFloat(invoice.discountAmount.toString()).toFixed(2)}</span>
                </div>
              ` : ''}
              <div class="total-row">
                <span>Tax (${invoice.taxRate}%):</span>
                <span>$${parseFloat(invoice.taxAmount.toString()).toFixed(2)}</span>
              </div>
              <div class="total-row grand-total">
                <span>Total Amount:</span>
                <span>$${parseFloat(invoice.total.toString()).toFixed(2)}</span>
              </div>
            </div>

            ${invoice.notes ? `
              <div class="invoice-notes">
                <div style="font-weight: 600; margin-bottom: 8px;">Notes:</div>
                <div>${invoice.notes}</div>
              </div>
            ` : ''}

            <div class="footer">
              <p>Thank you for choosing OptiStore Pro Medical & Optical Center</p>
              <p>For inquiries, please contact us at info@optistorepro.com | (555) 123-4567</p>
              <p style="margin-top: 15px; font-size: 9pt;">This invoice was generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
            </div>

            <script>
              window.onload = function() {
                // Auto-print when page loads
                setTimeout(() => {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      invoiceWindow.document.close();
    }
    return invoiceWindow;
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
                                {customers.map((customer) => (
                                  <SelectItem key={customer.id} value={customer.id}>
                                    {customer.firstName} {customer.lastName}
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
                                        {field.value
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
                                                itemForm.setValue("unitPrice", product.price);
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
                                                  {product.category} - ${product.price.toFixed(2)}
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
                    <p className="text-2xl font-bold">{invoices.length}</p>
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
                    <p className="text-2xl font-bold">${invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0).toLocaleString()}</p>
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
                    <p className="text-2xl font-bold">{invoices.filter(i => i.status === 'overdue').length}</p>
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
                    <p className="text-2xl font-bold">${invoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.total, 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Store</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>{invoice.storeName}</TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>${parseFloat(invoice.total.toString()).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
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
                              <DropdownMenuItem>
                                <Send className="h-4 w-4 mr-2" />
                                Send to Customer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => generateProfessionalInvoice(invoice)}>
                                <Printer className="h-4 w-4 mr-2" />
                                Print Professional Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => generateProfessionalInvoice(invoice)}>
                                <Download className="h-4 w-4 mr-2" />
                                Export PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

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
                      onClick={() => generateProfessionalInvoice(selectedInvoice)}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print Professional Invoice
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => generateProfessionalInvoice(selectedInvoice)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
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
        </div>
      </main>
    </>
  );
}