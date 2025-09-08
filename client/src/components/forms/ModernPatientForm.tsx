import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  FileText
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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
  emergencyContactRelation: z.string().optional(),
  
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
  nationalIdNumber: z.string().optional(),
  nisNumber: z.string().optional(),
  insuranceCoupons: z.array(z.object({
    couponType: z.string(),
    couponValue: z.string(),
    validUntil: z.string()
  })).optional(),
  groupNumber: z.string().optional(),
  policyHolderName: z.string().optional(),
  relationToPolicyHolder: z.enum(["self", "spouse", "child", "other"]).optional(),
  
  // Additional Information
  referredBy: z.string().optional(),
  preferredLanguage: z.string().optional(),
  notes: z.string().optional(),
  consentToTreatment: z.boolean().default(false),
  hipaaConsent: z.boolean().default(false),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface ModernPatientFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editingPatient?: any;
}

const ModernPatientForm: React.FC<ModernPatientFormProps> = ({ 
  onSuccess, 
  onCancel, 
  editingPatient 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps = [
    {
      title: "Basic Info",
      subtitle: "Personal information",
      icon: User,
      color: "from-blue-500 to-blue-600",
      fields: ["firstName", "lastName", "dateOfBirth", "gender"]
    },
    {
      title: "Contact",
      subtitle: "Contact details",
      icon: Phone,
      color: "from-green-500 to-green-600", 
      fields: ["phone"]
    },
    {
      title: "Emergency",
      subtitle: "Emergency contacts",
      icon: AlertTriangle,
      color: "from-orange-500 to-orange-600",
      fields: []
    },
    {
      title: "Medical",
      subtitle: "Medical history",
      icon: Heart,
      color: "from-red-500 to-red-600",
      fields: []
    },
    {
      title: "Eye Care",
      subtitle: "Vision history",
      icon: Eye,
      color: "from-purple-500 to-purple-600",
      fields: []
    },
    {
      title: "Insurance",
      subtitle: "Insurance details",
      icon: Shield,
      color: "from-indigo-500 to-indigo-600",
      fields: []
    }
  ];

  // Form configuration
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
      referredBy: "",
      preferredLanguage: "English",
      notes: "",
      consentToTreatment: false,
      hipaaConsent: false,
    },
  });

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
        patientCode: editingPatient?.patientCode || `PAT-${Date.now()}`,
      };
      
      return apiRequest(method, endpoint, patientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "✅ Success!",
        description: `Patient has been ${editingPatient ? 'updated' : 'registered'} successfully.`,
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

  const onSubmit = async (data: PatientFormData) => {
    console.log("Form submission started", data);
    
    // Skip validation for now and submit directly
    console.log("Submitting patient data...");
    patientMutation.mutate(data);
  };

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
                <span className={`text-xs mt-1 font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
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
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <User className="h-4 w-4" />
                          <span>First Name</span>
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter first name" 
                            className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
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
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <User className="h-4 w-4" />
                          <span>Last Name</span>
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter last name" 
                            className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
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
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <Calendar className="h-4 w-4" />
                          <span>Date of Birth</span>
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="date"
                            max={new Date().toISOString().split('T')[0]}
                            className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
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
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <Users className="h-4 w-4" />
                          <span>Gender</span>
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg" data-testid="select-gender">
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
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <Heart className="h-4 w-4" />
                          <span>Blood Group</span>
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg" data-testid="select-bloodType">
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
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <Star className="h-4 w-4" />
                          <span>Marital Status</span>
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg" data-testid="select-maritalStatus">
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
                      <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                        <Activity className="h-4 w-4" />
                        <span>Occupation</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter occupation" 
                          className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                          data-testid="input-occupation"
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                    </FormItem>
                  )}
                />
              </>
            )}

            {currentStep === 1 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <Phone className="h-4 w-4" />
                          <span>Phone Number</span>
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="(555) 123-4567" 
                            className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
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
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <Mail className="h-4 w-4" />
                          <span>Email Address</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email"
                            placeholder="john@example.com" 
                            className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
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
                      <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                        <MapPin className="h-4 w-4" />
                        <span>Address</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Enter complete street address..."
                          className="min-h-[80px] border-2 border-gray-200 focus:border-blue-500 rounded-lg resize-none"
                          data-testid="textarea-address"
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-500">Optional - Street address with apartment/unit number</FormDescription>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-gray-700">City</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="City" 
                            className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
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
                        <FormLabel className="font-semibold text-gray-700">State</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="State" 
                            className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
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
                        <FormLabel className="font-semibold text-gray-700">ZIP Code</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="12345" 
                            className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                            data-testid="input-zipCode"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-orange-400 mr-2" />
                    <div>
                      <h4 className="text-orange-800 font-semibold">Emergency Contact Information</h4>
                      <p className="text-orange-700 text-sm">Please provide someone we can contact in case of emergency</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="emergencyContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <User className="h-4 w-4" />
                          <span>Contact Name</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Full name" 
                            className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                            data-testid="input-emergencyContactName"
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">Optional but recommended</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <Phone className="h-4 w-4" />
                          <span>Contact Phone</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="(555) 123-4567" 
                            className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                            data-testid="input-emergencyContactPhone"
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">Optional but recommended</FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="emergencyContactRelation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                        <Users className="h-4 w-4" />
                        <span>Relationship</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., Spouse, Parent, Sibling, Friend" 
                          className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                          data-testid="input-emergencyContactRelation"
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-500">Optional - Relationship to patient</FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <Heart className="h-5 w-5 text-red-400 mr-2" />
                    <div>
                      <h4 className="text-red-800 font-semibold">Medical History</h4>
                      <p className="text-red-700 text-sm">Please provide detailed medical information for proper care</p>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Allergies</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="List any known allergies (medications, food, environmental). Include severity and reactions..."
                          className="min-h-[100px] border-2 border-gray-200 focus:border-blue-500 rounded-lg resize-none"
                          data-testid="textarea-allergies"
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-500">Important for safe treatment</FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentMedications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                        <Activity className="h-4 w-4" />
                        <span>Current Medications</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="List all current medications, dosages, and frequency. Include prescription and over-the-counter medications..."
                          className="min-h-[100px] border-2 border-gray-200 focus:border-blue-500 rounded-lg resize-none"
                          data-testid="textarea-currentMedications"
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-500">Include supplements and vitamins</FormDescription>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="smokingStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-gray-700">Smoking Status</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg" data-testid="select-smokingStatus">
                              <SelectValue placeholder="Select smoking status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="never">Never smoked</SelectItem>
                              <SelectItem value="former">Former smoker</SelectItem>
                              <SelectItem value="current">Current smoker</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alcoholConsumption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-gray-700">Alcohol Consumption</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg" data-testid="select-alcoholConsumption">
                              <SelectValue placeholder="Select alcohol usage" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="occasional">Occasional</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="heavy">Heavy</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="medicalHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                        <FileText className="h-4 w-4" />
                        <span>Medical History</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Previous surgeries, chronic conditions, significant medical events, hospitalizations..."
                          className="min-h-[100px] border-2 border-gray-200 focus:border-blue-500 rounded-lg resize-none"
                          data-testid="textarea-medicalHistory"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="familyHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                        <Users className="h-4 w-4" />
                        <span>Family Medical History</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Family history of eye conditions, diabetes, heart disease, cancer, etc..."
                          className="min-h-[100px] border-2 border-gray-200 focus:border-blue-500 rounded-lg resize-none"
                          data-testid="textarea-familyHistory"
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-500">Include conditions in immediate family members</FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <Eye className="h-5 w-5 text-purple-400 mr-2" />
                    <div>
                      <h4 className="text-purple-800 font-semibold">Eye Care History</h4>
                      <p className="text-purple-700 text-sm">Previous eye exams and vision care information</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="lastEyeExam"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <Calendar className="h-4 w-4" />
                          <span>Last Eye Exam</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="date"
                            max={new Date().toISOString().split('T')[0]}
                            className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                            data-testid="input-lastEyeExam"
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">Optional - When was your last comprehensive eye exam?</FormDescription>
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center space-x-3">
                    <FormField
                      control={form.control}
                      name="contactLensWearer"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="w-5 h-5 text-purple-600 border-2 border-gray-200 rounded focus:ring-purple-500"
                              data-testid="checkbox-contactLensWearer"
                            />
                          </FormControl>
                          <FormLabel className="font-semibold text-gray-700">
                            Contact Lens Wearer
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="currentGlassesRx"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                        <Glasses className="h-4 w-4" />
                        <span>Current Glasses Prescription</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Current prescription details (sphere, cylinder, axis, add, prism)..."
                          className="min-h-[100px] border-2 border-gray-200 focus:border-blue-500 rounded-lg resize-none"
                          data-testid="textarea-currentGlassesRx"
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-500">Optional - Include both distance and reading prescriptions if applicable</FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eyeConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                        <Eye className="h-4 w-4" />
                        <span>Eye Conditions & Concerns</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Any current or past eye conditions, concerns, symptoms, surgeries (glaucoma, cataracts, macular degeneration, dry eyes, etc.)..."
                          className="min-h-[100px] border-2 border-gray-200 focus:border-blue-500 rounded-lg resize-none"
                          data-testid="textarea-eyeConditions"
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-500">Include any eye-related symptoms or discomfort</FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <Shield className="h-5 w-5 text-indigo-400 mr-2" />
                    <div>
                      <h4 className="text-indigo-800 font-semibold">Insurance & Additional Information</h4>
                      <p className="text-indigo-700 text-sm">Insurance details and final registration information</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="insuranceProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <Shield className="h-4 w-4" />
                          <span>Insurance Provider</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter insurance provider" 
                            className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
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
                        <FormLabel className="flex items-center space-x-1 font-semibold text-gray-700">
                          <CreditCard className="h-4 w-4" />
                          <span>Policy Number</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter policy number" 
                            className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                            data-testid="input-insuranceNumber"
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nationalIdNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-gray-700">National ID Number</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter national ID number" 
                            className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                            data-testid="input-nationalIdNumber"
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nisNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-gray-700">NIS Number</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter NIS number" 
                            className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                            data-testid="input-nisNumber"
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">Optional</FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="relationToPolicyHolder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-gray-700">Relationship to Policy Holder</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg" data-testid="select-relationToPolicyHolder">
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

                {/* Insurance Coupons & Benefits Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Insurance Coupons & Benefits</h4>
                  </div>
                  <p className="text-sm text-blue-600 mb-3">Add insurance coupons, government subsidies, or special benefits available to this patient.</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                    data-testid="button-add-insurance-coupon"
                  >
                    <span className="mr-1">+</span> Add Insurance Coupon
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="referredBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-gray-700">Referred By</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Doctor, friend, or referral source" 
                            className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
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
                        <FormLabel className="font-semibold text-gray-700">Preferred Language</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="English, Spanish, etc." 
                            className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                            data-testid="input-preferredLanguage"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

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
                          placeholder="Any additional information about the patient that may be helpful for staff or doctors..."
                          className="min-h-[100px] border-2 border-gray-200 focus:border-blue-500 rounded-lg resize-none"
                          data-testid="textarea-notes"
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-500">Optional notes for staff reference</FormDescription>
                    </FormItem>
                  )}
                />

                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <h4 className="font-semibold text-gray-900">Consent Forms</h4>
                  
                  <div className="flex items-start space-x-3">
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
                              className="w-5 h-5 text-blue-600 border-2 border-gray-200 rounded focus:ring-blue-500 mt-1"
                              data-testid="checkbox-consentToTreatment"
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="font-semibold text-gray-700">
                              Consent to Treatment
                            </FormLabel>
                            <FormDescription className="text-sm text-gray-600 mt-1">
                              I consent to receive medical treatment and examination by the doctors and staff at this practice.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-start space-x-3">
                    <FormField
                      control={form.control}
                      name="hipaaConsent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="w-5 h-5 text-blue-600 border-2 border-gray-200 rounded focus:ring-blue-500 mt-1"
                              data-testid="checkbox-hipaaConsent"
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="font-semibold text-gray-700">
                              HIPAA Privacy Acknowledgment
                            </FormLabel>
                            <FormDescription className="text-sm text-gray-600 mt-1">
                              I acknowledge that I have been provided with information about the practice's privacy policies.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto" data-testid="modern-patient-form">
      {/* Header */}
      <DialogHeader className="mb-6 text-center">
        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {editingPatient ? 'Update Patient Information' : 'Register New Patient'}
        </DialogTitle>
        <DialogDescription className="text-gray-600">
          {editingPatient ? 'Update patient information' : 'Complete patient registration with medical information'}
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
                disabled={patientMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 shadow-lg transition-all"
                data-testid="button-submit"
              >
                {patientMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>{editingPatient ? 'Updating...' : 'Registering...'}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    <span>{editingPatient ? 'Update Patient' : 'Register Patient'}</span>
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

export default ModernPatientForm;