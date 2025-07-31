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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Eye,
  Edit,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Trash2,
  MoreVertical,
  UserPlus,
  Stethoscope,
  QrCode,
  Share2,
  Printer,
  Receipt,
  CalendarPlus,
  FileText,
  MessageSquare
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
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewPatientOpen, setViewPatientOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
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
      allergies: "",
      medicalHistory: "",
      insuranceProvider: "",
      insuranceNumber: "",
      loyaltyTier: "bronze",
      loyaltyPoints: 0,
      bloodGroup: "",
      isActive: true,
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
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
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
    if (!appointmentForm.patientId || !appointmentForm.appointmentDate || !appointmentForm.appointmentTime || !appointmentForm.serviceType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Combine date and time into appointmentDate timestamp
    const appointmentDateTime = new Date(`${appointmentForm.appointmentDate}T${appointmentForm.appointmentTime}`);
    
    // Map form data to match database schema
    const appointmentData = {
      patientId: appointmentForm.patientId,
      storeId: "5ff902af-3849-4ea6-945b-4d49175d6638", // Use the existing store from database
      appointmentDate: appointmentDateTime,
      service: appointmentForm.serviceType, // Map serviceType to service
      notes: appointmentForm.notes || "",
      status: "scheduled"
    };

    createAppointmentMutation.mutate(appointmentData);
  };

  const generatePatientPDF = (patient: Patient) => {
    const pdfWindow = window.open('', '_blank');
    if (pdfWindow) {
      pdfWindow.document.write(`
        <html>
          <head>
            <title>Patient Report - ${patient.firstName} ${patient.lastName}</title>
            <style>
              @page { size: A4; margin: 20mm; }
              body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; font-size: 12pt; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding: 30px 20px 20px 20px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 8px; }
              .header h1 { color: #2563eb; margin: 0 0 10px 0; font-size: 28pt; font-weight: 700; }
              .header h2 { color: #64748b; margin: 0 0 15px 0; font-size: 18pt; font-weight: 400; }
              .section { margin-bottom: 35px; page-break-inside: avoid; }
              .section h3 { background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: white; padding: 15px 20px; margin: 0 0 20px 0; border-radius: 8px; font-size: 16pt; font-weight: 600; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 20px; }
              .info-item { margin-bottom: 15px; padding: 12px; background: #f8fafc; border-left: 4px solid #e2e8f0; border-radius: 4px; }
              .label { font-weight: 600; color: #1e293b; display: inline-block; min-width: 140px; margin-right: 10px; }
              .value { color: #475569; font-weight: 400; }
              .footer { margin-top: 50px; text-align: center; padding: 20px; border-top: 2px solid #e2e8f0; color: #64748b; font-size: 10pt; }
              .no-print { text-align: center; margin: 30px 0; padding: 20px; }
              .print-btn { background: #2563eb; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 14pt; font-weight: 600; }
              @media print { body { margin: 0; } .no-print { display: none; } .header { background: #f0f9ff !important; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🏥 OptiStore Pro Medical Center</h1>
              <h2>Comprehensive Patient Medical Report</h2>
              <div class="report-info">
                <strong>Report Generated:</strong> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}<br>
                <strong>Patient ID:</strong> ${patient.patientCode}
              </div>
            </div>
            <div class="section">
              <h3>👤 Patient Demographics</h3>
              <div class="info-grid">
                <div>
                  <div class="info-item"><span class="label">Full Name:</span><span class="value">${patient.firstName} ${patient.lastName}</span></div>
                  <div class="info-item"><span class="label">Patient Code:</span><span class="value">${patient.patientCode}</span></div>
                  <div class="info-item"><span class="label">Date of Birth:</span><span class="value">${patient.dateOfBirth || 'Not specified'}</span></div>
                  <div class="info-item"><span class="label">Age:</span><span class="value">${calculateAge(patient.dateOfBirth)} years</span></div>
                  <div class="info-item"><span class="label">Gender:</span><span class="value">${patient.gender || 'Not specified'}</span></div>
                  <div class="info-item"><span class="label">Blood Group:</span><span class="value">${patient.bloodGroup || 'Not tested'}</span></div>
                </div>
                <div>
                  <div class="info-item"><span class="label">Phone:</span><span class="value">${patient.phone || 'Not provided'}</span></div>
                  <div class="info-item"><span class="label">Email:</span><span class="value">${patient.email || 'Not provided'}</span></div>
                  <div class="info-item"><span class="label">Address:</span><span class="value">${patient.address || 'Not provided'}</span></div>
                  <div class="info-item"><span class="label">Emergency Contact:</span><span class="value">${patient.emergencyContact || 'Not provided'}</span></div>
                  <div class="info-item"><span class="label">Emergency Phone:</span><span class="value">${patient.emergencyPhone || 'Not provided'}</span></div>
                  <div class="info-item"><span class="label">Patient Status:</span><span class="value" style="color: ${patient.isActive ? '#10b981' : '#ef4444'}; font-weight: 600;">${patient.isActive ? '✅ Active' : '❌ Inactive'}</span></div>
                </div>
              </div>
            </div>
            <div class="section">
              <h3>🏥 Medical Information</h3>
              <div class="info-item"><span class="label">Known Allergies:</span><span class="value">${patient.allergies || 'None reported'}</span></div>
              <div class="info-item"><span class="label">Medical History:</span><span class="value">${patient.medicalHistory || 'No significant history recorded'}</span></div>
            </div>
            <div class="section">
              <h3>🏥 Insurance & Account Information</h3>
              <div class="info-grid">
                <div>
                  <div class="info-item"><span class="label">Insurance Provider:</span><span class="value">${patient.insuranceProvider || 'Self-pay'}</span></div>
                  <div class="info-item"><span class="label">Policy Number:</span><span class="value">${patient.insuranceNumber || 'N/A'}</span></div>
                </div>
                <div>
                  <div class="info-item"><span class="label">Loyalty Tier:</span><span class="value" style="color: ${patient.loyaltyTier === 'gold' ? '#f59e0b' : patient.loyaltyTier === 'silver' ? '#6b7280' : '#cd7f32'}; font-weight: 600;">${(patient.loyaltyTier || 'Bronze').toUpperCase()}</span></div>
                  <div class="info-item"><span class="label">Loyalty Points:</span><span class="value">${patient.loyaltyPoints || 0} points</span></div>
                </div>
              </div>
            </div>
            <div class="footer">
              <p><strong>OptiStore Pro Medical Center</strong></p>
              <p>📞 Contact: +1 (555) 123-4567 | 📧 Email: info@optistorepro.com</p>
              <p>🏥 Address: 123 Medical Plaza, Healthcare District, City 12345</p>
              <p style="margin-top: 20px; font-style: italic;">This report is confidential and intended solely for the use of the patient and authorized healthcare providers.</p>
              <p style="color: #64748b; font-size: 9pt;">Generated by OptiStore Pro Medical Management System v2.0 | Report ID: RPT-${Date.now()}</p>
            </div>
            <div class="no-print"><button onclick="window.print()" class="print-btn">📄 Print Professional Report</button></div>
          </body>
        </html>
      `);
      pdfWindow.document.close();
    }
    
    toast({
      title: "Professional Patient Report Generated",
      description: `Comprehensive A4 medical report for ${patient.firstName} ${patient.lastName} ready for printing`,
    });
  };

  const filteredPatients = (patients as Patient[]).filter((patient: Patient) =>
    patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone && patient.phone.includes(searchTerm))
  );

  const calculateAge = (dateOfBirth: string | null) => {
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
      <Tabs defaultValue="patients" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Patients ({(patients as Patient[]).length})
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Appointments ({(appointments as any[]).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{(patients as Patient[]).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{(patients as Patient[]).filter(p => p.isActive).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">{(appointments as any[]).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Stethoscope className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">{(appointments as any[]).filter(a => new Date(a.appointmentDate).getMonth() === new Date().getMonth()).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patients Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Patients</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    New Patient
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
                                    <Input type="date" {...field} value={field.value || ""} />
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
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                    <Input {...field} value={field.value || ""} placeholder="Enter phone number" />
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
                                    <Input {...field} value={field.value || ""} type="email" placeholder="Enter email address" />
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
                                  <FormLabel>Emergency Contact Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} value={field.value || ""} placeholder="Enter emergency contact name" />
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
                                  <FormLabel>Emergency Contact Phone</FormLabel>
                                  <FormControl>
                                    <Input {...field} value={field.value || ""} placeholder="Enter emergency contact phone" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>

                        {/* Medical Information Tab */}
                        <TabsContent value="medical" className="space-y-4">
                          <FormField
                            control={form.control}
                            name="allergies"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Known Allergies</FormLabel>
                                <FormControl>
                                  <Textarea {...field} value={field.value || ""} placeholder="List any known allergies..." />
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
                                  <Textarea {...field} value={field.value || ""} placeholder="Enter relevant medical history..." />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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
                                    <Input {...field} value={field.value || ""} placeholder="Enter insurance provider" />
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
                                    <Input {...field} value={field.value || ""} placeholder="Enter policy number" />
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
                                  <Select onValueChange={field.onChange} defaultValue={field.value || "bronze"}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select loyalty tier" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="bronze">Bronze</SelectItem>
                                      <SelectItem value="silver">Silver</SelectItem>
                                      <SelectItem value="gold">Gold</SelectItem>
                                      <SelectItem value="platinum">Platinum</SelectItem>
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
                                  <FormLabel>Starting Loyalty Points</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      type="number" 
                                      placeholder="0" 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>

                        <div className="flex justify-end space-x-2 pt-4 border-t">
                          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createPatientMutation.isPending}>
                            {createPatientMutation.isPending ? "Registering..." : "Register Patient"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Patients Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Patient #</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Patient Name</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Contact</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Age</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Blood Group</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Status</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <div className="text-gray-500">
                          <User className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <h3 className="text-lg font-medium mb-2">No patients found</h3>
                          <p>Start by registering your first patient</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((patient: Patient) => (
                      <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="font-medium text-blue-600">{patient.patientCode}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {patient.firstName[0]}{patient.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</div>
                              <div className="text-sm text-gray-500">{patient.email || 'No email'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            <div className="text-gray-900">{patient.phone}</div>
                            <div className="text-gray-500">{patient.gender}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">{calculateAge(patient.dateOfBirth)} years</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">{patient.bloodGroup || '-'}</div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant={patient.isActive ? "default" : "secondary"}>
                            {patient.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => {
                                setSelectedPatient(patient);
                                setViewPatientOpen(true);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedPatient(patient);
                                generatePatientPDF(patient);
                              }}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print Report
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedPatient(patient);
                                setShareModalOpen(true);
                              }}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">{(appointments as any[]).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">{(appointments as any[]).filter((a: any) => new Date(a.appointmentDate).toDateString() === new Date().toDateString()).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-gray-900">{(appointments as any[]).filter((a: any) => {
                      const appointmentDate = new Date(a.appointmentDate);
                      const today = new Date();
                      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                      const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
                      return appointmentDate >= weekStart && appointmentDate <= weekEnd;
                    }).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Scheduled</p>
                    <p className="text-2xl font-bold text-gray-900">{(appointments as any[]).filter((a: any) => a.status === 'scheduled').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointments Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search appointments..."
                  className="pl-10 w-64"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Dialog open={appointmentOpen} onOpenChange={setAppointmentOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    New Appointment
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
                            {(patients as Patient[]).map((patient: Patient) => (
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

          {/* Appointments Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Appointment #</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Patient Name</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Service</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Date & Time</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Status</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(appointments as any[]).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <div className="text-gray-500">
                          <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <h3 className="text-lg font-medium mb-2">No appointments scheduled</h3>
                          <p>Start by scheduling your first appointment</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    (appointments as any[]).map((appointment: any) => (
                      <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="font-medium text-blue-600">APT-{appointment.id.slice(0, 8)}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {(patients as Patient[]).find(p => p.id === appointment.patientId)?.firstName[0]}{(patients as Patient[]).find(p => p.id === appointment.patientId)?.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">
                                {(patients as Patient[]).find(p => p.id === appointment.patientId)?.firstName} {(patients as Patient[]).find(p => p.id === appointment.patientId)?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{(patients as Patient[]).find(p => p.id === appointment.patientId)?.patientCode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">{appointment.service}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            <div className="text-gray-900">{new Date(appointment.appointmentDate).toLocaleDateString()}</div>
                            <div className="text-gray-500">{new Date(appointment.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant={appointment.status === 'scheduled' ? 'default' : 'secondary'}>
                            {appointment.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Appointment
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Patient Details Modal */}
      <Dialog open={viewPatientOpen} onOpenChange={setViewPatientOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>
              Comprehensive information for {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div><strong>Name:</strong> {selectedPatient.firstName} {selectedPatient.lastName}</div>
                    <div><strong>Patient Code:</strong> {selectedPatient.patientCode}</div>
                    <div><strong>Date of Birth:</strong> {selectedPatient.dateOfBirth}</div>
                    <div><strong>Age:</strong> {calculateAge(selectedPatient.dateOfBirth)} years</div>
                    <div><strong>Gender:</strong> {selectedPatient.gender}</div>
                    <div><strong>Blood Group:</strong> {selectedPatient.bloodGroup || 'N/A'}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div><strong>Phone:</strong> {selectedPatient.phone}</div>
                    <div><strong>Email:</strong> {selectedPatient.email || 'N/A'}</div>
                    <div><strong>Address:</strong> {selectedPatient.address || 'N/A'}</div>
                    <div><strong>Emergency Contact:</strong> {selectedPatient.emergencyContact || 'N/A'}</div>
                    <div><strong>Emergency Phone:</strong> {selectedPatient.emergencyPhone || 'N/A'}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Medical Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div><strong>Allergies:</strong> {selectedPatient.allergies || 'None recorded'}</div>
                    <div><strong>Medical History:</strong> {selectedPatient.medicalHistory || 'None recorded'}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Insurance & Loyalty</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div><strong>Insurance Provider:</strong> {selectedPatient.insuranceProvider || 'N/A'}</div>
                    <div><strong>Policy Number:</strong> {selectedPatient.insuranceNumber || 'N/A'}</div>
                    <div><strong>Loyalty Tier:</strong> {selectedPatient.loyaltyTier || 'Bronze'}</div>
                    <div><strong>Loyalty Points:</strong> {selectedPatient.loyaltyPoints || 0}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Patient Information</DialogTitle>
            <DialogDescription>
              Choose how you'd like to share {selectedPatient?.firstName} {selectedPatient?.lastName}'s information
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-16 flex flex-col items-center space-y-2"
                  onClick={() => {
                    generatePatientPDF(selectedPatient);
                    setShareModalOpen(false);
                  }}
                >
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">PDF Report</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-16 flex flex-col items-center space-y-2"
                  onClick={() => {
                    const shareText = `Patient: ${selectedPatient.firstName} ${selectedPatient.lastName}\nCode: ${selectedPatient.patientCode}\nPhone: ${selectedPatient.phone}`;
                    navigator.clipboard.writeText(shareText);
                    toast({
                      title: "Copied",
                      description: "Patient information copied to clipboard",
                    });
                    setShareModalOpen(false);
                  }}
                >
                  <Share2 className="h-6 w-6" />
                  <span className="text-sm">Copy Info</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}