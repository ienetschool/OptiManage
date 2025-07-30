import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ShoppingCart, Search, Eye, TrendingUp, DollarSign, Receipt, CreditCard } from "lucide-react";
import { format } from "date-fns";
import type { Sale, Product, Customer, Store } from "@shared/schema";

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  const { data: sales = [], isLoading: salesLoading } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: stores = [] } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
  });

  // Mock data for demo purposes
  const mockSales = [
    {
      id: "1",
      storeId: "store1",
      customerId: "cust1",
      staffId: "staff1",
      subtotal: "149.99",
      taxAmount: "12.75",
      total: "162.74",
      paymentMethod: "card",
      paymentStatus: "completed",
      createdAt: new Date().toISOString(),
      notes: null,
    },
    {
      id: "2", 
      storeId: "store1",
      customerId: null,
      staffId: "staff1", 
      subtotal: "89.99",
      taxAmount: "7.65",
      total: "97.64",
      paymentMethod: "cash",
      paymentStatus: "completed",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      notes: null,
    },
    {
      id: "3",
      storeId: "store2", 
      customerId: "cust2",
      staffId: "staff2",
      subtotal: "299.99",
      taxAmount: "25.50", 
      total: "325.49",
      paymentMethod: "card",
      paymentStatus: "completed",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      notes: "Progressive lenses with anti-glare coating",
    }
  ];

  const filteredSales = mockSales.filter(sale => 
    sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSales = mockSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
  const avgOrderValue = totalSales / mockSales.length;
  const cashSales = mockSales.filter(sale => sale.paymentMethod === 'cash').length;
  const cardSales = mockSales.filter(sale => sale.paymentMethod === 'card').length;

  if (salesLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header 
        title="Sales Management" 
        subtitle="Process sales, view transaction history, and manage customer orders." 
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="returns">Returns</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">Today's Sales</p>
                      <p className="text-2xl font-bold text-slate-900">${totalSales.toFixed(2)}</p>
                      <p className="text-sm font-medium text-emerald-600 mt-1">
                        <TrendingUp className="inline mr-1 h-3 w-3" />
                        +12.5% from yesterday
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
                      <p className="text-slate-600 text-sm font-medium">Transactions</p>
                      <p className="text-2xl font-bold text-slate-900">{mockSales.length}</p>
                      <p className="text-sm font-medium text-blue-600 mt-1">
                        <Receipt className="inline mr-1 h-3 w-3" />
                        Today's count
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="text-blue-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">Avg. Order Value</p>
                      <p className="text-2xl font-bold text-slate-900">${avgOrderValue.toFixed(2)}</p>
                      <p className="text-sm font-medium text-purple-600 mt-1">
                        <TrendingUp className="inline mr-1 h-3 w-3" />
                        +8.2% this week
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="text-purple-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">Payment Mix</p>
                      <p className="text-2xl font-bold text-slate-900">{cardSales}/{cashSales}</p>
                      <p className="text-sm font-medium text-amber-600 mt-1">
                        <CreditCard className="inline mr-1 h-3 w-3" />
                        Card/Cash ratio
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <CreditCard className="text-amber-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Sales */}
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Sales</CardTitle>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    View all transactions
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSales.slice(0, 5).map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Receipt className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              Sale #{sale.id.padStart(6, '0')}
                            </p>
                            <p className="text-sm text-slate-600">
                              {format(new Date(sale.createdAt), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">${sale.total}</p>
                          <Badge variant={sale.paymentMethod === 'card' ? 'default' : 'secondary'}>
                            {sale.paymentMethod.toUpperCase()}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">All Transactions</h3>
                <p className="text-sm text-slate-600">View and search transaction history</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
                
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Transactions Table */}
            <Card className="border-slate-200">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-slate-900">Transaction ID</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-900">Date & Time</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-900">Customer</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-900">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-900">Payment</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-50">
                          <td className="py-4 px-4">
                            <span className="font-mono text-sm">#{sale.id.padStart(6, '0')}</span>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-600">
                            {format(new Date(sale.createdAt), 'MMM dd, yyyy HH:mm')}
                          </td>
                          <td className="py-4 px-4 text-sm">
                            {sale.customerId ? 'Registered Customer' : 'Walk-in Customer'}
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-slate-900">${sale.total}</span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={sale.paymentMethod === 'card' ? 'default' : 'secondary'}>
                              {sale.paymentMethod.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                              COMPLETED
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Receipt className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {filteredSales.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No transactions found</h3>
                <p className="text-slate-600">Try adjusting your search criteria or date range.</p>
              </div>
            )}
          </TabsContent>

          {/* Returns Tab */}
          <TabsContent value="returns" className="space-y-6">
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Returns & Refunds</h3>
              <p className="text-slate-600 mb-6">Manage product returns and process refunds.</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Process Return
              </Button>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Sales Reports</h3>
              <p className="text-slate-600 mb-6">Generate detailed sales reports and analytics.</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Generate Report
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
