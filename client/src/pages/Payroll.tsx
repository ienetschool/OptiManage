import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  DollarSign,
  Download,
  Eye,
  User,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Clock
} from "lucide-react";
import { 
  type Payroll,
  type Staff
} from "@shared/schema";
import { format } from "date-fns";

export default function PayrollPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: payrollList = [], isLoading } = useQuery<Payroll[]>({
    queryKey: ["/api/payroll", selectedMonth, selectedYear],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('month', selectedMonth.toString());
      params.append('year', selectedYear.toString());
      
      const response = await fetch(`/api/payroll?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch payroll');
      return response.json();
    }
  });

  const { data: staffList = [] } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const filteredPayroll = payrollList.filter(payroll => {
    const staff = staffList.find(s => s.id === payroll.staffId);
    if (!staff) return false;
    
    const matchesSearch = staff.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payroll.payrollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPayrollAmount = filteredPayroll.reduce((sum, p) => sum + parseFloat(p.netSalary), 0);
  const processedPayrolls = filteredPayroll.filter(p => p.status === 'processed').length;
  const pendingPayrolls = filteredPayroll.filter(p => p.status === 'pending').length;
  const avgSalary = filteredPayroll.length > 0 ? totalPayrollAmount / filteredPayroll.length : 0;

  return (
    <>
      <Header 
        title="Payroll Management" 
        subtitle="Manage employee salaries, deductions, and payslip generation." 
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Payroll</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${totalPayrollAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-emerald-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      This month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="text-green-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Processed</p>
                    <p className="text-2xl font-bold text-slate-900">{processedPayrolls}</p>
                    <p className="text-xs text-slate-500">Payrolls completed</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="text-blue-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Pending</p>
                    <p className="text-2xl font-bold text-slate-900">{pendingPayrolls}</p>
                    <p className="text-xs text-amber-600 flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      Awaiting processing
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Clock className="text-amber-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Avg. Salary</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${avgSalary.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">Per employee</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-purple-600 h-6 w-6" />
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
                  placeholder="Search payroll..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {format(new Date(2024, i), 'MMMM')}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={i} value={new Date().getFullYear() - 2 + i}>
                    {new Date().getFullYear() - 2 + i}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <DollarSign className="mr-2 h-4 w-4" />
                Process Payroll
              </Button>
            </div>
          </div>

          {/* Payroll Table */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>
                Payroll Records - {format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy')}
              </CardTitle>
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
              ) : filteredPayroll.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No payroll records found</h3>
                  <p className="text-slate-600 mb-6">
                    {searchTerm ? "Try adjusting your search criteria." : "No payroll data for the selected period."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payroll #</TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Basic Salary</TableHead>
                        <TableHead>Gross Salary</TableHead>
                        <TableHead>Deductions</TableHead>
                        <TableHead>Net Salary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayroll.map((payroll) => {
                        const staff = staffList.find(s => s.id === payroll.staffId);
                        
                        return (
                          <TableRow key={payroll.id}>
                            <TableCell>
                              <span className="font-mono text-sm">{payroll.payrollNumber}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-slate-400" />
                                <div>
                                  <span className="font-medium">
                                    {staff?.firstName} {staff?.lastName}
                                  </span>
                                  <p className="text-sm text-slate-500">{staff?.position}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span>
                                  {format(new Date(payroll.payYear, payroll.payMonth - 1), 'MMM yyyy')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-4 w-4 text-slate-400" />
                                <span>${parseFloat(payroll.basicSalary).toLocaleString()}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="font-medium">
                                  ${parseFloat(payroll.grossSalary).toLocaleString()}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <TrendingDown className="h-4 w-4 text-red-600" />
                                <span>${parseFloat(payroll.totalDeductions).toLocaleString()}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <CreditCard className="h-4 w-4 text-blue-600" />
                                <span className="font-bold text-blue-600">
                                  ${parseFloat(payroll.netSalary).toLocaleString()}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeColor(payroll.status)}>
                                {payroll.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  title="Download Payslip"
                                  disabled={!payroll.payslipGenerated}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payroll Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Salary Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPayroll.map((payroll) => {
                    const staff = staffList.find(s => s.id === payroll.staffId);
                    const percentage = totalPayrollAmount > 0 ? (parseFloat(payroll.netSalary) / totalPayrollAmount) * 100 : 0;
                    
                    return (
                      <div key={payroll.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium">
                            {staff?.firstName} {staff?.lastName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-16 text-right">
                            ${parseFloat(payroll.netSalary).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Payroll Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                    <span className="text-sm font-medium">Total Employees</span>
                    <span className="font-bold">{filteredPayroll.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                    <span className="text-sm font-medium">Total Gross Salary</span>
                    <span className="font-bold text-green-600">
                      ${filteredPayroll.reduce((sum, p) => sum + parseFloat(p.grossSalary), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                    <span className="text-sm font-medium">Total Deductions</span>
                    <span className="font-bold text-red-600">
                      ${filteredPayroll.reduce((sum, p) => sum + parseFloat(p.totalDeductions), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                    <span className="text-sm font-medium">Total Net Salary</span>
                    <span className="font-bold text-blue-600">
                      ${totalPayrollAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}