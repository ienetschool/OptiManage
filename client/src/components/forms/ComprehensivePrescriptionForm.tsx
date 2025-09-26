import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
  Sparkles,
  Eye,
  Glasses,
  Utensils,
  Scissors,
  Stethoscope,
  Plus,
  Minus,
  Search,
  UserCheck,
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle,
  Save,
  Send
} from 'lucide-react';

// Enhanced Prescription Schema for all prescription types
const comprehensivePrescriptionSchema = z.object({
  // Basic Information
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  patientId: z.string().min(1, 'Patient is required'),
  patientName: z.string().min(1, 'Patient name is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  doctorName: z.string().min(1, 'Doctor name is required'),
  
  // Prescription Details
  prescriptionType: z.enum(['comprehensive', 'medicines-only', 'eye-treatment', 'optical', 'surgery', 'diet']).default('comprehensive'),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  prescriptionDate: z.string().min(1, 'Prescription date is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  
  // Medications
  medications: z.array(z.object({
    name: z.string().min(1, 'Medication name is required'),
    dosage: z.string().min(1, 'Dosage is required'),
    frequency: z.string().min(1, 'Frequency is required'),
    duration: z.string().min(1, 'Duration is required'),
    instructions: z.string().optional(),
    category: z.enum(['antibiotic', 'pain-relief', 'eye-drops', 'vitamin', 'other']).default('other'),
  })).optional().default([]),
  
  // Eye Treatments
  eyeTreatments: z.array(z.object({
    treatmentType: z.enum(['general', 'specialized', 'therapy', 'exercise']),
    description: z.string().min(1, 'Treatment description is required'),
    duration: z.string().min(1, 'Duration is required'),
    frequency: z.string().min(1, 'Frequency is required'),
    instructions: z.string().optional(),
    eye: z.enum(['left', 'right', 'both']).default('both'),
  })).optional().default([]),
  
  // Specs & Lens Prescriptions
  opticalPrescription: z.object({
    rightEye: z.object({
      sphere: z.string().optional(),
      cylinder: z.string().optional(),
      axis: z.string().optional(),
      add: z.string().optional(),
    }).optional(),
    leftEye: z.object({
      sphere: z.string().optional(),
      cylinder: z.string().optional(),
      axis: z.string().optional(),
      add: z.string().optional(),
    }).optional(),
    lensType: z.enum(['single-vision', 'bifocal', 'progressive', 'reading']).optional(),
    frameRecommendation: z.string().optional(),
    specialInstructions: z.string().optional(),
  }).optional(),
  
  // Diet Recommendations
  dietRecommendations: z.array(z.object({
    category: z.enum(['nutrition', 'supplements', 'restrictions', 'lifestyle']),
    recommendation: z.string().min(1, 'Recommendation is required'),
    duration: z.string().optional(),
    notes: z.string().optional(),
  })).optional().default([]),
  
  // Surgery Recommendations
  surgeryRecommendations: z.array(z.object({
    surgeryType: z.string().min(1, 'Surgery type is required'),
    urgency: z.enum(['elective', 'recommended', 'urgent', 'emergency']),
    description: z.string().min(1, 'Description is required'),
    preOpInstructions: z.string().optional(),
    postOpCare: z.string().optional(),
    referralDoctor: z.string().optional(),
  })).optional().default([]),
  
  // Other Medical Recommendations
  otherRecommendations: z.array(z.object({
    type: z.enum(['therapy', 'lifestyle', 'follow-up', 'referral', 'test', 'other']),
    description: z.string().min(1, 'Description is required'),
    instructions: z.string().optional(),
    timeline: z.string().optional(),
  })).optional().default([]),
  
  // Additional Fields
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  refillsAllowed: z.number().min(0).max(12).default(0),
  digitalSignature: z.boolean().default(true),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).default('active'),
});

type ComprehensivePrescriptionFormData = z.infer<typeof comprehensivePrescriptionSchema>;

interface ComprehensivePrescriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId?: string;
  patientId?: string;
  editingPrescription?: any;
  onSuccess?: () => void;
}

export default function ComprehensivePrescriptionForm({ 
  isOpen, 
  onClose, 
  appointmentId,
  patientId,
  editingPrescription, 
  onSuccess 
}: ComprehensivePrescriptionFormProps) {
  const [currentTab, setCurrentTab] = useState('basic');
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch patients and appointments for dropdowns
  const { data: patients } = useQuery({
    queryKey: ['/api/patients'],
    queryFn: () => apiRequest('/api/patients', 'GET'),
  });

  const { data: appointments } = useQuery({
    queryKey: ['/api/appointments'],
    queryFn: () => apiRequest('/api/appointments', 'GET'),
  });

  // Form setup
  const form = useForm<ComprehensivePrescriptionFormData>({
    resolver: zodResolver(comprehensivePrescriptionSchema),
    defaultValues: {
      appointmentId: appointmentId || editingPrescription?.appointmentId || '',
      patientId: patientId || editingPrescription?.patientId || '',
      patientName: editingPrescription?.patientName || '',
      doctorId: (user as any)?.id || editingPrescription?.doctorId || '',
      doctorName: (user as any)?.name || editingPrescription?.doctorName || '',
      prescriptionType: editingPrescription?.prescriptionType || 'comprehensive',
      diagnosis: editingPrescription?.diagnosis || '',
      prescriptionDate: editingPrescription?.prescriptionDate || new Date().toISOString().split('T')[0],
      priority: editingPrescription?.priority || 'medium',
      medications: editingPrescription?.medications || [],
      eyeTreatments: editingPrescription?.eyeTreatments || [],
      opticalPrescription: editingPrescription?.opticalPrescription || {},
      dietRecommendations: editingPrescription?.dietRecommendations || [],
      surgeryRecommendations: editingPrescription?.surgeryRecommendations || [],
      otherRecommendations: editingPrescription?.otherRecommendations || [],
      notes: editingPrescription?.notes || '',
      followUpDate: editingPrescription?.followUpDate || '',
      refillsAllowed: editingPrescription?.refillsAllowed || 0,
      digitalSignature: editingPrescription?.digitalSignature ?? true,
      status: editingPrescription?.status || 'active',
    },
  });

  // Mutation for creating/updating prescription
  const prescriptionMutation = useMutation({
    mutationFn: async (data: ComprehensivePrescriptionFormData) => {
      const endpoint = editingPrescription 
        ? `/api/prescriptions/${editingPrescription.id}`
        : '/api/prescriptions';
      const method = editingPrescription ? 'PUT' : 'POST';
      
      return await apiRequest(endpoint, method, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions'] });
      toast({
        title: editingPrescription ? 'Prescription Updated' : 'Prescription Created',
        description: editingPrescription 
          ? 'Prescription has been successfully updated.'
          : 'New comprehensive prescription has been successfully created.',
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

  const onSubmit = (data: ComprehensivePrescriptionFormData) => {
    prescriptionMutation.mutate(data);
  };

  // Helper functions for dynamic arrays
  const addMedication = () => {
    const medications = form.getValues('medications') || [];
    medications.push({
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      category: 'other' as const,
    });
    form.setValue('medications', medications);
  };

  const removeMedication = (index: number) => {
    const medications = form.getValues('medications') || [];
    medications.splice(index, 1);
    form.setValue('medications', medications);
  };

  const addEyeTreatment = () => {
    const treatments = form.getValues('eyeTreatments') || [];
    treatments.push({
      treatmentType: 'general' as const,
      description: '',
      duration: '',
      frequency: '',
      instructions: '',
      eye: 'both' as const,
    });
    form.setValue('eyeTreatments', treatments);
  };

  const removeEyeTreatment = (index: number) => {
    const treatments = form.getValues('eyeTreatments') || [];
    treatments.splice(index, 1);
    form.setValue('eyeTreatments', treatments);
  };

  const addDietRecommendation = () => {
    const recommendations = form.getValues('dietRecommendations') || [];
    recommendations.push({
      category: 'nutrition' as const,
      recommendation: '',
      duration: '',
      notes: '',
    });
    form.setValue('dietRecommendations', recommendations);
  };

  const removeDietRecommendation = (index: number) => {
    const recommendations = form.getValues('dietRecommendations') || [];
    recommendations.splice(index, 1);
    form.setValue('dietRecommendations', recommendations);
  };

  const addSurgeryRecommendation = () => {
    const recommendations = form.getValues('surgeryRecommendations') || [];
    recommendations.push({
      surgeryType: '',
      urgency: 'elective' as const,
      description: '',
      preOpInstructions: '',
      postOpCare: '',
      referralDoctor: '',
    });
    form.setValue('surgeryRecommendations', recommendations);
  };

  const removeSurgeryRecommendation = (index: number) => {
    const recommendations = form.getValues('surgeryRecommendations') || [];
    recommendations.splice(index, 1);
    form.setValue('surgeryRecommendations', recommendations);
  };

  const addOtherRecommendation = () => {
    const recommendations = form.getValues('otherRecommendations') || [];
    recommendations.push({
      type: 'other' as const,
      description: '',
      instructions: '',
      timeline: '',
    });
    form.setValue('otherRecommendations', recommendations);
  };

  const removeOtherRecommendation = (index: number) => {
    const recommendations = form.getValues('otherRecommendations') || [];
    recommendations.splice(index, 1);
    form.setValue('otherRecommendations', recommendations);
  };

  // Tab configuration
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User, color: 'blue' },
    { id: 'medications', label: 'Medications', icon: Pill, color: 'green' },
    { id: 'eye-treatments', label: 'Eye Treatments', icon: Eye, color: 'purple' },
    { id: 'optical', label: 'Optical', icon: Glasses, color: 'indigo' },
    { id: 'diet', label: 'Diet', icon: Utensils, color: 'orange' },
    { id: 'surgery', label: 'Surgery', icon: Scissors, color: 'red' },
    { id: 'other', label: 'Other', icon: Stethoscope, color: 'gray' },
    { id: 'summary', label: 'Summary', icon: FileText, color: 'emerald' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            {editingPrescription ? 'Edit Comprehensive Prescription' : 'Create Comprehensive Prescription'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isCompleted = completedTabs.has(tab.id);
                  return (
                    <TabsTrigger 
                      key={tab.id} 
                      value={tab.id} 
                      className="flex items-center gap-1 text-xs"
                    >
                      <Icon className="h-3 w-3" />
                      {tab.label}
                      {isCompleted && <Check className="h-3 w-3 text-green-500" />}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Basic Prescription Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="appointmentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Appointment</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select appointment" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.isArray(appointments) && appointments.map((appointment: any) => (
                                  <SelectItem key={appointment.id} value={appointment.id}>
                                    {appointment.patientName} - {appointment.appointmentDate}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="patientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Patient</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select patient" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.isArray(patients) && patients.map((patient: any) => (
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="prescriptionType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prescription Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="comprehensive">Comprehensive</SelectItem>
                                <SelectItem value="medicines-only">Medicines Only</SelectItem>
                                <SelectItem value="eye-treatment">Eye Treatment</SelectItem>
                                <SelectItem value="optical">Optical</SelectItem>
                                <SelectItem value="surgery">Surgery</SelectItem>
                                <SelectItem value="diet">Diet</SelectItem>
                              </SelectContent>
                            </Select>
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
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="diagnosis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnosis</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter detailed diagnosis..." 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
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
                        name="followUpDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Follow-up Date (Optional)</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Medications Tab */}
              <TabsContent value="medications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Pill className="h-5 w-5" />
                        Medications
                      </div>
                      <Button type="button" onClick={addMedication} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Medication
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {form.watch('medications')?.map((_, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium">Medication {index + 1}</h4>
                          {(form.watch('medications')?.length || 0) > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMedication(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`medications.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Medication Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Amoxicillin" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`medications.${index}.category`}
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
                                    <SelectItem value="antibiotic">Antibiotic</SelectItem>
                                    <SelectItem value="pain-relief">Pain Relief</SelectItem>
                                    <SelectItem value="eye-drops">Eye Drops</SelectItem>
                                    <SelectItem value="vitamin">Vitamin</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
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
                                  <Input placeholder="e.g., 500mg" {...field} />
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
                            <FormItem className="mt-4">
                              <FormLabel>Special Instructions</FormLabel>
                              <FormControl>
                                <Textarea placeholder="e.g., Take with food" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </Card>
                    ))}
                    
                    {(!form.watch('medications') || form.watch('medications')?.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No medications added yet</p>
                        <Button type="button" onClick={addMedication} className="mt-2">
                          Add First Medication
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Eye Treatments Tab */}
              <TabsContent value="eye-treatments" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Eye Treatments
                      </div>
                      <Button type="button" onClick={addEyeTreatment} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Treatment
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {form.watch('eyeTreatments')?.map((_, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium">Eye Treatment {index + 1}</h4>
                          {(form.watch('eyeTreatments')?.length || 0) > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEyeTreatment(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`eyeTreatments.${index}.treatmentType`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Treatment Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="general">General</SelectItem>
                                    <SelectItem value="specialized">Specialized</SelectItem>
                                    <SelectItem value="therapy">Therapy</SelectItem>
                                    <SelectItem value="exercise">Exercise</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`eyeTreatments.${index}.eye`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Eye</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select eye" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="left">Left Eye</SelectItem>
                                    <SelectItem value="right">Right Eye</SelectItem>
                                    <SelectItem value="both">Both Eyes</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`eyeTreatments.${index}.duration`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duration</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 2 weeks" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`eyeTreatments.${index}.frequency`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Frequency</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 3 times daily" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`eyeTreatments.${index}.description`}
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Describe the treatment..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`eyeTreatments.${index}.instructions`}
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel>Instructions</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Special instructions..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </Card>
                    ))}
                    
                    {(!form.watch('eyeTreatments') || form.watch('eyeTreatments')?.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No eye treatments added yet</p>
                        <Button type="button" onClick={addEyeTreatment} className="mt-2">
                          Add First Treatment
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Optical Tab */}
              <TabsContent value="optical" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Glasses className="h-5 w-5" />
                      Optical Prescription
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Right Eye */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        Right Eye (OD)
                      </h4>
                      <div className="grid grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name="opticalPrescription.rightEye.sphere"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sphere (SPH)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., -2.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="opticalPrescription.rightEye.cylinder"
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
                          name="opticalPrescription.rightEye.axis"
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
                        
                        <FormField
                          control={form.control}
                          name="opticalPrescription.rightEye.add"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Add</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., +1.50" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Left Eye */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        Left Eye (OS)
                      </h4>
                      <div className="grid grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name="opticalPrescription.leftEye.sphere"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sphere (SPH)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., -2.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="opticalPrescription.leftEye.cylinder"
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
                          name="opticalPrescription.leftEye.axis"
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
                        
                        <FormField
                          control={form.control}
                          name="opticalPrescription.leftEye.add"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Add</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., +1.50" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Additional Optical Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="opticalPrescription.lensType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lens Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
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
                        name="opticalPrescription.frameRecommendation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frame Recommendation</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Metal frame, lightweight" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="opticalPrescription.specialInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Instructions</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Any special instructions for the optical prescription..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Diet Tab */}
              <TabsContent value="diet" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-5 w-5" />
                        Diet Recommendations
                      </div>
                      <Button type="button" onClick={addDietRecommendation} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Recommendation
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {form.watch('dietRecommendations')?.map((_, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium">Diet Recommendation {index + 1}</h4>
                          {(form.watch('dietRecommendations')?.length || 0) > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDietRecommendation(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`dietRecommendations.${index}.category`}
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
                                    <SelectItem value="nutrition">Nutrition</SelectItem>
                                    <SelectItem value="supplements">Supplements</SelectItem>
                                    <SelectItem value="restrictions">Restrictions</SelectItem>
                                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`dietRecommendations.${index}.duration`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duration</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 3 months" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`dietRecommendations.${index}.recommendation`}
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel>Recommendation</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Describe the diet recommendation..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`dietRecommendations.${index}.notes`}
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel>Additional Notes</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Any additional notes..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </Card>
                    ))}
                    
                    {(!form.watch('dietRecommendations') || form.watch('dietRecommendations')?.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No diet recommendations added yet</p>
                        <Button type="button" onClick={addDietRecommendation} className="mt-2">
                          Add First Recommendation
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Surgery Tab */}
              <TabsContent value="surgery" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Scissors className="h-5 w-5" />
                        Surgery Recommendations
                      </div>
                      <Button type="button" onClick={addSurgeryRecommendation} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Surgery
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {form.watch('surgeryRecommendations')?.map((_, index) => (
                      <Card key={index} className="p-4 border-red-200">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-red-700">Surgery Recommendation {index + 1}</h4>
                          {(form.watch('surgeryRecommendations')?.length || 0) > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSurgeryRecommendation(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`surgeryRecommendations.${index}.surgeryType`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Surgery Type</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Cataract Surgery" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`surgeryRecommendations.${index}.urgency`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Urgency</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select urgency" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="elective">Elective</SelectItem>
                                    <SelectItem value="recommended">Recommended</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                    <SelectItem value="emergency">Emergency</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`surgeryRecommendations.${index}.referralDoctor`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Referral Doctor</FormLabel>
                                <FormControl>
                                  <Input placeholder="Dr. Smith, Ophthalmologist" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`surgeryRecommendations.${index}.description`}
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Describe the surgery and reasons..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <FormField
                            control={form.control}
                            name={`surgeryRecommendations.${index}.preOpInstructions`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pre-Op Instructions</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Instructions before surgery..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`surgeryRecommendations.${index}.postOpCare`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Post-Op Care</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Care instructions after surgery..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </Card>
                    ))}
                    
                    {(!form.watch('surgeryRecommendations') || form.watch('surgeryRecommendations')?.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <Scissors className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No surgery recommendations added yet</p>
                        <Button type="button" onClick={addSurgeryRecommendation} className="mt-2">
                          Add First Surgery Recommendation
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Other Recommendations Tab */}
              <TabsContent value="other" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5" />
                        Other Medical Recommendations
                      </div>
                      <Button type="button" onClick={addOtherRecommendation} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Recommendation
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {form.watch('otherRecommendations')?.map((_, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium">Other Recommendation {index + 1}</h4>
                          {(form.watch('otherRecommendations')?.length || 0) > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOtherRecommendation(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`otherRecommendations.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="therapy">Therapy</SelectItem>
                                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                                    <SelectItem value="follow-up">Follow-up</SelectItem>
                                    <SelectItem value="referral">Referral</SelectItem>
                                    <SelectItem value="test">Test</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`otherRecommendations.${index}.timeline`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Timeline</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Within 2 weeks" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`otherRecommendations.${index}.description`}
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Describe the recommendation..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`otherRecommendations.${index}.instructions`}
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel>Instructions</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Specific instructions..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </Card>
                    ))}
                    
                    {(!form.watch('otherRecommendations') || form.watch('otherRecommendations')?.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No other recommendations added yet</p>
                        <Button type="button" onClick={addOtherRecommendation} className="mt-2">
                          Add First Recommendation
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Prescription Summary & Final Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any additional notes or instructions..." 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="digitalSignature"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Apply Digital Signature
                            </FormLabel>
                            <FormDescription>
                              This prescription will be digitally signed and authenticated.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {/* Prescription Summary */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-4">Prescription Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Patient:</span>
                          <span>{form.watch('patientName') || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="capitalize">{form.watch('prescriptionType')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Priority:</span>
                          <Badge variant={form.watch('priority') === 'urgent' ? 'destructive' : 'secondary'}>
                            {form.watch('priority')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Medications:</span>
                          <span>{form.watch('medications')?.length || 0} items</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.setValue('status', 'draft')}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save as Draft
                </Button>
                <Button
                  type="submit"
                  disabled={prescriptionMutation.isPending}
                >
                  {prescriptionMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {editingPrescription ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1" />
                      {editingPrescription ? 'Update Prescription' : 'Create Prescription'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}