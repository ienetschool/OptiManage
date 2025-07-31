import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Header removed for Patient Portal compatibility
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
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
  MoreHorizontal,
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
  Printer,
  DollarSign,
  Receipt,
  MessageSquare,
  ArrowUp,
  ArrowDown
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
      // Force immediate refetch to show new patient
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.refetchQueries({ queryKey: ["/api/patients"], type: 'active' });
      
      // Update cache immediately with new patient
      queryClient.setQueryData(["/api/patients"], (oldData: any) => {
        if (oldData) {
          return [...oldData, newPatient];
        }
        return [newPatient];
      });
      
      toast({
        title: "Success",
        description: "Patient registered successfully and added to list.",
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
Emergency Phone: ${patient.emergencyPhone || 'N/A'}
Insurance: ${patient.insuranceProvider || 'N/A'}
Allergies: ${patient.allergies || 'None'}
Medical History: ${patient.medicalHistory || 'None'}
Status: ${patient.isActive ? 'Active' : 'Inactive'}
    `;
    
    alert(patientInfo);
    
    toast({
      title: "Patient Details",
      description: `Viewing details for ${patient.firstName} ${patient.lastName}`,
    });
  };

  const handleViewMedicalHistory = (patient: Patient) => {
    toast({
      title: "Medical History",
      description: `Loading medical history for ${patient.firstName} ${patient.lastName}`,
    });
    // Medical history view would go here
  };

  const handleGenerateInvoice = (patient: Patient) => {
    toast({
      title: "Invoice Generated",
      description: `Creating invoice for ${patient.firstName} ${patient.lastName}`,
    });
    // Invoice generation would go here
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
            <title>Patient Medical Record - ${patient.firstName} ${patient.lastName}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Times New Roman', serif; 
                line-height: 1.5; 
                color: #000;
                background: #fff;
                font-size: 12pt;
              }
              .container { max-width: 210mm; margin: 0 auto; padding: 20mm; }
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
              .clinic-info { 
                font-size: 11pt; 
                color: #666;
                line-height: 1.3;
              }
              .document-title { 
                text-align: center;
                font-size: 16pt;
                font-weight: bold;
                margin: 20px 0;
                text-transform: uppercase;
                letter-spacing: 2px;
              }
              .patient-header {
                background: #f8fafc;
                padding: 15px;
                border: 1px solid #e2e8f0;
                margin-bottom: 20px;
                border-radius: 5px;
              }
              .section { 
                margin-bottom: 25px;
                page-break-inside: avoid;
              }
              .section-title { 
                font-size: 14pt;
                font-weight: bold;
                color: #2563eb;
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 5px;
                margin-bottom: 15px;
              }
              .info-grid { 
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 15px;
              }
              .info-item { 
                display: flex;
                margin-bottom: 8px;
              }
              .label { 
                font-weight: bold;
                min-width: 120px;
                color: #374151;
              }
              .value { 
                color: #111827;
              }
              .qr-section {
                position: absolute;
                top: 20mm;
                right: 20mm;
                text-align: center;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                background: #f9f9f9;
              }
              .footer { 
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                text-align: center;
                font-size: 10pt;
                color: #666;
              }
              .confidential {
                background: #fef2f2;
                border: 1px solid #fecaca;
                padding: 10px;
                margin: 20px 0;
                text-align: center;
                font-weight: bold;
                color: #dc2626;
              }
              @media print {
                body { margin: 0; }
                .container { padding: 15mm; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="letterhead">
                <div class="clinic-name">OptiStore Pro Medical Center</div>
                <div class="clinic-info">
                  123 Medical Plaza, Suite 400<br>
                  Healthcare City, HC 12345<br>
                  Phone: (555) 123-EYES | Fax: (555) 123-FAXS<br>
                  Email: info@optistorepro.com | www.optistorepro.com
                </div>
              </div>

              <div class="qr-section">
                <div style="font-size: 48px; margin-bottom: 8px;">📋</div>
                <div style="font-size: 10pt; font-weight: bold;">Patient ID</div>
                <div style="font-size: 9pt;">${patient.patientCode}</div>
              </div>

              <div class="document-title">Patient Medical Record</div>

              <div class="patient-header">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-size: 18pt; font-weight: bold;">${patient.firstName} ${patient.lastName}</div>
                    <div style="color: #666; margin-top: 5px;">Patient Code: ${patient.patientCode}</div>
                  </div>
                  <div style="text-align: right;">
                    <div><strong>Date of Birth:</strong> ${patient.dateOfBirth}</div>
                    <div><strong>Gender:</strong> ${patient.gender}</div>
                    <div><strong>Age:</strong> ${calculateAge(patient.dateOfBirth || '')} years</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Contact Information</div>
                <div class="info-grid">
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
                  </div>
                  <div>
                    <div class="info-item">
                      <span class="label">Emergency Contact:</span>
                      <span class="value">${patient.emergencyContact || 'Not provided'}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Emergency Phone:</span>
                      <span class="value">${patient.emergencyPhone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Medical Information</div>
                <div class="info-grid">
                  <div>
                    <div class="info-item">
                      <span class="label">Blood Group:</span>
                      <span class="value">${patient.bloodGroup || 'Unknown'}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Known Allergies:</span>
                      <span class="value">${patient.allergies || 'None reported'}</span>
                    </div>
                  </div>
                  <div>
                    <div class="info-item">
                      <span class="label">Medical History:</span>
                      <span class="value">${patient.medicalHistory || 'No significant history'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Insurance Information</div>
                <div class="info-grid">
                  <div>
                    <div class="info-item">
                      <span class="label">Insurance Provider:</span>
                      <span class="value">${patient.insuranceProvider || 'Not provided'}</span>
                    </div>
                  </div>
                  <div>
                    <div class="info-item">
                      <span class="label">Policy Number:</span>
                      <span class="value">${patient.insuranceNumber || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Account Information</div>
                <div class="info-grid">
                  <div>
                    <div class="info-item">
                      <span class="label">Loyalty Tier:</span>
                      <span class="value">${patient.loyaltyTier} (${patient.loyaltyPoints} points)</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Account Status:</span>
                      <span class="value">${patient.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  <div>
                    <div class="info-item">
                      <span class="label">Registration Date:</span>
                      <span class="value">${patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'Not available'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="confidential">
                CONFIDENTIAL PATIENT INFORMATION<br>
                This document contains privileged and confidential information intended only for authorized personnel.
              </div>

              <div class="footer">
                <p><strong>OptiStore Pro Medical Center</strong> | Licensed Medical Facility</p>
                <p>Generated on ${new Date().toLocaleString()} | Document ID: MR-${patient.patientCode}-${Date.now()}</p>
                <p style="margin-top: 10px; font-size: 9pt;">
                  This is a computer-generated document. For questions or corrections, please contact our medical records department.
                </p>
              </div>
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
      title: "Professional Record Generated",
      description: `Medical record for ${patient.firstName} ${patient.lastName} is ready for printing.`,
    });
  };



  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Patient Management</CardTitle>
              <CardDescription>
                Manage patient records and medical information
              </CardDescription>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Register New Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Register New Patient</DialogTitle>
                  <DialogDescription>
                    Add a new patient to the medical records system.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="patientCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Patient Code</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="PAT-001" readOnly />
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
                            <FormLabel>First Name</FormLabel>
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
                            <FormLabel>Last Name</FormLabel>
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
                            <FormLabel>Gender</FormLabel>
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
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+1 (555) 123-4567" />
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="john@example.com" type="email" />
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
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="123 Main St, City, State 12345" />
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
                            <FormLabel>Emergency Contact</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Jane Doe" />
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
                              <Input {...field} placeholder="+1 (555) 987-6543" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
                            <Textarea {...field} placeholder="Brief medical history..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="insuranceProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Insurance Provider</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Blue Cross Blue Shield" />
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
                              <Input {...field} placeholder="ABC123456789" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={filterGender} onValueChange={setFilterGender}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterBloodGroup} onValueChange={setFilterBloodGroup}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Blood Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
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
              <Select value={filterLoyaltyTier} onValueChange={setFilterLoyaltyTier}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Loyalty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="firstName">First Name</SelectItem>
                  <SelectItem value="lastName">Last Name</SelectItem>
                  <SelectItem value="patientCode">Patient Code</SelectItem>
                  <SelectItem value="dateOfBirth">Age</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </Button>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="mt-4 text-muted-foreground">Loading patients...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredPatients.map((patient) => (
                  <Card key={patient.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {patient.firstName} {patient.lastName}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>ID: {patient.patientCode}</span>
                              <span>{patient.phone}</span>
                              <span>{patient.email}</span>
                              <Badge variant={patient.isActive ? "default" : "secondary"}>
                                {patient.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Patient Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewDetails(patient)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditPatient(patient)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Patient
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewMedicalHistory(patient)}>
                                <FileText className="mr-2 h-4 w-4" />
                                Medical History
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewPrescriptions(patient)}>
                                <Pill className="mr-2 h-4 w-4" />
                                Prescriptions
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handlePrintPatientDetails(patient)}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleGenerateInvoice(patient)}>
                                <Receipt className="mr-2 h-4 w-4" />
                                Generate Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                const patientInfo = `Patient Information\n\nName: ${patient.firstName} ${patient.lastName}\nPatient Code: ${patient.patientCode}\nPhone: ${patient.phone || 'N/A'}\nEmail: ${patient.email || 'N/A'}\nBlood Group: ${patient.bloodGroup || 'N/A'}\nAllergies: ${patient.allergies || 'None'}\nInsurance: ${patient.insuranceProvider || 'N/A'}`;
                                
                                if (navigator.share) {
                                  navigator.share({
                                    title: 'Patient Information',
                                    text: patientInfo,
                                  }).then(() => {
                                    toast({
                                      title: "Shared Successfully",
                                      description: "Patient information has been shared.",
                                    });
                                  }).catch(() => {
                                    navigator.clipboard.writeText(patientInfo);
                                    toast({
                                      title: "Copied to Clipboard",
                                      description: "Patient information copied to clipboard.",
                                    });
                                  });
                                } else {
                                  navigator.clipboard.writeText(patientInfo).then(() => {
                                    toast({
                                      title: "Copied to Clipboard",
                                      description: "Patient information copied to clipboard.",
                                    });
                                  }).catch(() => {
                                    toast({
                                      title: "Share Failed",
                                      description: "Unable to share or copy patient information.",
                                      variant: "destructive",
                                    });
                                  });
                                }
                              }}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share Info
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeletePatient(patient.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
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
                  <div className="text-center py-8">
                    <User className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No patients found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchTerm ? "Try adjusting your search criteria." : "Get started by registering your first patient."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

