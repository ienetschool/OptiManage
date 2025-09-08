import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Heart, 
  Shield, 
  FileText, 
  CheckCircle,
  ChevronRight,
  UserPlus,
  Stethoscope,
  CreditCard,
  AlertTriangle,
  Star,
  Clock,
  UserCheck,
  Users,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  Clipboard
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Enhanced Patient Schema matching the screenshots exactly
const comprehensivePatientSchema = z.object({
  // Basic Information
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50, "First name too long"),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50, "Last name too long"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"], { required_error: "Please select a gender" }),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], { required_error: "Please select blood group" }).optional(),
  
  // Contact Information
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number too long"),
  email: z.string().email("Please enter a valid email address").optional(),
  address: z.string().min(5, "Address must be at least 5 characters").max(500, "Address too long"),
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone is required"),
  
  // Portal Access Credentials
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  
  // Medical Information
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
  medicalHistory: z.string().optional(),
  familyMedicalHistory: z.string().optional(),
  previousEyeConditions: z.string().optional(),
  
  // Insurance Information
  insuranceProvider: z.string().optional(),
  policyNumber: z.string().optional(),
  nationalIdNumber: z.string().optional(),
  nisNumber: z.string().optional(),
  insuranceCoupons: z.array(z.string()).optional(),
  
  // Loyalty Information
  loyaltyTier: z.enum(["bronze", "silver", "gold", "platinum"]).optional(),
  loyaltyPoints: z.number().default(0),
  membershipDate: z.string().optional(),
  
  // Additional Notes
  notes: z.string().optional(),
  patientCode: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ComprehensivePatientFormData = z.infer<typeof comprehensivePatientSchema>;

interface ComprehensivePatientFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editingPatient?: any;
}

const ComprehensivePatientForm: React.FC<ComprehensivePatientFormProps> = ({ 
  onSuccess, 
  onCancel, 
  editingPatient 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [autoGenerateUsername, setAutoGenerateUsername] = useState(true);
  const [insuranceCoupons, setInsuranceCoupons] = useState<string[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form configuration
  const form = useForm<ComprehensivePatientFormData>({
    resolver: zodResolver(comprehensivePatientSchema),
    defaultValues: editingPatient ? {
      firstName: editingPatient.firstName || "",
      lastName: editingPatient.lastName || "",
      dateOfBirth: editingPatient.dateOfBirth || "",
      gender: editingPatient.gender || "male",
      bloodGroup: editingPatient.bloodGroup || undefined,
      phone: editingPatient.phone || "",
      email: editingPatient.email || "",
      address: editingPatient.address || "",
      emergencyContactName: editingPatient.emergencyContactName || "",
      emergencyContactPhone: editingPatient.emergencyContactPhone || "",
      username: editingPatient.username || "",
      password: editingPatient.password || "",
      allergies: editingPatient.allergies || "",
      currentMedications: editingPatient.currentMedications || "",
      medicalHistory: editingPatient.medicalHistory || "",
      familyMedicalHistory: editingPatient.familyMedicalHistory || "",
      previousEyeConditions: editingPatient.previousEyeConditions || "",
      insuranceProvider: editingPatient.insuranceProvider || "",
      policyNumber: editingPatient.policyNumber || "",
      nationalIdNumber: editingPatient.nationalIdNumber || "",
      nisNumber: editingPatient.nisNumber || "",
      loyaltyTier: editingPatient.loyaltyTier || "bronze",
      loyaltyPoints: editingPatient.loyaltyPoints || 0,
      membershipDate: editingPatient.membershipDate || new Date().toISOString().split('T')[0],
      notes: editingPatient.notes || "",
      patientCode: editingPatient.patientCode || "",
      isActive: editingPatient.isActive !== false,
    } : {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "male",
      phone: "",
      email: "",
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      username: "",
      password: "",
      allergies: "",
      currentMedications: "",
      medicalHistory: "",
      familyMedicalHistory: "",
      previousEyeConditions: "",
      insuranceProvider: "",
      policyNumber: "",
      nationalIdNumber: "",
      nisNumber: "",
      loyaltyTier: "bronze",
      loyaltyPoints: 0,
      membershipDate: new Date().toISOString().split('T')[0],
      notes: "",
      patientCode: "",
      isActive: true,
    },
  });

  // Step definitions matching the screenshots
  const steps = [
    {
      id: "basic",
      title: "Basic Info",
      icon: User,
      description: "Personal information",
      fields: ["firstName", "lastName", "dateOfBirth", "gender", "bloodGroup"],
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: "contact",
      title: "Contact",
      icon: Phone,
      description: "Contact details and portal access",
      fields: ["phone", "email", "address", "emergencyContactName", "emergencyContactPhone", "username", "password"],
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      id: "medical",
      title: "Medical",
      icon: Stethoscope,
      description: "Medical history and conditions",
      fields: ["allergies", "currentMedications", "medicalHistory", "familyMedicalHistory", "previousEyeConditions"],
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      id: "insurance",
      title: "Insurance",
      icon: Shield,
      description: "Insurance and identification",
      fields: ["insuranceProvider", "policyNumber", "nationalIdNumber", "nisNumber"],
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      id: "loyalty",
      title: "Loyalty",
      icon: Star,
      description: "Membership and loyalty information",
      fields: ["loyaltyTier", "loyaltyPoints", "membershipDate"],
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    }
  ];

  // Create patient mutation
  const createPatientMutation = useMutation({
    mutationFn: (data: ComprehensivePatientFormData) => {
      const endpoint = editingPatient ? `/api/patients/${editingPatient.id}` : "/api/patients";
      const method = editingPatient ? "PATCH" : "POST";
      
      // Auto-generate patient code if not provided
      if (!data.patientCode) {
        data.patientCode = `PT${Date.now().toString().slice(-6)}`;
      }
      
      return apiRequest(endpoint, method, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({
        title: "✅ Success!",
        description: `Patient has been successfully ${editingPatient ? 'updated' : 'registered'}.`,
        duration: 3000,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || `Failed to ${editingPatient ? 'update' : 'register'} patient. Please try again.`,
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  // Calculate progress percentage
  const calculateProgress = () => {
    const stepProgress = (currentStep / steps.length) * 100;
    const completedProgress = (completedSteps.length / steps.length) * 100;
    return Math.min(100, Math.max(stepProgress, completedProgress));
  };

  // Validate current step
  const validateCurrentStep = async () => {
    const currentStepData = steps[currentStep];
    if (!currentStepData) return false;

    const result = await form.trigger(currentStepData.fields as any);
    if (result && !completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    return result;
  };

  // Navigate to next step
  const goToNextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  // Navigate to previous step
  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Auto-generate username
  const generateUsername = () => {
    const firstName = form.getValues("firstName");
    const lastName = form.getValues("lastName");
    if (firstName && lastName) {
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`;
      form.setValue("username", username);
    }
  };

  // Auto-generate username when name changes
  useEffect(() => {
    if (autoGenerateUsername) {
      generateUsername();
    }
  }, [form.watch("firstName"), form.watch("lastName"), autoGenerateUsername]);

  // Submit form
  const onSubmit = async (data: ComprehensivePatientFormData) => {
    data.insuranceCoupons = insuranceCoupons;
    createPatientMutation.mutate(data);
  };

  // Add insurance coupon
  const addInsuranceCoupon = () => {
    const newCoupon = `COUPON-${Date.now().toString().slice(-6)}`;
    setInsuranceCoupons(prev => [...prev, newCoupon]);
  };

  // Remove insurance coupon
  const removeInsuranceCoupon = (index: number) => {
    setInsuranceCoupons(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6" data-testid="comprehensive-patient-form">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <DialogHeader>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex items-center justify-center space-x-2"
          >
            <UserPlus className="h-8 w-8 text-blue-600" />
            <DialogTitle className="text-3xl font-bold text-gray-900">
              {editingPatient ? 'Edit Patient' : 'Register New Patient'}
            </DialogTitle>
          </motion.div>
          <DialogDescription className="text-lg text-gray-600">
            Complete patient registration with comprehensive medical information
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{Math.round(calculateProgress())}% Complete</span>
          </div>
          <Progress 
            value={calculateProgress()} 
            className="h-3 bg-gray-200"
            data-testid="progress-bar"
          />
        </div>
      </motion.div>

      {/* Step Indicators */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.includes(index);
            const isCurrent = currentStep === index;
            const isActive = index <= currentStep;
            
            return (
              <React.Fragment key={step.id}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all duration-300 min-w-[100px]
                    ${isCurrent ? 'bg-blue-100 border-2 border-blue-500 shadow-md' : ''}
                    ${isCompleted ? 'bg-green-100 border-2 border-green-500' : ''}
                    ${!isActive ? 'opacity-50' : ''}
                  `}
                  onClick={() => {
                    if (isActive || isCompleted) {
                      setCurrentStep(index);
                    }
                  }}
                  data-testid={`step-indicator-${step.id}`}
                >
                  <div className={`
                    p-2 rounded-full transition-all duration-300
                    ${isCompleted ? 'bg-green-500 text-white' : 
                      isCurrent ? 'bg-blue-500 text-white' : 
                      'bg-gray-200 text-gray-500'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`text-xs font-medium mt-1 text-center ${
                    isCurrent ? 'text-blue-700' : 
                    isCompleted ? 'text-green-700' : 
                    'text-gray-600'
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
                    // Basic Information Step
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-1 font-medium text-red-600">
                              <span>First Name</span>
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Enter first name" 
                                className="h-12 border-2"
                                data-testid="input-firstName" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-1 font-medium text-red-600">
                              <span>Last Name</span>
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Enter last name" 
                                className="h-12 border-2"
                                data-testid="input-lastName" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-1 font-medium text-red-600">
                              <span>Date of Birth</span>
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="date" 
                                placeholder="dd/mm/yyyy"
                                className="h-12 border-2"
                                data-testid="input-dateOfBirth"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-1 font-medium text-red-600">
                              <span>Gender</span>
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 border-2" data-testid="select-gender">
                                  <SelectValue placeholder="Male" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bloodGroup"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="font-medium text-blue-600">Blood Group</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 border-2" data-testid="select-bloodGroup">
                                  <SelectValue placeholder="Select blood group" />
                                </SelectTrigger>
                              </FormControl>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {currentStep === 1 && (
                    // Contact Information Step
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-1 font-medium text-red-600">
                                <span>Phone Number</span>
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Enter phone number" 
                                  className="h-12 border-2"
                                  data-testid="input-phone"
                                />
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
                              <FormLabel className="font-medium">Email Address</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="email" 
                                  placeholder="Enter email address" 
                                  className="h-12 border-2"
                                  data-testid="input-email"
                                />
                              </FormControl>
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
                            <FormLabel className="font-medium">Address</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Enter full address" 
                                className="min-h-[80px] border-2"
                                data-testid="textarea-address"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="emergencyContactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">Emergency Contact Name</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Enter emergency contact name" 
                                  className="h-12 border-2"
                                  data-testid="input-emergencyContactName"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="emergencyContactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">Emergency Contact Phone</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Enter emergency contact phone" 
                                  className="h-12 border-2"
                                  data-testid="input-emergencyContactPhone"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Portal Access Credentials */}
                      <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                        <div className="flex items-center space-x-2 mb-4">
                          <User className="h-5 w-5 text-blue-600" />
                          <h4 className="text-lg font-semibold text-blue-700">Portal Access Credentials</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-medium">Username</FormLabel>
                                <div className="flex space-x-2">
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      placeholder="Auto-generated username" 
                                      className="h-12 border-2"
                                      data-testid="input-username"
                                      disabled={autoGenerateUsername}
                                    />
                                  </FormControl>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setAutoGenerateUsername(!autoGenerateUsername);
                                      if (!autoGenerateUsername) {
                                        generateUsername();
                                      }
                                    }}
                                    className="p-3"
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                </div>
                                <FormDescription className="text-xs">
                                  Auto-generates on registration. Fill First Name, Last Name, and 
                                  Email, then click the refresh icon to preview, or leave blank for auto-generation.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-medium">Password</FormLabel>
                                <div className="relative">
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      type={showPassword ? "text" : "password"}
                                      placeholder="Enter portal password" 
                                      className="h-12 border-2 pr-10"
                                      data-testid="input-password"
                                    />
                                  </FormControl>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                    onClick={() => setShowPassword(!showPassword)}
                                  >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                                <FormDescription className="text-xs">
                                  Minimum 8 characters for portal access
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    // Medical Information Step
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        <FormField
                          control={form.control}
                          name="allergies"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">Allergies</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="List any known allergies..." 
                                  className="min-h-[80px] border-2"
                                  data-testid="textarea-allergies"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="currentMedications"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">Current Medications</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="List current medications..." 
                                  className="min-h-[80px] border-2"
                                  data-testid="textarea-currentMedications"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="medicalHistory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">Medical History</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Describe medical history..." 
                                  className="min-h-[80px] border-2"
                                  data-testid="textarea-medicalHistory"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="familyMedicalHistory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">Family Medical History</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Describe family medical history..." 
                                  className="min-h-[80px] border-2"
                                  data-testid="textarea-familyMedicalHistory"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="previousEyeConditions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">Previous Eye Conditions</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Describe any previous eye conditions or surgeries..." 
                                  className="min-h-[80px] border-2"
                                  data-testid="textarea-previousEyeConditions"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    // Insurance Information Step
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="insuranceProvider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">Insurance Provider</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Enter insurance provider" 
                                  className="h-12 border-2"
                                  data-testid="input-insuranceProvider"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="policyNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">Policy Number</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Enter policy number" 
                                  className="h-12 border-2"
                                  data-testid="input-policyNumber"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="nationalIdNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">National ID Number</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Enter national ID number" 
                                  className="h-12 border-2"
                                  data-testid="input-nationalIdNumber"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="nisNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">NIS Number</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Enter NIS number" 
                                  className="h-12 border-2"
                                  data-testid="input-nisNumber"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Insurance Coupons & Benefits */}
                      <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Clipboard className="h-5 w-5 text-green-600" />
                            <h4 className="text-lg font-semibold text-green-700">Insurance Coupons & Benefits</h4>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addInsuranceCoupon}
                            className="text-green-600 border-green-300"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Insurance Coupon
                          </Button>
                        </div>
                        
                        <p className="text-sm text-green-600 mb-4">
                          Add insurance coupons, government subsidies, or special benefits available to this patient.
                        </p>

                        {insuranceCoupons.length > 0 && (
                          <div className="space-y-2">
                            {insuranceCoupons.map((coupon, index) => (
                              <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                                <span className="text-sm font-medium">{coupon}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeInsuranceCoupon(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {insuranceCoupons.length === 0 && (
                          <div className="text-center py-4 text-gray-500">
                            No insurance coupons added yet
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    // Loyalty Information Step
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="loyaltyTier"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">Loyalty Tier</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12 border-2" data-testid="select-loyaltyTier">
                                    <SelectValue placeholder="Select tier" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="bronze">🥉 Bronze</SelectItem>
                                  <SelectItem value="silver">🥈 Silver</SelectItem>
                                  <SelectItem value="gold">🥇 Gold</SelectItem>
                                  <SelectItem value="platinum">💎 Platinum</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="loyaltyPoints"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">Loyalty Points</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number"
                                  placeholder="0" 
                                  className="h-12 border-2"
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  data-testid="input-loyaltyPoints"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="membershipDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">Membership Date</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="date" 
                                  className="h-12 border-2"
                                  data-testid="input-membershipDate"
                                />
                              </FormControl>
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
                            <FormLabel className="font-medium">Additional Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Any additional information, special requirements, or notes about the patient..."
                                className="min-h-[120px] border-2"
                                data-testid="textarea-notes"
                              />
                            </FormControl>
                            <FormDescription>
                              Include any special considerations, preferences, or additional information
                            </FormDescription>
                            <FormMessage />
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
          <div className="flex justify-between items-center pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 0 ? onCancel : goToPrevStep}
              className="flex items-center space-x-2"
              data-testid="button-previous"
            >
              {currentStep === 0 ? "Cancel" : "Previous"}
            </Button>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                data-testid="button-cancel"
              >
                Cancel
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={goToNextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
                  data-testid="button-next"
                >
                  <span>Next: {steps[currentStep + 1].title}</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={createPatientMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
                  data-testid="button-submit"
                >
                  {createPatientMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{editingPatient ? 'Updating...' : 'Registering...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>{editingPatient ? 'Update Patient' : 'Register Patient'}</span>
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

export default ComprehensivePatientForm;