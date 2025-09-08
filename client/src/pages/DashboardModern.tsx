import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingBag,
  Clock,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Heart,
  Star,
  ArrowRight,
  Plus,
  Sparkles,
  Target,
  Award,
  Zap,
  Layers,
  BarChart3
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

import { 
  ModernPageHeader, 
  ModernStatsCard, 
  ModernActionButton, 
  ModernTabHeader,
  ModernProgressBar,
  ModernAlert
} from "@/components/ui/modern-components";

interface DashboardData {
  totalAppointments: number;
  totalPatients: number;
  totalInvoices: number;
  totalRevenue: number;
  monthlyAppointments: number;
  newPatientsThisMonth: number;
  pendingInvoices: number;
  upcomingAppointments: number;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  lastVisit?: string;
  nextAppointment?: string;
}

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  type: string;
}

const DashboardModern: React.FC = () => {
  const [activeTimeframe, setActiveTimeframe] = useState("7d");

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  // Mock chart data
  const revenueData = [
    { month: "Jan", revenue: 65000, patients: 120, appointments: 180 },
    { month: "Feb", revenue: 59000, patients: 110, appointments: 165 },
    { month: "Mar", revenue: 80000, patients: 140, appointments: 200 },
    { month: "Apr", revenue: 81000, patients: 145, appointments: 210 },
    { month: "May", revenue: 56000, patients: 105, appointments: 155 },
    { month: "Jun", revenue: 95000, patients: 165, appointments: 240 },
  ];

  const appointmentStatusData = [
    { name: "Completed", value: 65, color: "#10b981" },
    { name: "Scheduled", value: 25, color: "#3b82f6" },
    { name: "Cancelled", value: 7, color: "#ef4444" },
    { name: "No Show", value: 3, color: "#f59e0b" },
  ];

  const timeframeOptions = [
    { id: "7d", label: "7 Days", icon: Clock },
    { id: "30d", label: "30 Days", icon: Calendar },
    { id: "90d", label: "90 Days", icon: BarChart3 },
    { id: "1y", label: "1 Year", icon: TrendingUp }
  ];

  // Calculate stats
  const stats = {
    totalPatients: dashboardData?.totalPatients || patients.length,
    totalAppointments: dashboardData?.totalAppointments || appointments.length,
    totalRevenue: dashboardData?.totalRevenue || 285000,
    newPatientsThisMonth: dashboardData?.newPatientsThisMonth || 15,
    upcomingAppointments: appointments.filter(apt => 
      new Date(apt.appointmentDate) > new Date()
    ).length,
    completedToday: appointments.filter(apt => 
      apt.status === "completed" && 
      new Date(apt.appointmentDate).toDateString() === new Date().toDateString()
    ).length
  };

  const recentPatients = patients.slice(0, 5);
  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.appointmentDate) > new Date())
    .slice(0, 5);

  return (
    <div className="modern-page-background p-6 space-y-8">
      {/* Modern Header */}
      <ModernPageHeader
        title="Dashboard Overview"
        description="Comprehensive medical practice management and analytics"
        icon={Activity}
        gradient="vibrant"
      >
        <div className="flex space-x-3">
          <ModernActionButton
            variant="success"
            icon={Plus}
            onClick={() => {}}
          >
            Quick Actions
          </ModernActionButton>
          <ModernActionButton
            variant="secondary"
            icon={BarChart3}
            onClick={() => {}}
          >
            View Reports
          </ModernActionButton>
        </div>
      </ModernPageHeader>

      {/* Time Frame Selector */}
      <ModernTabHeader
        tabs={timeframeOptions}
        activeTab={activeTimeframe}
        onChange={setActiveTimeframe}
      />

      {/* Key Performance Indicators */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <ModernStatsCard
          title="Total Patients"
          value={stats.totalPatients}
          change="12%"
          changeType="positive"
          icon={Users}
          color="blue"
        />
        <ModernStatsCard
          title="Revenue This Month"
          value={`$${(stats.totalRevenue / 1000).toFixed(0)}K`}
          change="18%"
          changeType="positive"
          icon={DollarSign}
          color="emerald"
        />
        <ModernStatsCard
          title="Appointments Today"
          value={stats.upcomingAppointments}
          change="5%"
          changeType="positive"
          icon={Calendar}
          color="purple"
        />
        <ModernStatsCard
          title="Completed Today"
          value={stats.completedToday}
          change="8%"
          changeType="positive"
          icon={CheckCircle2}
          color="amber"
        />
      </motion.div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Patient Satisfaction */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gradient-primary">
              <Heart className="h-5 w-5" />
              <span>Patient Satisfaction</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold">4.8/5.0</div>
              <ModernProgressBar value={96} color="emerald" label="Satisfaction Rate" />
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm text-gray-600">Based on 234 reviews</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Goals */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gradient-primary">
              <Target className="h-5 w-5" />
              <span>Monthly Goals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>New Patients</span>
                  <span>15/20</span>
                </div>
                <ModernProgressBar value={75} color="blue" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Revenue Target</span>
                  <span>$85K/$100K</span>
                </div>
                <ModernProgressBar value={85} color="emerald" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Appointments</span>
                  <span>180/200</span>
                </div>
                <ModernProgressBar value={90} color="purple" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gradient-primary">
              <Zap className="h-5 w-5" />
              <span>Quick Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Wait Time</span>
                <Badge variant="secondary">12 min</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <Badge className="bg-emerald-100 text-emerald-700">97%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">No-Show Rate</span>
                <Badge variant="outline">3%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Staff</span>
                <Badge className="bg-blue-100 text-blue-700">8/10</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Revenue Chart */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gradient-primary">
              <TrendingUp className="h-5 w-5" />
              <span>Revenue Trend</span>
            </CardTitle>
            <CardDescription>Monthly revenue and patient growth</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0ea5e9" 
                  fillOpacity={1} 
                  fill="url(#revenueGradient)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Appointment Status */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gradient-primary">
              <Layers className="h-5 w-5" />
              <span>Appointment Status</span>
            </CardTitle>
            <CardDescription>Current month breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {appointmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {appointmentStatusData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Recent Patients */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gradient-primary">
                <Users className="h-5 w-5" />
                <span>Recent Patients</span>
              </div>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPatients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {patient.firstName[0]}{patient.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">
                      {patient.firstName} {patient.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{patient.email}</div>
                  </div>
                  <Badge variant="outline">New</Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gradient-primary">
                <Calendar className="h-5 w-5" />
                <span>Upcoming Appointments</span>
              </div>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No upcoming appointments</p>
                </div>
              ) : (
                upcomingAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center text-white">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{appointment.patientName}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                      </div>
                    </div>
                    <Badge 
                      className={`${
                        appointment.status === 'scheduled' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {appointment.status}
                    </Badge>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alerts and Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <ModernAlert
          type="info"
          title="System Update Available"
          message="A new version of OptiStore Pro is available with enhanced features and security improvements."
        />
        <ModernAlert
          type="success"
          title="Backup Completed"
          message="Your daily data backup has been completed successfully. All patient records are secure."
        />
      </motion.div>
    </div>
  );
};

export default DashboardModern;