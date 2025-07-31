import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  Edit, 
  Trash2, 
  Clock,
  Users,
  Settings,
  Search,
  Building2,
  User,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertStoreSchema, type Store, type InsertStore } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Stores() {
  const [open, setOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stores = [], isLoading } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
  });

  const form = useForm<InsertStore>({
    resolver: zodResolver(insertStoreSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      managerId: undefined,
      isActive: true,
      timezone: "America/New_York",
      openingHours: "",
      customFields: {},
    },
  });

  const createStoreMutation = useMutation({
    mutationFn: async (data: InsertStore) => {
      await apiRequest("POST", "/api/stores", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      toast({
        title: "Success",
        description: "Store created successfully.",
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create store.",
        variant: "destructive",
      });
    },
  });

  const updateStoreMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertStore> }) => {
      await apiRequest("PUT", `/api/stores/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      toast({
        title: "Success",
        description: "Store updated successfully.",
      });
      setOpen(false);
      setEditingStore(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update store.",
        variant: "destructive",
      });
    },
  });

  const deleteStoreMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/stores/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      toast({
        title: "Success",
        description: "Store deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete store.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertStore) => {
    if (editingStore) {
      updateStoreMutation.mutate({ id: editingStore.id, data });
    } else {
      createStoreMutation.mutate(data);
    }
  };

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    form.reset({
      name: store.name,
      address: store.address,
      city: store.city,
      state: store.state,
      zipCode: store.zipCode,
      phone: store.phone || "",
      email: store.email || "",
      managerId: store.managerId || undefined,
      isActive: store.isActive,
      timezone: store.timezone || "America/New_York",
      openingHours: store.openingHours || "",
      customFields: store.customFields || {},
    });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this store?")) {
      deleteStoreMutation.mutate(id);
    }
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.state.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "active") return matchesSearch && store.isActive;
    if (activeTab === "inactive") return matchesSearch && !store.isActive;
    return matchesSearch;
  });

  return (
    <>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search stores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  <TabsTrigger value="all">All Stores</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Store
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingStore ? "Edit Store" : "Add New Store"}
                  </DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Store Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Downtown Vision Center" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="true">Active</SelectItem>
                                  <SelectItem value="false">Inactive</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="123 Main Street, Suite 100"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="New York" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="NY" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input placeholder="10001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Contact Information</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
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
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="store@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Operational Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Operational Settings</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="timezone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Timezone</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="openingHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Opening Hours</FormLabel>
                              <FormControl>
                                <Input placeholder="Mon-Fri: 9AM-6PM, Sat: 9AM-4PM" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setOpen(false);
                          setEditingStore(null);
                          form.reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createStoreMutation.isPending || updateStoreMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {createStoreMutation.isPending || updateStoreMutation.isPending 
                          ? "Saving..." 
                          : editingStore ? "Update Store" : "Create Store"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Stores</p>
                    <p className="text-2xl font-bold text-slate-900">{stores.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Building2 className="text-blue-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active Stores</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {stores.filter(s => s.isActive).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="text-emerald-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Inactive Stores</p>
                    <p className="text-2xl font-bold text-red-600">
                      {stores.filter(s => !s.isActive).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <XCircle className="text-red-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Locations</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {new Set(stores.map(s => s.state)).size}
                    </p>
                    <p className="text-xs text-slate-500">States</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <MapPin className="text-purple-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stores List */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredStores.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="p-12 text-center">
                <Building2 className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No stores found</h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm ? "Try adjusting your search criteria." : "Get started by adding your first store location."}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Store
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map((store) => (
                <Card key={store.id} className="border-slate-200 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-slate-900 mb-2">
                          {store.name}
                        </CardTitle>
                        <Badge 
                          className={store.isActive 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-red-100 text-red-800'
                          }
                        >
                          {store.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(store)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(store.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div className="text-sm text-slate-600">
                          <p>{store.address}</p>
                          <p>{store.city}, {store.state} {store.zipCode}</p>
                        </div>
                      </div>
                      
                      {store.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{store.phone}</span>
                        </div>
                      )}
                      
                      {store.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{store.email}</span>
                        </div>
                      )}
                      
                      {store.openingHours && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{store.openingHours}</span>
                        </div>
                      )}
                      
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Created: {format(new Date(store.createdAt), 'MMM dd, yyyy')}</span>
                          {store.timezone && (
                            <span className="bg-slate-100 px-2 py-1 rounded">
                              {store.timezone.split('/')[1]?.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}