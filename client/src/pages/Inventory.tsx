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
  CheckCircle2, Clock, AlertCircle, XCircle, Share2
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
                                setOpenQRCode(true);
                              }}
                              title="Generate QR Code"
                            >
                              <QrCode className="h-4 w-4" />
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
                                <DropdownMenuItem onClick={() => {
                                  setSelectedProduct(product);
                                  setOpenStockUpdate(true);
                                }}>
                                  <Package className="mr-2 h-4 w-4" />
                                  Update Stock
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                  const productUrl = `${window.location.origin}/product/${product.id}`;
                                  navigator.clipboard.writeText(productUrl);
                                  toast({
                                    title: "Link Copied",
                                    description: "Product link copied to clipboard",
                                  });
                                }}>
                                  <Share className="mr-2 h-4 w-4" />
                                  Share Product
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  const printContent = `
                                    <html>
                                      <head><title>Product: ${product.name}</title></head>
                                      <body style="font-family: Arial, sans-serif; padding: 20px;">
                                        <h1>${product.name}</h1>
                                        <p><strong>SKU:</strong> ${product.sku}</p>
                                        <p><strong>Price:</strong> $${product.price}</p>
                                        <p><strong>Stock:</strong> ${product.currentStock} units</p>
                                        <p><strong>Description:</strong> ${product.description || 'N/A'}</p>
                                      </body>
                                    </html>
                                  `;
                                  const printWindow = window.open('', '_blank');
                                  if (printWindow) {
                                    printWindow.document.write(printContent);
                                    printWindow.document.close(); 
                                    printWindow.print();
                                  }
                                }}>
                                  <Printer className="mr-2 h-4 w-4" />
                                  Print Product
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
            
            <Dialog open={openCategory} onOpenChange={setOpenCategory}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Create a new product category to organize your inventory
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...categoryForm}>
                  <form onSubmit={categoryForm.handleSubmit((data) => createCategoryMutation.mutate(data))} className="space-y-4">
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
                        disabled={createCategoryMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Complete product information and details
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-500">SKU</Label>
                  <p className="text-sm">{selectedProduct.sku}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-500">Product Type</Label>
                  <p className="text-sm flex items-center gap-2">
                    {getProductTypeIcon(selectedProduct.productType || "frames")}
                    {PRODUCT_TYPES.find(t => t.value === selectedProduct.productType)?.label}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-500">Category</Label>
                  <p className="text-sm">{enrichedProducts.find(p => p.id === selectedProduct.id)?.categoryName}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-500">Supplier</Label>
                  <p className="text-sm">{enrichedProducts.find(p => p.id === selectedProduct.id)?.supplierName}</p>
                </div>
                
                {selectedProduct.description && (
                  <div>
                    <Label className="text-sm font-medium text-slate-500">Description</Label>
                    <p className="text-sm">{selectedProduct.description}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-500">Selling Price</Label>
                  <p className="text-lg font-semibold text-green-600">${selectedProduct.price}</p>
                </div>
                
                {selectedProduct.costPrice && (
                  <div>
                    <Label className="text-sm font-medium text-slate-500">Cost Price</Label>
                    <p className="text-sm">${selectedProduct.costPrice}</p>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium text-slate-500">Current Stock</Label>
                  <p className="text-lg font-semibold">
                    {enrichedProducts.find(p => p.id === selectedProduct.id)?.currentStock || 0} units
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-500">Reorder Level</Label>
                  <p className="text-sm">{selectedProduct.reorderLevel} units</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-500">Status</Label>
                  <div className="flex gap-2">
                    {getStockStatusBadge(
                      enrichedProducts.find(p => p.id === selectedProduct.id)?.stockStatus || 'in_stock',
                      enrichedProducts.find(p => p.id === selectedProduct.id)?.currentStock || 0
                    )}
                    <Badge variant={selectedProduct.isActive ? "default" : "secondary"}>
                      {selectedProduct.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                
                {selectedProduct.barcode && (
                  <div>
                    <Label className="text-sm font-medium text-slate-500">Barcode</Label>
                    <p className="text-sm font-mono">{selectedProduct.barcode}</p>
                  </div>
                )}
              </div>

              {/* QR Code Section */}
              <div className="flex flex-col items-center space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-500">Product QR Code</Label>
                </div>
                <div className="p-4 bg-white border-2 border-slate-200 rounded-lg shadow-sm">
                  <QRCode
                    value={JSON.stringify({
                      id: selectedProduct.id,
                      name: selectedProduct.name,
                      sku: selectedProduct.sku,
                      price: selectedProduct.price,
                      barcode: selectedProduct.barcode,
                      url: `${window.location.origin}/product/${selectedProduct.id}`,
                    })}
                    size={160}
                    bgColor="white"
                    fgColor="#1f2937"
                  />
                </div>
                <div className="flex gap-2">
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
                    Download
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
                <p className="text-xs text-slate-500 text-center">
                  Scan to view product details
                </p>
              </div>
            </div>
          )}
          
          {/* Invoice Section */}
          {selectedProduct && (
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-slate-700">Purchase Invoices</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOpenProductDetails(false);
                    setSelectedProductForReorder(selectedProduct);
                    setOpenReorderModal(true);
                  }}
                  className="bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Reorder Stock
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    window.open(`/api/invoices/download/${selectedProduct.id}`, '_blank');
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    window.open(`/api/invoices/view/${selectedProduct.id}`, '_blank');
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/invoice/${selectedProduct.id}`;
                    navigator.clipboard.writeText(shareUrl);
                    toast({
                      title: "Link Copied",
                      description: "Invoice link copied to clipboard",
                    });
                  }}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Invoice
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpenProductDetails(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                setOpenProductDetails(false);
                handleEditProduct(selectedProduct);
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Current Stock</Label>
                  <p className="text-lg font-semibold text-blue-600">
                    {enrichedProducts.find(p => p.id === selectedProductForReorder.id)?.currentStock || 0} units
                  </p>
                </div>
                <div>
                  <Label>Reorder Level</Label>
                  <p className="text-sm text-slate-600">{selectedProductForReorder.reorderLevel} units</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reorderQuantity">Quantity to Order</Label>
                  <Input
                    id="reorderQuantity"
                    type="number"
                    min="1"
                    defaultValue={(selectedProductForReorder.reorderLevel || 10) * 2}
                    placeholder="Enter quantity"
                  />
                </div>
                <div>
                  <Label htmlFor="unitCost">Unit Cost</Label>
                  <Input
                    id="unitCost"
                    type="number"
                    step="0.01"
                    defaultValue={selectedProductForReorder.costPrice || ""}
                    placeholder="Enter unit cost"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.1"
                    defaultValue="8.5"
                    placeholder="8.5"
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Discount</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    defaultValue="0"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="shipping">Shipping Cost</Label>
                  <Input
                    id="shipping"
                    type="number"
                    step="0.01"
                    defaultValue="0"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Purchase Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes for this purchase order..."
                  className="min-h-[60px]"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setOpenReorderModal(false)}>
                  Cancel
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Create Purchase Order & Invoice
                </Button>
              </div>
            </div>
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
          
          <div className="space-y-6">
            {/* Supplier Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Select Supplier</Label>
                <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose supplier..." />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Purchase Date</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
            </div>

            {/* Product Selection Table */}
            {selectedSupplierId && (
              <div className="border rounded-lg">
                <div className="p-4 bg-slate-50 border-b">
                  <h4 className="font-medium">Products from {suppliers.find(s => s.id === selectedSupplierId)?.name}</h4>
                  <p className="text-sm text-slate-600">Select products to include in bulk reorder</p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Select</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Reorder Level</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrichedProducts.filter(p => p.supplierId === selectedSupplierId).map((product) => (
                      <TableRow key={product.id} className={selectedProductsForBulkReorder.includes(product.id) ? "bg-blue-50" : ""}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedProductsForBulkReorder.includes(product.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedProductsForBulkReorder([...selectedProductsForBulkReorder, product.id]);
                                // Initialize default values
                                setBulkReorderData(prev => ({
                                  ...prev,
                                  [product.id]: { 
                                    quantity: (product.reorderLevel || 10) * 2,
                                    unitCost: parseFloat(product.costPrice || "0")
                                  }
                                }));
                              } else {
                                setSelectedProductsForBulkReorder(selectedProductsForBulkReorder.filter(id => id !== product.id));
                                setBulkReorderData(prev => {
                                  const newData = { ...prev };
                                  delete newData[product.id];
                                  return newData;
                                });
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{getProductTypeIcon(product.productType || "frames")}</div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-slate-500">{product.sku}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.currentStock <= (product.reorderLevel || 10) ? "destructive" : "default"}>
                            {product.currentStock} units
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-amber-600 font-medium">{product.reorderLevel || 10} units</span>
                        </TableCell>
                        <TableCell>
                          {selectedProductsForBulkReorder.includes(product.id) && (
                            <Input
                              type="number"
                              min="1"
                              value={bulkReorderData[product.id]?.quantity || (product.reorderLevel || 10) * 2}
                              className="w-20"
                              onChange={(e) => {
                                const quantity = parseInt(e.target.value) || 0;
                                setBulkReorderData(prev => ({
                                  ...prev,
                                  [product.id]: { ...prev[product.id], quantity }
                                }));
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {selectedProductsForBulkReorder.includes(product.id) && (
                            <Input
                              type="number"
                              step="0.01"
                              value={bulkReorderData[product.id]?.unitCost || parseFloat(product.costPrice || "0")}
                              className="w-24"
                              onChange={(e) => {
                                const unitCost = parseFloat(e.target.value) || 0;
                                setBulkReorderData(prev => ({
                                  ...prev,
                                  [product.id]: { ...prev[product.id], unitCost }
                                }));
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {selectedProductsForBulkReorder.includes(product.id) && (
                            <span className="font-medium text-green-600">
                              ${((bulkReorderData[product.id]?.quantity || (product.reorderLevel || 10) * 2) * 
                                 (bulkReorderData[product.id]?.unitCost || parseFloat(product.costPrice || "0"))).toFixed(2)}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Order Summary & Costs */}
            {selectedProductsForBulkReorder.length > 0 && (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Additional Costs</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tax Rate (%)</Label>
                      <Input type="number" step="0.1" defaultValue="8.5" id="bulkTaxRate" />
                    </div>
                    <div>
                      <Label>Discount Amount</Label>
                      <Input type="number" step="0.01" defaultValue="0" id="bulkDiscount" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Shipping Cost</Label>
                      <Input type="number" step="0.01" defaultValue="0" id="bulkShipping" />
                    </div>
                    <div>
                      <Label>Handling Fee</Label>
                      <Input type="number" step="0.01" defaultValue="0" id="bulkHandling" />
                    </div>
                  </div>
                  <div>
                    <Label>Purchase Notes</Label>
                    <Textarea placeholder="Notes for this bulk purchase order..." className="min-h-[80px]" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Order Summary</h4>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span>Products Selected:</span>
                      <span className="font-medium">{selectedProductsForBulkReorder.length} items</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">${calculateBulkSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8.5%):</span>
                      <span>${(calculateBulkSubtotal() * 0.085).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>$0.00</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                      <span>Total Amount:</span>
                      <span className="text-blue-600">${(calculateBulkSubtotal() * 1.085).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-800 mb-2">Invoice Generation</h5>
                    <p className="text-sm text-blue-600">
                      This will automatically generate a comprehensive purchase invoice with:
                    </p>
                    <ul className="text-sm text-blue-600 mt-2 space-y-1">
                      <li>• PDF invoice download</li>
                      <li>• Inventory stock updates</li>
                      <li>• Accounting entry creation</li>
                      <li>• Email notification to supplier</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setOpenBulkReorderModal(false);
                setSelectedSupplierId("");
                setSelectedProductsForBulkReorder([]);
                setBulkReorderData({});
              }}>
                Cancel
              </Button>
              <Button 
                className="bg-orange-600 hover:bg-orange-700"
                disabled={selectedProductsForBulkReorder.length === 0}
              >
                <Package className="mr-2 h-4 w-4" />
                Create Bulk Purchase Order & Invoices ({selectedProductsForBulkReorder.length} items)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}