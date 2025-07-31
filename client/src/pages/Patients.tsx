import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Header removed for Patient Portal compatibility
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
      queryClient.refetchQueries({ queryKey: ["/api/patients"] });
      toast({
        title: "Success",
        description: "Patient registered successfully.",
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

  const filteredPatients = patients
    .filter(patient => {
      const matchesSearch = `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGender = filterGender === "all" || patient.gender === filterGender;
      const matchesBloodGroup = filterBloodGroup === "all" || patient.bloodGroup === filterBloodGroup;
      const matchesLoyaltyTier = filterLoyaltyTier === "all" || patient.loyaltyTier === filterLoyaltyTier;
      const matchesStatus = filterStatus === "all" || 
        (filterStatus === "active" && patient.isActive) ||
        (filterStatus === "inactive" && !patient.isActive);
      
      return matchesSearch && matchesGender && matchesBloodGroup && matchesLoyaltyTier && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof Patient] || "";
      let bValue = b[sortBy as keyof Patient] || "";
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSelectAll = () => {
    if (selectedPatients.length === filteredPatients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(filteredPatients.map(p => p.id));
    }
  };

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleBulkAction = async (action: string) => {
    if (selectedPatients.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select patients to perform bulk actions.",
        variant: "destructive",
      });
      return;
    }

    try {
      switch (action) {
        case "export":
          toast({
            title: "Export Started",
            description: `Exporting ${selectedPatients.length} patient records...`,
          });
          break;
        case "deactivate":
          toast({
            title: "Patients Deactivated",
            description: `${selectedPatients.length} patients have been deactivated.`,
          });
          setSelectedPatients([]);
          break;
        case "delete":
          toast({
            title: "Patients Deleted", 
            description: `${selectedPatients.length} patients have been deleted.`,
          });
          setSelectedPatients([]);
          break;
      }
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Failed to perform bulk action. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    
    // Fetch patient history
    try {
      const response = await apiRequest("GET", `/api/patients/${patient.id}/history`);
      const history = await response.json() as PatientHistory[];
      setPatientHistory(history);
    } catch (error) {
      console.error("Error fetching patient history:", error);
      setPatientHistory([]);
    }
  };

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

  const handleBookAppointment = (patient?: Patient) => {
    if (patient) {
      setSelectedPatientForAppointment(patient);
      setAppointmentFormData(prev => ({ ...prev, patientId: patient.id }));
    } else {
      setSelectedPatientForAppointment(null);
      setAppointmentFormData(prev => ({ ...prev, patientId: "" }));
    }
    setAppointmentDialogOpen(true);
  };

  // Patient action handlers
  const handleEditPatient = (patient: Patient) => {
    form.reset({
      patientCode: patient.patientCode,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      phone: patient.phone,
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
    toast({
      title: "Edit Mode",
      description: `Editing ${patient.firstName} ${patient.lastName}`,
    });
  };

  const handleDeletePatient = async (patientId: string) => {
    if (confirm("Are you sure you want to delete this patient? This action cannot be undone.")) {
      try {
        await apiRequest("DELETE", `/api/patients/${patientId}`);
        queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
        toast({
          title: "Patient Deleted",
          description: "Patient has been permanently deleted.",
        });
      } catch (error) {
        toast({
          title: "Delete Failed",
          description: "Failed to delete patient. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handlePrintPatient = (patient: Patient) => {
    toast({
      title: "Print Started",
      description: `Printing patient record for ${patient.firstName} ${patient.lastName}`,
    });
    // Print implementation would go here
  };

  const handleGenerateQRCode = (patient: Patient) => {
    toast({
      title: "QR Code Generated",
      description: `QR code created for ${patient.firstName} ${patient.lastName}`,
    });
    // QR code generation would go here
  };

  const handleSharePatient = (patient: Patient) => {
    toast({
      title: "Share Options",
      description: `Sharing options for ${patient.firstName} ${patient.lastName}`,
    });
    // Share implementation would go here
  };



  const handleViewMedicalHistory = (patient: Patient) => {
    toast({
      title: "Medical History",
      description: `Loading medical history for ${patient.firstName} ${patient.lastName}`,
    });
    // Medical history view would go here
  };

  const handleViewPrescriptions = (patient: Patient) => {
    toast({
      title: "Prescriptions",
      description: `Loading prescriptions for ${patient.firstName} ${patient.lastName}`,
    });
    // Prescriptions view would go here
  };

  const handleAppointmentFormChange = (field: string, value: string) => {
    setAppointmentFormData(prev => ({ ...prev, [field]: value }));
    if (field === "patientId") {
      const selectedPatient = patients.find(p => p.id === value);
      setSelectedPatientForAppointment(selectedPatient || null);
    }
  };

  const mockAppointments = [
    {
      id: "1",
      patientId: patients[0]?.id || "",
      patientName: patients[0] ? `${patients[0].firstName} ${patients[0].lastName}` : "John Doe",
      patientCode: patients[0]?.patientCode || "PAT-001",
      appointmentDate: "2025-08-01",
      appointmentTime: "10:00",
      serviceType: "Comprehensive Eye Exam",
      status: "scheduled",
      notes: "Regular checkup"
    },
    {
      id: "2", 
      patientId: patients[1]?.id || "",
      patientName: patients[1] ? `${patients[1].firstName} ${patients[1].lastName}` : "Jane Smith",
      patientCode: patients[1]?.patientCode || "PAT-002",
      appointmentDate: "2025-08-02",
      appointmentTime: "14:00",
      serviceType: "Contact Lens Fitting",
      status: "completed",
      notes: "First-time contact lens fitting"
    }
  ];

  const handlePrintAppointmentDetails = (appointment: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Appointment Details - ${appointment.patientName}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333;
                background: #fff;
              }
              .container { max-width: 800px; margin: 0 auto; padding: 20px; }
              .header { 
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
                color: white; 
                padding: 30px; 
                text-align: center; 
                border-radius: 10px 10px 0 0;
                margin-bottom: 0;
              }
              .store-info { 
                background: #f8fafc; 
                padding: 15px 30px; 
                border-left: 4px solid #2563eb;
                margin-bottom: 30px;
              }
              .appointment-card {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-bottom: 20px;
              }
              .appointment-header {
                background: #f1f5f9;
                padding: 20px;
                border-bottom: 2px solid #e2e8f0;
              }
              .appointment-content {
                padding: 25px;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 30px;
              }
              .info-item {
                display: flex;
                flex-direction: column;
                padding: 12px;
                background: #f8fafc;
                border-radius: 6px;
                border-left: 3px solid #2563eb;
              }
              .label { 
                font-weight: 600; 
                color: #475569; 
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
              }
              .value { 
                font-size: 14px; 
                color: #1e293b;
                font-weight: 500;
              }
              .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
              }
              .status-scheduled {
                background: #dbeafe;
                color: #1e40af;
              }
              .status-completed {
                background: #dcfce7;
                color: #166534;
              }
              .qr-section {
                text-align: center;
                padding: 20px;
                background: #f8fafc;
                border-radius: 8px;
                margin: 20px 0;
              }
              .qr-placeholder {
                width: 120px;
                height: 120px;
                border: 2px dashed #94a3b8;
                border-radius: 8px;
                margin: 0 auto 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: white;
              }
              .footer {
                background: #1e293b;
                color: white;
                padding: 20px;
                text-align: center;
                margin-top: 30px;
                border-radius: 0 0 10px 10px;
              }
              .print-date {
                text-align: right;
                font-size: 12px;
                color: #64748b;
                margin-bottom: 20px;
              }
              @media print {
                body { margin: 0; background: white; }
                .container { max-width: none; margin: 0; padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>OptiStore Pro Medical Center</h1>
                <p>Appointment Details & Information</p>
              </div>
              
              <div class="store-info">
                <strong>OptiStore Pro - Main Branch</strong><br>
                📍 123 Medical Plaza, Healthcare District<br>
                📞 +1 (555) 123-4567 | 📧 info@optistorepro.com<br>
                🌐 www.optistorepro.com
              </div>

              <div class="print-date">
                Generated on: ${new Date().toLocaleString()}
              </div>

              <div class="appointment-card">
                <div class="appointment-header">
                  <h2 style="color: #2563eb; margin-bottom: 5px;">Appointment Confirmation</h2>
                  <p style="color: #64748b;">Appointment ID: APT-${appointment.id}</p>
                </div>

                <div class="appointment-content">
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="label">Patient Name</span>
                      <span class="value">${appointment.patientName}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Patient Code</span>
                      <span class="value">${appointment.patientCode}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Appointment Date</span>
                      <span class="value">${new Date(appointment.appointmentDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Appointment Time</span>
                      <span class="value">${appointment.appointmentTime}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Service Type</span>
                      <span class="value">${appointment.serviceType}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Status</span>
                      <span class="value">
                        <span class="status-badge status-${appointment.status}">
                          ${appointment.status.toUpperCase()}
                        </span>
                      </span>
                    </div>
                  </div>

                  ${appointment.notes ? `
                    <div style="background: #fef7f0; padding: 20px; border-radius: 8px; border: 1px solid #fed7aa; margin: 20px 0;">
                      <h3 style="color: #ea580c; margin-bottom: 10px;">📝 Notes</h3>
                      <p style="color: #1e293b;">${appointment.notes}</p>
                    </div>
                  ` : ''}

                  <div class="qr-section">
                    <h3 style="margin-bottom: 15px; color: #475569;">📱 Appointment QR Code</h3>
                    <div class="qr-placeholder">
                      <div style="text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 5px;">📅</div>
                        <div style="font-size: 12px; color: #64748b;">QR Code</div>
                      </div>
                    </div>
                    <p style="font-size: 12px; color: #64748b; margin-top: 10px;">
                      Scan to access appointment details<br>
                      Appointment ID: APT-${appointment.id}
                    </p>
                  </div>
                </div>
              </div>

              <div class="footer">
                <p><strong>OptiStore Pro Medical Center</strong></p>
                <p style="font-size: 14px; margin-top: 5px;">
                  Please arrive 15 minutes before your scheduled appointment time.
                </p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };



  const handlePrintPatientDetails = (patient: Patient) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Patient Details - ${patient.firstName} ${patient.lastName}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333;
                background: #fff;
              }
              .container { max-width: 800px; margin: 0 auto; padding: 20px; }
              .header { 
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
                color: white; 
                padding: 30px; 
                text-align: center; 
                border-radius: 10px 10px 0 0;
                margin-bottom: 0;
              }
              .store-info { 
                background: #f8fafc; 
                padding: 15px 30px; 
                border-left: 4px solid #2563eb;
                margin-bottom: 30px;
              }
              .patient-card {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .patient-header {
                background: #f1f5f9;
                padding: 20px;
                border-bottom: 2px solid #e2e8f0;
              }
              .patient-content {
                padding: 25px;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 30px;
              }
              .info-item {
                display: flex;
                flex-direction: column;
                padding: 12px;
                background: #f8fafc;
                border-radius: 6px;
                border-left: 3px solid #2563eb;
              }
              .label { 
                font-weight: 600; 
                color: #475569; 
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
              }
              .value { 
                font-size: 14px; 
                color: #1e293b;
                font-weight: 500;
              }
              .medical-section {
                background: #fef7f0;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #fed7aa;
                margin: 20px 0;
              }
              .qr-section {
                text-align: center;
                padding: 20px;
                background: #f8fafc;
                border-radius: 8px;
                margin: 20px 0;
              }
              .qr-placeholder {
                width: 120px;
                height: 120px;
                border: 2px dashed #94a3b8;
                border-radius: 8px;
                margin: 0 auto 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: white;
              }
              .footer {
                background: #1e293b;
                color: white;
                padding: 20px;
                text-align: center;
                margin-top: 30px;
                border-radius: 0 0 10px 10px;
              }
              .print-date {
                text-align: right;
                font-size: 12px;
                color: #64748b;
                margin-bottom: 20px;
              }
              @media print {
                body { margin: 0; background: white; }
                .container { max-width: none; margin: 0; padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>OptiStore Pro Medical Center</h1>
                <p>Patient Medical Record & Information</p>
              </div>
              
              <div class="store-info">
                <strong>OptiStore Pro - Main Branch</strong><br>
                📍 123 Medical Plaza, Healthcare District<br>
                📞 +1 (555) 123-4567 | 📧 info@optistorepro.com<br>
                🌐 www.optistorepro.com
              </div>

              <div class="print-date">
                Generated on: ${new Date().toLocaleString()}
              </div>

              <div class="patient-card">
                <div class="patient-header">
                  <h2 style="color: #2563eb; margin-bottom: 5px;">${patient.firstName} ${patient.lastName}</h2>
                  <p style="color: #64748b;">Patient ID: ${patient.patientCode}</p>
                </div>

                <div class="patient-content">
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="label">Full Name</span>
                      <span class="value">${patient.firstName} ${patient.lastName}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Patient Code</span>
                      <span class="value">${patient.patientCode}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Date of Birth</span>
                      <span class="value">${patient.dateOfBirth || 'Not provided'}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Gender</span>
                      <span class="value">${patient.gender || 'Not specified'}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Phone Number</span>
                      <span class="value">${patient.phone || 'Not provided'}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Email Address</span>
                      <span class="value">${patient.email || 'Not provided'}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Address</span>
                      <span class="value">${patient.address || 'Not provided'}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Blood Group</span>
                      <span class="value">${patient.bloodGroup || 'Not specified'}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Emergency Contact</span>
                      <span class="value">${patient.emergencyContact || 'Not provided'}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Emergency Phone</span>
                      <span class="value">${patient.emergencyPhone || 'Not provided'}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Insurance Provider</span>
                      <span class="value">${patient.insuranceProvider || 'None'}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Loyalty Tier</span>
                      <span class="value">${patient.loyaltyTier?.toUpperCase() || 'BRONZE'}</span>
                    </div>
                  </div>

                  <div class="medical-section">
                    <h3 style="color: #ea580c; margin-bottom: 15px;">🏥 Medical Information</h3>
                    <div class="info-grid">
                      <div class="info-item">
                        <span class="label">Known Allergies</span>
                        <span class="value">${patient.allergies || 'None reported'}</span>
                      </div>
                      <div class="info-item">
                        <span class="label">Medical History</span>
                        <span class="value">${patient.medicalHistory || 'No significant history'}</span>
                      </div>
                    </div>
                  </div>

                  <div class="qr-section">
                    <h3 style="margin-bottom: 15px; color: #475569;">📱 Patient QR Code</h3>
                    <div class="qr-placeholder">
                      <div style="text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 5px;">📱</div>
                        <div style="font-size: 12px; color: #64748b;">QR Code</div>
                      </div>
                    </div>
                    <p style="font-size: 12px; color: #64748b; margin-top: 10px;">
                      Scan to access patient information<br>
                      Patient ID: ${patient.patientCode}
                    </p>
                  </div>
                </div>
              </div>

              <div class="footer">
                <p><strong>OptiStore Pro Medical Center</strong></p>
                <p style="font-size: 14px; margin-top: 5px;">
                  This document contains confidential patient information. Handle according to HIPAA guidelines.
                </p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSharePatientInfo = (patient: Patient) => {
    const patientInfo = `Patient: ${patient.firstName} ${patient.lastName}\nCode: ${patient.patientCode}\nPhone: ${patient.phone || 'N/A'}\nEmail: ${patient.email || 'N/A'}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Patient Information',
        text: patientInfo,
      });
    } else {
      navigator.clipboard.writeText(patientInfo);
      toast({
        title: "Copied to Clipboard",
        description: "Patient information has been copied to clipboard.",
      });
    }
  };



  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Patient & Appointment Management</h1>
          <p className="text-slate-600">Manage patient records, appointments, medical history, and personal information securely.</p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant={activeTab === "patients" ? "default" : "outline"}
            onClick={() => setActiveTab("patients")}
          >
            <User className="mr-2 h-4 w-4" />
            Patients
          </Button>
          <Button 
            variant={activeTab === "appointments" ? "default" : "outline"}
            onClick={() => setActiveTab("appointments")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Appointments
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="min-h-screen">
        {activeTab === "patients" && (
          <div className="space-y-6">
            <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Register Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Patient</DialogTitle>
              <DialogDescription>
                Fill out the comprehensive patient registration form with personal, contact, medical, and insurance information.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="personal">Personal Info</TabsTrigger>
                    <TabsTrigger value="contact">Contact Details</TabsTrigger>
                    <TabsTrigger value="medical">Medical Records</TabsTrigger>
                    <TabsTrigger value="insurance">Insurance & Loyalty</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="patientCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Patient Code</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              First Name <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Enter first name" {...field} value={field.value || ""} />
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
                            <FormLabel className="flex items-center gap-1">
                              Last Name <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Enter last name" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              Date of Birth <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input type="date" {...field} value={field.value || ""} />
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
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              Phone Number <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="+1 234 567-8900" {...field} value={field.value || ""} />
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
                              <Input type="email" placeholder="patient@example.com" {...field} value={field.value || ""} />
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
                            <Textarea placeholder="Enter full address" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="emergencyContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Contact person's name" {...field} value={field.value || ""} />
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
                              <Input placeholder="+1 234 567-8900" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="medical" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Complete Medical Records</h3>
                      
                      {/* Basic Medical Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="allergies"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Known Allergies & Drug Reactions</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value || ""} placeholder="List any known allergies, drug reactions, or sensitivities (e.g., Penicillin, Latex, etc.)" />
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
                              <FormLabel>Previous Medical History</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value || ""} placeholder="Previous medical conditions, surgeries, hospitalizations, chronic conditions" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Current Health Status */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="currentMedications"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Medications</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value || ""} placeholder="List current medications, dosages, and frequency" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="previousEyeConditions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Previous Eye Conditions</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value || ""} placeholder="Previous eye conditions, treatments, surgeries (e.g., Cataract surgery, Glaucoma, etc.)" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Vision & Eye Exam Details */}
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="lastEyeExamDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Eye Exam Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="currentPrescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Prescription</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} placeholder="SPH/CYL/AXIS (if applicable)" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="riskFactors"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Risk Factors</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select risk level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Low Risk</SelectItem>
                                  <SelectItem value="moderate">Moderate Risk</SelectItem>
                                  <SelectItem value="high">High Risk</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Vision Prescription Details */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-slate-900">Vision Prescription Details</h4>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="col-span-4">
                            <div className="grid grid-cols-7 gap-2 text-sm">
                              <div className="font-medium"></div>
                              <div className="font-medium text-center">Sphere</div>
                              <div className="font-medium text-center">Cylinder</div>
                              <div className="font-medium text-center">Axis</div>
                              <div className="font-medium text-center">PD</div>
                              <div className="col-span-2"></div>
                            </div>
                          </div>
                          
                          <div className="col-span-4">
                            <div className="grid grid-cols-7 gap-2">
                              <div className="flex items-center font-medium">Right Eye</div>
                              <FormField
                                control={form.control}
                                name="rightEyeSphere"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input {...field} value={field.value || ""} placeholder="+/-0.00" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="rightEyeCylinder"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input {...field} value={field.value || ""} placeholder="+/-0.00" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="rightEyeAxis"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input {...field} value={field.value || ""} placeholder="1-180" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="pupillaryDistance"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input {...field} value={field.value || ""} placeholder="62mm" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <div className="col-span-2"></div>
                            </div>
                          </div>
                          
                          <div className="col-span-4">
                            <div className="grid grid-cols-7 gap-2">
                              <div className="flex items-center font-medium">Left Eye</div>
                              <FormField
                                control={form.control}
                                name="leftEyeSphere"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input {...field} value={field.value || ""} placeholder="+/-0.00" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="leftEyeCylinder"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input {...field} value={field.value || ""} placeholder="+/-0.00" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="leftEyeAxis"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input {...field} value={field.value || ""} placeholder="1-180" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <div className="col-span-3"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Lifestyle & Health Factors */}
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="smokingStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Smoking Status</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="never">Never</SelectItem>
                                  <SelectItem value="former">Former</SelectItem>
                                  <SelectItem value="current">Current</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="alcoholConsumption"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alcohol Consumption</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  <SelectItem value="occasional">Occasional</SelectItem>
                                  <SelectItem value="moderate">Moderate</SelectItem>
                                  <SelectItem value="heavy">Heavy</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="exerciseFrequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Exercise Frequency</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="never">Never</SelectItem>
                                  <SelectItem value="rarely">Rarely</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="daily">Daily</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Family History & Medical Notes */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="familyMedicalHistory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Family Medical History</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value || ""} placeholder="Family history of eye conditions, diabetes, hypertension, etc." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="medicalAlerts"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Medical Alerts</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value || ""} placeholder="Important medical alerts or warnings for staff" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Doctor Notes & Follow-up */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="doctorNotes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Doctor Notes</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value || ""} placeholder="Clinical observations and recommendations" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="treatmentPlan"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Treatment Plan</FormLabel>
                                <FormControl>
                                  <Textarea {...field} value={field.value || ""} placeholder="Recommended treatment and care plan" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="followUpDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Follow-up Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-amber-800">Medical Information Notice</h4>
                            <p className="text-sm text-amber-700 mt-1">
                              All medical information is confidential and HIPAA compliant. This comprehensive medical record 
                              will be used for treatment, payment, and healthcare operations as permitted by law. This integrated 
                              system eliminates the need for separate medical records management.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="insurance" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="insuranceProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Insurance Provider</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select insurance provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="blue_cross">Blue Cross Blue Shield</SelectItem>
                                <SelectItem value="aetna">Aetna</SelectItem>
                                <SelectItem value="cigna">Cigna</SelectItem>
                                <SelectItem value="united">United Healthcare</SelectItem>
                                <SelectItem value="kaiser">Kaiser Permanente</SelectItem>
                                <SelectItem value="humana">Humana</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                                <SelectItem value="none">No Insurance</SelectItem>
                              </SelectContent>
                            </Select>
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
                              <Input placeholder="Policy/Member ID" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="loyaltyTier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loyalty Tier</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select loyalty tier" />
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
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPatientMutation.isPending}>
                    {createPatientMutation.isPending ? "Registering..." : "Register Patient"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Patients</p>
                <p className="text-2xl font-bold text-slate-900">{patients.length}</p>
                <p className="text-xs text-emerald-600 flex items-center mt-1">
                  <Activity className="h-3 w-3 mr-1" />
                  Active records
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <User className="text-blue-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">New This Month</p>
                <p className="text-2xl font-bold text-slate-900">
                  {patients.filter(p => {
                    if (!p.createdAt) return false;
                    const date = new Date(p.createdAt);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length}
                </p>
                <p className="text-xs text-slate-500">New registrations</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="text-green-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">With Allergies</p>
                <p className="text-2xl font-bold text-slate-900">
                  {patients.filter(p => p.allergies && p.allergies.trim().length > 0).length}
                </p>
                <p className="text-xs text-amber-600 flex items-center mt-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Requires attention
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="text-amber-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Loyalty Members</p>
                <p className="text-2xl font-bold text-slate-900">
                  {patients.filter(p => p.loyaltyTier === 'gold' || p.loyaltyTier === 'silver').length}
                </p>
                <p className="text-xs text-purple-600 flex items-center mt-1">
                  <Heart className="h-3 w-3 mr-1" />
                  Premium members
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Heart className="text-purple-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar with Search, Filters, and Bulk Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-1 gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search patients by name, code, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-blue-50 border-blue-200" : ""}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
              >
                {viewMode === "table" ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2">
            {selectedPatients.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Bulk Actions ({selectedPatients.length})
                    <MoreVertical className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction("export")}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("deactivate")}>
                    <User className="mr-2 h-4 w-4" />
                    Deactivate Selected
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleBulkAction("delete")}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
            
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                if (filteredPatients.length > 0) {
                  handleBookAppointment(filteredPatients[0]);
                } else {
                  toast({
                    title: "No Patients",
                    description: "Please register patients first to book appointments.",
                    variant: "destructive",
                  });
                }
              }}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="gender-filter" className="text-sm font-medium">Gender</Label>
                  <Select value={filterGender} onValueChange={setFilterGender}>
                    <SelectTrigger id="gender-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="blood-filter" className="text-sm font-medium">Blood Group</Label>
                  <Select value={filterBloodGroup} onValueChange={setFilterBloodGroup}>
                    <SelectTrigger id="blood-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Blood Groups</SelectItem>
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
                
                <div>
                  <Label htmlFor="loyalty-filter" className="text-sm font-medium">Loyalty Tier</Label>
                  <Select value={filterLoyaltyTier} onValueChange={setFilterLoyaltyTier}>
                    <SelectTrigger id="loyalty-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="bronze">🥉 Bronze</SelectItem>
                      <SelectItem value="silver">🥈 Silver</SelectItem>
                      <SelectItem value="gold">🥇 Gold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status-filter" className="text-sm font-medium">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger id="status-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="text-sm text-slate-600">
                  Showing {filteredPatients.length} of {patients.length} patients
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setFilterGender("all");
                      setFilterBloodGroup("all");
                      setFilterLoyaltyTier("all");
                      setFilterStatus("all");
                    }}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Patients Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                </div>
              ))}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No patients found</h3>
              <p className="text-slate-600 mb-6">
                {searchTerm ? "Try adjusting your search criteria." : "Register your first patient to get started."}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Register Patient
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPatients.length === filteredPatients.length && filteredPatients.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Patient Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age/Gender</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Loyalty Tier</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className={selectedPatients.includes(patient.id) ? "bg-blue-50" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPatients.includes(patient.id)}
                          onCheckedChange={() => handleSelectPatient(patient.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{patient.patientCode}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="font-medium">{patient.firstName} {patient.lastName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span>{calculateAge(patient.dateOfBirth || '')} years</span>
                          <span className="text-slate-500 capitalize"> • {patient.gender}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {patient.phone && (
                            <div className="flex items-center space-x-1 text-sm">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{patient.phone}</span>
                            </div>
                          )}
                          {patient.email && (
                            <div className="flex items-center space-x-1 text-sm">
                              <Mail className="h-3 w-3 text-slate-400" />
                              <span>{patient.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            patient.loyaltyTier === 'gold' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : patient.loyaltyTier === 'silver'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-orange-100 text-orange-800'
                          }
                        >
                          {patient.loyaltyTier === 'gold' ? '🥇' : patient.loyaltyTier === 'silver' ? '🥈' : '🥉'} {patient.loyaltyTier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {patient.createdAt ? format(new Date(patient.createdAt), 'MMM dd, yyyy') : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPatient(patient);
                              toast({
                                title: "Patient Details",
                                description: `Viewing details for ${patient.firstName} ${patient.lastName}`,
                              });
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleViewPatient(patient)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                form.reset({
                                  patientCode: patient.patientCode,
                                  firstName: patient.firstName,
                                  lastName: patient.lastName,
                                  dateOfBirth: patient.dateOfBirth,
                                  gender: patient.gender,
                                  phone: patient.phone,
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
                                toast({
                                  title: "Edit Mode",
                                  description: `Editing ${patient.firstName} ${patient.lastName}`,
                                });
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Patient
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                toast({
                                  title: "Medical History",
                                  description: `Loading medical history for ${patient.firstName} ${patient.lastName}`,
                                });
                              }}>
                                <Stethoscope className="mr-2 h-4 w-4" />
                                Medical History
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                toast({
                                  title: "Prescriptions",
                                  description: `Loading prescriptions for ${patient.firstName} ${patient.lastName}`,
                                });
                              }}>
                                <Pill className="mr-2 h-4 w-4" />
                                Prescriptions
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBookAppointment(patient)}>
                                <Calendar className="mr-2 h-4 w-4" />
                                Book Appointment
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handlePrintPatientDetails(patient)}>
                                <PrinterIcon className="mr-2 h-4 w-4" />
                                Print Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedPatientForInvoice(patient);
                                setInvoiceDialogOpen(true);
                                toast({
                                  title: "Invoice Generation",
                                  description: `Creating invoice for ${patient.firstName} ${patient.lastName}`,
                                });
                              }}>
                                <Receipt className="mr-2 h-4 w-4" />
                                Generate Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSharePatientInfo(patient)}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share Info
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  toast({
                                    title: "Delete Patient",
                                    description: `Deletion requested for ${patient.firstName} ${patient.lastName}. This feature requires admin confirmation.`,
                                    variant: "destructive",
                                  });
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Patient
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Details Dialog */}
      {selectedPatient && (
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Patient Details - {selectedPatient.firstName} {selectedPatient.lastName}</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="medical">Medical Info</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900">Personal Information</h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Full Name</Label>
                        <p className="text-lg font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-600">Age</Label>
                          <p>{calculateAge(selectedPatient.dateOfBirth || '')} years old</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-600">Gender</Label>
                          <p className="capitalize">{selectedPatient.gender}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Date of Birth</Label>
                        <p>{selectedPatient.dateOfBirth ? format(new Date(selectedPatient.dateOfBirth), 'MMMM dd, yyyy') : 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Blood Group</Label>
                        <p>{selectedPatient.bloodGroup || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900">Contact Information</h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Phone</Label>
                        <p className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span>{selectedPatient.phone || 'Not provided'}</span>
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Email</Label>
                        <p className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span>{selectedPatient.email || 'Not provided'}</span>
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Address</Label>
                        <p className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-slate-400 mt-1" />
                          <span>{selectedPatient.address || 'Not provided'}</span>
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Emergency Contact</Label>
                        <p>{selectedPatient.emergencyContact || 'Not provided'}</p>
                        {selectedPatient.emergencyPhone && (
                          <p className="text-sm text-slate-500">{selectedPatient.emergencyPhone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Insurance Provider</Label>
                      <p>{selectedPatient.insuranceProvider || 'Not provided'}</p>
                      {selectedPatient.insuranceNumber && (
                        <p className="text-sm text-slate-500 font-mono">{selectedPatient.insuranceNumber}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Loyalty Program</Label>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={
                            selectedPatient.loyaltyTier === 'gold' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : selectedPatient.loyaltyTier === 'silver'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-orange-100 text-orange-800'
                          }
                        >
                          {selectedPatient.loyaltyTier === 'gold' ? '🥇' : selectedPatient.loyaltyTier === 'silver' ? '🥈' : '🥉'} {selectedPatient.loyaltyTier}
                        </Badge>
                        <span className="text-sm text-slate-500">{selectedPatient.loyaltyPoints} points</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="medical" className="space-y-6">
                {selectedPatient.allergies && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <Label className="text-sm font-medium text-red-800">Allergies</Label>
                        <p className="text-red-700 mt-1">{selectedPatient.allergies}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPatient.medicalHistory && (
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Medical History</Label>
                    <p className="mt-1 p-3 bg-slate-50 rounded-md">{selectedPatient.medicalHistory}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900">Patient History</h4>
                  <Badge variant="outline">
                    {patientHistory.length} records
                  </Badge>
                </div>

                {patientHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <p className="text-slate-600">No medical history available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {patientHistory.map((record) => (
                      <div key={record.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-slate-900">{record.title}</h5>
                            <p className="text-sm text-slate-600 mt-1">{record.description}</p>
                            <Badge variant="outline" className="mt-2 capitalize">
                              {record.recordType}
                            </Badge>
                          </div>
                          <span className="text-sm text-slate-500">
                            {record.recordDate ? format(new Date(record.recordDate), 'MMM dd, yyyy') : 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Appointment Booking Dialog */}
      <Dialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Book Appointment {selectedPatientForAppointment && `- ${selectedPatientForAppointment.firstName} ${selectedPatientForAppointment.lastName}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient-select">Select Patient *</Label>
                <Select 
                  value={appointmentFormData.patientId} 
                  onValueChange={(value) => handleAppointmentFormChange("patientId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName} - {patient.patientCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Patient Info</Label>
                {selectedPatientForAppointment ? (
                  <div>
                    <p className="text-sm font-medium">{selectedPatientForAppointment.phone || "No phone"}</p>
                    <p className="text-sm text-slate-500">{selectedPatientForAppointment.email || "No email"}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Select a patient to view info</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appointment-date">Appointment Date *</Label>
                <Input 
                  id="appointment-date"
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentFormData.appointmentDate}
                  onChange={(e) => handleAppointmentFormChange("appointmentDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="appointment-time">Time *</Label>
                <Select 
                  value={appointmentFormData.appointmentTime}
                  onValueChange={(value) => handleAppointmentFormChange("appointmentTime", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">09:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="14:00">02:00 PM</SelectItem>
                    <SelectItem value="15:00">03:00 PM</SelectItem>
                    <SelectItem value="16:00">04:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="service-type">Service Type *</Label>
              <Select 
                value={appointmentFormData.serviceType}
                onValueChange={(value) => handleAppointmentFormChange("serviceType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eye-exam">Comprehensive Eye Exam ($150)</SelectItem>
                  <SelectItem value="contact-fitting">Contact Lens Fitting ($75)</SelectItem>
                  <SelectItem value="glasses-consultation">Glasses Consultation ($50)</SelectItem>
                  <SelectItem value="follow-up">Follow-up Visit ($75)</SelectItem>
                  <SelectItem value="emergency">Emergency Consultation ($125)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea 
                id="notes"
                placeholder="Additional notes or special requirements..."
                rows={3}
                value={appointmentFormData.notes}
                onChange={(e) => handleAppointmentFormChange("notes", e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setAppointmentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  if (!appointmentFormData.patientId || !appointmentFormData.appointmentDate || !appointmentFormData.appointmentTime || !appointmentFormData.serviceType) {
                    toast({
                      title: "Missing Information",
                      description: "Please fill in all required fields marked with *",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  toast({
                    title: "Appointment Booked Successfully",
                    description: `Appointment scheduled for ${selectedPatientForAppointment?.firstName} ${selectedPatientForAppointment?.lastName} on ${appointmentFormData.appointmentDate} at ${appointmentFormData.appointmentTime}`,
                  });
                  
                  setAppointmentDialogOpen(false);
                  setAppointmentFormData({
                    patientId: "",
                    appointmentDate: "",
                    appointmentTime: "",
                    serviceType: "",
                    notes: ""
                  });
                  setSelectedPatientForAppointment(null);
                }}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Generation Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Generate Invoice {selectedPatientForInvoice && `- ${selectedPatientForInvoice.firstName} ${selectedPatientForInvoice.lastName}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Patient Information</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {selectedPatientForInvoice?.firstName} {selectedPatientForInvoice?.lastName}</p>
                  <p><span className="font-medium">Code:</span> {selectedPatientForInvoice?.patientCode}</p>
                  <p><span className="font-medium">Phone:</span> {selectedPatientForInvoice?.phone}</p>
                  <p><span className="font-medium">Email:</span> {selectedPatientForInvoice?.email}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Invoice Details</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Invoice #:</span> INV-{Date.now().toString().slice(-6)}</p>
                  <p><span className="font-medium">Date:</span> {new Date().toLocaleDateString()}</p>
                  <p><span className="font-medium">Due Date:</span> {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Services</h4>
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-3">Service</th>
                      <th className="text-right p-3">Amount</th>
                      <th className="text-right p-3">Tax</th>
                      <th className="text-right p-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-3">Comprehensive Eye Exam</td>
                      <td className="text-right p-3">$150.00</td>
                      <td className="text-right p-3">$12.00</td>
                      <td className="text-right p-3 font-medium">$162.00</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3">Contact Lens Fitting</td>
                      <td className="text-right p-3">$75.00</td>
                      <td className="text-right p-3">$6.00</td>
                      <td className="text-right p-3 font-medium">$81.00</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50 border-t">
                    <tr>
                      <td colSpan={3} className="p-3 font-semibold text-right">Total Amount:</td>
                      <td className="p-3 font-bold text-right text-blue-600">$243.00</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-lg">
              <div className="text-center">
                <QrCode className="h-16 w-16 mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-600">QR Code for Invoice</p>
                <p className="text-xs text-slate-500">INV-{Date.now().toString().slice(-6)}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setInvoiceDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Invoice Generated",
                    description: "Invoice PDF has been generated and downloaded.",
                  });
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Invoice Sent",
                    description: "Invoice has been sent via email.",
                  });
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Invoice
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  toast({
                    title: "Invoice Shared",
                    description: "Invoice has been shared via WhatsApp.",
                  });
                }}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Share WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
            </div>
        )}

        {/* Appointments Tab Content */}
        {activeTab === "appointments" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                      Appointment Management
                    </CardTitle>
                    <p className="text-slate-600 mt-1">Schedule, manage, and track patient appointments</p>
                  </div>
                  <Button 
                    onClick={() => handleBookAppointment()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Appointment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAppointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4 hover:bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h4 className="font-semibold text-slate-900">{appointment.patientName}</h4>
                              <p className="text-sm text-slate-600">{appointment.patientCode}</p>
                            </div>
                            <div className="text-sm text-slate-600">
                              <p className="font-medium">{appointment.serviceType}</p>
                              <p>{new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}</p>
                            </div>
                            <Badge 
                              variant={appointment.status === "completed" ? "default" : appointment.status === "scheduled" ? "secondary" : "outline"}
                              className={appointment.status === "completed" ? "bg-green-100 text-green-800" : 
                                         appointment.status === "scheduled" ? "bg-blue-100 text-blue-800" : ""}
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                          {appointment.notes && (
                            <p className="text-sm text-slate-500 mt-2">{appointment.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "View Appointment",
                                description: `Opening details for appointment with ${appointment.patientName}`,
                              });
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => {
                                toast({
                                  title: "Edit Appointment",
                                  description: `Opening edit form for appointment with ${appointment.patientName}`,
                                });
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Appointment
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePrintAppointmentDetails(appointment)}>
                                <PrinterIcon className="mr-2 h-4 w-4" />
                                Print Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                toast({
                                  title: "QR Code Generated",
                                  description: `QR code generated for appointment with ${appointment.patientName}`,
                                });
                              }}>
                                <QrCode className="mr-2 h-4 w-4" />
                                Generate QR Code
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                toast({
                                  title: "Appointment Shared",
                                  description: `Sharing appointment details for ${appointment.patientName}`,
                                });
                              }}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share Appointment
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                toast({
                                  title: "Invoice Generated",
                                  description: `Generating invoice for appointment with ${appointment.patientName}`,
                                });
                              }}>
                                <Receipt className="mr-2 h-4 w-4" />
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}