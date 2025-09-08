import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ShoppingCart,
  Box,
  Tag,
  DollarSign,
  Layers
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
  ModernTabHeader,
  ModernProgressBar 
} from "@/components/ui/modern-components";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  storeId: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  brand: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  totalValue: number;
  supplier: string;
  lastRestocked: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  description: string;
}

const InventoryModern: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch inventory
  const { data: inventory = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/store-inventory"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Transform data
  const enhancedInventory = inventory.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      ...item,
      productName: product?.name || item.productName || 'Unknown Product',
      brand: product?.brand || item.brand || 'Unknown Brand',
      category: product?.category || item.category || 'Uncategorized',
      unitPrice: product?.price || item.unitPrice || 0,
      totalValue: (product?.price || item.unitPrice || 0) * item.currentStock,
      status: item.currentStock === 0 ? 'out_of_stock' as const : 
               item.currentStock <= item.minStock ? 'low_stock' as const : 
               'in_stock' as const
    };
  });

  // Filter and sort inventory
  const filteredInventory = enhancedInventory.filter(item => {
    const matchesSearch = 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort inventory
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.productName.localeCompare(b.productName);
      case "stock":
        return b.currentStock - a.currentStock;
      case "value":
        return b.totalValue - a.totalValue;
      case "status":
        const statusOrder = { 'out_of_stock': 0, 'low_stock': 1, 'in_stock': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedInventory.length / pageSize);
  const paginatedInventory = sortedInventory.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Statistics
  const stats = {
    totalItems: enhancedInventory.length,
    totalValue: enhancedInventory.reduce((sum, item) => sum + item.totalValue, 0),
    lowStock: enhancedInventory.filter(item => item.status === 'low_stock').length,
    outOfStock: enhancedInventory.filter(item => item.status === 'out_of_stock').length,
    categories: [...new Set(enhancedInventory.map(item => item.category))].length
  };

  // Tab configuration
  const tabs = [
    { id: "all", label: "All Items", icon: Package, count: stats.totalItems },
    { id: "in_stock", label: "In Stock", icon: CheckCircle2, count: enhancedInventory.filter(i => i.status === 'in_stock').length },
    { id: "low_stock", label: "Low Stock", icon: AlertTriangle, count: stats.lowStock },
    { id: "out_of_stock", label: "Out of Stock", icon: Box, count: stats.outOfStock }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-emerald-100 text-emerald-800';
      case 'low_stock': return 'bg-amber-100 text-amber-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return CheckCircle2;
      case 'low_stock': return AlertTriangle;
      case 'out_of_stock': return Box;
      default: return Package;
    }
  };

  const getStockLevel = (current: number, min: number, max: number) => {
    const percentage = (current / max) * 100;
    return Math.min(percentage, 100);
  };

  const getStockColor = (current: number, min: number) => {
    if (current === 0) return 'red';
    if (current <= min) return 'amber';
    return 'emerald';
  };

  return (
    <div className="modern-page-background p-6 space-y-8">
      {/* Modern Header */}
      <ModernPageHeader
        title="Inventory Management"
        description="Track and manage your product inventory across all stores"
        icon={Package}
        gradient="primary"
      >
        <ModernActionButton
          variant="success"
          size="lg"
          icon={Plus}
          onClick={() => {}}
          className="shadow-2xl"
        >
          Add New Product
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
          title="Total Items"
          value={stats.totalItems}
          change="5%"
          changeType="positive"
          icon={Package}
          color="blue"
        />
        <ModernStatsCard
          title="Inventory Value"
          value={`$${(stats.totalValue / 1000).toFixed(0)}K`}
          change="12%"
          changeType="positive"
          icon={DollarSign}
          color="emerald"
        />
        <ModernStatsCard
          title="Low Stock Items"
          value={stats.lowStock}
          change="2"
          changeType="negative"
          icon={AlertTriangle}
          color="amber"
        />
        <ModernStatsCard
          title="Categories"
          value={stats.categories}
          change="1"
          changeType="positive"
          icon={Layers}
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
                    placeholder="Search by product name, SKU, brand, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="modern-form-input pl-10"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40 modern-form-input">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {[...new Set(enhancedInventory.map(item => item.category))].map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 modern-form-input">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 modern-form-input">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Product Name</SelectItem>
                    <SelectItem value="stock">Stock Level</SelectItem>
                    <SelectItem value="value">Total Value</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
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
                  Export Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Inventory Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="modern-table">
          <CardHeader className="modern-table-header">
            <CardTitle className="text-white">
              Inventory Items ({filteredInventory.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-500 border-t-transparent"></div>
              </div>
            ) : paginatedInventory.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchTerm ? "No items found" : "No inventory items"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? "Try adjusting your search criteria" 
                    : "Get started by adding your first inventory item"}
                </p>
                {!searchTerm && (
                  <ModernActionButton
                    variant="primary"
                    icon={Plus}
                    onClick={() => {}}
                  >
                    Add First Item
                  </ModernActionButton>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="modern-table-header">
                    <TableHead className="text-white font-semibold">Product</TableHead>
                    <TableHead className="text-white font-semibold">SKU</TableHead>
                    <TableHead className="text-white font-semibold">Stock Level</TableHead>
                    <TableHead className="text-white font-semibold">Status</TableHead>
                    <TableHead className="text-white font-semibold">Unit Price</TableHead>
                    <TableHead className="text-white font-semibold">Total Value</TableHead>
                    <TableHead className="text-white font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInventory.map((item, index) => {
                    const StatusIcon = getStatusIcon(item.status);
                    const stockLevel = getStockLevel(item.currentStock, item.minStock, item.maxStock);
                    const stockColor = getStockColor(item.currentStock, item.minStock);
                    
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="modern-table-row"
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold">
                              <Package className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-semibold">{item.productName}</div>
                              <div className="text-sm text-gray-500">
                                {item.brand} • {item.category}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {item.sku}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>{item.currentStock} / {item.maxStock}</span>
                              <span>{Math.round(stockLevel)}%</span>
                            </div>
                            <ModernProgressBar 
                              value={stockLevel} 
                              color={stockColor}
                              size="sm"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {item.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            ${item.unitPrice.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-emerald-600">
                            ${item.totalValue.toLocaleString()}
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
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Item
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Restock
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Item
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

export default InventoryModern;