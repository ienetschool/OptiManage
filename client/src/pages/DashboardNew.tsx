import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Eye, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Plus
} from "lucide-react";

export default function DashboardNew() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Patients",
      value: dashboardData?.totalPatients || "0",
      description: "+12% from last month",
      icon: Users,
      trend: "up"
    },
    {
      title: "Appointments Today",
      value: dashboardData?.totalAppointments || "0",
      description: "3 pending confirmation",
      icon: Calendar,
      trend: "stable"
    },
    {
      title: "Monthly Revenue",
      value: `$${dashboardData?.totalRevenue || "0"}`,
      description: "+20.1% from last month",
      icon: DollarSign,
      trend: "up"
    },
    {
      title: "Active Orders",
      value: "24",
      description: "8 in production",
      icon: Eye,
      trend: "up"
    }
  ];

  const recentActivity = [
    {
      id: "1",
      type: "appointment",
      title: "New appointment scheduled",
      description: "Sarah Johnson - Eye Exam",
      time: "2 minutes ago",
      status: "success"
    },
    {
      id: "2", 
      type: "order",
      title: "Specs order completed",
      description: "Order #SO-2024-001 - Progressive Lenses",
      time: "15 minutes ago",
      status: "success"
    },
    {
      id: "3",
      type: "alert",
      title: "Low inventory alert",
      description: "Ray-Ban Classic Frames running low",
      time: "1 hour ago",
      status: "warning"
    },
    {
      id: "4",
      type: "payment",
      title: "Payment received",
      description: "$450.00 from John Smith",
      time: "2 hours ago",
      status: "success"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's what's happening at your practice.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Patient
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Appointment
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${
                stat.trend === 'up' ? 'text-green-600' : 
                stat.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className={`mt-1 rounded-full p-2 ${
                    activity.status === 'success' ? 'bg-green-100 text-green-600' :
                    activity.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {activity.status === 'success' ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : activity.status === 'warning' ? (
                      <AlertCircle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used functions for faster workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Add New Patient
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Eye className="mr-2 h-4 w-4" />
              Create Specs Order
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="mr-2 h-4 w-4" />
              Generate Invoice
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current system performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Database Connection</span>
                <Badge variant="default">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Payment Gateway</span>
                <Badge variant="default">Online</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Email Service</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Backup Status</span>
                <Badge variant="secondary">Last: 2 hours ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Upcoming appointments and tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Dr. Smith - Eye Exams</p>
                  <p className="text-xs text-muted-foreground">9:00 AM - 12:00 PM</p>
                </div>
                <Badge variant="default">3 patients</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Lens Cutting</p>
                  <p className="text-xs text-muted-foreground">2:00 PM - 4:00 PM</p>
                </div>
                <Badge variant="secondary">5 orders</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Frame Fitting</p>
                  <p className="text-xs text-muted-foreground">4:30 PM - 6:00 PM</p>
                </div>
                <Badge variant="outline">2 appointments</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}