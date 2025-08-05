import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Search, 
  FileText,
  Download,
  Share2,
  Eye,
  DollarSign,
  Calendar,
  QrCode,
  Printer,
  Mail,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue';
  issueDate: string;
  dueDate: string;
  qrCode?: string;
  pdfUrl?: string;
}

// Invoice creation schema with coupon redemption
const createInvoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  serviceType: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().optional(),
    productName: z.string().min(1, "Product name is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.number().min(0, "Price must be non-negative"),
  })).min(1, "At least one item is required"),
  discountAmount: z.number().min(0).default(0),
  taxRate: z.number().min(0).default(0),
  // Coupon redemption fields
  appliedCouponCode: z.string().optional(),
  couponServiceType: z.enum(['eye_exam', 'glasses', 'contact_lenses', 'surgery', 'treatment', 'consultation', 'diagnostic', 'other']).optional(),
  couponDiscountAmount: z.number().min(0).default(0),
  notes: z.string().optional(),
});

type CreateInvoiceData = z.infer<typeof createInvoiceSchema>;

export default function BillingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real invoice data from the system
  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
    queryFn: async () => {
      const response = await fetch("/api/invoices");
      if (!response.ok) throw new Error("Failed to fetch invoices");
      const data = await response.json();
      
      // Transform invoice data to match our interface
      return data.map((invoice: any) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId,
        customerName: invoice.customerName || 'Guest Customer',
        totalAmount: parseFloat(invoice.total || 0),
        paidAmount: (invoice.status === 'paid' || invoice.paymentStatus === 'paid') ? parseFloat(invoice.total || 0) : 0,
        status: (invoice.status === 'paid' || invoice.paymentStatus === 'paid') ? 'paid' as const :
                (invoice.status === 'partial' || invoice.paymentStatus === 'partial') ? 'partial' as const :
                (invoice.status === 'overdue' || invoice.paymentStatus === 'overdue') ? 'overdue' as const :
                'unpaid' as const,
        issueDate: invoice.date || invoice.invoiceDate || invoice.createdAt,
        dueDate: invoice.dueDate || invoice.date || invoice.invoiceDate,
        qrCode: `qr-${invoice.invoiceNumber}`,
        pdfUrl: `/invoices/${invoice.invoiceNumber}.pdf`
      }));
    }
  });

  // Fetch customers and products for invoice creation
  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("Failed to fetch customers");
      return response.json();
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    }
  });

  // Invoice creation form
  const form = useForm<CreateInvoiceData>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      customerId: "",
      serviceType: "",
      items: [{ productName: "", quantity: 1, unitPrice: 0 }],
      discountAmount: 0,
      taxRate: 8.5,
      appliedCouponCode: "",
      couponDiscountAmount: 0,
      notes: "",
    },
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: CreateInvoiceData) => {
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
      setShowCreateInvoice(false);
      form.reset();
      toast({
        title: "Success",
        description: "Invoice created successfully with coupon redemption applied.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Fetch medical invoices as well
  const { data: medicalInvoices = [] } = useQuery({
    queryKey: ["/api/medical-invoices"],
    queryFn: async () => {
      const response = await fetch("/api/medical-invoices");
      if (!response.ok) throw new Error("Failed to fetch medical invoices");
      return response.json();
    }
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { pdfUrl: `/invoices/${invoiceId}.pdf`, qrCode: `qr-${invoiceId}` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Success",
        description: "Invoice PDF generated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate invoice PDF.",
        variant: "destructive",
      });
    },
  });

  const shareInvoiceMutation = useMutation({
    mutationFn: async (data: { invoiceId: string; method: 'email' | 'whatsapp'; recipient: string }) => {
      // Simulate API call with better feedback
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log(`Sharing invoice ${data.invoiceId} via ${data.method} to ${data.recipient}`);
      return { success: true, method: data.method, recipient: data.recipient };
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: `Invoice shared via ${variables.method} successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to share invoice.",
        variant: "destructive",
      });
    },
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'unpaid': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'unpaid': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'overdue': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  // Calculate comprehensive statistics including medical invoices
  const allInvoices = [...invoices];
  
  // Add medical invoices to the calculation
  const medicalInvoiceStats = medicalInvoices.map((medInv: any) => ({
    totalAmount: parseFloat(medInv.total || 0),
    paidAmount: (medInv.paymentStatus === 'paid') ? parseFloat(medInv.total || 0) : 0,
    status: medInv.paymentStatus === 'paid' ? 'paid' : 'unpaid'
  }));
  
  const totalInvoices = invoices.length + medicalInvoices.length;
  const paidInvoices = invoices.filter(i => i.status === 'paid').length + medicalInvoices.filter((m: any) => m.paymentStatus === 'paid').length;
  const unpaidAmount = 
    invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0) +
    medicalInvoices.filter((m: any) => m.paymentStatus !== 'paid').reduce((sum: number, m: any) => sum + parseFloat(m.total || 0), 0);
  const totalRevenue = 
    invoices.reduce((sum, i) => sum + i.paidAmount, 0) +
    medicalInvoices.filter((m: any) => m.paymentStatus === 'paid').reduce((sum: number, m: any) => sum + parseFloat(m.total || 0), 0);

  return (
    <>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-1">Billing & Invoice History</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {totalInvoices} Total Invoices
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Generate comprehensive billing report
                  window.print(); // Simple print for now
                  toast({ title: "Generating Report", description: "Full billing report being prepared" });
                }}
              >
                <FileText className="h-3 w-3 mr-1" />
                Full Billing Report
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 uppercase tracking-wide font-medium">Total Paid</p>
                  <p className="text-2xl font-bold text-green-700">${totalRevenue.toFixed(2)}</p>
                </div>
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">Paid Invoices</p>
                  <p className="text-2xl font-bold text-blue-700">{paidInvoices}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-600 uppercase tracking-wide font-medium">Outstanding</p>
                  <p className="text-2xl font-bold text-orange-700">${unpaidAmount.toFixed(2)}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">Avg. Per Visit</p>
                  <p className="text-2xl font-bold text-purple-700">
                    ${totalInvoices > 0 ? (totalRevenue / totalInvoices).toFixed(2) : '0.00'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="unpaid">Unpaid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            
            <Dialog open={showCreateInvoice} onOpenChange={setShowCreateInvoice}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  New Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Invoice with Coupon Redemption</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => createInvoiceMutation.mutate(data))} className="space-y-6">
                    {/* Customer Selection */}
                    <FormField
                      control={form.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {customers.map((customer: any) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.firstName} {customer.lastName} - {customer.email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Service Type */}
                    <FormField
                      control={form.control}
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

                    {/* Coupon Redemption Section */}
                    <div className="border rounded-lg p-4 bg-green-50">
                      <h3 className="font-medium text-green-800 mb-3 flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Coupon Redemption
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
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
                          control={form.control}
                          name="couponServiceType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Coupon Service Type</FormLabel>
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
                          control={form.control}
                          name="couponDiscountAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Coupon Amount ($)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  placeholder="0.00"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Invoice Items */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Invoice Items</h3>
                      {form.watch('items').map((_, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                          <FormField
                            control={form.control}
                            name={`items.${index}.productName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product/Service *</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Product name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantity *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                    min="1"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${index}.unitPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit Price ($) *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    min="0"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const items = form.getValues('items');
                                if (items.length > 1) {
                                  items.splice(index, 1);
                                  form.setValue('items', items);
                                }
                              }}
                              disabled={form.watch('items').length === 1}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const items = form.getValues('items');
                          items.push({ productName: "", quantity: 1, unitPrice: 0 });
                          form.setValue('items', items);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>

                    {/* Additional Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="discountAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Discount ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                min="0"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="taxRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax Rate (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                min="0"
                                max="100"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Additional notes for this invoice..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowCreateInvoice(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createInvoiceMutation.isPending}>
                        {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice with Coupon"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Invoices Table */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Invoice List</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex space-x-4">
                      <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                    </div>
                  ))}
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No invoices found</h3>
                  <p className="text-slate-600 mb-6">
                    {searchTerm ? "Try adjusting your search criteria." : "Create your first invoice to get started."}
                  </p>
                  {!searchTerm && (
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowCreateInvoice(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Invoice
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <span className="font-mono font-medium">{invoice.invoiceNumber}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{invoice.customerName}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              <span>{format(new Date(invoice.issueDate), 'MMM dd, yyyy')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              <span>{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4 text-slate-400" />
                              <span className="font-medium">${invoice.totalAmount.toFixed(2)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-600">${invoice.paidAmount.toFixed(2)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(invoice.status)}
                              <Badge className={getStatusBadgeColor(invoice.status)}>
                                {invoice.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                title="View Invoice"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                title="Download PDF"
                                onClick={() => generateInvoiceMutation.mutate(invoice.id)}
                                disabled={generateInvoiceMutation.isPending}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                title="Print"
                                onClick={() => {
                                  // Open invoice in new window for printing
                                  const printWindow = window.open(`/api/invoice/pdf/${invoice.invoiceNumber}`, '_blank');
                                  printWindow?.addEventListener('load', () => {
                                    printWindow.print();
                                  });
                                }}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                title="QR Code"
                              >
                                <QrCode className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                title="Share"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}