import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  ShoppingBag, 
  Calendar,
  Download,
  FileText,
  PieChart,
  Activity,
  Target,
  Award
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");
  const [selectedStore, setSelectedStore] = useState("all");

  const { data: stores = [] } = useQuery({
    queryKey: ["/api/stores"],
  });

  // Mock data for comprehensive analytics
  const salesData = {
    totalRevenue: 45230.50,
    totalTransactions: 156,
    avgOrderValue: 289.94,
    topProducts: [
      { name: "Ray-Ban Aviator", sales: 45, revenue: 6735.00 },
      { name: "Oakley Holbrook", sales: 38, revenue: 5510.00 },
      { name: "Gucci Glasses", sales: 22, revenue: 8800.00 },
      { name: "Progressive Lenses", sales: 67, revenue: 12030.00 },
      { name: "Contact Lenses", sales: 89, revenue: 2670.00 }
    ],
    monthlyTrend: [
      { month: "Jan", revenue: 32450 },
      { month: "Feb", revenue: 28900 },
      { month: "Mar", revenue: 35600 },
      { month: "Apr", revenue: 42300 },
      { month: "May", revenue: 45230 }
    ]
  };

  const customerData = {
    totalCustomers: 428,
    newCustomers: 32,
    loyaltyDistribution: {
      bronze: 245,
      silver: 124,
      gold: 59
    },
    customerRetention: 78.5,
    avgLifetimeValue: 542.30
  };

  const appointmentData = {
    totalAppointments: 89,
    completionRate: 85.4,
    noShowRate: 8.2,
    popularServices: [
      { service: "Eye Exam", count: 35 },
      { service: "Contact Lens Fitting", count: 22 },
      { service: "Frame Fitting", count: 18 },
      { service: "Frame Repair", count: 14 }
    ]
  };

  const inventoryData = {
    totalProducts: 1247,
    lowStockItems: 23,
    outOfStock: 5,
    topCategories: [
      { category: "Sunglasses", count: 445, value: 125600 },
      { category: "Eyeglasses", count: 398, value: 189300 },
      { category: "Contact Lenses", count: 234, value: 34200 },
      { category: "Accessories", count: 170, value: 12800 }
    ]
  };

  const generateReport = (type: string) => {
    console.log(`Generating ${type} report...`);
    // In a real app, this would trigger report generation
  };

  return (
    <>
      <Header 
        title="Reports & Analytics" 
        subtitle="Generate comprehensive business reports and analyze performance data." 
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Business Analytics</h3>
            <p className="text-sm text-slate-600">Comprehensive insights across all business operations</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="thisWeek">This Week</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {stores.map((store: any) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="custom">Custom Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Executive Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">Total Revenue</p>
                      <p className="text-2xl font-bold text-slate-900">${salesData.totalRevenue.toLocaleString()}</p>
                      <p className="text-sm font-medium text-emerald-600 mt-1">
                        <TrendingUp className="inline mr-1 h-3 w-3" />
                        +12.3% vs last month
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="text-emerald-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">Total Customers</p>
                      <p className="text-2xl font-bold text-slate-900">{customerData.totalCustomers}</p>
                      <p className="text-sm font-medium text-blue-600 mt-1">
                        <Users className="inline mr-1 h-3 w-3" />
                        +{customerData.newCustomers} new this month
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="text-blue-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">Appointments</p>
                      <p className="text-2xl font-bold text-slate-900">{appointmentData.totalAppointments}</p>
                      <p className="text-sm font-medium text-purple-600 mt-1">
                        <Calendar className="inline mr-1 h-3 w-3" />
                        {appointmentData.completionRate}% completion rate
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Calendar className="text-purple-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">Avg Order Value</p>
                      <p className="text-2xl font-bold text-slate-900">${salesData.avgOrderValue}</p>
                      <p className="text-sm font-medium text-amber-600 mt-1">
                        <TrendingUp className="inline mr-1 h-3 w-3" />
                        +5.7% vs last month
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="text-amber-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Customer Retention Rate</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-600 h-2 rounded-full" 
                          style={{ width: `${customerData.customerRetention}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-emerald-600">
                        {customerData.customerRetention}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Appointment Completion</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${appointmentData.completionRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-blue-600">
                        {appointmentData.completionRate}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Inventory Turnover</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '68%' }} />
                      </div>
                      <span className="text-sm font-semibold text-purple-600">68%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-5 w-5" />
                    Top Performing Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {inventoryData.topCategories.map((category, index) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{category.category}</p>
                            <p className="text-sm text-slate-600">{category.count} items</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">
                            ${category.value.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Custom Reports Tab */}
          <TabsContent value="custom" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-slate-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-emerald-600 h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Sales Report</h3>
                  <p className="text-sm text-slate-600 mb-4">Detailed sales analytics and performance metrics</p>
                  <Button 
                    onClick={() => generateReport('sales')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users className="text-blue-600 h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Customer Report</h3>
                  <p className="text-sm text-slate-600 mb-4">Customer insights and loyalty program analysis</p>
                  <Button 
                    onClick={() => generateReport('customer')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="text-purple-600 h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Inventory Report</h3>
                  <p className="text-sm text-slate-600 mb-4">Stock levels, turnover rates, and reorder alerts</p>
                  <Button 
                    onClick={() => generateReport('inventory')}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="text-amber-600 h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Appointment Report</h3>
                  <p className="text-sm text-slate-600 mb-4">Booking trends and service performance metrics</p>
                  <Button 
                    onClick={() => generateReport('appointments')}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="text-red-600 h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Financial Report</h3>
                  <p className="text-sm text-slate-600 mb-4">Revenue, expenses, and profit margin analysis</p>
                  <Button 
                    onClick={() => generateReport('financial')}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <PieChart className="text-slate-600 h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Custom Report</h3>
                  <p className="text-sm text-slate-600 mb-4">Build your own custom report with specific metrics</p>
                  <Button 
                    onClick={() => generateReport('custom')}
                    variant="outline"
                    className="w-full"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Create Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
