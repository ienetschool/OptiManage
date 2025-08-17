import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Eye, 
  ClipboardList, 
  Scissors, 
  Truck, 
  CheckCircle, 
  Bell, 
  User, 
  Calendar,
  Package,
  Star,
  AlertCircle,
  Timer,
  MapPin
} from 'lucide-react';

// Lens Prescription Form Schema
const lensPrescriptionSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  prescriptionDate: z.string().min(1, 'Prescription date is required'),
  rightEyeSph: z.string().optional(),
  rightEyeCyl: z.string().optional(),
  rightEyeAxis: z.string().optional(),
  rightEyeAdd: z.string().optional(),
  leftEyeSph: z.string().optional(),
  leftEyeCyl: z.string().optional(),
  leftEyeAxis: z.string().optional(),
  leftEyeAdd: z.string().optional(),
  pupillaryDistance: z.string().optional(),
  lensType: z.string().min(1, 'Lens type is required'),
  lensMaterial: z.string().min(1, 'Lens material is required'),
  frameRecommendation: z.string().optional(),
  coatings: z.string().optional(),
  tints: z.string().optional(),
  specialInstructions: z.string().optional(),
});

// Specs Order Form Schema
const specsOrderSchema = z.object({
  lensPrescriptionId: z.string().min(1, 'Prescription is required'),
  patientId: z.string().min(1, 'Patient is required'),
  storeId: z.string().min(1, 'Store is required'),
  frameId: z.string().optional(),
  frameName: z.string().optional(),
  framePrice: z.string().optional(),
  lensPrice: z.string().min(1, 'Lens price is required'),
  coatingPrice: z.string().optional(),
  additionalCharges: z.string().optional(),
  subtotal: z.string().min(1, 'Subtotal is required'),
  tax: z.string().optional(),
  discount: z.string().optional(),
  totalAmount: z.string().min(1, 'Total amount is required'),
  priority: z.string().default('normal'),
  expectedDelivery: z.string().optional(),
  orderNotes: z.string().optional(),
});

type LensPrescriptionForm = z.infer<typeof lensPrescriptionSchema>;
type SpecsOrderForm = z.infer<typeof specsOrderSchema>;

export default function SpecsWorkflow() {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch workflow data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['/api/specs-workflow/dashboard'],
  });

  const { data: lensPrescriptions, isLoading: prescriptionsLoading } = useQuery({
    queryKey: ['/api/lens-prescriptions'],
  });

  const { data: specsOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/specs-orders'],
  });

  const { data: patients } = useQuery({
    queryKey: ['/api/patients'],
  });

  const { data: doctors } = useQuery({
    queryKey: ['/api/doctors'],
  });

  const { data: stores } = useQuery({
    queryKey: ['/api/stores'],
  });

  // Form for lens prescription
  const prescriptionForm = useForm<LensPrescriptionForm>({
    resolver: zodResolver(lensPrescriptionSchema),
    defaultValues: {
      prescriptionDate: new Date().toISOString().split('T')[0],
      lensType: 'Single Vision',
      lensMaterial: 'CR-39',
    },
  });

  // Form for specs order
  const orderForm = useForm<SpecsOrderForm>({
    resolver: zodResolver(specsOrderSchema),
    defaultValues: {
      priority: 'normal',
      tax: '0.00',
      discount: '0.00',
      coatingPrice: '0.00',
      additionalCharges: '0.00',
    },
  });

  // Mutations
  const createPrescriptionMutation = useMutation({
    mutationFn: (data: LensPrescriptionForm) => 
      apiRequest('/api/lens-prescriptions', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Lens prescription created successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/lens-prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/specs-workflow/dashboard'] });
      prescriptionForm.reset();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to create prescription', variant: 'destructive' });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: SpecsOrderForm) => 
      apiRequest('/api/specs-orders', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Specs order created successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/specs-orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/specs-workflow/dashboard'] });
      orderForm.reset();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to create order', variant: 'destructive' });
    },
  });

  const onPrescriptionSubmit = (data: LensPrescriptionForm) => {
    createPrescriptionMutation.mutate(data);
  };

  const onOrderSubmit = (data: SpecsOrderForm) => {
    // Calculate totals
    const framePrice = parseFloat(data.framePrice || '0');
    const lensPrice = parseFloat(data.lensPrice);
    const coatingPrice = parseFloat(data.coatingPrice || '0');
    const additionalCharges = parseFloat(data.additionalCharges || '0');
    const tax = parseFloat(data.tax || '0');
    const discount = parseFloat(data.discount || '0');
    
    const subtotal = framePrice + lensPrice + coatingPrice + additionalCharges;
    const totalAmount = subtotal + tax - discount;
    
    const orderData = {
      ...data,
      subtotal: subtotal.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    };
    
    createOrderMutation.mutate(orderData);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      prescribed: { color: 'bg-blue-100 text-blue-800', label: 'Prescribed' },
      order_created: { color: 'bg-yellow-100 text-yellow-800', label: 'Order Created' },
      assigned: { color: 'bg-purple-100 text-purple-800', label: 'Assigned' },
      in_progress: { color: 'bg-orange-100 text-orange-800', label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      delivered: { color: 'bg-gray-100 text-gray-800', label: 'Delivered' },
      draft: { color: 'bg-gray-100 text-gray-600', label: 'Draft' },
      confirmed: { color: 'bg-green-100 text-green-700', label: 'Confirmed' },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.draft;
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
      normal: { color: 'bg-blue-100 text-blue-800', label: 'Normal' },
      low: { color: 'bg-gray-100 text-gray-600', label: 'Low' },
    };
    
    const priorityInfo = priorityMap[priority as keyof typeof priorityMap] || priorityMap.normal;
    return <Badge className={priorityInfo.color}>{priorityInfo.label}</Badge>;
  };

  if (dashboardLoading || prescriptionsLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="specs-workflow-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Specs Workflow Management</h1>
          <p className="text-gray-600">7-Step Lens Prescription & Order Management System</p>
        </div>
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">
            {dashboardData?.statistics?.tasksInProgress || 0} tasks in progress
          </span>
        </div>
      </div>

      {/* Workflow Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card data-testid="total-prescriptions-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.statistics?.totalPrescriptions || 0}</div>
          </CardContent>
        </Card>

        <Card data-testid="total-orders-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Specs Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.statistics?.totalOrders || 0}</div>
          </CardContent>
        </Card>

        <Card data-testid="tasks-in-progress-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks in Progress</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {dashboardData?.statistics?.tasksInProgress || 0}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="ready-for-delivery-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Delivery</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {dashboardData?.statistics?.readyForDelivery || 0}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="completed-deliveries-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboardData?.statistics?.completedDeliveries || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="prescriptions" data-testid="tab-prescriptions">Step 1: Prescriptions</TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders">Step 2: Orders</TabsTrigger>
          <TabsTrigger value="cutting" data-testid="tab-cutting">Step 3-4: Cutting</TabsTrigger>
          <TabsTrigger value="delivery" data-testid="tab-delivery">Step 5-6: Delivery</TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">Step 7: Completed</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest specs orders in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.recentOrders?.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">
                          {order.patientName} {order.patientLastName}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">No recent orders</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Progress</CardTitle>
                <CardDescription>Current status of active workflows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span>Prescriptions Created</span>
                    </div>
                    <span className="font-medium">{dashboardData?.statistics?.totalPrescriptions || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ClipboardList className="w-4 h-4 text-yellow-600" />
                      <span>Orders Created</span>
                    </div>
                    <span className="font-medium">{dashboardData?.statistics?.totalOrders || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Scissors className="w-4 h-4 text-orange-600" />
                      <span>In Production</span>
                    </div>
                    <span className="font-medium">{dashboardData?.statistics?.tasksInProgress || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span>Ready for Delivery</span>
                    </div>
                    <span className="font-medium">{dashboardData?.statistics?.readyForDelivery || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Completed</span>
                    </div>
                    <span className="font-medium">{dashboardData?.statistics?.completedDeliveries || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Step 1: Lens Prescriptions */}
        <TabsContent value="prescriptions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Lens Prescription</CardTitle>
                <CardDescription>Step 1: Doctor prescribes lenses with detailed specifications</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...prescriptionForm}>
                  <form onSubmit={prescriptionForm.handleSubmit(onPrescriptionSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={prescriptionForm.control}
                        name="patientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Patient</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-patient">
                                  <SelectValue placeholder="Select patient" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {patients?.map((patient: any) => (
                                  <SelectItem key={patient.id} value={patient.id}>
                                    {patient.firstName} {patient.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={prescriptionForm.control}
                        name="doctorId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Doctor</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-doctor">
                                  <SelectValue placeholder="Select doctor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {doctors?.map((doctor: any) => (
                                  <SelectItem key={doctor.id} value={doctor.id}>
                                    Dr. {doctor.firstName} {doctor.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={prescriptionForm.control}
                      name="prescriptionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prescription Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="prescription-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Eye Prescription Details */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Right Eye</h4>
                      <div className="grid grid-cols-4 gap-2">
                        <FormField
                          control={prescriptionForm.control}
                          name="rightEyeSph"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SPH</FormLabel>
                              <FormControl>
                                <Input placeholder="-2.50" {...field} data-testid="right-eye-sph" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={prescriptionForm.control}
                          name="rightEyeCyl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CYL</FormLabel>
                              <FormControl>
                                <Input placeholder="-1.00" {...field} data-testid="right-eye-cyl" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={prescriptionForm.control}
                          name="rightEyeAxis"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Axis</FormLabel>
                              <FormControl>
                                <Input placeholder="90" {...field} data-testid="right-eye-axis" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={prescriptionForm.control}
                          name="rightEyeAdd"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ADD</FormLabel>
                              <FormControl>
                                <Input placeholder="+2.00" {...field} data-testid="right-eye-add" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <h4 className="font-medium text-gray-900">Left Eye</h4>
                      <div className="grid grid-cols-4 gap-2">
                        <FormField
                          control={prescriptionForm.control}
                          name="leftEyeSph"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SPH</FormLabel>
                              <FormControl>
                                <Input placeholder="-2.50" {...field} data-testid="left-eye-sph" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={prescriptionForm.control}
                          name="leftEyeCyl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CYL</FormLabel>
                              <FormControl>
                                <Input placeholder="-1.00" {...field} data-testid="left-eye-cyl" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={prescriptionForm.control}
                          name="leftEyeAxis"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Axis</FormLabel>
                              <FormControl>
                                <Input placeholder="90" {...field} data-testid="left-eye-axis" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={prescriptionForm.control}
                          name="leftEyeAdd"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ADD</FormLabel>
                              <FormControl>
                                <Input placeholder="+2.00" {...field} data-testid="left-eye-add" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={prescriptionForm.control}
                      name="pupillaryDistance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pupillary Distance (PD)</FormLabel>
                          <FormControl>
                            <Input placeholder="62.0" {...field} data-testid="pupillary-distance" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={prescriptionForm.control}
                        name="lensType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lens Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-lens-type">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Single Vision">Single Vision</SelectItem>
                                <SelectItem value="Bifocal">Bifocal</SelectItem>
                                <SelectItem value="Progressive">Progressive</SelectItem>
                                <SelectItem value="Trifocal">Trifocal</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={prescriptionForm.control}
                        name="lensMaterial"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lens Material</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-lens-material">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="CR-39">CR-39</SelectItem>
                                <SelectItem value="Polycarbonate">Polycarbonate</SelectItem>
                                <SelectItem value="High Index 1.67">High Index 1.67</SelectItem>
                                <SelectItem value="High Index 1.74">High Index 1.74</SelectItem>
                                <SelectItem value="Trivex">Trivex</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={prescriptionForm.control}
                      name="frameRecommendation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frame Recommendation</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Recommend suitable frame types based on prescription..."
                              {...field} 
                              data-testid="frame-recommendation"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={prescriptionForm.control}
                        name="coatings"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Coatings</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Anti-glare, UV protection..."
                                {...field} 
                                data-testid="coatings"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={prescriptionForm.control}
                        name="tints"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tints</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Gray, brown, photochromic..."
                                {...field} 
                                data-testid="tints"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={prescriptionForm.control}
                      name="specialInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Instructions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any special requirements or notes..."
                              {...field} 
                              data-testid="special-instructions"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-2">
                      <Button 
                        type="submit" 
                        disabled={createPrescriptionMutation.isPending}
                        data-testid="button-save-prescription"
                      >
                        {createPrescriptionMutation.isPending ? 'Saving...' : 'Save Prescription'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          // Create specs order from this prescription
                          setActiveTab('orders');
                        }}
                        data-testid="button-create-specs-order"
                      >
                        Create Specs Order
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Prescriptions</CardTitle>
                <CardDescription>Latest lens prescriptions created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {lensPrescriptions?.map((prescription: any) => (
                    <div key={prescription.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">
                          {prescription.patientName} {prescription.patientLastName}
                        </p>
                        {getStatusBadge(prescription.status)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Doctor: Dr. {prescription.doctorName} {prescription.doctorLastName}</p>
                        <p>Type: {prescription.lensType} - {prescription.lensMaterial}</p>
                        <p>Date: {new Date(prescription.prescriptionDate).toLocaleDateString()}</p>
                        {prescription.pupillaryDistance && (
                          <p>PD: {prescription.pupillaryDistance}</p>
                        )}
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <Button size="sm" variant="outline" data-testid={`view-prescription-${prescription.id}`}>
                          View Details
                        </Button>
                        {prescription.status === 'prescribed' && (
                          <Button size="sm" data-testid={`create-order-${prescription.id}`}>
                            Create Order
                          </Button>
                        )}
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">No prescriptions found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Step 2: Specs Orders */}
        <TabsContent value="orders" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Specs Order</CardTitle>
                <CardDescription>Step 2: Sales invoice-like order with inventory check</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...orderForm}>
                  <form onSubmit={orderForm.handleSubmit(onOrderSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={orderForm.control}
                        name="lensPrescriptionId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prescription</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-prescription">
                                  <SelectValue placeholder="Select prescription" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {lensPrescriptions?.filter((p: any) => p.status === 'prescribed').map((prescription: any) => (
                                  <SelectItem key={prescription.id} value={prescription.id}>
                                    {prescription.patientName} {prescription.patientLastName} - {prescription.lensType}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={orderForm.control}
                        name="storeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Store</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-store">
                                  <SelectValue placeholder="Select store" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {stores?.map((store: any) => (
                                  <SelectItem key={store.id} value={store.id}>
                                    {store.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={orderForm.control}
                        name="frameName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frame Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Ray-Ban Classic..." {...field} data-testid="frame-name" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={orderForm.control}
                        name="framePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frame Price</FormLabel>
                            <FormControl>
                              <Input placeholder="150.00" {...field} data-testid="frame-price" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={orderForm.control}
                        name="lensPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lens Price</FormLabel>
                            <FormControl>
                              <Input placeholder="200.00" {...field} data-testid="lens-price" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={orderForm.control}
                        name="coatingPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Coating Price</FormLabel>
                            <FormControl>
                              <Input placeholder="50.00" {...field} data-testid="coating-price" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={orderForm.control}
                        name="tax"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax</FormLabel>
                            <FormControl>
                              <Input placeholder="20.00" {...field} data-testid="tax" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={orderForm.control}
                        name="discount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount</FormLabel>
                            <FormControl>
                              <Input placeholder="10.00" {...field} data-testid="discount" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={orderForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-priority">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={orderForm.control}
                      name="expectedDelivery"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Delivery</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="expected-delivery" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={orderForm.control}
                      name="orderNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Special requirements or notes..."
                              {...field} 
                              data-testid="order-notes"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-2">
                      <Button 
                        type="submit" 
                        disabled={createOrderMutation.isPending}
                        data-testid="button-create-order"
                      >
                        {createOrderMutation.isPending ? 'Creating...' : 'Create Order'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        data-testid="button-check-inventory"
                      >
                        Check Inventory
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest specs orders with status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {specsOrders?.map((order: any) => (
                    <div key={order.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{order.orderNumber}</p>
                        <div className="flex space-x-2">
                          {getStatusBadge(order.status)}
                          {getPriorityBadge(order.priority)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Patient: {order.patientName} {order.patientLastName}</p>
                        <p>Frame: {order.frameName}</p>
                        <p>Total: ${order.totalAmount}</p>
                        <p>Store: {order.storeName}</p>
                        <p>Expected: {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'TBD'}</p>
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <Button size="sm" variant="outline" data-testid={`view-order-${order.id}`}>
                          View Details
                        </Button>
                        {order.status === 'draft' && (
                          <Button size="sm" data-testid={`confirm-order-${order.id}`}>
                            Confirm Order
                          </Button>
                        )}
                        {order.status === 'confirmed' && (
                          <Button size="sm" data-testid={`assign-task-${order.id}`}>
                            Assign Task
                          </Button>
                        )}
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">No orders found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Step 3-4: Lens Cutting & Fitting Tasks */}
        <TabsContent value="cutting" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Assign Cutting Tasks</CardTitle>
                <CardDescription>Step 3: Assign confirmed orders to lens fitters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Available Orders for Assignment</h4>
                    {specsOrders?.filter((order: any) => order.status === 'confirmed').map((order: any) => (
                      <div key={order.id} className="p-3 border rounded mb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">{order.patientName} {order.patientLastName}</p>
                            <p className="text-sm text-gray-500">Frame: {order.frameName}</p>
                          </div>
                          <Button size="sm" data-testid={`assign-task-${order.id}`}>
                            Assign to Fitter
                          </Button>
                        </div>
                      </div>
                    )) || <p className="text-gray-500">No orders ready for assignment</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Cutting Tasks</CardTitle>
                <CardDescription>Step 4: Monitor lens cutting and fitting progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Task #LCT001</h4>
                      <Badge className="bg-orange-100 text-orange-800">In Progress</Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Order: SPO250817001</p>
                      <p>Fitter: John Doe</p>
                      <p>Progress: 45%</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-orange-600 h-2 rounded-full w-[45%]"></div>
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <Button size="sm" variant="outline">Update Progress</Button>
                      <Button size="sm" variant="outline">Add Photos</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Step 5-6: Delivery Management */}
        <TabsContent value="delivery" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ready for Delivery</CardTitle>
                <CardDescription>Step 5: Orders completed and ready for delivery</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">SPO250817001</h4>
                      <Badge className="bg-blue-100 text-blue-800">Ready</Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Patient: TestUpdate UpdatedLastName</p>
                      <p>Frame: Ray-Ban Progressive Classic</p>
                      <p>Store: OptiStore Pro Main Branch</p>
                      <p>Expected: Jan 24, 2025</p>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <Button size="sm">Schedule Delivery</Button>
                      <Button size="sm" variant="outline">Quality Check</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Tracking</CardTitle>
                <CardDescription>Step 6: Track deliveries and customer communication</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Delivery Methods</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-2 border rounded">
                      <input type="radio" name="delivery" value="pickup" className="w-4 h-4" />
                      <div>
                        <p className="font-medium">Store Pickup</p>
                        <p className="text-sm text-gray-600">Customer collects from store</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 border rounded">
                      <input type="radio" name="delivery" value="home" className="w-4 h-4" />
                      <div>
                        <p className="font-medium">Home Delivery</p>
                        <p className="text-sm text-gray-600">Delivered to customer address</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 border rounded">
                      <input type="radio" name="delivery" value="courier" className="w-4 h-4" />
                      <div>
                        <p className="font-medium">Courier Service</p>
                        <p className="text-sm text-gray-600">Professional courier delivery</p>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full">Arrange Delivery</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Step 7: Completed Orders */}
        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivered Orders</CardTitle>
                <CardDescription>Step 7: Orders successfully delivered to customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                    <p>No delivered orders yet</p>
                    <p className="text-sm">Completed orders will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Feedback</CardTitle>
                <CardDescription>Delivery confirmation and customer satisfaction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Feedback Collection</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">Customer Rating System</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Written Feedback</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Delivery Confirmation</span>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Quality Assurance</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="w-4 h-4" />
                        <span className="text-sm">Lens quality verified</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="w-4 h-4" />
                        <span className="text-sm">Frame fit confirmed</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="w-4 h-4" />
                        <span className="text-sm">Customer satisfaction confirmed</span>
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}