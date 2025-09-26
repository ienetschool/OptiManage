import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Phone,
  Heart,
  Shield,
  Star,
  Eye,
  Glasses,
  CreditCard,
  UserPlus,
  ChevronRight,
  ChevronLeft,
  Check,
  Calendar,
  Mail,
  MapPin,
  Users,
  Activity,
  AlertTriangle,
  FileText,
  Sparkles,
  Zap,
  Globe,
  Building,
  UserCheck,
  RefreshCw,
  QrCode,
  IdCard
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import {
  generatePatientUsername,
  generatePatientPassword,
  generatePatientQRData,
  generatePatientIdCardData,
  formatCredentialsForDisplay
} from "@/utils/patientCredentials";

// Comprehensive Patient Schema with all medical fields
const patientSchema = z.object({
  // Basic Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"], { required_error: "Please select gender" }),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed", "other"]).optional(),
  occupation: z.string().optional(),
  
  // Contact Information
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  address: z.string().min(5, "Address must be at least 5 characters").optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  
  // Emergency Contact
  emergencyContactName: z.string().min(2, "Emergency contact name required").optional(),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone required").optional(),
  emergencyContactRelation: z.enum(["spouse", "parent", "child", "sibling", "friend", "other"]).optional(),
  
  // Medical Information
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
  medicalHistory: z.string().optional(),
  familyHistory: z.string().optional(),
  smokingStatus: z.enum(["never", "current", "former"]).optional(),
  alcoholConsumption: z.enum(["none", "occasional", "moderate", "heavy"]).optional(),
  
  // Eye Care Specific
  lastEyeExam: z.string().optional(),
  currentGlassesRx: z.string().optional(),
  contactLensWearer: z.boolean().default(false),
  eyeConditions: z.string().optional(),
  
  // Insurance & Payment
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  nationalIdNumber: z.string().min(1, "National ID is required"), // Made mandatory
  nisNumber: z.string().optional(),
  insuranceCoupons: z.array(z.object({
    couponType: z.string(),
    couponValue: z.string(),
    validUntil: z.string()
  })).optional(),
  groupNumber: z.string().optional(),
  policyHolderName: z.string().optional(),
  relationToPolicyHolder: z.enum(["self", "spouse", "child", "other"]).optional(),
  
  // Government Voucher System
  voucherType: z.string().optional(),
  voucherNumber: z.string().optional(),
  voucherAmount: z.number().optional(),
  
  // Patient Credentials System
  username: z.string().optional(),
  password: z.string().optional(),
  qrCode: z.string().optional(),
  idCard: z.string().optional(),
  
  // Additional Information
  referredBy: z.string().optional(),
  preferredLanguage: z.string().optional(),
  notes: z.string().optional(),
  consentToTreatment: z.boolean().refine(val => val === true, {
    message: "Consent to treatment is required"
  }),
  hipaaConsent: z.boolean().refine(val => val === true, {
    message: "HIPAA privacy acknowledgment is required"
  }),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface ModernPatientFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editingPatient?: any;
}

// Customizable tab styling configuration


const ModernPatientForm: React.FC<ModernPatientFormProps> = ({ 
  onSuccess, 
  onCancel, 
  editingPatient 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    username: string;
    password: string;
    qrData: string;
    idCardData: string;
  }>({ username: '', password: '', qrData: '', idCardData: '' });

  const steps = [
    {
      title: "Basic Info",
      subtitle: "Personal information",
      icon: User,
      gradient: "from-violet-500 via-purple-500 to-indigo-500",
      bgGradient: "from-violet-50 to-purple-50",
      fields: ["firstName", "lastName", "dateOfBirth", "gender"]
    },
    {
      title: "Contact",
      subtitle: "Contact details",
      icon: Phone,
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      bgGradient: "from-emerald-50 to-teal-50",
      fields: ["phone"]
    },
    {
      title: "Emergency",
      subtitle: "Emergency contacts",
      icon: AlertTriangle,
      gradient: "from-orange-500 via-amber-500 to-yellow-500",
      bgGradient: "from-orange-50 to-amber-50",
      fields: []
    },
    {
      title: "Medical",
      subtitle: "Medical history",
      icon: Heart,
      gradient: "from-rose-500 via-pink-500 to-red-500",
      bgGradient: "from-rose-50 to-pink-50",
      fields: []
    },
    {
      title: "Eye Care",
      subtitle: "Vision history",
      icon: Eye,
      gradient: "from-blue-500 via-indigo-500 to-purple-500",
      bgGradient: "from-blue-50 to-indigo-50",
      fields: []
    },
    {
      title: "Insurance",
      subtitle: "Insurance details",
      icon: Shield,
      gradient: "from-slate-500 via-gray-500 to-zinc-500",
      bgGradient: "from-slate-50 to-gray-50",
      fields: []
    }
  ];

  // Form configuration with enhanced default values
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: editingPatient ? {
      firstName: editingPatient.firstName || "",
      lastName: editingPatient.lastName || "",
      dateOfBirth: editingPatient.dateOfBirth || "",
      gender: editingPatient.gender || "male",
      bloodType: editingPatient.bloodType || undefined,
      maritalStatus: editingPatient.maritalStatus || undefined,
      occupation: editingPatient.occupation || "",
      phone: editingPatient.phone || "",
      email: editingPatient.email || "",
      address: editingPatient.address || "",
      city: editingPatient.city || "",
      state: editingPatient.state || "",
      zipCode: editingPatient.zipCode || "",
      country: editingPatient.country || "USA",
      emergencyContactName: editingPatient.emergencyContactName || "",
      emergencyContactPhone: editingPatient.emergencyContactPhone || "",
      emergencyContactRelation: editingPatient.emergencyContactRelation || "",
      allergies: editingPatient.allergies || "",
      currentMedications: editingPatient.currentMedications || "",
      medicalHistory: editingPatient.medicalHistory || "",
      familyHistory: editingPatient.familyHistory || "",
      smokingStatus: editingPatient.smokingStatus || undefined,
      alcoholConsumption: editingPatient.alcoholConsumption || undefined,
      lastEyeExam: editingPatient.lastEyeExam || "",
      currentGlassesRx: editingPatient.currentGlassesRx || "",
      contactLensWearer: editingPatient.contactLensWearer || false,
      eyeConditions: editingPatient.eyeConditions || "",
      insuranceProvider: editingPatient.insuranceProvider || "",
      insuranceNumber: editingPatient.insuranceNumber || "",
      nationalIdNumber: editingPatient.nationalIdNumber || "",
      nisNumber: editingPatient.nisNumber || "",
      insuranceCoupons: editingPatient.insuranceCoupons || [],
      groupNumber: editingPatient.groupNumber || "",
      policyHolderName: editingPatient.policyHolderName || "",
      relationToPolicyHolder: editingPatient.relationToPolicyHolder || undefined,
      voucherType: editingPatient.voucherType || "",
      voucherNumber: editingPatient.voucherNumber || "",
      voucherAmount: editingPatient.voucherAmount || undefined,
      username: editingPatient.username || "",
      password: editingPatient.password || "",
      qrCode: editingPatient.qrCode || "",
      idCard: editingPatient.idCard || "",
      referredBy: editingPatient.referredBy || "",
      preferredLanguage: editingPatient.preferredLanguage || "English",
      notes: editingPatient.notes || "",
      consentToTreatment: editingPatient.consentToTreatment || false,
      hipaaConsent: editingPatient.hipaaConsent || false,
    } : {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "male",
      bloodType: undefined,
      maritalStatus: undefined,
      occupation: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      allergies: "",
      currentMedications: "",
      medicalHistory: "",
      familyHistory: "",
      smokingStatus: undefined,
      alcoholConsumption: undefined,
      lastEyeExam: "",
      currentGlassesRx: "",
      contactLensWearer: false,
      eyeConditions: "",
      insuranceProvider: "",
      insuranceNumber: "",
      nationalIdNumber: "",
      nisNumber: "",
      insuranceCoupons: [],
      groupNumber: "",
      policyHolderName: "",
      relationToPolicyHolder: undefined,
      voucherType: "",
      voucherNumber: "",
      voucherAmount: undefined,
      username: "",
      password: "",
      qrCode: "",
      idCard: "",
      referredBy: "",
      preferredLanguage: "English",
      notes: "",
      consentToTreatment: false,
      hipaaConsent: false,
    },
  });

  // Auto-generate patient credentials
  const handleGenerateCredentials = () => {
    const firstName = form.getValues('firstName');
    const lastName = form.getValues('lastName');
    
    if (!firstName || !lastName) {
      toast({
        title: "Missing Information",
        description: "Please enter first and last name before generating credentials.",
        variant: "destructive"
      });
      return;
    }

    // Generate username and password
    const username = generatePatientUsername(firstName, lastName);
    const password = generatePatientPassword(12);
    
    // Generate QR code and ID card data
    const patientData = {
      firstName,
      lastName,
      phone: form.getValues('phone'),
      email: form.getValues('email'),
      dateOfBirth: form.getValues('dateOfBirth'),
      bloodType: form.getValues('bloodType'),
      username
    };
    
    const qrData = generatePatientQRData(patientData);
    const idCardData = generatePatientIdCardData(patientData);
    
    // Update form fields
    form.setValue('username', username);
    form.setValue('password', password);
    form.setValue('qrCode', JSON.stringify(qrData));
    form.setValue('idCard', JSON.stringify(idCardData));
    
    // Store generated credentials
    setGeneratedCredentials({
      username,
      password,
      qrData,
      idCardData
    });
    
    toast({
      title: "Credentials Generated",
      description: `Username: ${username} | Password: ${password}`,
    });
  };

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

  // Create/Update patient mutation
  const patientMutation = useMutation({
    mutationFn: async (data: PatientFormData) => {
      const endpoint = editingPatient 
        ? `/api/patients/${editingPatient.id}`
        : "/api/patients";
      const method = editingPatient ? "PATCH" : "POST";
      
      const patientData = {
        ...data,
        patientCode: editingPatient?.patientCode || `PAT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      };
      
      return await apiRequest(method, endpoint, patientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast({
        title: editingPatient ? "Patient Updated" : "Patient Registered",
        description: editingPatient 
          ? "Patient information has been successfully updated."
          : "New patient has been successfully registered.",
        variant: "default",
        duration: 4000,
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error("Patient mutation error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register patient. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const onSubmit = async (data: PatientFormData) => {
    patientMutation.mutate(data);
  };

  // Enhanced step indicator with fixed styling
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

  // Enhanced step rendering with modern cards
  const renderStep = () => {
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
        <Card className={`border-0 shadow-2xl bg-gradient-to-br ${step.bgGradient} backdrop-blur-sm`}>
          <CardContent className="p-8">
            {/* Step header with modern minimalist styling */}
            <div className="flex items-center space-x-3 mb-6">
              <motion.div 
                className={`p-2.5 rounded-xl bg-gradient-to-br ${step.gradient} text-white shadow-md`}
                whileHover={{ scale: 1.05, rotate: 3 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <StepIcon className="h-5 w-5" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm font-medium">{step.subtitle}</p>
              </div>
            </div>

            {/* Step content */}
            <div className="space-y-6">
              {currentStep === 0 && (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 font-medium text-slate-700 text-sm">
                            <User className="h-4 w-4 text-violet-500" />
                            <span>First Name</span>
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter first name" 
                              className="h-12 border-2 border-gray-200 focus:border-violet-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                              data-testid="input-firstName"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 font-medium text-slate-700 text-sm">
                            <User className="h-4 w-4 text-violet-500" />
                            <span>Last Name</span>
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter last name" 
                              className="h-12 border-2 border-gray-200 focus:border-violet-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                              data-testid="input-lastName"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 font-medium text-slate-700 text-sm">
                            <Calendar className="h-4 w-4 text-violet-500" />
                            <span>Date of Birth</span>
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="date"
                              max={new Date().toISOString().split('T')[0]}
                              className="h-12 border-2 border-gray-200 focus:border-violet-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                              data-testid="input-dateOfBirth"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 font-medium text-slate-700 text-sm">
                            <Users className="h-4 w-4 text-violet-500" />
                            <span>Gender</span>
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-violet-500 rounded-xl bg-white/70 backdrop-blur-sm text-base" data-testid="select-gender">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bloodType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                            <Heart className="h-5 w-5 text-red-500" />
                            <span>Blood Group</span>
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-red-500 rounded-xl bg-white/70 backdrop-blur-sm text-base" data-testid="select-bloodType">
                                <SelectValue placeholder="Select blood group" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maritalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                            <Star className="h-5 w-5 text-yellow-500" />
                            <span>Marital Status</span>
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-yellow-500 rounded-xl bg-white/70 backdrop-blur-sm text-base" data-testid="select-maritalStatus">
                                <SelectValue placeholder="Select marital status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="single">Single</SelectItem>
                                <SelectItem value="married">Married</SelectItem>
                                <SelectItem value="divorced">Divorced</SelectItem>
                                <SelectItem value="widowed">Widowed</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                          <Activity className="h-5 w-5 text-blue-500" />
                          <span>Occupation</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter occupation" 
                            className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                            data-testid="input-occupation"
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                            <Phone className="h-5 w-5 text-emerald-500" />
                            <span>Primary Phone</span>
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="(555) 123-4567" 
                              className="h-12 border-2 border-gray-200 focus:border-emerald-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                            <Mail className="h-5 w-5 text-emerald-500" />
                            <span>Email Address</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email"
                              placeholder="patient@example.com" 
                              className="h-12 border-2 border-gray-200 focus:border-emerald-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                          <MapPin className="h-5 w-5 text-emerald-500" />
                          <span>Street Address</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="123 Main Street" 
                            className="h-12 border-2 border-gray-200 focus:border-emerald-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                            data-testid="input-address"
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                            <Building className="h-5 w-5 text-emerald-500" />
                            <span>City</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="City" 
                              className="h-12 border-2 border-gray-200 focus:border-emerald-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                              data-testid="input-city"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                            <Globe className="h-5 w-5 text-emerald-500" />
                            <span>State</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="State" 
                              className="h-12 border-2 border-gray-200 focus:border-emerald-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                              data-testid="input-state"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                            <MapPin className="h-5 w-5 text-emerald-500" />
                            <span>ZIP Code</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="12345" 
                              className="h-12 border-2 border-gray-200 focus:border-emerald-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                              data-testid="input-zipCode"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="emergencyContactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                            <User className="h-5 w-5 text-orange-500" />
                            <span>Emergency Contact Name</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Full name" 
                              className="h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                              data-testid="input-emergencyContactName"
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyContactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                            <Phone className="h-5 w-5 text-orange-500" />
                            <span>Emergency Contact Phone</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="(555) 123-4567" 
                              className="h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                              data-testid="input-emergencyContactPhone"
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="emergencyContactRelation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                          <Users className="h-5 w-5 text-orange-500" />
                          <span>Relationship</span>
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base">
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="spouse">Spouse</SelectItem>
                              <SelectItem value="parent">Parent</SelectItem>
                              <SelectItem value="child">Child</SelectItem>
                              <SelectItem value="sibling">Sibling</SelectItem>
                              <SelectItem value="friend">Friend</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <FormField
                    control={form.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <span>Known Allergies</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="List any known allergies (medications, foods, environmental)..." 
                            className="min-h-[100px] border-2 border-gray-200 focus:border-red-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base resize-none"
                            data-testid="textarea-allergies"
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">Optional - Include severity if known</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentMedications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                          <Heart className="h-5 w-5 text-red-500" />
                          <span>Current Medications</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="List current medications with dosages..." 
                            className="min-h-[100px] border-2 border-gray-200 focus:border-red-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base resize-none"
                            data-testid="textarea-currentMedications"
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">Optional - Include dosage and frequency</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medicalHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                          <FileText className="h-5 w-5 text-red-500" />
                          <span>Medical History</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Previous surgeries, chronic conditions, significant medical events..." 
                            className="min-h-[120px] border-2 border-gray-200 focus:border-red-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base resize-none"
                            data-testid="textarea-medicalHistory"
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">Optional - Include dates if known</FormDescription>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="smokingStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                            <Activity className="h-5 w-5 text-red-500" />
                            <span>Smoking Status</span>
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-red-500 rounded-xl bg-white/70 backdrop-blur-sm text-base" data-testid="select-smokingStatus">
                                <SelectValue placeholder="Select smoking status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="never">Never</SelectItem>
                                <SelectItem value="current">Current</SelectItem>
                                <SelectItem value="former">Former</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="alcoholConsumption"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                            <Activity className="h-5 w-5 text-red-500" />
                            <span>Alcohol Consumption</span>
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-red-500 rounded-xl bg-white/70 backdrop-blur-sm text-base" data-testid="select-alcoholConsumption">
                                <SelectValue placeholder="Select alcohol consumption" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="occasional">Occasional</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="heavy">Heavy</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="lastEyeExam"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                            <Calendar className="h-5 w-5 text-blue-500" />
                            <span>Last Eye Exam</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="date"
                              max={new Date().toISOString().split('T')[0]}
                              className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                              data-testid="input-lastEyeExam"
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactLensWearer"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border-2 border-gray-200 p-4 bg-white/70 backdrop-blur-sm">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-1"
                              data-testid="checkbox-contactLensWearer"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                              <Eye className="h-5 w-5 text-blue-500" />
                              <span>Contact Lens Wearer</span>
                            </FormLabel>
                            <FormDescription className="text-sm text-gray-500">
                              Check if patient currently wears contact lenses
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="currentGlassesRx"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                          <Glasses className="h-5 w-5 text-blue-500" />
                          <span>Current Glasses Prescription</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="OD: SPH -2.00 CYL -0.50 AXIS 180\nOS: SPH -1.75 CYL -0.25 AXIS 175" 
                            className="min-h-[100px] border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base resize-none font-mono"
                            data-testid="textarea-currentGlassesRx"
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">Optional - Include sphere, cylinder, axis for both eyes</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eyeConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                          <Eye className="h-5 w-5 text-blue-500" />
                          <span>Eye Conditions & History</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Any eye conditions, surgeries, or concerns (glaucoma, cataracts, etc.)..." 
                            className="min-h-[100px] border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base resize-none"
                            data-testid="textarea-eyeConditions"
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">Optional - Include family history of eye conditions</FormDescription>
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}

              {currentStep === 5 && (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="insuranceProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                            <Shield className="h-5 w-5 text-slate-500" />
                            <span>Insurance Provider</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g., Blue Cross Blue Shield" 
                              className="h-12 border-2 border-gray-200 focus:border-slate-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                              data-testid="input-insuranceProvider"
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="insuranceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                            <CreditCard className="h-5 w-5 text-slate-500" />
                            <span>Policy Number</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Insurance policy number" 
                              className="h-12 border-2 border-gray-200 focus:border-slate-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                              data-testid="input-insuranceNumber"
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="groupNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                            <Users className="h-5 w-5 text-slate-500" />
                            <span>Group Number</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Insurance group number" 
                              className="h-12 border-2 border-gray-200 focus:border-slate-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                              data-testid="input-groupNumber"
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="policyHolderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                            <User className="h-5 w-5 text-slate-500" />
                            <span>Policy Holder Name</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Name on insurance policy" 
                              className="h-12 border-2 border-gray-200 focus:border-slate-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                              data-testid="input-policyHolderName"
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="nationalIdNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                            <FileText className="h-5 w-5 text-slate-500" />
                            <span>National ID Number</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                               {...field} 
                               placeholder="National ID Number (Required)" 
                               className="h-12 border-2 border-red-200 focus:border-red-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                               data-testid="input-nationalIdNumber"
                             />
                           </FormControl>
                           <FormDescription className="text-sm text-red-600">Required field</FormDescription>
                         </FormItem>
                       )}
                     />
                   </div>

                   <FormField
                     control={form.control}
                     name="relationToPolicyHolder"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                           <UserCheck className="h-5 w-5 text-slate-500" />
                           <span>Relationship to Policy Holder</span>
                         </FormLabel>
                         <FormControl>
                           <Select onValueChange={field.onChange} value={field.value}>
                             <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-slate-500 rounded-xl bg-white/70 backdrop-blur-sm text-base" data-testid="select-relationToPolicyHolder">
                               <SelectValue placeholder="Select relationship" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="self">Self</SelectItem>
                               <SelectItem value="spouse">Spouse</SelectItem>
                               <SelectItem value="child">Child</SelectItem>
                               <SelectItem value="other">Other</SelectItem>
                             </SelectContent>
                           </Select>
                         </FormControl>
                         <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                       </FormItem>
                     )}
                   />

                   {/* Government Voucher System */}
                   <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 space-y-4">
                     <h4 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                       <CreditCard className="h-5 w-5 text-green-500" />
                       <span>Government Voucher System</span>
                     </h4>
                     
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <FormField
                         control={form.control}
                         name="voucherType"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                               <Star className="h-5 w-5 text-green-500" />
                               <span>Voucher Type</span>
                             </FormLabel>
                             <FormControl>
                               <Select onValueChange={field.onChange} value={field.value}>
                                 <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-green-500 rounded-xl bg-white/70 backdrop-blur-sm text-base">
                                   <SelectValue placeholder="Select voucher type" />
                                 </SelectTrigger>
                                 <SelectContent>
                                   <SelectItem value="senior">Senior Citizen</SelectItem>
                                   <SelectItem value="disability">Disability</SelectItem>
                                   <SelectItem value="low-income">Low Income</SelectItem>
                                   <SelectItem value="veteran">Veteran</SelectItem>
                                   <SelectItem value="student">Student</SelectItem>
                                   <SelectItem value="other">Other</SelectItem>
                                 </SelectContent>
                               </Select>
                             </FormControl>
                             <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                           </FormItem>
                         )}
                       />

                       <FormField
                         control={form.control}
                         name="voucherNumber"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                               <FileText className="h-5 w-5 text-green-500" />
                               <span>Voucher Number</span>
                             </FormLabel>
                             <FormControl>
                               <Input 
                                 {...field} 
                                 placeholder="Voucher reference number" 
                                 className="h-12 border-2 border-gray-200 focus:border-green-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                                 data-testid="input-voucherNumber"
                               />
                             </FormControl>
                             <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                           </FormItem>
                         )}
                       />

                       <FormField
                         control={form.control}
                         name="voucherAmount"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                               <CreditCard className="h-5 w-5 text-green-500" />
                               <span>Voucher Amount</span>
                             </FormLabel>
                             <FormControl>
                               <Input 
                                 {...field} 
                                 type="number"
                                 placeholder="0.00" 
                                 className="h-12 border-2 border-gray-200 focus:border-green-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                                 data-testid="input-voucherAmount"
                                 onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                               />
                             </FormControl>
                             <FormDescription className="text-sm text-gray-500">Optional - Amount in dollars</FormDescription>
                           </FormItem>
                         )}
                       />
                     </div>
                   </div>

                   {/* Patient Credentials System */}
                   <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 space-y-4">
                     <div className="flex items-center justify-between">
                       <h4 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                         <UserCheck className="h-5 w-5 text-blue-500" />
                         <span>Patient Credentials (Auto-Generated)</span>
                       </h4>
                       <Button
                         type="button"
                         onClick={handleGenerateCredentials}
                         className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                       >
                         <RefreshCw className="h-4 w-4" />
                         <span>Generate</span>
                       </Button>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <FormField
                         control={form.control}
                         name="username"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                               <User className="h-5 w-5 text-blue-500" />
                               <span>Username</span>
                             </FormLabel>
                             <FormControl>
                               <Input 
                                 {...field} 
                                 placeholder="Auto-generated username" 
                                 className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-gray-50 backdrop-blur-sm transition-all duration-200 text-base"
                                 data-testid="input-username"
                                 readOnly
                                 value={generatedCredentials?.username || field.value || ''}
                               />
                             </FormControl>
                             <FormDescription className="text-sm text-gray-500">Auto-generated based on patient name</FormDescription>
                           </FormItem>
                         )}
                       />

                       <FormField
                         control={form.control}
                         name="password"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                               <Shield className="h-5 w-5 text-blue-500" />
                               <span>Password</span>
                             </FormLabel>
                             <FormControl>
                               <Input 
                                 {...field} 
                                 type="password"
                                 placeholder="Auto-generated password" 
                                 className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                                 data-testid="input-password"
                                 value={generatedCredentials?.password || field.value || ''}
                               />
                             </FormControl>
                             <FormDescription className="text-sm text-gray-500">Can be edited after generation</FormDescription>
                           </FormItem>
                         )}
                       />
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <FormField
                         control={form.control}
                         name="qrCode"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                               <Zap className="h-5 w-5 text-blue-500" />
                               <span>QR Code</span>
                             </FormLabel>
                             <FormControl>
                               <Input 
                                 {...field} 
                                 placeholder="QR code will be generated" 
                                 className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-gray-50 backdrop-blur-sm transition-all duration-200 text-base"
                                 data-testid="input-qrCode"
                                 readOnly
                                 value={field.value || (generatedCredentials?.qrData ? JSON.stringify(generatedCredentials.qrData) : '')}
                               />
                             </FormControl>
                             <FormDescription className="text-sm text-gray-500">Auto-generated QR code for patient access</FormDescription>
                           </FormItem>
                         )}
                       />

                       <FormField
                         control={form.control}
                         name="idCard"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                               <CreditCard className="h-5 w-5 text-blue-500" />
                               <span>ID Card</span>
                             </FormLabel>
                             <FormControl>
                               <Input 
                                 {...field} 
                                 placeholder="Digital ID card reference" 
                                 className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-gray-50 backdrop-blur-sm transition-all duration-200 text-base"
                                 data-testid="input-idCard"
                                 readOnly
                                 value={field.value || (generatedCredentials?.idCardData ? JSON.stringify(generatedCredentials.idCardData) : '')}
                               />
                             </FormControl>
                             <FormDescription className="text-sm text-gray-500">Digital ID card for patient identification</FormDescription>
                           </FormItem>
                         )}
                       />
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField
                       control={form.control}
                       name="referredBy"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                             <Users className="h-5 w-5 text-slate-500" />
                             <span>Referred By</span>
                           </FormLabel>
                           <FormControl>
                             <Input 
                               {...field} 
                               placeholder="Doctor, friend, or referral source" 
                               className="h-12 border-2 border-gray-200 focus:border-slate-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                               data-testid="input-referredBy"
                             />
                           </FormControl>
                           <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                         </FormItem>
                       )}
                     />

                     <FormField
                       control={form.control}
                       name="preferredLanguage"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                             <Globe className="h-5 w-5 text-slate-500" />
                             <span>Preferred Language</span>
                           </FormLabel>
                           <FormControl>
                             <Input 
                               {...field} 
                               placeholder="English, Spanish, etc." 
                               className="h-12 border-2 border-gray-200 focus:border-slate-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base"
                               data-testid="input-preferredLanguage"
                             />
                           </FormControl>
                           <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                         </FormItem>
                       )}
                     />
                   </div>

                   <FormField
                     control={form.control}
                     name="notes"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className="flex items-center space-x-2 font-semibold text-gray-700 text-base">
                           <FileText className="h-5 w-5 text-slate-500" />
                           <span>Additional Notes</span>
                         </FormLabel>
                         <FormControl>
                           <Textarea 
                             {...field} 
                             placeholder="Any additional information about the patient..." 
                             className="min-h-[100px] border-2 border-gray-200 focus:border-slate-500 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 text-base resize-none"
                             data-testid="textarea-notes"
                           />
                         </FormControl>
                         <FormDescription className="text-sm text-gray-500">Optional notes for staff reference</FormDescription>
                       </FormItem>
                     )}
                   />

                   {/* Consent Forms */}
                   <div className="bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200 rounded-2xl p-6 space-y-4">
                     <h4 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                       <Shield className="h-5 w-5 text-slate-500" />
                       <span>Consent Forms</span>
                     </h4>
                     
                     <FormField
                       control={form.control}
                       name="consentToTreatment"
                       render={({ field }) => (
                         <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border-2 border-red-200 p-4 bg-red-50/70 backdrop-blur-sm">
                           <FormControl>
                             <Checkbox
                               checked={field.value}
                               onCheckedChange={field.onChange}
                               className="mt-1 border-red-300 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                               data-testid="checkbox-consentToTreatment"
                               required
                             />
                           </FormControl>
                           <div className="space-y-1 leading-none">
                             <FormLabel className="font-semibold text-red-700 text-base">
                               Consent to Treatment <span className="text-red-500">*</span>
                             </FormLabel>
                             <FormDescription className="text-sm text-red-600">
                               I consent to receive medical treatment and examination by the doctors and staff at this practice. (Required)
                             </FormDescription>
                             <FormMessage />
                           </div>
                         </FormItem>
                       )}
                     />

                     <FormField
                       control={form.control}
                       name="hipaaConsent"
                       render={({ field }) => (
                         <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border-2 border-red-200 p-4 bg-red-50/70 backdrop-blur-sm">
                           <FormControl>
                             <Checkbox
                               checked={field.value}
                               onCheckedChange={field.onChange}
                               className="mt-1 border-red-300 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                               data-testid="checkbox-hipaaConsent"
                               required
                             />
                           </FormControl>
                           <div className="space-y-1 leading-none">
                             <FormLabel className="font-semibold text-red-700 text-base">
                               HIPAA Privacy Acknowledgment <span className="text-red-500">*</span>
                             </FormLabel>
                             <FormDescription className="text-sm text-red-600">
                               I acknowledge that I have been provided with information about the practice's privacy policies. (Required)
                             </FormDescription>
                             <FormMessage />
                           </div>
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
     <div className="w-full max-w-5xl mx-auto" data-testid="modern-patient-form">
       {/* Enhanced Header */}
       <motion.div 
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
         className="mb-6"
       >
         <DialogHeader>
           {/* Title and Tabs in single row */}
           <div className="flex items-center justify-between mb-4">
             <motion.div 
               className="p-2.5 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg flex items-center gap-3"
               whileHover={{ scale: 1.05, rotate: 5 }}
               transition={{ type: "spring", stiffness: 300 }}
             >
               <UserPlus className="h-5 w-5" />
               <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-gray-700 to-slate-600 bg-clip-text text-transparent">
                 {editingPatient ? 'Update Patient Information' : 'Register New Patient'}
               </DialogTitle>
             </motion.div>
             
             {/* Compact Step Indicator */}
             <div className="flex-1 max-w-md ml-8">
               {renderStepIndicator()}
             </div>
           </div>
         </DialogHeader>
       </motion.div>

       <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

           
           {/* Enhanced Progress Bar */}
           {renderProgressBar()}

           {/* Step Content with Animation */}
           <AnimatePresence mode="wait">
             {renderStep()}
           </AnimatePresence>

           {/* Enhanced Navigation Buttons */}
           <motion.div 
             className="flex justify-between items-center pt-8 bg-gradient-to-r from-gray-50 via-white to-gray-50 px-8 py-6 rounded-2xl shadow-lg border border-gray-200"
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
                 data-testid="button-previous"
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
                   type="button"
                   onClick={(e) => {
                     e.preventDefault();
                     const formData = form.getValues();
                     onSubmit(formData);
                   }}
                   disabled={patientMutation.isPending}
                   className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white px-8 py-3 h-12 shadow-lg transition-all duration-200 rounded-xl text-base font-semibold"
                   data-testid="button-submit"
                 >
                   {patientMutation.isPending ? (
                     <>
                       <motion.div 
                         className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                         animate={{ rotate: 360 }}
                         transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                       />
                       <span>{editingPatient ? 'Updating...' : 'Registering...'}</span>
                     </>
                   ) : (
                     <>
                       <UserPlus className="h-5 w-5 mr-2" />
                       <span>{editingPatient ? 'Update Patient' : 'Register Patient'}</span>
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
                   className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white px-8 py-3 h-12 shadow-lg transition-all duration-200 rounded-xl text-base font-semibold"
                   data-testid="button-next"
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

export default ModernPatientForm;