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
              @page { 
                size: A4; 
                margin: 20mm; 
              }
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333;
                margin: 0;
                padding: 0;
                font-size: 12pt;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 3px solid #2563eb; 
                padding-bottom: 20px;
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                padding: 30px 20px 20px 20px;
                border-radius: 8px;
                margin-bottom: 40px;
              }
              .header h1 { 
                color: #2563eb; 
                margin: 0 0 10px 0; 
                font-size: 28pt;
                font-weight: 700;
              }
              .header h2 { 
                color: #64748b; 
                margin: 0 0 15px 0; 
                font-size: 18pt;
                font-weight: 400;
              }
              .header .report-info {
                background: white;
                padding: 15px;
                border-radius: 6px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-top: 20px;
              }
              .section { 
                margin-bottom: 35px; 
                page-break-inside: avoid;
              }
              .section h3 { 
                background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
                color: white;
                padding: 15px 20px;
                margin: 0 0 20px 0;
                border-radius: 8px;
                font-size: 16pt;
                font-weight: 600;
                box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
              }
              .info-grid { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 30px; 
                margin-bottom: 20px;
              }
              .info-item { 
                margin-bottom: 15px; 
                padding: 12px;
                background: #f8fafc;
                border-left: 4px solid #e2e8f0;
                border-radius: 4px;
              }
              .label { 
                font-weight: 600; 
                color: #1e293b;
                display: inline-block;
                min-width: 140px;
                margin-right: 10px;
              }
              .value {
                color: #475569;
                font-weight: 400;
              }
              .footer {
                margin-top: 50px;
                text-align: center;
                padding: 20px;
                border-top: 2px solid #e2e8f0;
                color: #64748b;
                font-size: 10pt;
              }
              .no-print {
                text-align: center;
                margin: 30px 0;
                padding: 20px;
              }
              .print-btn {
                background: #2563eb;
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14pt;
                font-weight: 600;
              }
              @media print { 
                body { margin: 0; }
                .no-print { display: none; }
                .header { background: #f0f9ff !important; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🏥 OptiStore Pro Medical Center</h1>
              <h2>Comprehensive Patient Medical Report</h2>
              <div class="report-info">
                <strong>Report Generated:</strong> ${new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}<br>
                <strong>Patient ID:</strong> ${patient.patientCode}
              </div>
            </div>

            <div class="section">
              <h3>👤 Patient Demographics</h3>
              <div class="info-grid">
                <div>
                  <div class="info-item">
                    <span class="label">Full Name:</span>
                    <span class="value">${patient.firstName} ${patient.lastName}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Patient Code:</span>
                    <span class="value">${patient.patientCode}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Date of Birth:</span>
                    <span class="value">${patient.dateOfBirth || 'Not specified'}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Age:</span>
                    <span class="value">${calculateAge(patient.dateOfBirth)} years</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Gender:</span>
                    <span class="value">${patient.gender || 'Not specified'}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Blood Group:</span>
                    <span class="value">${patient.bloodGroup || 'Not tested'}</span>
                  </div>
                </div>
                <div>
                  <div class="info-item">
                    <span class="label">Phone:</span>
                    <span class="value">${patient.phone || 'Not provided'}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Email:</span>
                    <span class="value">${patient.email || 'Not provided'}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Address:</span>
                    <span class="value">${patient.address || 'Not provided'}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Emergency Contact:</span>
                    <span class="value">${patient.emergencyContact || 'Not provided'}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Emergency Phone:</span>
                    <span class="value">${patient.emergencyPhone || 'Not provided'}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Patient Status:</span>
                    <span class="value" style="color: ${patient.isActive ? '#10b981' : '#ef4444'}; font-weight: 600;">
                      ${patient.isActive ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="section">
              <h3>🏥 Medical Information</h3>
              <div class="info-item">
                <span class="label">Known Allergies:</span>
                <span class="value">${patient.allergies || 'None reported'}</span>
              </div>
              <div class="info-item">
                <span class="label">Medical History:</span>
                <span class="value">${patient.medicalHistory || 'No significant history recorded'}</span>
              </div>
            </div>

            <div class="section">
              <h3>🏥 Insurance & Account Information</h3>
              <div class="info-grid">
                <div>
                  <div class="info-item">
                    <span class="label">Insurance Provider:</span>
                    <span class="value">${patient.insuranceProvider || 'Self-pay'}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Policy Number:</span>
                    <span class="value">${patient.insuranceNumber || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <div class="info-item">
                    <span class="label">Loyalty Tier:</span>
                    <span class="value" style="color: ${patient.loyaltyTier === 'gold' ? '#f59e0b' : patient.loyaltyTier === 'silver' ? '#6b7280' : '#cd7f32'}; font-weight: 600;">
                      ${(patient.loyaltyTier || 'Bronze').toUpperCase()}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="label">Loyalty Points:</span>
                    <span class="value">${patient.loyaltyPoints || 0} points</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="footer">
              <p><strong>OptiStore Pro Medical Center</strong></p>
              <p>📞 Contact: +1 (555) 123-4567 | 📧 Email: info@optistorepro.com</p>
              <p>🏥 Address: 123 Medical Plaza, Healthcare District, City 12345</p>
              <p style="margin-top: 20px; font-style: italic;">
                This report is confidential and intended solely for the use of the patient and authorized healthcare providers.
              </p>
              <p style="color: #64748b; font-size: 9pt;">
                Generated by OptiStore Pro Medical Management System v2.0 | Report ID: RPT-${Date.now()}
              </p>
            </div>

            <div class="no-print">
              <button onclick="window.print()" class="print-btn">📄 Print Professional Report</button>
            </div>
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

  const filteredPatients = patients.filter((patient: Patient) =>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Medical Practice Management</h1>
          <p className="text-slate-600">Comprehensive patient care and appointment coordination</p>
        </div>
      </div>

      <Tabs defaultValue="patients" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Patients ({patients.length})
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Appointments ({appointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-6">
          {/* Patients Tab Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                                    <Input {...field} type="email" placeholder="Enter email address" />
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
                                    <Textarea {...field} placeholder="Enter full address" />
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
                                    <Input {...field} placeholder="Enter emergency contact name" />
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
                                    <Input {...field} placeholder="Enter emergency contact phone" />
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
                                  <Textarea {...field} placeholder="List any known allergies..." />
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
                                  <Textarea {...field} placeholder="Enter relevant medical history..." />
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
                                    <Input {...field} placeholder="Enter insurance provider" />
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
                                    <Input {...field} placeholder="Enter policy number" />
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
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            </div>
          </div>

          {/* Patients Grid */}
          <div className="grid gap-4">
            {filteredPatients.length === 0 ? (
              <Card className="p-8">
                <div className="text-center text-gray-500">
                  <User className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No patients found</h3>
                  <p>Start by registering your first patient</p>
                </div>
              </Card>
            ) : (
              filteredPatients.map((patient: Patient) => (
                <Card key={patient.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {patient.firstName[0]}{patient.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{patient.firstName} {patient.lastName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {patient.patientCode} • Age: {calculateAge(patient.dateOfBirth)}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-muted-foreground flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {patient.phone}
                          </span>
                          {patient.email && (
                            <span className="text-sm text-muted-foreground flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {patient.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={patient.isActive ? "default" : "secondary"}>
                        {patient.isActive ? "Active" : "Inactive"}
                      </Badge>
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
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          {/* Appointments Tab Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex space-x-3">
              <Dialog open={appointmentOpen} onOpenChange={setAppointmentOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Schedule Appointment
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

          {/* Appointments Grid */}
          <div className="grid gap-4">
            {appointments.length === 0 ? (
              <Card className="p-8">
                <div className="text-center text-gray-500">
                  <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No appointments scheduled</h3>
                  <p>Start by scheduling your first appointment</p>
                </div>
              </Card>
            ) : (
              appointments.map((appointment: any) => (
                <Card key={appointment.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {patients.find(p => p.id === appointment.patientId)?.firstName} {patients.find(p => p.id === appointment.patientId)?.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {appointment.service} • {new Date(appointment.appointmentDate).toLocaleDateString()} at {new Date(appointment.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{appointment.notes}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant={appointment.status === 'scheduled' ? 'default' : 'secondary'}>
                      {appointment.status}
                    </Badge>
                  </div>
                </Card>
              ))
            )}
          </div>
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