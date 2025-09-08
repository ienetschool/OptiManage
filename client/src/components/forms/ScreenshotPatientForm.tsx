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
              
              <div className="space-y-2">
                <Label className="text-red-600 font-medium">Last Name *</Label>
                <Input
                  {...register("lastName", { required: "Last name is required" })}
                  placeholder="Enter last name"
                  className="h-11"
                  data-testid="input-lastName"
                />
                {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-red-600 font-medium">Date of Birth *</Label>
                <Input
                  type="date"
                  {...register("dateOfBirth", { required: "Date of birth is required" })}
                  className="h-11"
                  data-testid="input-dateOfBirth"
                />
                {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label className="text-red-600 font-medium">Gender *</Label>
                <Select onValueChange={(value) => form.setValue("gender", value)} value={watchedValues.gender}>
                  <SelectTrigger className="h-11" data-testid="select-gender">
                    <SelectValue placeholder="Male" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Blood Group</Label>
                <Select onValueChange={(value) => form.setValue("bloodType", value)} value={watchedValues.bloodType}>
                  <SelectTrigger className="h-11" data-testid="select-bloodType">
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
              </div>
            </div>
            
            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
                Cancel
              </Button>
              <Button type="button" onClick={nextTab} className="bg-blue-600 hover:bg-blue-700" data-testid="button-next-contact">
                Next: Contact Info →
              </Button>
            </div>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  {...register("phone")}
                  placeholder="Enter phone number"
                  className="h-11"
                  data-testid="input-phone"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="Enter email address"
                  className="h-11"
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Textarea
                  {...register("address")}
                  placeholder="Enter full address"
                  rows={3}
                  data-testid="textarea-address"
                />
              </div>

              <div className="space-y-2">
                <Label>Emergency Contact Name</Label>
                <Input
                  {...register("emergencyContactName")}
                  placeholder="Enter emergency contact name"
                  className="h-11"
                  data-testid="input-emergencyContactName"
                />
              </div>

              <div className="space-y-2">
                <Label>Emergency Contact Phone</Label>
                <Input
                  {...register("emergencyContactPhone")}
                  placeholder="Enter emergency contact phone"
                  className="h-11"
                  data-testid="input-emergencyContactPhone"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Relationship to Patient</Label>
                <Select onValueChange={(value) => form.setValue("emergencyContactRelation", value)} value={watchedValues.emergencyContactRelation}>
                  <SelectTrigger className="h-11" data-testid="select-emergencyContactRelation">
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
              </div>
            </div>
            
            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={prevTab} data-testid="button-prev">
                ← Previous
              </Button>
              <Button type="button" onClick={nextTab} className="bg-blue-600 hover:bg-blue-700" data-testid="button-next-medical">
                Next: Medical →
              </Button>
            </div>
          </TabsContent>

          {/* Medical Information Tab */}
          <TabsContent value="medical" className="space-y-6 mt-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Medical History</Label>
                <Textarea
                  {...register("medicalHistory")}
                  placeholder="Enter any relevant medical history, previous surgeries, conditions..."
                  rows={4}
                  data-testid="textarea-medicalHistory"
                />
              </div>

              <div className="space-y-2">
                <Label>Current Medications</Label>
                <Textarea
                  {...register("currentMedications")}
                  placeholder="List all current medications, dosages, and frequency..."
                  rows={3}
                  data-testid="textarea-currentMedications"
                />
              </div>

              <div className="space-y-2">
                <Label>Allergies & Reactions</Label>
                <Textarea
                  {...register("allergies")}
                  placeholder="List any known allergies or adverse reactions..."
                  rows={3}
                  data-testid="textarea-allergies"
                />
              </div>
            </div>
            
            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={prevTab} data-testid="button-prev">
                ← Previous
              </Button>
              <Button type="button" onClick={nextTab} className="bg-blue-600 hover:bg-blue-700" data-testid="button-next-insurance">
                Next: Insurance →
              </Button>
            </div>
          </TabsContent>

          {/* Insurance Information Tab */}
          <TabsContent value="insurance" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Insurance Provider</Label>
                <Input
                  {...register("insuranceProvider")}
                  placeholder="Enter insurance provider"
                  className="h-11"
                  data-testid="input-insuranceProvider"
                />
              </div>

              <div className="space-y-2">
                <Label>Insurance Number</Label>
                <Input
                  {...register("insuranceNumber")}
                  placeholder="Enter insurance number"
                  className="h-11"
                  data-testid="input-insuranceNumber"
                />
              </div>
            </div>
            
            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={prevTab} data-testid="button-prev">
                ← Previous
              </Button>
              <Button type="button" onClick={nextTab} className="bg-blue-600 hover:bg-blue-700" data-testid="button-next-loyalty">
                Next: Loyalty →
              </Button>
            </div>
          </TabsContent>

          {/* Loyalty Information Tab */}
          <TabsContent value="loyalty" className="space-y-6 mt-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea
                  {...register("notes")}
                  placeholder="Enter any additional notes or comments..."
                  rows={4}
                  data-testid="textarea-notes"
                />
              </div>
            </div>
            
            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={prevTab} data-testid="button-prev">
                ← Previous
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700" 
                disabled={createPatientMutation.isPending}
                data-testid="button-register"
              >
                {createPatientMutation.isPending ? "Registering..." : "Register Patient"}
              </Button>
            </div>
          </TabsContent>
        </form>
      </Tabs>
    </>
  );
}