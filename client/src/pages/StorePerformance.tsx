import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  MapPin,
  Phone,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  Target,
  Calendar,
  Package
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const storeData = [
  {
    id: "1",
    name: "Downtown Medical Center",
    address: "123 Main St, Downtown",
    manager: "Dr. Sarah Johnson",
    phone: "(555) 123-4567",
    status: "active",
    revenue: 125000,
    revenueGrowth: 12.5,
    patients: 450,
    patientGrowth: 8.3,
    appointments: 520,
    appointmentGrowth: 15.2,
    inventory: 95,
    rating: 4.8,
    performance: 92
  },
  {
    id: "2", 
    name: "Westside Eye Clinic",
    address: "456 Oak Ave, Westside",
    manager: "Dr. Michael Chen",
    phone: "(555) 234-5678",
    status: "active",
    revenue: 98000,
    revenueGrowth: -2.1,
    patients: 380,
    patientGrowth: 5.7,
    appointments: 425,
    appointmentGrowth: 7.8,
    inventory: 87,
    rating: 4.6,
    performance: 88
  },
  {
    id: "3",
    name: "North Plaza Vision",
    address: "789 Elm St, North Plaza", 
    manager: "Dr. Emily Rodriguez",
    phone: "(555) 345-6789",
    status: "active",
    revenue: 156000,
    revenueGrowth: 18.9,
    patients: 520,
    patientGrowth: 14.2,
    appointments: 645,
    appointmentGrowth: 22.1,
    inventory: 78,
    rating: 4.9,
    performance: 96
  }
];

const monthlyPerformance = [
  { month: 'Jan', downtown: 120000, westside: 95000, north: 140000 },
  { month: 'Feb', downtown: 115000, westside: 88000, north: 145000 },
  { month: 'Mar', downtown: 125000, westside: 98000, north: 156000 },
  { month: 'Apr', downtown: 118000, westside: 92000, north: 148000 },
  { month: 'May', downtown: 130000, westside: 105000, north: 162000 },
  { month: 'Jun', downtown: 125000, westside: 98000, north: 156000 },
];

export default function StorePerformance() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [sortBy, setSortBy] = useState("revenue");

  const { data: stores = [] } = useQuery<{id: string; name: string; managerId?: string}[]>({
    queryKey: ["/api/stores"],
  });

  const sortedStores = [...storeData].sort((a, b) => {
    switch (sortBy) {
      case "revenue":
        return b.revenue - a.revenue;
      case "patients":
        return b.patients - a.patients;
      case "performance":
        return b.performance - a.performance;
      default:
        return 0;
    }
  });

  const totalRevenue = storeData.reduce((sum, store) => sum + store.revenue, 0);
  const totalPatients = storeData.reduce((sum, store) => sum + store.patients, 0);
  const averageRating = storeData.reduce((sum, store) => sum + store.rating, 0) / storeData.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Store Performance</h1>
          <p className="text-slate-600">Compare performance across all store locations</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="patients">Patients</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Stores</p>
                <p className="text-2xl font-bold text-slate-900">{storeData.length}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Combined Revenue</p>
                <p className="text-2xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Patients</p>
                <p className="text-2xl font-bold text-slate-900">{totalPatients.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Average Rating</p>
                <p className="text-2xl font-bold text-slate-900">{averageRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Comparison</CardTitle>
          <CardDescription>Revenue trends across all store locations</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="downtown" stroke="#0088FE" strokeWidth={2} name="Downtown" />
              <Line type="monotone" dataKey="westside" stroke="#00C49F" strokeWidth={2} name="Westside" />
              <Line type="monotone" dataKey="north" stroke="#FFBB28" strokeWidth={2} name="North Plaza" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Store Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedStores.map((store) => (
          <Card key={store.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{store.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {store.address}
                  </CardDescription>
                </div>
                <Badge variant={store.status === 'active' ? 'default' : 'secondary'}>
                  {store.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Manager Info */}
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>{store.manager.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{store.manager}</p>
                  <div className="flex items-center text-sm text-slate-500">
                    <Phone className="h-3 w-3 mr-1" />
                    {store.phone}
                  </div>
                </div>
              </div>

              {/* Performance Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Performance Score</span>
                  <span className="text-sm font-bold">{store.performance}%</span>
                </div>
                <Progress value={store.performance} className="h-2" />
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-slate-900">${(store.revenue / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-slate-500">Revenue</p>
                  <div className="flex items-center justify-center mt-1">
                    {store.revenueGrowth > 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-600">+{store.revenueGrowth}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                        <span className="text-xs text-red-600">{store.revenueGrowth}%</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{store.patients}</p>
                  <p className="text-xs text-slate-500">Patients</p>
                  <div className="flex items-center justify-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+{store.patientGrowth}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{store.appointments}</p>
                  <p className="text-xs text-slate-500">Appointments</p>
                  <div className="flex items-center justify-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+{store.appointmentGrowth}%</span>
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">{store.rating}</span>
                  </div>
                  <div className="flex items-center">
                    <Package className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-sm">{store.inventory}%</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}