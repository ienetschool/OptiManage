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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  UserPlus
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Enhanced Patient Schema
const patientSchema = z.object({
  // Basic Info
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"], { required_error: "Please select gender" }),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  
  // Contact Info
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  
  // Medical Info
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
  medicalHistory: z.string().optional(),
  
  // Insurance & Payment
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  
  // Additional Notes
  notes: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface CompactPatientFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editingPatient?: any;
}

const CompactPatientForm: React.FC<CompactPatientFormProps> = ({ 
  onSuccess, 
  onCancel, 
  editingPatient 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic");

  // Form configuration
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: editingPatient ? {
      firstName: editingPatient.firstName || "",
      lastName: editingPatient.lastName || "",
      dateOfBirth: editingPatient.dateOfBirth || "",
      gender: editingPatient.gender || "male",
      bloodType: editingPatient.bloodType || undefined,
      phone: editingPatient.phone || "",
      email: editingPatient.email || "",
      address: editingPatient.address || "",
      emergencyContactName: editingPatient.emergencyContactName || "",
      emergencyContactPhone: editingPatient.emergencyContactPhone || "",
      emergencyContactRelation: editingPatient.emergencyContactRelation || "",
      allergies: editingPatient.allergies || "",
      currentMedications: editingPatient.currentMedications || "",
      medicalHistory: editingPatient.medicalHistory || "",
      insuranceProvider: editingPatient.insuranceProvider || "",
      insuranceNumber: editingPatient.insuranceNumber || "",
      notes: editingPatient.notes || "",
    } : {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "male",
      bloodType: undefined,
      phone: "",
      email: "",
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      allergies: "",
      currentMedications: "",
      medicalHistory: "",
      insuranceProvider: "",
      insuranceNumber: "",
      notes: "",
    },
  });

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

  // Submit form
  const onSubmit = async (data: PatientFormData) => {
    patientMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-4xl mx-auto" data-testid="compact-patient-form">
      {/* Header */}
      <DialogHeader className="mb-6">
        <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {editingPatient ? 'Update Patient' : 'Register New Patient'}
        </DialogTitle>
        <DialogDescription className="text-center text-gray-600">
          {editingPatient ? 'Update patient information' : 'Complete patient registration with medical information'}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="basic" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Basic Info</span>
                <span className="sm:hidden">Basic</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Contact</span>
                <span className="sm:hidden">Contact</span>
              </TabsTrigger>
              <TabsTrigger value="medical" className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Medical</span>
                <span className="sm:hidden">Medical</span>
              </TabsTrigger>
              <TabsTrigger value="insurance" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Insurance</span>
                <span className="sm:hidden">Insurance</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 rounded-full bg-blue-500 text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                      <p className="text-sm text-gray-600">Personal details and identification</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-1 font-medium">
                            <span>First Name</span>
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter first name" 
                              className="h-11"
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
                          <FormLabel className="flex items-center space-x-1 font-medium">
                            <span>Last Name</span>
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter last name" 
                              className="h-11"
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
                          <FormLabel className="flex items-center space-x-1 font-medium">
                            <span>Date of Birth</span>
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="date"
                              className="h-11"
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
                          <FormLabel className="flex items-center space-x-1 font-medium">
                            <span>Gender</span>
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11" data-testid="select-gender">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bloodType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Blood Group</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
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
                          </FormControl>
                          <FormDescription className="text-xs">
                            Optional
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 rounded-full bg-green-500 text-white">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                      <p className="text-sm text-gray-600">Contact details and emergency contacts</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-1 font-medium">
                              <span>Phone Number</span>
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Enter phone number" 
                                className="h-11"
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
                                className="h-11"
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Optional
                            </FormDescription>
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
                              placeholder="Enter complete address..."
                              className="min-h-[80px] resize-none"
                              data-testid="textarea-address"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Optional
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Emergency Contact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="emergencyContactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium text-sm">Contact Name</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Full name" 
                                  className="h-10"
                                  data-testid="input-emergencyContactName"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="emergencyContactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium text-sm">Contact Phone</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Phone number" 
                                  className="h-10"
                                  data-testid="input-emergencyContactPhone"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="emergencyContactRelation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium text-sm">Relationship</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="e.g., Spouse, Parent" 
                                  className="h-10"
                                  data-testid="input-emergencyContactRelation"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4">
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 rounded-full bg-red-500 text-white">
                      <Heart className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Medical Information</h3>
                      <p className="text-sm text-gray-600">Medical history and current conditions</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="allergies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Allergies</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="List any known allergies (medications, food, environmental)..."
                              className="min-h-[80px] resize-none"
                              data-testid="textarea-allergies"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Include severity and reactions if known
                          </FormDescription>
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
                              placeholder="List all current medications, dosages, and frequency..."
                              className="min-h-[80px] resize-none"
                              data-testid="textarea-currentMedications"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Include prescription and over-the-counter medications
                          </FormDescription>
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
                              placeholder="Previous surgeries, chronic conditions, significant medical events..."
                              className="min-h-[80px] resize-none"
                              data-testid="textarea-medicalHistory"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Include past eye conditions, surgeries, and treatments
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insurance" className="space-y-4">
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 rounded-full bg-purple-500 text-white">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Insurance & Additional</h3>
                      <p className="text-sm text-gray-600">Insurance details and additional notes</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="insuranceProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Insurance Provider</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="e.g., Blue Cross Blue Shield" 
                                className="h-11"
                                data-testid="input-insuranceProvider"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Optional
                            </FormDescription>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="insuranceNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Policy Number</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Insurance policy number" 
                                className="h-11"
                                data-testid="input-insuranceNumber"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Optional
                            </FormDescription>
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
                              placeholder="Any additional information about the patient..."
                              className="min-h-[100px] resize-none"
                              data-testid="textarea-notes"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Optional notes for staff reference
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t bg-gray-50 p-4 rounded-lg">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-6"
              data-testid="button-cancel"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={patientMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 px-8"
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
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CompactPatientForm;