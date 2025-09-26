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

// Icons
import { 
  Pill, 
  User, 
  FileText, 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  X,
  Sparkles
} from 'lucide-react';

// Schema
const prescriptionSchema = z.object({
  // Patient Information
  patientId: z.string().min(1, 'Patient is required'),
  patientName: z.string().min(1, 'Patient name is required'),

  // Medications
  medications: z.array(z.object({
    name: z.string().min(1, 'Medication name is required'),
    dosage: z.string().min(1, 'Dosage is required'),
    frequency: z.string().min(1, 'Frequency is required'),
    duration: z.string().min(1, 'Duration is required'),
    instructions: z.string().optional(),
  })).min(1, 'At least one medication is required'),

  // Doctor Information
  doctorId: z.string().min(1, 'Doctor is required'),
  doctorName: z.string().min(1, 'Doctor name is required'),

  // Prescription Details
  prescriptionDate: z.string().min(1, 'Prescription date is required'),
  notes: z.string().optional(),
  refillsAllowed: z.number().min(0).max(12),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  doctorId: string;
  doctorName: string;
  prescriptionDate: string;
  notes?: string;
  refillsAllowed: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

interface ModernPrescriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingPrescription?: Prescription | null;
  onSuccess?: () => void;
}

export default function ModernPrescriptionForm({ 
  isOpen, 
  onClose, 
  editingPrescription, 
  onSuccess 
}: ModernPrescriptionFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Steps configuration
  const steps = [
    {
      title: "Patient",
      subtitle: "Select Patient",
      icon: User,
      gradient: "from-blue-500 to-cyan-500",
      fields: ['patientId', 'patientName']
    },
    {
      title: "Medications",
      subtitle: "Add Medications",
      icon: Pill,
      gradient: "from-green-500 to-emerald-500",
      fields: ['medications']
    },
    {
      title: "Doctor",
      subtitle: "Doctor Information",
      icon: FileText,
      gradient: "from-purple-500 to-pink-500",
      fields: ['doctorId', 'doctorName']
    },
    {
      title: "Details",
      subtitle: "Prescription Details",
      icon: Calendar,
      gradient: "from-orange-500 to-red-500",
      fields: ['prescriptionDate', 'notes', 'refillsAllowed', 'priority']
    }
  ];

  // Form setup
  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId: editingPrescription?.patientId || '',
      patientName: editingPrescription?.patientName || '',
      medications: editingPrescription?.medications || [{
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }],
      doctorId: editingPrescription?.doctorId || '',
      doctorName: editingPrescription?.doctorName || '',
      prescriptionDate: editingPrescription?.prescriptionDate || new Date().toISOString().split('T')[0],
      notes: editingPrescription?.notes || '',
      refillsAllowed: editingPrescription?.refillsAllowed || 0,
      priority: editingPrescription?.priority || 'medium',
    },
  });

  // Step validation
  const validateStep = async (stepIndex: number): Promise<boolean> => {
    const stepFields = steps[stepIndex].fields;
    
    if (stepFields.length === 0) {
      setCompletedSteps(prev => {
        const newSet = new Set(prev);
        newSet.add(stepIndex);
        return newSet;
      });
      return true;
    }
    
    const isValid = await form.trigger(stepFields as any);
    
    if (isValid) {
      setCompletedSteps(prev => {
        const newSet = new Set(prev);
        newSet.add(stepIndex);
        return newSet;
      });
    }
    
    return isValid;
  };

  // Navigation
  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Mutation
  const prescriptionMutation = useMutation({
    mutationFn: async (data: PrescriptionFormData) => {
      const endpoint = editingPrescription 
        ? `/api/prescriptions/${editingPrescription.id}`
        : '/api/prescriptions';
      const method = editingPrescription ? 'PATCH' : 'POST';
      
      return await apiRequest(method, endpoint, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast({
        title: editingPrescription ? 'Prescription Updated' : 'Prescription Created',
        description: editingPrescription 
          ? 'Prescription has been successfully updated.'
          : 'New prescription has been successfully created.',
      });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process prescription. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: PrescriptionFormData) => {
    prescriptionMutation.mutate(data);
  };

  // Step indicator component
  const renderStepIndicator = () => {
    return (
      <div className="relative">
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
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep;
            const isPast = index < currentStep;
            
            return (
              <motion.div
                key={index}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => setCurrentStep(index)}
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
  };

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

  // Step content rendering
  const renderStepContent = () => {
    const currentStepData = steps[currentStep];
    
    return (
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">{currentStepData.title}</h3>
          <p className="text-gray-600 mt-1">{currentStepData.subtitle}</p>
        </div>

        {currentStep === 0 && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="patientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter patient name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter patient ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700 mb-4">Medications</div>
            {form.watch('medications').map((_, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Medication {index + 1}</span>
                  {form.watch('medications').length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const medications = form.getValues('medications');
                        medications.splice(index, 1);
                        form.setValue('medications', medications);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name={`medications.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Medication name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`medications.${index}.dosage`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosage</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 10mg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`medications.${index}.frequency`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Twice daily" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`medications.${index}.duration`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 7 days" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name={`medications.${index}.instructions`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Special instructions" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const medications = form.getValues('medications');
                medications.push({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });
                form.setValue('medications', medications);
              }}
            >
              Add Another Medication
            </Button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="doctorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doctor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter doctor name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doctor ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter doctor ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="prescriptionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prescription Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="refillsAllowed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refills Allowed</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      max="12" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPrescription ? 'Edit Prescription' : 'Create New Prescription'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step Indicator */}
            {renderStepIndicator()}
            
            {/* Progress Bar */}
            {renderProgressBar()}
            
            {/* Step Content */}
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={previousStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex gap-2">
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
                    disabled={prescriptionMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {prescriptionMutation.isPending ? 'Processing...' : (editingPrescription ? 'Update' : 'Create')} Prescription
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
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