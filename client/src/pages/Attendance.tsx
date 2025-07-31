import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Clock,
  LogIn,
  LogOut,
  User,
  Calendar,
  Activity,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  QrCode
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { z } from "zod";

// Define schemas
const attendanceSchema = z.object({
  id: z.string(),
  staffId: z.string(),
  date: z.string(),
  checkInTime: z.string().nullable(),
  checkOutTime: z.string().nullable(),
  status: z.enum(['present', 'absent', 'late', 'half_day']),
  totalHours: z.number().nullable(),
  isLate: z.boolean(),
  lateMinutes: z.number(),
  checkInMethod: z.enum(['manual', 'qr', 'biometric']),
  checkOutMethod: z.enum(['manual', 'qr', 'biometric']),
  notes: z.string().nullable(),
});

const insertAttendanceSchema = z.object({
  staffId: z.string().min(1, "Staff member is required"),
  date: z.string().min(1, "Date is required"),
  checkInTime: z.string().nullable(),
  checkOutTime: z.string().nullable(),
  status: z.enum(['present', 'absent', 'late', 'half_day']),
  isLate: z.boolean().default(false),
  lateMinutes: z.number().default(0),
  checkInMethod: z.enum(['manual', 'qr', 'biometric']).default('manual'),
  checkOutMethod: z.enum(['manual', 'qr', 'biometric']).default('manual'),
  notes: z.string().nullable(),
});

const staffSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  position: z.string(),
  status: z.enum(['active', 'inactive']),
});

type Attendance = z.infer<typeof attendanceSchema>;
type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
type Staff = z.infer<typeof staffSchema>;

export default function AttendancePage() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedStaff, setSelectedStaff] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: attendanceList = [], isLoading } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance", selectedDate, selectedStaff],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (selectedStaff) params.append('staffId', selectedStaff);
      
      const response = await fetch(`/api/attendance?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return response.json();
    }
  });

  const { data: staffList = [] } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const form = useForm<InsertAttendance>({
    resolver: zodResolver(insertAttendanceSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      status: "present",
      checkInMethod: "manual",
      checkOutMethod: "manual",
      isLate: false,
      lateMinutes: 0,
      checkInTime: null,
      checkOutTime: null,
      notes: null,
    },
  });

  const manualAttendanceMutation = useMutation({
    mutationFn: async (data: InsertAttendance) => {
      await apiRequest("POST", "/api/attendance", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Attendance record added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add attendance record.",
        variant: "destructive",
      });
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async (data: { staffId: string; method?: string; location?: any }) => {
      await apiRequest("POST", "/api/attendance/check-in", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Success",
        description: "Check-in recorded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record check-in.",
        variant: "destructive",
      });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async (data: { staffId: string; method?: string }) => {
      await apiRequest("POST", "/api/attendance/check-out", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Success",
        description: "Check-out recorded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record check-out.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertAttendance) => {
    manualAttendanceMutation.mutate(data);
  };

  const handleQuickCheckIn = (staffId: string) => {
    checkInMutation.mutate({ staffId, method: 'manual' });
  };

  const handleQuickCheckOut = (staffId: string) => {
    checkOutMutation.mutate({ staffId, method: 'manual' });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'half_day': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'late': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'half_day': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  // Filter for today's attendance
  const todayAttendance = attendanceList.filter(a => a.date === format(new Date(), 'yyyy-MM-dd'));
  
  // Calculate summary stats
  const totalPresent = todayAttendance.filter(a => a.status === 'present').length;
  const totalAbsent = todayAttendance.filter(a => a.status === 'absent').length;
  const totalLate = todayAttendance.filter(a => a.status === 'late').length;
  const totalStaff = staffList.filter(s => s.status === 'active').length;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header 
        title="Attendance Management" 
        subtitle="Track staff attendance, check-ins, check-outs, and generate attendance reports." 
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Present Today</p>
                    <p className="text-2xl font-bold text-slate-900">{totalPresent}</p>
                    <p className="text-xs text-emerald-600 flex items-center mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active staff
                    </p>
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
                    <p className="text-sm font-medium text-slate-600">Absent Today</p>
                    <p className="text-2xl font-bold text-slate-900">{totalAbsent}</p>
                    <p className="text-xs text-slate-500">Missing staff</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <XCircle className="text-red-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Late Today</p>
                    <p className="text-2xl font-bold text-slate-900">{totalLate}</p>
                    <p className="text-xs text-amber-600">Late arrivals</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="text-amber-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Staff</p>
                    <p className="text-2xl font-bold text-slate-900">{totalStaff}</p>
                    <p className="text-xs text-slate-500">Active employees</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="text-blue-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Quick Check-In/Out</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {staffList.filter(s => s.status === 'active').map((staff) => {
                  const todayRecord = todayAttendance.find(a => a.staffId === staff.id);
                  const hasCheckedIn = todayRecord?.checkInTime;
                  const hasCheckedOut = todayRecord?.checkOutTime;
                  
                  return (
                    <div key={staff.id} className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <User className="h-8 w-8 text-slate-400" />
                        <div>
                          <p className="font-medium text-sm">{staff.firstName} {staff.lastName}</p>
                          <p className="text-xs text-slate-500">{staff.position}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant={hasCheckedIn ? "outline" : "default"}
                          disabled={!!hasCheckedIn || checkInMutation.isPending}
                          onClick={() => handleQuickCheckIn(staff.id)}
                          className="flex-1"
                        >
                          <LogIn className="h-3 w-3 mr-1" />
                          {hasCheckedIn ? 'In' : 'Check In'}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant={hasCheckedOut ? "outline" : "default"}
                          disabled={!hasCheckedIn || !!hasCheckedOut || checkOutMutation.isPending}
                          onClick={() => handleQuickCheckOut(staff.id)}
                          className="flex-1"
                        >
                          <LogOut className="h-3 w-3 mr-1" />
                          {hasCheckedOut ? 'Out' : 'Check Out'}
                        </Button>
                      </div>
                      
                      {todayRecord && (
                        <div className="mt-2 text-xs text-slate-600">
                          {todayRecord.checkInTime && (
                            <p>In: {format(new Date(todayRecord.checkInTime), 'HH:mm')}</p>
                          )}
                          {todayRecord.checkOutTime && (
                            <p>Out: {format(new Date(todayRecord.checkOutTime), 'HH:mm')}</p>
                          )}
                          {todayRecord.totalHours && (
                            <p>Hours: {todayRecord.totalHours}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
              
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Staff</SelectItem>
                  {staffList.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.firstName} {staff.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Manual Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Manual Attendance Entry</DialogTitle>
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
                                    {staff.firstName} {staff.lastName}
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
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
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
                        name="checkInTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Check In Time</FormLabel>
                            <FormControl>
                              <Input
                                type="datetime-local"
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value || null)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="checkOutTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Check Out Time</FormLabel>
                            <FormControl>
                              <Input 
                                type="datetime-local" 
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value || null)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                              <SelectItem value="half_day">Half Day</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
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
                        disabled={manualAttendanceMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {manualAttendanceMutation.isPending ? "Adding..." : "Add Record"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Attendance Table */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceList.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No attendance records</h3>
                  <p className="text-slate-600 mb-6">No attendance data found for the selected date and filters.</p>
                  <Button 
                    onClick={() => setOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Manual Entry
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Total Hours</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceList.map((attendance) => {
                        const staff = staffList.find(s => s.id === attendance.staffId);
                        return (
                          <TableRow key={attendance.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <User className="h-8 w-8 text-slate-400" />
                                <div>
                                  <p className="font-medium">{staff?.firstName} {staff?.lastName}</p>
                                  <p className="text-sm text-slate-500">{staff?.position}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span>{format(new Date(attendance.date), 'MMM dd, yyyy')}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {attendance.checkInTime ? (
                                <div className="flex items-center space-x-2">
                                  <LogIn className="h-4 w-4 text-green-600" />
                                  <span>{format(new Date(attendance.checkInTime), 'HH:mm')}</span>
                                  {attendance.isLate && (
                                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                      Late {attendance.lateMinutes}m
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {attendance.checkOutTime ? (
                                <div className="flex items-center space-x-2">
                                  <LogOut className="h-4 w-4 text-red-600" />
                                  <span>{format(new Date(attendance.checkOutTime), 'HH:mm')}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span>{attendance.totalHours || '0'} hrs</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(attendance.status)}
                                <Badge className={getStatusBadgeColor(attendance.status)}>
                                  {attendance.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <span className="capitalize">{attendance.checkInMethod}</span>
                                {attendance.checkInMethod === 'qr' && (
                                  <div className="flex items-center space-x-1 text-slate-500">
                                    <QrCode className="h-3 w-3" />
                                    <span>QR verified</span>
                                  </div>
                                )}
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
        </div>
      </main>
    </>
  );
}