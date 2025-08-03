import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { 
  Clock, 
  User, 
  Search, 
  QrCode,
  CheckCircle,
  XCircle,
  Play,
  Square,
  CalendarDays,
  Timer,
  Users,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, isToday } from "date-fns";

export default function Attendance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["/api/staff"],
  });

  const { data: attendanceData = [] } = useQuery({
    queryKey: ["/api/attendance", selectedDate],
  });

  const clockInMutation = useMutation({
    mutationFn: async ({ staffId, type }: { staffId: string; type: 'in' | 'out' }) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { staffId, type, timestamp: new Date() };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: `Clock ${data.type === 'in' ? 'In' : 'Out'} Successful`,
        description: `Staff member has clocked ${data.type} at ${format(data.timestamp, 'HH:mm')}`,
      });
    },
  });

  // Mock attendance data for today
  const todayAttendance = [
    {
      id: "1",
      staffId: "staff-1",
      staffName: "Dr. Sarah Johnson",
      staffCode: "EMP001",
      clockIn: "09:00",
      clockOut: null,
      status: "present",
      workingHours: "5h 30m",
      overtime: "0h",
      isLate: false
    },
    {
      id: "2", 
      staffId: "staff-2",
      staffName: "Michael Chen",
      staffCode: "EMP002",
      clockIn: "08:45",
      clockOut: "17:15",
      status: "completed",
      workingHours: "8h 30m",
      overtime: "0h 30m",
      isLate: false
    },
    {
      id: "3",
      staffId: "staff-3", 
      staffName: "Emma Wilson",
      staffCode: "EMP003",
      clockIn: "09:15",
      clockOut: null,
      status: "present",
      workingHours: "4h 45m",
      overtime: "0h",
      isLate: true
    },
    {
      id: "4",
      staffId: "staff-4",
      staffName: "David Rodriguez",
      staffCode: "EMP004",
      clockIn: null,
      clockOut: null,
      status: "absent",
      workingHours: "0h",
      overtime: "0h",
      isLate: false
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800">Present</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
      case 'late':
        return <Badge className="bg-orange-100 text-orange-800">Late</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleClockAction = (staffId: string, action: 'in' | 'out') => {
    clockInMutation.mutate({ staffId, type: action });
  };

  const handleQRScan = () => {
    // Mock QR code scanning
    toast({
      title: "QR Scanner",
      description: "QR code scanner would open here to scan staff ID cards",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Attendance Management</h1>
          <p className="text-slate-600">Track staff attendance, working hours, and generate reports</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleQRScan}>
            <QrCode className="h-4 w-4 mr-2" />
            QR Scanner
          </Button>
          <Button>
            <CalendarDays className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Present Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {todayAttendance.filter(a => a.status === 'present' || a.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Absent Today</p>
                <p className="text-2xl font-bold text-red-600">
                  {todayAttendance.filter(a => a.status === 'absent').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Late Arrivals</p>
                <p className="text-2xl font-bold text-orange-600">
                  {todayAttendance.filter(a => a.isLate).length}
                </p>
              </div>
              <Timer className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Staff</p>
                <p className="text-2xl font-bold text-slate-900">{todayAttendance.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today's Attendance</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          {/* Search */}
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
                <div className="text-sm text-slate-600">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Today's Attendance ({format(new Date(), 'MMM d, yyyy')})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {record.staffName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-slate-900">{record.staffName}</h4>
                        <p className="text-sm text-slate-600">{record.staffCode}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-600">Clock In</p>
                        <p className="text-lg font-semibold">
                          {record.clockIn || '--:--'}
                        </p>
                        {record.isLate && <p className="text-xs text-red-600">Late</p>}
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-600">Clock Out</p>
                        <p className="text-lg font-semibold">
                          {record.clockOut || '--:--'}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-600">Working Hours</p>
                        <p className="text-lg font-semibold">{record.workingHours}</p>
                        {record.overtime !== "0h" && (
                          <p className="text-xs text-green-600">+{record.overtime} OT</p>
                        )}
                      </div>
                      
                      <div className="text-center">
                        {getStatusBadge(record.status)}
                      </div>
                      
                      <div className="flex space-x-2">
                        {!record.clockIn && (
                          <Button
                            size="sm"
                            onClick={() => handleClockAction(record.staffId, 'in')}
                            disabled={clockInMutation.isPending}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Clock In
                          </Button>
                        )}
                        {record.clockIn && !record.clockOut && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClockAction(record.staffId, 'out')}
                            disabled={clockInMutation.isPending}
                          >
                            <Square className="h-4 w-4 mr-1" />
                            Clock Out
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Attendance Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Staff Member</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Select staff member</option>
                    {todayAttendance.map(staff => (
                      <option key={staff.staffId} value={staff.staffId}>
                        {staff.staffName} ({staff.staffCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Clock In Time</label>
                  <Input type="time" placeholder="09:00" />
                </div>
                <div>
                  <label className="text-sm font-medium">Clock Out Time</label>
                  <Input type="time" placeholder="17:00" />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => toast({ title: "Manual attendance recorded" })}>
                  Save Attendance
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Report Type</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Daily Report</option>
                    <option>Weekly Report</option>
                    <option>Monthly Report</option>
                    <option>Custom Range</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Staff</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>All Staff</option>
                    {todayAttendance.map(staff => (
                      <option key={staff.staffId} value={staff.staffId}>
                        {staff.staffName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Report
                </Button>
                <Button>
                  <CalendarDays className="h-4 w-4 mr-2" />
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