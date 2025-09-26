import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Icons
import { 
  Glasses, 
  User, 
  Eye, 
  Settings, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  X,
  Ruler,
  Palette,
  Sparkles
} from 'lucide-react';

// Specs Workflow Schema
const specsWorkflowSchema = z.object({
  // Patient Information
  patientId: z.string().min(1, 'Patient is required'),
  patientName: z.string().min(1, 'Patient name is required'),
  
  // Eye Examination Data
  rightEye: z.object({
    sphere: z.string().min(1, 'Sphere is required'),
    cylinder: z.string().optional(),
    axis: z.string().optional(),
    add: z.string().optional(),
    prism: z.string().optional(),
    base: z.string().optional(),
  }),
  leftEye: z.object({
    sphere: z.string().min(1, 'Sphere is required'),
    cylinder: z.string().optional(),
    axis: z.string().optional(),
    add: z.string().optional(),
    prism: z.string().optional(),
    base: z.string().optional(),
  }),
  
  // Frame Selection
  frameType: z.enum(['full-rim', 'semi-rimless', 'rimless']).optional(),
  frameMaterial: z.enum(['metal', 'plastic', 'titanium', 'mixed']).optional(),
  frameColor: z.string().optional(),
  frameSize: z.object({
    eyeSize: z.string().optional(),
    bridge: z.string().optional(),
    templeLength: z.string().optional(),
  }).optional(),
  
  // Lens Options
  lensType: z.enum(['single-vision', 'bifocal', 'trifocal', 'progressive']),
  lensMaterial: z.enum(['standard', 'high-index', 'polycarbonate', 'trivex']),
  lensCoatings: z.array(z.enum(['anti-reflective', 'scratch-resistant', 'uv-protection', 'blue-light', 'photochromic'])).default([]),
  lensTint: z.enum(['none', 'light', 'medium', 'dark', 'gradient']).default('none'),
  
  // Measurements
  pupillaryDistance: z.string().min(1, 'PD is required'),
  segmentHeight: z.string().optional(),
  fittingHeight: z.string().optional(),
  
  // Workflow Status
  workflowStage: z.enum(['prescription-review', 'frame-selection', 'lens-selection', 'measurements', 'order-ready']).default('prescription-review'),
  priority: z.enum(['standard', 'rush', 'emergency']).default('standard'),
  
  // Additional Information
  specialInstructions: z.string().optional(),
  estimatedCompletion: z.string().optional(),
  notes: z.string().optional(),
});

type SpecsWorkflowFormData = z.infer<typeof specsWorkflowSchema>;

interface SpecsWorkflow {
  id: string;
  patientId: string;
  patientName: string;
  rightEye: {
    sphere: string;
    cylinder?: string;
    axis?: string;
    add?: string;
    prism?: string;
    base?: string;
  };
  leftEye: {
    sphere: string;
    cylinder?: string;
    axis?: string;
    add?: string;
    prism?: string;
    base?: string;
  };
  frameType?: string;
  frameMaterial?: string;
  frameColor?: string;
  frameSize?: {
    eyeSize?: string;
    bridge?: string;
    templeLength?: string;
  };
  lensType: string;
  lensMaterial: string;
  lensCoatings: string[];
  lensTint: string;
  pupillaryDistance: string;
  segmentHeight?: string;
  fittingHeight?: string;
  workflowStage: string;
  priority: string;
  specialInstructions?: string;
  estimatedCompletion?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ModernSpecsWorkflowFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingWorkflow?: SpecsWorkflow | null;
  onSuccess?: () => void;
}

export default function ModernSpecsWorkflowForm({ 
  isOpen, 
  onClose, 
  editingWorkflow, 
  onSuccess 
}: ModernSpecsWorkflowFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Steps configuration
  const steps = [
    {
      title: 'Patient',
      subtitle: 'Patient info',
      icon: User,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Prescription',
      subtitle: 'Eye measurements',
      icon: Eye,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Frame',
      subtitle: 'Frame selection',
      icon: Glasses,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Lenses',
      subtitle: 'Lens options',
      icon: Settings,
      gradient: 'from-orange-500 to-red-500'
    },
    {
      title: 'Review',
      subtitle: 'Final review',
      icon: Check,
      gradient: 'from-indigo-500 to-purple-500'
    }
  ];

  // Form configuration
  const form = useForm<SpecsWorkflowFormData>({
    resolver: zodResolver(specsWorkflowSchema),
    defaultValues: editingWorkflow ? {
      patientId: editingWorkflow.patientId,
      patientName: editingWorkflow.patientName,
      rightEye: editingWorkflow.rightEye,
      leftEye: editingWorkflow.leftEye,
      frameType: editingWorkflow.frameType as any,
      frameMaterial: editingWorkflow.frameMaterial as any,
      frameColor: editingWorkflow.frameColor || '',
      frameSize: editingWorkflow.frameSize,
      lensType: editingWorkflow.lensType as any,
      lensMaterial: editingWorkflow.lensMaterial as any,
      lensCoatings: editingWorkflow.lensCoatings as any,
      lensTint: editingWorkflow.lensTint as any,
      pupillaryDistance: editingWorkflow.pupillaryDistance,
      segmentHeight: editingWorkflow.segmentHeight || '',
      fittingHeight: editingWorkflow.fittingHeight || '',
      workflowStage: editingWorkflow.workflowStage as any,
      priority: editingWorkflow.priority as any,
      specialInstructions: editingWorkflow.specialInstructions || '',
      estimatedCompletion: editingWorkflow.estimatedCompletion || '',
      notes: editingWorkflow.notes || '',
    } : {
      patientId: '',
      patientName: '',
      rightEye: {
        sphere: '',
        cylinder: '',
        axis: '',
        add: '',
        prism: '',
        base: '',
      },
      leftEye: {
        sphere: '',
        cylinder: '',
        axis: '',
        add: '',
        prism: '',
        base: '',
      },
      frameType: undefined,
      frameMaterial: undefined,
      frameColor: '',
      frameSize: {
        eyeSize: '',
        bridge: '',
        templeLength: '',
      },
      lensType: 'single-vision' as const,
      lensMaterial: 'standard' as const,
      lensCoatings: [],
      lensTint: 'none' as const,
      pupillaryDistance: '',
      segmentHeight: '',
      fittingHeight: '',
      workflowStage: 'prescription-review' as const,
      priority: 'standard' as const,
      specialInstructions: '',
      estimatedCompletion: '',
      notes: '',
    }
  });

  // Step validation
  const validateStep = async (stepIndex: number): Promise<boolean> => {
    const values = form.getValues();
    
    switch (stepIndex) {
      case 0: // Patient
        return !!(values.patientId && values.patientName);
      case 1: // Prescription
        return !!(values.rightEye.sphere && values.leftEye.sphere && values.pupillaryDistance);
      case 2: // Frame
        return true; // Frame selection is optional
      case 3: // Lenses
        return !!(values.lensType && values.lensMaterial);
      case 4: // Review
        return true;
      default:
        return false;
    }
  };

  // Navigation functions
  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCompletedSteps(prev => [...prev.filter(s => s !== currentStep), currentStep]);
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast({
        title: 'Error',
        description: 'Please complete all required fields before proceeding.',
        variant: 'destructive',
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex <= Math.max(...completedSteps, -1) + 1) {
      setCurrentStep(stepIndex);
    }
  };

  // Mutation for workflow creation/update
  const workflowMutation = useMutation({
    mutationFn: async (data: SpecsWorkflowFormData) => {
      const endpoint = editingWorkflow 
        ? `/api/specs-workflows/${editingWorkflow.id}` 
        : '/api/specs-workflows';
      const method = editingWorkflow ? 'PUT' : 'POST';
      
      return apiRequest(method, endpoint, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specs-workflows'] });
      toast({
        title: 'Success',
        description: editingWorkflow ? 'Specs workflow updated successfully!' : 'Specs workflow created successfully!',
      });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save specs workflow',
        variant: 'destructive',
      });
    },
  });

  // Form submission
  const onSubmit = async (data: SpecsWorkflowFormData) => {
    workflowMutation.mutate(data);
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setCurrentStep(0);
      setCompletedSteps([]);
    }
  }, [isOpen, form]);

  // Step indicator component
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
          const isAccessible = index <= Math.max(...completedSteps, -1) + 1;
          
          return (
            <motion.div
              key={index}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => isAccessible && goToStep(index)}
              whileHover={isAccessible ? { scale: 1.05 } : {}}
              whileTap={isAccessible ? { scale: 0.95 } : {}}
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

  // Enhanced progress bar
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

  // Step content renderer
  const renderStep = () => {
    const step = steps[currentStep];
    const IconComponent = step.icon;
    
    return (
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Step header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${step.gradient} text-white mb-4`}>
            <IconComponent className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
          <p className="text-gray-600">{step.subtitle}</p>
        </div>

        {/* Step content */}
        <div className="space-y-6">
          {currentStep === 0 && (
            // Patient Selection Step
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="patient1">John Doe</SelectItem>
                        <SelectItem value="patient2">Jane Smith</SelectItem>
                        <SelectItem value="patient3">Bob Johnson</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter patient name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentStep === 1 && (
            // Prescription Step
            <div className="space-y-6">
              {/* Right Eye */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Right Eye (OD)
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="rightEye.sphere"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sphere (SPH) *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., -2.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rightEye.cylinder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cylinder (CYL)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., -0.50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rightEye.axis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Axis</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 90" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="rightEye.add"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Add</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., +2.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rightEye.prism"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prism</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 2.0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rightEye.base"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., IN" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Left Eye */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Left Eye (OS)
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="leftEye.sphere"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sphere (SPH) *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., -2.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="leftEye.cylinder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cylinder (CYL)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., -0.50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="leftEye.axis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Axis</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 90" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="leftEye.add"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Add</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., +2.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="leftEye.prism"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prism</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 2.0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="leftEye.base"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., IN" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Measurements */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <Ruler className="w-5 h-5" />
                  Measurements
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="pupillaryDistance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pupillary Distance (PD) *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 64" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="segmentHeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Segment Height</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 18" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fittingHeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fitting Height</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 20" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            // Frame Selection Step
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="frameType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frame Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                  name="frameMaterial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frame Material</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="metal">Metal</SelectItem>
                          <SelectItem value="plastic">Plastic</SelectItem>
                          <SelectItem value="titanium">Titanium</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="frameColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frame Color</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Black, Brown, Silver" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Frame Size</h4>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="frameSize.eyeSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Eye Size</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 52" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="frameSize.bridge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bridge</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 18" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="frameSize.templeLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temple Length</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 140" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            // Lens Options Step
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lensType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lens Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select lens type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="single-vision">Single Vision</SelectItem>
                          <SelectItem value="bifocal">Bifocal</SelectItem>
                          <SelectItem value="trifocal">Trifocal</SelectItem>
                          <SelectItem value="progressive">Progressive</SelectItem>
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
                      <FormLabel>Lens Material *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="high-index">High Index</SelectItem>
                          <SelectItem value="polycarbonate">Polycarbonate</SelectItem>
                          <SelectItem value="trivex">Trivex</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="lensCoatings"
                render={() => (
                  <FormItem>
                    <FormLabel>Lens Coatings</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'anti-reflective', label: 'Anti-Reflective' },
                        { id: 'scratch-resistant', label: 'Scratch Resistant' },
                        { id: 'uv-protection', label: 'UV Protection' },
                        { id: 'blue-light', label: 'Blue Light Filter' },
                        { id: 'photochromic', label: 'Photochromic' },
                      ].map((coating) => (
                        <FormField
                          key={coating.id}
                          control={form.control}
                          name="lensCoatings"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={coating.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(coating.id as any)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, coating.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value: string) => value !== coating.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {coating.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lensTint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lens Tint</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tint" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="gradient">Gradient</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="rush">Rush</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="estimatedCompletion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Completion</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="specialInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Instructions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any special instructions for the lab" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentStep === 4 && (
            // Review Step
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Specs Workflow Summary</h4>
                
                <div className="space-y-4">
                  <div>
                    <span className="font-medium">Patient:</span> {form.watch('patientName')}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Right Eye (OD):</span>
                      <div className="text-sm text-gray-600 mt-1">
                        SPH: {form.watch('rightEye.sphere')}<br/>
                        {form.watch('rightEye.cylinder') && `CYL: ${form.watch('rightEye.cylinder')}`}<br/>
                        {form.watch('rightEye.axis') && `AXIS: ${form.watch('rightEye.axis')}`}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Left Eye (OS):</span>
                      <div className="text-sm text-gray-600 mt-1">
                        SPH: {form.watch('leftEye.sphere')}<br/>
                        {form.watch('leftEye.cylinder') && `CYL: ${form.watch('leftEye.cylinder')}`}<br/>
                        {form.watch('leftEye.axis') && `AXIS: ${form.watch('leftEye.axis')}`}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium">PD:</span> {form.watch('pupillaryDistance')}
                  </div>
                  
                  {form.watch('frameType') && (
                    <div>
                      <span className="font-medium">Frame:</span> {form.watch('frameType')} - {form.watch('frameMaterial')} - {form.watch('frameColor')}
                    </div>
                  )}
                  
                  <div>
                    <span className="font-medium">Lenses:</span> {form.watch('lensType')} - {form.watch('lensMaterial')}
                  </div>
                  
                  {form.watch('lensCoatings').length > 0 && (
                    <div>
                      <span className="font-medium">Coatings:</span> {form.watch('lensCoatings').join(', ')}
                    </div>
                  )}
                  
                  <div>
                    <span className="font-medium">Priority:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      form.watch('priority') === 'emergency' ? 'bg-red-100 text-red-800' :
                      form.watch('priority') === 'rush' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {form.watch('priority')}
                    </span>
                  </div>
                  
                  {form.watch('estimatedCompletion') && (
                    <div>
                      <span className="font-medium">Estimated Completion:</span> {form.watch('estimatedCompletion')}
                    </div>
                  )}
                  
                  {form.watch('specialInstructions') && (
                    <div>
                      <span className="font-medium">Special Instructions:</span>
                      <div className="mt-1 text-gray-600">{form.watch('specialInstructions')}</div>
                    </div>
                  )}
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {/* Enhanced header with title and tabs in a single row */}
          <div className="flex items-center justify-between mb-6">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {editingWorkflow ? 'Edit Specs Workflow' : 'New Specs Workflow'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {renderProgressBar()}
            {renderStepIndicator()}
            
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                
                {currentStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    disabled={workflowMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {workflowMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {editingWorkflow ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {editingWorkflow ? 'Update Workflow' : 'Create Workflow'}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}