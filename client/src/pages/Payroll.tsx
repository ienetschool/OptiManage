import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  DollarSign,
  Calculator,
  User,
  Calendar,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { z } from "zod";

const payrollSchema = z.object({
  staffId: z.string().min(1, "Staff member is required"),
  payPeriodStart: z.string().min(1, "Pay period start is required"),
  payPeriodEnd: z.string().min(1, "Pay period end is required"),
  baseSalary: z.number().min(0, "Base salary must be positive"),
  hoursWorked: z.number().min(0, "Hours worked must be positive"),
  overtimeHours: z.number().min(0, "Overtime hours must be positive"),
  bonuses: z.number().min(0, "Bonuses must be positive"),
  deductions: z.number().min(0, "Deductions must be positive"),
  taxDeductions: z.number().min(0, "Tax deductions must be positive"),
});

type PayrollFormData = z.infer<typeof payrollSchema>;

interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  position: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  baseSalary: number;
  hoursWorked: number;
  overtimeHours: number;
  hourlyRate: number;
  overtimeRate: number;
  grossPay: number;
  bonuses: number;
  deductions: number;
  taxDeductions: number;
  netPay: number;
  status: 'draft' | 'processed' | 'paid';
  processedDate?: string;
  paidDate?: string;
}

interface PayrollSummary {
  totalGrossPay: number;
  totalNetPay: number;
  totalTaxes: number;
  totalDeductions: number;
  employeeCount: number;
  avgGrossPay: number;
}

export default function Payroll() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("payroll");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data
  const { data: payrollRecords = [], isLoading } = useQuery<PayrollRecord[]>({
    queryKey: ["/api/payroll", selectedPeriod, selectedStatus],
    queryFn: async () => {
      // Mock data for demonstration
      return [
        {
          id: '1',
          staffId: '1',
          staffName: 'John Smith',
          position: 'Receptionist',
          payPeriodStart: '2025-01-01',
          payPeriodEnd: '2025-01-31',
          baseSalary: 3000,
          hoursWorked: 160,
          overtimeHours: 10,
          hourlyRate: 18.75,
          overtimeRate: 28.13,
          grossPay: 3281.25,
          bonuses: 200,
          deductions: 150,
          taxDeductions: 524.50,
          netPay: 2806.75,
          status: 'paid',
          processedDate: '2025-01-31',
          paidDate: '2025-02-01'
        },
        {
          id: '2',
          staffId: '2',
          staffName: 'Sarah Johnson',
          position: 'Nurse',
          payPeriodStart: '2025-01-01',
          payPeriodEnd: '2025-01-31',
          baseSalary: 4500,
          hoursWorked: 160,
          overtimeHours: 15,
          hourlyRate: 28.13,
          overtimeRate: 42.20,
          grossPay: 5133.00,
          bonuses: 300,
          deductions: 100,
          taxDeductions: 821.28,
          netPay: 4511.72,
          status: 'processed',
          processedDate: '2025-01-31'
        }
      ];
    }
  });

  const { data: staffList = [] } = useQuery({
    queryKey: ["/api/staff"],
    queryFn: async () => {
      return [
        { id: '1', firstName: 'John', lastName: 'Smith', position: 'Receptionist', hourlyRate: 18.75 },
        { id: '2', firstName: 'Sarah', lastName: 'Johnson', position: 'Nurse', hourlyRate: 28.13 },
        { id: '3', firstName: 'Michael', lastName: 'Chen', position: 'Technician', hourlyRate: 22.50 }
      ];
    }
  });

  const form = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      staffId: "",
      payPeriodStart: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      payPeriodEnd: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
      baseSalary: 0,
      hoursWorked: 0,
      overtimeHours: 0,
      bonuses: 0,
      deductions: 0,
      taxDeductions: 0,
    },
  });

  const createPayrollMutation = useMutation({
    mutationFn: async (data: PayrollFormData) => {
      await apiRequest("POST", "/api/payroll", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Payroll record created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create payroll record.",
        variant: "destructive",
      });
    },
  });

  const processPayrollMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/payroll/${id}/process`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({
        title: "Success",
        description: "Payroll processed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to process payroll.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PayrollFormData) => {
    createPayrollMutation.mutate(data);
  };

  const handleProcessPayroll = (id: string) => {
    processPayrollMutation.mutate(id);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'processed': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4 text-gray-600" />;
      case 'processed': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredPayroll = payrollRecords.filter(record => {
    const matchesSearch = record.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate summary
  const payrollSummary: PayrollSummary = {
    totalGrossPay: filteredPayroll.reduce((sum, record) => sum + record.grossPay, 0),
    totalNetPay: filteredPayroll.reduce((sum, record) => sum + record.netPay, 0),
    totalTaxes: filteredPayroll.reduce((sum, record) => sum + record.taxDeductions, 0),
    totalDeductions: filteredPayroll.reduce((sum, record) => sum + record.deductions, 0),
    employeeCount: filteredPayroll.length,
    avgGrossPay: filteredPayroll.length > 0 ? filteredPayroll.reduce((sum, record) => sum + record.grossPay, 0) / filteredPayroll.length : 0,
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading payroll data...</p>
        </div>
      </div>
    );
  }

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
                    <p className="text-sm font-medium text-slate-600">Total Gross Pay</p>
                    <p className="text-2xl font-bold text-slate-900">${payrollSummary.totalGrossPay.toLocaleString()}</p>
                    <p className="text-xs text-blue-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Before deductions
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="text-blue-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Net Pay</p>
                    <p className="text-2xl font-bold text-slate-900">${payrollSummary.totalNetPay.toLocaleString()}</p>
                    <p className="text-xs text-green-600">After deductions</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Calculator className="text-green-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Taxes</p>
                    <p className="text-2xl font-bold text-slate-900">${payrollSummary.totalTaxes.toLocaleString()}</p>
                    <p className="text-xs text-red-600">Tax withholdings</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <FileText className="text-red-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Employees</p>
                    <p className="text-2xl font-bold text-slate-900">{payrollSummary.employeeCount}</p>
                    <p className="text-xs text-purple-600">On payroll</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <User className="text-purple-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="payroll">Payroll Records</TabsTrigger>
              <TabsTrigger value="processing">Bulk Processing</TabsTrigger>
              <TabsTrigger value="reports">Payroll Reports</TabsTrigger>
            </TabsList>

            {/* Payroll Records Tab */}
            <TabsContent value="payroll" className="space-y-6">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  
                  <Input
                    type="month"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-40"
                  />
                  
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="processed">Processed</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Payroll
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Payroll Record</DialogTitle>
                    </DialogHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="staffId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Staff Member</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select staff member" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {staffList.map((staff) => (
                                    <SelectItem key={staff.id} value={staff.id}>
                                      {staff.firstName} {staff.lastName} - {staff.position}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="payPeriodStart"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pay Period Start</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="payPeriodEnd"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pay Period End</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="baseSalary"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Base Salary</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="hoursWorked"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Hours Worked</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.5" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="overtimeHours"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Overtime Hours</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.5" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="bonuses"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bonuses</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="deductions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Deductions</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="taxDeductions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tax Deductions</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-2 pt-4 border-t">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={createPayrollMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {createPayrollMutation.isPending ? "Creating..." : "Create Payroll"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Payroll Table */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle>Payroll Records</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredPayroll.length === 0 ? (
                    <div className="text-center py-12">
                      <Calculator className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No payroll records found</h3>
                      <p className="text-slate-600 mb-6">No payroll records match your current filters.</p>
                      <Button 
                        onClick={() => setOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Payroll
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Pay Period</TableHead>
                            <TableHead>Hours</TableHead>
                            <TableHead>Gross Pay</TableHead>
                            <TableHead>Deductions</TableHead>
                            <TableHead>Net Pay</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPayroll.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <User className="h-8 w-8 text-slate-400" />
                                  <div>
                                    <p className="font-medium">{record.staffName}</p>
                                    <p className="text-sm text-slate-500">{record.position}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p>{format(new Date(record.payPeriodStart), 'MMM dd')} - {format(new Date(record.payPeriodEnd), 'MMM dd, yyyy')}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p>Regular: {record.hoursWorked}h</p>
                                  {record.overtimeHours > 0 && (
                                    <p className="text-sm text-amber-600">OT: {record.overtimeHours}h</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">${record.grossPay.toLocaleString()}</p>
                                  {record.bonuses > 0 && (
                                    <p className="text-sm text-green-600">+${record.bonuses} bonus</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p>Tax: ${record.taxDeductions.toLocaleString()}</p>
                                  <p>Other: ${record.deductions.toLocaleString()}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="font-medium text-green-600">${record.netPay.toLocaleString()}</p>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(record.status)}
                                  <Badge className={getStatusBadgeColor(record.status)}>
                                    {record.status}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Download className="h-3 w-3" />
                                  </Button>
                                  {record.status === 'draft' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleProcessPayroll(record.id)}
                                      disabled={processPayrollMutation.isPending}
                                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                    </Button>
                                  )}
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
            </TabsContent>

            {/* Bulk Processing Tab */}
            <TabsContent value="processing" className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle>Bulk Payroll Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Calculator className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Bulk Processing</h3>
                    <p className="text-slate-600">Process multiple payroll records at once and generate batch reports.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle>Payroll Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Payroll Reports</h3>
                    <p className="text-slate-600">Generate detailed payroll reports, tax summaries, and compliance documents.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}