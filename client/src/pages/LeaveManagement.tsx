import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";
import { z } from "zod";

const leaveRequestSchema = z.object({
  staffId: z.string().min(1, "Staff member is required"),
  leaveType: z.string().min(1, "Leave type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  isEmergency: z.boolean().default(false),
  attachments: z.array(z.string()).optional(),
});

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  isEmergency: boolean;
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
}

interface LeaveBalance {
  staffId: string;
  staffName: string;
  position: string;
  annualLeave: { total: number; used: number; remaining: number };
  sickLeave: { total: number; used: number; remaining: number };
  personalLeave: { total: number; used: number; remaining: number };
  maternityLeave: { total: number; used: number; remaining: number };
}

export default function LeaveManagement() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("requests");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const leaveTypes = [
    'Annual Leave',
    'Sick Leave',
    'Personal Leave',
    'Maternity Leave',
    'Paternity Leave',
    'Emergency Leave',
    'Bereavement Leave',
    'Study Leave'
  ];

  // Mock data
  const { data: leaveRequests = [], isLoading } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leave-requests"],
    queryFn: async () => {
      // Mock data for demonstration
      return [
        {
          id: '1',
          staffId: '1',
          staffName: 'John Smith',
          leaveType: 'Annual Leave',
          startDate: '2025-02-15',
          endDate: '2025-02-20',
          totalDays: 6,
          reason: 'Family vacation to celebrate anniversary',
          status: 'pending',
          isEmergency: false,
          appliedDate: '2025-01-31'
        },
        {
          id: '2',
          staffId: '2',
          staffName: 'Sarah Johnson',
          leaveType: 'Sick Leave',
          startDate: '2025-02-01',
          endDate: '2025-02-03',
          totalDays: 3,
          reason: 'Medical treatment and recovery',
          status: 'approved',
          isEmergency: false,
          appliedDate: '2025-01-30',
          approvedBy: 'Dr. Manager',
          approvedDate: '2025-01-31'
        }
      ];
    }
  });

  const { data: leaveBalances = [] } = useQuery<LeaveBalance[]>({
    queryKey: ["/api/leave-balances"],
    queryFn: async () => {
      // Mock data for demonstration
      return [
        {
          staffId: '1',
          staffName: 'John Smith',
          position: 'Receptionist',
          annualLeave: { total: 25, used: 8, remaining: 17 },
          sickLeave: { total: 10, used: 2, remaining: 8 },
          personalLeave: { total: 5, used: 1, remaining: 4 },
          maternityLeave: { total: 0, used: 0, remaining: 0 }
        },
        {
          staffId: '2',
          staffName: 'Sarah Johnson',
          position: 'Nurse',
          annualLeave: { total: 25, used: 12, remaining: 13 },
          sickLeave: { total: 10, used: 3, remaining: 7 },
          personalLeave: { total: 5, used: 2, remaining: 3 },
          maternityLeave: { total: 90, used: 0, remaining: 90 }
        }
      ];
    }
  });

  const { data: staffList = [] } = useQuery({
    queryKey: ["/api/staff"],
    queryFn: async () => {
      return [
        { id: '1', firstName: 'John', lastName: 'Smith', position: 'Receptionist' },
        { id: '2', firstName: 'Sarah', lastName: 'Johnson', position: 'Nurse' },
        { id: '3', firstName: 'Michael', lastName: 'Chen', position: 'Technician' }
      ];
    }
  });

  const form = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      staffId: "",
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
      isEmergency: false,
      attachments: [],
    },
  });

  const submitLeaveRequestMutation = useMutation({
    mutationFn: async (data: LeaveRequestFormData) => {
      await apiRequest("POST", "/api/leave-requests", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Leave request submitted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit leave request.",
        variant: "destructive",
      });
    },
  });

  const approveRejectMutation = useMutation({
    mutationFn: async ({ id, action, reason }: { id: string; action: 'approve' | 'reject'; reason?: string }) => {
      await apiRequest("PATCH", `/api/leave-requests/${id}`, { 
        status: action === 'approve' ? 'approved' : 'rejected',
        rejectionReason: reason 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      toast({
        title: "Success",
        description: "Leave request updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update leave request.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LeaveRequestFormData) => {
    submitLeaveRequestMutation.mutate(data);
  };

  const handleApprove = (id: string) => {
    approveRejectMutation.mutate({ id, action: 'approve' });
  };

  const handleReject = (id: string) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason) {
      approveRejectMutation.mutate({ id, action: 'reject', reason });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = request.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingRequests = leaveRequests.filter(r => r.status === 'pending').length;
  const approvedRequests = leaveRequests.filter(r => r.status === 'approved').length;
  const totalRequests = leaveRequests.length;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading leave management data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header 
        title="Leave Management" 
        subtitle="Manage staff leave requests, approvals, and leave balances." 
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Requests</p>
                    <p className="text-2xl font-bold text-slate-900">{totalRequests}</p>
                    <p className="text-xs text-slate-500">This month</p>
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
                    <p className="text-sm font-medium text-slate-600">Pending Approval</p>
                    <p className="text-2xl font-bold text-slate-900">{pendingRequests}</p>
                    <p className="text-xs text-amber-600">Needs attention</p>
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
                    <p className="text-sm font-medium text-slate-600">Approved</p>
                    <p className="text-2xl font-bold text-slate-900">{approvedRequests}</p>
                    <p className="text-xs text-green-600">This month</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="text-green-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Staff Members</p>
                    <p className="text-2xl font-bold text-slate-900">{staffList.length}</p>
                    <p className="text-xs text-slate-500">Active employees</p>
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
              <TabsTrigger value="requests">Leave Requests</TabsTrigger>
              <TabsTrigger value="balances">Leave Balances</TabsTrigger>
              <TabsTrigger value="calendar">Leave Calendar</TabsTrigger>
            </TabsList>

            {/* Leave Requests Tab */}
            <TabsContent value="requests" className="space-y-6">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      New Leave Request
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Submit Leave Request</DialogTitle>
                    </DialogHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
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
                          
                          <FormField
                            control={form.control}
                            name="leaveType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Leave Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select leave type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {leaveTypes.map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="reason"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reason for Leave</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Please provide detailed reason for leave..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isEmergency"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <input 
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Emergency Leave</FormLabel>
                                <p className="text-sm text-slate-600">
                                  Check if this is an emergency leave request requiring immediate attention.
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                        
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
                            disabled={submitLeaveRequestMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {submitLeaveRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Requests Table */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle>Leave Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No leave requests found</h3>
                      <p className="text-slate-600 mb-6">No requests match your current filters.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Staff Member</TableHead>
                            <TableHead>Leave Type</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead>Days</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Applied Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRequests.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <User className="h-8 w-8 text-slate-400" />
                                  <div>
                                    <p className="font-medium">{request.staffName}</p>
                                    {request.isEmergency && (
                                      <Badge variant="outline" className="text-red-600 border-red-600">
                                        Emergency
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{request.leaveType}</TableCell>
                              <TableCell>
                                <div>
                                  <p>{format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd, yyyy')}</p>
                                </div>
                              </TableCell>
                              <TableCell>{request.totalDays} days</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(request.status)}
                                  <Badge className={getStatusBadgeColor(request.status)}>
                                    {request.status}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>{format(new Date(request.appliedDate), 'MMM dd, yyyy')}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  {request.status === 'pending' && (
                                    <>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleApprove(request.id)}
                                        className="text-green-600 border-green-600 hover:bg-green-50"
                                      >
                                        <CheckCircle className="h-3 w-3" />
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleReject(request.id)}
                                        className="text-red-600 border-red-600 hover:bg-red-50"
                                      >
                                        <XCircle className="h-3 w-3" />
                                      </Button>
                                    </>
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

            {/* Leave Balances Tab */}
            <TabsContent value="balances" className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle>Staff Leave Balances</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Staff Member</TableHead>
                          <TableHead>Annual Leave</TableHead>
                          <TableHead>Sick Leave</TableHead>
                          <TableHead>Personal Leave</TableHead>
                          <TableHead>Maternity Leave</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leaveBalances.map((balance) => (
                          <TableRow key={balance.staffId}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <User className="h-8 w-8 text-slate-400" />
                                <div>
                                  <p className="font-medium">{balance.staffName}</p>
                                  <p className="text-sm text-slate-500">{balance.position}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>Used: {balance.annualLeave.used}</span>
                                  <span>Remaining: {balance.annualLeave.remaining}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${(balance.annualLeave.used / balance.annualLeave.total) * 100}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-slate-500">Total: {balance.annualLeave.total}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>Used: {balance.sickLeave.used}</span>
                                  <span>Remaining: {balance.sickLeave.remaining}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-red-600 h-2 rounded-full" 
                                    style={{ width: `${(balance.sickLeave.used / balance.sickLeave.total) * 100}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-slate-500">Total: {balance.sickLeave.total}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>Used: {balance.personalLeave.used}</span>
                                  <span>Remaining: {balance.personalLeave.remaining}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{ width: `${(balance.personalLeave.used / balance.personalLeave.total) * 100}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-slate-500">Total: {balance.personalLeave.total}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {balance.maternityLeave.total > 0 ? (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Used: {balance.maternityLeave.used}</span>
                                    <span>Remaining: {balance.maternityLeave.remaining}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-purple-600 h-2 rounded-full" 
                                      style={{ width: `${(balance.maternityLeave.used / balance.maternityLeave.total) * 100}%` }}
                                    ></div>
                                  </div>
                                  <p className="text-xs text-slate-500">Total: {balance.maternityLeave.total}</p>
                                </div>
                              ) : (
                                <span className="text-slate-400">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Leave Calendar Tab */}
            <TabsContent value="calendar" className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle>Leave Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Leave Calendar View</h3>
                    <p className="text-slate-600">Calendar integration coming soon. View all staff leave schedules in a visual calendar format.</p>
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