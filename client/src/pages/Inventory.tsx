import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, Package, AlertTriangle, Search, Edit, Trash2, TrendingDown, TrendingUp, 
  Package2, Warehouse, MoreVertical, Eye, ShoppingCart, BarChart3,
  QrCode, Download, Share, Printer, FileText, Copy, ExternalLink,
  CheckCircle2, Clock, AlertCircle, XCircle, Share2, Calculator, RefreshCw, Building
} from "lucide-react";
import QRCode from 'react-qr-code';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertProductSchema, insertCategorySchema, insertSupplierSchema, type Product, type Category, type Supplier, type InsertProduct, type InsertCategory, type InsertSupplier } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Product types for optical store
const PRODUCT_TYPES = [
  { value: "frames", label: "Frames", icon: "👓" },
  { value: "lenses", label: "Lenses", icon: "🔍" },
  { value: "sunglasses", label: "Sunglasses", icon: "🕶️" },
  { value: "contact_lenses", label: "Contact Lenses", icon: "👁️" },  
  { value: "solutions", label: "Solutions & Care", icon: "🧴" },
  { value: "accessories", label: "Accessories", icon: "🔧" },
];

export default function Inventory() {
  const [openProduct, setOpenProduct] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [openSupplier, setOpenSupplier] = useState(false);
  const [openProductDetails, setOpenProductDetails] = useState(false);
  const [openReorderModal, setOpenReorderModal] = useState(false);
  const [selectedProductForReorder, setSelectedProductForReorder] = useState<Product | null>(null);
  const [openBulkReorderModal, setOpenBulkReorderModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: storeInventory = [] } = useQuery<any[]>({
    queryKey: ["/api/store-inventory"],
    enabled: products.length > 0,
  });

  // Enhanced products with stock information
  const enrichedProducts = products.map(product => {
    const inventory = storeInventory.find((inv: any) => inv.productId === product.id);
    const category = categories.find(cat => cat.id === product.categoryId);
    const supplier = suppliers.find(sup => sup.id === product.supplierId);
    
    return {
      ...product,
      currentStock: inventory?.quantity || 0,
      lastRestocked: inventory?.lastRestocked,
      categoryName: category?.name || 'Uncategorized',
      supplierName: supplier?.name || 'No Supplier',
      stockStatus: inventory?.quantity === 0 ? 'out_of_stock' : 
                  (inventory?.quantity || 0) <= (product.reorderLevel || 0) ? 'low_stock' : 'in_stock',
    };
  });

  // Helper Functions
  const getProductTypeIcon = (type: string) => {
    return PRODUCT_TYPES.find(t => t.value === type)?.icon || "📦";
  };

  const getStockStatusBadge = (status: string, stock: number) => {
    switch (status) {
      case 'out_of_stock':
        return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>;
      case 'low_stock':
        return <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">Low Stock ({stock})</Badge>;
      default:
        return <Badge variant="default" className="text-xs bg-green-100 text-green-800">In Stock ({stock})</Badge>;
    }
  };

  // Filtering
  const filteredProducts = enrichedProducts.filter(product => {
    const matchesSearch = searchTerm === "" || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || product.productType === typeFilter;
    const matchesStock = stockFilter === "all" || product.stockStatus === stockFilter;
    
    return matchesSearch && matchesType && matchesStock;
  });

  const totalProducts = products.length;
  const lowStockCount = enrichedProducts.filter(p => p.stockStatus === 'low_stock').length;
  const outOfStockCount = enrichedProducts.filter(p => p.stockStatus === 'out_of_stock').length;
  const totalValue = enrichedProducts.reduce((sum, p) => sum + (p.currentStock * parseFloat(p.costPrice || "0")), 0);

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="products" className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Inventory Management</h2>
              <p className="text-sm text-slate-600">Complete product catalog with integrated purchase orders</p>
            </div>
            <div className="flex gap-3 items-center flex-wrap">
              <Button 
                variant="outline"
                onClick={() => setOpenBulkReorderModal(true)}
                className="bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200"
                disabled={selectedProducts.length === 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Bulk Order ({selectedProducts.length})
              </Button>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Products</p>
                    <p className="text-2xl font-bold text-blue-900">{totalProducts}</p>
                    <p className="text-xs text-blue-500">Active catalog items</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-600 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600">Inventory Value</p>
                    <p className="text-2xl font-bold text-green-900">${totalValue.toFixed(2)}</p>
                    <p className="text-xs text-green-500">Total stock value</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-600 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-600">Low Stock</p>
                    <p className="text-2xl font-bold text-orange-900">{lowStockCount}</p>
                    <p className="text-xs text-orange-500">Need reorder</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-600 rounded-lg">
                    <XCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">Out of Stock</p>
                    <p className="text-2xl font-bold text-red-900">{outOfStockCount}</p>
                    <p className="text-xs text-red-500">Urgent restock</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <TabsContent value="products" className="space-y-6">
            {/* Search and Filter Section */}
            <Card>
              <CardHeader>
                <CardTitle>Filter & Search Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {PRODUCT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by stock" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stock Levels</SelectItem>
                      <SelectItem value="in_stock">In Stock</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        setEditingProduct(null);
                        setOpenProduct(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setOpenBulkReorderModal(true)}
                      className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Bulk Order
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Product Catalog ({filteredProducts.length} items)</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      Showing {filteredProducts.length} of {totalProducts} products
                    </p>
                  </div>
                  {selectedProducts.length > 0 && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Export Started",
                            description: `Exporting ${selectedProducts.length} selected products`,
                          });
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export Selected
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${selectedProducts.length} selected products?`)) {
                            toast({
                              title: "Products Deleted",
                              description: `${selectedProducts.length} products removed from inventory`,
                            });
                            setSelectedProducts([]);
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected ({selectedProducts.length})
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setOpenBulkReorderModal(true)}
                        className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Bulk Order
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox 
                            checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedProducts(filteredProducts.map(p => p.id));
                              } else {
                                setSelectedProducts([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id} className="hover:bg-slate-50">
                          <TableCell>
                            <Checkbox 
                              checked={selectedProducts.includes(product.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedProducts([...selectedProducts, product.id]);
                                } else {
                                  setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-slate-900">{product.name}</div>
                              <div className="text-sm text-slate-500">SKU: {product.sku}</div>
                              {product.barcode && (
                                <div className="text-xs text-slate-400">#{product.barcode}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{getProductTypeIcon(product.productType || "frames")}</span>
                              <span className="text-sm capitalize">
                                {PRODUCT_TYPES.find(t => t.value === product.productType)?.label || product.productType}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-slate-600">{product.categoryName}</span>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-emerald-600">${product.price}</div>
                              {product.costPrice && (
                                <div className="text-xs text-slate-500">Cost: ${product.costPrice}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{product.currentStock || 0} units</div>
                              <div className="text-xs text-slate-500">
                                Reorder at: {product.reorderLevel}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              {getStockStatusBadge(product.stockStatus, product.currentStock || 0)}
                              <Badge variant={product.isActive ? "default" : "secondary"} className="block w-fit">
                                {product.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setOpenProductDetails(true);
                                }}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedProductForReorder(product);
                                  setOpenReorderModal(true);
                                }}
                                title="Reorder Stock"
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              >
                                <Package className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setEditingProduct(product);
                                      setOpenProduct(true);
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Product
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this product?')) {
                                        toast({
                                          title: "Product deleted",
                                          description: `${product.name} has been removed from inventory`,
                                        });
                                      }
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Product
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No products found</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {searchTerm || typeFilter !== "all" || stockFilter !== "all" 
                        ? "Try adjusting your search or filters"
                        : "Get started by adding your first product to the inventory"
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="text-center py-12">
              <Package2 className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">Categories Management</h3>
              <p className="mt-1 text-sm text-slate-500">Category management functionality will be implemented here</p>
            </div>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6">
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">Suppliers Management</h3>
              <p className="mt-1 text-sm text-slate-500">Supplier management functionality will be implemented here</p>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">Analytics Dashboard</h3>
              <p className="mt-1 text-sm text-slate-500">Analytics and reporting functionality will be implemented here</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Product Form Dialog */}
        <Dialog open={openProduct} onOpenChange={setOpenProduct}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Product form will be implemented here. For now, simulating form submission.</p>
              <div className="mt-4 flex gap-2">
                <Button 
                  onClick={() => {
                    toast({
                      title: editingProduct ? "Product Updated" : "Product Added",
                      description: `Product has been ${editingProduct ? "updated" : "added"} successfully`,
                    });
                    setOpenProduct(false);
                    setEditingProduct(null);
                  }}
                >
                  {editingProduct ? "Update" : "Add"} Product
                </Button>
                <Button variant="outline" onClick={() => setOpenProduct(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Product Details Dialog */}
        <Dialog open={openProductDetails} onOpenChange={setOpenProductDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Product Details</DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                  <p className="text-sm text-slate-500">SKU: {selectedProduct.sku}</p>
                  {selectedProduct.barcode && (
                    <p className="text-sm text-slate-500">Barcode: {selectedProduct.barcode}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <p className="text-lg font-semibold text-green-600">${selectedProduct.price}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Current Stock</label>
                    <p className="text-lg font-semibold">{selectedProduct.currentStock || 0} units</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <p>{selectedProduct.categoryName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Supplier</label>
                    <p>{selectedProduct.supplierName}</p>
                  </div>
                </div>
                {selectedProduct.description && (
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <p className="text-sm text-slate-600">{selectedProduct.description}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Bulk Reorder Dialog */}
        <Dialog open={openBulkReorderModal} onOpenChange={setOpenBulkReorderModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Bulk Purchase Order</DialogTitle>
            </DialogHeader>
            <BulkReorderForm
              suppliers={suppliers}
              products={products}
              onSubmit={(data: any) => {
                console.log("Bulk order submitted:", data);
                toast({
                  title: "Purchase Order Created",
                  description: `Bulk order for ${data.items?.length || 0} items has been created`,
                });
                setOpenBulkReorderModal(false);
              }}
              onCancel={() => setOpenBulkReorderModal(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Reorder Modal */}
        <Dialog open={openReorderModal} onOpenChange={setOpenReorderModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reorder Stock - {selectedProductForReorder?.name}</DialogTitle>
              <DialogDescription>
                Create a purchase order to restock this product with supplier selection
              </DialogDescription>
            </DialogHeader>
            <ReorderForm 
              product={selectedProductForReorder}
              suppliers={suppliers}
              onSubmit={(data) => {
                toast({
                  title: "Purchase Order Created",
                  description: `Reorder submitted for ${data.quantity} units from ${data.supplierName}`,
                });
                setOpenReorderModal(false);
                setSelectedProductForReorder(null);
              }}
              onCancel={() => {
                setOpenReorderModal(false);
                setSelectedProductForReorder(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Bulk Reorder Modal */}
        <Dialog open={openBulkReorderModal} onOpenChange={setOpenBulkReorderModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Bulk Purchase Order</DialogTitle>
              <DialogDescription>
                Create a bulk purchase order for multiple products with supplier selection
              </DialogDescription>
            </DialogHeader>
            <BulkReorderForm 
              suppliers={suppliers}
              products={products}
              onSubmit={(data) => {
                toast({
                  title: "Bulk Purchase Order Created",
                  description: `Bulk order created with ${data.items.length} products`,
                });
                setOpenBulkReorderModal(false);
                setSelectedProducts([]);
              }}
              onCancel={() => {
                setOpenBulkReorderModal(false);
                setSelectedProducts([]);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Reorder Form with Supplier Selection
interface ReorderFormProps {
  product: Product | null;
  suppliers: Supplier[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

function ReorderForm({ product, suppliers, onSubmit, onCancel }: ReorderFormProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [quantity, setQuantity] = useState((product?.reorderLevel || 10) * 2);
  const [unitCost, setUnitCost] = useState(parseFloat(product?.costPrice || "0"));
  const [notes, setNotes] = useState("");

  if (!product) return null;

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
  const total = quantity * unitCost;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label>Select Supplier</Label>
          <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Choose supplier..." />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>{supplier.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Quantity</Label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            className="mt-2"
            min="1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label>Unit Cost</Label>
          <Input
            type="number"
            step="0.01"
            value={unitCost}
            onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
            className="mt-2"
          />
        </div>
        <div>
          <Label>Total Cost</Label>
          <div className="mt-2 p-2 bg-slate-100 rounded border text-lg font-semibold">
            ${total.toFixed(2)}
          </div>
        </div>
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-2"
          placeholder="Additional notes for this order..."
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={() => onSubmit({
            productId: product.id,
            supplierId: selectedSupplierId,
            supplierName: selectedSupplier?.name,
            quantity,
            unitCost,
            total,
            notes
          })}
          disabled={!selectedSupplierId || quantity <= 0}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Package className="mr-2 h-4 w-4" />
          Create Purchase Order
        </Button>
      </div>
    </div>
  );
}

// Bulk Reorder Form
interface BulkReorderFormProps {
  suppliers: Supplier[];
  products: Product[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

function BulkReorderForm({ suppliers, products, onSubmit, onCancel }: BulkReorderFormProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [orderItems, setOrderItems] = useState<Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
    discount: number;
    total: number;
  }>>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemUnitCost, setItemUnitCost] = useState(0);
  const [itemDiscount, setItemDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [handlingCharge, setHandlingCharge] = useState(0);
  const [taxRate, setTaxRate] = useState(8);
  const [notes, setNotes] = useState("");

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal + shippingCost + handlingCharge) * (taxRate / 100);
  const totalAmount = subtotal + shippingCost + handlingCharge + taxAmount;

  const addOrderItem = () => {
    if (!selectedProduct) return;
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const itemTotal = (itemQuantity * itemUnitCost) * (1 - itemDiscount / 100);
    const newItem = {
      id: `item-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      quantity: itemQuantity,
      unitCost: itemUnitCost,
      discount: itemDiscount,
      total: itemTotal
    };

    setOrderItems(prev => [...prev, newItem]);
    setSelectedProduct("");
    setItemQuantity(1);
    setItemUnitCost(0);
    setItemDiscount(0);
  };

  const removeOrderItem = (itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateOrderItem = (itemId: string, field: string, value: number) => {
    setOrderItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitCost' || field === 'discount') {
          updatedItem.total = (updatedItem.quantity * updatedItem.unitCost) * (1 - updatedItem.discount / 100);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Create Bulk Purchase Order</h2>
          <p className="text-sm text-slate-600 mt-1">Add multiple products with shipping and handling charges</p>
        </div>
      </div>

      {/* Supplier Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supplier Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Select Supplier *</Label>
              <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose supplier for bulk order..." />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4" />
                        <span>{supplier.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Order Date</Label>
              <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedSupplierId && (
        <>
          {/* Add Items Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add Items to Purchase Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <Label>Product *</Label>
                  <Select value={selectedProduct} onValueChange={(value) => {
                    setSelectedProduct(value);
                    const product = products.find(p => p.id === value);
                    if (product) {
                      setItemUnitCost(parseFloat(product.costPrice || "0"));
                    }
                  }}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-slate-500">{product.sku}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                    className="mt-2"
                    placeholder="1"
                  />
                </div>
                
                <div>
                  <Label>Unit Cost *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={itemUnitCost}
                    onChange={(e) => setItemUnitCost(parseFloat(e.target.value) || 0)}
                    className="mt-2"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>Discount (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={itemDiscount}
                    onChange={(e) => setItemDiscount(parseFloat(e.target.value) || 0)}
                    className="mt-2"
                    placeholder="0"
                  />
                </div>
                
                <Button 
                  onClick={addOrderItem}
                  disabled={!selectedProduct || itemQuantity <= 0 || itemUnitCost <= 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Order Items Table */}
          {orderItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Items ({orderItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Cost</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">{item.productName}</div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateOrderItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.unitCost}
                              onChange={(e) => updateOrderItem(item.id, 'unitCost', parseFloat(e.target.value) || 0)}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={item.discount}
                              onChange={(e) => updateOrderItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">${item.total.toFixed(2)}</span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOrderItem(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary & Additional Charges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Additional Charges */}
                <div className="space-y-4">
                  <div>
                    <Label>Shipping Cost</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                      className="mt-2"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <Label>Handling Charge</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={handlingCharge}
                      onChange={(e) => setHandlingCharge(parseFloat(e.target.value) || 0)}
                      className="mt-2"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label>Tax Rate (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="mt-2"
                      placeholder="8"
                    />
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-2"
                      placeholder="Additional notes for this purchase order..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>${shippingCost.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Handling:</span>
                    <span>${handlingCharge.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Tax ({taxRate}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-green-600">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={() => onSubmit({
                supplierId: selectedSupplierId,
                supplierName: selectedSupplier?.name,
                items: orderItems,
                subtotal,
                shippingCost,
                handlingCharge,
                taxRate,
                taxAmount,
                total: totalAmount,
                notes
              })}
              disabled={!selectedSupplierId || orderItems.length === 0}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Package className="mr-2 h-4 w-4" />
              Create Purchase Order
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// Dialog Components
export function ProductFormDialog({ open, onOpenChange, product, onSubmit }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Product form implementation needed</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProductDetailsDialog({ open, onOpenChange, product }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>
        {product && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-slate-500">SKU: {product.sku}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Price</label>
                <p>${product.price}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Stock</label>
                <p>{product.currentStock || 0} units</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function BulkReorderDialog({ open, onOpenChange, suppliers, products, onSubmit }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Purchase Order</DialogTitle>
        </DialogHeader>
        <BulkReorderForm
          suppliers={suppliers}
          products={products}
          onSubmit={(data: any) => {
            console.log("Bulk order submitted:", data);
            onSubmit(data);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export function ReorderDialog({ open, onOpenChange, product, suppliers, onSubmit }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reorder Stock</DialogTitle>
        </DialogHeader>
        {product && (
          <ReorderForm
            product={product}
            suppliers={suppliers}
            onSubmit={(data: any) => {
              console.log("Reorder submitted:", data);
              onSubmit(data);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

