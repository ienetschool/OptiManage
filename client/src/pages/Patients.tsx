import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Eye,
  Edit,
  User,
  Calendar,
  Heart,
  Phone,
  Mail,
  MapPin,
  Activity,
  Filter,
  Trash2,
  MoreVertical,
  UserPlus,
  Stethoscope,
  QrCode,
  Share2,
  Printer,
  Receipt,
  CalendarPlus
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  insertPatientSchema, 
  type Patient, 
  type InsertPatient,
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Patients() {
  const [open, setOpen] = useState(false);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewPatientOpen, setViewPatientOpen] = useState(false);
  const [medicalHistoryOpen, setMedicalHistoryOpen] = useState(false);
  const [prescriptionsOpen, setPrescriptionsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Patient form
  const form = useForm<InsertPatient>({
    resolver: zodResolver(insertPatientSchema),
    defaultValues: {
      patientCode: `PAT-${Date.now()}`,
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "male",
      phone: "",
      email: "",
      address: "",
      emergencyContact: "",
      emergencyPhone: "",
      bloodGroup: "",
      allergies: "",
      medicalHistory: "",
      insuranceProvider: "",
      insuranceNumber: "",
      isActive: true,
      loyaltyTier: "bronze",
      loyaltyPoints: 0,
      customFields: {},
    },
  });

  // Appointment form state
  const [appointmentForm, setAppointmentForm] = useState({
    patientId: "",
    appointmentDate: "",
    appointmentTime: "",
    serviceType: "",
    doctorId: "",
    notes: "",
    status: "scheduled"
  });

  // Fetch patients
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["/api/patients"],
  });

  // Fetch appointments
  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/appointments"],
  });

  // Create patient mutation
  const createPatientMutation = useMutation({
    mutationFn: async (data: InsertPatient) => {
      await apiRequest("POST", "/api/patients", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Patient registered successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to register patient.",
        variant: "destructive",
      });
    },
  });

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/appointments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setAppointmentOpen(false);
      setAppointmentForm({
        patientId: "",
        appointmentDate: "",
        appointmentTime: "",
        serviceType: "",
        doctorId: "",
        notes: "",
        status: "scheduled"
      });
      toast({
        title: "Success",
        description: "Appointment scheduled successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule appointment.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPatient) => {
    createPatientMutation.mutate(data);
  };

  const onAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentForm.patientId || !appointmentForm.appointmentDate || !appointmentForm.appointmentTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createAppointmentMutation.mutate(appointmentForm);
  };

  // Patient action handlers
  const handleActionClick = (action: string, patient: Patient) => {
    setSelectedPatient(patient);
    
    switch (action) {
      case 'view':
        setViewPatientOpen(true);
        break;
      case 'edit':
        form.reset(patient);
        setOpen(true);
        break;
      case 'medical-history':
        setMedicalHistoryOpen(true);
        break;
      case 'prescriptions':
        setPrescriptionsOpen(true);
        break;
      case 'print':
        // Generate and print patient record
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head><title>Patient Record - ${patient.firstName} ${patient.lastName}</title></head>
              <body style="font-family: Arial, sans-serif; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1>OptiStore Pro</h1>
                  <h2>Patient Medical Record</h2>
                </div>
                <div style="border: 1px solid #ccc; padding: 20px; margin-bottom: 20px;">
                  <h3>Patient Information</h3>
                  <p><strong>Name:</strong> ${patient.firstName} ${patient.lastName}</p>
                  <p><strong>Patient Code:</strong> ${patient.patientCode}</p>
                  <p><strong>Date of Birth:</strong> ${patient.dateOfBirth}</p>
                  <p><strong>Gender:</strong> ${patient.gender}</p>
                  <p><strong>Phone:</strong> ${patient.phone}</p>
                  <p><strong>Email:</strong> ${patient.email || 'N/A'}</p>
                  <p><strong>Address:</strong> ${patient.address || 'N/A'}</p>
                  <p><strong>Blood Group:</strong> ${patient.bloodGroup || 'N/A'}</p>
                  <p><strong>Allergies:</strong> ${patient.allergies || 'None'}</p>
                  <p><strong>Medical History:</strong> ${patient.medicalHistory || 'None'}</p>
                </div>
                <div style="text-align: center; margin-top: 30px;">
                  <p style="font-size: 12px;">Generated on ${new Date().toLocaleDateString()}</p>
                </div>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
        toast({
          title: "Print",
          description: `Patient record printed for ${patient.firstName} ${patient.lastName}`,
        });
        break;
      case 'qr-code':
        const patientData = JSON.stringify({
          id: patient.id,
          name: `${patient.firstName} ${patient.lastName}`,
          code: patient.patientCode,
          phone: patient.phone
        });
        const qrWindow = window.open('', '_blank');
        if (qrWindow) {
          qrWindow.document.write(`
            <html>
              <head><title>QR Code - ${patient.firstName} ${patient.lastName}</title></head>
              <body style="text-align: center; padding: 50px;">
                <h2>Patient QR Code</h2>
                <p>${patient.firstName} ${patient.lastName} - ${patient.patientCode}</p>
                <div style="margin: 20px 0;">
                  <canvas id="qr-code"></canvas>
                </div>
                <script>
                  // QR code generation would go here
                  document.getElementById('qr-code').innerHTML = 'QR Code: ${patientData}';
                </script>
              </body>
            </html>
          `);
          qrWindow.document.close();
        }
        toast({
          title: "QR Code",
          description: `QR code generated for ${patient.firstName} ${patient.lastName}`,
        });
        break;
      case 'share':
        if (navigator.share) {
          navigator.share({
            title: `Patient: ${patient.firstName} ${patient.lastName}`,
            text: `Patient Code: ${patient.patientCode}\nPhone: ${patient.phone}`,
          });
        } else {
          // Fallback for browsers that don't support Web Share API
          const shareText = `Patient: ${patient.firstName} ${patient.lastName}\nCode: ${patient.patientCode}\nPhone: ${patient.phone}`;
          navigator.clipboard.writeText(shareText);
          toast({
            title: "Copied to Clipboard",
            description: "Patient information copied to clipboard",
          });
        }
        break;
      case 'invoice':
        toast({
          title: "Generate Invoice",
          description: `Creating invoice for ${patient.firstName} ${patient.lastName}`,
        });
        // Here you would typically navigate to invoice generation or open invoice modal
        break;
      case 'book-appointment':
        setAppointmentForm(prev => ({ ...prev, patientId: patient.id }));
        setAppointmentOpen(true);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete patient ${patient.firstName} ${patient.lastName}?`)) {
          // Here you would call the delete API
          toast({
            title: "Patient Deleted",
            description: `${patient.firstName} ${patient.lastName} has been deleted`,
          });
        }
        break;
    }
  };

  const filteredPatients = patients.filter((patient: Patient) =>
    patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const patientCount = patients.length;
  const appointmentCount = appointments.length;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Patients & Appointment Management</h1>
          <p className="text-slate-600">Comprehensive patient records and appointment scheduling system</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Patient</DialogTitle>
                <DialogDescription>
                  Complete patient registration with comprehensive medical information
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="medical">Medical</TabsTrigger>
                  <TabsTrigger value="insurance">Insurance</TabsTrigger>
                  <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
                </TabsList>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information Tab */}
                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter first name" />
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
                                <Input {...field} placeholder="Enter last name" />
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
                              <FormLabel>Date of Birth *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
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
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
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
                          name="bloodGroup"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Blood Group</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger>
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

                        <FormField
                          control={form.control}
                          name="patientCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Patient Code</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Auto-generated" readOnly />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    {/* Contact Information Tab */}
                    <TabsContent value="contact" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter phone number" />
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
                                <Input type="email" {...field} value={field.value || ""} placeholder="Enter email address" />
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
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value || ""} placeholder="Enter full address" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="emergencyContact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emergency Contact</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} placeholder="Contact name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="emergencyPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emergency Phone</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} placeholder="Emergency phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    {/* Medical Information Tab */}
                    <TabsContent value="medical" className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="allergies"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Allergies</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value || ""} placeholder="List any allergies..." />
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
                              <FormLabel>Medical History</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value || ""} placeholder="Medical history details..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    {/* Insurance Information Tab */}
                    <TabsContent value="insurance" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="insuranceProvider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Insurance Provider</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} placeholder="Provider name" />
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
                              <FormLabel>Policy Number</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} placeholder="Policy number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    {/* Loyalty Information Tab */}
                    <TabsContent value="loyalty" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="loyaltyTier"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Loyalty Tier</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select tier" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="bronze">🥉 Bronze</SelectItem>
                                  <SelectItem value="silver">🥈 Silver</SelectItem>
                                  <SelectItem value="gold">🥇 Gold</SelectItem>
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
                              <FormLabel>Loyalty Points</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  value={field.value || 0} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  placeholder="0" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Active Status</FormLabel>
                              <div className="flex items-center space-x-2 mt-2">
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                                <Label className="text-sm">Patient is active</Label>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    <div className="flex justify-end space-x-2 pt-6 border-t">
                      <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createPatientMutation.isPending}>
                        {createPatientMutation.isPending ? "Creating..." : "Create Patient"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Dialog open={appointmentOpen} onOpenChange={setAppointmentOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
                <DialogDescription>
                  Schedule an appointment for a patient
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={onAppointmentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Patient *</Label>
                    <Select 
                      value={appointmentForm.patientId} 
                      onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, patientId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient: Patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.firstName} {patient.lastName} - {patient.patientCode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Service Type *</Label>
                    <Select 
                      value={appointmentForm.serviceType} 
                      onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, serviceType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eye-exam">Eye Examination</SelectItem>
                        <SelectItem value="contact-lens">Contact Lens Fitting</SelectItem>
                        <SelectItem value="glasses-fitting">Glasses Fitting</SelectItem>
                        <SelectItem value="follow-up">Follow-up Visit</SelectItem>
                        <SelectItem value="consultation">Consultation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Appointment Date *</Label>
                    <Input
                      type="date"
                      value={appointmentForm.appointmentDate}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointmentDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Appointment Time *</Label>
                    <Input
                      type="time"
                      value={appointmentForm.appointmentTime}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointmentTime: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={appointmentForm.notes}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes for the appointment..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setAppointmentOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createAppointmentMutation.isPending}>
                    {createAppointmentMutation.isPending ? "Scheduling..." : "Schedule Appointment"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientCount}</div>
            <p className="text-xs text-muted-foreground">
              Active patient records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentCount}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled appointments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search patients by name, code, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient: Patient) => (
          <Card key={patient.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{patient.firstName} {patient.lastName}</h3>
                    <p className="text-sm text-slate-500">{patient.patientCode}</p>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleActionClick('view', patient)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleActionClick('edit', patient)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleActionClick('medical-history', patient)}>
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Medical History
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleActionClick('prescriptions', patient)}>
                      <Heart className="mr-2 h-4 w-4" />
                      Prescriptions
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleActionClick('book-appointment', patient)}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Appointment
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleActionClick('print', patient)}>
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleActionClick('qr-code', patient)}>
                      <QrCode className="mr-2 h-4 w-4" />
                      QR Code
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleActionClick('share', patient)}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleActionClick('invoice', patient)}>
                      <Receipt className="mr-2 h-4 w-4" />
                      Invoice
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleActionClick('delete', patient)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  Age: {calculateAge(patient.dateOfBirth)} years
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Phone className="mr-2 h-4 w-4" />
                  {patient.phone}
                </div>
                {patient.email && (
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="mr-2 h-4 w-4" />
                    {patient.email}
                  </div>
                )}
                {patient.bloodGroup && (
                  <div className="flex items-center text-sm text-slate-600">
                    <Activity className="mr-2 h-4 w-4" />
                    Blood Group: {patient.bloodGroup}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Badge variant={patient.isActive ? "default" : "secondary"}>
                  {patient.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline">
                  {patient.loyaltyTier === 'gold' ? '🥇' : patient.loyaltyTier === 'silver' ? '🥈' : '🥉'} {patient.loyaltyTier}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No patients found</h3>
          <p className="text-slate-500">Try adjusting your search criteria or add a new patient.</p>
        </div>
      )}

      {/* View Patient Details Modal */}
      <Dialog open={viewPatientOpen} onOpenChange={setViewPatientOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>
              Complete patient information and medical records
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {selectedPatient.firstName.charAt(0)}{selectedPatient.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</h3>
                  <p className="text-slate-600">{selectedPatient.patientCode}</p>
                  <Badge variant={selectedPatient.isActive ? "default" : "secondary"}>
                    {selectedPatient.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 border-b pb-2">Personal Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-slate-500" />
                      <span className="font-medium">Age:</span>
                      <span className="ml-2">{calculateAge(selectedPatient.dateOfBirth)} years</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <User className="mr-2 h-4 w-4 text-slate-500" />
                      <span className="font-medium">Gender:</span>
                      <span className="ml-2 capitalize">{selectedPatient.gender}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="mr-2 h-4 w-4 text-slate-500" />
                      <span className="font-medium">Phone:</span>
                      <span className="ml-2">{selectedPatient.phone}</span>
                    </div>
                    {selectedPatient.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4 text-slate-500" />
                        <span className="font-medium">Email:</span>
                        <span className="ml-2">{selectedPatient.email}</span>
                      </div>
                    )}
                    {selectedPatient.address && (
                      <div className="flex items-start text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-slate-500 mt-0.5" />
                        <span className="font-medium">Address:</span>
                        <span className="ml-2">{selectedPatient.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 border-b pb-2">Medical Information</h4>
                  <div className="space-y-2">
                    {selectedPatient.bloodGroup && (
                      <div className="flex items-center text-sm">
                        <Activity className="mr-2 h-4 w-4 text-slate-500" />
                        <span className="font-medium">Blood Group:</span>
                        <span className="ml-2">{selectedPatient.bloodGroup}</span>
                      </div>
                    )}
                    {selectedPatient.allergies && (
                      <div className="text-sm">
                        <span className="font-medium">Allergies:</span>
                        <p className="mt-1 text-slate-600">{selectedPatient.allergies}</p>
                      </div>
                    )}
                    {selectedPatient.medicalHistory && (
                      <div className="text-sm">
                        <span className="font-medium">Medical History:</span>
                        <p className="mt-1 text-slate-600">{selectedPatient.medicalHistory}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedPatient.emergencyContact && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Emergency Contact</h4>
                  <div className="flex items-center text-sm space-x-4">
                    <span><strong>Name:</strong> {selectedPatient.emergencyContact}</span>
                    {selectedPatient.emergencyPhone && (
                      <span><strong>Phone:</strong> {selectedPatient.emergencyPhone}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Medical History Modal */}
      <Dialog open={medicalHistoryOpen} onOpenChange={setMedicalHistoryOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Medical History</DialogTitle>
            <DialogDescription>
              Complete medical history for {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">
                      {selectedPatient.medicalHistory || "No medical history recorded"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Allergies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">
                      {selectedPatient.allergies || "No allergies recorded"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Visit History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">No visit history available</p>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Prescriptions Modal */}
      <Dialog open={prescriptionsOpen} onOpenChange={setPrescriptionsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Prescriptions</DialogTitle>
            <DialogDescription>
              Current and past prescriptions for {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Prescriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">No current prescriptions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prescription History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">No prescription history available</p>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}