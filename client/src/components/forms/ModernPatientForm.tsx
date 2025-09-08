import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ModernForm, FormSection, ValidationMessage, FormTab } from "@/components/ui/modern-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  Shield, 
  AlertTriangle,
  Calendar,
  FileText,
  CreditCard,
  Eye,
  Stethoscope
} from "lucide-react";
import { insertPatientSchema, type Patient } from "@shared/mysql-schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Simplified patient form schema using only existing database fields
const modernPatientFormSchema = z.object({
  patientCode: z.string().min(1, "Patient code is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  currentMedications: z.string().optional(),
  notes: z.string().optional(),
});

type ModernPatientFormData = z.infer<typeof modernPatientFormSchema>;

interface ModernPatientFormProps {
  patient?: Patient;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ModernPatientForm({
  patient,
  onSuccess,
  onCancel
}: ModernPatientFormProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ModernPatientFormData>({
    resolver: zodResolver(modernPatientFormSchema),
    defaultValues: {
      patientCode: patient?.patientCode || `PAT${Date.now()}`,
      firstName: patient?.firstName || "",
      lastName: patient?.lastName || "",
      email: patient?.email || "",
      phone: patient?.phone || "",
      dateOfBirth: patient?.dateOfBirth ? format(new Date(patient.dateOfBirth), "yyyy-MM-dd") : "",
      gender: patient?.gender || "",
      address: patient?.address || "",
      emergencyContactName: patient?.emergencyContactName || "",
      emergencyContactPhone: patient?.emergencyContactPhone || "",
      emergencyContactRelation: patient?.emergencyContactRelation || "",
      insuranceProvider: patient?.insuranceProvider || "",
      insuranceNumber: patient?.insuranceNumber || "",
      bloodType: patient?.bloodType || "",
      allergies: patient?.allergies || "",
      medicalHistory: patient?.medicalHistory || "",
      currentMedications: patient?.currentMedications || "",
      notes: patient?.notes || "",
    }
  });

  const { watch, formState } = form;
  const watchedValues = watch();

  // Calculate tab completion status
  const [tabStates, setTabStates] = useState<Record<string, { completed: boolean; hasErrors: boolean }>>({});

  useEffect(() => {
    const errors = formState.errors;
    const values = watchedValues;

    const newTabStates = {
      personal: {
        completed: !!(values.firstName && values.lastName && values.email && values.phone),
        hasErrors: !!(errors.firstName || errors.lastName || errors.email || errors.phone)
      },
      contact: {
        completed: !!(values.address && values.emergencyContactName && values.emergencyContactPhone),
        hasErrors: !!(errors.address || errors.emergencyContactName || errors.emergencyContactPhone)
      },
      medical: {
        completed: !!(values.medicalHistory || values.currentMedications || values.allergies),
        hasErrors: !!(errors.medicalHistory || errors.currentMedications || errors.allergies)
      },
      insurance: {
        completed: !!(values.insuranceProvider && values.insuranceNumber),
        hasErrors: !!(errors.insuranceProvider || errors.insuranceNumber)
      }
    };

    setTabStates(newTabStates);
  }, [watchedValues, formState.errors]);

  const tabs: FormTab[] = [
    {
      id: "personal",
      title: "Personal Info",
      icon: <User className="h-4 w-4" />,
      description: "Basic information",
      required: true,
      completed: tabStates.personal?.completed,
      hasErrors: tabStates.personal?.hasErrors
    },
    {
      id: "contact",
      title: "Contact & Emergency",
      icon: <Phone className="h-4 w-4" />,
      description: "Contact details",
      required: true,
      completed: tabStates.contact?.completed,
      hasErrors: tabStates.contact?.hasErrors
    },
    {
      id: "medical",
      title: "Medical History",
      icon: <Heart className="h-4 w-4" />,
      description: "Health information",
      completed: tabStates.medical?.completed,
      hasErrors: tabStates.medical?.hasErrors
    },
    {
      id: "insurance",
      title: "Insurance",
      icon: <Shield className="h-4 w-4" />,
      description: "Insurance details",
      completed: tabStates.insurance?.completed,
      hasErrors: tabStates.insurance?.hasErrors
    }
  ];

  const mutation = useMutation({
    mutationFn: async (data: ModernPatientFormData) => {
      const endpoint = patient ? `/api/patients/${patient.id}` : "/api/patients";
      const method = patient ? "PATCH" : "POST";
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save patient');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({
        title: "Success",
        description: `Patient ${patient ? "updated" : "created"} successfully`,
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save patient",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ModernPatientFormData) => {
    mutation.mutate(data);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <FormSection
            title="Personal Information"
            description="Enter the patient's basic personal details"
            required
            completed={tabStates.personal?.completed}
            hasErrors={tabStates.personal?.hasErrors}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patientCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter patient code" {...field} data-testid="input-patientCode" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} data-testid="input-firstName" />
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
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} data-testid="input-lastName" />
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
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} data-testid="input-phone" />
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
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-dateOfBirth" />
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
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-gender">
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
                name="bloodType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-bloodType">
                          <SelectValue placeholder="Select blood type" />
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
          </FormSection>
        );

      case "contact":
        return (
          <FormSection
            title="Contact & Emergency Information"
            description="Provide contact details and emergency contact information"
            required
            completed={tabStates.contact?.completed}
            hasErrors={tabStates.contact?.hasErrors}
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter full address" 
                        {...field} 
                        data-testid="textarea-address"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emergencyContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter emergency contact name" {...field} data-testid="input-emergencyContactName" />
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
                      <FormLabel>Emergency Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter emergency contact phone" {...field} data-testid="input-emergencyContactPhone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="emergencyContactRelation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship to Patient</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-emergencyContactRelation">
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>
        );

      case "medical":
        return (
          <FormSection
            title="Medical History"
            description="Enter relevant medical history and current medications"
            completed={tabStates.medical?.completed}
            hasErrors={tabStates.medical?.hasErrors}
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="medicalHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical History</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter any relevant medical history, previous surgeries, conditions..."
                        {...field}
                        data-testid="textarea-medicalHistory"
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>
                      Include any chronic conditions, previous surgeries, or significant medical events
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentMedications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Medications</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List all current medications, dosages, and frequency..."
                        {...field}
                        data-testid="textarea-currentMedications"
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Include prescription medications, over-the-counter drugs, and supplements
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergies & Reactions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List any known allergies or adverse reactions..."
                        {...field}
                        data-testid="textarea-allergies"
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Include drug allergies, food allergies, and environmental allergies
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>
        );

      case "insurance":
        return (
          <FormSection
            title="Insurance Information"
            description="Enter insurance details and verification status"
            completed={tabStates.insurance?.completed}
            hasErrors={tabStates.insurance?.hasErrors}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="insuranceProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Provider</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter insurance provider" {...field} data-testid="input-insuranceProvider" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="insuranceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter insurance number" {...field} data-testid="input-insuranceNumber" />
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
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter any additional notes or comments..."
                        {...field}
                        data-testid="textarea-notes"
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>
                      Any additional information that may be relevant for patient care
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>
        );

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ModernForm
          title={patient ? "Edit Patient" : "New Patient Registration"}
          description="Complete all sections to register a new patient or update existing patient information"
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSave={form.handleSubmit(onSubmit)}
          onCancel={onCancel}
          isLoading={mutation.isPending}
          saveLabel={patient ? "Update Patient" : "Register Patient"}
          showProgress
          allowTabSwitch
        >
          {renderTabContent()}
        </ModernForm>
      </form>
    </Form>
  );
}