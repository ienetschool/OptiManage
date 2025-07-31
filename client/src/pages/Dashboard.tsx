import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Calendar,
  DollarSign,
  Eye,
  Package,
  TrendingUp,
  Users,
  AlertTriangle,
  Clock,
  MapPin,
  ChevronRight,
  Plus,
  Search,
  Filter,
  CalendarPlus,
  UserPlus,
  Receipt,
  Stethoscope,
  Heart,
  Brain,
  Building,
  BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import QuickSale from "./QuickSale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const salesData = [
  { name: 'Jan', sales: 4000, revenue: 2400 },
  { name: 'Feb', sales: 3000, revenue: 1398 },
  { name: 'Mar', sales: 2000, revenue: 9800 },
  { name: 'Apr', sales: 2780, revenue: 3908 },
  { name: 'May', sales: 1890, revenue: 4800 },
  { name: 'Jun', sales: 2390, revenue: 3800 },
];

const appointmentData = [
  { name: 'Mon', appointments: 12 },
  { name: 'Tue', appointments: 19 },
  { name: 'Wed', appointments: 3 },
  { name: 'Thu', appointments: 5 },
  { name: 'Fri', appointments: 2 },
  { name: 'Sat', appointments: 8 },
  { name: 'Sun', appointments: 1 },
];

const serviceData = [
  { name: 'Eye Exams', value: 45, color: '#0088FE' },
  { name: 'Glasses', value: 30, color: '#00C49F' },
  { name: 'Contacts', value: 20, color: '#FFBB28' },
  { name: 'Surgery', value: 5, color: '#FF8042' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard() {
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7d');
  const [quickSaleOpen, setQuickSaleOpen] = useState(false);
  const [, navigate] = useLocation();

  const { data: stores = [] } = useQuery<{id: string; name: string}[]>({
    queryKey: ["/api/stores"],
  });

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["/api/dashboard", selectedStore, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStore !== 'all') params.append('storeId', selectedStore);
      params.append('dateRange', dateRange);
      
      const response = await fetch(`/api/dashboard?${params}`);
      if (!response.ok) {
        // Return fallback data if API fails
        return {
          totalSales: 24500,
          totalAppointments: 48,
          totalPatients: 156,
          totalRevenue: 18200,
          salesGrowth: 12.5,
          appointmentGrowth: 8.3,
          patientGrowth: 15.2,
          revenueGrowth: 9.7
        };
      }
      return response.json();
    }
  });

  const recentAppointments = [
    {
      id: "1",
      patient: "Sarah Johnson",
      time: "10:00 AM",
      service: "Eye Exam",
      doctor: "Dr. Smith",
      status: "confirmed"
    },
    {
      id: "2", 
      patient: "Michael Chen",
      time: "2:00 PM",
      service: "Contact Fitting",
      doctor: "Dr. Rodriguez",
      status: "pending"
    },
    {
      id: "3",
      patient: "Emma Wilson",
      time: "3:30 PM", 
      service: "Follow-up",
      doctor: "Dr. Smith",
      status: "completed"
    }
  ];

  const recentSales = [
    {
      id: "1",
      customer: "John Doe",
      amount: 299.99,
      items: "Prescription Glasses",
      timestamp: "2 hours ago"
    },
    {
      id: "2",
      customer: "Jane Smith", 
      amount: 89.99,
      items: "Contact Lenses",
      timestamp: "4 hours ago"
    },
    {
      id: "3",
      customer: "Bob Johnson",
      amount: 450.00,
      items: "Designer Frames",
      timestamp: "6 hours ago"
    }
  ];

  const quickActions = [
    {
      title: "Schedule Appointment",
      description: "Book new patient visit",
      icon: CalendarPlus,
      action: () => navigate("/appointments"),
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Add Patient",
      description: "Register new patient",
      icon: UserPlus, 
      action: () => navigate("/patients"),
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Process Sale",
      description: "Quick sale transaction",
      icon: Receipt,
      action: () => setQuickSaleOpen(true),
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Medical Record",
      description: "Update patient record",
      icon: Stethoscope,
      action: () => navigate("/medical-records"),
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto bg-slate-50">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Welcome back! Here's what's happening at your practice.</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select store" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData?.totalRevenue?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.appointmentsToday || 0} scheduled today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalPatients || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.systemHealth || 0}%</div>
            <Progress value={dashboardData?.systemHealth || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used functions for faster workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className={`h-24 flex flex-col items-center justify-center space-y-2 hover:bg-slate-50 border-2 hover:border-slate-300 transition-all`}
                onClick={action.action}
              >
                <action.icon className="h-8 w-8 text-slate-600" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-slate-500">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue and sales trends</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
            <CardDescription>Breakdown of services provided</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>Today's scheduled appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center space-x-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{appointment.patient}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.time} • {appointment.service}
                    </p>
                  </div>
                  <Badge variant={
                    appointment.status === 'confirmed' ? 'default' :
                    appointment.status === 'pending' ? 'secondary' : 'outline'
                  }>
                    {appointment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Latest transactions and purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center space-x-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/api/placeholder/36/36" />
                    <AvatarFallback>{sale.customer.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{sale.customer}</p>
                    <p className="text-sm text-muted-foreground">{sale.items}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${sale.amount}</p>
                    <p className="text-xs text-muted-foreground">{sale.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Notifications */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              {dashboardData?.lowStockItems || 0} items running low
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate("/inventory")}>
              View Inventory
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 text-blue-500 mr-2" />
              Pending Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              {dashboardData?.pendingInvoices || 0} invoices awaiting payment
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate("/billing")}>
              Manage Billing
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 text-green-500 mr-2" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              {dashboardData?.appointmentsToday || 0} appointments scheduled
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate("/appointments")}>
              View Calendar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Sale Modal */}
      <Dialog open={quickSaleOpen} onOpenChange={setQuickSaleOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quick Sale</DialogTitle>
          </DialogHeader>
          <QuickSale onClose={() => setQuickSaleOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}