import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, Package, Users, TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface KPIData {
  dailySales: number;
  appointmentsToday: number;
  lowStockItems: number;
  activeCustomers: number;
}

export default function Dashboard() {
  const { data: kpis, isLoading } = useQuery<KPIData>({
    queryKey: ["/api/dashboard/kpis"],
  });

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Daily Sales",
      value: `$${kpis?.dailySales?.toLocaleString() || 0}`,
      change: "+8.2% from yesterday",
      changeType: "positive" as const,
      icon: DollarSign,
      bgColor: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "Appointments Today",
      value: kpis?.appointmentsToday || 0,
      change: "6 remaining",
      changeType: "neutral" as const,
      icon: Calendar,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Low Stock Items",
      value: kpis?.lowStockItems || 0,
      change: "Needs attention",
      changeType: "warning" as const,
      icon: Package,
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Active Customers",
      value: kpis?.activeCustomers?.toLocaleString() || 0,
      change: "+12 new this week",
      changeType: "positive" as const,
      icon: Users,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <>
      <Header 
        title="Dashboard Overview" 
        subtitle="Welcome back! Here's what's happening across your stores today." 
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">{card.title}</p>
                      <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                      <p className={`text-sm font-medium mt-1 ${
                        card.changeType === 'positive' ? 'text-emerald-600' :
                        card.changeType === 'warning' ? 'text-amber-600' :
                        'text-blue-600'
                      }`}>
                        {card.changeType === 'positive' && <TrendingUp className="inline mr-1 h-3 w-3" />}
                        {card.changeType === 'warning' && <AlertTriangle className="inline mr-1 h-3 w-3" />}
                        {card.changeType === 'neutral' && <Calendar className="inline mr-1 h-3 w-3" />}
                        {card.change}
                      </p>
                    </div>
                    <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                      <Icon className={`${card.iconColor} h-6 w-6`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sales Chart */}
          <Card className="lg:col-span-2 border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sales Performance</CardTitle>
                <Select defaultValue="7days">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="3months">Last 3 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                <p className="text-slate-500">Sales Chart Visualization</p>
              </div>
            </CardContent>
          </Card>

          {/* Store Performance */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Store Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Downtown Store</p>
                    <p className="text-sm text-slate-600">Main Street, Downtown</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">$4,250</p>
                    <p className="text-xs text-slate-500">Today</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Mall Location</p>
                    <p className="text-sm text-slate-600">Westfield Shopping Center</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">$3,890</p>
                    <p className="text-xs text-slate-500">Today</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Suburb Branch</p>
                    <p className="text-sm text-slate-600">Oak Avenue, Suburbs</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">$2,310</p>
                    <p className="text-xs text-slate-500">Today</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Appointments */}
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Today's Appointments</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 border border-slate-200 rounded-lg">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Sarah Johnson</p>
                    <p className="text-sm text-slate-600">Eye Exam & Frame Selection</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">2:30 PM</p>
                    <p className="text-xs text-slate-500">Downtown Store</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 border border-slate-200 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Michael Chen</p>
                    <p className="text-sm text-slate-600">Contact Lens Fitting</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">3:00 PM</p>
                    <p className="text-xs text-slate-500">Mall Location</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 border border-slate-200 rounded-lg">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Emma Wilson</p>
                    <p className="text-sm text-slate-600">Frame Repair & Adjustment</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">3:45 PM</p>
                    <p className="text-xs text-slate-500">Suburb Branch</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Alerts */}
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Inventory Alerts</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  Manage inventory
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="text-red-600 h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Ray-Ban Aviator Classic</p>
                    <p className="text-sm text-red-600">Only 2 units left in Downtown Store</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                    Reorder
                  </Button>
                </div>

                <div className="flex items-center space-x-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="text-amber-600 h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Progressive Lenses (Premium)</p>
                    <p className="text-sm text-amber-600">Low stock across all stores</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                    Reorder
                  </Button>
                </div>

                <div className="flex items-center space-x-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Info className="text-blue-600 h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Contact Lens Solution</p>
                    <p className="text-sm text-blue-600">Shipment arriving tomorrow</p>
                  </div>
                  <span className="text-emerald-600 text-sm font-medium">
                    <CheckCircle className="inline mr-1 h-3 w-3" />
                    Tracked
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
