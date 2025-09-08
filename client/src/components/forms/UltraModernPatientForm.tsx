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
import { Separator } from "@/components/ui/separator";
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
  UserCheck
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Enhanced Patient Schema with comprehensive validation
const patientSchema = z.object({
  // Basic Information
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50, "First name too long"),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50, "Last name too long"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"], { required_error: "Please select a gender" }),
  patientCode: z.string().optional(),
  
  // Contact Information
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number too long"),
  email: z.string().email("Please enter a valid email address"),
  address: z.string().min(5, "Address must be at least 5 characters").max(200, "Address too long"),
  city: z.string().min(2, "City is required").max(50, "City name too long"),
  state: z.string().min(2, "State is required").max(50, "State name too long"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters").max(10, "ZIP code too long"),
  
  // Emergency Contact
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone is required"),
  emergencyContactRelation: z.string().min(2, "Relationship is required"),
  
  // Medical Information
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
  medicalHistory: z.string().optional(),
  eyeHistory: z.string().optional(),
  
  // Insurance Information
  insuranceProvider: z.string().optional(),
  policyNumber: z.string().optional(),
  groupNumber: z.string().optional(),
  
  // Additional Notes
  notes: z.string().optional(),
  preferredContactMethod: z.enum(["phone", "email", "sms"], { required_error: "Please select preferred contact method" }),
  isActive: z.boolean().default(true),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface UltraModernPatientFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const UltraModernPatientForm: React.FC<UltraModernPatientFormProps> = ({ onSuccess, onCancel }) => {
  const [currentTab, setCurrentTab] = useState("basic");
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form configuration
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "male",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      allergies: "",
      currentMedications: "",
      medicalHistory: "",
      eyeHistory: "",
      insuranceProvider: "",
      policyNumber: "",
      groupNumber: "",
      notes: "",
      preferredContactMethod: "phone",
      isActive: true,
    },
  });

  // Create patient mutation
  const createPatientMutation = useMutation({
    mutationFn: (data: PatientFormData) => apiRequest("/api/patients", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({
        title: "✅ Success!",
        description: "Patient has been successfully registered.",
        duration: 3000,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to register patient. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  // Tab definitions with enhanced metadata
  const tabs = [
    {
      id: "basic",
      title: "Basic Info",
      icon: User,
      description: "Personal information",
      fields: ["firstName", "lastName", "dateOfBirth", "gender", "patientCode"],
      color: "from-blue-500 to-purple-600"
    },
    {
      id: "contact",
      title: "Contact",
      icon: Phone,
      description: "Contact details",
      fields: ["phone", "email", "address", "city", "state", "zipCode", "preferredContactMethod"],
      color: "from-green-500 to-teal-600"
    },
    {
      id: "emergency",
      title: "Emergency",
      icon: AlertTriangle,
      description: "Emergency contact",
      fields: ["emergencyContactName", "emergencyContactPhone", "emergencyContactRelation"],
      color: "from-red-500 to-orange-600"
    },
    {
      id: "medical",
      title: "Medical",
      icon: Stethoscope,
      description: "Medical history",
      fields: ["allergies", "currentMedications", "medicalHistory", "eyeHistory"],
      color: "from-purple-500 to-pink-600"
    },
    {
      id: "insurance",
      title: "Insurance",
      icon: Shield,
      description: "Insurance details",
      fields: ["insuranceProvider", "policyNumber", "groupNumber"],
      color: "from-indigo-500 to-blue-600"
    },
    {
      id: "notes",
      title: "Notes",
      icon: FileText,
      description: "Additional information",
      fields: ["notes"],
      color: "from-gray-500 to-slate-600"
    }
  ];

  // Calculate progress
  const calculateProgress = () => {
    const totalTabs = tabs.length;
    const completed = completedTabs.length;
    const currentIndex = tabs.findIndex(tab => tab.id === currentTab);
    return Math.round(((completed + (currentIndex + 1) / totalTabs) / totalTabs) * 100);
  };

  // Validate current tab
  const validateCurrentTab = async () => {
    const currentTabData = tabs.find(tab => tab.id === currentTab);
    if (!currentTabData) return false;

    const result = await form.trigger(currentTabData.fields as any);
    if (result && !completedTabs.includes(currentTab)) {
      setCompletedTabs(prev => [...prev, currentTab]);
    }
    return result;
  };

  // Navigate to next tab
  const goToNextTab = async () => {
    const isValid = await validateCurrentTab();
    if (isValid) {
      const currentIndex = tabs.findIndex(tab => tab.id === currentTab);
      if (currentIndex < tabs.length - 1) {
        setCurrentTab(tabs[currentIndex + 1].id);
      }
    }
  };

  // Navigate to previous tab
  const goToPrevTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === currentTab);
    if (currentIndex > 0) {
      setCurrentTab(tabs[currentIndex - 1].id);
    }
  };

  // Submit form
  const onSubmit = async (data: PatientFormData) => {
    // Auto-generate patient code if not provided
    if (!data.patientCode) {
      data.patientCode = `PT${Date.now().toString().slice(-6)}`;
    }
    
    createPatientMutation.mutate(data);
  };

  // Animation variants
  const tabContentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const iconVariants = {
    completed: { scale: 1.1, color: "#10B981" },
    current: { scale: 1.05, color: "#3B82F6" },
    upcoming: { scale: 1, color: "#6B7280" }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6" data-testid="ultra-modern-patient-form">
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
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Register New Patient
            </DialogTitle>
          </motion.div>
          <DialogDescription className="text-lg text-gray-600">
            Complete patient registration with comprehensive information management
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{calculateProgress()}% Complete</span>
          </div>
          <Progress 
            value={calculateProgress()} 
            className="h-3 bg-gray-200"
            data-testid="progress-bar"
          />
        </div>
      </motion.div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            
            {/* Enhanced Tab Navigation */}
            <TabsList className="grid w-full grid-cols-6 gap-1 bg-gray-100 p-1 rounded-xl h-auto">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isCompleted = completedTabs.includes(tab.id);
                const isCurrent = currentTab === tab.id;
                
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={`
                      flex flex-col items-center space-y-1 p-3 rounded-lg transition-all duration-300
                      ${isCurrent ? 'bg-white shadow-md' : ''}
                      ${isCompleted ? 'bg-green-50 text-green-700' : ''}
                      hover:bg-white/80
                    `}
                    data-testid={`tab-${tab.id}`}
                  >
                    <motion.div
                      variants={iconVariants}
                      animate={isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'}
                      transition={{ duration: 0.2 }}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </motion.div>
                    <span className="text-xs font-medium">{tab.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-6">
                  <motion.div
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    
                    {/* Tab Header */}
                    <div className={`bg-gradient-to-r ${tab.color} p-6 rounded-xl text-white`}>
                      <div className="flex items-center space-x-3">
                        <tab.icon className="h-6 w-6" />
                        <div>
                          <h3 className="text-xl font-semibold">{tab.title}</h3>
                          <p className="text-white/80">{tab.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Basic Information Tab */}
                    {tab.id === "basic" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>First Name *</span>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter first name" className="h-12" data-testid="input-firstName" />
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
                              <FormLabel className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>Last Name *</span>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter last name" className="h-12" data-testid="input-lastName" />
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
                              <FormLabel className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Date of Birth *</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="date" 
                                  className="h-12" 
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
                              <FormLabel>Gender *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12" data-testid="select-gender">
                                    <SelectValue placeholder="Select gender" />
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
                          name="patientCode"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Patient Code</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Auto-generated if left empty" 
                                  className="h-12"
                                  data-testid="input-patientCode"
                                />
                              </FormControl>
                              <FormDescription>
                                Leave empty to auto-generate a unique patient code
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Contact Information Tab */}
                    {tab.id === "contact" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <span>Phone Number *</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="(555) 123-4567" 
                                  className="h-12"
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
                              <FormLabel className="flex items-center space-x-2">
                                <Mail className="h-4 w-4" />
                                <span>Email Address *</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="email" 
                                  placeholder="patient@email.com" 
                                  className="h-12"
                                  data-testid="input-email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>Street Address *</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="123 Main Street" 
                                  className="h-12"
                                  data-testid="input-address"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City *</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="City name" 
                                  className="h-12"
                                  data-testid="input-city"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State *</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="State" 
                                  className="h-12"
                                  data-testid="input-state"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code *</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="12345" 
                                  className="h-12"
                                  data-testid="input-zipCode"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="preferredContactMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Contact Method *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12" data-testid="select-preferredContactMethod">
                                    <SelectValue placeholder="Select contact method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="phone">Phone</SelectItem>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="sms">SMS</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Emergency Contact Tab */}
                    {tab.id === "emergency" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="emergencyContactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>Emergency Contact Name *</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Full name" 
                                  className="h-12"
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
                              <FormLabel className="flex items-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <span>Emergency Contact Phone *</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="(555) 123-4567" 
                                  className="h-12"
                                  data-testid="input-emergencyContactPhone"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="emergencyContactRelation"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Relationship *</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="e.g., Spouse, Parent, Sibling, Friend" 
                                  className="h-12"
                                  data-testid="input-emergencyContactRelation"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Medical Information Tab */}
                    {tab.id === "medical" && (
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="allergies"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2">
                                <AlertTriangle className="h-4 w-4" />
                                <span>Known Allergies</span>
                              </FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="List any known allergies (medications, food, environmental, etc.)"
                                  className="min-h-[100px]"
                                  data-testid="textarea-allergies"
                                />
                              </FormControl>
                              <FormDescription>
                                Include all known allergies and their severity
                              </FormDescription>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="currentMedications"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2">
                                <Heart className="h-4 w-4" />
                                <span>Current Medications</span>
                              </FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="List all current medications including dosage and frequency"
                                  className="min-h-[100px]"
                                  data-testid="textarea-currentMedications"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="medicalHistory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>General Medical History</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Previous surgeries, chronic conditions, significant medical events"
                                  className="min-h-[100px]"
                                  data-testid="textarea-medicalHistory"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="eyeHistory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Eye Care History</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Previous eye conditions, surgeries, vision problems, last eye exam"
                                  className="min-h-[100px]"
                                  data-testid="textarea-eyeHistory"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Insurance Information Tab */}
                    {tab.id === "insurance" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="insuranceProvider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2">
                                <Shield className="h-4 w-4" />
                                <span>Insurance Provider</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="e.g., Blue Cross Blue Shield" 
                                  className="h-12"
                                  data-testid="input-insuranceProvider"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="policyNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Policy Number</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Policy/Member ID" 
                                  className="h-12"
                                  data-testid="input-policyNumber"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="groupNumber"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Group Number</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Group/Plan number (if applicable)" 
                                  className="h-12"
                                  data-testid="input-groupNumber"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Notes Tab */}
                    {tab.id === "notes" && (
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <span>Additional Notes</span>
                              </FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Any additional information, special requirements, or notes about the patient"
                                  className="min-h-[200px]"
                                  data-testid="textarea-notes"
                                />
                              </FormControl>
                              <FormDescription>
                                Include any special considerations, preferences, or additional information
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                  </motion.div>
                </TabsContent>
              ))}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={goToPrevTab}
                disabled={currentTab === tabs[0].id}
                className="flex items-center space-x-2"
                data-testid="button-previous"
              >
                <span>Previous</span>
              </Button>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>

                {currentTab === tabs[tabs.length - 1].id ? (
                  <Button
                    type="submit"
                    disabled={createPatientMutation.isPending}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    data-testid="button-submit"
                  >
                    {createPatientMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Registering...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4" />
                        <span>Register Patient</span>
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={goToNextTab}
                    className="flex items-center space-x-2"
                    data-testid="button-next"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Tabs>
        </form>
      </Form>
    </div>
  );
};

export default UltraModernPatientForm;