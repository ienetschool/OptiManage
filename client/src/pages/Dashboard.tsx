import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  Calendar, 
  Users, 
  Package,
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Bell,
  Settings,
  Plus,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download,
  RefreshCw,
  Store,
  UserCheck,
  FileText,
  Stethoscope
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from "recharts";

interface DashboardKPIs {
  dailySales: number;
  appointmentsToday: number;
  totalPatients: number;
  lowStockItems: number;
  monthlyRevenue: number;
  appointmentsThisWeek: number;
  newPatientsThisMonth: number;
  prescriptionsPending: number;
}

const salesData = [
  { name: 'Mon', sales: 1200, appointments: 8 },
  { name: 'Tue', sales: 1800, appointments: 12 },
  { name: 'Wed', sales: 1500, appointments: 10 },
  { name: 'Thu', sales: 2200, appointments: 15 },
  { name: 'Fri', sales: 2800, appointments: 18 },
  { name: 'Sat', sales: 3200, appointments: 22 },
  { name: 'Sun', sales: 1800, appointments: 14 },
];

const appointmentTypes = [
  { name: 'Eye Exams', value: 45, color: '#0088FE' },
  { name: 'Contact Fittings', value: 25, color: '#00C49F' },
  { name: 'Follow-ups', value: 20, color: '#FFBB28' },
  { name: 'Emergencies', value: 10, color: '#FF8042' },
];

const recentActivities = [
  {
    id: 1,
    type: 'appointment',
    title: 'New appointment scheduled',
    description: 'Sarah Johnson - Eye Exam',
    time: '5 minutes ago',
    icon: Calendar,
    color: 'text-blue-500'
  },
  {
    id: 2,
    type: 'sale',
    title: 'Sale completed',
    description: 'Designer frames - $299',
    time: '12 minutes ago',
    icon: DollarSign,
    color: 'text-green-500'
  },
  {
    id: 3,
    type: 'patient',
    title: 'New patient registered',
    description: 'Michael Chen added to system',
    time: '25 minutes ago',
    icon: Users,
    color: 'text-purple-500'
  },
  {
    id: 4,
    type: 'inventory',
    title: 'Low stock alert',
    description: 'Contact lens solution - 5 units left',
    time: '1 hour ago',
    icon: Package,
    color: 'text-orange-500'
  },
  {
    id: 5,
    type: 'prescription',
    title: 'Prescription ready',
    description: 'Emily Rodriguez - Progressive lenses',
    time: '2 hours ago',
    icon: FileText,
    color: 'text-indigo-500'
  }
];

const quickActions = [
  { title: 'New Appointment', icon: Calendar, color: 'bg-blue-500', action: '/patients' },
  { title: 'Add Patient', icon: Users, color: 'bg-green-500', action: '/patients' },
  { title: 'Quick Sale', icon: DollarSign, color: 'bg-purple-500', action: '/invoices' },
  { title: 'View Inventory', icon: Package, color: 'bg-orange-500', action: '/inventory' },
  { title: 'Staff Check-in', icon: UserCheck, color: 'bg-teal-500', action: '/attendance' },
  { title: 'New Prescription', icon: Stethoscope, color: 'bg-pink-500', action: '/prescriptions' },
];

export default function Dashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [selectedStore, setSelectedStore] = useState("all");

  const { data: kpis, isLoading: kpisLoading } = useQuery<DashboardKPIs>({
    queryKey: ["/api/dashboard/kpis"],
  });

  const { data: recentAppointments = [] } = useQuery({
    queryKey: ["/api/appointments", { limit: 5, recent: true }],
  });

  const { data: recentSales = [] } = useQuery({
    queryKey: ["/api/sales", { limit: 5, recent: true }],
  });

  const { data: lowStockItems = [] } = useQuery({
    queryKey: ["/api/inventory/low-stock"],
  });

  if (kpisLoading) {
    return (
      <>
        <Header title="Dashboard" subtitle="Welcome back! Here's your practice overview." />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-16 bg-slate-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header 
        title="Dashboard" 
        subtitle="Welcome back! Here's your practice overview and key metrics."
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Top Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-wrap items-center gap-4">
              <select 
                className="px-3 py-2 border border-slate-300 rounded-md text-sm"
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
              >
                <option value="all">All Stores</option>
                <option value="downtown">Downtown Clinic</option>
                <option value="westside">Westside Branch</option>
                <option value="family">Family Center</option>
              </select>
              
              <select 
                className="px-3 py-2 border border-slate-300 rounded-md text-sm"
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
              >
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Today's Revenue</p>
                    <p className="text-2xl font-bold">${(kpis?.dailySales || 0).toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+12.5% from yesterday</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Today's Appointments</p>
                    <p className="text-2xl font-bold">{kpis?.appointmentsToday || 0}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+8.3% from yesterday</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Patients</p>
                    <p className="text-2xl font-bold">{(kpis?.totalPatients || 0).toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <Users className="h-4 w-4 text-purple-500 mr-1" />
                      <span className="text-sm text-slate-600">{kpis?.newPatientsThisMonth || 0} new this month</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Low Stock Items</p>
                    <p className="text-2xl font-bold">{kpis?.lowStockItems || 0}</p>
                    <div className="flex items-center mt-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 mr-1" />
                      <span className="text-sm text-orange-600">Requires attention</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-20 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow"
                    onClick={() => window.location.href = action.action}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${action.color}`}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs text-center">{action.title}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="h-5 w-5" />
                  <span>Sales & Appointments Trend</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Sales ($)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="appointments" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Appointments"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Appointment Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Appointment Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={appointmentTypes}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}: {name: string; percent: number}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {appointmentTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity and Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center`}>
                        <activity.icon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                        <p className="text-sm text-slate-500">{activity.description}</p>
                        <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alerts and Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Alerts & Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">Low Stock Alert</p>
                      <p className="text-sm text-orange-700">{kpis?.lowStockItems || 0} items need restocking</p>
                      <Button variant="link" size="sm" className="p-0 h-auto text-orange-600">
                        View Details
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Upcoming Appointments</p>
                      <p className="text-sm text-blue-700">{kpis?.appointmentsToday || 0} appointments scheduled for today</p>
                      <Button variant="link" size="sm" className="p-0 h-auto text-blue-600">
                        View Schedule
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">System Status</p>
                      <p className="text-sm text-green-700">All systems operational</p>
                      <Button variant="link" size="sm" className="p-0 h-auto text-green-600">
                        View Health
                      </Button>
                    </div>
                  </div>

                  {kpis?.prescriptionsPending && kpis.prescriptionsPending > 0 && (
                    <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                      <FileText className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-purple-900">Pending Prescriptions</p>
                        <p className="text-sm text-purple-700">{kpis.prescriptionsPending} prescriptions awaiting review</p>
                        <Button variant="link" size="sm" className="p-0 h-auto text-purple-600">
                          Review Now
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ${(kpis?.monthlyRevenue || 0).toLocaleString()}
                </div>
                <Progress value={75} className="mb-2" />
                <p className="text-sm text-slate-500">75% of monthly goal ($50K)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Patient Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">4.9/5.0</div>
                <Progress value={98} className="mb-2" />
                <p className="text-sm text-slate-500">Based on 247 reviews this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Appointment Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">92%</div>
                <Progress value={92} className="mb-2" />
                <p className="text-sm text-slate-500">On-time appointments this week</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}