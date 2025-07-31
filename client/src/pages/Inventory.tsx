import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, AlertTriangle, Search, Edit, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertProductSchema, insertCategorySchema, insertSupplierSchema, type Product, type Category, type Supplier, type InsertProduct, type InsertCategory, type InsertSupplier } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Inventory() {
  const [openProduct, setOpenProduct] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [openSupplier, setOpenSupplier] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const productForm = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      categoryId: undefined,
      supplierId: undefined,
      price: "",
      costPrice: "",
      reorderLevel: 10,
      isActive: true,
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

  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      await apiRequest("POST", "/api/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product created successfully.",
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProduct> }) => {
      await apiRequest("PUT", `/api/products/${id}`, data);
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product.",
        variant: "destructive",
      });
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create category.",
        variant: "destructive",
      });
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create supplier.",
        variant: "destructive",
      });
    },
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      description: product.description || "",
      sku: product.sku,
      categoryId: product.categoryId || undefined,
      supplierId: product.supplierId || undefined,
      price: product.price,
      costPrice: product.costPrice || "",
      reorderLevel: product.reorderLevel,
      isActive: product.isActive,
    });
    setOpenProduct(true);
  };

  const onSubmitProduct = (data: InsertProduct) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleProductOpenChange = (open: boolean) => {
    setOpenProduct(open);
    if (!open) {
      setEditingProduct(null);
      productForm.reset();
    }
  };

  const lowStockProducts = products.filter(product => {
    // In a real app, we'd check actual inventory levels
    // For demo, we'll simulate some being low stock
    return Math.random() < 0.3; // 30% chance of being low stock
  });

  if (productsLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="stock">Stock Levels</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Product Catalog ({products.length})</h3>
                <p className="text-sm text-slate-600">Manage your product inventory and details</p>
              </div>
              
              <Dialog open={openProduct} onOpenChange={handleProductOpenChange}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <Form {...productForm}>
                    <form onSubmit={productForm.handleSubmit(onSubmitProduct)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={productForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Ray-Ban Aviator" {...field} />
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
                                <Input placeholder="RB-AV-001" {...field} />
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
                              <Input placeholder="Classic aviator sunglasses" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={productForm.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
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
                              <Select onValueChange={field.onChange} value={field.value}>
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
                      
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={productForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Selling Price</FormLabel>
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
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
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
                            : "Create Product"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="border-slate-200 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{product.name}</CardTitle>
                        <p className="text-sm text-slate-600">SKU: {product.sku}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">Price:</span>
                      <span className="text-lg font-bold text-emerald-600">${product.price}</span>
                    </div>
                    {product.costPrice && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600">Cost:</span>
                        <span className="text-sm text-slate-900">${product.costPrice}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">Reorder at:</span>
                      <span className="text-sm text-slate-900">{product.reorderLevel} units</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {searchTerm ? "No products found" : "No products yet"}
                </h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm ? `No products match "${searchTerm}"` : "Get started by adding your first product."}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setOpenProduct(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Product
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Categories ({categories.length})</h3>
                <p className="text-sm text-slate-600">Organize your products into categories</p>
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
                              <Input placeholder="Sunglasses" {...field} />
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
                              <Input placeholder="Stylish sunglasses for all occasions" {...field} />
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
                <Card key={category.id} className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    {category.description && (
                      <p className="text-sm text-slate-600">{category.description}</p>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>

            {categories.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No categories yet</h3>
                <p className="text-slate-600 mb-6">Create categories to organize your products.</p>
                <Button
                  onClick={() => setOpenCategory(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Category
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Suppliers ({suppliers.length})</h3>
                <p className="text-sm text-slate-600">Manage your product suppliers and contacts</p>
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
                              <Input placeholder="John Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={supplierForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="contact@supplier.com" type="email" {...field} />
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
                              <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={supplierForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Business St, City, State" {...field} />
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
                <Card key={supplier.id} className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    {supplier.contactPerson && (
                      <p className="text-sm text-slate-600">Contact: {supplier.contactPerson}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {supplier.email && (
                      <p className="text-sm text-slate-600">Email: {supplier.email}</p>
                    )}
                    {supplier.phone && (
                      <p className="text-sm text-slate-600">Phone: {supplier.phone}</p>
                    )}
                    {supplier.address && (
                      <p className="text-sm text-slate-600">Address: {supplier.address}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {suppliers.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No suppliers yet</h3>
                <p className="text-slate-600 mb-6">Add suppliers to manage your product sourcing.</p>
                <Button
                  onClick={() => setOpenSupplier(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Supplier
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Stock Levels Tab */}
          <TabsContent value="stock" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Stock Levels & Alerts</h3>
              <p className="text-sm text-slate-600">Monitor inventory levels across all stores</p>
            </div>

            {lowStockProducts.length > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-amber-800">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Low Stock Alerts ({lowStockProducts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lowStockProducts.slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-white border border-amber-200 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{product.name}</p>
                          <p className="text-sm text-slate-600">SKU: {product.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-amber-700">Low Stock</p>
                          <Button size="sm" variant="outline" className="mt-1">
                            Reorder
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center py-12">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Store Inventory</h3>
              <p className="text-slate-600 mb-6">Select a store to view detailed inventory levels.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
