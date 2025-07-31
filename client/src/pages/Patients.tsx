import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Eye,
  Edit,
  History,
  User,
  Calendar,
  Heart,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Activity,
  Filter,
  Download,
  FileText,
  Trash2,
  MoreVertical,
  Grid,
  List,
  SortAsc,
  SortDesc,
  RefreshCw,
  CheckSquare,
  Square,
  UserPlus,
  Stethoscope,
  Pill,
  QrCode,
  Share2,
  PrinterIcon,
  DollarSign,
  Receipt,
  MessageSquare
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  insertPatientSchema, 
  type Patient, 
  type InsertPatient,
  type PatientHistory 
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Patients() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientHistory, setPatientHistory] = useState<PatientHistory[]>([]);
  const [filterGender, setFilterGender] = useState("all");
  const [filterBloodGroup, setFilterBloodGroup] = useState("all");
  const [filterLoyaltyTier, setFilterLoyaltyTier] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("firstName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("table");
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [selectedPatientForAppointment, setSelectedPatientForAppointment] = useState<Patient | null>(null);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedPatientForInvoice, setSelectedPatientForInvoice] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState("patients");
  const [appointmentFormData, setAppointmentFormData] = useState({
    patientId: "",
    appointmentDate: "",
    appointmentTime: "",
    serviceType: "",
    notes: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients = [], isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const form = useForm<InsertPatient>({
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
        title: "Success",
        description: "Patient registered successfully!",
      });
      setOpen(false);
      form.reset({
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

  const onSubmit = (data: InsertPatient) => {
    createPatientMutation.mutate(data);
  };

  // Mock appointments data for demonstration
  const mockAppointments = [
    {
      id: "apt1",
      patientName: "John Doe",
      patientCode: "PAT-001",
      appointmentDate: "2024-01-15",
      appointmentTime: "10:00 AM",
      serviceType: "Eye Examination",
      status: "Scheduled",
      notes: "First visit"
    },
    {
      id: "apt2", 
      patientName: "Jane Smith",
      patientCode: "PAT-002",
      appointmentDate: "2024-01-15",
      appointmentTime: "2:00 PM",
      serviceType: "Contact Lens Fitting",
      status: "Confirmed",
      notes: "Follow-up appointment"
    }
  ];

  // Action handlers
  const handleViewDetails = (patient: Patient) => {
    toast({
      title: "Patient Details",
      description: `Viewing details for ${patient.firstName} ${patient.lastName}`,
    });
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    form.reset({
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
    setOpen(true);
  };

  const handleMedicalHistory = (patient: Patient) => {
    toast({
      title: "Medical History",
      description: `Loading medical history for ${patient.firstName} ${patient.lastName}`,
    });
  };

  const handlePrescriptions = (patient: Patient) => {
    toast({
      title: "Prescriptions",
      description: `Loading prescriptions for ${patient.firstName} ${patient.lastName}`,
    });
  };

  const handlePrintPatient = (patient: Patient) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Patient Record - ${patient.firstName} ${patient.lastName}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
              .patient-info { margin-bottom: 20px; }
              .info-row { margin: 10px 0; }
              .label { font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>OptiStore Pro Medical Center</h1>
              <h2>Patient Medical Record</h2>
            </div>
            <div class="patient-info">
              <div class="info-row"><span class="label">Name:</span> ${patient.firstName} ${patient.lastName}</div>
              <div class="info-row"><span class="label">Patient Code:</span> ${patient.patientCode}</div>
              <div class="info-row"><span class="label">Gender:</span> ${patient.gender}</div>
              <div class="info-row"><span class="label">Phone:</span> ${patient.phone || 'N/A'}</div>
              <div class="info-row"><span class="label">Email:</span> ${patient.email || 'N/A'}</div>
              <div class="info-row"><span class="label">Blood Group:</span> ${patient.bloodGroup || 'N/A'}</div>
              <div class="info-row"><span class="label">Emergency Contact:</span> ${patient.emergencyContact || 'N/A'}</div>
              <div class="info-row"><span class="label">Insurance:</span> ${patient.insuranceProvider || 'N/A'}</div>
              ${patient.allergies ? `<div class="info-row"><span class="label">Allergies:</span> ${patient.allergies}</div>` : ''}
              ${patient.medicalHistory ? `<div class="info-row"><span class="label">Medical History:</span> ${patient.medicalHistory}</div>` : ''}
            </div>
            <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
              Generated on ${new Date().toLocaleString()} | OptiStore Pro Medical Center
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
      title: "Print Ready",
      description: `Patient record for ${patient.firstName} ${patient.lastName} ready for printing.`,
    });
  };

  const handleGenerateInvoice = (patient: Patient) => {
    setSelectedPatientForInvoice(patient);
    setInvoiceDialogOpen(true);
  };

  const handleQRCode = (patient: Patient) => {
    toast({
      title: "QR Code Generated",
      description: `QR code for ${patient.firstName} ${patient.lastName} created.`,
    });
  };

  const handleSharePatient = (patient: Patient) => {
    const patientInfo = `Patient Information:\n\nName: ${patient.firstName} ${patient.lastName}\nPatient ID: ${patient.patientCode}\nPhone: ${patient.phone || 'N/A'}\nEmail: ${patient.email || 'N/A'}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(patientInfo).then(() => {
        toast({
          title: "Copied to Clipboard",
          description: "Patient information copied to clipboard.",
        });
      });
    }
  };

  const handleDeletePatient = (patient: Patient) => {
    toast({
      title: "Patient Deleted",
      description: `${patient.firstName} ${patient.lastName} has been removed.`,
      variant: "destructive",
    });
  };

  // Filter and sort functions
  const filteredPatients = patients
    .filter(patient => {
      const matchesSearch = 
        patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.phone && patient.phone.includes(searchTerm)) ||
        (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesGender = filterGender === "all" || patient.gender === filterGender;
      const matchesBloodGroup = filterBloodGroup === "all" || patient.bloodGroup === filterBloodGroup;
      const matchesLoyaltyTier = filterLoyaltyTier === "all" || patient.loyaltyTier === filterLoyaltyTier;
      const matchesStatus = filterStatus === "all" || 
        (filterStatus === "active" && patient.isActive) ||
        (filterStatus === "inactive" && !patient.isActive);
      
      return matchesSearch && matchesGender && matchesBloodGroup && matchesLoyaltyTier && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "firstName":
          aValue = a.firstName;
          bValue = b.firstName;
          break;
        case "lastName":
          aValue = a.lastName;
          bValue = b.lastName;
          break;
        case "patientCode":
          aValue = a.patientCode;
          bValue = b.patientCode;
          break;
        case "dateOfBirth":
          aValue = a.dateOfBirth || "";
          bValue = b.dateOfBirth || "";
          break;
        default:
          aValue = a.firstName;
          bValue = b.firstName;
      }
      
      const comparison = aValue.localeCompare(bValue);
      return sortOrder === "asc" ? comparison : -comparison;
    });

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

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Patient & Appointment Management
              </CardTitle>
              <p className="text-muted-foreground mt-2 text-lg">
                Comprehensive medical practice management system with professional tools
              </p>
            </div>
            <div className="flex space-x-3">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    <Plus className="mr-2 h-5 w-5" />
                    Add Patient
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">
                      {selectedPatient ? "Edit Patient Information" : "Register New Patient"}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedPatient ? "Update patient medical information and details." : "Add a new patient to the medical records system."}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
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
                          control={form.control}
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
                          control={form.control}
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
                          control={form.control}
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
                          control={form.control}
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
                          control={form.control}
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
                          control={form.control}
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
                          control={form.control}
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
                          control={form.control}
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
                          control={form.control}
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
                        control={form.control}
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
                          control={form.control}
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
                          control={form.control}
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
                        <Button type="button" variant="outline" size="lg" onClick={() => setOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" size="lg" disabled={createPatientMutation.isPending}>
                          {createPatientMutation.isPending ? "Saving..." : (selectedPatient ? "Update Patient" : "Register Patient")}
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
                <span>Appointments ({mockAppointments.length})</span>
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
                {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>

            <TabsContent value="patients" className="space-y-4">
              {isLoading ? (
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
                                  <MoreVertical className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onClick={() => handleViewDetails(patient)} className="flex items-center">
                                  <Eye className="mr-3 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditPatient(patient)} className="flex items-center">
                                  <Edit className="mr-3 h-4 w-4" />
                                  Edit Patient
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleMedicalHistory(patient)} className="flex items-center">
                                  <History className="mr-3 h-4 w-4" />
                                  Medical History
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePrescriptions(patient)} className="flex items-center">
                                  <Pill className="mr-3 h-4 w-4" />
                                  Prescriptions
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handlePrintPatient(patient)} className="flex items-center">
                                  <PrinterIcon className="mr-3 h-4 w-4" />
                                  Print Record
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleGenerateInvoice(patient)} className="flex items-center">
                                  <Receipt className="mr-3 h-4 w-4" />
                                  Generate Invoice
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleQRCode(patient)} className="flex items-center">
                                  <QrCode className="mr-3 h-4 w-4" />
                                  QR Code
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSharePatient(patient)} className="flex items-center">
                                  <Share2 className="mr-3 h-4 w-4" />
                                  Share Info
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeletePatient(patient)}
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
              <div className="grid gap-4">
                {mockAppointments.map((appointment) => (
                  <Card key={appointment.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
                            <Calendar className="h-8 w-8" />
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-gray-900">
                              {appointment.patientName}
                            </h3>
                            <div className="flex items-center space-x-6 text-sm text-muted-foreground mt-2">
                              <span className="font-medium">{appointment.appointmentDate}</span>
                              <span>{appointment.appointmentTime}</span>
                              <span>{appointment.serviceType}</span>
                              <Badge variant="default" className="ml-2">
                                {appointment.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-gray-100">
                                <MoreVertical className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem className="flex items-center">
                                <Eye className="mr-3 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center">
                                <Edit className="mr-3 h-4 w-4" />
                                Edit Appointment
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center">
                                <PrinterIcon className="mr-3 h-4 w-4" />
                                Print Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center">
                                <QrCode className="mr-3 h-4 w-4" />
                                QR Code
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center">
                                <Share2 className="mr-3 h-4 w-4" />
                                Share Info
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center">
                                <Receipt className="mr-3 h-4 w-4" />
                                Generate Invoice
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  toast({
                                    title: "Appointment Cancelled",
                                    description: `Cancelled appointment with ${appointment.patientName}`,
                                    variant: "destructive",
                                  });
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Cancel Appointment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                    </Card>
                  ))}
                  {mockAppointments.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="mx-auto h-16 w-16 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold text-gray-900">No appointments found</h3>
                      <p className="mt-2 text-muted-foreground">
                        {searchTerm ? "Try adjusting your search criteria." : "Get started by scheduling your first appointment."}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }