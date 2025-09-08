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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  Shield, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Users,
  Activity
} from "lucide-react";

// Comprehensive validation schema
const patientFormSchema = z.object({
  firstName: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(100, "First name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),
  
  lastName: z.string()
    .min(2, "Last name must be at least 2 characters")
    .max(100, "Last name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),
  
  email: z.string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  
  dateOfBirth: z.string()
    .refine((date) => {
      if (!date) return false;
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 150;
    }, "Please enter a valid date of birth"),
  
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
  
  address: z.string().max(500, "Address must be less than 500 characters").optional(),
  
  emergencyContactName: z.string()
    .max(255, "Emergency contact name must be less than 255 characters")
    .optional(),
  
  emergencyContactPhone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  
  emergencyContactRelation: z.string().optional(),
  
  insuranceProvider: z.string()
    .max(255, "Insurance provider name must be less than 255 characters")
    .optional(),
  
  insuranceNumber: z.string()
    .max(100, "Insurance number must be less than 100 characters")
    .optional(),
  
  bloodType: z.string().optional(),
  
  allergies: z.string()
    .max(1000, "Allergies description must be less than 1000 characters")
    .optional(),
  
  medicalHistory: z.string()
    .max(2000, "Medical history must be less than 2000 characters")
    .optional(),
  
  currentMedications: z.string()
    .max(1000, "Current medications must be less than 1000 characters")
    .optional(),
  
  notes: z.string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
});

type PatientFormData = z.infer<typeof patientFormSchema>;

interface ScreenshotPatientFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TABS = [
  { id: "basic", label: "Basic Info", icon: User, required: true },
  { id: "contact", label: "Contact", icon: Phone, required: true },
  { id: "emergency", label: "Emergency", icon: Users, required: false },
  { id: "medical", label: "Medical", icon: Heart, required: false },
  { id: "insurance", label: "Insurance", icon: Shield, required: false },
  { id: "notes", label: "Notes", icon: FileText, required: false },
];

export default function ScreenshotPatientForm({ onSuccess, onCancel }: ScreenshotPatientFormProps) {
  const [currentTab, setCurrentTab] = useState("basic");
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: undefined,
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      insuranceProvider: "",
      insuranceNumber: "",
      bloodType: "",
      allergies: "",
      medicalHistory: "",
      currentMedications: "",
      notes: "",
    },
    mode: "onChange",
  });

  const { watch, trigger, formState: { errors, isValid } } = form;
  const watchedValues = watch();

  // Calculate progress
  const calculateProgress = () => {
    const totalFields = Object.keys(patientFormSchema.shape).length;
    const filledFields = Object.values(watchedValues).filter(
      (value) => value !== "" && value !== undefined
    ).length;
    return Math.round((filledFields / totalFields) * 100);
  };

  // Validate current tab
  const validateCurrentTab = async () => {
    const tabFields: Record<string, (keyof PatientFormData)[]> = {
      basic: ["firstName", "lastName", "dateOfBirth", "gender"],
      contact: ["email", "phone", "address"],
      emergency: ["emergencyContactName", "emergencyContactPhone", "emergencyContactRelation"],
      medical: ["allergies", "medicalHistory", "currentMedications", "bloodType"],
      insurance: ["insuranceProvider", "insuranceNumber"],
      notes: ["notes"],
    };

    const fieldsToValidate = tabFields[currentTab] || [];
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid && !completedTabs.includes(currentTab)) {
      setCompletedTabs([...completedTabs, currentTab]);
    }
    
    return isValid;
  };

  const createPatientMutation = useMutation({
    mutationFn: async (data: PatientFormData) => {
      const patientData = {
        patientCode: `PAT${Date.now()}`,
        ...data,
        isActive: true
      };
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
      });
      if (!response.ok) throw new Error("Failed to create patient");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({
        title: "Success! 🎉",
        description: "Patient registered successfully with comprehensive medical profile.",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: "Failed to register patient. Please check all fields and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: PatientFormData) => {
    const isFormValid = await trigger();
    if (isFormValid) {
      createPatientMutation.mutate(data);
    }
  };

  const nextTab = async () => {
    const isValid = await validateCurrentTab();
    if (!isValid) return;
    
    const currentIndex = TABS.findIndex(tab => tab.id === currentTab);
    if (currentIndex < TABS.length - 1) {
      setCurrentTab(TABS[currentIndex + 1].id);
    }
  };

  const prevTab = () => {
    const currentIndex = TABS.findIndex(tab => tab.id === currentTab);
    if (currentIndex > 0) {
      setCurrentTab(TABS[currentIndex - 1].id);
    }
  };

  const currentTabIndex = TABS.findIndex(tab => tab.id === currentTab);
  const progress = calculateProgress();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <DialogHeader className="space-y-4 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-6 w-6 text-blue-600" />
              Register New Patient
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Complete patient registration with comprehensive medical information
            </DialogDescription>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1">
            Step {currentTabIndex + 1} of {TABS.length}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Registration Progress</span>
            <span>{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </DialogHeader>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid grid-cols-6 gap-1 bg-gray-50 p-2 rounded-xl h-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isCompleted = completedTabs.includes(tab.id);
            const isCurrent = currentTab === tab.id;
            const hasErrors = Object.keys(errors).some(errorKey => {
              const tabFields: Record<string, (keyof PatientFormData)[]> = {
                basic: ["firstName", "lastName", "dateOfBirth", "gender"],
                contact: ["email", "phone", "address"],
                emergency: ["emergencyContactName", "emergencyContactPhone", "emergencyContactRelation"],
                medical: ["allergies", "medicalHistory", "currentMedications", "bloodType"],
                insurance: ["insuranceProvider", "insuranceNumber"],
                notes: ["notes"],
              };
              return tabFields[tab.id]?.includes(errorKey as keyof PatientFormData);
            });

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`
                  relative flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200
                  data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600
                  ${isCompleted ? 'bg-green-50 text-green-700' : ''}
                  ${hasErrors ? 'bg-red-50 text-red-700' : ''}
                `}
              >
                <div className="flex items-center gap-1">
                  <Icon className="h-4 w-4" />
                  {isCompleted && <CheckCircle className="h-3 w-3 text-green-600" />}
                  {hasErrors && <AlertCircle className="h-3 w-3 text-red-600" />}
                </div>
                <span className="text-xs font-medium">{tab.label}</span>
                {tab.required && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" 
                        title="Required section" />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
            <AnimatePresence mode="wait">
              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6 mt-0">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Patient Basic Information
                    </h3>
                    <p className="text-blue-700 text-sm mt-1">
                      Enter the patient's essential personal details
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-red-600 font-medium flex items-center gap-1">
                            First Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter first name"
                              className="h-12 text-base border-2 focus:border-blue-500"
                              data-testid="input-firstName"
                            />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-red-600 font-medium flex items-center gap-1">
                            Last Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter last name"
                              className="h-12 text-base border-2 focus:border-blue-500"
                              data-testid="input-lastName"
                            />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-red-600 font-medium flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Date of Birth <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              className="h-12 text-base border-2 focus:border-blue-500"
                              data-testid="input-dateOfBirth"
                            />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-red-600 font-medium flex items-center gap-1">
                            Gender <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 text-base border-2 focus:border-blue-500" data-testid="select-gender">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bloodType"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-medium flex items-center gap-1">
                            <Activity className="h-4 w-4" />
                            Blood Group
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 text-base border-2 focus:border-blue-500" data-testid="select-bloodType">
                                <SelectValue placeholder="Select blood group (optional)" />
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
                          <FormDescription>
                            Blood group information helps in medical emergencies
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-between pt-6 border-t">
                    <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
                      Cancel
                    </Button>
                    <Button type="button" onClick={nextTab} className="bg-blue-600 hover:bg-blue-700" data-testid="button-next-contact">
                      Next: Contact Info →
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>

              {/* Contact Information Tab */}
              <TabsContent value="contact" className="space-y-6 mt-0">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                    <h3 className="font-semibold text-green-900 flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Information
                    </h3>
                    <p className="text-green-700 text-sm mt-1">
                      How can we reach the patient when needed?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="+1 (555) 123-4567"
                              className="h-12 text-base border-2 focus:border-green-500"
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="patient@example.com"
                              className="h-12 text-base border-2 focus:border-green-500"
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-medium flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            Home Address
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Enter complete address with street, city, state, and postal code"
                              rows={3}
                              className="text-base border-2 focus:border-green-500"
                              data-testid="textarea-address"
                            />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-between pt-6 border-t">
                    <Button type="button" variant="outline" onClick={prevTab} data-testid="button-prev">
                      ← Previous
                    </Button>
                    <Button type="button" onClick={nextTab} className="bg-blue-600 hover:bg-blue-700" data-testid="button-next-emergency">
                      Next: Emergency Contact →
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>

              {/* Emergency Contact Tab */}
              <TabsContent value="emergency" className="space-y-6 mt-0">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                    <h3 className="font-semibold text-orange-900 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Emergency Contact Information
                    </h3>
                    <p className="text-orange-700 text-sm mt-1">
                      Who should we contact in case of an emergency?
                    </p>
                  </div>

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
                              placeholder="Enter contact person's full name"
                              className="h-12 text-base border-2 focus:border-orange-500"
                              data-testid="input-emergencyContactName"
                            />
                          </FormControl>
                          <FormMessage className="text-red-600" />
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
                              placeholder="+1 (555) 987-6543"
                              className="h-12 text-base border-2 focus:border-orange-500"
                              data-testid="input-emergencyContactPhone"
                            />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyContactRelation"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-medium">Relationship to Patient</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 text-base border-2 focus:border-orange-500" data-testid="select-emergencyContactRelation">
                                <SelectValue placeholder="Select relationship" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="spouse">Spouse</SelectItem>
                              <SelectItem value="parent">Parent</SelectItem>
                              <SelectItem value="child">Child</SelectItem>
                              <SelectItem value="sibling">Sibling</SelectItem>
                              <SelectItem value="grandparent">Grandparent</SelectItem>
                              <SelectItem value="friend">Friend</SelectItem>
                              <SelectItem value="guardian">Legal Guardian</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-between pt-6 border-t">
                    <Button type="button" variant="outline" onClick={prevTab} data-testid="button-prev">
                      ← Previous
                    </Button>
                    <Button type="button" onClick={nextTab} className="bg-blue-600 hover:bg-blue-700" data-testid="button-next-medical">
                      Next: Medical Info →
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>

              {/* Medical Information Tab */}
              <TabsContent value="medical" className="space-y-6 mt-0">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                    <h3 className="font-semibold text-red-900 flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Medical History &amp; Health Information
                    </h3>
                    <p className="text-red-700 text-sm mt-1">
                      Critical medical information for safe and effective treatment
                    </p>
                  </div>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="allergies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-red-700">
                            🚨 Allergies &amp; Adverse Reactions
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="List any known allergies to medications, foods, materials, or environmental factors..."
                              rows={3}
                              className="text-base border-2 border-red-200 focus:border-red-500"
                              data-testid="textarea-allergies"
                            />
                          </FormControl>
                          <FormDescription className="text-red-600">
                            Please be specific about allergic reactions and severity
                          </FormDescription>
                          <FormMessage className="text-red-600" />
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
                              placeholder="List all current medications including prescriptions, over-the-counter drugs, vitamins, and supplements with dosages..."
                              rows={4}
                              className="text-base border-2 focus:border-red-500"
                              data-testid="textarea-currentMedications"
                            />
                          </FormControl>
                          <FormMessage className="text-red-600" />
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
                              placeholder="Previous surgeries, major illnesses, chronic conditions, family medical history..."
                              rows={4}
                              className="text-base border-2 focus:border-red-500"
                              data-testid="textarea-medicalHistory"
                            />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-between pt-6 border-t">
                    <Button type="button" variant="outline" onClick={prevTab} data-testid="button-prev">
                      ← Previous
                    </Button>
                    <Button type="button" onClick={nextTab} className="bg-blue-600 hover:bg-blue-700" data-testid="button-next-insurance">
                      Next: Insurance →
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>

              {/* Insurance Information Tab */}
              <TabsContent value="insurance" className="space-y-6 mt-0">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                    <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Insurance Information
                    </h3>
                    <p className="text-purple-700 text-sm mt-1">
                      Insurance details for billing and coverage verification
                    </p>
                  </div>

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
                              placeholder="e.g., Blue Cross Blue Shield, Aetna, Cigna"
                              className="h-12 text-base border-2 focus:border-purple-500"
                              data-testid="input-insuranceProvider"
                            />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="insuranceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Policy/Member Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Insurance policy or member ID number"
                              className="h-12 text-base border-2 focus:border-purple-500"
                              data-testid="input-insuranceNumber"
                            />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-between pt-6 border-t">
                    <Button type="button" variant="outline" onClick={prevTab} data-testid="button-prev">
                      ← Previous
                    </Button>
                    <Button type="button" onClick={nextTab} className="bg-blue-600 hover:bg-blue-700" data-testid="button-next-notes">
                      Next: Notes →
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-6 mt-0">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Additional Notes &amp; Comments
                    </h3>
                    <p className="text-gray-700 text-sm mt-1">
                      Any additional information that might be helpful for patient care
                    </p>
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
                            placeholder="Special considerations, preferences, accessibility needs, communication preferences, or any other relevant information..."
                            rows={6}
                            className="text-base border-2 focus:border-gray-500"
                            data-testid="textarea-notes"
                          />
                        </FormControl>
                        <FormDescription>
                          This information helps our team provide personalized care
                        </FormDescription>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between pt-6 border-t">
                    <Button type="button" variant="outline" onClick={prevTab} data-testid="button-prev">
                      ← Previous
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-green-600 hover:bg-green-700 min-w-[200px]" 
                      disabled={createPatientMutation.isPending}
                      data-testid="button-register"
                    >
                      {createPatientMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Registering...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Complete Registration
                        </div>
                      )}
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
