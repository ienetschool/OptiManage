import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import QRCode from "react-qr-code";
import { apiRequest } from "@/lib/queryClient";

export default function Payroll() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [open, setOpen] = useState(false);
  const [bulkPayrollOpen, setBulkPayrollOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);
  const [editPayroll, setEditPayroll] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["/api/staff"],
  });

  const { data: payrollData = [] } = useQuery({
    queryKey: ["/api/payroll"],
  });

  const createPayrollMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/payroll", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({
        title: "Payroll Created",
        description: "Payroll record has been created successfully.",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create payroll record.",
        variant: "destructive",
      });
    },
  });

  const updatePayrollMutation = useMutation({
    mutationFn: async (data: { id: string; updates: any }) => {
      const response = await apiRequest("PUT", `/api/payroll/${data.id}`, data.updates);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({
        title: "Payment Processed",
        description: "Payroll payment has been processed successfully.",
      });
      setEditPayroll(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process payment.",
        variant: "destructive",
      });
    },
  });

  const bulkPayrollMutation = useMutation({
    mutationFn: async (data: any) => {
      // Generate payroll for all active staff
      const promises = staff.filter(s => s.status === 'active').map(staffMember => {
        const autoValues = calculateAutoValues(staffMember);
        return apiRequest("POST", "/api/payroll", {
          staffId: staffMember.id,
          payMonth: new Date().getMonth() + 1,
          payYear: new Date().getFullYear(),
          basicSalary: autoValues.basicSalary,
          allowances: autoValues.allowances || {},
          overtime: autoValues.overtime,
          bonus: 0,
          deductions: autoValues.deductions || {},
          status: 'draft'
        });
      });
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({
        title: "Bulk Payroll Generated",
        description: "Payroll has been generated for all eligible staff members.",
      });
      setBulkPayrollOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate bulk payroll.",
        variant: "destructive",
      });
    },
  });

  // Transform payroll data for display
  const transformedPayrollData = payrollData.map((payroll: any) => {
    const staffMember = staff.find(s => s.id === payroll.staffId);
    return {
      id: payroll.id,
      staffId: payroll.staffId,
      staffName: staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : 'Unknown Staff',
      staffCode: staffMember?.staffCode || 'N/A',
      position: staffMember?.position || 'N/A',
      payPeriod: `${getMonthName(payroll.payMonth)} ${payroll.payYear}`,
      basicSalary: parseFloat(payroll.basicSalary || '0'),
      allowances: calculateAllowancesTotal(payroll.allowances),
      overtime: parseFloat(payroll.overtime || '0'),
      grossSalary: parseFloat(payroll.grossSalary || '0'),
      deductions: calculateDeductionsTotal(payroll.deductions),
      netSalary: parseFloat(payroll.netSalary || '0'),
      workingDays: payroll.workingDays || 22,
      presentDays: payroll.presentDays || 22,
      overtimeHours: payroll.overtimeHours || 0,
      status: payroll.status || 'draft',
      paymentMethod: payroll.paymentMethod || 'Not Set',
      generatedDate: payroll.createdAt ? format(new Date(payroll.createdAt), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      ...payroll
    };
  });

  // Helper functions for data transformation
  const getMonthName = (month: number): string => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || 'Unknown';
  };

  const calculateAllowancesTotal = (allowances: any): number => {
    if (!allowances || typeof allowances !== 'object') return 0;
    return Object.values(allowances).reduce((sum: number, val: any) => sum + (parseFloat(val) || 0), 0);
  };

  const calculateDeductionsTotal = (deductions: any): number => {
    if (!deductions || typeof deductions !== 'object') return 0;
    return Object.values(deductions).reduce((sum: number, val: any) => sum + (parseFloat(val) || 0), 0);
  };

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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return "bg-green-100 text-green-800";
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'draft':
        return "bg-gray-100 text-gray-800";
      case 'paid':
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  // Filter and sort payroll data
  const filteredPayroll = transformedPayrollData.filter(payroll => 
    payroll.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payroll.staffCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payroll.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPayroll = [...filteredPayroll].sort((a, b) => {
    const aValue = a[sortField as keyof typeof a];
    const bValue = b[sortField as keyof typeof b];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedPayroll.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayroll = sortedPayroll.slice(startIndex, startIndex + itemsPerPage);

  // Action handlers
  const handleViewPayroll = (payroll: any) => {
    setSelectedPayroll(payroll);
  };

  const handleEditPayroll = (payroll: any) => {
    setEditPayroll(payroll);
    setEditFormData({
      workingDays: payroll.workingDays,
      presentDays: payroll.presentDays,
      overtimeHours: payroll.overtimeHours,
      basicSalary: payroll.basicSalary,
      allowances: payroll.allowances,
      overtime: payroll.overtime,
      deductions: payroll.deductions,
      status: payroll.status,
      paymentMethod: payroll.paymentMethod || 'cash'
    });
  };

  const handleProcessPayment = async (payroll: any, paymentMethod: string) => {
    try {
      await updatePayrollMutation.mutateAsync({
        id: payroll.id,
        updates: {
          paymentMethod: paymentMethod,
          status: 'paid',
          paymentDate: new Date(),
        }
      });
      
      // Generate and print payslip after payment
      setTimeout(() => {
        handlePrintPayroll(payroll);
      }, 500);
    } catch (error) {
      console.error('Payment processing error:', error);
    }
  };

  const handlePrintPayroll = (payrollData: any) => {
    // Use updated payroll data if available
    const payroll = payrollData.paymentMethod ? payrollData : {
      ...payrollData,
      paymentMethod: payrollData.paymentMethod || 'Not Set',
      status: payrollData.status || 'draft'
    };
    
    // Generate payslip in new window using the professional blue design
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Payslip - ${payroll.staffName}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background: #f5f5f5;
                padding: 20px;
                line-height: 1.4;
              }
              .payslip-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
              }
              .header {
                background: linear-gradient(135deg, #5b63e8 0%, #4c54d2 100%);
                color: white;
                padding: 20px;
                position: relative;
                display: flex;
                align-items: center;
              }
              .logo-section {
                width: 60px;
                margin-right: 20px;
              }
              .logo-box {
                width: 60px;
                height: 60px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                border: 2px solid rgba(255, 255, 255, 0.3);
              }
              .company-info {
                flex: 1;
                text-align: center;
              }
              .company-title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 6px;
                letter-spacing: -0.5px;
              }
              .company-subtitle {
                font-size: 14px;
                opacity: 0.9;
                margin-bottom: 10px;
              }
              .company-details {
                font-size: 12px;
                opacity: 0.8;
                line-height: 1.4;
              }
              .payslip-badges {
                position: absolute;
                top: 20px;
                right: 20px;
                text-align: right;
              }
              .badge {
                display: block;
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                padding: 6px 12px;
                font-size: 11px;
                font-weight: 600;
                margin-bottom: 6px;
                backdrop-filter: blur(10px);
              }
              .main-content {
                padding: 30px;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr 1fr;
                gap: 20px;
                margin-bottom: 30px;
              }
              .info-item {
                text-align: center;
              }
              .info-label {
                font-size: 12px;
                color: #5b63e8;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
              }
              .info-value {
                font-size: 16px;
                font-weight: bold;
                color: #2d3748;
              }
              .info-status {
                display: inline-block;
                background: #48bb78;
                color: white;
                padding: 4px 12px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
              }
              .employee-section {
                background: #f8fafc;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 30px;
                border-left: 4px solid #5b63e8;
                position: relative;
              }
              .qr-code-container {
                position: absolute;
                top: 20px;
                right: 20px;
                text-align: center;
              }
              .qr-code {
                width: 80px;
                height: 80px;
                background: white;
                border: 2px solid #e2e8f0;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: #64748b;
                margin-bottom: 5px;
                padding: 4px;
              }
              .qr-code svg {
                width: 100%;
                height: 100%;
              }
              .qr-label {
                font-size: 10px;
                color: #64748b;
                font-weight: 500;
              }
              .section-title {
                color: #5b63e8;
                font-size: 14px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 15px;
              }
              .employee-name {
                font-size: 22px;
                font-weight: bold;
                color: #2d3748;
                margin-bottom: 5px;
              }
              .employee-details {
                color: #64748b;
                font-size: 14px;
              }
              .salary-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 30px;
              }
              .earnings-section, .deductions-section {
                background: #f8fafc;
                border-radius: 8px;
                padding: 20px;
              }
              .earnings-section {
                border-left: 4px solid #48bb78;
              }
              .deductions-section {
                border-left: 4px solid #f56565;
              }
              .amount-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #e2e8f0;
              }
              .amount-row:last-child {
                border-bottom: none;
              }
              .amount-label {
                color: #4a5568;
                font-size: 14px;
              }
              .amount-value {
                font-weight: 600;
                color: #2d3748;
              }
              .total-row {
                background: white;
                margin-top: 10px;
                padding: 12px;
                border-radius: 6px;
                font-weight: bold;
                border: 2px solid #5b63e8;
              }
              .total-row .amount-label {
                color: #5b63e8;
                font-weight: bold;
              }
              .total-row .amount-value {
                color: #5b63e8;
                font-size: 16px;
              }
              .net-pay-section {
                background: linear-gradient(135deg, #5b63e8 0%, #4c54d2 100%);
                color: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                margin-bottom: 30px;
              }
              .net-pay-label {
                font-size: 16px;
                opacity: 0.9;
                margin-bottom: 8px;
              }
              .net-pay-amount {
                font-size: 32px;
                font-weight: bold;
                letter-spacing: -1px;
              }
              .footer {
                text-align: center;
                color: #64748b;
                font-size: 12px;
                border-top: 1px solid #e2e8f0;
                padding-top: 20px;
              }
              @media print {
                body { background: white; padding: 0; }
                .payslip-container { box-shadow: none; }
              }
            </style>
          </head>
          <body>
            <div class="payslip-container">
              <!-- Header Section -->
              <div class="header">
                <div class="logo-section">
                  <div class="logo-box"></div>
                </div>
                <div class="company-info">
                  <div class="company-title">IeOMS</div>
                  <div class="company-subtitle">Medical Center</div>
                  <div class="company-details">
                    123 Vision Street<br>
                    Eyecare City, EC 12345<br>
                    Phone: +592 750-3901 | Email: info.indiaespectacular@gmail.com
                  </div>
                </div>
                <div class="payslip-badges">
                  <div class="badge">PAYSLIP #${String(payroll.id).padStart(6, '0')}</div>
                  <div class="badge">${payroll.payPeriod}</div>
                </div>
              </div>

              <!-- Main Content -->
              <div class="main-content">
                <!-- Status Info Grid -->
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Date Generated</div>
                    <div class="info-value">${payroll.generatedDate || new Date().toLocaleDateString()}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Pay Period</div>
                    <div class="info-value">${payroll.payPeriod}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Net Pay</div>
                    <div class="info-value" style="color: #48bb78;">$${payroll.netSalary.toLocaleString()}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-status">${payroll.status.toUpperCase()}</div>
                  </div>
                </div>

                <!-- Employee Information -->
                <div class="employee-section">
                  <div class="qr-code-container">
                    <div class="qr-code">
                      <div style="background: white; padding: 8px; border-radius: 4px;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=PAYSLIP-${String(payroll.id).padStart(6, '0')}-${payroll.staffCode}-${payroll.payPeriod}" 
                             alt="Payslip QR Code" 
                             style="width: 64px; height: 64px;" />
                      </div>
                    </div>
                    <div class="qr-label">Scan to Verify</div>
                  </div>
                  <div class="section-title">Employee Information</div>
                  <div class="employee-name">${payroll.staffName}</div>
                  <div class="employee-details">
                    Employee Code: ${payroll.staffCode} • Position: ${payroll.position}<br>
                    Working Days: ${payroll.workingDays} • Days Present: ${payroll.presentDays} • Overtime Hours: ${payroll.overtimeHours}h
                  </div>
                </div>

                <!-- Salary Breakdown -->
                <div class="salary-grid">
                  <!-- Earnings -->
                  <div class="earnings-section">
                    <div class="section-title" style="color: #48bb78;">Earnings</div>
                    <div class="amount-row">
                      <span class="amount-label">Basic Salary:</span>
                      <span class="amount-value">$${payroll.basicSalary.toLocaleString()}</span>
                    </div>
                    <div class="amount-row">
                      <span class="amount-label">Allowances:</span>
                      <span class="amount-value">$${payroll.allowances.toLocaleString()}</span>
                    </div>
                    <div class="amount-row">
                      <span class="amount-label">Overtime (${payroll.overtimeHours}h):</span>
                      <span class="amount-value">$${payroll.overtime.toLocaleString()}</span>
                    </div>
                    <div class="total-row">
                      <div class="amount-row">
                        <span class="amount-label">Gross Salary:</span>
                        <span class="amount-value">$${payroll.grossSalary.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Deductions -->
                  <div class="deductions-section">
                    <div class="section-title" style="color: #f56565;">Deductions</div>
                    <div class="amount-row">
                      <span class="amount-label">Total Deductions:</span>
                      <span class="amount-value">$${payroll.deductions.toLocaleString()}</span>
                    </div>
                    <div style="height: 80px;"></div>
                    <div class="total-row">
                      <div class="amount-row">
                        <span class="amount-label">Total Deductions:</span>
                        <span class="amount-value">$${payroll.deductions.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Net Pay -->
                <div class="net-pay-section">
                  <div class="net-pay-label">Net Pay</div>
                  <div class="net-pay-amount">$${payroll.netSalary.toLocaleString()}</div>
                </div>

                <!-- Footer -->
                <div class="footer">
                  Generated on ${new Date().toLocaleDateString()} | IeOMS Medical Center<br>
                  For questions about this payslip, contact us at info.indiaespectacular@gmail.com
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <select className="w-full p-2 border rounded-md" defaultValue="draft">
                      <option value="draft">Draft</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Payment Method</label>
                    <select className="w-full p-2 border rounded-md" defaultValue="cash">
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="check">Check/Cheque</option>
                      <option value="direct_deposit">Direct Deposit</option>
                      <option value="digital_wallet">Digital Wallet</option>
                      <option value="mobile_payment">Mobile Payment</option>
                    </select>
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
              {/* Sorting Controls */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-600">Sort by:</span>
                <Button 
                  variant={sortField === 'staffName' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleSort('staffName')}
                >
                  Name {sortField === 'staffName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
                <Button 
                  variant={sortField === 'netSalary' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleSort('netSalary')}
                >
                  Salary {sortField === 'netSalary' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
                <Button 
                  variant={sortField === 'generatedDate' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleSort('generatedDate')}
                >
                  Date {sortField === 'generatedDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
                <Button 
                  variant={sortField === 'status' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleSort('status')}
                >
                  Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
              </div>

              <div className="space-y-4">
                {paginatedPayroll.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600">No payroll records found matching your search.</p>
                  </div>
                ) : (
                  paginatedPayroll.map((payroll) => (
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
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewPayroll(payroll)}
                            data-testid={`button-view-${payroll.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditPayroll(payroll)}
                            data-testid={`button-edit-${payroll.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePrintPayroll(payroll)}
                            data-testid={`button-print-${payroll.id}`}
                          >
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
                ))
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedPayroll.length)} of {sortedPayroll.length} entries
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payroll History</CardTitle>
              <div className="flex gap-2">
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-40"
                />
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sortedPayroll.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payroll Records Found</h3>
                  <p className="text-gray-600 mb-4">No payroll records exist for {selectedMonth}. Generate payroll to see history.</p>
                  <Button onClick={() => setBulkPayrollOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Payroll
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <div className="text-sm text-gray-600">
                        Total Records: <span className="font-semibold">{sortedPayroll.length}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Payroll: <span className="font-semibold">₹{sortedPayroll.reduce((sum, p) => sum + p.netSalary, 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    {paginatedPayroll.map((payroll) => (
                      <Card key={payroll.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                                  {payroll.staffName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-gray-900">{payroll.staffName}</h3>
                                <p className="text-sm text-gray-600">{payroll.staffCode} • {payroll.position}</p>
                                <p className="text-xs text-gray-500">Generated: {format(new Date(payroll.generatedDate), 'MMM dd, yyyy')}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="text-sm text-gray-600">Net Salary</p>
                                <p className="text-lg font-bold text-green-600">₹{payroll.netSalary.toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">Status</p>
                                <Badge className={getStatusBadgeColor(payroll.status)}>
                                  {payroll.status}
                                </Badge>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedPayroll(payroll)}
                                  data-testid={`button-view-${payroll.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditPayroll(payroll)}
                                  data-testid={`button-edit-${payroll.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePrintPayroll(payroll)}
                                  data-testid={`button-print-${payroll.id}`}
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="flex items-center px-3 text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
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

      {/* View Payroll Modal */}
      {selectedPayroll && (
        <Dialog open={!!selectedPayroll} onOpenChange={() => setSelectedPayroll(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payroll Details - {selectedPayroll.staffName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Employee</Label>
                  <p className="font-medium">{selectedPayroll.staffName}</p>
                  <p className="text-sm text-slate-600">{selectedPayroll.staffCode} • {selectedPayroll.position}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Pay Period</Label>
                  <p className="font-medium">{selectedPayroll.payPeriod}</p>
                  <p className="text-sm text-slate-600">Status: {getStatusBadge(selectedPayroll.status)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-slate-600">Working Days</p>
                  <p className="text-xl font-bold">{selectedPayroll.workingDays}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-600">Present Days</p>
                  <p className="text-xl font-bold">{selectedPayroll.presentDays}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-600">Overtime Hours</p>
                  <p className="text-xl font-bold">{selectedPayroll.overtimeHours}h</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 text-green-700">Earnings</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Basic Salary:</span>
                      <span className="font-medium">${selectedPayroll.basicSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Allowances:</span>
                      <span className="font-medium">${selectedPayroll.allowances.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overtime:</span>
                      <span className="font-medium">${selectedPayroll.overtime.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-bold text-green-700">
                      <span>Gross Salary:</span>
                      <span>${selectedPayroll.grossSalary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3 text-red-700">Deductions</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Deductions:</span>
                      <span className="font-medium">${selectedPayroll.deductions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-bold text-blue-700 text-lg">
                      <span>Net Pay:</span>
                      <span>${selectedPayroll.netSalary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Payroll Modal */}
      {editPayroll && (
        <Dialog open={!!editPayroll} onOpenChange={() => setEditPayroll(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Payroll - {editPayroll.staffName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Employee</Label>
                  <Input value={`${editPayroll.staffName} (${editPayroll.staffCode})`} disabled />
                </div>
                <div>
                  <Label>Pay Period</Label>
                  <Input value={editPayroll.payPeriod} disabled />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Working Days</Label>
                  <Input 
                    type="number" 
                    value={editFormData.workingDays || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, workingDays: parseInt(e.target.value) || 0 }))}
                    data-testid="input-working-days"
                  />
                </div>
                <div>
                  <Label>Present Days</Label>
                  <Input 
                    type="number" 
                    value={editFormData.presentDays || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, presentDays: parseInt(e.target.value) || 0 }))}
                    data-testid="input-present-days"
                  />
                </div>
                <div>
                  <Label>Overtime Hours</Label>
                  <Input 
                    type="number" 
                    value={editFormData.overtimeHours || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, overtimeHours: parseInt(e.target.value) || 0 }))}
                    data-testid="input-overtime-hours"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Earnings</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>Basic Salary</Label>
                      <Input 
                        type="number" 
                        value={editFormData.basicSalary || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, basicSalary: parseFloat(e.target.value) || 0 }))}
                        data-testid="input-basic-salary"
                      />
                    </div>
                    <div>
                      <Label>Allowances</Label>
                      <Input 
                        type="number" 
                        value={editFormData.allowances || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, allowances: parseFloat(e.target.value) || 0 }))}
                        data-testid="input-allowances"
                      />
                    </div>
                    <div>
                      <Label>Overtime Amount</Label>
                      <Input 
                        type="number" 
                        value={editFormData.overtime || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, overtime: parseFloat(e.target.value) || 0 }))}
                        data-testid="input-overtime-amount"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Deductions</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>Total Deductions</Label>
                      <Input 
                        type="number" 
                        value={editFormData.deductions || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, deductions: parseFloat(e.target.value) || 0 }))}
                        data-testid="input-deductions"
                      />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <select 
                        className="w-full p-2 border rounded-md" 
                        value={editFormData.status || 'draft'}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                        data-testid="select-status"
                      >
                        <option value="draft">Draft</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                    <div>
                      <Label>Payment Method</Label>
                      <select 
                        className="w-full p-2 border rounded-md" 
                        value={editFormData.paymentMethod || 'cash'}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        data-testid="select-payment-method"
                      >
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="debit_card">Debit Card</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="check">Check/Cheque</option>
                        <option value="direct_deposit">Direct Deposit</option>
                        <option value="digital_wallet">Digital Wallet</option>
                        <option value="mobile_payment">Mobile Payment</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setEditPayroll(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    // Process payment and update status
                    updatePayrollMutation.mutate({
                      id: editPayroll.id,
                      updates: {
                        ...editFormData,
                        paymentDate: editFormData.status === 'paid' ? new Date() : null
                      }
                    });
                  }}
                  disabled={updatePayrollMutation.isPending}
                  data-testid="button-save-payroll"
                >
                  {updatePayrollMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}