import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
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
  Printer,
  DollarSign,
  Receipt,
  MessageSquare,
  ArrowUpDown
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
      await apiRequest("POST", "/api/patients", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({
        title: "Success",
        description: "Patient registered successfully.",
      });
      setOpen(false);
      form.reset();
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

  const handleGenerateInvoice = (patient: Patient) => {
    setSelectedPatientForInvoice(patient);
    setInvoiceDialogOpen(true);
    toast({
      title: "Invoice Generation",
      description: `Creating invoice for ${patient.firstName} ${patient.lastName}`,
    });
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
            <meta charset="UTF-8">
            <style>
              @page {
                size: A4;
                margin: 20mm;
              }
              * { 
                margin: 0; 
                padding: 0; 
                box-sizing: border-box; 
              }
              body { 
                font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif; 
                line-height: 1.5; 
                color: #1a202c;
                background: #ffffff;
                font-size: 12pt;
              }
              .page-container { 
                max-width: 210mm; 
                min-height: 297mm; 
                margin: 0 auto; 
                padding: 15mm;
                background: white;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header { 
                background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                color: white; 
                padding: 25px 30px; 
                text-align: center; 
                border-radius: 12px;
                margin-bottom: 25px;
                box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2);
              }
              .header h1 { 
                font-size: 28pt; 
                font-weight: 700; 
                margin-bottom: 8px;
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
              }
              .header .subtitle { 
                font-size: 14pt; 
                opacity: 0.95; 
                font-weight: 400;
              }
              .clinic-info { 
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); 
                padding: 20px 25px; 
                border-radius: 10px;
                border-left: 6px solid #2563eb;
                margin-bottom: 25px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
              }
              .clinic-info h3 { 
                color: #2563eb; 
                font-size: 16pt; 
                margin-bottom: 10px;
                font-weight: 600;
              }
              .clinic-details { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 15px;
              }
              .clinic-details p { 
                color: #475569; 
                font-size: 11pt;
                display: flex;
                align-items: center;
              }
              .clinic-details .icon { 
                width: 16px; 
                height: 16px; 
                margin-right: 8px;
                color: #2563eb;
              }
              .patient-header {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                padding: 25px;
                border-radius: 12px;
                margin-bottom: 25px;
                border: 2px solid #0ea5e9;
                position: relative;
              }
              .patient-header::before {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                background: linear-gradient(45deg, #0ea5e9, #2563eb);
                border-radius: 12px;
                z-index: -1;
              }
              .patient-basic { 
                display: grid; 
                grid-template-columns: 2fr 1fr; 
                gap: 25px; 
                align-items: center;
              }
              .patient-name { 
                font-size: 24pt; 
                font-weight: 700; 
                color: #0f172a;
                margin-bottom: 8px;
                text-shadow: 0 1px 2px rgba(0,0,0,0.1);
              }
              .patient-code { 
                background: #2563eb; 
                color: white; 
                padding: 8px 16px; 
                border-radius: 8px; 
                font-size: 11pt;
                font-weight: 600;
                display: inline-block;
                margin-bottom: 12px;
                box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
              }
              .patient-avatar {
                width: 120px;
                height: 120px;
                background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 48pt;
                color: #6d28d9;
                font-weight: 700;
                border: 4px solid white;
                box-shadow: 0 8px 25px rgba(109, 40, 217, 0.2);
                margin: 0 auto;
              }
              .info-grid { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 25px; 
                margin-bottom: 25px;
              }
              .info-section { 
                background: #fefefe; 
                padding: 20px; 
                border-radius: 10px; 
                border: 1px solid #e2e8f0;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
              }
              .info-section h3 { 
                color: #1e40af; 
                font-size: 14pt; 
                margin-bottom: 15px; 
                font-weight: 600;
                border-bottom: 2px solid #dbeafe;
                padding-bottom: 8px;
              }
              .info-row { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 12px;
                padding: 8px 0;
                border-bottom: 1px solid #f1f5f9;
              }
              .info-row:last-child { 
                border-bottom: none; 
                margin-bottom: 0;
              }
              .info-label { 
                font-weight: 600; 
                color: #475569; 
                font-size: 11pt;
                min-width: 120px;
              }
              .info-value { 
                color: #0f172a; 
                font-size: 11pt;
                text-align: right;
                flex: 1;
              }
              .medical-alerts {
                background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                border: 2px solid #fca5a5;
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 25px;
              }
              .medical-alerts h3 {
                color: #dc2626;
                font-size: 14pt;
                font-weight: 700;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
              }
              .alert-icon {
                width: 20px;
                height: 20px;
                margin-right: 8px;
              }
              .qr-section {
                background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                margin-top: 25px;
                border: 2px dashed #9ca3af;
              }
              .qr-placeholder {
                width: 100px;
                height: 100px;
                border: 3px solid #6b7280;
                border-radius: 8px;
                margin: 0 auto 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: white;
                font-size: 36pt;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                padding: 20px;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                border-radius: 10px;
                border-top: 4px solid #2563eb;
              }
              .footer h4 {
                color: #1e40af;
                font-size: 16pt;
                font-weight: 700;
                margin-bottom: 8px;
              }
              .footer p {
                color: #475569;
                font-size: 10pt;
                margin-bottom: 4px;
              }
              .print-date {
                position: absolute;
                top: 10mm;
                right: 15mm;
                font-size: 9pt;
                color: #6b7280;
              }
              @media print {
                .page-container {
                  box-shadow: none;
                  margin: 0;
                  max-width: none;
                }
                body { background: white; }
              }
            </style>
          </head>
          <body>
            <div class="page-container">
              <div class="print-date">
                Generated: ${new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              
              <div class="header">
                <h1>OptiStore Pro Medical Center</h1>
                <div class="subtitle">Comprehensive Eye Care & Vision Solutions</div>
              </div>

              <div class="clinic-info">
                <h3>Clinic Information</h3>
                <div class="clinic-details">
                  <p><span class="icon">📍</span> 123 Medical Plaza, Healthcare City</p>
                  <p><span class="icon">📞</span> (555) 123-4567</p>
                  <p><span class="icon">📧</span> info@optistorepro.com</p>
                  <p><span class="icon">🌐</span> www.optistorepro.com</p>
                </div>
              </div>

              <div class="patient-header">
                <div class="patient-basic">
                  <div>
                    <div class="patient-name">${patient.firstName} ${patient.lastName}</div>
                    <div class="patient-code">Patient ID: ${patient.patientCode}</div>
                    <div style="color: #475569; font-size: 12pt;">
                      ${patient.gender ? `${patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)} • ` : ''}
                      ${patient.dateOfBirth ? `Age: ${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years` : ''}
                      ${patient.bloodGroup ? ` • Blood: ${patient.bloodGroup}` : ''}
                    </div>
                  </div>
                  <div class="patient-avatar">
                    ${(patient.firstName?.charAt(0) || 'P') + (patient.lastName?.charAt(0) || 'T')}
                  </div>
                </div>
              </div>

              ${patient.allergies ? `
              <div class="medical-alerts">
                <h3><span class="alert-icon">⚠️</span> Medical Alerts</h3>
                <p style="color: #dc2626; font-weight: 600;">${patient.allergies}</p>
              </div>
              ` : ''}

              <div class="info-grid">
                <div class="info-section">
                  <h3>Personal Information</h3>
                  <div class="info-row">
                    <span class="info-label">Date of Birth:</span>
                    <span class="info-value">${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not provided'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Gender:</span>
                    <span class="info-value">${patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'Not specified'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Blood Group:</span>
                    <span class="info-value">${patient.bloodGroup || 'Not provided'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Loyalty Tier:</span>
                    <span class="info-value">${patient.loyaltyTier ? patient.loyaltyTier.charAt(0).toUpperCase() + patient.loyaltyTier.slice(1) : 'Standard'}</span>
                  </div>
                </div>

                <div class="info-section">
                  <h3>Contact Details</h3>
                  <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${patient.phone || 'Not provided'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${patient.email || 'Not provided'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Address:</span>
                    <span class="info-value">${patient.address || 'Not provided'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Emergency Contact:</span>
                    <span class="info-value">${patient.emergencyContact || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div class="info-grid">
                <div class="info-section">
                  <h3>Insurance Information</h3>
                  <div class="info-row">
                    <span class="info-label">Provider:</span>
                    <span class="info-value">${patient.insuranceProvider || 'Not provided'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Policy Number:</span>
                    <span class="info-value">${patient.insuranceNumber || 'Not provided'}</span>
                  </div>
                </div>

                <div class="info-section">
                  <h3>Medical History</h3>
                  <div class="info-row">
                    <span class="info-label">Allergies:</span>
                    <span class="info-value">${patient.allergies || 'None reported'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Medical History:</span>
                    <span class="info-value">${patient.medicalHistory || 'None reported'}</span>
                  </div>
                </div>
              </div>

              <div class="qr-section">
                <div class="qr-placeholder">📱</div>
                <h4 style="color: #374151; font-size: 12pt; margin-bottom: 8px;">Patient QR Code</h4>
                <p style="color: #6b7280; font-size: 10pt;">
                  Scan to access patient record<br>
                  Patient ID: ${patient.patientCode}
                </p>
              </div>

              <div class="footer">
                <h4>OptiStore Pro Medical Center</h4>
                <p>This document contains confidential patient information protected by HIPAA.</p>
                <p>Unauthorized disclosure is strictly prohibited.</p>
                <p style="margin-top: 10px; font-weight: 600;">
                  Generated on ${new Date().toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
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
    toast({
      title: "Share Patient Info", 
      description: `Sharing information for ${patient.firstName} ${patient.lastName}`,
    });
    // Share implementation would go here
  };







  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Patient Management</h1>
            <p className="text-slate-600 mt-2">Manage patient records, medical history, and appointments</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add New Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Patient</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Patient Registration Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Basic Information</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name *</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} placeholder="Enter first name" />
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
                                <Input {...field} value={field.value || ""} placeholder="Enter last name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="patientCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Patient Code</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} placeholder="Auto-generated" readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
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
                              <Select onValueChange={field.onChange} value={field.value || ""}>
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
                      </div>

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

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Contact Information</h3>
                      
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
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} placeholder="Enter full address" />
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
                    </div>
                  </div>

                  {/* Insurance Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Insurance & Loyalty</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
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

                      <FormField
                        control={form.control}
                        name="loyaltyTier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Loyalty Tier</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || "bronze"}>
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
                    </div>

                    {/* Medical Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Medical Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="allergies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allergies</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} placeholder="List any allergies" />
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
                              <Input {...field} value={field.value || ""} placeholder="Brief medical history" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Advanced Medical Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Eye Prescription & Health Details</h3>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-4">
                        <div className="bg-slate-50 p-4 rounded-lg">
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
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createPatientMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                      {createPatientMutation.isPending ? "Registering..." : "Register Patient"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            </div>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterGender} onValueChange={setFilterGender}>
              <SelectTrigger>
                <SelectValue placeholder="All Genders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterBloodGroup} onValueChange={setFilterBloodGroup}>
              <SelectTrigger>
                <SelectValue placeholder="All Blood Groups" />
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
            
            <Select value={filterLoyaltyTier} onValueChange={setFilterLoyaltyTier}>
              <SelectTrigger>
                <SelectValue placeholder="All Tiers" />
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
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Patient List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Patient Records</CardTitle>
                <p className="text-sm text-slate-600">
                  {filteredPatients.length} of {patients.length} patients
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSortBy("name")}>
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Sort by Name
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSortBy("date")}>
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Sort by Date
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        checked={selectedPatients.includes(patient.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPatients([...selectedPatients, patient.id]);
                          } else {
                            setSelectedPatients(selectedPatients.filter(id => id !== patient.id));
                          }
                        }}
                      />
                      
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-medium text-slate-900">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <span>ID: {patient.patientCode}</span>
                          <span>Age: {calculateAge(patient.dateOfBirth || '')}</span>
                          <span>Phone: {patient.phone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={patient.isActive ? "default" : "secondary"}
                        className={patient.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {patient.isActive ? "Active" : "Inactive"}
                      </Badge>
                      
                      <Badge variant="outline" className="capitalize">
                        {patient.loyaltyTier}
                      </Badge>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewPatient(patient)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditPatient(patient)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Patient
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBookAppointment(patient)}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Book Appointment
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrintPatientDetails(patient)}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGenerateQRCode(patient)}>
                            <QrCode className="mr-2 h-4 w-4" />
                            Generate QR Code
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSharePatientInfo(patient)}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share Info
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGenerateInvoice(patient)}>
                            <Receipt className="mr-2 h-4 w-4" />
                            Generate Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredPatients.length === 0 && (
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No patients found</h3>
                  <p className="text-slate-500">Try adjusting your search criteria or add a new patient.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
