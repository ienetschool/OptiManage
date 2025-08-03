import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  DollarSign, 
  User, 
  Search, 
  Plus,
  Download,
  Calculator,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  Users,
  Eye,
  Edit,
  Printer
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Payroll() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [open, setOpen] = useState(false);
  const [bulkPayrollOpen, setBulkPayrollOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["/api/staff"],
  });

  const { data: payrollData = [] } = useQuery({
    queryKey: ["/api/payroll", selectedMonth],
  });

  const createPayrollMutation = useMutation({
    mutationFn: async (data: any) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({
        title: "Payroll Created",
        description: "Payroll record has been created successfully.",
      });
      setOpen(false);
    },
  });

  const bulkPayrollMutation = useMutation({
    mutationFn: async (data: any) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({
        title: "Bulk Payroll Generated",
        description: "Payroll has been generated for all eligible staff members.",
      });
      setBulkPayrollOpen(false);
    },
  });

  // Mock payroll data
  const mockPayroll = [
    {
      id: "1",
      staffId: "staff-1",
      staffName: "Dr. Sarah Johnson",
      staffCode: "EMP001",
      position: "Senior Optometrist",
      payPeriod: "January 2025",
      basicSalary: 75000,
      allowances: 15000,
      overtime: 2500,
      grossSalary: 92500,
      deductions: 18500,
      netSalary: 74000,
      workingDays: 22,
      presentDays: 22,
      overtimeHours: 10,
      status: "approved"
    },
    {
      id: "2",
      staffId: "staff-2", 
      staffName: "Michael Chen",
      staffCode: "EMP002",
      position: "Store Manager",
      payPeriod: "January 2025",
      basicSalary: 60000,
      allowances: 12000,
      overtime: 1800,
      grossSalary: 73800,
      deductions: 14760,
      netSalary: 59040,
      workingDays: 22,
      presentDays: 21,
      overtimeHours: 6,
      status: "pending"
    },
    {
      id: "3",
      staffId: "staff-3",
      staffName: "Emma Wilson", 
      staffCode: "EMP003",
      position: "Sales Associate",
      payPeriod: "January 2025",
      basicSalary: 35000,
      allowances: 5000,
      overtime: 0,
      grossSalary: 40000,
      deductions: 8000,
      netSalary: 32000,
      workingDays: 22,
      presentDays: 20,
      overtimeHours: 0,
      status: "draft"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'paid':
        return <Badge className="bg-blue-100 text-blue-800">Paid</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const calculateAutoValues = (staffMember: any) => {
    // Auto-calculate based on staff data, attendance, and working hours
    const basicSalary = staffMember?.basicSalary || 50000;
    const allowances = (staffMember?.houseAllowance || 0) + (staffMember?.transportAllowance || 0) + (staffMember?.medicalAllowance || 0);
    const workingDays = 22; // From attendance data
    const presentDays = 21; // From attendance data  
    const overtimeHours = 8; // From attendance data
    const overtimeRate = 1.5;
    const hourlyRate = basicSalary / (workingDays * 8);
    const overtime = overtimeHours * hourlyRate * overtimeRate;
    const grossSalary = basicSalary + allowances + overtime;
    const deductions = grossSalary * 0.2; // 20% total deductions
    const netSalary = grossSalary - deductions;

    return {
      basicSalary,
      allowances,
      overtime,
      grossSalary,
      deductions,
      netSalary,
      workingDays,
      presentDays,
      overtimeHours
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payroll Management</h1>
          <p className="text-slate-600">Manage staff payroll, salaries, and compensation</p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={bulkPayrollOpen} onOpenChange={setBulkPayrollOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Bulk Payroll
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Bulk Payroll</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 p-4">
                <div>
                  <label className="text-sm font-medium">Pay Period</label>
                  <Input type="month" defaultValue={selectedMonth} />
                </div>
                <div>
                  <label className="text-sm font-medium">Staff Selection</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>All Active Staff</option>
                    <option>Permanent Staff Only</option>
                    <option>Contract Staff Only</option>
                  </select>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    This will generate payroll for all selected staff members using their 
                    current salary settings, attendance data, and working hours.
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setBulkPayrollOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => bulkPayrollMutation.mutate({ month: selectedMonth })}
                    disabled={bulkPayrollMutation.isPending}
                  >
                    {bulkPayrollMutation.isPending ? "Generating..." : "Generate Payroll"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Payroll
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Payroll</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Staff Member</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Select staff member</option>
                      {Array.isArray(staff) && staff.map((member: any) => (
                        <option key={member.id} value={member.id}>
                          {member.firstName} {member.lastName} ({member.staffCode})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Pay Period</label>
                    <Input type="month" defaultValue={selectedMonth} />
                  </div>
                </div>

                {/* Auto-calculated values section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">Auto-calculated Values</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Working Days</label>
                      <Input type="number" value="22" disabled className="bg-white" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Present Days</label>
                      <Input type="number" value="21" disabled className="bg-white" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Overtime Hours</label>
                      <Input type="number" value="8" disabled className="bg-white" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Basic Salary</label>
                    <Input type="number" placeholder="50000" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total Allowances</label>
                    <Input type="number" placeholder="10000" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Overtime Amount</label>
                    <Input type="number" placeholder="2500" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Gross Salary</label>
                    <Input type="number" placeholder="62500" disabled className="bg-green-50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total Deductions</label>
                    <Input type="number" placeholder="12500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Net Salary</label>
                    <Input type="number" placeholder="50000" disabled className="bg-blue-50 font-bold" />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => createPayrollMutation.mutate({})}>
                    Create Payroll
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Payroll</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${mockPayroll.reduce((sum, p) => sum + p.netSalary, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Processed</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockPayroll.filter(p => p.status === 'approved').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {mockPayroll.filter(p => p.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Staff Count</p>
                <p className="text-2xl font-bold text-slate-900">{mockPayroll.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Month</TabsTrigger>
          <TabsTrigger value="history">Payroll History</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search staff by name or employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div>
                  <Input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payroll Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Payroll for {format(new Date(selectedMonth), 'MMMM yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPayroll.map((payroll) => (
                  <div key={payroll.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {payroll.staffName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-slate-900">{payroll.staffName}</h4>
                          <p className="text-sm text-slate-600">{payroll.staffCode} • {payroll.position}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm font-medium text-slate-600">Gross Salary</p>
                          <p className="text-lg font-semibold">${payroll.grossSalary.toLocaleString()}</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm font-medium text-slate-600">Deductions</p>
                          <p className="text-lg font-semibold text-red-600">-${payroll.deductions.toLocaleString()}</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm font-medium text-slate-600">Net Salary</p>
                          <p className="text-xl font-bold text-green-600">${payroll.netSalary.toLocaleString()}</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm font-medium text-slate-600">Status</p>
                          {getStatusBadge(payroll.status)}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Detailed breakdown */}
                    <div className="mt-4 pt-4 border-t grid grid-cols-6 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Working Days:</span>
                        <span className="ml-1 font-medium">{payroll.workingDays}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Present:</span>
                        <span className="ml-1 font-medium">{payroll.presentDays}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Basic:</span>
                        <span className="ml-1 font-medium">${payroll.basicSalary.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Allowances:</span>
                        <span className="ml-1 font-medium">${payroll.allowances.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Overtime:</span>
                        <span className="ml-1 font-medium">${payroll.overtime.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">OT Hours:</span>
                        <span className="ml-1 font-medium">{payroll.overtimeHours}h</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Payroll history and previous months will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Report Type</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Monthly Payroll Summary</option>
                    <option>Department-wise Report</option>
                    <option>Individual Payslips</option>
                    <option>Tax Summary Report</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Period</label>
                  <Input type="month" defaultValue={selectedMonth} />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}