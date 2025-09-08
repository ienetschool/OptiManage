import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  phone: string;
  email: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  allergies: string;
  medicalHistory: string;
  currentMedications: string;
  insuranceProvider: string;
  insuranceNumber: string;
  notes: string;
}

interface ScreenshotPatientFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ScreenshotPatientForm({ onSuccess, onCancel }: ScreenshotPatientFormProps) {
  const [currentTab, setCurrentTab] = useState("basic");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PatientFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      bloodType: "",
      phone: "",
      email: "",
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      allergies: "",
      medicalHistory: "",
      currentMedications: "",
      insuranceProvider: "",
      insuranceNumber: "",
      notes: "",
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const watchedValues = watch();

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
        title: "Success",
        description: "Patient registered successfully.",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to register patient.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PatientFormData) => {
    createPatientMutation.mutate(data);
  };

  const nextTab = () => {
    const tabs = ["basic", "contact", "medical", "insurance", "loyalty"];
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1]);
    }
  };

  const prevTab = () => {
    const tabs = ["basic", "contact", "medical", "insurance", "loyalty"];
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex > 0) {
      setCurrentTab(tabs[currentIndex - 1]);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Register New Patient</DialogTitle>
        <DialogDescription>
          Complete patient registration with comprehensive medical information
        </DialogDescription>
      </DialogHeader>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="basic" className="relative data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Basic Info
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" title="Required fields"></span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="relative data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Contact
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" title="Required fields"></span>
          </TabsTrigger>
          <TabsTrigger value="medical" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Medical</TabsTrigger>
          <TabsTrigger value="insurance" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Insurance</TabsTrigger>
          <TabsTrigger value="loyalty" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Loyalty</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-red-600 font-medium">First Name *</Label>
                <Input
                  {...register("firstName", { required: "First name is required" })}
                  placeholder="Enter first name"
                  className="h-11"
                  data-testid="input-firstName"
                />
                {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
              </div>
              
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