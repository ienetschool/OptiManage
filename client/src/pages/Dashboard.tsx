import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Users, 
  Calendar,
  Package,
  TrendingUp,
  AlertTriangle,
  Activity,
  Clock,
  UserCheck,
  Stethoscope,
  Eye,
  Pill,
  FileText,
  MessageSquare,
  Bell,
  Heart,
  Brain,
  Zap
} from "lucide-react";
import { format } from "date-fns";

interface KPIData {
  dailySales: number;
  appointmentsToday: number;
  totalPatients: number;
  lowStockItems: number;
  todayRevenue: number;
  pendingAppointments: number;
  totalPrescriptions: number;
  staffPresent: number;
}

export default function Dashboard() {
  const { data: kpis = {
    dailySales: 0,
    appointmentsToday: 0,
    totalPatients: 0,
    lowStockItems: 0,
    todayRevenue: 0,
    pendingAppointments: 0,
    totalPrescriptions: 0,
    staffPresent: 0
  } as KPIData, isLoading } = useQuery<KPIData>({
    queryKey: ["/api/dashboard/kpis"],
  });

  // Sample recent activities
  const recentActivities = [
    {
      id: 1,
      type: "appointment",
      message: "New appointment scheduled with Dr. Smith",
      time: "2 minutes ago",
      icon: Calendar,
      color: "text-blue-600"
    },
    {
      id: 2,
      type: "prescription",
      message: "Prescription issued for progressive lenses",
      time: "5 minutes ago",
      icon: Pill,
      color: "text-green-600"
    },
    {
      id: 3,
      type: "inventory",
      message: "Low stock alert: Contact lens solution",
      time: "10 minutes ago",
      icon: AlertTriangle,
      color: "text-amber-600"
    },
    {
      id: 4,
      type: "patient",
      message: "Patient check-in: Sarah Johnson",
      time: "15 minutes ago",
      icon: UserCheck,
      color: "text-emerald-600"
    },
    {
      id: 5,
      type: "billing",
      message: "Payment received: $450 - Frame + Lenses",
      time: "20 minutes ago",
      icon: DollarSign,
      color: "text-purple-600"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header 
        title="Medical Practice Dashboard" 
        subtitle={`Welcome back! Here's what's happening at OptiCare Medical Center today, ${format(new Date(), 'MMMM dd, yyyy')}`}
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Today's Revenue</p>
                    <p className="text-2xl font-bold text-slate-900">${kpis?.todayRevenue?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-emerald-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12% from yesterday
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="text-green-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Appointments Today</p>
                    <p className="text-2xl font-bold text-slate-900">{kpis?.appointmentsToday || 0}</p>
                    <p className="text-xs text-blue-600 flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {kpis?.pendingAppointments || 0} pending
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="text-blue-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Patients</p>
                    <p className="text-2xl font-bold text-slate-900">{kpis?.totalPatients?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-purple-600 flex items-center mt-1">
                      <Heart className="h-3 w-3 mr-1" />
                      Active patients
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="text-purple-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Staff Present</p>
                    <p className="text-2xl font-bold text-slate-900">{kpis?.staffPresent || 0}</p>
                    <p className="text-xs text-emerald-600 flex items-center mt-1">
                      <UserCheck className="h-3 w-3 mr-1" />
                      On duty today
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <UserCheck className="text-emerald-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Medical Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Prescriptions Issued</p>
                    <p className="text-2xl font-bold text-slate-900">{kpis?.totalPrescriptions || 0}</p>
                    <p className="text-xs text-teal-600">This month</p>
                  </div>
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <Pill className="text-teal-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Eye Exams</p>
                    <p className="text-2xl font-bold text-slate-900">156</p>
                    <p className="text-xs text-indigo-600">This month</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Eye className="text-indigo-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Medical Reports</p>
                    <p className="text-2xl font-bold text-slate-900">89</p>
                    <p className="text-xs text-rose-600">Generated today</p>
                  </div>
                  <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                    <FileText className="text-rose-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert Cards */}
          {(kpis?.lowStockItems || 0) > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="text-amber-600 h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900">Inventory Alert</h3>
                    <p className="text-amber-700">
                      {kpis?.lowStockItems || 0} items are running low on stock. Review inventory levels.
                    </p>
                  </div>
                  <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                    View Inventory
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Activities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <activity.icon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900">{activity.message}</p>
                        <p className="text-xs text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-600 hover:bg-blue-700">
                    <Calendar className="h-6 w-6" />
                    <span className="text-sm">New Appointment</span>
                  </Button>
                  
                  <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-emerald-600 hover:bg-emerald-700">
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Add Patient</span>
                  </Button>
                  
                  <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-purple-600 hover:bg-purple-700">
                    <Pill className="h-6 w-6" />
                    <span className="text-sm">New Prescription</span>
                  </Button>
                  
                  <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-teal-600 hover:bg-teal-700">
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Generate Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>System Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-green-900">Database</p>
                    <p className="text-sm text-green-700">Connected</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-green-900">Email Service</p>
                    <p className="text-sm text-green-700">Active</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-yellow-900">Backup System</p>
                    <p className="text-sm text-yellow-700">Scheduled</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-blue-900">API Status</p>
                    <p className="text-sm text-blue-700">Operational</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}