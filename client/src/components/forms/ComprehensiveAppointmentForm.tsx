import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  Plus,
  UserPlus,
  Heart,
  Activity,
  DollarSign,
  FileText,
  CalendarDays,
  Users,
  CreditCard,
  UserCheck,
  Eye,
  Glasses
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Enhanced Appointment Schema with comprehensive validation
const appointmentSchema = z.object({
  // Step 1: Patient & Service
  patientId: z.string().min(1, "Please select a patient"),
  serviceType: z.enum([
    "consultation", 
    "eye-exam", 
    "contact-fitting", 
    "follow-up", 
    "prescription-update", 
    "emergency", 
    "routine-checkup",
    "glasses-fitting",
    "surgery",
    "other"
  ], { required_error: "Please select service type" }),
  
  // Step 2: Schedule
  appointmentDate: z.string().min(1, "Appointment date is required"),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  duration: z.number().min(15, "Duration must be at least 15 minutes").max(240, "Duration cannot exceed 4 hours").default(30),
  doctorId: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  
  // Step 3: Payment
  appointmentFee: z.number().min(0, "Fee must be non-negative").default(0),
  paymentStatus: z.enum(["pending", "paid", "partial", "cancelled"], { required_error: "Please select payment status" }).default("pending"),
  paymentMethod: z.enum(["cash", "card", "insurance", "online"]).optional(),
  
  // Step 4: Details
  chiefComplaint: z.string().optional(),
  notes: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().optional(),
  status: z.enum(["scheduled", "confirmed", "in-progress", "completed", "cancelled", "no-show"], { required_error: "Please select status" }).default("scheduled"),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  patientCode?: string;
  dateOfBirth?: string;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization?: string;
  consultationFee?: number;
}

interface ComprehensiveAppointmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editingAppointment?: any;
}

const ComprehensiveAppointmentForm: React.FC<ComprehensiveAppointmentFormProps> = ({ 
  onSuccess, 
  onCancel, 
  editingAppointment 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Steps configuration
  const steps = [
    {
      id: 1,
      title: "Patient & Service",
      description: "Select patient and service type",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      fields: ["patientId", "serviceType"]
    },
    {
      id: 2,
      title: "Schedule",
      description: "Set date, time and assign doctor",
      icon: CalendarDays,
      color: "text-green-600",
      bgColor: "bg-gradient-to-br from-green-50 to-green-100",
      fields: ["appointmentDate", "appointmentTime", "duration", "doctorId", "priority"]
    },
    {
      id: 3,
      title: "Payment",
      description: "Configure fees and payment details",
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      fields: ["appointmentFee", "paymentStatus", "paymentMethod"]
    },
    {
      id: 4,
      title: "Details",
      description: "Additional notes and follow-up",
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
      fields: ["chiefComplaint", "notes", "followUpRequired", "followUpDate", "status"]
    }
  ];

  // Fetch patients and doctors
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
  });

  // Form configuration
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: editingAppointment ? {
      patientId: editingAppointment.patientId,
      appointmentDate: editingAppointment.appointmentDate,
      appointmentTime: editingAppointment.appointmentTime,
      serviceType: editingAppointment.appointmentType || editingAppointment.serviceType || "consultation",
      duration: editingAppointment.duration || 30,
      doctorId: editingAppointment.doctorId || "",
      priority: editingAppointment.priority || "normal",
      appointmentFee: editingAppointment.appointmentFee || editingAppointment.fee || 0,
      paymentStatus: editingAppointment.paymentStatus || "pending",
      paymentMethod: editingAppointment.paymentMethod || "cash",
      chiefComplaint: editingAppointment.chiefComplaint || "",
      notes: editingAppointment.notes || "",
      followUpRequired: false,
      followUpDate: editingAppointment.followUpDate || "",
      status: editingAppointment.status || "scheduled",
    } : {
      patientId: "",
      appointmentDate: "",
      appointmentTime: "",
      serviceType: "consultation",
      duration: 30,
      doctorId: "",
      priority: "normal",
      appointmentFee: 0,
      paymentStatus: "pending",
      paymentMethod: "cash",
      chiefComplaint: "",
      notes: "",
      followUpRequired: false,
      followUpDate: "",
      status: "scheduled",
    },
  });

  // Step validation function
  const validateStep = async (stepIndex: number): Promise<boolean> => {
    const stepFields = steps[stepIndex].fields;
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

  // Navigate to next step
  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Navigate to previous step
  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Navigate to specific step
  const goToStep = async (stepIndex: number) => {
    if (stepIndex < currentStep || completedSteps.has(stepIndex)) {
      setCurrentStep(stepIndex);
    } else if (stepIndex === currentStep + 1) {
      await nextStep();
    }
  };

  // Create/Update appointment mutation
  const appointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      const endpoint = editingAppointment 
        ? `/api/appointments/${editingAppointment.id}`
        : "/api/appointments";
      const method = editingAppointment ? "PATCH" : "POST";
      
      // Add patient name for display
      const selectedPatient = patients.find(p => p.id === data.patientId);
      const selectedDoctor = doctors.find(d => d.id === data.doctorId);
      
      const appointmentData = {
        ...data,
        appointmentType: data.serviceType, // Map to the expected field
        patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : "Unknown Patient",
        patientCode: selectedPatient?.patientCode || "",
        doctorName: selectedDoctor ? `${selectedDoctor.firstName} ${selectedDoctor.lastName}` : "",
        fee: data.appointmentFee, // Map for compatibility
        appointmentNumber: editingAppointment?.appointmentNumber || `APT-${Date.now()}`,
      };
      
      return apiRequest(method, endpoint, appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "✅ Success!",
        description: `Appointment has been ${editingAppointment ? 'updated' : 'scheduled'} successfully.`,
        duration: 3000,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || `Failed to ${editingAppointment ? 'update' : 'schedule'} appointment. Please try again.`,
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  // Submit form
  const onSubmit = async (data: AppointmentFormData) => {
    // Validate all steps before submission
    const allStepsValid = await Promise.all(
      steps.map((_, index) => validateStep(index))
    );
    
    if (allStepsValid.every(Boolean)) {
      appointmentMutation.mutate(data);
    } else {
      toast({
        title: "❌ Validation Error",
        description: "Please complete all required fields before submitting.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Service type options
  const serviceTypes = [
    { value: "consultation", label: "Initial Consultation", icon: User, description: "First-time patient consultation" },
    { value: "eye-exam", label: "Comprehensive Eye Exam", icon: Eye, description: "Complete eye health examination" },
    { value: "contact-fitting", label: "Contact Lens Fitting", icon: Heart, description: "Contact lens consultation and fitting" },
    { value: "follow-up", label: "Follow-up Visit", icon: CheckCircle, description: "Post-treatment follow-up" },
    { value: "prescription-update", label: "Prescription Update", icon: Glasses, description: "Update existing prescription" },
    { value: "emergency", label: "Emergency Visit", icon: AlertTriangle, description: "Urgent eye care" },
    { value: "routine-checkup", label: "Routine Checkup", icon: Stethoscope, description: "Regular eye health checkup" },
    { value: "glasses-fitting", label: "Glasses Fitting", icon: Glasses, description: "Frame selection and fitting" },
    { value: "surgery", label: "Surgery", icon: Activity, description: "Eye surgery procedure" },
    { value: "other", label: "Other", icon: Plus, description: "Other services" }
  ];

  const priorities = [
    { value: "low", label: "Low Priority", color: "bg-gray-100 text-gray-800" },
    { value: "normal", label: "Normal Priority", color: "bg-blue-100 text-blue-800" },
    { value: "high", label: "High Priority", color: "bg-yellow-100 text-yellow-800" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" }
  ];

  const paymentMethods = [
    { value: "cash", label: "Cash Payment", icon: DollarSign },
    { value: "card", label: "Credit/Debit Card", icon: CreditCard },
    { value: "insurance", label: "Insurance", icon: UserCheck },
    { value: "online", label: "Online Payment", icon: Activity }
  ];

  // Progress calculation
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8" data-testid="comprehensive-appointment-form">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {editingAppointment ? 'Update Appointment' : 'Schedule New Appointment'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-lg">
            {editingAppointment ? 'Update appointment details' : 'Complete the form to schedule a new appointment'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-sm text-gray-500">
          Step {currentStep + 1} of {steps.length} • {Math.round(progress)}% Complete
        </p>
      </motion.div>

      {/* Step Navigation */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4 overflow-x-auto pb-4">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = currentStep === index;
            const isAccessible = index <= currentStep || isCompleted;

            return (
              <React.Fragment key={step.id}>
                <motion.div
                  whileHover={isAccessible ? { scale: 1.05 } : {}}
                  whileTap={isAccessible ? { scale: 0.95 } : {}}
                  onClick={() => isAccessible && goToStep(index)}
                  className={`flex flex-col items-center space-y-2 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                    isCurrent
                      ? 'bg-white shadow-lg ring-2 ring-blue-500'
                      : isCompleted
                      ? 'bg-green-50 hover:bg-green-100'
                      : isAccessible
                      ? 'bg-gray-50 hover:bg-gray-100'
                      : 'bg-gray-50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    isCurrent
                      ? 'bg-blue-500 text-white'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      React.createElement(step.icon, { className: "h-5 w-5" })
                    )}
                  </div>
                  <span className={`text-sm font-medium text-center ${
                    isCurrent
                      ? 'text-blue-600'
                      : isCompleted
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }`}>
                    {step.title}
                  </span>
                </motion.div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-8 transition-all duration-300 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`${steps[currentStep].bgColor} border-0 shadow-lg`}>
                <CardContent className="p-8 space-y-6">
                  {/* Step Header */}
                  <div className="flex items-center space-x-3 mb-6">
                    <div className={`p-3 rounded-full ${steps[currentStep].color} bg-white shadow-md`}>
                      {React.createElement(steps[currentStep].icon, { className: "h-6 w-6" })}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {steps[currentStep].title}
                      </h3>
                      <p className="text-gray-600">{steps[currentStep].description}</p>
                    </div>
                  </div>

                  {/* Step Content */}
                  {currentStep === 0 && (
                    // Step 1: Patient & Service
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="patientId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-1 font-medium text-blue-600">
                                <span>Patient</span>
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger className="h-12 border-2" data-testid="select-patient">
                                    <SelectValue placeholder="Select a patient" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {patients.map((patient) => (
                                      <SelectItem key={patient.id} value={patient.id}>
                                        <div className="flex flex-col">
                                          <span className="font-medium">
                                            {patient.firstName} {patient.lastName}
                                          </span>
                                          {patient.patientCode && (
                                            <span className="text-sm text-gray-500">
                                              {patient.patientCode}
                                            </span>
                                          )}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="serviceType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-1 font-medium text-blue-600">
                                <span>Service Type</span>
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger className="h-12 border-2" data-testid="select-service">
                                    <SelectValue placeholder="Select service type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {serviceTypes.map((service) => (
                                      <SelectItem key={service.value} value={service.value}>
                                        <div className="flex items-center space-x-2">
                                          {React.createElement(service.icon, { className: "h-4 w-4" })}
                                          <div className="flex flex-col">
                                            <span className="font-medium">{service.label}</span>
                                            <span className="text-xs text-gray-500">{service.description}</span>
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 1 && (
                    // Step 2: Schedule
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="appointmentDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-1 font-medium text-green-600">
                                <span>Date</span>
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="date"
                                  min={new Date().toISOString().split('T')[0]}
                                  className="h-12 border-2"
                                  data-testid="input-date"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="appointmentTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-1 font-medium text-green-600">
                                <span>Time</span>
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="time"
                                  className="h-12 border-2"
                                  data-testid="input-time"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium text-green-600">Duration (minutes)</FormLabel>
                              <FormControl>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                  <SelectTrigger className="h-12 border-2" data-testid="select-duration">
                                    <SelectValue placeholder="Duration" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="45">45 minutes</SelectItem>
                                    <SelectItem value="60">1 hour</SelectItem>
                                    <SelectItem value="90">1.5 hours</SelectItem>
                                    <SelectItem value="120">2 hours</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="doctorId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium text-green-600">Assign Doctor</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger className="h-12 border-2" data-testid="select-doctor">
                                    <SelectValue placeholder="Select doctor (optional)" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {doctors.map((doctor) => (
                                      <SelectItem key={doctor.id} value={doctor.id}>
                                        <div className="flex flex-col">
                                          <span className="font-medium">
                                            Dr. {doctor.firstName} {doctor.lastName}
                                          </span>
                                          {doctor.specialization && (
                                            <span className="text-sm text-gray-500">
                                              {doctor.specialization}
                                            </span>
                                          )}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormDescription>
                                Leave empty if not assigned yet
                              </FormDescription>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium text-green-600">Priority Level</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger className="h-12 border-2" data-testid="select-priority">
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {priorities.map((priority) => (
                                      <SelectItem key={priority.value} value={priority.value}>
                                        <div className="flex items-center space-x-2">
                                          <Badge className={priority.color}>
                                            {priority.label}
                                          </Badge>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    // Step 3: Payment
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="appointmentFee"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium text-purple-600">Appointment Fee</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                  <Input 
                                    {...field} 
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="h-12 border-2 pl-10"
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    data-testid="input-fee"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="paymentStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium text-purple-600">Payment Status</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger className="h-12 border-2" data-testid="select-payment-status">
                                    <SelectValue placeholder="Payment status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending Payment</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="partial">Partial Payment</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium text-purple-600">Payment Method</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger className="h-12 border-2" data-testid="select-payment-method">
                                    <SelectValue placeholder="Payment method" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {paymentMethods.map((method) => (
                                      <SelectItem key={method.value} value={method.value}>
                                        <div className="flex items-center space-x-2">
                                          {React.createElement(method.icon, { className: "h-4 w-4" })}
                                          <span>{method.label}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    // Step 4: Details
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="chiefComplaint"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium text-orange-600">Chief Complaint</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Patient's primary concern or reason for visit..."
                                className="min-h-[80px] border-2"
                                data-testid="textarea-complaint"
                              />
                            </FormControl>
                            <FormDescription>
                              Main reason for the appointment
                            </FormDescription>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium text-orange-600">Additional Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Additional notes for staff or doctor reference..."
                                className="min-h-[80px] border-2"
                                data-testid="textarea-notes"
                              />
                            </FormControl>
                            <FormDescription>
                              Optional notes for staff or doctor reference
                            </FormDescription>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="followUpRequired"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-4 h-4 text-orange-600 border-2 rounded focus:ring-orange-500"
                                  data-testid="checkbox-followup"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-medium text-orange-600">
                                  Follow-up Required
                                </FormLabel>
                                <FormDescription>
                                  Schedule a follow-up appointment
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        {form.watch("followUpRequired") && (
                          <FormField
                            control={form.control}
                            name="followUpDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-medium text-orange-600">Follow-up Date</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    className="h-12 border-2"
                                    data-testid="input-followup-date"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium text-orange-600">Appointment Status</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="h-12 border-2" data-testid="select-status">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="scheduled">Scheduled</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                  <SelectItem value="no-show">No Show</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="px-6"
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={previousStep}
                  className="px-6"
                  data-testid="button-previous"
                >
                  Previous
                </Button>
              )}
            </div>

            <div className="flex space-x-3">
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                  data-testid="button-next"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={appointmentMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 px-6"
                  data-testid="button-submit"
                >
                  {appointmentMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span>{editingAppointment ? 'Updating...' : 'Scheduling...'}</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{editingAppointment ? 'Update Appointment' : 'Schedule Appointment'}</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ComprehensiveAppointmentForm;