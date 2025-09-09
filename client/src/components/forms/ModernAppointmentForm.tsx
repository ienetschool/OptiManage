import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DollarSign,
  FileText,
  Users,
  CalendarDays,
  CreditCard,
  Eye,
  Glasses,
  Activity,
  Heart,
  CheckCircle,
  AlertTriangle,
  Plus,
  ChevronRight,
  ChevronLeft,
  Check,
  UserCheck,
  Phone,
  Mail,
  Gift
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Enhanced Appointment Schema with comprehensive validation
const appointmentSchema = z.object({
  // Patient & Service
  patientId: z.string().min(1, "Please select a patient"),
  storeId: z.string().min(1, "Store ID is required"),
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
    "laser-treatment",
    "injection",
    "screening",
    "other"
  ], { required_error: "Please select service type" }),
  
  // Schedule
  appointmentDate: z.string().min(1, "Appointment date is required"),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  duration: z.number().min(15, "Duration must be at least 15 minutes").max(240, "Duration cannot exceed 4 hours").default(30),
  doctorId: z.string().min(1, "Please select a doctor"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  
  // Payment
  appointmentFee: z.number().min(0, "Fee must be non-negative").default(0),
  paymentStatus: z.enum(["pending", "paid", "partial", "cancelled"]).default("pending"),
  paymentMethod: z.enum(["cash", "card", "insurance", "online", "check"]).optional(),
  
  // Details
  chiefComplaint: z.string().min(5, "Chief complaint must be at least 5 characters").optional(),
  notes: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().optional(),
  status: z.enum(["scheduled", "confirmed", "in-progress", "completed", "cancelled", "no-show", "rescheduled"]).default("scheduled"),
  
  // Additional Information
  reasonForVisit: z.string().optional(),
  symptoms: z.string().optional(),
  urgencyLevel: z.enum(["routine", "urgent", "emergency"]).default("routine"),
  referralSource: z.string().optional(),
  insuranceAuthorization: z.string().optional(),
  
  // Coupon Integration
  couponCode: z.string().optional(),
  appliedDiscount: z.number().min(0).default(0),
  finalAmount: z.number().min(0).default(0),
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

interface ModernAppointmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editingAppointment?: any;
}

const ModernAppointmentForm: React.FC<ModernAppointmentFormProps> = ({ 
  onSuccess, 
  onCancel, 
  editingAppointment 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Fetch patients and doctors
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
  });

  const steps = [
    {
      title: "Patient & Service",
      subtitle: "Select patient and service",
      icon: UserCheck,
      color: "from-blue-500 to-blue-600",
      fields: ["patientId", "serviceType"]
    },
    {
      title: "Schedule",
      subtitle: "Date, time & doctor",
      icon: CalendarDays,
      color: "from-green-500 to-green-600", 
      fields: ["appointmentDate", "appointmentTime"]
    },
    {
      title: "Payment",
      subtitle: "Fees & payment details",
      icon: CreditCard,
      color: "from-purple-500 to-purple-600",
      fields: []
    },
    {
      title: "Details",
      subtitle: "Medical details & notes",
      icon: FileText,
      color: "from-orange-500 to-orange-600",
      fields: []
    }
  ];

  // Form configuration
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: editingAppointment ? {
      patientId: editingAppointment.patientId,
      storeId: editingAppointment.storeId || "store001", // Default store
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
      reasonForVisit: editingAppointment.reasonForVisit || "",
      symptoms: editingAppointment.symptoms || "",
      urgencyLevel: editingAppointment.urgencyLevel || "routine",
      referralSource: editingAppointment.referralSource || "",
      insuranceAuthorization: editingAppointment.insuranceAuthorization || "",
      couponCode: editingAppointment.couponCode || "",
    } : {
      patientId: "",
      storeId: "store001", // Default store
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
      reasonForVisit: "",
      symptoms: "",
      urgencyLevel: "routine",
      referralSource: "",
      insuranceAuthorization: "",
      couponCode: "",
    },
  });

  // Service pricing configuration
  const servicePricing = {
    "consultation": { fee: 75, description: "Initial Consultation" },
    "eye-exam": { fee: 120, description: "Comprehensive Eye Examination" },
    "contact-fitting": { fee: 95, description: "Contact Lens Fitting" },
    "follow-up": { fee: 50, description: "Follow-up Visit" },
    "prescription-update": { fee: 60, description: "Prescription Update" },
    "emergency": { fee: 150, description: "Emergency Visit" },
    "routine-checkup": { fee: 80, description: "Routine Checkup" },
    "glasses-fitting": { fee: 45, description: "Glasses Fitting" },
    "surgery": { fee: 500, description: "Eye Surgery" },
    "laser-treatment": { fee: 800, description: "Laser Treatment" },
    "injection": { fee: 200, description: "Eye Injection" },
    "screening": { fee: 65, description: "Vision Screening" },
    "other": { fee: 100, description: "Other Services" }
  };

  // Available coupons for patients
  const availableCoupons = {
    "WELCOME10": { discount: 10, type: "percentage", description: "10% off for new patients" },
    "NEWPATIENT": { discount: 15, type: "fixed", description: "$15 off first visit" },
    "LOYALTY20": { discount: 20, type: "percentage", description: "20% loyalty discount" },
    "SENIOR15": { discount: 15, type: "percentage", description: "15% senior discount" }
  };

  // Auto-calculate fee when service type changes
  const selectedServiceType = form.watch("serviceType");
  const currentFee = form.watch("appointmentFee");
  const couponCode = form.watch("couponCode");
  
  React.useEffect(() => {
    if (selectedServiceType && servicePricing[selectedServiceType]) {
      let basePrice = servicePricing[selectedServiceType].fee;
      let finalFee = basePrice;
      
      // Apply coupon discount if present
      if (couponCode && availableCoupons[couponCode.toUpperCase()]) {
        const coupon = availableCoupons[couponCode.toUpperCase()];
        if (coupon.type === "percentage") {
          const discount = (basePrice * coupon.discount) / 100;
          finalFee = Math.max(0, basePrice - discount);
        } else {
          finalFee = Math.max(0, basePrice - coupon.discount);
        }
      }
      
      form.setValue("appointmentFee", finalFee);
    }
  }, [selectedServiceType, couponCode, form]);

  // Step validation
  const validateStep = async (stepIndex: number): Promise<boolean> => {
    const stepFields = steps[stepIndex].fields;
    
    // If no required fields for this step, mark as valid
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
        service: data.serviceType, // Required by MySQL schema
        appointmentType: data.serviceType, // Map to the expected field for compatibility
        patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : "Unknown Patient",
        patientCode: selectedPatient?.patientCode || "",
        doctorName: selectedDoctor ? `${selectedDoctor.firstName} ${selectedDoctor.lastName}` : "",
        fee: data.appointmentFee, // Map for compatibility
        appointmentNumber: editingAppointment?.appointmentNumber || `APT-${Date.now()}`,
        couponCode: data.couponCode || "", // Add coupon code for server processing
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
    let allValid = true;
    for (let i = 0; i < steps.length; i++) {
      const isValid = await validateStep(i);
      if (!isValid) {
        allValid = false;
        setCurrentStep(i);
        break;
      }
    }

    if (allValid) {
      appointmentMutation.mutate(data);
    }
  };

  // Service type options
  const serviceTypes = [
    { value: "consultation", label: "Initial Consultation", icon: User, description: "First-time patient consultation" },
    { value: "eye-exam", label: "Comprehensive Eye Exam", icon: Eye, description: "Complete eye health examination" },
    { value: "contact-fitting", label: "Contact Lens Fitting", icon: Heart, description: "Contact lens fitting and training" },
    { value: "follow-up", label: "Follow-up Visit", icon: CheckCircle, description: "Follow-up appointment" },
    { value: "prescription-update", label: "Prescription Update", icon: Glasses, description: "Update glasses or contact prescription" },
    { value: "emergency", label: "Emergency Visit", icon: AlertTriangle, description: "Urgent eye care need" },
    { value: "routine-checkup", label: "Routine Checkup", icon: Stethoscope, description: "Regular eye health maintenance" },
    { value: "glasses-fitting", label: "Glasses Fitting", icon: Glasses, description: "Glasses adjustment and fitting" },
    { value: "surgery", label: "Surgery", icon: Activity, description: "Surgical procedure" },
    { value: "laser-treatment", label: "Laser Treatment", icon: Activity, description: "Laser eye treatment" },
    { value: "injection", label: "Eye Injection", icon: Activity, description: "Intravitreal injection" },
    { value: "screening", label: "Eye Screening", icon: Eye, description: "Preventive eye screening" },
    { value: "other", label: "Other", icon: Plus, description: "Other services" }
  ];

  const priorities = [
    { value: "low", label: "Low", color: "bg-gray-100 text-gray-800", description: "Non-urgent, routine care" },
    { value: "normal", label: "Normal", color: "bg-blue-100 text-blue-800", description: "Standard appointment priority" },
    { value: "high", label: "High", color: "bg-yellow-100 text-yellow-800", description: "Needs prompt attention" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800", description: "Requires immediate care" }
  ];

  const urgencyLevels = [
    { value: "routine", label: "Routine", description: "Regular scheduled visit" },
    { value: "urgent", label: "Urgent", description: "Needs attention within 24 hours" },
    { value: "emergency", label: "Emergency", description: "Immediate attention required" }
  ];

  const paymentMethods = [
    { value: "cash", label: "Cash", icon: DollarSign },
    { value: "card", label: "Credit/Debit Card", icon: CreditCard },
    { value: "insurance", label: "Insurance", icon: User },
    { value: "online", label: "Online Payment", icon: Activity },
    { value: "check", label: "Check", icon: FileText }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8 px-4">
      <div className="flex items-center space-x-2 overflow-x-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.has(index);
          const isCurrent = currentStep === index;
          
          return (
            <div key={index} className="flex items-center">
              <div
                className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                  isCurrent ? 'scale-110' : ''
                }`}
                onClick={() => setCurrentStep(index)}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-500 shadow-lg'
                      : isCurrent
                      ? `bg-gradient-to-r ${step.color} shadow-lg`
                      : 'bg-gray-300'
                  }`}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={`text-xs mt-1 font-medium text-center ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-gray-300 mx-2" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderProgressBar = () => {
    const progress = ((currentStep + 1) / steps.length) * 100;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    );
  };

  const renderStep = () => {
    const step = steps[currentStep];
    const StepIcon = step.icon;

    return (
      <Card className="bg-white border-0 shadow-lg min-h-[400px]">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-full bg-gradient-to-r ${step.color} text-white shadow-md`}>
              <StepIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.subtitle}</p>
            </div>
          </div>

          <div className="space-y-4">
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <UserCheck className="h-5 w-5 text-blue-400 mr-2" />
                    <div>
                      <h4 className="text-blue-800 font-semibold">Patient & Service Selection</h4>
                      <p className="text-blue-700 text-sm">Choose the patient and type of service needed</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <User className="h-4 w-4" />
                          <span>Select Patient</span>
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg" data-testid="select-patient">
                              <SelectValue placeholder="Choose a patient" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {patients.map((patient) => (
                                <SelectItem key={patient.id} value={patient.id}>
                                  <div className="flex flex-col py-1">
                                    <span className="font-medium">
                                      {patient.firstName} {patient.lastName}
                                    </span>
                                    <div className="text-xs text-gray-500 flex items-center space-x-2">
                                      {patient.patientCode && (
                                        <span>ID: {patient.patientCode}</span>
                                      )}
                                      {patient.phone && (
                                        <span className="flex items-center">
                                          <Phone className="h-3 w-3 mr-1" />
                                          {patient.phone}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <Stethoscope className="h-4 w-4" />
                          <span>Service Type</span>
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg" data-testid="select-service">
                              <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {serviceTypes.map((service) => (
                                <SelectItem key={service.value} value={service.value}>
                                  <div className="flex items-start space-x-2 py-1">
                                    {React.createElement(service.icon, { className: "h-4 w-4 mt-1 flex-shrink-0" })}
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
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="reasonForVisit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                        <FileText className="h-4 w-4" />
                        <span>Reason for Visit</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Brief description of why the patient is visiting (e.g., routine exam, vision problems, eye pain)..."
                          className="min-h-[100px] border-2 border-gray-200 focus:border-blue-500 rounded-lg resize-none"
                          data-testid="textarea-reasonForVisit"
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-500">
                        Optional - Help us prepare for the appointment
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <CalendarDays className="h-5 w-5 text-green-400 mr-2" />
                    <div>
                      <h4 className="text-green-800 font-semibold">Schedule Appointment</h4>
                      <p className="text-green-700 text-sm">Set the date, time and assign a doctor if needed</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="appointmentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <Calendar className="h-4 w-4" />
                          <span>Date</span>
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                            data-testid="input-date"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="appointmentTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <Clock className="h-4 w-4" />
                          <span>Time</span>
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="time"
                            className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                            data-testid="input-time"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <Clock className="h-4 w-4" />
                          <span>Duration</span>
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg" data-testid="select-duration">
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
                        <FormDescription className="text-sm text-gray-500">Expected appointment duration</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="doctorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <Stethoscope className="h-4 w-4" />
                          <span>Doctor</span>
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg" data-testid="select-doctor">
                              <SelectValue placeholder="Select doctor *" />
                            </SelectTrigger>
                            <SelectContent>
                              {doctors.map((doctor) => (
                                <SelectItem key={doctor.id} value={doctor.id}>
                                  <div className="flex flex-col py-1">
                                    <span className="font-medium">
                                      Dr. {doctor.firstName} {doctor.lastName}
                                    </span>
                                    {doctor.specialization && (
                                      <span className="text-xs text-gray-500">
                                        {doctor.specialization}
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">
                          Doctor assignment is required for all appointments
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Priority</span>
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg" data-testid="select-priority">
                              <SelectValue placeholder="Priority level" />
                            </SelectTrigger>
                            <SelectContent>
                              {priorities.map((priority) => (
                                <SelectItem key={priority.value} value={priority.value}>
                                  <div className="flex items-center space-x-2 py-1">
                                    <Badge className={priority.color}>
                                      {priority.label}
                                    </Badge>
                                    <span className="text-xs text-gray-500">{priority.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="urgencyLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <Activity className="h-4 w-4" />
                          <span>Urgency Level</span>
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg" data-testid="select-urgencyLevel">
                              <SelectValue placeholder="Urgency level" />
                            </SelectTrigger>
                            <SelectContent>
                              {urgencyLevels.map((urgency) => (
                                <SelectItem key={urgency.value} value={urgency.value}>
                                  <div className="flex flex-col py-1">
                                    <span className="font-medium">{urgency.label}</span>
                                    <span className="text-xs text-gray-500">{urgency.description}</span>
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
              <div className="space-y-6">
                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <CreditCard className="h-5 w-5 text-purple-400 mr-2" />
                    <div>
                      <h4 className="text-purple-800 font-semibold">Payment Information</h4>
                      <p className="text-purple-700 text-sm">Configure appointment fees and payment details</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="appointmentFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <DollarSign className="h-4 w-4" />
                          <span>Appointment Fee</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input 
                              {...field} 
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="h-12 pl-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-fee"
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">USD</FormDescription>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <CheckCircle className="h-4 w-4" />
                          <span>Payment Status</span>
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg" data-testid="select-payment-status">
                              <SelectValue placeholder="Payment status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
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
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <CreditCard className="h-4 w-4" />
                          <span>Payment Method</span>
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg" data-testid="select-payment-method">
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
                        <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="insuranceAuthorization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <FileText className="h-4 w-4" />
                          <span>Authorization #</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Insurance auth number"
                            className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                            data-testid="input-insuranceAuthorization"
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">Optional - Insurance authorization number</FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Coupon Code Section */}
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <Gift className="h-5 w-5 text-green-600" />
                    <h5 className="font-semibold text-green-800">Coupon Code & Discounts</h5>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="couponCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                            <Gift className="h-4 w-4" />
                            <span>Coupon Code</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter coupon code"
                              className="h-12 border-2 border-gray-200 focus:border-green-500 rounded-lg uppercase"
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                              data-testid="input-couponCode"
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">
                            Valid codes: WELCOME10, NEWPATIENT, LOYALTY20, SENIOR15
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-col justify-center">
                      <div className="bg-white p-3 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">Service Fee Breakdown:</p>
                        {selectedServiceType && servicePricing[selectedServiceType] && (
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>{servicePricing[selectedServiceType].description}:</span>
                              <span className="font-medium">${servicePricing[selectedServiceType].fee}</span>
                            </div>
                            {couponCode && availableCoupons[couponCode.toUpperCase()] && (
                              <div className="flex justify-between text-red-600">
                                <span>Coupon ({couponCode}):</span>
                                <span>-${availableCoupons[couponCode.toUpperCase()].type === "percentage" 
                                  ? ((servicePricing[selectedServiceType].fee * availableCoupons[couponCode.toUpperCase()].discount) / 100).toFixed(2)
                                  : availableCoupons[couponCode.toUpperCase()].discount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="border-t pt-1 flex justify-between text-green-600 font-bold">
                              <span>Final Amount:</span>
                              <span>${form.watch("appointmentFee") || 0}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <FileText className="h-5 w-5 text-orange-400 mr-2" />
                    <div>
                      <h4 className="text-orange-800 font-semibold">Medical Details & Notes</h4>
                      <p className="text-orange-700 text-sm">Patient's symptoms, complaints and additional information</p>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="chiefComplaint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                        <Heart className="h-4 w-4" />
                        <span>Chief Complaint</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Patient's primary concern or reason for visit (e.g., blurry vision, eye pain, routine exam)..."
                          className="min-h-[100px] border-2 border-gray-200 focus:border-blue-500 rounded-lg resize-none"
                          data-testid="textarea-complaint"
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-500">
                        Main reason for the appointment from patient's perspective
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                        <Activity className="h-4 w-4" />
                        <span>Current Symptoms</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe any current symptoms, when they started, severity, etc..."
                          className="min-h-[100px] border-2 border-gray-200 focus:border-blue-500 rounded-lg resize-none"
                          data-testid="textarea-symptoms"
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-500">
                        Optional - Detailed symptoms description
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                        <FileText className="h-4 w-4" />
                        <span>Additional Notes</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Additional notes for staff or doctor reference, special instructions, accessibility needs, etc..."
                          className="min-h-[100px] border-2 border-gray-200 focus:border-blue-500 rounded-lg resize-none"
                          data-testid="textarea-notes"
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-500">
                        Optional notes for staff or doctor reference
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="referralSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <User className="h-4 w-4" />
                          <span>Referral Source</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Referring doctor or source"
                            className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                            data-testid="input-referralSource"
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">
                          Optional - Who referred the patient
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <CheckCircle className="h-4 w-4" />
                          <span>Appointment Status</span>
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg" data-testid="select-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="no-show">No Show</SelectItem>
                              <SelectItem value="rescheduled">Rescheduled</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Follow-up Appointment</h4>
                  
                  <div className="flex items-center space-x-3 mb-4">
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
                              className="w-5 h-5 text-orange-600 border-2 border-gray-200 rounded focus:ring-orange-500"
                              data-testid="checkbox-followup"
                            />
                          </FormControl>
                          <FormLabel className="font-semibold text-gray-700">
                            Follow-up Required
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch("followUpRequired") && (
                    <FormField
                      control={form.control}
                      name="followUpDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                            <Calendar className="h-4 w-4" />
                            <span>Follow-up Date</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                              className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                              data-testid="input-followup-date"
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">
                            Suggested date for follow-up appointment
                          </FormDescription>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto" data-testid="modern-appointment-form">
      {/* Header */}
      <DialogHeader className="mb-6 text-center">
        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {editingAppointment ? 'Update Appointment' : 'Schedule New Appointment'}
        </DialogTitle>
        <DialogDescription className="text-gray-600">
          {editingAppointment ? 'Update appointment details' : 'Complete appointment scheduling with information'}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Step Indicator */}
          {renderStepIndicator()}
          
          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Step Content */}
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 bg-gray-50 px-8 py-6 rounded-lg shadow-inner">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 0 ? onCancel : previousStep}
              className="px-8 py-3 border-2 hover:bg-gray-100 transition-colors"
              data-testid="button-previous"
            >
              {currentStep === 0 ? (
                <>Cancel</>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </>
              )}
            </Button>

            <div className="text-center">
              <span className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>

            {currentStep === steps.length - 1 ? (
              <Button
                type="submit"
                disabled={appointmentMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 shadow-lg transition-all"
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
            ) : (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 shadow-lg transition-all"
                data-testid="button-next"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ModernAppointmentForm;