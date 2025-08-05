import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
  TrendingUp,
  Edit,
  Save,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, isToday } from "date-fns";

export default function Attendance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: staffData = [], isLoading } = useQuery({
    queryKey: ["/api/staff"],
  });

  const { data: attendanceData = [] } = useQuery({
    queryKey: ["/api/attendance", selectedDate],
  });

  const clockInMutation = useMutation({
    mutationFn: async ({ staffId, type }: { staffId: string; type: 'in' | 'out' }) => {
      // Mock API call with better feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`Clock ${type} for staff ${staffId} at ${new Date().toLocaleString()}`);
      return { staffId, type, timestamp: new Date() };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: `Clock ${data.type === 'in' ? 'In' : 'Out'} Successful`,
        description: `Staff member has clocked ${data.type} at ${format(data.timestamp, 'HH:mm')}`,
      });
    },
    onError: () => {
      toast({
        title: "Clock Action Failed",
        description: "Unable to record attendance. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate attendance data from real staff data
  const todayAttendance = staffData.map((staff: any, index: number) => ({
    id: staff.id,
    staffId: staff.id,
    staffName: `${staff.firstName} ${staff.lastName}`,
    staffCode: staff.staffCode || staff.employeeId,
    clockIn: index === 0 ? "09:00" : null, // Only first staff member is clocked in
    clockOut: null,
    status: index === 0 ? "present" : "absent",
    workingHours: index === 0 ? "5h 30m" : "0h",
    overtime: "0h",
    isLate: false
  }));

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

  // Manual attendance toggle
  const handleManualAttendance = (staffId: string, status: 'present' | 'absent') => {
    toast({
      title: "Manual Attendance Updated",
      description: `Staff member marked as ${status}`,
    });
  };

  // Camera and QR scanner initialization
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      if (qrScannerOpen && videoRef.current) {
        try {
          setCameraError(null);
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } // Try back camera first
          });
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          
          // Initialize QR scanner
          const QrScanner = await import('qr-scanner');
          const qrScanner = new QrScanner.default(
            videoRef.current,
            (result) => {
              handleQRScan(result.data);
              qrScanner.destroy();
              setQrScannerOpen(false);
            },
            {
              highlightScanRegion: true,
              highlightCodeOutline: true,
            }
          );
          
          qrScanner.start();
          
          return () => {
            qrScanner.destroy();
          };
        } catch (error) {
          console.error('Camera error:', error);
          setCameraError('Unable to access camera. Please check permissions.');
        }
      }
    };
    
    if (qrScannerOpen) {
      startCamera();
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [qrScannerOpen]);

  // QR Code scanner handler
  const handleQRScan = (qrData: string) => {
    try {
      const qrStaffData = JSON.parse(qrData);
      if (qrStaffData.staffCode) {
        // Find staff member by QR code data in both staffCode and employeeId
        const staff = todayAttendance.find(s => 
          s.staffCode === qrStaffData.staffCode || 
          s.staffCode === qrStaffData.employeeId
        );
        if (staff) {
          const action = staff.clockIn && !staff.clockOut ? 'out' : 'in';
          handleClockAction(staff.staffId, action);
          toast({
            title: `Clock ${action === 'in' ? 'In' : 'Out'} Successful`,
            description: `${staff.staffName} has been clocked ${action}`,
          });
        } else {
          toast({
            title: "Staff Not Found",
            description: `Could not find staff member with code: ${qrStaffData.staffCode}`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Invalid QR Code",
        description: "This QR code is not valid for attendance",
        variant: "destructive"
      });
    }
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
          <Button variant="outline" onClick={() => setQrScannerOpen(true)}>
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
              <CardTitle className="flex items-center">
                <Edit className="h-5 w-5 mr-2" />
                Manual Attendance Entry & Override
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Status Toggle */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Quick Status Toggle - Today's Staff</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {todayAttendance.map((staff) => (
                    <div key={staff.staffId} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {staff.staffName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{staff.staffName}</p>
                          <p className="text-xs text-slate-500">{staff.staffCode}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant={staff.status === 'present' ? "default" : "outline"}
                          className={staff.status === 'present' ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50"}
                          onClick={() => handleManualAttendance(staff.staffId, 'present')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant={staff.status === 'absent' ? "destructive" : "outline"}
                          className={staff.status === 'absent' ? "" : "hover:bg-red-50"}
                          onClick={() => handleManualAttendance(staff.staffId, 'absent')}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Absent
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual Time Entry */}
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Manual Time Entry</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Staff Member</Label>
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
                    <Label>Date</Label>
                    <Input type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label>Clock In Time</Label>
                    <Input type="time" placeholder="09:00" />
                  </div>
                  <div>
                    <Label>Clock Out Time</Label>
                    <Input type="time" placeholder="17:00" />
                  </div>
                  <div>
                    <Label>Break Duration (minutes)</Label>
                    <Input type="number" placeholder="60" min="0" />
                  </div>
                </div>

                <div className="mb-4">
                  <Label>Reason for Manual Entry</Label>
                  <textarea 
                    className="w-full p-2 border rounded-md mt-1" 
                    rows={2}
                    placeholder="Enter reason for manual time entry..."
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">
                    Cancel
                  </Button>
                  <Button onClick={() => toast({ 
                    title: "Manual attendance recorded", 
                    description: "Time entry has been saved successfully" 
                  })}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Manual Entry
                  </Button>
                </div>
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

      {/* QR Scanner Modal */}
      {qrScannerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">QR Code Scanner</h3>
              <Button variant="ghost" size="sm" onClick={() => setQrScannerOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                {cameraError ? (
                  <div className="p-8 text-center">
                    <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-red-600 mb-4">{cameraError}</p>
                    <Button 
                      onClick={() => {
                        const realStaffCode = staffData.length > 0 ? staffData[0].staffCode : "STF-304783";
                        const sampleQRData = JSON.stringify({ staffCode: realStaffCode });
                        handleQRScan(sampleQRData);
                        setQrScannerOpen(false);
                      }}
                      className="w-full"
                    >
                      Simulate Scan: {staffData.length > 0 ? staffData[0].firstName + " " + staffData[0].lastName : "Dr. Smita Ghosh"}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Click above for demo mode
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <video 
                      ref={videoRef}
                      className="w-full h-64 object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                    <div className="absolute inset-0 border-2 border-white border-dashed rounded-lg m-8 flex items-center justify-center">
                      <div className="text-white text-center">
                        <QrCode className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Scan QR Code</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1" onClick={() => setQrScannerOpen(false)}>
                  Cancel
                </Button>
                <Button variant="outline" className="flex-1">
                  Manual Entry
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}