import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  QrCode, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  UserCheck,
  Users,
  Filter,
  Download,
  Search,
  MapPin,
  Smartphone,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  totalHours?: number;
  status: "present" | "absent" | "late" | "early_leave" | "on_leave";
  location?: string;
  method: "manual" | "qr_code" | "biometric";
  notes?: string;
}

interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  leaveType: "sick" | "vacation" | "personal" | "emergency";
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  appliedDate: string;
}

export default function Attendance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState("attendance");
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: attendanceRecords = [], isLoading: attendanceLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance", selectedDate],
  });

  const { data: leaveRequests = [], isLoading: leaveLoading } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leave-requests"],
  });

  const { data: staff = [] } = useQuery({
    queryKey: ["/api/staff"],
  });

  // Clock In/Out Mutation
  const clockInOutMutation = useMutation({
    mutationFn: async (data: { staffId: string; action: "clock_in" | "clock_out"; method?: string; location?: string }) => {
      return await fetch("/api/attendance/clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Success",
        description: "Attendance recorded successfully.",
      });
    },
  });

  // Leave Request Mutation
  const leaveRequestMutation = useMutation({
    mutationFn: async (data: Partial<LeaveRequest>) => {
      return await fetch("/api/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      toast({
        title: "Success",
        description: "Leave request submitted successfully.",
      });
      setLeaveDialogOpen(false);
    },
  });

  // Generate QR Code for Staff
  const generateQRCode = (staffId: string) => {
    const qrData = `ATTENDANCE:${staffId}:${Date.now()}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  };

  // Filter records
  const filteredAttendance = attendanceRecords.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    return record.staffName.toLowerCase().includes(searchLower) ||
           record.status.toLowerCase().includes(searchLower);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "bg-green-100 text-green-800";
      case "absent": return "bg-red-100 text-red-800";
      case "late": return "bg-yellow-100 text-yellow-800";
      case "early_leave": return "bg-orange-100 text-orange-800";
      case "on_leave": return "bg-blue-100 text-blue-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present": return <CheckCircle className="h-4 w-4" />;
      case "absent": return <XCircle className="h-4 w-4" />;
      case "late": return <AlertCircle className="h-4 w-4" />;
      case "early_leave": return <Clock className="h-4 w-4" />;
      case "on_leave": return <Calendar className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <>
      <Header 
        title="Attendance Management" 
        subtitle="Track staff attendance, manage leave requests, and monitor work hours with QR code integration."
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">85%</p>
                    <p className="text-xs text-slate-500">Present Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">7.2h</p>
                    <p className="text-xs text-slate-500">Avg Hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-xs text-slate-500">Late Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">5</p>
                    <p className="text-xs text-slate-500">On Leave</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search staff or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <div className="flex gap-2">
              <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Attendance
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>QR Code Attendance</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                      Staff can scan their individual QR codes to mark attendance quickly and accurately.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {staff.slice(0, 4).map((member: any) => (
                        <div key={member.id} className="text-center space-y-2">
                          <img 
                            src={generateQRCode(member.id)} 
                            alt={`QR Code for ${member.firstName}`}
                            className="mx-auto"
                          />
                          <p className="text-sm font-medium">{member.firstName} {member.lastName}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Request Leave
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit Leave Request</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map((member: any) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.firstName} {member.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="vacation">Vacation</SelectItem>
                        <SelectItem value="personal">Personal Leave</SelectItem>
                        <SelectItem value="emergency">Emergency Leave</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input type="date" placeholder="Start date" />
                      <Input type="date" placeholder="End date" />
                    </div>
                    
                    <Input placeholder="Reason for leave" />
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => leaveRequestMutation.mutate({})}>
                        Submit Request
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
              <TabsTrigger value="leave">Leave Management</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="attendance">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserCheck className="h-5 w-5" />
                    <span>Daily Attendance - {format(new Date(selectedDate), "MMMM dd, yyyy")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Staff Member</TableHead>
                          <TableHead>Clock In</TableHead>
                          <TableHead>Clock Out</TableHead>
                          <TableHead>Total Hours</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAttendance.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.staffName}</TableCell>
                            <TableCell>{record.clockIn || "--"}</TableCell>
                            <TableCell>{record.clockOut || "--"}</TableCell>
                            <TableCell>{record.totalHours ? `${record.totalHours}h` : "--"}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(record.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(record.status)}
                                  {record.status.replace('_', ' ')}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell className="capitalize">
                              <div className="flex items-center gap-1">
                                {record.method === "qr_code" && <QrCode className="h-4 w-4" />}
                                {record.method === "manual" && <Edit className="h-4 w-4" />}
                                {record.method === "biometric" && <Smartphone className="h-4 w-4" />}
                                {record.method.replace('_', ' ')}
                              </div>
                            </TableCell>
                            <TableCell>
                              {record.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {record.location}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Record
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Record
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
            </TabsContent>

            <TabsContent value="leave">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Leave Requests</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Staff Member</TableHead>
                          <TableHead>Leave Type</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Applied Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leaveRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.staffName}</TableCell>
                            <TableCell className="capitalize">{request.leaveType.replace('_', ' ')}</TableCell>
                            <TableCell>{format(new Date(request.startDate), "MMM dd, yyyy")}</TableCell>
                            <TableCell>{format(new Date(request.endDate), "MMM dd, yyyy")}</TableCell>
                            <TableCell>
                              {Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1)} days
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  request.status === "approved" ? "default" :
                                  request.status === "rejected" ? "destructive" : "secondary"
                                }
                              >
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{format(new Date(request.appliedDate), "MMM dd, yyyy")}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {request.status === "pending" && (
                                    <>
                                      <DropdownMenuItem className="text-green-600">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600">
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  )}
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
            </TabsContent>

            <TabsContent value="reports">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Present Days</span>
                        <span className="font-medium">142</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Absent Days</span>
                        <span className="font-medium">8</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Hours/Day</span>
                        <span className="font-medium">7.2h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>On-Time Percentage</span>
                        <span className="font-medium">92%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Work Hours</span>
                        <span className="font-medium">1,024h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overtime Hours</span>
                        <span className="font-medium">36h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Leave Days Used</span>
                        <span className="font-medium">23</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Attendance Rate</span>
                        <span className="font-medium">94.5%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}