import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import EnhancedDataTable, { Column } from "@/components/EnhancedDataTable";
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download,
  Calendar,
  DollarSign,
  User,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Printer,
  Share2,
  MoreVertical,
  Send,
  Receipt
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Payment {
  id: string;
  invoiceId: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId?: string;
  paymentDate: string;
  createdAt: string;
}

export default function Payments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentMethodDialog, setPaymentMethodDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  // Define columns for EnhancedDataTable
  const paymentColumns: Column[] = [
    {
      key: 'invoiceId',
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
      key: 'amount',
      title: 'Amount',
      sortable: true,
      render: (value) => (
        <div className="text-lg font-bold">${value.toFixed(2)}</div>
      )
    },
    {
      key: 'paymentMethod',
      title: 'Method',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'cash', label: 'Cash' },
        { value: 'card', label: 'Card' },
        { value: 'check', label: 'Check' },
        { value: 'digital', label: 'Digital' }
      ],
      render: (value) => (
        <div className="capitalize text-sm">{value}</div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'completed', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' }
      ],
      render: (value) => (
        <Badge variant={getStatusBadge(value)}>
          {value}
        </Badge>
      )
    },
    {
      key: 'paymentDate',
      title: 'Date',
      sortable: true,
      render: (value) => (
        <div className="text-sm">{new Date(value).toLocaleDateString()}</div>
      )
    },
    {
      key: 'transactionId',
      title: 'Transaction ID',
      sortable: true,
      filterable: true,
      render: (value) => (
        <div className="text-xs text-gray-500 font-mono">{value}</div>
      )
    }
  ];

  // Fetch payments data with proper error handling
  const { data: payments = [], isLoading, error, refetch } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    retry: 2,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Payment processing mutation
  const processPaymentMutation = useMutation({
    mutationFn: async ({ paymentId, paymentMethod }: { paymentId: string; paymentMethod: string }) => {
      const response = await fetch(`/api/payments/${paymentId}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod }),
      });
      if (!response.ok) throw new Error("Failed to process payment");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/medical-invoices"] });
      toast({
        title: "Payment Processed",
        description: "Payment completed successfully and invoice generated.",
      });
      setPaymentMethodDialog(false);
      setSelectedPayment(null);
      setSelectedPaymentMethod("");
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default" as const,
      pending: "secondary" as const,
      failed: "destructive" as const,
      refunded: "outline" as const
    };
    return variants[status as keyof typeof variants] || "secondary";
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "card":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const completedPayments = payments.filter(p => p.status === "completed");
  const pendingPayments = payments.filter(p => p.status === "pending");

  // Payment Actions Component
  const PaymentActions = ({ payment }: { payment: Payment }) => {
    const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
    
    const handlePrintPayment = () => {
      // Generate and print payment receipt
      const printContent = `
        <html>
          <head><title>Payment Receipt - ${payment.id}</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Payment Receipt</h2>
            <p><strong>Payment ID:</strong> ${payment.id}</p>
            <p><strong>Customer:</strong> ${payment.customerName}</p>
            <p><strong>Amount:</strong> $${payment.amount.toFixed(2)}</p>
            <p><strong>Method:</strong> ${payment.paymentMethod}</p>
            <p><strong>Status:</strong> ${payment.status}</p>
            <p><strong>Date:</strong> ${new Date(payment.paymentDate).toLocaleDateString()}</p>
            ${payment.transactionId ? `<p><strong>Transaction ID:</strong> ${payment.transactionId}</p>` : ''}
          </body>
        </html>
      `;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
    };

    const handleSharePayment = () => {
      const shareData = {
        title: `Payment Receipt - ${payment.customerName}`,
        text: `Payment of $${payment.amount.toFixed(2)} from ${payment.customerName}`,
        url: window.location.href
      };
      
      if (navigator.share) {
        navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(`Payment Receipt\nCustomer: ${payment.customerName}\nAmount: $${payment.amount.toFixed(2)}\nStatus: ${payment.status}`);
        toast({
          title: "Copied to clipboard",
          description: "Payment details copied to clipboard.",
        });
      }
    };

    const handlePayNow = () => {
      if (payment.status === "pending") {
        setSelectedPayment(payment);
        setPaymentMethodDialog(true);
      }
    };

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setViewDetailsOpen(true)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePrintPayment}>
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSharePayment}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {payment.status === "pending" && (
              <DropdownMenuItem onClick={handlePayNow} className="text-green-600">
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => window.open(`mailto:${payment.customerName}?subject=Payment Receipt&body=Your payment of $${payment.amount.toFixed(2)} has been processed.`)}>
              <Send className="h-4 w-4 mr-2" />
              Email Receipt
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Payment ID</label>
                  <p className="text-sm">{payment.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Invoice ID</label>
                  <p className="text-sm">{payment.invoiceId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Customer</label>
                  <p className="text-sm">{payment.customerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Amount</label>
                  <p className="text-sm font-bold">${payment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Method</label>
                  <p className="text-sm capitalize">{payment.paymentMethod}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Status</label>
                  <Badge variant={getStatusBadge(payment.status)}>{payment.status}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Payment Date</label>
                  <p className="text-sm">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                </div>
                {payment.transactionId && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Transaction ID</label>
                    <p className="text-sm">{payment.transactionId}</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-600">Track and manage all payment transactions</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/payments"] })}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Payments</p>
                <p className="text-2xl font-bold text-slate-900">{payments.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Amount</p>
                <p className="text-2xl font-bold text-slate-900">${totalAmount.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-slate-900">{completedPayments.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-slate-900">{pendingPayments.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Payments Table with Pagination, Filtering, and Sorting */}
      <EnhancedDataTable
        data={payments}
        columns={paymentColumns}
        title="Payment Management"
        searchPlaceholder="Search payments by customer, invoice, or transaction ID..."
        isLoading={isLoading}
        onRefresh={() => {
          refetch();
          queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
        }}
        pageSize={25}
        showPagination={true}
        totalCount={payments.length}
        emptyMessage="No payments found. Payments will appear here when invoices are paid."
        actions={(payment) => (
          <div className="flex items-center gap-2">
            {payment.status === "pending" && (
              <Button 
                onClick={() => {
                  setSelectedPayment(payment);
                  setPaymentMethodDialog(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </Button>
            )}
            <PaymentActions payment={payment} />
          </div>
        )}
      />

      {/* Payment Method Selection Dialog */}
      <Dialog open={paymentMethodDialog} onOpenChange={setPaymentMethodDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Processing payment for {selectedPayment?.customerName} - ${selectedPayment?.amount.toFixed(2)}
            </p>
            <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Choose payment method..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setPaymentMethodDialog(false);
                  setSelectedPayment(null);
                  setSelectedPaymentMethod("");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (selectedPayment && selectedPaymentMethod) {
                    processPaymentMutation.mutate({
                      paymentId: selectedPayment.id,
                      paymentMethod: selectedPaymentMethod
                    });
                  }
                }}
                disabled={!selectedPaymentMethod || processPaymentMutation.isPending}
              >
                {processPaymentMutation.isPending ? "Processing..." : "Process Payment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}