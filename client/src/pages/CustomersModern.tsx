import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  CreditCard,
  Star,
  Activity,
  TrendingUp,
  User
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { 
  ModernPageHeader, 
  ModernStatsCard, 
  ModernActionButton, 
  ModernTabHeader 
} from "@/components/ui/modern-components";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth?: string;
  totalPurchases?: number;
  lastPurchase?: string;
  customerType?: 'regular' | 'vip' | 'premium';
  loyaltyPoints?: number;
  isActive?: boolean;
}

const CustomersModern: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch customers
  const { data: customers = [], isLoading, error } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Filter and sort customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    const matchesFilter = filterType === "all" || 
      (filterType === "vip" && customer.customerType === "vip") ||
      (filterType === "premium" && customer.customerType === "premium") ||
      (filterType === "regular" && customer.customerType === "regular") ||
      (filterType === "active" && customer.isActive !== false);
    
    return matchesSearch && matchesFilter;
  });

  // Sort customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      case "purchases":
        return (b.totalPurchases || 0) - (a.totalPurchases || 0);
      case "recent":
        return new Date(b.lastPurchase || 0).getTime() - new Date(a.lastPurchase || 0).getTime();
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedCustomers.length / pageSize);
  const paginatedCustomers = sortedCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Statistics
  const stats = {
    total: customers.length,
    vip: customers.filter(c => c.customerType === 'vip').length,
    premium: customers.filter(c => c.customerType === 'premium').length,
    active: customers.filter(c => c.isActive !== false).length,
    totalRevenue: customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0)
  };

  // Tab configuration
  const tabs = [
    { id: "all", label: "All Customers", icon: Users, count: stats.total },
    { id: "vip", label: "VIP", icon: Star, count: stats.vip },
    { id: "premium", label: "Premium", icon: CreditCard, count: stats.premium },
    { id: "active", label: "Active", icon: Activity, count: stats.active }
  ];

  const getCustomerTypeColor = (type?: string) => {
    switch (type) {
      case 'vip': return 'bg-yellow-100 text-yellow-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'regular': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCustomerTypeIcon = (type?: string) => {
    switch (type) {
      case 'vip': return Star;
      case 'premium': return CreditCard;
      default: return User;
    }
  };

  return (
    <div className="modern-page-background p-6 space-y-8">
      {/* Modern Header */}
      <ModernPageHeader
        title="Customer Management"
        description="Comprehensive customer relationship management and analytics"
        icon={Users}
        gradient="primary"
      >
        <ModernActionButton
          variant="success"
          size="lg"
          icon={UserPlus}
          onClick={() => {}}
          className="shadow-2xl"
        >
          Add New Customer
        </ModernActionButton>
      </ModernPageHeader>

      {/* Statistics Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <ModernStatsCard
          title="Total Customers"
          value={stats.total}
          change="8%"
          changeType="positive"
          icon={Users}
          color="blue"
        />
        <ModernStatsCard
          title="VIP Customers"
          value={stats.vip}
          change="12%"
          changeType="positive"
          icon={Star}
          color="amber"
        />
        <ModernStatsCard
          title="Active Customers"
          value={stats.active}
          change="5%"
          changeType="positive"
          icon={Activity}
          color="emerald"
        />
        <ModernStatsCard
          title="Total Revenue"
          value={`$${(stats.totalRevenue / 1000).toFixed(0)}K`}
          change="15%"
          changeType="positive"
          icon={TrendingUp}
          color="purple"
        />
      </motion.div>

      {/* Modern Tab Navigation */}
      <ModernTabHeader
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="modern-card">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search customers by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="modern-form-input pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40 modern-form-input">
                    <SelectValue placeholder="Customer Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 modern-form-input">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="purchases">Total Purchases</SelectItem>
                    <SelectItem value="recent">Recent Activity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="modern-glass-effect">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
                <Button variant="outline" className="modern-glass-effect">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Customers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="modern-table">
          <CardHeader className="modern-table-header">
            <CardTitle className="text-white">
              Customer Directory ({filteredCustomers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-500 border-t-transparent"></div>
              </div>
            ) : paginatedCustomers.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchTerm ? "No customers found" : "No customers yet"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? "Try adjusting your search criteria" 
                    : "Get started by adding your first customer"}
                </p>
                {!searchTerm && (
                  <ModernActionButton
                    variant="primary"
                    icon={UserPlus}
                    onClick={() => {}}
                  >
                    Add First Customer
                  </ModernActionButton>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="modern-table-header">
                    <TableHead className="text-white font-semibold">Customer</TableHead>
                    <TableHead className="text-white font-semibold">Contact</TableHead>
                    <TableHead className="text-white font-semibold">Type</TableHead>
                    <TableHead className="text-white font-semibold">Purchases</TableHead>
                    <TableHead className="text-white font-semibold">Last Activity</TableHead>
                    <TableHead className="text-white font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.map((customer, index) => {
                    const TypeIcon = getCustomerTypeIcon(customer.customerType);
                    
                    return (
                      <motion.tr
                        key={customer.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="modern-table-row"
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {customer.firstName[0]}{customer.lastName[0]}
                            </div>
                            <div>
                              <div className="font-semibold">
                                {customer.firstName} {customer.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {customer.id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-2 text-gray-400" />
                              {customer.phone}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-3 w-3 mr-2 text-gray-400" />
                              {customer.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCustomerTypeColor(customer.customerType)}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {customer.customerType || 'Regular'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              ${(customer.totalPurchases || 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">
                              {customer.loyaltyPoints || 0} points
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {customer.lastPurchase 
                              ? new Date(customer.lastPurchase).toLocaleDateString()
                              : "No purchases"
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="modern-glass-effect">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Customer
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                Purchase History
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Customer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center space-x-2"
        >
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="modern-glass-effect"
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "bg-gradient-to-r from-sky-500 to-blue-600" : "modern-glass-effect"}
            >
              {page}
            </Button>
          ))}
          <Button 
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="modern-glass-effect"
          >
            Next
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default CustomersModern;