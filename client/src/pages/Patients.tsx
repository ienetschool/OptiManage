import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  MoreHorizontal,
  FileText,
  Trash2,
  Pill,
  QrCode,
  Share2,
  Printer,
  Receipt,
  Filter,
  SortAsc,
  SortDesc,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  insertPatientSchema, 
  insertAppointmentSchema,
  type Patient, 
  type InsertPatient,
  type Appointment,
  type InsertAppointment
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Patients() {
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [sortBy, setSortBy] = useState("firstName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [activeTab, setActiveTab] = useState("patients");
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch patients
  const { data: patients = [], isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  // Fetch appointments
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  // Patient form
  const patientForm = useForm<InsertPatient>({
    resolver: zodResolver(insertPatientSchema),
    defaultValues: {
      patientCode: `PAT-${Date.now().toString().slice(-6)}`,
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "male" as const,
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
      loyaltyTier: "bronze" as const,
      loyaltyPoints: 0,
      customFields: {},
    },
  });

  // Appointment form
  const appointmentForm = useForm<InsertAppointment>({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: {
      customerId: "",
      storeId: "",
      staffId: "",
      appointmentDate: new Date(),
      duration: 30,
      service: "",
      status: "scheduled" as const,
      notes: "",
    },
  });

  // Patient mutations
  const createPatientMutation = useMutation({
    mutationFn: async (data: InsertPatient) => {
      const response = await apiRequest("POST", "/api/patients", data);
      return response.json();
    },
    onSuccess: (newPatient) => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.setQueryData(["/api/patients"], (oldData: any) => {
        if (oldData) {
          return [...oldData, newPatient];
        }
        return [newPatient];
      });
      
      toast({
        title: "Patient Registered",
        description: "Patient has been successfully registered.",
      });
      setPatientDialogOpen(false);
      patientForm.reset({
        patientCode: `PAT-${Date.now().toString().slice(-6)}`,
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "male" as const,
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
        loyaltyTier: "bronze" as const,
        loyaltyPoints: 0,
        customFields: {},
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

  const updatePatientMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<InsertPatient> }) => {
      const response = await apiRequest("PATCH", `/api/patients/${data.id}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({
        title: "Patient Updated",
        description: "Patient information has been updated.",
      });
      setPatientDialogOpen(false);
      setEditingPatient(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update patient.",
        variant: "destructive",
      });
    },
  });

  const deletePatientMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/patients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({
        title: "Patient Deleted",
        description: "Patient has been deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete patient.",
        variant: "destructive",
      });
    },
  });

  // Appointment mutations
  const createAppointmentMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      const response = await apiRequest("POST", "/api/appointments", data);
      return response.json();
    },
    onSuccess: (newAppointment) => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.setQueryData(["/api/appointments"], (oldData: any) => {
        if (oldData) {
          return [...oldData, newAppointment];
        }
        return [newAppointment];
      });
      
      toast({
        title: "Appointment Scheduled",
        description: "Appointment has been successfully scheduled.",
      });
      setAppointmentDialogOpen(false);
      appointmentForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule appointment.",
        variant: "destructive",
      });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<InsertAppointment> }) => {
      const response = await apiRequest("PATCH", `/api/appointments/${data.id}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment Updated",
        description: "Appointment has been updated.",
      });
      setAppointmentDialogOpen(false);
      setEditingAppointment(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update appointment.",
        variant: "destructive",
      });
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/appointments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment Cancelled",
        description: "Appointment has been cancelled.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel appointment.",
        variant: "destructive",
      });
    },
  });

  // Form handlers
  const onPatientSubmit = (data: InsertPatient) => {
    if (editingPatient) {
      updatePatientMutation.mutate({ id: editingPatient.id, updates: data });
    } else {
      createPatientMutation.mutate(data);
    }
  };

  const onAppointmentSubmit = (data: InsertAppointment) => {
    if (editingAppointment) {
      updateAppointmentMutation.mutate({ id: editingAppointment.id, updates: data });
    } else {
      createAppointmentMutation.mutate(data);
    }
  };

  // Helper functions
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Action handlers
  const handleViewDetails = (patient: Patient) => {
    const patientInfo = `
Patient Details

Name: ${patient.firstName} ${patient.lastName}
Patient Code: ${patient.patientCode}
Age: ${calculateAge(patient.dateOfBirth || '')} years
Gender: ${patient.gender}
Phone: ${patient.phone || 'N/A'}
Email: ${patient.email || 'N/A'}
Blood Group: ${patient.bloodGroup || 'N/A'}
Emergency Contact: ${patient.emergencyContact || 'N/A'}
Insurance: ${patient.insuranceProvider || 'N/A'}
Status: ${patient.isActive ? 'Active' : 'Inactive'}
    `;
    
    alert(patientInfo);
    toast({
      title: "Patient Details",
      description: `Viewing details for ${patient.firstName} ${patient.lastName}`,
    });
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    patientForm.reset({
      patientCode: patient.patientCode,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth || "",
      gender: patient.gender,
      phone: patient.phone || "",
      email: patient.email || "",
      address: patient.address || "",
      emergencyContact: patient.emergencyContact || "",
      emergencyPhone: patient.emergencyPhone || "",
      bloodGroup: patient.bloodGroup || "",
      allergies: patient.allergies || "",
      medicalHistory: patient.medicalHistory || "",
      insuranceProvider: patient.insuranceProvider || "",
      insuranceNumber: patient.insuranceNumber || "",
      isActive: patient.isActive,
      loyaltyTier: patient.loyaltyTier,
      loyaltyPoints: patient.loyaltyPoints || 0,
      customFields: patient.customFields || {},
    });
    setPatientDialogOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    appointmentForm.reset({
      customerId: appointment.customerId,
      storeId: appointment.storeId,
      staffId: appointment.staffId || "",
      appointmentDate: new Date(appointment.appointmentDate),
      duration: appointment.duration,
      service: appointment.service,
      status: appointment.status,
      notes: appointment.notes || "",
    });
    setAppointmentDialogOpen(true);
  };

  const handleViewMedicalHistory = (patient: Patient) => {
    toast({
      title: "Medical History",
      description: `Loading medical history for ${patient.firstName} ${patient.lastName}`,
    });
  };

  const handleViewPrescriptions = (patient: Patient) => {
    toast({
      title: "Prescriptions",
      description: `Loading prescriptions for ${patient.firstName} ${patient.lastName}`,
    });
  };

  const handleGenerateInvoice = (patient: Patient) => {
    toast({
      title: "Invoice Generated",
      description: `Creating invoice for ${patient.firstName} ${patient.lastName}`,
    });
  };

  const handlePrintPatientDetails = (patient: Patient) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Patient Record - ${patient.firstName} ${patient.lastName}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Times New Roman', serif; 
                line-height: 1.6; 
                color: #000;
                background: #fff;
                font-size: 12pt;
                padding: 20mm;
              }
              .letterhead { 
                text-align: center;
                border-bottom: 3px solid #2563eb;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .clinic-name { 
                font-size: 24pt; 
                font-weight: bold; 
                color: #2563eb;
                margin-bottom: 5px;
              }
              .patient-card {
                border: 2px solid #2563eb;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
              }
              .info-row { 
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 8px 0;
                border-bottom: 1px dotted #ccc;
              }
              .label { font-weight: bold; }
              .footer { 
                margin-top: 30px;
                text-align: center;
                font-size: 10pt;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="letterhead">
              <div class="clinic-name">OptiStore Pro Medical Center</div>
              <div>Patient Medical Record</div>
            </div>

            <div class="patient-card">
              <div class="info-row">
                <span class="label">Patient Name:</span>
                <span>${patient.firstName} ${patient.lastName}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Patient Code:</span>
                <span>${patient.patientCode}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Age:</span>
                <span>${calculateAge(patient.dateOfBirth || '')} years</span>
              </div>
              
              <div class="info-row">
                <span class="label">Gender:</span>
                <span>${patient.gender}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Phone:</span>
                <span>${patient.phone || 'N/A'}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Email:</span>
                <span>${patient.email || 'N/A'}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Blood Group:</span>
                <span>${patient.bloodGroup || 'N/A'}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Emergency Contact:</span>
                <span>${patient.emergencyContact || 'N/A'}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Insurance:</span>
                <span>${patient.insuranceProvider || 'N/A'}</span>
              </div>
              
              ${patient.allergies ? `
              <div class="info-row">
                <span class="label">Allergies:</span>
                <span>${patient.allergies}</span>
              </div>
              ` : ''}
              
              ${patient.medicalHistory ? `
              <div class="info-row">
                <span class="label">Medical History:</span>
                <span>${patient.medicalHistory}</span>
              </div>
              ` : ''}
            </div>

            <div class="footer">
              <p><strong>OptiStore Pro Medical Center</strong></p>
              <p>Generated on ${new Date().toLocaleString()}</p>
              <p>For questions, please contact us at (555) 123-EYES</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
    
    toast({
      title: "Patient Record Printed",
      description: `Medical record for ${patient.firstName} ${patient.lastName} ready for printing.`,
    });
  };

  const handleSharePatient = (patient: Patient) => {
    const patientInfo = `Patient Information\n\nName: ${patient.firstName} ${patient.lastName}\nPatient Code: ${patient.patientCode}\nPhone: ${patient.phone || 'N/A'}\nEmail: ${patient.email || 'N/A'}\nBlood Group: ${patient.bloodGroup || 'N/A'}\nAllergies: ${patient.allergies || 'None'}\nInsurance: ${patient.insuranceProvider || 'N/A'}\n\nOptiStore Pro Medical Center\nPhone: (555) 123-EYES`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(patientInfo).then(() => {
        toast({
          title: "Copied to Clipboard",
          description: "Patient information copied to clipboard.",
        });
      });
    }
  };

  const handlePrintAppointmentDetails = (appointment: Appointment) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Appointment Details</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Times New Roman', serif; 
                line-height: 1.6; 
                color: #000;
                background: #fff;
                font-size: 12pt;
                padding: 20mm;
              }
              .letterhead { 
                text-align: center;
                border-bottom: 3px solid #2563eb;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .clinic-name { 
                font-size: 24pt; 
                font-weight: bold; 
                color: #2563eb;
                margin-bottom: 5px;
              }
              .appointment-card {
                border: 2px solid #2563eb;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
              }
              .info-row { 
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 8px 0;
                border-bottom: 1px dotted #ccc;
              }
              .label { font-weight: bold; }
              .footer { 
                margin-top: 30px;
                text-align: center;
                font-size: 10pt;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="letterhead">
              <div class="clinic-name">OptiStore Pro Medical Center</div>
              <div>Appointment Confirmation</div>
            </div>

            <div class="appointment-card">
              <div class="info-row">
                <span class="label">Patient:</span>
                <span>${appointment.customer?.firstName || 'N/A'} ${appointment.customer?.lastName || 'N/A'}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Date:</span>
                <span>${new Date(appointment.appointmentDate).toLocaleDateString()}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Time:</span>
                <span>${new Date(appointment.appointmentDate).toLocaleTimeString()}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Service:</span>
                <span>${appointment.service}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Duration:</span>
                <span>${appointment.duration} minutes</span>
              </div>
              
              <div class="info-row">
                <span class="label">Status:</span>
                <span>${appointment.status}</span>
              </div>
              
              ${appointment.notes ? `
              <div class="info-row">
                <span class="label">Notes:</span>
                <span>${appointment.notes}</span>
              </div>
              ` : ''}
            </div>

            <div class="footer">
              <p><strong>OptiStore Pro Medical Center</strong></p>
              <p>Generated on ${new Date().toLocaleString()}</p>
              <p>For questions, please contact us at (555) 123-EYES</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
    
    toast({
      title: "Appointment Details Printed",
      description: "Appointment confirmation ready for printing.",
    });
  };

  const handleShareAppointment = (appointment: Appointment) => {
    const appointmentInfo = `Appointment Details\n\nPatient: ${appointment.customer?.firstName || 'N/A'} ${appointment.customer?.lastName || 'N/A'}\nDate: ${new Date(appointment.appointmentDate).toLocaleDateString()}\nTime: ${new Date(appointment.appointmentDate).toLocaleTimeString()}\nService: ${appointment.service}\nDuration: ${appointment.duration} minutes\nStatus: ${appointment.status}\n\nOptiStore Pro Medical Center\nPhone: (555) 123-EYES`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(appointmentInfo).then(() => {
        toast({
          title: "Copied to Clipboard",
          description: "Appointment details copied to clipboard.",
        });
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      scheduled: "default",
      completed: "secondary", 
      cancelled: "destructive",
      "in-progress": "outline"
    };
    return variants[status] || "outline";
  };

  // Filter and sort data
  const filteredPatients = patients
    .filter(patient => {
      const matchesSearch = 
        patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.phone && patient.phone.includes(searchTerm)) ||
        (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesGender = filterGender === "all" || patient.gender === filterGender;
      const matchesStatus = filterStatus === "all" || 
        (filterStatus === "active" && patient.isActive) ||
        (filterStatus === "inactive" && !patient.isActive);
      
      return matchesSearch && matchesGender && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof Patient] || "";
      const bValue = b[sortBy as keyof Patient] || "";
      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const filteredAppointments = appointments
    .filter(appointment => {
      const matchesSearch = 
        (appointment.customer?.firstName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appointment.customer?.lastName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = new Date(a.appointmentDate).getTime();
      const bValue = new Date(b.appointmentDate).getTime();
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-primary">Patient & Appointment Management</CardTitle>
              <CardDescription className="text-lg mt-2">
                Comprehensive medical practice management system
              </CardDescription>
            </div>
            <div className="flex space-x-3">
              <Dialog open={patientDialogOpen} onOpenChange={setPatientDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => { 
                      setEditingPatient(null); 
                      patientForm.reset({
                        patientCode: `PAT-${Date.now().toString().slice(-6)}`,
                        firstName: "",
                        lastName: "",
                        dateOfBirth: "",
                        gender: "male" as const,
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
                        loyaltyTier: "bronze" as const,
                        loyaltyPoints: 0,
                        customFields: {},
                      }); 
                    }}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Patient
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">
                      {editingPatient ? "Edit Patient Information" : "Register New Patient"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingPatient ? "Update patient medical information and details." : "Add a new patient to the medical records system."}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...patientForm}>
                    <form onSubmit={patientForm.handleSubmit(onPatientSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField
                          control={patientForm.control}
                          name="patientCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Patient Code</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="PAT-001" readOnly className="bg-gray-50" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={patientForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="John" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={patientForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Doe" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={patientForm.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Birth</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={patientForm.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender</FormLabel>
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
                          control={patientForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="+1 (555) 123-4567" value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={patientForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="john@example.com" type="email" value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={patientForm.control}
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
                          control={patientForm.control}
                          name="emergencyContact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emergency Contact</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Jane Doe" value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={patientForm.control}
                          name="emergencyPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emergency Phone</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="+1 (555) 987-6543" value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={patientForm.control}
                          name="insuranceProvider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Insurance Provider</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Blue Cross Blue Shield" value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={patientForm.control}
                          name="insuranceNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Insurance Number</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="ABC123456789" value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={patientForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="123 Main St, City, State 12345" value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={patientForm.control}
                          name="allergies"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Known Allergies</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="List any known allergies..." value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={patientForm.control}
                          name="medicalHistory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Medical History</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Brief medical history..." value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button type="button" variant="outline" size="lg" onClick={() => setPatientDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" size="lg" disabled={createPatientMutation.isPending || updatePatientMutation.isPending}>
                          {createPatientMutation.isPending || updatePatientMutation.isPending ? "Saving..." : (editingPatient ? "Update Patient" : "Register Patient")}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              <Dialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => { 
                      setEditingAppointment(null); 
                      appointmentForm.reset(); 
                    }}
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Appointment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">
                      {editingAppointment ? "Edit Appointment" : "Schedule New Appointment"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingAppointment ? "Update appointment details." : "Schedule a new appointment for a patient."}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...appointmentForm}>
                    <form onSubmit={appointmentForm.handleSubmit(onAppointmentSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={appointmentForm.control}
                          name="customerId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Patient *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select patient" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {patients.map((patient) => (
                                    <SelectItem key={patient.id} value={patient.id}>
                                      {patient.firstName} {patient.lastName} - {patient.patientCode}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={appointmentForm.control}
                          name="appointmentDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Appointment Date & Time *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="datetime-local" 
                                  {...field} 
                                  value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                                  onChange={(e) => field.onChange(new Date(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={appointmentForm.control}
                          name="service"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select service" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Comprehensive Eye Exam">Comprehensive Eye Exam</SelectItem>
                                  <SelectItem value="Contact Lens Fitting">Contact Lens Fitting</SelectItem>
                                  <SelectItem value="Glasses Prescription">Glasses Prescription</SelectItem>
                                  <SelectItem value="Follow-up Visit">Follow-up Visit</SelectItem>
                                  <SelectItem value="Emergency Consultation">Emergency Consultation</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={appointmentForm.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration (minutes)</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="15">15 minutes</SelectItem>
                                  <SelectItem value="30">30 minutes</SelectItem>
                                  <SelectItem value="45">45 minutes</SelectItem>
                                  <SelectItem value="60">60 minutes</SelectItem>
                                  <SelectItem value="90">90 minutes</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={appointmentForm.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="scheduled">Scheduled</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={appointmentForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Additional notes or special instructions..." value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button type="button" variant="outline" size="lg" onClick={() => setAppointmentDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" size="lg" disabled={createAppointmentMutation.isPending || updateAppointmentMutation.isPending}>
                          {createAppointmentMutation.isPending || updateAppointmentMutation.isPending ? "Saving..." : (editingAppointment ? "Update Appointment" : "Schedule Appointment")}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="patients" className="flex items-center space-x-2 text-lg">
                <User className="h-5 w-5" />
                <span>Patients ({filteredPatients.length})</span>
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center space-x-2 text-lg">
                <Calendar className="h-5 w-5" />
                <span>Appointments ({filteredAppointments.length})</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={activeTab === "patients" ? "Search patients by name, code, phone, or email..." : "Search appointments..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48 h-12">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {activeTab === "patients" && (
                <Select value={filterGender} onValueChange={setFilterGender}>
                  <SelectTrigger className="w-full sm:w-40 h-12">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </Button>
            </div>

            <TabsContent value="patients" className="space-y-4">
              {patientsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="mt-4 text-muted-foreground">Loading patients...</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredPatients.map((patient) => (
                    <Card key={patient.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                              {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold text-xl text-gray-900">
                                {patient.firstName} {patient.lastName}
                              </h3>
                              <div className="flex items-center space-x-6 text-sm text-muted-foreground mt-2">
                                <span className="font-medium">ID: {patient.patientCode}</span>
                                <span>Age: {calculateAge(patient.dateOfBirth || '')} years</span>
                                <span className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {patient.phone || 'N/A'}
                                </span>
                                <span className="flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {patient.email || 'N/A'}
                                </span>
                                <Badge variant={patient.isActive ? "default" : "secondary"} className="ml-2">
                                  {patient.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-gray-100">
                                  <MoreHorizontal className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="font-semibold">Patient Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewDetails(patient)} className="flex items-center">
                                  <Eye className="mr-3 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditPatient(patient)} className="flex items-center">
                                  <Edit className="mr-3 h-4 w-4" />
                                  Edit Patient
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewMedicalHistory(patient)} className="flex items-center">
                                  <FileText className="mr-3 h-4 w-4" />
                                  Medical History
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewPrescriptions(patient)} className="flex items-center">
                                  <Pill className="mr-3 h-4 w-4" />
                                  Prescriptions
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handlePrintPatientDetails(patient)} className="flex items-center">
                                  <Printer className="mr-3 h-4 w-4" />
                                  Print Record
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleGenerateInvoice(patient)} className="flex items-center">
                                  <Receipt className="mr-3 h-4 w-4" />
                                  Generate Invoice
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSharePatient(patient)} className="flex items-center">
                                  <Share2 className="mr-3 h-4 w-4" />
                                  Share Info
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => deletePatientMutation.mutate(patient.id)}
                                  className="text-red-600 focus:text-red-600 flex items-center"
                                >
                                  <Trash2 className="mr-3 h-4 w-4" />
                                  Delete Patient
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredPatients.length === 0 && (
                    <div className="text-center py-12">
                      <User className="mx-auto h-16 w-16 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold text-gray-900">No patients found</h3>
                      <p className="mt-2 text-muted-foreground">
                        {searchTerm ? "Try adjusting your search criteria." : "Get started by registering your first patient."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4">
              {appointmentsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="mt-4 text-muted-foreground">Loading appointments...</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredAppointments.map((appointment) => (
                    <Card key={appointment.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
                              {getStatusIcon(appointment.status)}
                            </div>
                            <div>
                              <h3 className="font-bold text-xl text-gray-900">
                                {appointment.customer?.firstName || 'Unknown'} {appointment.customer?.lastName || 'Patient'}
                              </h3>
                              <div className="flex items-center space-x-6 text-sm text-muted-foreground mt-2">
                                <span className="font-medium">{format(new Date(appointment.appointmentDate), "MMM dd, yyyy")}</span>
                                <span>{format(new Date(appointment.appointmentDate), "hh:mm a")}</span>
                                <span>{appointment.service}</span>
                                <span>{appointment.duration} min</span>
                                <Badge variant={getStatusBadge(appointment.status)} className="ml-2">
                                  {appointment.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-gray-100">
                                  <MoreHorizontal className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="font-semibold">Appointment Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEditAppointment(appointment)} className="flex items-center">
                                  <Edit className="mr-3 h-4 w-4" />
                                  Edit Appointment
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePrintAppointmentDetails(appointment)} className="flex items-center">
                                  <Printer className="mr-3 h-4 w-4" />
                                  Print Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleShareAppointment(appointment)} className="flex items-center">
                                  <Share2 className="mr-3 h-4 w-4" />
                                  Share Info
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => deleteAppointmentMutation.mutate(appointment.id)}
                                  className="text-red-600 focus:text-red-600 flex items-center"
                                >
                                  <Trash2 className="mr-3 h-4 w-4" />
                                  Cancel Appointment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredAppointments.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="mx-auto h-16 w-16 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold text-gray-900">No appointments found</h3>
                      <p className="mt-2 text-muted-foreground">
                        {searchTerm ? "Try adjusting your search criteria." : "Get started by scheduling your first appointment."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}