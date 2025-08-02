import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import EnhancedDataTable, { Column } from "@/components/EnhancedDataTable";
import { 
  Plus, 
  Search, 
  Filter,
  DollarSign,
  CreditCard,
  Banknote,
  Receipt,
  Calendar,
  User,
  Package,
  TrendingUp,
  TrendingDown,
  Eye,
  Printer
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertSaleSchema, type Sale, type InsertSale, type Product, type Customer } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Sales() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sales = [], isLoading } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Define columns for EnhancedDataTable
  const salesColumns: Column[] = [
    {
      key: 'id',
      title: 'Sale ID',
      sortable: true,
      filterable: true,
      render: (value) => (
        <div className="font-medium text-blue-600">#{value.slice(-8)}</div>
      )
    },
    {
      key: 'createdAt',
      title: 'Date & Time',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          <div className="font-medium">{format(new Date(value), 'MMM dd, yyyy')}</div>
          <div className="text-gray-500">{format(new Date(value), 'HH:mm')}</div>
        </div>
      )
    },
    {
      key: 'customerId',
      title: 'Customer',
      sortable: true,
      filterable: true,
      render: (value, sale) => {
        const customer = customers.find(c => c.id === value);
        return (
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-slate-400" />
            <span className="text-sm">
              {customer ? `${customer.firstName} ${customer.lastName}` : 'Walk-in Customer'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'paymentMethod',
      title: 'Payment Method',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'cash', label: 'Cash' },
        { value: 'card', label: 'Card' },
        { value: 'check', label: 'Check' },
        { value: 'digital', label: 'Digital' }
      ],
      render: (value) => {
        const icons = { cash: Banknote, card: CreditCard, check: Receipt, digital: DollarSign };
        const Icon = icons[value as keyof typeof icons] || DollarSign;
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4 text-slate-600" />
            <span className="text-sm capitalize">{value}</span>
          </div>
        );
      }
    },
    {
      key: 'total',
      title: 'Amount',
      sortable: true,
      render: (value) => (
        <div className="text-lg font-bold">${parseFloat(value.toString()).toFixed(2)}</div>
      )
    },
    {
      key: 'paymentStatus',
      title: 'Status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'completed', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' }
      ],
      render: (value) => (
        <Badge 
          className={
            value === 'completed' ? 'bg-emerald-100 text-emerald-800' :
            value === 'pending' ? 'bg-amber-100 text-amber-800' :
            'bg-red-100 text-red-800'
          }
        >
          {value}
        </Badge>
      )
    }
  ];

  const form = useForm<InsertSale>({
    resolver: zodResolver(insertSaleSchema),
    defaultValues: {
      storeId: "",
      customerId: undefined,
      staffId: "",
      subtotal: 0,
      taxAmount: 0,
      total: 0,
      paymentMethod: "cash",
      paymentStatus: "completed",
      notes: "",
    },
  });

  const createSaleMutation = useMutation({
    mutationFn: async (data: InsertSale) => {
      await apiRequest("POST", "/api/sales", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      toast({
        title: "Success",
        description: "Sale completed successfully.",
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process sale.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSale) => {
    createSaleMutation.mutate(data);
  };

  // Filter sales based on search and filters
  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.total.toString().includes(searchTerm) ||
                         sale.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPayment = selectedPaymentMethod === "all" || sale.paymentMethod === selectedPaymentMethod;
    
    // Add date filtering logic here based on selectedPeriod
    return matchesSearch && matchesPayment;
  });

  // Calculate summary statistics
  const totalSales = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total.toString()), 0);
  const cashSales = filteredSales.filter(s => s.paymentMethod === 'cash').length;
  const cardSales = filteredSales.filter(s => s.paymentMethod === 'card').length;
  const avgSaleAmount = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;

  const paymentMethodIcons = {
    cash: Banknote,
    card: CreditCard,
    check: Receipt,
    digital: DollarSign,
  };

  return (
    <>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Sales</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${totalSales.toFixed(2)}
                    </p>
                    <p className="text-xs text-emerald-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12.5% from last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="text-emerald-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Transactions</p>
                    <p className="text-2xl font-bold text-slate-900">{filteredSales.length}</p>
                    <p className="text-xs text-emerald-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +8.2% from last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Receipt className="text-blue-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Average Sale</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${avgSaleAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      -2.1% from last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-purple-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Cash Payments</p>
                    <p className="text-2xl font-bold text-slate-900">{cashSales}</p>
                    <p className="text-xs text-slate-500">
                      {cardSales} card payments
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Banknote className="text-amber-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="cash">Cash Only</SelectItem>
                  <SelectItem value="card">Card Only</SelectItem>
                  <SelectItem value="check">Check Only</SelectItem>
                  <SelectItem value="digital">Digital Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="mr-2 h-4 w-4" />
                  New Sale
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Process New Sale</DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select customer..." />
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
                        control={form.control}
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
                                <SelectItem value="card">💳 Credit/Debit Card</SelectItem>
                                <SelectItem value="check">📄 Check</SelectItem>
                                <SelectItem value="digital">📱 Digital Payment</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="subtotal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subtotal</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="taxAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="total"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Transaction notes..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createSaleMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {createSaleMutation.isPending ? "Processing..." : "Complete Sale"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Enhanced Sales Table with Pagination, Filtering, and Sorting */}
          <EnhancedDataTable
            data={sales}
            columns={salesColumns}
            title="Sales Management"
            searchPlaceholder="Search sales by customer, payment method, or transaction details..."
            isLoading={isLoading}
            pageSize={10}
            showPagination={true}
            totalCount={sales.length}
            emptyMessage="No sales found. Sales will appear here when transactions are processed."
            onRefresh={() => queryClient.invalidateQueries({ queryKey: ["/api/sales"] })}
            actions={(sale) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" title="View Details">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" title="Print Receipt">
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
        </div>
      </main>
    </>
  );
}