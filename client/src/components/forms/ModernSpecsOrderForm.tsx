import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  ShoppingCart,
  Package,
  CreditCard,
  Truck,
  Eye,
  Settings,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Sparkles,
  Check
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Specs Order Schema
const specsOrderSchema = z.object({
  // Customer Information
  customerId: z.string().min(1, 'Customer ID is required'),
  customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  
  // Prescription Details
  prescriptionId: z.string().optional(),
  rightEyeSphere: z.string().optional(),
  rightEyeCylinder: z.string().optional(),
  rightEyeAxis: z.string().optional(),
  leftEyeSphere: z.string().optional(),
  leftEyeCylinder: z.string().optional(),
  leftEyeAxis: z.string().optional(),
  pupillaryDistance: z.string().optional(),
  
  // Frame Selection
  frameType: z.enum(['full-rim', 'semi-rimless', 'rimless']),
  frameBrand: z.string().min(1, 'Frame brand is required'),
  frameModel: z.string().min(1, 'Frame model is required'),
  frameColor: z.string().min(1, 'Frame color is required'),
  frameSize: z.string().min(1, 'Frame size is required'),
  framePrice: z.number().min(0, 'Frame price must be positive'),
  
  // Lens Options
  lensType: z.enum(['single-vision', 'bifocal', 'progressive', 'reading']),
  lensMaterial: z.enum(['plastic', 'polycarbonate', 'high-index', 'glass']),
  lensCoating: z.array(z.string()).optional(),
  lensTint: z.string().optional(),
  lensPrice: z.number().min(0, 'Lens price must be positive'),
  
  // Additional Services
  rushOrder: z.boolean().default(false),
  homeDelivery: z.boolean().default(false),
  warranty: z.boolean().default(false),
  
  // Payment & Delivery
  paymentMethod: z.enum(['cash', 'card', 'insurance', 'installment']),
  deliveryAddress: z.string().min(10, 'Delivery address must be at least 10 characters'),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  specialInstructions: z.string().optional(),
  
  // Pricing
  subtotal: z.number().min(0, 'Subtotal must be positive'),
  tax: z.number().min(0, 'Tax must be positive'),
  discount: z.number().min(0, 'Discount must be positive'),
  total: z.number().min(0, 'Total must be positive')
});

type SpecsOrderFormData = z.infer<typeof specsOrderSchema>;

interface ModernSpecsOrderFormProps {
  onSubmit?: (data: SpecsOrderFormData) => void;
  initialData?: Partial<SpecsOrderFormData>;
  isEditing?: boolean;
}

const ModernSpecsOrderForm: React.FC<ModernSpecsOrderFormProps> = ({
  onSubmit,
  initialData,
  isEditing = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { toast } = useToast();

  const steps = [
    {
      title: 'Customer Info',
      subtitle: 'Customer details and contact information',
      icon: User,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Prescription',
      subtitle: 'Eye prescription and measurements',
      icon: Eye,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Frame Selection',
      subtitle: 'Choose frame style and specifications',
      icon: Package,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Lens Options',
      subtitle: 'Select lens type and coatings',
      icon: Settings,
      gradient: 'from-orange-500 to-red-500'
    },
    {
      title: 'Services',
      subtitle: 'Additional services and options',
      icon: ShoppingCart,
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'Payment & Delivery',
      subtitle: 'Payment method and delivery details',
      icon: CreditCard,
      gradient: 'from-teal-500 to-blue-500'
    },
    {
      title: 'Review & Confirm',
      subtitle: 'Review order details and confirm',
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-green-500'
    }
  ];

  const form = useForm<SpecsOrderFormData>({
    resolver: zodResolver(specsOrderSchema),
    defaultValues: {
      customerId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      prescriptionId: '',
      rightEyeSphere: '',
      rightEyeCylinder: '',
      rightEyeAxis: '',
      leftEyeSphere: '',
      leftEyeCylinder: '',
      leftEyeAxis: '',
      pupillaryDistance: '',
      frameType: 'full-rim',
      frameBrand: '',
      frameModel: '',
      frameColor: '',
      frameSize: '',
      framePrice: 0,
      lensType: 'single-vision',
      lensMaterial: 'plastic',
      lensCoating: [],
      lensTint: '',
      lensPrice: 0,
      rushOrder: false,
      homeDelivery: false,
      warranty: false,
      paymentMethod: 'cash',
      deliveryAddress: '',
      deliveryDate: '',
      specialInstructions: '',
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      ...initialData
    }
  });

  const validateStep = async (stepIndex: number): Promise<boolean> => {
    const stepFields: Record<number, (keyof SpecsOrderFormData)[]> = {
      0: ['customerId', 'customerName', 'customerEmail', 'customerPhone'],
      1: ['rightEyeSphere', 'leftEyeSphere', 'pupillaryDistance'],
      2: ['frameType', 'frameBrand', 'frameModel', 'frameColor', 'frameSize', 'framePrice'],
      3: ['lensType', 'lensMaterial', 'lensPrice'],
      4: [],
      5: ['paymentMethod', 'deliveryAddress', 'deliveryDate'],
      6: ['subtotal', 'tax', 'total']
    };

    const fieldsToValidate = stepFields[stepIndex] || [];
    const isValid = await form.trigger(fieldsToValidate);
    
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < steps.length - 1) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: SpecsOrderFormData) => {
      const endpoint = isEditing ? `/specs-orders/${initialData?.customerId}` : '/specs-orders';
      const method = isEditing ? 'PUT' : 'POST';
      return apiRequest(method, endpoint, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Specs order ${isEditing ? 'updated' : 'created'} successfully!`
      });
      if (onSubmit) {
        onSubmit(form.getValues());
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? 'update' : 'create'} specs order.`,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (data: SpecsOrderFormData) => {
    mutation.mutate(data);
  };

  const renderStepIndicator = () => (
    <div className="relative mb-8">
      {/* Compact Progress line */}
      <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-200 rounded-full transform -translate-y-1/2" />
      <div 
        className="absolute top-1/2 left-4 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transform -translate-y-1/2 transition-all duration-700 ease-out"
        style={{ width: `calc(${(currentStep / (steps.length - 1)) * 100}% - 1rem)` }}
      />
      
      {/* Horizontal Tab Container - Compact */}
      <div className="relative flex justify-between items-center px-4 py-2 gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.includes(index);
          const isCurrent = index === currentStep;
          const isPast = index < currentStep;
          
          return (
            <motion.div
              key={index}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => {
                if (index <= currentStep || completedSteps.includes(index)) {
                  setCurrentStep(index);
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Tab Icon - Compact Circle */}
              <motion.div
                className={`relative w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 shadow-md ${
                  isCompleted
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-green-200'
                    : isCurrent
                    ? `bg-gradient-to-br ${step.gradient} shadow-purple-200`
                    : isPast
                    ? 'bg-gradient-to-br from-gray-400 to-gray-500 shadow-gray-200'
                    : 'bg-gradient-to-br from-gray-300 to-gray-400 shadow-gray-100'
                }`}
                animate={{
                  scale: isCurrent ? 1.05 : 1,
                  rotateY: isCurrent ? [0, 5, -5, 0] : 0
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Compact Icon Size */}
                 {isCompleted ? (
                   <Check className="h-3 w-3" />
                 ) : (
                   <Icon className="h-3 w-3" />
                 )}
                
                {/* Compact Sparkle effect for current step */}
                {isCurrent && (
                  <motion.div
                    className="absolute -top-0.5 -right-0.5"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-2 w-2 text-yellow-400" />
                  </motion.div>
                )}
              </motion.div>
              
              {/* Tab Title - No descriptions */}
              <div className="mt-2 text-center">
                <span className={`text-xs font-semibold transition-colors duration-200 ${
                  isCurrent ? 'text-purple-600' : 'text-gray-600'
                }`}>
                  {step.title}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderProgressBar = () => {
    const progress = ((currentStep + 1) / steps.length) * 100;
    return (
      <div className="w-full mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    );
  };

  const renderStep = () => {
    const step = steps[currentStep];
    const Icon = step.icon;

    return (
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Step Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${step.gradient} text-white mb-4`}>
            <Icon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
          <p className="text-gray-600">{step.subtitle}</p>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Customer ID</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter customer ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Customer Name</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter customer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Email Address</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>Phone Number</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="prescriptionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prescription ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter prescription ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Right Eye</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="rightEyeSphere"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sphere</FormLabel>
                          <FormControl>
                            <Input placeholder="SPH" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="rightEyeCylinder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cylinder</FormLabel>
                          <FormControl>
                            <Input placeholder="CYL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="rightEyeAxis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Axis</FormLabel>
                          <FormControl>
                            <Input placeholder="AXIS" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Left Eye</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="leftEyeSphere"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sphere</FormLabel>
                          <FormControl>
                            <Input placeholder="SPH" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="leftEyeCylinder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cylinder</FormLabel>
                          <FormControl>
                            <Input placeholder="CYL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="leftEyeAxis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Axis</FormLabel>
                          <FormControl>
                            <Input placeholder="AXIS" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <FormField
                control={form.control}
                name="pupillaryDistance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pupillary Distance (PD)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter PD measurement" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="frameType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frame Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frame type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full-rim">Full Rim</SelectItem>
                        <SelectItem value="semi-rimless">Semi-Rimless</SelectItem>
                        <SelectItem value="rimless">Rimless</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="frameBrand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frame Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter frame brand" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="frameModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frame Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter frame model" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="frameColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frame Color</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter frame color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="frameSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frame Size</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter frame size" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="framePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4" />
                      <span>Frame Price</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter frame price" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="lensType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lens Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lens type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single-vision">Single Vision</SelectItem>
                        <SelectItem value="bifocal">Bifocal</SelectItem>
                        <SelectItem value="progressive">Progressive</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lensMaterial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lens Material</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lens material" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="plastic">Plastic</SelectItem>
                        <SelectItem value="polycarbonate">Polycarbonate</SelectItem>
                        <SelectItem value="high-index">High Index</SelectItem>
                        <SelectItem value="glass">Glass</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lensTint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lens Tint (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter lens tint" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lensPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4" />
                      <span>Lens Price</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter lens price" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="rushOrder"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Rush Order</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Expedited processing for faster delivery
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="homeDelivery"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center space-x-2">
                          <Truck className="w-4 h-4" />
                          <span>Home Delivery</span>
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Deliver to customer's address
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="warranty"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Extended Warranty</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Additional warranty coverage
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Payment Method</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="installment">Installment</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Delivery Date</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deliveryAddress"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>Delivery Address</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter delivery address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialInstructions"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Special Instructions (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter any special instructions" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="subtotal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtotal</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="discount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="total"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Total</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              className="font-semibold"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Specs Order' : 'Create New Specs Order'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEditing ? 'Update specs order information' : 'Fill in the details to create a new specs order'}
            </p>
          </div>
        </div>
        {renderStepIndicator()}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {renderProgressBar()}
          
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{mutation.isPending ? 'Processing...' : (isEditing ? 'Update Order' : 'Create Order')}</span>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ModernSpecsOrderForm;