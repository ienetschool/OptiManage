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
  CheckCircle2, Clock, AlertCircle, XCircle, Share2, Calculator, RefreshCw
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
  const [openStockUpdate, setOpenStockUpdate] = useState(false);
  const [openProductDetails, setOpenProductDetails] = useState(false);
  const [openQRCode, setOpenQRCode] = useState(false);
  const [openReorderModal, setOpenReorderModal] = useState(false);
  const [selectedProductForReorder, setSelectedProductForReorder] = useState<Product | null>(null);
  const [openBulkReorderModal, setOpenBulkReorderModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedProductsForBulkReorder, setSelectedProductsForBulkReorder] = useState<string[]>([]);
  const [bulkReorderData, setBulkReorderData] = useState<Record<string, { quantity: number; unitCost: number }>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [stockOperation, setStockOperation] = useState<'add' | 'remove' | 'set'>('add');
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

  // Enhanced Product Form with Purchase Order Integration
  const productForm = useForm<InsertProduct & { 
    initialStock: number;
    purchasePrice: string;
    createPurchaseOrder: boolean;
    purchaseNotes: string;
    taxRate: number;
    discountAmount: number;
    shippingCost: number;
    handlingCost: number;
  }>({
    resolver: zodResolver(insertProductSchema.extend({
      initialStock: insertProductSchema.shape.initialStock,
      purchasePrice: insertProductSchema.shape.costPrice,
      createPurchaseOrder: insertProductSchema.shape.isActive,
      purchaseNotes: insertProductSchema.shape.description,
      taxRate: insertProductSchema.shape.reorderLevel,
      discountAmount: insertProductSchema.shape.reorderLevel,
      shippingCost: insertProductSchema.shape.reorderLevel,
      handlingCost: insertProductSchema.shape.reorderLevel,
    })),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      categoryId: "",
      supplierId: "",
      price: "",
      costPrice: "",
      productType: "frames",
      reorderLevel: 10,
      isActive: true,
      initialStock: 0,
      barcode: "",
      purchasePrice: "",
      createPurchaseOrder: false,
      purchaseNotes: "",
      taxRate: 8.5,
      discountAmount: 0,
      shippingCost: 0,
      handlingCost: 0,
    },
  });

  const categoryForm = useForm<InsertCategory>({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const supplierForm = useForm<InsertSupplier>({
    resolver: zodResolver(insertSupplierSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  // Enhanced Product Creation with Purchase Order Integration
  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct & { 
      initialStock: number;
      purchasePrice: string;
      createPurchaseOrder: boolean;
      purchaseNotes: string;
      taxRate: number;
      discountAmount: number;
      shippingCost: number;
      handlingCost: number;
    }) => {
      const { initialStock, purchasePrice, createPurchaseOrder, purchaseNotes, taxRate, discountAmount, shippingCost, handlingCost, ...productData } = data;
      
      // Auto-generate barcode if not provided
      if (!productData.barcode) {
        productData.barcode = `BC${Date.now().toString().slice(-8)}`;
      }
      
      // Auto-generate SKU if not provided
      if (!productData.sku) {
        const typePrefix = productData.productType?.substring(0, 2).toUpperCase() || 'PR';
        productData.sku = `${typePrefix}-${Date.now().toString().slice(-6)}`;
      }
      
      const response = await apiRequest("POST", "/api/products", productData);
      const productId = (response as any).id;
      
      // Create initial inventory record if stock is provided
      if (initialStock && initialStock > 0) {
        await apiRequest("POST", "/api/store-inventory", {
          storeId: "5ff902af-3849-4ea6-945b-4d49175d6638",
          productId: productId,
          quantity: initialStock,
          minStock: productData.reorderLevel || 10,
          maxStock: Math.max(initialStock * 2, 100),
          lastRestocked: new Date().toISOString(),
        });

        // Auto-generate purchase invoice if requested
        if (createPurchaseOrder && productData.supplierId && purchasePrice) {
          const unitCost = parseFloat(purchasePrice);
          const subtotal = initialStock * unitCost;
          const discountApplied = discountAmount || 0;
          const subtotalAfterDiscount = subtotal - discountApplied;
          const taxAmount = subtotalAfterDiscount * ((taxRate || 8.5) / 100);
          const shipping = shippingCost || 0;
          const handling = handlingCost || 0;
          const total = subtotalAfterDiscount + taxAmount + shipping + handling;

          const invoiceData = {
            customerId: productData.supplierId,
            storeId: "5ff902af-3849-4ea6-945b-4d49175d6638",
            invoiceNumber: `PO-${Date.now().toString().slice(-6)}`,
            date: new Date().toISOString(),
            status: "pending",
            subtotal: subtotal,
            taxAmount: taxAmount,
            total: total,
            discountAmount: discountApplied,
            taxRate: taxRate || 8.5,
            paymentMethod: "credit",
            notes: `Initial Stock Purchase - ${purchaseNotes} | Shipping: $${shipping} | Handling: $${handling}`,
            items: [{
              productId: productId,
              quantity: initialStock,
              unitPrice: unitCost,
              total: subtotalAfterDiscount,
            }]
          };
          
          await apiRequest("POST", "/api/invoices", invoiceData);
        }
      }
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/store-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Success",
        description: "Product created successfully with integrated purchase order.",
      });
      setOpenProduct(false);
      productForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product.",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { initialStock, purchasePrice, createPurchaseOrder, purchaseNotes, ...productData } = data;
      await apiRequest("PUT", `/api/products/${id}`, productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product updated successfully.",
      });
      setOpenProduct(false);
      setEditingProduct(null);
      productForm.reset();
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ productId, operation, quantity }: { productId: string; operation: string; quantity: number }) => {
      await apiRequest("POST", "/api/store-inventory/update", {
        storeId: "5ff902af-3849-4ea6-945b-4d49175d6638",
        productId,
        operation,
        quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store-inventory"] });
      toast({
        title: "Success",
        description: "Stock updated successfully.",
      });
      setOpenStockUpdate(false);
      setSelectedProduct(null);
      setStockQuantity(0);
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      await apiRequest("POST", "/api/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Category created successfully.",
      });
      setOpenCategory(false);
      categoryForm.reset();
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: InsertCategory & { id: string }) => {
      await apiRequest("PATCH", `/api/categories/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Category updated successfully.",
      });
      setOpenCategory(false);
      setEditingCategory(null);
      categoryForm.reset();
    },
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (data: InsertSupplier) => {
      await apiRequest("POST", "/api/suppliers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({
        title: "Success",
        description: "Supplier created successfully.",
      });
      setOpenSupplier(false);
      supplierForm.reset();
    },
  });

  // Filter products
  const filteredProducts = enrichedProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.barcode || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || product.productType === typeFilter;
    
    const matchesStock = stockFilter === "all" || 
                        (stockFilter === "low_stock" && product.stockStatus === "low_stock") ||
                        (stockFilter === "out_of_stock" && product.stockStatus === "out_of_stock") ||
                        (stockFilter === "in_stock" && product.stockStatus === "in_stock");
    
    return matchesSearch && matchesType && matchesStock;
  });

  // Statistics
  const totalProducts = products.length;
  const totalValue = enrichedProducts.reduce((sum, product) => 
    sum + (parseFloat(product.price) * product.currentStock), 0);
  const lowStockProducts = enrichedProducts.filter(p => p.stockStatus === "low_stock");
  const outOfStockProducts = enrichedProducts.filter(p => p.stockStatus === "out_of_stock");

  // Handlers
  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      description: product.description || "",
      sku: product.sku,
      categoryId: product.categoryId || "",
      supplierId: product.supplierId || "",
      price: product.price,
      costPrice: product.costPrice || "",
      productType: product.productType || "frames",
      reorderLevel: product.reorderLevel || 10,
      isActive: product.isActive,
      barcode: product.barcode || "",
      initialStock: 0,
      purchasePrice: product.costPrice || "",
      createPurchaseOrder: false,
      purchaseNotes: "",
      taxRate: 8.5,
      discountAmount: 0,
      shippingCost: 0,
      handlingCost: 0,
    });
    setOpenProduct(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      description: category.description || "",
    });
    setOpenCategory(true);
  };

  const handleProductOpenChange = (open: boolean) => {
    setOpenProduct(open);
    if (!open) {
      setEditingProduct(null);
      productForm.reset();
    }
  };

  const onProductSubmit = (data: any) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleStockUpdate = () => {
    if (selectedProduct && stockQuantity > 0) {
      updateStockMutation.mutate({
        productId: selectedProduct.id,
        operation: stockOperation,
        quantity: stockQuantity,
      });
    }
  };

  const getStockStatusBadge = (status: string, quantity: number) => {
    switch (status) {
      case "out_of_stock":
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Out of Stock
        </Badge>;
      case "low_stock":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Low Stock ({quantity})
        </Badge>;
      case "in_stock":
        return <Badge variant="default" className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          In Stock ({quantity})
        </Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getProductTypeIcon = (type: string) => {
    return PRODUCT_TYPES.find(t => t.value === type)?.icon || "📦";
  };

  const calculateBulkSubtotal = () => {
    return selectedProductsForBulkReorder.reduce((total, productId) => {
      const product = enrichedProducts.find(p => p.id === productId);
      if (!product) return total;
      
      const quantity = bulkReorderData[productId]?.quantity || (product.reorderLevel || 10) * 2;
      const unitCost = bulkReorderData[productId]?.unitCost || parseFloat(product.costPrice || "0");
      
      return total + (quantity * unitCost);
    }, 0);
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Name", "SKU", "Type", "Category", "Price", "Cost", "Stock", "Status"],
      ...filteredProducts.map(p => [
        p.name,
        p.sku,
        p.productType,
        p.categoryName,
        p.price,
        p.costPrice || "",
        p.currentStock,
        p.stockStatus
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printInventory = () => {
    const printContent = `
      <html>
        <head>
          <title>Inventory Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>OptiStore Pro - Inventory Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Type</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredProducts.map(p => `
                <tr>
                  <td>${p.name}</td>
                  <td>${p.sku}</td>
                  <td>${p.productType}</td>
                  <td>$${p.price}</td>
                  <td>${p.currentStock}</td>
                  <td>${p.stockStatus.replace('_', ' ')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <Tabs defaultValue="products" className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Inventory Management</h2>
            <p className="text-sm text-slate-600">Complete product catalog with integrated purchase orders</p>
          </div>
          
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  <p className="text-2xl font-bold text-green-900">${totalValue.toLocaleString()}</p>
                  <p className="text-xs text-green-500">Current stock value</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-amber-600 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-600">Low Stock Alert</p>
                  <p className="text-2xl font-bold text-amber-900">{lowStockProducts.length}</p>
                  <p className="text-xs text-amber-500">Need reordering</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-600 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-900">{outOfStockProducts.length}</p>
                  <p className="text-xs text-red-500">Immediate attention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          {/* Enhanced Action Bar */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex gap-4 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search products, SKU, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Product Type" />
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
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setOpenBulkReorderModal(true)}
                className="bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200"
              >
                <Package className="mr-2 h-4 w-4" />
                Bulk Reorder
              </Button>
              <Button variant="outline" onClick={exportToCSV} size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={printInventory} size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Dialog open={openProduct} onOpenChange={handleProductOpenChange}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "Edit Product" : "Add New Product & Purchase Order"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingProduct 
                        ? "Update product information and settings"
                        : "Create a new product with optional initial stock and purchase order integration"
                      }
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...productForm}>
                    <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-6">
                      {/* Basic Product Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Product Information</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={productForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ray-Ban Aviator Classic" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={productForm.control}
                            name="sku"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SKU</FormLabel>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <Input placeholder="Auto-generated if empty" {...field} />
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        const type = productForm.getValues("productType");
                                        const prefix = type?.substring(0, 2).toUpperCase() || 'PR';
                                        const autoSku = `${prefix}-${Date.now().toString().slice(-6)}`;
                                        productForm.setValue("sku", autoSku);
                                      }}
                                    >
                                      Generate
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={productForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Detailed product description, features, and specifications..." 
                                  className="min-h-[80px]"
                                  {...field} 
                                  value={field.value || ""} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={productForm.control}
                            name="productType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product Type *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {PRODUCT_TYPES.map((type) => (
                                      <SelectItem key={type.value} value={type.value}>
                                        {type.icon} {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={productForm.control}
                            name="categoryId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categories.map((category) => (
                                      <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={productForm.control}
                            name="supplierId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Supplier</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select supplier" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {suppliers.map((supplier) => (
                                      <SelectItem key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Pricing & Barcode */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Pricing & Identification</h3>
                        
                        <div className="grid grid-cols-4 gap-4">
                          <FormField
                            control={productForm.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Selling Price *</FormLabel>
                                <FormControl>
                                  <Input placeholder="149.99" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={productForm.control}
                            name="costPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cost Price</FormLabel>
                                <FormControl>
                                  <Input placeholder="89.99" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={productForm.control}
                            name="reorderLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reorder Level</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="10" 
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={productForm.control}
                            name="barcode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Barcode</FormLabel>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <Input 
                                      placeholder="Auto-generated" 
                                      {...field} 
                                      value={field.value || ""} 
                                    />
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        const autoBarcode = `BC${Date.now().toString().slice(-8)}`;
                                        productForm.setValue("barcode", autoBarcode);
                                      }}
                                    >
                                      Generate
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Initial Stock & Purchase Order Integration */}
                      {!editingProduct && (
                        <div className="space-y-4 border-t pt-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">Initial Stock & Purchase Order</h3>
                            <FormField
                              control={productForm.control}
                              name="createPurchaseOrder"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    Create Purchase Order & Invoice
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <FormField
                              control={productForm.control}
                              name="initialStock"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Initial Stock Quantity</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="0" 
                                      placeholder="0" 
                                      {...field} 
                                      value={field.value || 0}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={productForm.control}
                              name="purchasePrice"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Purchase Price (per unit)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="75.00" 
                                      {...field} 
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={productForm.control}
                              name="taxRate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tax Rate (%)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.1"
                                      placeholder="8.5" 
                                      {...field}
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 8.5)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <FormField
                              control={productForm.control}
                              name="discountAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Discount Amount</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.01"
                                      placeholder="0.00" 
                                      {...field}
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={productForm.control}
                              name="shippingCost"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Shipping Cost</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.01"
                                      placeholder="0.00" 
                                      {...field}
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={productForm.control}
                              name="handlingCost"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Handling Cost</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.01"
                                      placeholder="0.00" 
                                      {...field}
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                            <h4 className="font-medium text-slate-900">Purchase Order Summary</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-slate-600">Subtotal:</span>
                                <span className="ml-2 font-medium">
                                  ${((productForm.watch("initialStock") || 0) * 
                                     (parseFloat(productForm.watch("purchasePrice")) || 0)).toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-600">Discount:</span>
                                <span className="ml-2 font-medium text-green-600">
                                  -${(productForm.watch("discountAmount") || 0).toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-600">Tax ({(productForm.watch("taxRate") || 8.5)}%):</span>
                                <span className="ml-2 font-medium">
                                  ${(((productForm.watch("initialStock") || 0) * 
                                      (parseFloat(productForm.watch("purchasePrice")) || 0) - 
                                      (productForm.watch("discountAmount") || 0)) * 
                                     ((productForm.watch("taxRate") || 8.5) / 100)).toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-600">Shipping:</span>
                                <span className="ml-2 font-medium">
                                  ${(productForm.watch("shippingCost") || 0).toFixed(2)}
                                </span>
                              </div>
                              <div className="col-span-2 border-t pt-2">
                                <span className="text-slate-900 font-semibold">Total Amount:</span>
                                <span className="ml-2 text-lg font-bold text-blue-600">
                                  ${(() => {
                                    const qty = productForm.watch("initialStock") || 0;
                                    const price = parseFloat(productForm.watch("purchasePrice")) || 0;
                                    const discount = productForm.watch("discountAmount") || 0;
                                    const taxRate = (productForm.watch("taxRate") || 8.5) / 100;
                                    const shipping = productForm.watch("shippingCost") || 0;
                                    const handling = productForm.watch("handlingCost") || 0;
                                    
                                    const subtotal = qty * price;
                                    const afterDiscount = subtotal - discount;
                                    const tax = afterDiscount * taxRate;
                                    const total = afterDiscount + tax + shipping + handling;
                                    
                                    return total.toFixed(2);
                                  })()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <FormField
                            control={productForm.control}
                            name="purchaseNotes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Purchase Notes</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Additional notes for the purchase order..."
                                    className="min-h-[60px]"
                                    {...field} 
                                    value={field.value || ""} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleProductOpenChange(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createProductMutation.isPending || updateProductMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {createProductMutation.isPending || updateProductMutation.isPending
                            ? "Saving..."
                            : editingProduct
                            ? "Update Product"
                            : "Create Product & Purchase Order"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Enhanced Products Table */}
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
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export Selected
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Selected ({selectedProducts.length})
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
                            <div className="font-medium">{product.currentStock} units</div>
                            <div className="text-xs text-slate-500">
                              Reorder at: {product.reorderLevel}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            {getStockStatusBadge(product.stockStatus, product.currentStock)}
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
                                setSelectedProduct(product);
                                setOpenStockUpdate(true);
                              }}
                              title="Reorder Stock"
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Product
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
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

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Product Categories ({categories.length})</h3>
              <p className="text-sm text-slate-600">Organize your products into categories for better management</p>
            </div>
            
            <Dialog open={openCategory} onOpenChange={(open) => {
              setOpenCategory(open);
              if (!open) {
                setEditingCategory(null);
                categoryForm.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                  <DialogDescription>
                    {editingCategory ? "Update category information" : "Create a new product category to organize your inventory"}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...categoryForm}>
                  <form onSubmit={categoryForm.handleSubmit((data) => {
                    if (editingCategory) {
                      updateCategoryMutation.mutate({ ...data, id: editingCategory.id });
                    } else {
                      createCategoryMutation.mutate(data);
                    }
                  })} className="space-y-4">
                    <FormField
                      control={categoryForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Designer Frames" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={categoryForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Premium designer eyewear frames..." 
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpenCategory(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {editingCategory 
                          ? (updateCategoryMutation.isPending ? "Updating..." : "Update Category")
                          : (createCategoryMutation.isPending ? "Creating..." : "Create Category")
                        }
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="border-slate-200 hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  {category.description && (
                    <p className="text-sm text-slate-600">{category.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">
                        {products.filter(p => p.categoryId === category.id).length}
                      </span> products
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Suppliers ({suppliers.length})</h3>
              <p className="text-sm text-slate-600">Manage your product suppliers and vendors</p>
            </div>
            
            <Dialog open={openSupplier} onOpenChange={setOpenSupplier}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Supplier
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Supplier</DialogTitle>
                  <DialogDescription>
                    Add a new supplier to your vendor network
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...supplierForm}>
                  <form onSubmit={supplierForm.handleSubmit((data) => createSupplierMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={supplierForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supplier Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Luxottica Group" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={supplierForm.control}
                      name="contactPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={supplierForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="contact@supplier.com" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={supplierForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={supplierForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="123 Business Street, City, State, ZIP" 
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpenSupplier(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createSupplierMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {createSupplierMutation.isPending ? "Creating..." : "Create Supplier"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <Card key={supplier.id} className="border-slate-200 hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{supplier.name}</CardTitle>
                  {supplier.contactPerson && (
                    <p className="text-sm text-slate-600">Contact: {supplier.contactPerson}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  {supplier.email && (
                    <div className="text-sm text-slate-600">
                      📧 {supplier.email}
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="text-sm text-slate-600">
                      📞 {supplier.phone}
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">
                        {products.filter(p => p.supplierId === supplier.id).length}
                      </span> products
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Inventory Analytics</h3>
            <p className="text-sm text-slate-600">Detailed insights into your inventory performance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">In Stock</span>
                    <span className="font-medium text-green-600">
                      {enrichedProducts.filter(p => p.stockStatus === 'in_stock').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Low Stock</span>
                    <span className="font-medium text-amber-600">
                      {lowStockProducts.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Out of Stock</span>
                    <span className="font-medium text-red-600">
                      {outOfStockProducts.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {PRODUCT_TYPES.map(type => {
                    const count = products.filter(p => p.productType === type.value).length;
                    return (
                      <div key={type.value} className="flex justify-between items-center">
                        <span className="text-sm flex items-center gap-2">
                          {type.icon} {type.label}
                        </span>
                        <span className="font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Stock Update Modal */}
      <Dialog open={openStockUpdate} onOpenChange={setOpenStockUpdate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Stock - {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Current stock: {enrichedProducts.find(p => p.id === selectedProduct?.id)?.currentStock || 0} units
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="operation">Operation</Label>
              <Select value={stockOperation} onValueChange={(value: 'add' | 'remove' | 'set') => setStockOperation(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Stock</SelectItem>
                  <SelectItem value="remove">Remove Stock</SelectItem>
                  <SelectItem value="set">Set Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                placeholder="Enter quantity"
              />
            </div>
            
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium">
                New Stock Level: {
                  stockOperation === 'add' ? (enrichedProducts.find(p => p.id === selectedProduct?.id)?.currentStock || 0) + stockQuantity :
                  stockOperation === 'remove' ? Math.max(0, (enrichedProducts.find(p => p.id === selectedProduct?.id)?.currentStock || 0) - stockQuantity) :
                  stockQuantity
                } units
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpenStockUpdate(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleStockUpdate}
              disabled={updateStockMutation.isPending || stockQuantity <= 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateStockMutation.isPending ? "Updating..." : "Update Stock"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Details Modal */}
      <Dialog open={openProductDetails} onOpenChange={setOpenProductDetails}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Package className="h-6 w-6 text-blue-600" />
              {selectedProduct?.name}
            </DialogTitle>
            <DialogDescription>
              Complete product information and details
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <>
            <div className="grid grid-cols-3 gap-6 py-4">
              {/* Left Column - Product Basic Info */}
              <div className="space-y-6">
                <Card className="border-slate-200">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <h3 className="font-semibold text-lg text-slate-900">Basic Information</h3>
                    <div className="flex items-center gap-2">
                      <QRCode
                        value={JSON.stringify({
                          id: selectedProduct.id,
                          name: selectedProduct.name,
                          sku: selectedProduct.sku,
                          price: selectedProduct.price,
                          barcode: selectedProduct.barcode,
                          url: `${window.location.origin}/product/${selectedProduct.id}`,
                        })}
                        size={40}
                        bgColor="white"
                        fgColor="#1f2937"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-600">SKU</Label>
                        <p className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">{selectedProduct.sku}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Product Type</Label>
                        <p className="text-sm flex items-center gap-2">
                          {getProductTypeIcon(selectedProduct.productType || "frames")}
                          {PRODUCT_TYPES.find(t => t.value === selectedProduct.productType)?.label || selectedProduct.productType}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Selling Price</Label>
                        <p className="text-xl font-bold text-green-600">${selectedProduct.price}</p>
                      </div>
                      {selectedProduct.costPrice && (
                        <div>
                          <Label className="text-sm font-medium text-slate-600">Cost Price</Label>
                          <p className="text-lg font-semibold text-slate-700">${selectedProduct.costPrice}</p>
                          <p className="text-xs text-slate-500">
                            Margin: {((parseFloat(selectedProduct.price) - parseFloat(selectedProduct.costPrice)) / parseFloat(selectedProduct.price) * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Category</Label>
                        <p className="text-sm">{enrichedProducts.find(p => p.id === selectedProduct.id)?.categoryName || "Uncategorized"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Supplier</Label>
                        <p className="text-sm">{enrichedProducts.find(p => p.id === selectedProduct.id)?.supplierName || "No supplier"}</p>
                      </div>
                    </div>

                    {selectedProduct.barcode && (
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Barcode</Label>
                        <p className="text-sm font-mono bg-slate-100 px-2 py-1 rounded w-fit">{selectedProduct.barcode}</p>
                      </div>
                    )}

                    {selectedProduct.description && (
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Description</Label>
                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded">{selectedProduct.description}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const canvas = document.querySelector('canvas');
                          if (canvas) {
                            const link = document.createElement('a');
                            link.download = `qr-${selectedProduct.sku}.png`;
                            link.href = canvas.toDataURL();
                            link.click();
                          }
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        QR Code
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const productUrl = `${window.location.origin}/product/${selectedProduct.id}`;
                          navigator.clipboard.writeText(productUrl);
                          toast({
                            title: "Link Copied",
                            description: "Product link copied to clipboard",
                          });
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Middle Column - Stock & Pricing Info */}
              <div className="space-y-6">
                <Card className="border-orange-200">
                  <CardHeader className="pb-3">
                    <h3 className="font-semibold text-lg text-slate-900">Stock & Inventory</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Current Stock</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-600">
                          {enrichedProducts.find(p => p.id === selectedProduct.id)?.currentStock || 0}
                        </span>
                        <span className="text-sm text-slate-500">units</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Reorder Level</Label>
                      <p className="text-sm">{selectedProduct.reorderLevel || 10} units</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Status</Label>
                      <div className="flex flex-col gap-2">
                        {getStockStatusBadge(
                          enrichedProducts.find(p => p.id === selectedProduct.id)?.stockStatus || 'in_stock',
                          enrichedProducts.find(p => p.id === selectedProduct.id)?.currentStock || 0
                        )}
                        <Badge variant={selectedProduct.isActive ? "default" : "secondary"}>
                          {selectedProduct.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Stock Value</Label>
                      <p className="text-lg font-semibold text-purple-600">
                        ${((enrichedProducts.find(p => p.id === selectedProduct.id)?.currentStock || 0) * parseFloat(selectedProduct.costPrice || "0")).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Potential Revenue</Label>
                      <p className="text-lg font-semibold text-green-600">
                        ${((enrichedProducts.find(p => p.id === selectedProduct.id)?.currentStock || 0) * parseFloat(selectedProduct.price)).toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Analytics & Actions */}
              <div className="space-y-6">
                <Card className="border-blue-200">
                  <CardHeader className="pb-3">
                    <h3 className="font-semibold text-lg text-slate-900">Quick Actions</h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full"
                      onClick={() => {
                        setSelectedProductForReorder(selectedProduct);
                        setOpenReorderModal(true);
                      }}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Reorder Stock
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelectedProduct(selectedProduct);
                        setOpenStockUpdate(true);
                        setOpenProductDetails(false);
                      }}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Update Stock
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        handleEditProduct(selectedProduct);
                        setOpenProductDetails(false);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Product
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader className="pb-3">
                    <h3 className="font-semibold text-lg text-slate-900">Sales Analytics</h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-slate-600">This Month</Label>
                      <p className="text-lg font-bold text-green-600">12 units sold</p>
                      <p className="text-xs text-slate-500">Revenue: $1,080.00</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Last 30 Days</Label>
                      <p className="text-sm">15 units sold</p>
                      <p className="text-xs text-slate-500">Avg. per day: 0.5 units</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Top Customer</Label>
                      <p className="text-sm">Sarah Johnson</p>
                      <p className="text-xs text-slate-500">3 purchases</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="col-span-3 border-t pt-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-slate-800">Purchase Invoices & Stock History</h4>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedProductForReorder(selectedProduct);
                    setOpenReorderModal(true);
                  }}
                  className="bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Reorder Stock
                </Button>
              </div>

              {/* Purchase History List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50/30">
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary" className="text-xs">Last Purchase</Badge>
                    <div>
                      <p className="font-medium text-sm">25 units</p>
                      <p className="text-xs text-slate-600">Jan 15, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-500 font-mono">INV-2024-001</span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-3"
                        onClick={() => window.open(`/api/invoice/pdf/INV-2024-001`, '_blank')}
                      >
                        <FileText className="mr-1 h-3 w-3" />
                        PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-3"
                        onClick={() => {
                          if (!selectedProduct) return;
                          const invoiceData = {
                            invoiceNumber: 'INV-2024-001',
                            product: selectedProduct.name,
                            quantity: 25,
                            unitCost: selectedProduct.costPrice || '45.00',
                            total: (25 * parseFloat(selectedProduct.costPrice || '45.00')).toFixed(2),
                            date: 'Jan 15, 2024'
                          };
                          navigator.clipboard.writeText(`Invoice: ${invoiceData.invoiceNumber}\nProduct: ${invoiceData.product}\nQuantity: ${invoiceData.quantity}\nTotal: $${invoiceData.total}`);
                          toast({
                            title: "Invoice Info Copied",
                            description: "Invoice details copied to clipboard",
                          });
                        }}
                      >
                        <Share2 className="mr-1 h-3 w-3" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50/30">
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary" className="text-xs">Previous Order</Badge>
                    <div>
                      <p className="font-medium text-sm">50 units</p>
                      <p className="text-xs text-slate-600">Dec 10, 2023</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-500 font-mono">INV-2023-089</span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-3"
                        onClick={() => window.open(`/api/invoice/pdf/INV-2023-089`, '_blank')}
                      >
                        <FileText className="mr-1 h-3 w-3" />
                        PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-3"
                        onClick={() => {
                          if (!selectedProduct) return;
                          const invoiceData = {
                            invoiceNumber: 'INV-2023-089',
                            product: selectedProduct.name,
                            quantity: 50,
                            unitCost: selectedProduct.costPrice || '45.00',
                            total: (50 * parseFloat(selectedProduct.costPrice || '45.00')).toFixed(2),
                            date: 'Dec 10, 2023'
                          };
                          navigator.clipboard.writeText(`Invoice: ${invoiceData.invoiceNumber}\nProduct: ${invoiceData.product}\nQuantity: ${invoiceData.quantity}\nTotal: $${invoiceData.total}`);
                          toast({
                            title: "Invoice Info Copied",
                            description: "Invoice details copied to clipboard",
                          });
                        }}
                      >
                        <Share2 className="mr-1 h-3 w-3" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-purple-200 rounded-lg bg-purple-50/30">
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary" className="text-xs">Initial Stock</Badge>
                    <div>
                      <p className="font-medium text-sm">100 units</p>
                      <p className="text-xs text-slate-600">Oct 5, 2023</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-500 font-mono">INV-2023-045</span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-3"
                        onClick={() => window.open(`/api/invoice/pdf/INV-2023-045`, '_blank')}
                      >
                        <FileText className="mr-1 h-3 w-3" />
                        PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-3"
                        onClick={() => {
                          if (!selectedProduct) return;
                          const invoiceData = {
                            invoiceNumber: 'INV-2023-045',
                            product: selectedProduct.name,
                            quantity: 100,
                            unitCost: selectedProduct.costPrice || '45.00',
                            total: (100 * parseFloat(selectedProduct.costPrice || '45.00')).toFixed(2),
                            date: 'Oct 5, 2023'
                          };
                          navigator.clipboard.writeText(`Invoice: ${invoiceData.invoiceNumber}\nProduct: ${invoiceData.product}\nQuantity: ${invoiceData.quantity}\nTotal: $${invoiceData.total}`);
                          toast({
                            title: "Invoice Info Copied",
                            description: "Invoice details copied to clipboard",
                          });
                        }}
                      >
                        <Share2 className="mr-1 h-3 w-3" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </>
          )}
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpenProductDetails(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                if (selectedProduct) {
                  setOpenProductDetails(false);
                  handleEditProduct(selectedProduct);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Edit Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={openQRCode} onOpenChange={setOpenQRCode}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Product QR Code</DialogTitle>
            <DialogDescription>
              {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white border rounded-lg">
                <QRCode
                  value={JSON.stringify({
                    id: selectedProduct.id,
                    name: selectedProduct.name,
                    sku: selectedProduct.sku,
                    price: selectedProduct.price,
                    barcode: selectedProduct.barcode,
                  })}
                  size={200}
                />
              </div>
              
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Scan this QR code to access product information
                </p>
              </div>
            </div>
          )}
          
          <div className="flex justify-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                if (selectedProduct) {
                  const canvas = document.querySelector('canvas');
                  if (canvas) {
                    const link = document.createElement('a');
                    link.download = `qr-${selectedProduct.sku}.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                  }
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button onClick={() => setOpenQRCode(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Single Product Reorder Modal */}
      <Dialog open={openReorderModal} onOpenChange={setOpenReorderModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reorder Stock - {selectedProductForReorder?.name}</DialogTitle>
            <DialogDescription>
              Create a purchase order to restock this product
            </DialogDescription>
          </DialogHeader>
          
          {selectedProductForReorder && (
            <ReorderForm 
              product={selectedProductForReorder}
              currentStock={enrichedProducts.find(p => p.id === selectedProductForReorder.id)?.currentStock || 0}
              onSubmit={(data) => {
                console.log('Reorder submitted:', data);
                
                if (data.success) {
                  toast({
                    title: "Purchase Order Created Successfully",
                    description: data.message || `Reorder has been processed and invoice ${data.invoice?.invoiceNumber} created.`,
                  });
                  
                  // Refresh data
                  queryClient.invalidateQueries({ queryKey: ["/api/products"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/store-inventory"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
                } else {
                  toast({
                    title: "Reorder Failed",
                    description: data.error || "Failed to process reorder. Please try again.",
                    variant: "destructive",
                  });
                }
                
                setOpenReorderModal(false);
              }}
              onCancel={() => setOpenReorderModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Reorder Modal */}
      <Dialog open={openBulkReorderModal} onOpenChange={setOpenBulkReorderModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Stock Reorder System</DialogTitle>
            <DialogDescription>
              Select multiple products to reorder from the same supplier with invoice generation
            </DialogDescription>
          </DialogHeader>
          
          <BulkReorderForm 
            suppliers={suppliers}
            products={enrichedProducts}
            onSubmit={(data) => {
              console.log('Bulk reorder submitted:', data);
              
              if (data.success) {
                toast({
                  title: "Bulk Purchase Order Created Successfully",
                  description: data.message || `Bulk reorder has been processed and invoice ${data.invoice?.invoiceNumber} created.`,
                });
                
                // Refresh data
                queryClient.invalidateQueries({ queryKey: ["/api/products"] });
                queryClient.invalidateQueries({ queryKey: ["/api/store-inventory"] });
                queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
              } else {
                toast({
                  title: "Bulk Reorder Failed",
                  description: data.error || "Failed to process bulk reorder. Please try again.",
                  variant: "destructive",
                });
              }
              
              setOpenBulkReorderModal(false);
              setSelectedSupplierId("");
              setSelectedProductsForBulkReorder([]);
              setBulkReorderData({});
            }}
            onCancel={() => {
              setOpenBulkReorderModal(false);
              setSelectedSupplierId("");
              setSelectedProductsForBulkReorder([]);
              setBulkReorderData({});
            }}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}

// Reorder Form Component
interface ReorderFormProps {
  product: Product;
  currentStock: number;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

function ReorderForm({ product, currentStock, onSubmit, onCancel }: ReorderFormProps) {
  const [quantity, setQuantity] = useState((product.reorderLevel || 10) * 2);
  const [unitCost, setUnitCost] = useState(parseFloat(product.costPrice || "0"));
  const [taxRate, setTaxRate] = useState(8.5);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [handling, setHandling] = useState(0);
  const [notes, setNotes] = useState("");

  const subtotal = quantity * unitCost;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount - discount + shipping + handling;

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/products/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          unitCost,
          notes,
          taxRate,
          discount,
          shipping,
          handling,
          subtotal,
          taxAmount,
          total
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process reorder');
      }

      const result = await response.json();
      
      onSubmit({
        success: true,
        invoice: result.invoice,
        updatedProduct: result.updatedProduct,
        message: result.message
      });
    } catch (error) {
      console.error('Reorder error:', error);
      onSubmit({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process reorder'
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Current Stock</Label>
          <p className="text-lg font-semibold text-blue-600">{currentStock} units</p>
        </div>
        <div>
          <Label>Reorder Level</Label>
          <p className="text-sm text-slate-600">{product.reorderLevel || 10} units</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">Quantity to Order</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            placeholder="Enter quantity"
          />
        </div>
        <div>
          <Label htmlFor="unitCost">Unit Cost</Label>
          <Input
            id="unitCost"
            type="number"
            step="0.01"
            value={unitCost}
            onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
            placeholder="Enter unit cost"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label htmlFor="taxRate">Tax Rate (%)</Label>
          <Input
            id="taxRate"
            type="number"
            step="0.1"
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
            placeholder="8.5"
          />
        </div>
        <div>
          <Label htmlFor="discount">Discount</Label>
          <Input
            id="discount"
            type="number"
            step="0.01"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="shipping">Shipping</Label>
          <Input
            id="shipping"
            type="number"
            step="0.01"
            value={shipping}
            onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="handling">Handling</Label>
          <Input
            id="handling"
            type="number"
            step="0.01"
            value={handling}
            onChange={(e) => setHandling(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Purchase Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes for this purchase order..."
          className="min-h-[60px]"
        />
      </div>

      {/* Cost Summary */}
      <div className="bg-slate-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({taxRate}%):</span>
          <span>${taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount:</span>
          <span>-${discount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping & Handling:</span>
          <span>${(shipping + handling).toFixed(2)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-semibold text-lg">
          <span>Total:</span>
          <span className="text-blue-600">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700">
          <Calculator className="mr-2 h-4 w-4" />
          Create Purchase Order & Invoice
        </Button>
      </div>
    </div>
  );
}

// Bulk Reorder Form Component
interface BulkReorderFormProps {
  suppliers: Supplier[];
  products: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

function BulkReorderForm({ suppliers, products, onSubmit, onCancel }: BulkReorderFormProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productData, setProductData] = useState<Record<string, { quantity: number; unitCost: number }>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);
  
  // Invoice-like calculations
  const [taxRate, setTaxRate] = useState(8.5);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [shippingCost, setShippingCost] = useState(50);
  const [handlingCost, setHandlingCost] = useState(25);
  const [notes, setNotes] = useState("");
  const [orderReference, setOrderReference] = useState(`PO-${Date.now().toString().slice(-6)}`);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const filteredProducts = products.filter(p => 
    p.supplierId === selectedSupplierId && 
    (searchTerm === "" || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const calculateSubtotal = () => {
    return selectedProducts.reduce((total, productId) => {
      const data = productData[productId];
      if (!data) return total;
      return total + (data.quantity * data.unitCost);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const discountTotal = discountType === 'percentage' ? (subtotal * discountAmount) / 100 : discountAmount;
  const taxableAmount = subtotal - discountTotal;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const finalTotal = taxableAmount + taxAmount + shippingCost + handlingCost;

  const handleProductSelect = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
      const product = products.find(p => p.id === productId);
      if (product) {
        setProductData(prev => ({
          ...prev,
          [productId]: {
            quantity: (product.reorderLevel || 10) * 2,
            unitCost: parseFloat(product.costPrice || "0")
          }
        }));
      }
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
      setProductData(prev => {
        const newData = { ...prev };
        delete newData[productId];
        return newData;
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/products/bulk-reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplierId: selectedSupplierId,
          selectedProducts,
          productData,
          subtotal,
          taxRate,
          taxAmount,
          discountAmount,
          shippingCost,
          total: finalTotal,
          notes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process bulk reorder');
      }

      const result = await response.json();
      
      onSubmit({
        success: true,
        invoice: result.invoice,
        updatedProducts: result.updatedProducts,
        message: result.message
      });
    } catch (error) {
      console.error('Bulk reorder error:', error);
      onSubmit({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process bulk reorder'
      });
    }
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Purchase Order Header */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-orange-800">Create Purchase Order</h2>
            <p className="text-sm text-orange-600">Generate bulk reorder for multiple products</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-orange-600">Order #</div>
            <div className="font-mono text-lg font-bold text-orange-800">{orderReference}</div>
          </div>
        </div>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Supplier</Label>
            <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose supplier for bulk order" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>{supplier.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {products.filter(p => p.supplierId === supplier.id).length} products
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-base font-semibold">Expected Delivery Date</Label>
            <Input
              type="date"
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Purchase Order Reference</Label>
            <Input
              value={orderReference}
              onChange={(e) => setOrderReference(e.target.value)}
              className="mt-2"
              placeholder="PO-123456"
            />
          </div>

          <div>
            <Label className="text-base font-semibold">Order Date</Label>
            <Input
              type="date"
              value={new Date().toISOString().split('T')[0]}
              disabled
              className="mt-2 bg-slate-50"
            />
          </div>
        </div>
      </div>

      {selectedSupplierId && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              onClick={() => setShowProductSearch(!showProductSearch)}
              variant="outline"
              className="min-w-[120px]"
            >
              <Search className="mr-2 h-4 w-4" />
              {showProductSearch ? "Hide Search" : "Search Products"}
            </Button>
          </div>

          {selectedProducts.length > 0 && (
            <div className="border rounded-lg">
              <div className="p-4 bg-slate-50 border-b">
                <h4 className="font-medium">Selected Products ({selectedProducts.length})</h4>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Remove</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.filter(p => selectedProducts.includes(p.id)).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProductSelect(product.id, false)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-slate-500">{product.sku}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.currentStock <= (product.reorderLevel || 10) ? "destructive" : "default"}>
                          {product.currentStock} units
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={productData[product.id]?.quantity || 0}
                          onChange={(e) => {
                            const quantity = parseInt(e.target.value) || 0;
                            setProductData(prev => ({
                              ...prev,
                              [product.id]: { ...prev[product.id], quantity }
                            }));
                          }}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={productData[product.id]?.unitCost || 0}
                          onChange={(e) => {
                            const unitCost = parseFloat(e.target.value) || 0;
                            setProductData(prev => ({
                              ...prev,
                              [product.id]: { ...prev[product.id], unitCost }
                            }));
                          }}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-600">
                          ${((productData[product.id]?.quantity || 0) * (productData[product.id]?.unitCost || 0)).toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {(showProductSearch || searchTerm !== "") && filteredProducts.length > 0 && (
            <div className="border rounded-lg">
              <div className="p-4 bg-blue-50 border-b">
                <h4 className="font-medium">Available Products</h4>
                {searchTerm && <p className="text-sm text-slate-600">Showing results for "{searchTerm}"</p>}
              </div>
              <div className="max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Cost Price</TableHead>
                      <TableHead className="w-12">Add</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.filter(p => !selectedProducts.includes(p.id)).map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-slate-500">{product.sku}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.currentStock <= (product.reorderLevel || 10) ? "destructive" : "default"}>
                            {product.currentStock} units
                          </Badge>
                        </TableCell>
                        <TableCell>
                          ${product.costPrice || "0.00"}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleProductSelect(product.id, true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedProducts.length > 0 && (
        <div className="space-y-6">
          {/* Professional Order Summary and Calculations */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-slate-800">Order Calculations</h3>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Professional Invoice Format
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              {/* Tax & Discount */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="taxRate" className="text-sm font-medium">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.1"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Discount Type</Label>
                  <div className="flex space-x-2 mt-1">
                    <Button
                      variant={discountType === 'fixed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDiscountType('fixed')}
                      className="flex-1"
                    >
                      $ Fixed
                    </Button>
                    <Button
                      variant={discountType === 'percentage' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDiscountType('percentage')}
                      className="flex-1"
                    >
                      % Percent
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="discount" className="text-sm font-medium">
                    Discount {discountType === 'percentage' ? '(%)' : '($)'}
                  </Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Shipping & Handling */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shipping" className="text-sm font-medium">Shipping Cost ($)</Label>
                  <Input
                    id="shipping"
                    type="number"
                    step="0.01"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="handling" className="text-sm font-medium">Handling Fee ($)</Label>
                  <Input
                    id="handling"
                    type="number"
                    step="0.01"
                    value={handlingCost}
                    onChange={(e) => setHandlingCost(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notes" className="text-sm font-medium">Purchase Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes for this purchase order..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Invoice Summary */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-lg text-slate-800 mb-4">Purchase Order Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600">Subtotal ({selectedProducts.length} products):</span>
                <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600">
                  Discount {discountType === 'percentage' ? `(${discountAmount}%)` : ''}:
                </span>
                <span className="font-semibold text-red-600">-${discountTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600">Tax ({taxRate}%):</span>
                <span className="font-semibold text-slate-800">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600">Shipping & Handling:</span>
                <span className="font-semibold text-slate-800">${(shippingCost + handlingCost).toFixed(2)}</span>
              </div>
              <div className="border-t border-blue-300 pt-3 flex justify-between items-center">
                <span className="font-bold text-lg text-slate-800">Grand Total:</span>
                <span className="font-bold text-xl text-blue-600">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={selectedProducts.length === 0}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Package className="mr-2 h-4 w-4" />
          Create Bulk Purchase Order ({selectedProducts.length} items)
        </Button>
      </div>
    </div>
  );
}
