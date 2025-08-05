import React, { useState } from "react";
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
  CheckCircle2, Clock, AlertCircle, XCircle, Share2, Calculator, RefreshCw, CreditCard
} from "lucide-react";
import QRCode from 'react-qr-code';
import PurchaseInvoiceTemplate from '@/components/PurchaseInvoiceTemplate';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  // Stock update dialog removed
  const [openProductDetails, setOpenProductDetails] = useState(false);
  const [openQRCode, setOpenQRCode] = useState(false);
  const [openReorderModal, setOpenReorderModal] = useState(false);
  const [selectedProductForReorder, setSelectedProductForReorder] = useState<Product | null>(null);
  const [openBulkReorderModal, setOpenBulkReorderModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedProductsForBulkReorder, setSelectedProductsForBulkReorder] = useState<string[]>([]);
  const [bulkReorderData, setBulkReorderData] = useState<Record<string, { quantity: number; unitCost: number }>>({});
  const [showPurchaseInvoice, setShowPurchaseInvoice] = useState(false);
  const [purchaseInvoiceData, setPurchaseInvoiceData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  // Stock operation states removed
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  // Pagination and sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'price' | 'stock'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // desc to show newest first
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

  // Filter and sort products
  const filteredAndSortedProducts = enrichedProducts
    .filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === "all" || product.productType === typeFilter;
      
      const matchesStock = stockFilter === "all" || 
        (stockFilter === "in_stock" && product.stockStatus === "in_stock") ||
        (stockFilter === "low_stock" && product.stockStatus === "low_stock") ||
        (stockFilter === "out_of_stock" && product.stockStatus === "out_of_stock");
      
      return matchesSearch && matchesType && matchesStock;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = parseFloat(a.price);
          bValue = parseFloat(b.price);
          break;
        case 'stock':
          aValue = a.currentStock;
          bValue = b.currentStock;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Pagination logic
  const totalItems = filteredAndSortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const resetPagination = () => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  };

  // Auto-reset pagination when filters change
  React.useEffect(() => {
    resetPagination();
  }, [searchTerm, typeFilter, stockFilter, totalPages]);

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
    // Coupon redemption fields
    appliedCouponCode: string;
    serviceType: string;
    couponDiscountAmount: number;
  }>({
    resolver: zodResolver(insertProductSchema.extend({
      initialStock: z.number().min(0).default(0),
      purchasePrice: z.string().optional(),
      createPurchaseOrder: z.boolean().default(false),
      purchaseNotes: z.string().optional(),
      taxRate: z.number().min(0).max(100).default(8.5),
      discountAmount: z.number().min(0).default(0),
      shippingCost: z.number().min(0).default(0),
      handlingCost: z.number().min(0).default(0),
      // Coupon redemption validation
      appliedCouponCode: z.string().optional(),
      serviceType: z.enum(['eye_exam', 'glasses', 'contact_lenses', 'surgery', 'treatment', 'consultation', 'diagnostic', 'other']).optional(),
      couponDiscountAmount: z.number().min(0).default(0),
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
      console.log("Starting product creation with data:", data);
      const { initialStock, purchasePrice, createPurchaseOrder, purchaseNotes, taxRate, discountAmount, shippingCost, handlingCost, ...productData } = data;
      
      // Auto-generate barcode if not provided or empty
      if (!productData.barcode || productData.barcode.trim() === '') {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        productData.barcode = `BC${timestamp}${random}`;
      }
      
      // Auto-generate SKU if not provided or empty
      if (!productData.sku || productData.sku.trim() === '') {
        const typePrefix = productData.productType?.substring(0, 2).toUpperCase() || 'PR';
        // Generate a more unique SKU using timestamp + random number
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        productData.sku = `${typePrefix}-${timestamp}${random}`;
      }
      
      console.log("Sending productData to API:", productData);
      
      let product: Product;
      try {
        const response = await apiRequest("POST", "/api/products", productData);
        console.log("Raw API response:", response);
        
        // apiRequest returns a Response object, we need to parse it
        if (response instanceof Response) {
          if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
          }
          product = await response.json() as Product;
        } else {
          // Fallback in case apiRequest already returns parsed JSON
          product = response as Product;
        }
        
        console.log("Parsed product data:", product);
        
        if (!product || !product.id) {
          console.error("Invalid API response structure:", product);
          throw new Error("Invalid response from API - missing product ID");
        }
      } catch (error) {
        console.error("API request failed:", error);
        throw error;
      }
      
      const productId = product.id;
      console.log("Product created with ID:", productId);
      
      // Create initial inventory record if stock is provided
      if (initialStock && initialStock > 0) {
        console.log("Creating inventory with:", { 
          storeId: "5ff902af-3849-4ea6-945b-4d49175d6638",
          productId: productId, 
          quantity: initialStock 
        });
        
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
          try {
            console.log("Creating purchase order with product ID:", productId);
            const unitCost = parseFloat(purchasePrice);
            
            if (isNaN(unitCost) || unitCost <= 0) {
              throw new Error("Invalid purchase price for purchase order");
            }
            
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
            
            console.log("Creating invoice with data:", invoiceData);
            const invoiceResponse = await apiRequest("POST", "/api/invoices", invoiceData);
            console.log("Purchase order created successfully:", invoiceResponse);
          } catch (invoiceError) {
            console.error("Failed to create purchase order (continuing with product creation):", invoiceError);
            // Don't throw error here - product was created successfully, just log the invoice error
          }
        }
      }
      
      return product;
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
    onError: (error: any) => {
      console.error("Create product error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create product. Please check all required fields.",
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

  // Update Stock functionality removed - only Reorder Stock available

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

  // Stock update handler removed - only reorder functionality available

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
                          </div>

                          <div className="grid grid-cols-3 gap-4">
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

          {/* Pagination and Sorting Controls */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                {/* Left side: Sort controls and item count */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Sort by:</Label>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Latest First</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="stock">Stock Level</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                  </div>
                  <div className="text-sm text-slate-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} products
                  </div>
                </div>

                {/* Right side: Items per page and pagination */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Items per page:</Label>
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                      setItemsPerPage(parseInt(value));
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="w-[80px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm font-medium px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Products Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Product Catalog ({totalItems} items)</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} products
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
                          checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedProducts([...selectedProducts, ...paginatedProducts.map(p => p.id).filter(id => !selectedProducts.includes(id))]);
                            } else {
                              setSelectedProducts(selectedProducts.filter(id => !paginatedProducts.map(p => p.id).includes(id)));
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
                    {paginatedProducts.map((product) => (
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
                                setSelectedProductForReorder(product);
                                setOpenReorderModal(true);
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

      {/* Stock Update Modal removed - only reorder functionality available */}

      {/* Product Details Modal */}
      <Dialog open={openProductDetails} onOpenChange={setOpenProductDetails}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Package className="h-6 w-6 text-blue-600" />
                  {selectedProduct?.name}
                </DialogTitle>
                <DialogDescription>
                  Complete product information and details
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="print:hidden"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (selectedProduct) {
                      const printWindow = window.open('', '_blank');
                      const enrichedProduct = enrichedProducts.find(p => p.id === selectedProduct.id);
                      const printContent = `
                        <html>
                          <head>
                            <title>Product Details - ${selectedProduct.name}</title>
                            <style>
                              body { font-family: Arial, sans-serif; padding: 20px; }
                              .header { border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px; }
                              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                              .field { margin-bottom: 10px; }
                              .label { font-weight: bold; color: #374151; }
                              .value { color: #1f2937; }
                              .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
                              .in-stock { background: #dcfce7; color: #166534; }
                              .low-stock { background: #fef3c7; color: #92400e; }
                              .out-of-stock { background: #fecaca; color: #991b1b; }
                              @media print { body { margin: 0; } }
                            </style>
                          </head>
                          <body>
                            <div class="header">
                              <h1>${selectedProduct.name}</h1>
                              <p>SKU: ${selectedProduct.sku}</p>
                              <p>Generated: ${new Date().toLocaleDateString()}</p>
                            </div>
                            <div class="grid">
                              <div>
                                <div class="field">
                                  <div class="label">Product Type:</div>
                                  <div class="value">${selectedProduct.productType || 'N/A'}</div>
                                </div>
                                <div class="field">
                                  <div class="label">Description:</div>
                                  <div class="value">${selectedProduct.description || 'No description'}</div>
                                </div>
                                <div class="field">
                                  <div class="label">Category:</div>
                                  <div class="value">${enrichedProduct?.categoryName || 'N/A'}</div>
                                </div>
                                <div class="field">
                                  <div class="label">Supplier:</div>
                                  <div class="value">${enrichedProduct?.supplierName || 'N/A'}</div>
                                </div>
                                <div class="field">
                                  <div class="label">Barcode:</div>
                                  <div class="value">${selectedProduct.barcode || 'N/A'}</div>
                                </div>
                              </div>
                              <div>
                                <div class="field">
                                  <div class="label">Selling Price:</div>
                                  <div class="value">$${selectedProduct.price}</div>
                                </div>
                                <div class="field">
                                  <div class="label">Cost Price:</div>
                                  <div class="value">$${selectedProduct.costPrice || 'N/A'}</div>
                                </div>
                                <div class="field">
                                  <div class="label">Current Stock:</div>
                                  <div class="value">${enrichedProduct?.currentStock || 0} units</div>
                                </div>
                                <div class="field">
                                  <div class="label">Reorder Level:</div>
                                  <div class="value">${selectedProduct.reorderLevel || 'N/A'} units</div>
                                </div>
                                <div class="field">
                                  <div class="label">Stock Status:</div>
                                  <div class="value">
                                    <span class="status-badge ${enrichedProduct?.stockStatus === 'in_stock' ? 'in-stock' : enrichedProduct?.stockStatus === 'low_stock' ? 'low-stock' : 'out-of-stock'}">
                                      ${enrichedProduct?.stockStatus === 'in_stock' ? 'In Stock' : enrichedProduct?.stockStatus === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                                    </span>
                                  </div>
                                </div>
                                <div class="field">
                                  <div class="label">Status:</div>
                                  <div class="value">${selectedProduct.isActive ? 'Active' : 'Inactive'}</div>
                                </div>
                              </div>
                            </div>
                          </body>
                        </html>
                      `;
                      printWindow?.document.write(printContent);
                      printWindow?.document.close();
                      printWindow?.print();
                    }
                  }}
                  className="print:hidden"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          {selectedProduct && (
            <>
            <div className="grid grid-cols-3 gap-4 py-4">
              {/* Left Column - Product Basic Info */}
              <div className="space-y-4">
                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <h3 className="font-semibold text-lg text-slate-900">Basic Information</h3>
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
                          {PRODUCT_TYPES.find(t => t.value === selectedProduct.productType)?.label}
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
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Category</Label>
                        <p className="text-sm">{enrichedProducts.find(p => p.id === selectedProduct.id)?.categoryName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Supplier</Label>
                        <p className="text-sm">{enrichedProducts.find(p => p.id === selectedProduct.id)?.supplierName}</p>
                      </div>
                    </div>

                    {selectedProduct.description && (
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Description</Label>
                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded">{selectedProduct.description}</p>
                      </div>
                    )}

                    {selectedProduct.barcode && (
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Barcode</Label>
                        <p className="text-sm font-mono bg-slate-100 px-2 py-1 rounded w-fit">{selectedProduct.barcode}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Middle Column - Stock Info */}
              <div className="space-y-4">
                <Card className="border-orange-200">
                  <CardHeader className="pb-3">
                    <h3 className="font-semibold text-lg text-slate-900">Stock Information</h3>
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
                      <p className="text-sm">{selectedProduct.reorderLevel} units</p>
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
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - QR Code */}
              <div className="space-y-4">
                <Card className="border-purple-200">
                  <CardHeader className="pb-3">
                    <h3 className="font-semibold text-lg text-slate-900">QR Code</h3>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center space-y-3">
                    <QRCode
                      value={JSON.stringify({
                        id: selectedProduct.id,
                        name: selectedProduct.name,
                        sku: selectedProduct.sku,
                        price: selectedProduct.price,
                        barcode: selectedProduct.barcode,
                        url: `${window.location.origin}/product/${selectedProduct.id}`,
                      })}
                      size={80}
                      bgColor="white"
                      fgColor="#1f2937"
                    />
                    <div className="flex flex-col gap-2 w-full">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
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
                        className="w-full"
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
                      Scan to view details
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
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

              <ProductPurchaseHistory 
                productId={selectedProduct.id} 
                onReorder={() => {
                  setSelectedProductForReorder(selectedProduct);
                  setOpenReorderModal(true);
                }}
              />
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
              suppliers={suppliers}
              onSubmit={(data) => {
                console.log('Reorder submitted:', data);
                
                if (data.success) {
                  toast({
                    title: "Purchase Order Created Successfully",
                    description: data.message || `Reorder has been processed and invoice ${data.invoice?.invoiceNumber} created.`,
                  });
                  
                  // Show purchase invoice if available
                  if (data.invoice) {
                    setPurchaseInvoiceData(data.invoice);
                    setShowPurchaseInvoice(true);
                  }
                  
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
                
                // Show purchase invoice if available
                if (data.invoice) {
                  setPurchaseInvoiceData(data.invoice);
                  setShowPurchaseInvoice(true);
                }
                
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

      {/* Purchase Invoice Preview Modal */}
      {showPurchaseInvoice && purchaseInvoiceData && (
        <PurchaseInvoiceTemplate
          invoice={purchaseInvoiceData}
          onClose={() => {
            setShowPurchaseInvoice(false);
            setPurchaseInvoiceData(null);
          }}
        />
      )}
    </main>
  );
}

// Product Purchase History Component
interface ProductPurchaseHistoryProps {
  productId: string;
  onReorder: () => void;
}

function ProductPurchaseHistory({ productId, onReorder }: ProductPurchaseHistoryProps) {
  const { toast } = useToast();
  
  // Query to get invoices for this specific product
  const { data: productInvoices = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/invoices/product", productId],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-slate-500">Loading purchase history...</div>
      </div>
    );
  }

  if (productInvoices.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="space-y-2">
          <p className="text-sm text-slate-500">No purchase history found</p>
          <p className="text-xs text-slate-400">Create your first purchase order for this product</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="mt-4"
          onClick={onReorder}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create First Purchase Order
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getInvoiceItems = (invoice: any) => {
    return invoice.items?.filter((item: any) => item.productId === productId) || [];
  };

  return (
    <div className="space-y-3">
      {productInvoices.map((invoice, index) => {
        const items = getInvoiceItems(invoice);
        const totalQuantity = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        const badgeColor = index === 0 ? "blue" : index === 1 ? "green" : "purple";
        const badgeText = index === 0 ? "Latest Purchase" : index === 1 ? "Previous Order" : "Earlier Order";
        
        return (
          <div 
            key={invoice.id}
            className={`flex items-center justify-between p-4 border rounded-lg ${
              index === 0 ? 'border-blue-200 bg-blue-50/30' : 
              index === 1 ? 'border-green-200 bg-green-50/30' : 
              'border-purple-200 bg-purple-50/30'
            }`}
          >
            <div className="flex items-center space-x-4">
              <Badge 
                variant="secondary" 
                className={`text-xs ${
                  index === 0 ? 'bg-blue-100 text-blue-700' : 
                  index === 1 ? 'bg-green-100 text-green-700' : 
                  'bg-purple-100 text-purple-700'
                }`}
              >
                {badgeText}
              </Badge>
              <div>
                <p className="font-medium text-sm">{totalQuantity} units</p>
                <p className="text-xs text-slate-600">{formatDate(invoice.date)}</p>
                {invoice.customerName && (
                  <p className="text-xs text-slate-500">From: {invoice.customerName}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className="text-xs text-slate-500 font-mono block">{invoice.invoiceNumber}</span>
                <span className="text-xs text-slate-600">${invoice.total?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-3"
                  onClick={() => window.open(`/invoice/${invoice.invoiceNumber}`, '_blank')}
                >
                  <FileText className="mr-1 h-3 w-3" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-3"
                  onClick={() => {
                    const invoiceData = {
                      invoiceNumber: invoice.invoiceNumber,
                      supplier: invoice.customerName,
                      quantity: totalQuantity,
                      total: invoice.total?.toFixed(2) || '0.00',
                      date: formatDate(invoice.date)
                    };
                    navigator.clipboard.writeText(
                      `Invoice: ${invoiceData.invoiceNumber}\nSupplier: ${invoiceData.supplier}\nQuantity: ${invoiceData.quantity} units\nTotal: $${invoiceData.total}\nDate: ${invoiceData.date}`
                    );
                    toast({
                      title: "Invoice Info Copied",
                      description: "Purchase order details copied to clipboard",
                    });
                  }}
                >
                  <Share2 className="mr-1 h-3 w-3" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        );
      })}
      
      <div className="text-center py-4 border-t">
        <p className="text-sm text-slate-500 mb-2">
          {productInvoices.length} purchase order{productInvoices.length !== 1 ? 's' : ''} found
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onReorder}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Purchase Order
        </Button>
      </div>
    </div>
  );
}

// Reorder Form Component
interface ReorderFormProps {
  product: Product;
  currentStock: number;
  suppliers: Supplier[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

function ReorderForm({ product, currentStock, suppliers, onSubmit, onCancel }: ReorderFormProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState(product.supplierId || "");
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
          supplierId: selectedSupplierId,
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

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

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

      {/* Supplier Selection */}
      <div>
        <Label htmlFor="supplier">Select Supplier</Label>
        <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a supplier for this purchase order" />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{supplier.name}</span>
                  {supplier.email && (
                    <span className="text-xs text-slate-500">{supplier.email}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedSupplier && (
          <p className="text-xs text-slate-600 mt-1">
            Purchase order will be created for: <span className="font-medium">{selectedSupplier.name}</span>
          </p>
        )}
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
        <Button 
          onClick={handleSubmit} 
          disabled={!selectedSupplierId}
          className="bg-orange-600 hover:bg-orange-700"
        >
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
  const [shippingCost, setShippingCost] = useState(50);
  const [notes, setNotes] = useState("");

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
  const discountTotal = discountAmount;
  const taxableAmount = subtotal - discountTotal;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const finalTotal = taxableAmount + taxAmount + shippingCost;

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
    <div className="space-y-6">
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
        <div className="space-y-4">
          {/* Invoice Calculations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="discount">Discount Amount ($)</Label>
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
            <div className="space-y-3">
              <div>
                <Label htmlFor="shipping">Shipping Cost ($)</Label>
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
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes for this purchase order..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Subtotal ({selectedProducts.length} products):</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Discount:</span>
                <span className="font-medium text-red-600">-${discountTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tax ({taxRate}%):</span>
                <span className="font-medium">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipping:</span>
                <span className="font-medium">${shippingCost.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="font-semibold text-lg">Total:</span>
                <span className="font-semibold text-lg text-blue-600">${finalTotal.toFixed(2)}</span>
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
