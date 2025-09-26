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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  CreditCard
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

// Enhanced Appointment Schema - matching the old UI structure
const appointmentSchema = z.object({
  // Patient Information
  patientId: z.string().min(1, "Patient selection is required"),
  patientName: z.string().min(1, "Patient name is required"),
  patientEmail: z.string().email("Valid email is required"),
  patientPhone: z.string().min(10, "Valid phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  address: z.string().min(1, "Address is required"),
  emergencyContact: z.string().min(1, "Emergency contact is required"),
  patientType: z.enum(["new", "existing", "returning"]).default("existing"),
  
  // Store Information
  storeId: z.string().min(1, "Please select a store"),
  
  // Schedule Information
  appointmentDate: z.string().min(1, "Appointment date is required"),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  duration: z.number().min(15, "Minimum duration is 15 minutes"),
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
  
  // Provider Information
  doctorId: z.string().optional(),
  providerName: z.string().min(1, "Provider name is required"),
  department: z.string().min(1, "Department is required"),
  providerSpecialization: z.string().optional(),
  
  // Clinical Information
  reasonForVisit: z.string().min(1, "Reason for visit is required"),
  symptoms: z.string().optional(),
  medicalHistory: z.string().optional(),
  currentMedications: z.string().optional(),
  allergies: z.string().optional(),
  vitalSigns: z.object({
    bloodPressure: z.string().optional(),
    heartRate: z.string().optional(),
    temperature: z.string().optional(),
    weight: z.string().optional()
  }).optional(),
  
  // Payment Information
  appointmentFee: z.number().min(0, "Fee must be non-negative").default(0),
  paymentMethod: z.enum(["cash", "card", "insurance", "online", "mixed"]),
  baseAmount: z.number().min(0, "Base amount must be positive"),
  calculatedAmount: z.number().min(0, "Calculated amount must be positive"),
  finalAmount: z.number().min(0, "Final amount must be positive"),
  
  // Insurance Information
  hasInsurance: z.boolean().default(false),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  insuranceCoverage: z.number().min(0).max(100).optional(),
  insuranceAmount: z.number().min(0).optional(),
  insuranceDeductible: z.number().min(0).optional(),
  insuranceCoPayment: z.number().min(0).optional(),
  
  // Coupon and Discount Information
  hasCoupon: z.boolean().default(false),
  couponCode: z.string().optional(),
  couponType: z.enum(["percentage", "fixed", "service"]).optional(),
  couponValue: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  appliedCoupons: z.array(z.object({
    code: z.string(),
    type: z.string(),
    value: z.number(),
    appliedAmount: z.number()
  })).optional(),
  
  // Payment Verification
  paymentStatus: z.enum(["pending", "paid", "partial", "cancelled"], { required_error: "Please select payment status" }).default("pending"),
  paidAmount: z.number().min(0).default(0),
  remainingAmount: z.number().min(0).default(0),
  paymentVerified: z.boolean().default(false),
  
  // Additional Information
  notes: z.string().optional(),
  specialRequests: z.string().optional(),
  preferredLanguage: z.string().optional(),
  appointmentNotes: z.string().optional(),
  referralSource: z.string().optional(),
  status: z.enum(["scheduled", "confirmed", "in-progress", "completed", "cancelled", "no-show"], { required_error: "Please select status" }).default("scheduled"),
  consentToTreatment: z.boolean().refine(val => val === true, {
    message: "Consent to treatment is required"
  }),
  privacyPolicyAccepted: z.boolean().refine(val => val === true, {
    message: "Privacy policy acceptance is required"
  })
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  patientCode?: string;
  storeId?: string;
}

interface StaffMember {
  id?: string;
  email?: string;
  storeId?: string;
}

interface Doctor {
  id: string;
  name: string;
  department?: string;
  specialization?: string;
  availability?: 'available' | 'busy' | 'unavailable';
  experience?: string;
  rating?: number;
}

interface ApiDoctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization?: string;
  qualification?: string;
  experience?: string;
  consultationFee: string;
  schedule?: string;
  isActive: boolean;
  customFields?: any;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editingAppointment?: any;
}

// Multi-step form configuration
const steps = [
  {
    id: 'patient-info',
    title: 'Patient Info',
    subtitle: 'Patient details',
    icon: User,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50/50 to-cyan-50/50'
  },
  {
    id: 'schedule',
    title: 'Schedule',
    subtitle: 'Date and time',
    icon: Calendar,
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-50/50 to-emerald-50/50'
  },
  {
    id: 'provider',
    title: 'Provider',
    subtitle: 'Doctor selection',
    icon: Stethoscope,
    gradient: 'from-orange-500 to-amber-500',
    bgGradient: 'from-orange-50/50 to-amber-50/50'
  },
  {
    id: 'clinical',
    title: 'Clinical',
    subtitle: 'Service details',
    icon: Activity,
    gradient: 'from-purple-500 to-violet-500',
    bgGradient: 'from-purple-50/50 to-violet-50/50'
  },
  {
    id: 'payment',
    title: 'Payment',
    subtitle: 'Insurance info',
    icon: CreditCard,
    gradient: 'from-indigo-500 to-blue-500',
    bgGradient: 'from-indigo-50/50 to-blue-50/50'
  }
];

const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  onSuccess, 
  onCancel, 
  editingAppointment 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Fetch patients for dropdown
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  // Fetch stores for dropdown
  const { data: stores = [] } = useQuery<any[]>({
    queryKey: ["/api/stores"],
  });

  // Logged-in user and staff list for fallback store selection
  const { user } = useAuth();
  const { data: staff = [] } = useQuery<StaffMember[]>({ queryKey: ["/api/staff"] });

  // Fetch doctors from API instead of using hardcoded data
  const { data: doctors = [] } = useQuery<ApiDoctor[]>({
    queryKey: ["/api/doctors"],
  });

  // Form configuration
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: editingAppointment ? {
      patientId: editingAppointment.patientId,
      storeId: editingAppointment.storeId || "",
      appointmentDate: editingAppointment.appointmentDate,
      appointmentTime: editingAppointment.appointmentTime,
      serviceType: editingAppointment.appointmentType || editingAppointment.serviceType || "consultation",
      doctorId: editingAppointment.doctorId || "",
      appointmentFee: editingAppointment.appointmentFee || 0,
      baseAmount: (editingAppointment.baseAmount ?? editingAppointment.appointmentFee) || 0,
      calculatedAmount: editingAppointment.calculatedAmount ?? 0,
      finalAmount: editingAppointment.finalAmount ?? 0,
      paymentStatus: editingAppointment.paymentStatus || "pending",
      notes: editingAppointment.notes || "",
      status: editingAppointment.status || "scheduled",
    } : {
      patientId: "",
      storeId: "",
      appointmentDate: "",
      appointmentTime: "",
      serviceType: "consultation",
      doctorId: "",
      appointmentFee: 0,
      baseAmount: 0,
      calculatedAmount: 0,
      finalAmount: 0,
      paymentStatus: "pending",
      notes: "",
      status: "scheduled",
    },
  });

  // Centralized payment recalculation effect
  useEffect(() => {
    const subscription = form.watch((values) => {
      const { baseAmount = 0, hasCoupon = false, couponType, couponValue = 0, hasInsurance = false, insuranceProvider, insuranceCoverage = 0, paidAmount = 0 } = values as any;

      let discountAmount = 0;
      if (hasCoupon && couponType && couponValue > 0) {
        if (couponType === 'percentage') {
          discountAmount = (baseAmount * couponValue) / 100;
        } else if (couponType === 'fixed') {
          discountAmount = Math.min(couponValue, baseAmount);
        }
      }

      const calculatedAmount = Math.max(0, baseAmount - discountAmount);
      let finalAmount = calculatedAmount;

      // Insurance calculation with optional provider limits
      let insuranceAmount = 0;
      if (hasInsurance && insuranceCoverage > 0) {
        const coverageAmount = (finalAmount * insuranceCoverage) / 100;
        const providerMax: Record<string, number> = {
          'Aetna': 2000,
          'Blue Cross Blue Shield': 1800,
          'Cigna': 2200,
          'Humana': 1500,
          'United Healthcare': 2000,
        };
        const maxCoverage = insuranceProvider ? (providerMax[insuranceProvider] ?? Number.POSITIVE_INFINITY) : Number.POSITIVE_INFINITY;
        insuranceAmount = Math.min(coverageAmount, maxCoverage);
      }

      const remainingAmount = Math.max(0, finalAmount - insuranceAmount - paidAmount);
      const paymentVerified = remainingAmount === 0;

      const current = form.getValues();
      if (current.calculatedAmount !== calculatedAmount) form.setValue('calculatedAmount', calculatedAmount, { shouldValidate: false, shouldDirty: false });
      if (current.discountAmount !== discountAmount) form.setValue('discountAmount', discountAmount, { shouldValidate: false, shouldDirty: false });
      if (current.finalAmount !== finalAmount) form.setValue('finalAmount', finalAmount, { shouldValidate: false, shouldDirty: false });
      if (current.insuranceAmount !== insuranceAmount) form.setValue('insuranceAmount', insuranceAmount, { shouldValidate: false, shouldDirty: false });
      if (current.remainingAmount !== remainingAmount) form.setValue('remainingAmount', remainingAmount, { shouldValidate: false, shouldDirty: false });
      if (current.paymentVerified !== paymentVerified) form.setValue('paymentVerified', paymentVerified, { shouldValidate: false, shouldDirty: false });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Auto-select storeId based on patient → staff → single store
  const selectedPatientId = form.watch('patientId');
  useEffect(() => {
    let newStoreId: string | undefined;
    const selectedPatient = patients.find(p => p.id === selectedPatientId) as (Patient | undefined);
    if (selectedPatient?.storeId) {
      newStoreId = selectedPatient.storeId;
    } else {
      const staffMember = (staff as StaffMember[]).find((s: StaffMember) => (s.email ?? '').toLowerCase() === ((user as any)?.email ?? '').toLowerCase());
      if (staffMember?.storeId) newStoreId = staffMember.storeId as string; else if (stores.length === 1) newStoreId = (stores[0] as any).id as string;
    }
    const current = form.getValues('storeId');
    if (newStoreId && current !== newStoreId) form.setValue('storeId', newStoreId, { shouldValidate: true });
  }, [selectedPatientId, patients, staff, user, stores, form]);

  // Create/Update appointment mutation
  const appointmentMutation = useMutation({
    mutationFn: (data: AppointmentFormData) => {
      const isEditing = Boolean(editingAppointment);
      const endpoint = isEditing
        ? `/api/medical-appointments/${editingAppointment.id}`
        : "/api/medical-appointments";
      const method = isEditing ? "PATCH" : "POST";

      // Backend expects fields from insertAppointmentSchema (appointments table):
      // { patientId, storeId, service, appointmentDate, duration, status?, notes?, customFields? }
      // Normalize status to API enum (in_progress, no_show)
      const statusMap: Record<string, string> = { "in-progress": "in_progress", "no-show": "no_show" };
      const normalizedStatus = (statusMap as any)[(data as any).status] || (data as any).status || "scheduled";

      // Combine date + time into a Date object (accepted by schema)
      const combinedDate = new Date(`${data.appointmentDate}T${data.appointmentTime}`);

      // Move additional UI fields into customFields so nothing is lost
      const customFields: Record<string, any> = {
        uiMeta: {
          serviceType: data.serviceType,
          providerName: data.providerName,
          department: data.department,
          providerSpecialization: data.providerSpecialization,
        },
        doctor: {
          id: data.doctorId,
          name: data.providerName,
        },
        clinical: {
          reasonForVisit: data.reasonForVisit,
          symptoms: data.symptoms,
          medicalHistory: data.medicalHistory,
          currentMedications: data.currentMedications,
          allergies: data.allergies,
          vitalSigns: data.vitalSigns,
        },
        pricing: {
          appointmentFee: data.appointmentFee,
          baseAmount: data.baseAmount,
          calculatedAmount: data.calculatedAmount,
          finalAmount: data.finalAmount,
          discountAmount: data.discountAmount,
          hasCoupon: data.hasCoupon,
          couponCode: data.couponCode,
          couponType: data.couponType,
          couponValue: data.couponValue,
          appliedCoupons: data.appliedCoupons,
          paymentStatus: data.paymentStatus,
          paidAmount: data.paidAmount,
          remainingAmount: data.remainingAmount,
          paymentVerified: data.paymentVerified,
          paymentMethod: data.paymentMethod,
          hasInsurance: data.hasInsurance,
          insuranceProvider: data.insuranceProvider,
          insurancePolicyNumber: data.insurancePolicyNumber,
          insuranceCoverage: data.insuranceCoverage,
          insuranceAmount: data.insuranceAmount,
          insuranceDeductible: data.insuranceDeductible,
          insuranceCoPayment: data.insuranceCoPayment,
        },
        notes: data.appointmentNotes || data.notes || data.specialRequests,
      };

      const payload: any = {
        patientId: data.patientId,
        storeId: data.storeId,
        service: data.serviceType, // map serviceType -> service
        appointmentDate: combinedDate, // Date object is accepted by API schema
        duration: data.duration,
        status: normalizedStatus,
        notes: data.notes || data.appointmentNotes,
        customFields,
      };

      // Editing uses PATCH with the same normalized fields
      return apiRequest(endpoint, method, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-appointments"] });
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
    appointmentMutation.mutate(data);
  };

  // Service type options - matching the old UI
  const serviceTypes = [
    { value: "consultation", label: "Initial Consultation", icon: User },
    { value: "eye-exam", label: "Comprehensive Eye Exam", icon: Activity },
    { value: "contact-fitting", label: "Contact Lens Fitting", icon: Heart },
    { value: "follow-up", label: "Follow-up Visit", icon: CheckCircle },
    { value: "prescription-update", label: "Prescription Update", icon: Calendar },
    { value: "emergency", label: "Emergency Visit", icon: AlertTriangle },
    { value: "routine-checkup", label: "Routine Checkup", icon: Stethoscope },
    { value: "glasses-fitting", label: "Glasses Fitting", icon: Activity },
    { value: "surgery", label: "Surgery", icon: Activity },
    { value: "other", label: "Other", icon: Plus }
  ];

  // Auto pricing map for services
  const SERVICE_BASE_PRICES: Record<string, number> = {
    consultation: 50,
    "eye-exam": 100,
    "contact-fitting": 80,
    "follow-up": 40,
    "prescription-update": 60,
    emergency: 150,
    "routine-checkup": 70,
    "glasses-fitting": 30,
    surgery: 1000,
    other: 0,
  };

  // Transform API doctor data to match UI expectations
  const transformedDoctors: Doctor[] = (doctors as ApiDoctor[]).map(doctor => ({
    id: doctor.id,
    name: `Dr. ${doctor.firstName || 'Unknown'} ${doctor.lastName || ''}`.trim(),
    department: 'Optometry', // Default department since API doesn't provide this field
    specialization: doctor.specialization || 'General Medicine',
    availability: 'available' as const, // Default to available, can be enhanced later
    experience: doctor.experience || '5+ years',
    rating: 4.5 // Default rating, can be enhanced later
  }));

  // Navigation functions
  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...Array.from(prev), currentStep]));
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Step validation
  const validateStep = async (stepIndex: number) => {
    const stepFields = getStepFields(stepIndex);
    return await form.trigger(stepFields);
  };

  const getStepFields = (stepIndex: number): (keyof AppointmentFormData)[] => {
    switch (stepIndex) {
      case 0: return ['patientId'];
      case 1: return ['appointmentDate', 'appointmentTime'];
      case 2: return ['doctorId'];
      case 3: return ['serviceType'];
      case 4: return ['paymentStatus'];
      default: return [];
    }
  };

  // Step indicator component
  const renderStepIndicator = () => {
    const overallProgress = ((currentStep + 1) / steps.length) * 100;
    const radius = 18; // matches 44x44 viewBox with some padding
    const circumference = 2 * Math.PI * radius;

    const getProgressForStep = (index: number) => {
      if (index < currentStep) return 100; // completed
      if (index === currentStep) return overallProgress; // current step reflects overall progress
      return 0; // upcoming
    };

    return (
      <div className="relative">
        <div className="flex items-center gap-4 md:gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep;

            const pct = getProgressForStep(index);
            const offset = circumference - (pct / 100) * circumference;

            return (
              <motion.button
                type="button"
                key={step.id}
                className="flex flex-col items-center gap-1 group focus:outline-none"
                onClick={() => setCurrentStep(index)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative w-12 h-12 md:w-14 md:h-14">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r={radius} strokeWidth="4" className="stroke-gray-200/80 fill-none" />
                    <motion.circle
                      cx="22" cy="22" r={radius} strokeWidth="4"
                      className={`fill-none ${isCompleted || isCurrent ? 'stroke-violet-500' : 'stroke-gray-300'}`}
                      strokeDasharray={`${circumference} ${circumference}`}
                      animate={{ strokeDashoffset: offset }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className={`absolute inset-1 rounded-full flex items-center justify-center shadow-md ${isCompleted ? 'bg-violet-100 text-violet-700' : isCurrent ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
                    ) : (
                      <Icon className="h-4 w-4 md:h-5 md:w-5" />
                    )}
                  </div>
                </div>
                <span className={`text-xs md:text-sm font-medium ${isCurrent ? 'text-violet-700' : 'text-gray-600'} whitespace-nowrap`}>
                  {step.title}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  // Progress bar
  const renderProgressBar = () => {
    const progress = ((currentStep + 1) / steps.length) * 100;
    return (
      <div className="w-full mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full"
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
    const step = steps[currentStep];
    const StepIcon = step.icon;

    return (
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`border border-gray-200 shadow-xl bg-white/70 backdrop-blur-md`}>
          <CardContent className="p-6">
            {/* Step header */}
            <div className="flex items-center space-x-3 mb-4">
              <motion.div 
                className={`p-2 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-md`}
                whileHover={{ scale: 1.05, rotate: 3 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <StepIcon className="h-4 w-4" />
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm font-medium">{step.subtitle}</p>
              </div>
            </div>

            {/* Step content */}
            <div className="space-y-4">
              {currentStep === 0 && (
                <motion.div className="space-y-6">
                   <FormField
                     control={form.control}
                     name="patientId"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className="text-base font-semibold text-gray-700">Patient *</FormLabel>
                         <Select onValueChange={(value) => {
                           field.onChange(value);
                           const selectedPatient = patients.find(p => p.id === value);
                           if (selectedPatient) {
                             form.setValue('patientName', `${selectedPatient.firstName} ${selectedPatient.lastName}`);
                             form.setValue('patientEmail', (selectedPatient as any).email || '');
                             form.setValue('patientPhone', selectedPatient.phone);
                           }
                         }} value={field.value}>
                           <FormControl>
                             <SelectTrigger className="h-14 text-base border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors">
                               <SelectValue placeholder="🔍 Search and select patient" />
                             </SelectTrigger>
                           </FormControl>
                           <SelectContent className="max-h-80">
                             <div className="p-2 border-b">
                               <div className="flex items-center space-x-2 text-sm text-gray-500">
                                 <User className="h-4 w-4" />
                                 <span>Select existing patient or register new</span>
                               </div>
                             </div>
                             {patients.map((patient) => (
                               <SelectItem key={patient.id} value={patient.id} className="p-3">
                                 <div className="flex items-center justify-between w-full">
                                   <div className="flex items-center space-x-3">
                                     <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                                       {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                                     </div>
                                     <div className="flex flex-col">
                                       <span className="font-semibold text-gray-900">{patient.firstName} {patient.lastName}</span>
                                       <div className="flex items-center space-x-2 text-sm text-gray-500">
                                         <Mail className="h-3 w-3" />
                                         <span>{patient.email}</span>
                                       </div>
                                       <div className="flex items-center space-x-2 text-sm text-gray-500">
                                         <Phone className="h-3 w-3" />
                                         <span>{patient.phone}</span>
                                       </div>
                                     </div>
                                   </div>
                                   <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                     {patient.patientCode || `PAT-${patient.id.slice(-6)}`}
                                   </Badge>
                                 </div>
                               </SelectItem>
                             ))}
                             <div className="p-3 border-t bg-gray-50">
                               <Button 
                                 type="button" 
                                 variant="outline" 
                                 className="w-full flex items-center space-x-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                                 onClick={() => {
                                   // TODO: Open patient registration modal
                                   console.log('Open patient registration');
                                 }}
                               >
                                 <UserPlus className="h-4 w-4" />
                                 <span>Register New Patient</span>
                               </Button>
                             </div>
                           </SelectContent>
                         </Select>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   
                   {/* Store selection removed - storeId is auto-selected based on patient/staff/single store */}
                 </motion.div>
               )}

              {currentStep === 1 && (
                <motion.div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="appointmentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-700">Appointment Date *</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              className="h-12 text-base border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors"
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
                          <FormLabel className="text-base font-semibold text-gray-700">Appointment Time *</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              className="h-12 text-base border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="doctorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-gray-700">Select Provider/Doctor *</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          const selectedDoctor = transformedDoctors.find(d => d.id === value);
                          if (selectedDoctor) {
                            form.setValue('providerName', selectedDoctor.name);
                            form.setValue('department', selectedDoctor.department || 'Optometry');
                            form.setValue('providerSpecialization', selectedDoctor.specialization);
                          }
                        }} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-14 text-base border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors">
                              <SelectValue placeholder="🩺 Choose your healthcare provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-80">
                            <div className="p-2 border-b">
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Stethoscope className="h-4 w-4" />
                                <span>Available providers and their specializations</span>
                              </div>
                            </div>
                            {transformedDoctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id} className="p-4">
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-semibold">
                                      <Stethoscope className="h-6 w-6" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-semibold text-gray-900">Dr. {doctor.name}</span>
                                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                          {doctor.specialization || 'General Optometry'}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                                        <Stethoscope className="h-3 w-3" />
                                        <span>{doctor.department || 'Optometry Department'}</span>
                                      </div>
                                      <div className="flex items-center space-x-2 text-sm mt-1">
                                        <div className={`w-2 h-2 rounded-full ${
                                          doctor.availability === 'available' ? 'bg-green-500' :
                                          doctor.availability === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`} />
                                        <span className={`text-sm ${
                                          doctor.availability === 'available' ? 'text-green-600' :
                                          doctor.availability === 'busy' ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                          {doctor.availability === 'available' ? 'Available Today' :
                                           doctor.availability === 'busy' ? 'Limited Availability' : 'Fully Booked'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end space-y-1">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                      {doctor.experience || '5+'} years
                                    </Badge>
                                    <div className="flex items-center space-x-1">
                                      {[...Array(5)].map((_, i) => (
                                        <div key={i} className={`w-2 h-2 rounded-full ${
                                          i < (doctor.rating || 4) ? 'bg-yellow-400' : 'bg-gray-200'
                                        }`} />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-sm text-gray-500">
                          Select a healthcare provider for your appointment
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Provider Information Display */}
                  {form.watch('doctorId') && (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-orange-800">Provider Selected</h4>
                          <p className="text-sm text-orange-600">
                            {transformedDoctors.find(d => d.id === form.watch('doctorId'))?.name} - {transformedDoctors.find(d => d.id === form.watch('doctorId'))?.specialization || 'General Optometry'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-gray-700">Service Type *</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          const price = SERVICE_BASE_PRICES[value as keyof typeof SERVICE_BASE_PRICES] ?? 0;
                          form.setValue('baseAmount', price, { shouldValidate: true, shouldDirty: true });
                          form.setValue('appointmentFee', price, { shouldValidate: true, shouldDirty: true });
                        }} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 text-base border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors">
                              <SelectValue placeholder="Choose the service you need" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {serviceTypes.map((service) => {
                              const Icon = service.icon;
                              return (
                                <SelectItem key={service.value} value={service.value}>
                                  <div className="flex items-center space-x-2">
                                    <Icon className="h-4 w-4 text-gray-400" />
                                    <span>{service.label}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-gray-700">Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional notes for the appointment..."
                            className="min-h-[100px] border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div className="space-y-6">
                  {/* Payment Calculation Section */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-indigo-600" />
                      Payment Calculation
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <FormField
                        control={form.control}
                        name="baseAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Base Amount *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  className="pl-10 h-10 text-sm border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors"
                                  {...field}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 0;
                                    field.onChange(value);
                                    form.setValue('appointmentFee', value, { shouldValidate: true, shouldDirty: true });
                                    // Centralized effect handles recalculation
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="calculatedAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Calculated Amount</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  className="pl-10 h-10 text-sm border-2 border-gray-200 bg-gray-50"
                                  {...field}
                                  readOnly
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Coupon & Discount System */}
                  <div className="border border-violet-200/60 bg-white/70 backdrop-blur-md rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Plus className="h-5 w-5 mr-2 text-violet-600" />
                      Coupons & Discounts
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <FormField
                        control={form.control}
                        name="hasCoupon"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-medium">Apply Coupon</FormLabel>
                              <FormDescription className="text-xs">Check to apply available coupons</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      {form.watch('hasCoupon') && (
                        <FormField
                          control={form.control}
                          name="couponCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Coupon Code</FormLabel>
                              <FormControl>
                                <div className="flex space-x-2">
                                  <Input
                                    placeholder="Enter coupon code"
                                    className="h-10 text-sm border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors"
                                    {...field}
                                  />
                                  <Button 
                                     type="button" 
                                     size="sm" 
                                     variant="outline" 
                                     className="px-3"
                                     onClick={() => {
                                        const couponCode = form.getValues('couponCode');
                                        if (couponCode) {
                                          // Mock coupon validation and application
                                          const mockCoupons: Record<string, { type: 'percentage' | 'fixed' | 'service', value: number }> = {
                                            'SAVE10': { type: 'percentage', value: 10 },
                                            'FIRST20': { type: 'fixed', value: 20 },
                                            'EYECARE15': { type: 'percentage', value: 15 },
                                            'NEWPATIENT': { type: 'fixed', value: 25 }
                                          };
                                          
                                          const coupon = mockCoupons[couponCode.toUpperCase()];
                                          if (coupon) {
                                            form.setValue('couponType', coupon.type);
                                            form.setValue('couponValue', coupon.value);
                                            // Centralized effect will compute discountAmount, finalAmount, remainingAmount, and paymentVerified
                                          } else {
                                            // Invalid coupon - reset values
                                            form.setValue('couponType', undefined);
                                            form.setValue('couponValue', 0);
                                            form.setValue('discountAmount', 0);
                                          }
                                        }
                                      }}
                                   >
                                     Apply
                                   </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                    
                    {form.watch('hasCoupon') && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="couponType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Coupon Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-10 text-sm border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="percentage">Percentage</SelectItem>
                                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                                  <SelectItem value="service">Service Discount</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="couponValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Coupon Value</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  className="h-10 text-sm border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors"
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
                          name="discountAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Discount Amount</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="pl-10 h-10 text-sm border-2 border-gray-200 bg-gray-50"
                                    {...field}
                                    readOnly
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  {/* Insurance Integration */}
                  <div className="border border-violet-200/60 bg-white/70 backdrop-blur-md rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-violet-600" />
                      Insurance Coverage
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <FormField
                        control={form.control}
                        name="hasInsurance"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-medium">Has Insurance</FormLabel>
                              <FormDescription className="text-xs">Check if patient has insurance coverage</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      {form.watch('hasInsurance') && (
                        <FormField
                          control={form.control}
                          name="insuranceProvider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Insurance Provider</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter insurance provider"
                                  className="h-10 text-sm border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                    
                    {form.watch('hasInsurance') && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <FormField
                            control={form.control}
                            name="insurancePolicyNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">Policy Number</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Policy #"
                                    className="h-10 text-sm border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="insuranceCoverage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">Coverage %</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="80"
                                    max="100"
                                    className="h-10 text-sm border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors"
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
                            name="insuranceDeductible"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">Deductible</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                      type="number"
                                      placeholder="0.00"
                                      className="pl-10 h-10 text-sm border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="insuranceAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">Insurance Amount</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                      type="number"
                                      placeholder="0.00"
                                      className="pl-10 h-10 text-sm border-2 border-gray-200 bg-gray-50"
                                      {...field}
                                      readOnly
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            // Auto-populate insurance details and verify eligibility
                            const provider = form.getValues('insuranceProvider');
                            const policyNumber = form.getValues('insurancePolicyNumber');
                            
                            if (provider && policyNumber) {
                              // Mock insurance data with coverage limits
                              const mockInsuranceData: Record<string, { coverage: number, deductible: number, copay: number, maxCoverage: number }> = {
                                'Aetna': { coverage: 80, deductible: 500, copay: 25, maxCoverage: 2000 },
                                'Blue Cross Blue Shield': { coverage: 75, deductible: 750, copay: 30, maxCoverage: 1800 },
                                'Cigna': { coverage: 85, deductible: 400, copay: 20, maxCoverage: 2200 },
                                'Humana': { coverage: 70, deductible: 600, copay: 35, maxCoverage: 1500 },
                                'United Healthcare': { coverage: 80, deductible: 550, copay: 25, maxCoverage: 2000 }
                              };
                              
                              const insuranceInfo = mockInsuranceData[provider];
                              if (insuranceInfo) {
                                // Mock verification (80% success rate)
                                const isEligible = Math.random() > 0.2;
                                
                                if (isEligible) {
                                  form.setValue('insuranceCoverage', insuranceInfo.coverage);
                                  form.setValue('insuranceDeductible', insuranceInfo.deductible);
                                  form.setValue('insuranceCoPayment', insuranceInfo.copay);
                                  // Centralized effect will compute insuranceAmount, remainingAmount, and paymentVerified using coverage and provider
                                } else {
                                  // Insurance verification failed
                                  form.setValue('insuranceAmount', 0);
                                  // Centralized effect will recompute remainingAmount based on current finalAmount and paidAmount
                                }
                              }
                            }
                          }}
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Verify Insurance & Apply Coverage
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Coupon Display Section */}
                  <div className="border border-green-200/60 bg-green-50/30 backdrop-blur-md rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      Available Coupons & Discounts
                    </h3>
                    
                    {/* Display available coupons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                      <div className="bg-white border border-green-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                           onClick={() => {
                             form.setValue('hasCoupon', true);
                             form.setValue('couponCode', 'SAVE20');
                             form.setValue('couponType', 'percentage');
                             form.setValue('couponValue', 20);
                           }}>
                        <div className="text-sm font-semibold text-green-700">SAVE20</div>
                        <div className="text-xs text-gray-600">20% off consultation</div>
                        <div className="text-xs text-green-600 mt-1">Click to apply</div>
                      </div>
                      
                      <div className="bg-white border border-blue-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                           onClick={() => {
                             form.setValue('hasCoupon', true);
                             form.setValue('couponCode', 'FIRST50');
                             form.setValue('couponType', 'fixed');
                             form.setValue('couponValue', 50);
                           }}>
                        <div className="text-sm font-semibold text-blue-700">FIRST50</div>
                        <div className="text-xs text-gray-600">$50 off first visit</div>
                        <div className="text-xs text-blue-600 mt-1">Click to apply</div>
                      </div>
                      
                      <div className="bg-white border border-purple-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                           onClick={() => {
                             form.setValue('hasCoupon', true);
                             form.setValue('couponCode', 'EYECARE');
                             form.setValue('couponType', 'service');
                             form.setValue('couponValue', 100);
                           }}>
                        <div className="text-sm font-semibold text-purple-700">EYECARE</div>
                        <div className="text-xs text-gray-600">Free eye exam</div>
                        <div className="text-xs text-purple-600 mt-1">Click to apply</div>
                      </div>
                    </div>
                    
                    {form.watch('hasCoupon') && (
                      <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                        <div className="text-sm font-medium text-green-800">
                          Applied: {form.watch('couponCode')} - 
                          {form.watch('couponType') === 'percentage' && `${form.watch('couponValue')}% discount`}
                          {form.watch('couponType') === 'fixed' && `$${form.watch('couponValue')} off`}
                          {form.watch('couponType') === 'service' && 'Service discount'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Summary & Verification */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                      Payment Summary
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <FormField
                        control={form.control}
                        name="finalAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Final Amount</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  className="pl-10 h-10 text-sm border-2 border-gray-200 bg-gray-50 font-semibold"
                                  {...field}
                                  readOnly
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="paidAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Paid Amount</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  className="pl-10 h-10 text-sm border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors"
                                  {...field}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 0;
                                    field.onChange(value);
                                    // Centralized effect handles remainingAmount and paymentVerified
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="remainingAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Remaining Amount</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  className="pl-10 h-10 text-sm border-2 border-gray-200 bg-gray-50"
                                  {...field}
                                  readOnly
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Payment Method *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-10 text-sm border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors">
                                  <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="card">Credit/Debit Card</SelectItem>
                                <SelectItem value="insurance">Insurance</SelectItem>
                                <SelectItem value="online">Online Payment</SelectItem>
                                <SelectItem value="mixed">Mixed Payment</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="paymentStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Payment Status *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-10 text-sm border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pending">Pending Payment</SelectItem>
                                <SelectItem value="paid">Fully Paid</SelectItem>
                                <SelectItem value="partial">Partial Payment</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Payment Verification & Breakdown */}
                    <div className="mt-6 space-y-4">
                      {/* Payment Breakdown */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-gray-600" />
                          Payment Breakdown
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Base Amount:</span>
                            <span className="font-medium">${form.watch('baseAmount') || '0.00'}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Discount Applied:</span>
                            <span className="font-medium text-green-600">-${form.watch('discountAmount') || '0.00'}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Insurance Coverage:</span>
                            <span className="font-medium text-blue-600">-${form.watch('insuranceAmount') || '0.00'}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b-2 border-gray-300">
                            <span className="text-base font-semibold text-gray-800">Final Amount:</span>
                            <span className="text-lg font-bold text-gray-900">${form.watch('finalAmount') || '0.00'}</span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-sm text-gray-600">Amount Paid:</span>
                            <span className="font-medium">${form.watch('paidAmount') || '0.00'}</span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-base font-semibold text-gray-800">Remaining Balance:</span>
                            <span className={`text-lg font-bold ${
                              (form.watch('remainingAmount') || 0) > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              ${form.watch('remainingAmount') || '0.00'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Payment Status */}
                      <div className={`p-4 rounded-lg border-2 ${
                        form.watch('paymentVerified') 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center gap-3 mb-2">
                          {form.watch('paymentVerified') ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                          )}
                          <div>
                            <span className={`text-lg font-semibold ${
                              form.watch('paymentVerified') ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {form.watch('paymentVerified') ? 'Payment Complete ✓' : 'Payment Required'}
                            </span>
                            <p className={`text-sm mt-1 ${
                              form.watch('paymentVerified') ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {form.watch('paymentVerified') 
                                ? 'All payments verified. Appointment can be confirmed and scheduled.' 
                                : `Outstanding balance of $${form.watch('remainingAmount') || '0.00'} must be paid to confirm appointment.`
                              }
                            </p>
                          </div>
                        </div>
                        
                        {!form.watch('paymentVerified') && (
                          <div className="mt-3 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                              <div>
                                <span className="text-sm font-medium text-yellow-800">Payment Options Available:</span>
                                <ul className="text-xs text-yellow-700 mt-1 space-y-1 ml-2">
                                  <li>• Complete payment now to confirm appointment</li>
                                  <li>• Apply additional coupons for further discounts</li>
                                  <li>• Verify insurance eligibility for additional coverage</li>
                                  <li>• Schedule appointment as pending payment (requires follow-up)</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Payment Status Workflows */}
                    {form.watch('paymentVerified') && (
                      <div className="mt-4 space-y-4">
                        {/* Completed Payment Workflow */}
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center mb-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-lg font-semibold text-green-800">
                              Payment Complete - Appointment Confirmed
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-green-700">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              <span>✓ Payment verified and processed</span>
                            </div>
                            <div className="flex items-center text-sm text-green-700">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              <span>✓ Appointment automatically forwarded to Doctor Appointments</span>
                            </div>
                            <div className="flex items-center text-sm text-green-700">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              <span>✓ Patient history updated across all modules</span>
                            </div>
                            <div className="flex items-center text-sm text-green-700">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              <span>✓ Invoice generated and sent to accounting</span>
                            </div>
                            <div className="flex items-center text-sm text-green-700">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              <span>✓ Prescription module ready for doctor access</span>
                            </div>
                          </div>
                          <div className="mt-3 p-2 bg-white border border-green-300 rounded text-xs text-green-800">
                            <strong>Next Steps:</strong> Patient will receive confirmation email. Doctor can now access appointment in their dashboard.
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {!form.watch('paymentVerified') && form.watch('paymentStatus') === 'pending' && (
                      <div className="mt-4 space-y-4">
                        {/* Pending Payment Workflow */}
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center mb-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                            <span className="text-lg font-semibold text-yellow-800">
                              Pending Payment - Appointment On Hold
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-yellow-700">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                              <span>⏳ Appointment placed on hold until payment completion</span>
                            </div>
                            <div className="flex items-center text-sm text-yellow-700">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                              <span>⏳ Patient will receive payment reminder notifications</span>
                            </div>
                            <div className="flex items-center text-sm text-yellow-700">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                              <span>⏳ Automatic rescheduling available upon payment</span>
                            </div>
                            <div className="flex items-center text-sm text-yellow-700">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                              <span>⏳ Time slot temporarily reserved (48-hour hold)</span>
                            </div>
                          </div>
                          <div className="mt-3 p-2 bg-white border border-yellow-300 rounded text-xs text-yellow-800">
                            <strong>Payment Options:</strong> Patient can complete payment online, by phone, or in-person to automatically confirm appointment.
                          </div>
                        </div>
                        
                        {/* Reschedule Options for Pending Payments */}
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-blue-800">
                              Reschedule Options (Available After Payment)
                            </span>
                          </div>
                          <div className="text-xs text-blue-700 space-y-1">
                            <div>• Same-day rescheduling if payment completed before 2 PM</div>
                            <div>• Next available slot automatically suggested</div>
                            <div>• Patient preferences maintained for new appointment</div>
                            <div>• All clinical information transferred to new slot</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Consent & Privacy */}
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="consentToTreatment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="rounded mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium">Consent to Treatment *</FormLabel>
                            <FormDescription className="text-xs text-gray-600">
                              I consent to the medical treatment and procedures.
                            </FormDescription>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="privacyPolicyAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="rounded mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium">Privacy Policy *</FormLabel>
                            <FormDescription className="text-xs text-gray-600">
                              I agree to the privacy policy and data handling practices.
                            </FormDescription>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-4" data-testid="appointment-form">
      {/* Header with title and step tabs */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 shadow-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white">
            <Calendar className="h-4 w-4" />
            <span className="text-sm md:text-base font-semibold">
              {editingAppointment ? 'Update Appointment' : 'Schedule New Appointment'}
            </span>
          </div>
          <div className="md:ml-auto">
            {renderStepIndicator()}
          </div>
        </div>
      </motion.div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Step Content */}
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
          
          {/* Navigation Buttons */}
          <motion.div 
            className="flex justify-between items-center pt-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 px-6 py-4 rounded-xl shadow-md border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={currentStep === 0 ? onCancel : previousStep}
                className="px-8 py-3 h-12 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 rounded-xl text-base font-semibold"
              >
                {currentStep === 0 ? (
                  <>Cancel</>
                ) : (
                  <>
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    Previous
                  </>
                )}
              </Button>
            </motion.div>

            <div className="text-center">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border-0">
                Step {currentStep + 1} of {steps.length}
              </Badge>
            </div>

            {currentStep === steps.length - 1 ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={appointmentMutation.isPending}
                  className="px-8 py-3 h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
                >
                  {appointmentMutation.isPending ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-5 w-5 mr-2" />
                      Schedule Appointment
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
                >
                  Next
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        </form>
      </Form>
    </div>
  );
};

export default AppointmentForm;