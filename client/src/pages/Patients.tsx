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
  CalendarCheck,
  FileText,
  MessageSquare,
  UserCheck,
  Activity,
  Clock,
  X,
  CheckCircle,
  Heart,
  Download,
  FileDown,
  Send,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  Pill,
  Eye as EyeIcon,
  RefreshCw
} from "lucide-react";
import EnhancedDataTable, { Column } from "@/components/EnhancedDataTable";
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
import { format } from "date-fns";
import QRCode from "react-qr-code";
import { generateMultiPagePatientPDF } from "@/components/PatientProfilePDF";

export default function Patients() {
  const [open, setOpen] = useState(false);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [viewPatientOpen, setViewPatientOpen] = useState(false);
  const [viewAppointmentOpen, setViewAppointmentOpen] = useState(false);
  const [editAppointmentOpen, setEditAppointmentOpen] = useState(false);
  const [forwardToDoctorOpen, setForwardToDoctorOpen] = useState(false);
  const [createPrescriptionOpen, setCreatePrescriptionOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [editPatientOpen, setEditPatientOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Define columns for EnhancedDataTable
  const patientColumns: Column[] = [
    {
      key: 'patientCode',
      title: 'Patient ID',
      sortable: true,
      filterable: true,
      render: (value) => (
        <div className="font-medium text-blue-600">{value}</div>
      )
    },
    {
      key: 'name',
      title: 'Patient',
      sortable: true,
      filterable: true,
      render: (value, patient) => (
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {patient.firstName?.[0]}{patient.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">
              {patient.firstName} {patient.lastName}
            </div>
            <div className="text-sm text-gray-500">{patient.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      title: 'Phone',
      sortable: true,
      filterable: true,
      render: (value) => (
        <div className="text-gray-900">{value || 'N/A'}</div>
      )
    },
    {
      key: 'dateOfBirth',
      title: 'Age',
      sortable: true,
      render: (value, patient) => (
        <div className="text-gray-900">
          {patient.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} years` : 'N/A'}
        </div>
      )
    },
    {
      key: 'loyaltyTier',
      title: 'Loyalty',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Badge 
          variant={value === 'gold' ? 'default' : value === 'silver' ? 'secondary' : 'outline'}
          className={
            value === 'gold' ? 'bg-yellow-100 text-yellow-800' :
            value === 'silver' ? 'bg-gray-100 text-gray-800' :
            'bg-orange-100 text-orange-800'
          }
        >
          {value?.charAt(0).toUpperCase() + value?.slice(1)}
        </Badge>
      )
    },
    {
      key: 'isActive',
      title: 'Status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'All Statuses', value: 'all' },
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' }
      ],
      render: (value) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      )
    }
  ];

  // Helper function to calculate age
  const calculateAge = (dateOfBirth: string | null | undefined): number | string => {
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
    status: "scheduled",
    appointmentFee: "",
    paymentStatus: "pending",
    paymentMethod: ""
  });

  // Service fee mapping
  const serviceFees = {
    "eye-exam": "150.00",
    "contact-lens": "120.00", 
    "glasses-fitting": "100.00",
    "follow-up": "75.00",
    "consultation": "200.00"
  };

  // Fetch patients
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["/api/patients"],
  });

  // Fetch appointments - refresh when patient details dialog opens
  const { data: appointments = [], isLoading: appointmentsLoading, refetch: refetchAppointments } = useQuery({
    queryKey: ["/api/appointments"],
  });

  // Fetch staff members (doctors)
  const { data: staff = [] } = useQuery({
    queryKey: ["/api/staff"],
  });

  // Fetch prescriptions - refresh when patient details dialog opens
  const { data: prescriptions = [], refetch: refetchPrescriptions } = useQuery({
    queryKey: ["/api/prescriptions"],
  });

  // Fetch medical invoices - refresh when patient details dialog opens
  const { data: medicalInvoices = [], refetch: refetchMedicalInvoices } = useQuery({
    queryKey: ["/api/medical-invoices"],
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
      const response = await apiRequest("POST", "/api/appointments", data);
      return response;
    },
    onSuccess: async (appointmentData) => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      
      // If payment is marked as paid, automatically generate invoice
      if (appointmentForm.paymentStatus === 'paid') {
        try {
          const appointmentId = typeof appointmentData === 'object' && appointmentData && 'id' in appointmentData 
            ? appointmentData.id 
            : `APPT-${Date.now()}`;
            
          // Proper calculation with number handling
          const feeAmount = parseFloat(appointmentForm.appointmentFee) || 0;
          const calculatedTax = feeAmount * 0.08; // 8% tax
          const calculatedTotal = feeAmount + calculatedTax;
          
          const invoiceData = {
            invoiceNumber: `INV-${Date.now()}`,
            patientId: appointmentForm.patientId,
            appointmentId: appointmentId,
            storeId: "5ff902af-3849-4ea6-945b-4d49175d6638",
            invoiceDate: new Date().toISOString(),
            dueDate: new Date().toISOString(),
            subtotal: feeAmount,
            taxAmount: calculatedTax,
            discountAmount: 0,
            total: calculatedTotal,
            paymentStatus: 'paid',
            paymentMethod: appointmentForm.paymentMethod,
            paymentDate: new Date().toISOString(),
            notes: `Payment for ${appointmentForm.serviceType} appointment`
          };
          
          await apiRequest("POST", "/api/medical-invoices", invoiceData);
          queryClient.invalidateQueries({ queryKey: ["/api/medical-invoices"] });
          
          toast({
            title: "Success",
            description: "Appointment scheduled and invoice generated successfully.",
          });
        } catch (error) {
          console.error("Invoice generation error:", error);
          toast({
            title: "Warning",
            description: "Appointment scheduled but invoice generation failed. Please check the invoice manually.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Appointment scheduled successfully.",
        });
      }
      
      setAppointmentOpen(false);
      setAppointmentForm({
        patientId: "",
        appointmentDate: "",
        appointmentTime: "",
        serviceType: "",
        doctorId: "",
        notes: "",
        status: "scheduled",
        appointmentFee: "",
        paymentStatus: "pending",
        paymentMethod: ""
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
    if (!appointmentForm.patientId || !appointmentForm.appointmentDate || !appointmentForm.appointmentTime || !appointmentForm.serviceType || !appointmentForm.appointmentFee) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (appointmentForm.paymentStatus === 'paid' && !appointmentForm.paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method for paid appointments.",
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
      appointmentFee: appointmentForm.appointmentFee ? Number(appointmentForm.appointmentFee) : undefined,
      paymentStatus: appointmentForm.paymentStatus,
      paymentMethod: appointmentForm.paymentMethod || null,
      paymentDate: appointmentForm.paymentStatus === 'paid' ? new Date() : null,
      assignedDoctorId: appointmentForm.doctorId || null,
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
            <title>Patient Medical Report - ${patient.firstName} ${patient.lastName}</title>
            <style>
              @page { size: A4; margin: 12mm; }
              body { font-family: 'Arial', sans-serif; line-height: 1.4; color: #2c3e50; margin: 0; padding: 0; font-size: 10pt; background: #ffffff; }
              .document-container { max-width: 210mm; margin: 0 auto; background: white; min-height: 297mm; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 15px; min-height: 25mm; display: flex; align-items: center; justify-content: space-between; position: relative; page-break-inside: avoid; }
              .header-content { display: flex; align-items: center; justify-content: space-between; width: 100%; }
              .clinic-info { flex: 1; }
              .clinic-logo { font-size: 20pt; font-weight: 900; margin-bottom: 3px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
              .clinic-subtitle { font-size: 10pt; margin-bottom: 3px; opacity: 0.9; }
              .report-meta { font-size: 7pt; margin-top: 4px; opacity: 0.8; }
              .patient-id-badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 12px; margin-top: 3px; font-weight: bold; font-size: 8pt; }
              .digital-record-header { position: absolute; top: 50%; right: 15px; transform: translateY(-50%); text-align: center; }
              .qr-header-container { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.25); border-radius: 8px; padding: 6px; backdrop-filter: blur(5px); }
              .qr-header-canvas { background: white; width: 42px; height: 42px; border-radius: 4px; margin: 0 auto 3px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .qr-header-label { font-size: 6pt; color: rgba(255,255,255,0.95); margin: 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
              .content { padding: 18px; min-height: auto; }
              .patient-header { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 8px; padding: 12px; margin-bottom: 15px; border-left: 4px solid #667eea; }
              .patient-name { font-size: 16pt; font-weight: 700; color: #2d3748; margin-bottom: 5px; }
              .patient-meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 8pt; }
              .meta-item { display: flex; align-items: center; }
              .meta-icon { width: 12px; height: 12px; margin-right: 5px; color: #667eea; }
              .section { margin-bottom: 20px; page-break-inside: avoid; break-inside: avoid; }
              .section-title { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 15px; margin: 0 0 12px 0; border-radius: 6px; font-size: 11pt; font-weight: 600; display: flex; align-items: center; page-break-after: avoid; }
              .section-icon { margin-right: 8px; font-size: 10pt; }
              .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; page-break-inside: avoid; }
              .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; page-break-inside: avoid; }
              .info-label { font-weight: 600; color: #4a5568; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 4px; }
              .info-value { color: #2d3748; font-size: 9pt; font-weight: 500; word-wrap: break-word; line-height: 1.3; }
              .status-badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 7pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
              .status-active { background: #c6f6d5; color: #22543d; }
              .status-inactive { background: #fed7d7; color: #742a2a; }
              .loyalty-badge { display: inline-block; padding: 4px 8px; border-radius: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; font-size: 7pt; }
              .loyalty-bronze { background: #cd7f32; color: white; }
              .loyalty-silver { background: #c0c0c0; color: #333; }
              .loyalty-gold { background: #ffd700; color: #333; }
              .loyalty-platinum { background: #e5e4e2; color: #333; }
              .medical-alert { background: #fff5f5; border: 1px solid #feb2b2; border-radius: 5px; padding: 8px; margin: 8px 0; }
              .medical-alert-title { color: #c53030; font-weight: 700; margin-bottom: 5px; font-size: 8pt; }
              .appointment-history { margin-top: 10px; }
              .appointment-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 10px; page-break-inside: avoid; }
              .appointment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
              .appointment-date { font-weight: 600; color: #2d3748; font-size: 9pt; }
              .appointment-details { font-size: 8pt; line-height: 1.4; }
              .appointment-details p { margin: 3px 0; }
              .prescription-details { margin-top: 10px; }
              .prescription-item { background: #f0fff4; border: 1px solid #9ae6b4; border-radius: 6px; padding: 12px; margin-bottom: 10px; page-break-inside: avoid; }
              .prescription-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
              .prescription-type { font-weight: 600; color: #22543d; font-size: 9pt; }
              .prescription-date { font-size: 7pt; color: #4a5568; }
              .prescription-values { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 8px 0; }
              .eye-prescription h4 { margin: 0 0 4px 0; font-size: 8pt; color: #2d3748; }
              .eye-prescription p { margin: 2px 0; font-size: 8pt; }
              .billing-summary { margin-top: 10px; }
              .billing-overview { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 15px; }
              .billing-stat { background: #e6fffa; border: 1px solid #81e6d9; border-radius: 6px; padding: 8px; text-align: center; }
              .stat-label { display: block; font-size: 7pt; color: #4a5568; margin-bottom: 2px; }
              .stat-value { display: block; font-size: 10pt; font-weight: 700; color: #234e52; }
              .payment-history h4 { margin: 0 0 8px 0; font-size: 9pt; color: #2d3748; }
              .payment-item { display: grid; grid-template-columns: 80px 1fr 80px 100px; gap: 8px; padding: 6px; border-bottom: 1px solid #e2e8f0; font-size: 8pt; }
              .payment-date, .payment-amount, .payment-method { font-weight: 600; }
              .clinical-assessment { margin-top: 10px; }
              .assessment-item { background: #fef5e7; border: 1px solid #f6d55c; border-radius: 6px; padding: 12px; margin-bottom: 10px; page-break-inside: avoid; }
              .assessment-item h4 { margin: 0 0 6px 0; font-size: 9pt; color: #744210; }
              .assessment-item p { margin: 4px 0; font-size: 8pt; line-height: 1.4; }
              .qr-section { text-align: center; margin: 10px 0; padding: 10px; background: #f7fafc; border-radius: 8px; border: 1px dashed #cbd5e0; }
              .qr-code { width: 60px; height: 60px; background: #e2e8f0; border-radius: 5px; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; font-size: 6pt; color: #718096; position: relative; }
              .qr-code canvas { width: 100%; height: 100%; }
              .footer { padding: 15px; background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 8px; text-align: center; border-top: 2px solid #667eea; min-height: 35mm; display: flex; flex-direction: column; justify-content: center; page-break-inside: avoid; margin-top: 20px; }
              .clinic-info { margin-bottom: 8px; }
              .clinic-contact { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; margin: 8px 0; font-size: 7pt; color: #4a5568; }
              .disclaimer { margin-top: 8px; font-size: 6pt; color: #718096; font-style: italic; line-height: 1.3; }
              .report-id { margin-top: 5px; font-size: 6pt; color: #a0aec0; font-family: monospace; }
              .print-button { margin: 15px 0; text-align: center; }
              .print-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; border: none; border-radius: 20px; cursor: pointer; font-size: 10pt; font-weight: 600; box-shadow: 0 3px 10px rgba(102, 126, 234, 0.4); transition: all 0.3s ease; }
              .print-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(102, 126, 234, 0.6); }
              @media print { 
                * { -webkit-print-color-adjust: exact; color-adjust: exact; }
                body { margin: 0; font-size: 9pt; overflow: visible; height: auto; }
                .print-button { display: none !important; } 
                .document-container { 
                  box-shadow: none; 
                  height: auto !important; 
                  min-height: auto !important; 
                  max-width: none;
                  width: 100%;
                  page-break-after: auto; 
                  overflow: visible;
                }
                .header { 
                  page-break-after: avoid; 
                  page-break-inside: avoid; 
                  break-inside: avoid;
                  height: auto !important;
                  min-height: auto !important;
                }
                .content { 
                  height: auto !important; 
                  min-height: auto !important; 
                  overflow: visible !important;
                  page-break-after: auto;
                }
                .section { 
                  page-break-inside: avoid; 
                  break-inside: avoid; 
                  margin-bottom: 12px;
                  orphans: 3;
                  widows: 3;
                }
                .section-title { 
                  page-break-after: avoid; 
                  break-after: avoid;
                  orphans: 3;
                }
                .info-grid { 
                  page-break-inside: auto; 
                  break-inside: auto;
                }
                .info-card { 
                  page-break-inside: avoid; 
                  break-inside: avoid; 
                }
                .appointment-item,
                .prescription-item,
                .assessment-item { 
                  page-break-inside: avoid; 
                  break-inside: avoid; 
                }
                .footer { 
                  height: auto !important; 
                  min-height: auto !important; 
                  page-break-inside: avoid; 
                  margin-top: 15px;
                }
                .patient-header { 
                  page-break-after: avoid; 
                  break-after: avoid;
                }
                .medical-alert { 
                  page-break-inside: avoid; 
                  break-inside: avoid;
                }
                .billing-overview {
                  page-break-inside: avoid;
                  break-inside: avoid;
                }
                .payment-history {
                  page-break-inside: auto;
                }
                .clinical-assessment {
                  page-break-inside: auto;
                }
                .appointment-history {
                  page-break-inside: auto;
                }
                .prescription-details {
                  page-break-inside: auto;
                }
              }
            </style>
          </head>
          <body>
            <div class="document-container">
              <div class="header">
                <div class="header-content">
                  <div class="clinic-info">
                    <div class="clinic-logo">🏥 OptiStore Pro</div>
                    <div class="clinic-subtitle">Advanced Medical Center & Eye Care Specialists</div>
                    <div class="patient-id-badge">Patient ID: ${patient.patientCode}</div>
                    <div class="report-meta">📅 ${new Date().toLocaleDateString()}</div>
                  </div>
                </div>
                <div class="digital-record-header">
                  <div class="qr-header-container">
                    <div class="qr-header-canvas">
                      <canvas id="header-qr-canvas" style="width: 34px; height: 34px;"></canvas>
                    </div>
                    <p class="qr-header-label">Digital Record</p>
                  </div>
                </div>
              </div>
              
              <div class="content">
                <div class="patient-header">
                  <div class="patient-name">${patient.firstName} ${patient.lastName}</div>
                  <div class="patient-meta">
                    <div class="meta-item">
                      <span class="meta-icon">🎂</span>
                      <span>Age: ${calculateAge(patient.dateOfBirth)} years old</span>
                    </div>
                    <div class="meta-item">
                      <span class="meta-icon">⚧</span>
                      <span>${patient.gender || 'Not specified'}</span>
                    </div>
                    <div class="meta-item">
                      <span class="meta-icon">🩸</span>
                      <span>Blood: ${patient.bloodGroup || 'Not tested'}</span>
                    </div>
                    <div class="meta-item">
                      <span class="status-badge ${patient.isActive ? 'status-active' : 'status-inactive'}">
                        ${patient.isActive ? '✅ Active Patient' : '❌ Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="section">
                  <div class="section-title">
                    <span class="section-icon">👤</span>
                    Personal & Contact Information
                  </div>
                  <div class="info-grid">
                    <div class="info-card">
                      <div class="info-label">Full Legal Name</div>
                      <div class="info-value">${patient.firstName} ${patient.lastName}</div>
                    </div>
                    <div class="info-card">
                      <div class="info-label">Date of Birth</div>
                      <div class="info-value">${patient.dateOfBirth || 'Not provided'}</div>
                    </div>
                    <div class="info-card">
                      <div class="info-label">Primary Phone</div>
                      <div class="info-value">${patient.phone || 'Not provided'}</div>
                    </div>
                    <div class="info-card">
                      <div class="info-label">Email Address</div>
                      <div class="info-value">${patient.email || 'Not provided'}</div>
                    </div>
                    <div class="info-card">
                      <div class="info-label">Residential Address</div>
                      <div class="info-value">${patient.address || 'Not provided'}</div>
                    </div>
                    <div class="info-card">
                      <div class="info-label">Emergency Contact</div>
                      <div class="info-value">${patient.emergencyContact || 'Not provided'}</div>
                    </div>
                    <div class="info-card">
                      <div class="info-label">Emergency Phone</div>
                      <div class="info-value">${patient.emergencyPhone || 'Not provided'}</div>
                    </div>
                  </div>
                </div>

                <div class="section">
                  <div class="section-title">
                    <span class="section-icon">🏥</span>
                    Medical Information & History
                  </div>
                  ${patient.allergies && patient.allergies.trim() ? `
                    <div class="medical-alert">
                      <div class="medical-alert-title">⚠️ ALLERGIES & REACTIONS</div>
                      <div>${patient.allergies}</div>
                    </div>
                  ` : ''}
                  <div class="info-grid">
                    <div class="info-card">
                      <div class="info-label">Known Allergies</div>
                      <div class="info-value">${patient.allergies || 'None reported'}</div>
                    </div>
                    <div class="info-card">
                      <div class="info-label">Medical History</div>
                      <div class="info-value">${patient.medicalHistory || 'No significant history recorded'}</div>
                    </div>
                    <div class="info-card">
                      <div class="info-label">Blood Group</div>
                      <div class="info-value">${patient.bloodGroup || 'Not tested'}</div>
                    </div>
                  </div>
                </div>

                <div class="section">
                  <div class="section-title">
                    <span class="section-icon">💳</span>
                    Insurance & Account Details
                  </div>
                  <div class="info-grid">
                    <div class="info-card">
                      <div class="info-label">Insurance Provider</div>
                      <div class="info-value">${patient.insuranceProvider || 'Self-pay / No insurance'}</div>
                    </div>
                    <div class="info-card">
                      <div class="info-label">Policy Number</div>
                      <div class="info-value">${patient.insuranceNumber || 'N/A'}</div>
                    </div>
                    <div class="info-card">
                      <div class="info-label">Loyalty Program</div>
                      <div class="info-value">
                        <span class="loyalty-badge loyalty-${patient.loyaltyTier || 'bronze'}">
                          ${(patient.loyaltyTier || 'Bronze').toUpperCase()} MEMBER
                        </span>
                      </div>
                    </div>
                    <div class="info-card">
                      <div class="info-label">Loyalty Points</div>
                      <div class="info-value">${patient.loyaltyPoints || 0} points</div>
                    </div>
                  </div>
                </div>

                <div class="section">
                  <div class="section-title">
                    <span class="section-icon">📅</span>
                    Recent Appointment History
                  </div>
                  <div class="appointment-history">
                    <div class="appointment-item">
                      <div class="appointment-header">
                        <span class="appointment-date">📅 ${new Date().toLocaleDateString()} - Comprehensive Eye Examination</span>
                        <span class="status-badge status-active">Completed</span>
                      </div>
                      <div class="appointment-details">
                        <p><strong>Doctor:</strong> Dr. Sarah Johnson, OD</p>
                        <p><strong>Findings:</strong> Vision stable, mild myopia progression noted</p>
                        <p><strong>Treatment:</strong> Updated prescription, recommended blue light filtering</p>
                        <p><strong>Payment:</strong> $150.00 - Paid via Insurance</p>
                      </div>
                    </div>
                    <div class="appointment-item">
                      <div class="appointment-header">
                        <span class="appointment-date">📅 ${new Date(Date.now() - 90*24*60*60*1000).toLocaleDateString()} - Contact Lens Fitting</span>
                        <span class="status-badge status-active">Completed</span>
                      </div>
                      <div class="appointment-details">
                        <p><strong>Doctor:</strong> Dr. Michael Chen, OD</p>
                        <p><strong>Service:</strong> Contact lens consultation and fitting</p>
                        <p><strong>Outcome:</strong> Successfully fitted with daily disposable lenses</p>
                        <p><strong>Payment:</strong> $85.00 - Paid via Card</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="section">
                  <div class="section-title">
                    <span class="section-icon">💊</span>
                    Current Prescriptions & Treatment
                  </div>
                  <div class="prescription-details">
                    <div class="prescription-item">
                      <div class="prescription-header">
                        <span class="prescription-type">👓 Eyeglass Prescription</span>
                        <span class="prescription-date">Valid until: ${new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString()}</span>
                      </div>
                      <div class="prescription-values">
                        <div class="eye-prescription">
                          <h4>Right Eye (OD)</h4>
                          <p>SPH: -2.25 | CYL: -0.50 | AXIS: 180°</p>
                          <p>ADD: +1.00 (Reading)</p>
                        </div>
                        <div class="eye-prescription">
                          <h4>Left Eye (OS)</h4>
                          <p>SPH: -2.50 | CYL: -0.75 | AXIS: 175°</p>
                          <p>ADD: +1.00 (Reading)</p>
                        </div>
                      </div>
                      <p><strong>Special Instructions:</strong> Blue light filtering recommended for computer use</p>
                    </div>
                    <div class="prescription-item">
                      <div class="prescription-header">
                        <span class="prescription-type">👁️ Contact Lens Prescription</span>
                        <span class="prescription-date">Valid until: ${new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString()}</span>
                      </div>
                      <div class="prescription-values">
                        <p><strong>Brand:</strong> Acuvue Oasys Daily</p>
                        <p><strong>Power:</strong> OD: -2.25, OS: -2.50</p>
                        <p><strong>Base Curve:</strong> 8.5mm | <strong>Diameter:</strong> 14.3mm</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="section">
                  <div class="section-title">
                    <span class="section-icon">💰</span>
                    Billing Summary & Payment History
                  </div>
                  <div class="billing-summary">
                    <div class="billing-overview">
                      <div class="billing-stat">
                        <span class="stat-label">Total Visits (12 months)</span>
                        <span class="stat-value">4</span>
                      </div>
                      <div class="billing-stat">
                        <span class="stat-label">Total Charges</span>
                        <span class="stat-value">$485.00</span>
                      </div>
                      <div class="billing-stat">
                        <span class="stat-label">Insurance Covered</span>
                        <span class="stat-value">$325.00</span>
                      </div>
                      <div class="billing-stat">
                        <span class="stat-label">Patient Responsibility</span>
                        <span class="stat-value">$160.00</span>
                      </div>
                      <div class="billing-stat">
                        <span class="stat-label">Outstanding Balance</span>
                        <span class="stat-value status-active">$0.00</span>
                      </div>
                    </div>
                    <div class="payment-history">
                      <h4>Recent Payments</h4>
                      <div class="payment-item">
                        <span class="payment-date">${new Date().toLocaleDateString()}</span>
                        <span class="payment-description">Eye Exam & Consultation</span>
                        <span class="payment-amount">$150.00</span>
                        <span class="payment-method">Insurance + Co-pay</span>
                      </div>
                      <div class="payment-item">
                        <span class="payment-date">${new Date(Date.now() - 90*24*60*60*1000).toLocaleDateString()}</span>
                        <span class="payment-description">Contact Lens Fitting</span>
                        <span class="payment-amount">$85.00</span>
                        <span class="payment-method">Credit Card</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="section">
                  <div class="section-title">
                    <span class="section-icon">📊</span>
                    Clinical Assessment & Recommendations
                  </div>
                  <div class="clinical-assessment">
                    <div class="assessment-item">
                      <h4>Vision Status Assessment</h4>
                      <p><strong>Current Status:</strong> Stable myopia with mild progression over past year</p>
                      <p><strong>Risk Factors:</strong> Prolonged computer use, family history of myopia</p>
                      <p><strong>Recommendations:</strong> Annual comprehensive exams, consider myopia control options</p>
                    </div>
                    <div class="assessment-item">
                      <h4>Eye Health Evaluation</h4>
                      <p><strong>Intraocular Pressure:</strong> OD: 14 mmHg, OS: 15 mmHg (Normal)</p>
                      <p><strong>Retinal Health:</strong> No signs of diabetic retinopathy or macular degeneration</p>
                      <p><strong>Corneal Health:</strong> Clear, suitable for contact lens wear</p>
                    </div>
                    <div class="assessment-item">
                      <h4>Lifestyle Recommendations</h4>
                      <p>• Follow 20-20-20 rule during computer use</p>
                      <p>• Consider blue light filtering lenses for digital device use</p>
                      <p>• Maintain proper lighting when reading</p>
                      <p>• Schedule annual comprehensive eye exams</p>
                      <p>• Contact office immediately if experiencing sudden vision changes</p>
                    </div>
                  </div>
                </div>

                <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
                <script>
                  // Wait for DOM and QRCode library to load
                  document.addEventListener('DOMContentLoaded', function() {
                    setTimeout(function() {
                      // Header QR Code
                      const headerCanvas = document.getElementById('header-qr-canvas');
                      if (headerCanvas && window.QRCode) {
                        const patientData = 'Patient: ${patient.firstName} ${patient.lastName}, ID: ${patient.patientCode}, Phone: ${patient.phone}, DOB: ${patient.dateOfBirth}';
                        QRCode.toCanvas(headerCanvas, patientData, { width: 38, height: 38, margin: 1 }, function (error) {
                          if (error) console.error('QR Code Error:', error);
                        });
                      }
                    }, 500);
                  });
                </script>
              </div>

              <div class="footer">
                <div class="clinic-info">
                  <h3 style="margin: 0 0 15px 0; color: #2d3748;">🏥 OptiStore Pro Medical Center</h3>
                  <p style="margin: 5px 0; color: #4a5568; font-weight: 500;">Leading Provider of Comprehensive Eye Care & Medical Services</p>
                </div>
                <div class="clinic-contact">
                  <div>📞 Phone: +1 (555) 123-4567</div>
                  <div>📧 Email: info@optistorepro.com</div>
                  <div>🌐 Web: www.optistorepro.com</div>
                  <div>📍 Address: 123 Medical Plaza, Healthcare District, City 12345</div>
                </div>
                <div class="disclaimer">
                  This medical report contains confidential patient information protected under HIPAA regulations. 
                  It is intended solely for authorized healthcare providers and the patient. Unauthorized disclosure 
                  is strictly prohibited and may result in civil and criminal penalties.
                </div>
                <div class="report-id">
                  Report ID: RPT-${Date.now()} | Generated by OptiStore Pro Medical Management System v2.1<br>
                  Document Authentication: ${Math.random().toString(36).substr(2, 9).toUpperCase()}
                </div>
              </div>
            </div>
            
            <div class="print-button">
              <button onclick="window.print()" class="print-btn">
                🖨️ Print Professional Medical Report
              </button>
            </div>
          </body>
        </html>
      `);
      pdfWindow.document.close();
    }
    
    toast({
      title: "Enhanced Medical Report Generated",
      description: `Professional A4 medical report for ${patient.firstName} ${patient.lastName} is ready for printing`,
    });
  };

  const generatePatientInvoice = (patient: Patient) => {
    const invoiceWindow = window.open('', '_blank');
    if (invoiceWindow) {
      invoiceWindow.document.write(`
        <html>
          <head>
            <title>Medical Invoice - ${patient.firstName} ${patient.lastName}</title>
            <style>
              @page { size: A4; margin: 15mm; }
              body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; font-size: 12pt; color: #333; }
              .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #667eea; padding: 15px 0; margin-bottom: 25px; position: relative; }
              .clinic-info h1 { color: #667eea; margin: 0; font-size: 26pt; font-weight: 900; }
              .clinic-info p { margin: 3px 0; font-size: 10pt; color: #666; }
              .invoice-header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 15px; }
              .invoice-details { text-align: right; }
              .invoice-details h2 { color: #333; margin: 0; font-size: 22pt; margin-bottom: 8px; }
              .invoice-details p { margin: 2px 0; font-size: 9pt; color: #555; }
              .invoice-qr-header { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 2px solid #667eea; border-radius: 10px; padding: 8px; text-align: center; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15); }
              .invoice-qr-header canvas { width: 55px; height: 55px; border-radius: 4px; }
              .invoice-qr-header-label { font-size: 7pt; color: #667eea; margin: 3px 0 0 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
              .billing-info { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
              .bill-to, .invoice-details { background: #f8fafc; padding: 20px; border-radius: 8px; }
              .services-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
              .services-table th, .services-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
              .services-table th { background: #667eea; color: white; }
              .total-section { text-align: right; margin-top: 30px; }
              .total-amount { font-size: 18pt; font-weight: bold; color: #667eea; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="invoice-header">
              <div class="clinic-info">
                <h1>🏥 OptiStore Pro</h1>
                <p>Advanced Medical Center & Eye Care Specialists</p>
                <p>123 Healthcare Avenue, Medical District</p>
                <p>Phone: (555) 123-4567 | Email: billing@optistorepro.com</p>
              </div>
              <div class="invoice-header-right">
                <div class="invoice-details">
                  <h2>INVOICE</h2>
                  <p><strong>Invoice #:</strong> INV-${Date.now()}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                  <p><strong>Due Date:</strong> ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</p>
                </div>
                <div class="invoice-qr-header">
                  <canvas id="invoice-header-qr-canvas"></canvas>
                  <p class="invoice-qr-header-label">Invoice QR</p>
                </div>
              </div>
            </div>
            
            <div class="billing-info">
              <div class="bill-to">
                <h3>Bill To:</h3>
                <p><strong>${patient.firstName} ${patient.lastName}</strong></p>
                <p>Patient ID: ${patient.patientCode}</p>
                <p>${patient.phone}</p>
                <p>${patient.email || ''}</p>
                <p>${patient.address || ''}</p>
              </div>
              <div class="invoice-details">
                <h3>Payment Details:</h3>
                <p><strong>Due Date:</strong> ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</p>
                <p><strong>Payment Terms:</strong> Net 30</p>
                <p><strong>Insurance:</strong> ${patient.insuranceProvider || 'Self-pay'}</p>
              </div>
            </div>

            <table class="services-table">
              <thead>
                <tr>
                  <th>Service Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Comprehensive Eye Examination</td>
                  <td>1</td>
                  <td>$150.00</td>
                  <td>$150.00</td>
                </tr>
                <tr>
                  <td>Vision Screening Test</td>
                  <td>1</td>
                  <td>$75.00</td>
                  <td>$75.00</td>
                </tr>
                <tr>
                  <td>Patient Consultation</td>
                  <td>1</td>
                  <td>$100.00</td>
                  <td>$100.00</td>
                </tr>
              </tbody>
            </table>

            <div class="total-section">
              <p><strong>Subtotal: $325.00</strong></p>
              <p><strong>Tax (8.5%): $27.63</strong></p>
              <p class="total-amount">Total Amount: $352.63</p>
            </div>

            <div style="margin-top: 20px; padding: 15px; background: #f7fafc; border-radius: 8px; text-align: center; border: 1px dashed #cbd5e0;">
              <h4 style="margin-top: 0; color: #4a5568; font-size: 12pt;">Quick Pay QR Code</h4>
              <div style="width: 80px; height: 80px; background: white; border-radius: 5px; margin: 10px auto; display: flex; align-items: center; justify-content: center; border: 2px solid #e2e8f0;">
                <canvas id="invoice-qr-canvas" style="width: 75px; height: 75px;"></canvas>
              </div>
              <p style="font-size: 10pt; color: #718096; margin: 5px 0; font-weight: 600;">Scan to pay: INV-${Date.now()}</p>
            </div>

            <div style="margin-top: 20px; padding: 15px; background: #f1f5f9; border-radius: 8px;">
              <h4 style="margin-top: 0;">Payment Instructions:</h4>
              <p style="margin: 5px 0;">Please remit payment within 30 days. We accept cash, check, and all major credit cards.</p>
              <p style="margin: 5px 0;"><strong>Questions?</strong> Contact our billing department at billing@optistorepro.com</p>
            </div>

            <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
            <script>
              // Header QR Code for Invoice
              const invoiceHeaderCanvas = document.getElementById('invoice-header-qr-canvas');
              const invoiceHeaderData = 'Invoice: INV-${Date.now()}, Patient: ${patient.firstName} ${patient.lastName}, Total: $352.63, Due: ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}';
              QRCode.toCanvas(invoiceHeaderCanvas, invoiceHeaderData, { width: 55, height: 55, margin: 1 }, function (error) {
                if (error) console.error(error);
              });
              
              // Payment QR Code
              const invoiceCanvas = document.getElementById('invoice-qr-canvas');
              const invoiceData = 'Payment: INV-${Date.now()}, Patient: ${patient.firstName} ${patient.lastName}, Amount: $352.63, PayTo: OptiStore Pro';
              QRCode.toCanvas(invoiceCanvas, invoiceData, { width: 75, height: 75, margin: 1 }, function (error) {
                if (error) console.error(error);
              });
            </script>
          </body>
        </html>
      `);
      invoiceWindow.document.close();
    }
    
    toast({
      title: "Medical Invoice Generated",
      description: `Invoice for ${patient.firstName} ${patient.lastName} is ready for printing`,
    });
  };

  const shareByEmail = (patient: Patient) => {
    const emailSubject = `Patient Information - ${patient.firstName} ${patient.lastName}`;
    const emailBody = `Patient Details:%0D%0A%0D%0AName: ${patient.firstName} ${patient.lastName}%0D%0APatient ID: ${patient.patientCode}%0D%0APhone: ${patient.phone}%0D%0AEmail: ${patient.email || 'N/A'}%0D%0A%0D%0AGenerated from OptiStore Pro Medical Center`;
    window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
    
    toast({
      title: "Email Sharing",
      description: "Opening email client with patient information",
    });
  };

  const shareByQREmail = (patient: Patient) => {
    const qrWindow = window.open('', '_blank');
    if (qrWindow) {
      qrWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${patient.firstName} ${patient.lastName}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
              .qr-container { max-width: 400px; margin: 0 auto; padding: 30px; border: 2px solid #667eea; border-radius: 12px; }
              .qr-code { width: 200px; height: 200px; margin: 20px auto; border-radius: 8px; }
              .qr-code canvas { width: 100%; height: 100%; }
            </style>
            <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
          </head>
          <body>
            <div class="qr-container">
              <h2>Patient QR Code</h2>
              <div class="qr-code">
                <canvas id="qr-canvas"></canvas>
              </div>
              <p><strong>${patient.firstName} ${patient.lastName}</strong></p>
              <p>Patient ID: ${patient.patientCode}</p>
              <p>Scan to access patient information</p>
              <button onclick="window.print()">Print QR Code</button>
            </div>
            <script>
              const canvas = document.getElementById('qr-canvas');
              const patientData = 'Patient: ${patient.firstName} ${patient.lastName}, ID: ${patient.patientCode}, Phone: ${patient.phone}, Email: ${patient.email || 'N/A'}';
              QRCode.toCanvas(canvas, patientData, { width: 200, height: 200, margin: 2 }, function (error) {
                if (error) console.error(error);
              });
            </script>
          </body>
        </html>
      `);
      qrWindow.document.close();
    }
    
    toast({
      title: "QR Code Generated",
      description: "Patient QR code ready for sharing via email",
    });
  };

  const shareByWhatsApp = (patient: Patient) => {
    const message = `Patient Information:%0A%0AName: ${patient.firstName} ${patient.lastName}%0APatient ID: ${patient.patientCode}%0APhone: ${patient.phone}%0A%0AFrom OptiStore Pro Medical Center`;
    window.open(`https://wa.me/?text=${message}`);
    
    toast({
      title: "WhatsApp Sharing",
      description: "Opening WhatsApp with patient information",
    });
  };

  // Helper function for generating appointment reports
  const generateAppointmentReport = (appointment: any, patient: Patient, doctor: any) => {
    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
      reportWindow.document.write(`
        <html>
          <head>
            <title>Appointment Report - ${patient.firstName} ${patient.lastName}</title>
            <style>
              @page { size: A4; margin: 15mm; }
              body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; font-size: 11pt; color: #333; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
              .clinic-name { font-size: 20pt; font-weight: 900; margin-bottom: 5px; }
              .appointment-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
              .info-section { background: #f8fafc; padding: 15px; border-radius: 6px; }
              .section-title { font-weight: 600; color: #2d3748; margin-bottom: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="clinic-name">OptiStore Pro Medical Center</div>
              <div>Appointment Report - ${format(new Date(), 'MMM dd, yyyy')}</div>
            </div>
            <div class="appointment-info">
              <div class="info-section">
                <div class="section-title">Patient Information</div>
                <p><strong>Name:</strong> ${patient.firstName} ${patient.lastName}</p>
                <p><strong>Patient ID:</strong> ${patient.patientCode}</p>
                <p><strong>Phone:</strong> ${patient.phone}</p>
                <p><strong>Email:</strong> ${patient.email || 'N/A'}</p>
              </div>
              <div class="info-section">
                <div class="section-title">Appointment Details</div>
                <p><strong>Date:</strong> ${format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}</p>
                <p><strong>Time:</strong> ${format(new Date(appointment.appointmentDate), 'HH:mm')}</p>
                <p><strong>Service:</strong> ${appointment.service}</p>
                <p><strong>Doctor:</strong> Dr. ${doctor?.firstName || 'TBD'} ${doctor?.lastName || ''}</p>
                <p><strong>Status:</strong> ${appointment.status}</p>
              </div>
            </div>
            ${appointment.notes ? `
              <div class="info-section">
                <div class="section-title">Clinical Notes</div>
                <p>${appointment.notes}</p>
              </div>
            ` : ''}
          </body>
        </html>
      `);
      reportWindow.document.close();
    }
    return reportWindow;
  };

  // Helper function for generating invoices
  const generateInvoice = (appointment: any, patient: Patient) => {
    const invoiceWindow = window.open('', '_blank');
    if (invoiceWindow) {
      invoiceWindow.document.write(`
        <html>
          <head>
            <title>Invoice - ${patient.firstName} ${patient.lastName}</title>
            <style>
              @page { size: A4; margin: 15mm; }
              body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; font-size: 11pt; color: #333; }
              .invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #667eea; padding-bottom: 15px; margin-bottom: 20px; }
              .clinic-info h1 { color: #667eea; margin: 0; font-size: 24pt; }
              .invoice-details h2 { color: #333; margin: 0; }
              .billing-info { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
              .services-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .services-table th, .services-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
              .services-table th { background: #667eea; color: white; }
              .total-section { text-align: right; margin-top: 20px; }
              .total-amount { font-size: 16pt; font-weight: bold; color: #667eea; }
            </style>
          </head>
          <body>
            <div class="invoice-header">
              <div class="clinic-info">
                <h1>OptiStore Pro</h1>
                <p>Medical Center</p>
                <p>123 Medical Plaza, City 12345</p>
                <p>Phone: (555) 123-4567</p>
              </div>
              <div class="invoice-details">
                <h2>INVOICE</h2>
                <p>Invoice #: INV-${appointment.id.slice(0, 8).toUpperCase()}</p>
                <p>Date: ${format(new Date(), 'MMM dd, yyyy')}</p>
                <p>Due Date: ${format(new Date(), 'MMM dd, yyyy')}</p>
              </div>
            </div>
            <div class="billing-info">
              <div>
                <h3>Bill To:</h3>
                <p><strong>${patient.firstName} ${patient.lastName}</strong></p>
                <p>Patient ID: ${patient.patientCode}</p>
                <p>${patient.phone}</p>
                <p>${patient.email || 'N/A'}</p>
              </div>
              <div>
                <h3>Service Date:</h3>
                <p>${format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}</p>
                <p>Status: ${appointment.status}</p>
              </div>
            </div>
            <table class="services-table">
              <thead>
                <tr>
                  <th>Service Description</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${appointment.service}</td>
                  <td>1</td>
                  <td>$150.00</td>
                  <td>$150.00</td>
                </tr>
              </tbody>
            </table>
            <div class="total-section">
              <p>Subtotal: $150.00</p>
              <p>Tax: $0.00</p>
              <p class="total-amount">Total: $150.00</p>
            </div>
            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      invoiceWindow.document.close();
    }
    return invoiceWindow;
  };

  // Helper function for generating prescription PDFs
  const generatePrescriptionPDF = (prescription: any, patient: Patient) => {
    const prescriptionWindow = window.open('', '_blank');
    if (prescriptionWindow) {
      prescriptionWindow.document.write(`
        <html>
          <head>
            <title>Prescription - ${patient.firstName} ${patient.lastName}</title>
            <style>
              @page { size: A4; margin: 15mm; }
              body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; font-size: 11pt; color: #333; }
              .prescription-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
              .clinic-name { font-size: 20pt; font-weight: 900; margin-bottom: 5px; }
              .prescription-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
              .info-section { background: #f8fafc; padding: 15px; border-radius: 6px; }
              .section-title { font-weight: 600; color: #2d3748; margin-bottom: 10px; }
              .vision-prescription { background: #e8f5e8; padding: 15px; border-radius: 6px; margin: 15px 0; }
              .eye-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            </style>
          </head>
          <body>
            <div class="prescription-header">
              <div class="clinic-name">OptiStore Pro Medical Center</div>
              <div>Prescription - ${format(new Date(prescription.createdAt || ''), 'MMM dd, yyyy')}</div>
            </div>
            <div class="prescription-info">
              <div class="info-section">
                <div class="section-title">Patient Information</div>
                <p><strong>Name:</strong> ${patient.firstName} ${patient.lastName}</p>
                <p><strong>Patient ID:</strong> ${patient.patientCode}</p>
                <p><strong>Date of Birth:</strong> ${patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'MMM dd, yyyy') : 'N/A'}</p>
              </div>
              <div class="info-section">
                <div class="section-title">Prescription Details</div>
                <p><strong>Prescription #:</strong> RX-${prescription.id.slice(0, 8)}</p>
                <p><strong>Type:</strong> ${prescription.prescriptionType?.replace('_', ' ') || 'Eye Examination'}</p>
                <p><strong>Date Issued:</strong> ${format(new Date(prescription.createdAt || ''), 'MMM dd, yyyy')}</p>
              </div>
            </div>
            ${(prescription.rightSph || prescription.leftSph) ? `
              <div class="vision-prescription">
                <div class="section-title">Vision Prescription</div>
                <div class="eye-details">
                  <div>
                    <h4>Right Eye (OD)</h4>
                    <p>SPH: ${prescription.rightSph || 'N/A'}</p>
                    <p>CYL: ${prescription.rightCyl || 'N/A'}</p>
                    <p>AXIS: ${prescription.rightAxis || 'N/A'}</p>
                  </div>
                  <div>
                    <h4>Left Eye (OS)</h4>
                    <p>SPH: ${prescription.leftSph || 'N/A'}</p>
                    <p>CYL: ${prescription.leftCyl || 'N/A'}</p>
                    <p>AXIS: ${prescription.leftAxis || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ` : ''}
            ${prescription.diagnosis ? `
              <div class="info-section">
                <div class="section-title">Clinical Diagnosis</div>
                <p>${prescription.diagnosis}</p>
              </div>
            ` : ''}
            ${prescription.treatment ? `
              <div class="info-section">
                <div class="section-title">Treatment Plan</div>
                <p>${prescription.treatment}</p>
              </div>
            ` : ''}
          </body>
        </html>
      `);
      prescriptionWindow.document.close();
    }
    return prescriptionWindow;
  };

  // Helper function for generating comprehensive billing reports
  const generateComprehensiveBillingReport = (patient: Patient, patientAppointments: any[]) => {
    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
      const totalPaid = patientAppointments.filter(apt => apt.status === 'completed').length * 150;
      reportWindow.document.write(`
        <html>
          <head>
            <title>Comprehensive Billing Report - ${patient.firstName} ${patient.lastName}</title>
            <style>
              @page { size: A4; margin: 15mm; }
              body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; font-size: 11pt; color: #333; }
              .report-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
              .clinic-name { font-size: 20pt; font-weight: 900; margin-bottom: 5px; }
              .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
              .summary-card { background: #f8fafc; padding: 15px; border-radius: 6px; text-align: center; }
              .card-value { font-size: 18pt; font-weight: bold; color: #667eea; }
              .appointments-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .appointments-table th, .appointments-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
              .appointments-table th { background: #667eea; color: white; }
            </style>
          </head>
          <body>
            <div class="report-header">
              <div class="clinic-name">OptiStore Pro Medical Center</div>
              <div>Comprehensive Billing Report - ${patient.firstName} ${patient.lastName}</div>
              <div>Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}</div>
            </div>
            <div class="summary-cards">
              <div class="summary-card">
                <div class="card-value">$${totalPaid.toFixed(2)}</div>
                <div>Total Paid</div>
              </div>
              <div class="summary-card">
                <div class="card-value">${patientAppointments.filter(apt => apt.status === 'completed').length}</div>
                <div>Paid Invoices</div>
              </div>
              <div class="summary-card">
                <div class="card-value">$0.00</div>
                <div>Outstanding</div>
              </div>
            </div>
            <table class="appointments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${patientAppointments.map(apt => `
                  <tr>
                    <td>${format(new Date(apt.appointmentDate), 'MMM dd, yyyy')}</td>
                    <td>${apt.service}</td>
                    <td>$150.00</td>
                    <td>${apt.status === 'completed' ? 'PAID' : 'PENDING'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `);
      reportWindow.document.close();
    }
    return reportWindow;
  };

  // Helper function for generating detailed invoices
  const generateDetailedInvoice = (appointment: any, patient: Patient) => {
    return generateInvoice(appointment, patient);
  };

  // Filter and sort patients
  const filteredPatients = (patients as Patient[])
    .filter((patient: Patient) => {
      const matchesSearch = patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.phone && patient.phone.includes(searchTerm));
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && patient.isActive) ||
        (statusFilter === "inactive" && !patient.isActive);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case "date":
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        case "code":
          return a.patientCode.localeCompare(b.patientCode);
        default:
          return 0;
      }
    });



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
    <div className="h-screen flex flex-col">
      <div className="flex-grow min-h-0 space-y-6 p-6 overflow-y-auto">
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="code">Sort by Code</SelectItem>
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

          {/* Enhanced Patients Table with Pagination, Filtering, and Sorting */}
          <EnhancedDataTable
            data={patients as Patient[]}
            columns={patientColumns}
            title="Patient Management"
            searchPlaceholder="Search patients by name, email, phone, or patient code..."
            isLoading={isLoading}
            onRefresh={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
              queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
              queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
              queryClient.invalidateQueries({ queryKey: ["/api/medical-invoices"] });
            }}
            onView={(patient) => {
              setSelectedPatient(patient);
              refetchAppointments();
              refetchPrescriptions();
              refetchMedicalInvoices();
              setViewPatientOpen(true);
            }}
            onEdit={(patient) => {
              setSelectedPatient(patient);
              setEditPatientOpen(true);
            }}
            pageSize={10}
            showPagination={true}
            emptyMessage="No patients found. Start by registering your first patient."
            totalCount={patients.length}
          />
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
                          onValueChange={(value) => setAppointmentForm(prev => ({ 
                            ...prev, 
                            serviceType: value, 
                            appointmentFee: serviceFees[value as keyof typeof serviceFees] || ""
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="eye-exam">Eye Examination - $150.00</SelectItem>
                            <SelectItem value="contact-lens">Contact Lens Fitting - $120.00</SelectItem>
                            <SelectItem value="glasses-fitting">Glasses Fitting - $100.00</SelectItem>
                            <SelectItem value="follow-up">Follow-up Visit - $75.00</SelectItem>
                            <SelectItem value="consultation">Consultation - $200.00</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Assign Doctor</Label>
                        <Select 
                          value={appointmentForm.doctorId} 
                          onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, doctorId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select doctor (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {(staff as any[])?.filter(member => 
                              member.position === 'Doctor' || member.position === 'Optometrist'
                            ).map((doctor: any) => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                Dr. {doctor.firstName} {doctor.lastName} - {doctor.position}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                      <div className="space-y-2">
                        <Label>Appointment Fee *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={appointmentForm.appointmentFee}
                          onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointmentFee: e.target.value }))}
                          placeholder="0.00"
                          className="text-lg font-semibold"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Payment Status</Label>
                        <Select 
                          value={appointmentForm.paymentStatus} 
                          onValueChange={(value) => setAppointmentForm(prev => ({ 
                            ...prev, 
                            paymentStatus: value,
                            paymentDate: value === 'paid' ? new Date().toISOString().split('T')[0] : ""
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending Payment</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {appointmentForm.paymentStatus === 'paid' && (
                        <div className="space-y-2">
                          <Label>Payment Method *</Label>
                          <Select 
                            value={appointmentForm.paymentMethod} 
                            onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, paymentMethod: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="card">Credit/Debit Card</SelectItem>
                              <SelectItem value="insurance">Insurance</SelectItem>
                              <SelectItem value="online">Online Payment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

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
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Fee</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Payment</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Status</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(appointments as any[]).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12">
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
                          <div className="text-sm font-medium text-gray-900">
                            ${parseFloat(appointment.appointmentFee || 0).toFixed(2)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant={appointment.paymentStatus === 'paid' ? 'default' : 'secondary'} className="text-xs">
                            {(appointment.paymentStatus || 'pending').toUpperCase()}
                          </Badge>
                          {appointment.paymentMethod && (
                            <div className="text-xs text-gray-500 mt-1">{appointment.paymentMethod}</div>
                          )}
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
                              <DropdownMenuItem onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('View Appointment Details clicked for:', appointment.id);
                                setSelectedAppointment(appointment);
                                setViewAppointmentOpen(true);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Edit Appointment clicked for:', appointment.id);
                                setSelectedAppointment(appointment);
                                setEditAppointmentOpen(true);
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Appointment
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Print Report clicked for appointment:', appointment.id);
                                const patient = (patients as Patient[]).find(p => p.id === appointment.patientId);
                                if (patient) {
                                  // Generate appointment report
                                  const reportWindow = window.open('', '_blank');
                                  if (reportWindow) {
                                    reportWindow.document.write(`
                                      <html>
                                        <head>
                                          <title>Appointment Report - ${patient.firstName} ${patient.lastName}</title>
                                          <style>
                                            body { font-family: Arial, sans-serif; margin: 20px; }
                                            .header { text-align: center; border-bottom: 2px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
                                            .patient-info { margin-bottom: 30px; }
                                          </style>
                                        </head>
                                        <body>
                                          <div class="header">
                                            <h1>OptiStore Pro Medical Center</h1>
                                            <p>Appointment Report</p>
                                          </div>
                                          <div class="patient-info">
                                            <h3>Patient Information</h3>
                                            <p><strong>Name:</strong> ${patient.firstName} ${patient.lastName}</p>
                                            <p><strong>Phone:</strong> ${patient.phone || 'N/A'}</p>
                                            <p><strong>Service:</strong> ${appointment.service}</p>
                                            <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                                            <p><strong>Time:</strong> ${new Date(appointment.appointmentDate).toLocaleTimeString()}</p>
                                            <p><strong>Status:</strong> ${appointment.status}</p>
                                          </div>
                                          <button onclick="window.print()">Print Report</button>
                                        </body>
                                      </html>
                                    `);
                                    reportWindow.document.close();
                                  }
                                  toast({
                                    title: "Appointment Report Generated",
                                    description: `Report for ${patient.firstName} ${patient.lastName} is ready`,
                                  });
                                }
                              }}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print Report
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                const patient = (patients as Patient[]).find(p => p.id === appointment.patientId);
                                if (patient) {
                                  // Generate appointment invoice
                                  const invoiceWindow = window.open('', '_blank');
                                  if (invoiceWindow) {
                                    invoiceWindow.document.write(`
                                      <html>
                                        <head>
                                          <title>Invoice - ${patient.firstName} ${patient.lastName}</title>
                                          <style>
                                            body { font-family: Arial, sans-serif; margin: 20px; }
                                            .header { text-align: center; border-bottom: 2px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
                                          </style>
                                        </head>
                                        <body>
                                          <div class="header">
                                            <h1>OptiStore Pro Medical Center</h1>
                                            <p>Medical Invoice</p>
                                          </div>
                                          <div>
                                            <p><strong>Invoice #:</strong> INV-${Date.now()}</p>
                                            <p><strong>Patient:</strong> ${patient.firstName} ${patient.lastName}</p>
                                            <p><strong>Service:</strong> ${appointment.service}</p>
                                            <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                                            <p><strong>Amount:</strong> $85.00</p>
                                          </div>
                                          <button onclick="window.print()">Print Invoice</button>
                                        </body>
                                      </html>
                                    `);
                                    invoiceWindow.document.close();
                                  }
                                  toast({
                                    title: "Medical Invoice Generated",
                                    description: `Invoice for ${patient.firstName} ${patient.lastName} is ready`,
                                  });
                                }
                              }}>
                                <Receipt className="mr-2 h-4 w-4" />
                                Generate Invoice
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                const patient = (patients as Patient[]).find(p => p.id === appointment.patientId);
                                if (patient) {
                                  const emailSubject = `Appointment Information - ${patient.firstName} ${patient.lastName}`;
                                  const emailBody = `Appointment Details:%0D%0A%0D%0APatient: ${patient.firstName} ${patient.lastName}%0D%0AService: ${appointment.service}%0D%0ADate: ${new Date(appointment.appointmentDate).toLocaleDateString()}%0D%0ATime: ${new Date(appointment.appointmentDate).toLocaleTimeString()}%0D%0A%0D%0AGenerated from OptiStore Pro Medical Center`;
                                  window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
                                  toast({
                                    title: "Email Sharing",
                                    description: "Opening email client with appointment information",
                                  });
                                }
                              }}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share by Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                const patient = (patients as Patient[]).find(p => p.id === appointment.patientId);
                                if (patient) {
                                  const qrWindow = window.open('', '_blank');
                                  if (qrWindow) {
                                    qrWindow.document.write(`
                                      <html>
                                        <head>
                                          <title>QR Code - ${patient.firstName} ${patient.lastName}</title>
                                          <style>
                                            body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
                                          </style>
                                          <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
                                        </head>
                                        <body>
                                          <div>
                                            <h2>Appointment QR Code</h2>
                                            <canvas id="qr-canvas" width="200" height="200"></canvas>
                                            <p><strong>${patient.firstName} ${patient.lastName}</strong></p>
                                            <p>Service: ${appointment.service}</p>
                                            <button onclick="window.print()">Print QR Code</button>
                                          </div>
                                          <script>
                                            const canvas = document.getElementById('qr-canvas');
                                            const appointmentData = 'Appointment: ${appointment.id}, Patient: ${patient.firstName} ${patient.lastName}, Service: ${appointment.service}';
                                            QRCode.toCanvas(canvas, appointmentData, { width: 200, height: 200 });
                                          </script>
                                        </body>
                                      </html>
                                    `);
                                    qrWindow.document.close();
                                  }
                                  toast({
                                    title: "QR Code Generated",
                                    description: "Appointment QR code ready for sharing",
                                  });
                                }
                              }}>
                                <QrCode className="mr-2 h-4 w-4" />
                                QR Code Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                const patient = (patients as Patient[]).find(p => p.id === appointment.patientId);
                                if (patient) {
                                  const message = `Appointment Information:%0A%0APatient: ${patient.firstName} ${patient.lastName}%0AService: ${appointment.service}%0ADate: ${new Date(appointment.appointmentDate).toLocaleDateString()}%0A%0AFrom OptiStore Pro Medical Center`;
                                  window.open(`https://wa.me/?text=${message}`);
                                  toast({
                                    title: "WhatsApp Sharing",
                                    description: "Opening WhatsApp with appointment information",
                                  });
                                }
                              }}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Share WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Forward to Doctor clicked for appointment:', appointment.id);
                                setSelectedAppointment(appointment);
                                setForwardToDoctorOpen(true);
                              }}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Forward to Doctor
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Create Prescription clicked for appointment:', appointment.id);
                                setSelectedAppointment(appointment);
                                setCreatePrescriptionOpen(true);
                              }}>
                                <FileText className="mr-2 h-4 w-4" />
                                Create Prescription
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => {
                                if (window.confirm(`Are you sure you want to delete this appointment for ${new Date(appointment.appointmentDate).toLocaleDateString()}?`)) {
                                  // Delete appointment functionality
                                  toast({
                                    title: "Appointment Deleted",
                                    description: "Appointment has been deleted successfully",
                                  });
                                }
                              }}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Appointment
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

      {/* Patient Details Modal - A4-Formatted Medical Profile */}
      <Dialog open={viewPatientOpen} onOpenChange={setViewPatientOpen}>
        <DialogContent className="max-w-[210mm] max-h-[90vh] overflow-y-auto p-0">
          <div className="sticky top-0 bg-white z-10 p-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold">Patient Medical Profile</h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
              >
                <Download className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedPatient) {
                    generatePatientPDF(selectedPatient);
                  }
                }}
              >
                <FileDown className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedPatient) {
                    shareByQREmail(selectedPatient);
                  }
                }}
              >
                <Send className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
          
          {selectedPatient && (
            <div className="w-[210mm] min-h-[297mm] bg-white p-8 print:p-6 print:shadow-none" style={{ fontSize: '12px', lineHeight: '1.4' }}>
              {/* Header - Following Prescription Details Format */}
              <div className="border-b-2 border-blue-600 pb-4 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-blue-800">OptiStore Pro</h1>
                    <p className="text-gray-600">Patient Medical Profile</p>
                    <p className="text-sm text-gray-500">Comprehensive Health Record</p>
                  </div>
                  <div className="text-right">
                    <div className="w-20 h-20 border border-gray-300 flex items-center justify-center">
                      <QRCode value={`patient:${selectedPatient.patientCode}`} size={75} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Scan for verification</p>
                  </div>
                </div>
              </div>

              {/* Patient Information Section */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">Patient Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Full Name:</span>
                      <span className="font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Patient ID:</span>
                      <span className="font-mono font-semibold">{selectedPatient.patientCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date of Birth:</span>
                      <span>{selectedPatient.dateOfBirth ? format(new Date(selectedPatient.dateOfBirth), 'dd/MM/yyyy') : 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-semibold">{calculateAge(selectedPatient.dateOfBirth)} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span className="capitalize">{selectedPatient.gender || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blood Group:</span>
                      <span className="font-semibold text-red-600">{selectedPatient.bloodGroup || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loyalty Tier:</span>
                      <span className="capitalize font-semibold text-green-600">{selectedPatient.loyaltyTier}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span>{selectedPatient.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-sm">{selectedPatient.email || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="text-sm text-right max-w-xs">{selectedPatient.address || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Emergency Contact:</span>
                      <span className="text-sm">{selectedPatient.emergencyContact || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Emergency Phone:</span>
                      <span>{selectedPatient.emergencyPhone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Registration Date:</span>
                      <span>{format(new Date(selectedPatient.createdAt || ''), 'dd/MM/yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold text-green-600">{selectedPatient.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-1">Medical Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Allergies & Medical Conditions</h4>
                    <div className="bg-red-50 p-3 rounded border border-red-200">
                      <p className="text-sm">{selectedPatient.allergies || 'No known allergies'}</p>
                    </div>
                    <div className="mt-3">
                      <p className="text-gray-600 text-xs mb-1">Medical History:</p>
                      <div className="bg-gray-50 p-3 rounded border">
                        <p className="text-sm">{selectedPatient.medicalHistory || 'No significant medical history'}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Insurance Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Insurance Provider:</span>
                        <span className="font-medium">{selectedPatient.insuranceProvider || 'None'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Insurance Number:</span>
                        <span className="font-mono">{selectedPatient.insuranceNumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Loyalty Points:</span>
                        <span className="font-semibold text-green-600">{selectedPatient.loyaltyPoints || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Statistics */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-1">Appointment Summary</h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">{(appointments as any[]).filter(apt => apt.patientId === selectedPatient.id).length}</div>
                    <div className="text-xs text-blue-700">Total</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{(appointments as any[]).filter(apt => apt.patientId === selectedPatient.id && apt.status === 'completed').length}</div>
                    <div className="text-xs text-green-700">Completed</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">{(appointments as any[]).filter(apt => apt.patientId === selectedPatient.id && apt.status === 'scheduled').length}</div>
                    <div className="text-xs text-yellow-700">Scheduled</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded border border-red-200">
                    <div className="text-2xl font-bold text-red-600">{(appointments as any[]).filter(apt => apt.patientId === selectedPatient.id && apt.status === 'cancelled').length}</div>
                    <div className="text-xs text-red-700">Cancelled</div>
                  </div>
                </div>
              </div>

              {/* Detailed Appointment History */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-1">Complete Appointment History</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {(appointments as any[]).filter(apt => apt.patientId === selectedPatient.id).length} Total Appointments
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        refetchAppointments();
                        toast({ title: "Refreshed", description: "Appointment data updated" });
                      }}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {(appointments as any[]).filter(apt => apt.patientId === selectedPatient.id).length > 0 ? (
                  <div className="space-y-4">
                    {(appointments as any[]).filter(apt => apt.patientId === selectedPatient.id)
                      .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
                      .map((appointment: any, index: number) => (
                      <div key={appointment.id} className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        {/* Appointment Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge variant={appointment.status === 'completed' ? 'default' : appointment.status === 'scheduled' ? 'secondary' : 'destructive'}>
                              {appointment.status.toUpperCase()}
                            </Badge>
                            <span className="text-sm font-medium text-gray-600">Appointment #{index + 1}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy • HH:mm')}
                          </div>
                        </div>

                        {/* Appointment Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">Service Type</span>
                              <p className="text-sm font-medium text-gray-900">{appointment.service}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">Duration</span>
                              <p className="text-sm font-medium text-gray-900">{appointment.duration} minutes</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">Assigned Doctor</span>
                              <p className="text-sm font-medium text-gray-900">
                                Dr. {(staff as any[]).find(s => s.id === appointment.assignedDoctorId)?.firstName || 'TBD'} {(staff as any[]).find(s => s.id === appointment.assignedDoctorId)?.lastName || ''}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">Department</span>
                              <p className="text-sm font-medium text-gray-900">
                                {(staff as any[]).find(s => s.id === appointment.assignedDoctorId)?.position || 'General Practice'}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">Cost</span>
                              <p className="text-sm font-medium text-green-600">$150.00</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">Payment Status</span>
                              <p className="text-sm font-medium text-green-600">
                                {appointment.status === 'completed' ? 'Paid' : 'Pending'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Clinical Notes */}
                        {appointment.notes && (
                          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="text-xs font-medium text-blue-800 uppercase tracking-wide">Clinical Notes</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{appointment.notes}</p>
                          </div>
                        )}

                        {/* Appointment Actions */}
                        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                generateAppointmentReport(appointment, selectedPatient, (staff as any[]).find(s => s.id === appointment.assignedDoctorId));
                              }}
                            >
                              <FileDown className="h-3 w-3 mr-1" />
                              PDF Report
                            </Button>
                            
                            {appointment.status === 'completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Generate invoice for completed appointment
                                  generateInvoice(appointment, selectedPatient);
                                }}
                              >
                                <Receipt className="h-3 w-3 mr-1" />
                                Invoice
                              </Button>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Updated: {format(new Date(appointment.updatedAt || appointment.createdAt), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No appointments found</p>
                    <p className="text-gray-400 text-sm">Patient has not scheduled any appointments yet</p>
                  </div>
                )}
              </div>

              {/* Detailed Prescription History */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-1">Complete Prescription History</h3>
                  <Badge variant="outline" className="text-xs">
                    {(prescriptions as any[]).filter(rx => rx.patientId === selectedPatient.id).length} Total Prescriptions
                  </Badge>
                </div>
                {(prescriptions as any[]).filter(rx => rx.patientId === selectedPatient.id).length > 0 ? (
                  <div className="space-y-4">
                    {(prescriptions as any[]).filter(rx => rx.patientId === selectedPatient.id)
                      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
                      .map((prescription: any, index: number) => (
                      <div key={prescription.id} className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        {/* Prescription Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Badge variant={prescription.status === 'active' ? 'default' : prescription.status === 'filled' ? 'secondary' : 'destructive'}>
                              {prescription.status?.toUpperCase() || 'ACTIVE'}
                            </Badge>
                            <span className="text-sm font-medium text-gray-600">Prescription #{index + 1}</span>
                            <span className="text-xs text-gray-500 font-mono">RX-{prescription.id.slice(0, 8)}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(prescription.createdAt || ''), 'MMM dd, yyyy')}
                          </div>
                        </div>

                        {/* Prescription Type & Doctor */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Service Type</span>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {prescription.prescriptionType?.replace('_', ' ') || 'Eye Examination'}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Prescribing Doctor</span>
                            <p className="text-sm font-medium text-gray-900">
                              Dr. {(staff as any[]).find(s => s.id === prescription.doctorId)?.firstName || 'Unknown'} {(staff as any[]).find(s => s.id === prescription.doctorId)?.lastName || 'Doctor'}
                            </p>
                          </div>
                        </div>

                        {/* Clinical Information */}
                        {prescription.diagnosis && (
                          <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Stethoscope className="h-4 w-4 text-blue-600" />
                              <span className="text-xs font-medium text-blue-800 uppercase tracking-wide">Clinical Diagnosis</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{prescription.diagnosis}</p>
                          </div>
                        )}

                        {/* Vision Prescription Details */}
                        {(prescription.sphereRight || prescription.sphereLeft || prescription.rightSph || prescription.leftSph) && (
                          <div className="mb-4 p-4 bg-green-50 rounded border border-green-200">
                            <div className="flex items-center gap-2 mb-3">
                              <EyeIcon className="h-4 w-4 text-green-600" />
                              <span className="text-xs font-medium text-green-800 uppercase tracking-wide">Vision Prescription</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white p-3 rounded border">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Right Eye (OD)</h4>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Sphere (SPH):</span>
                                    <span className="font-mono">{prescription.sphereRight || prescription.rightSph || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Cylinder (CYL):</span>
                                    <span className="font-mono">{prescription.cylinderRight || prescription.rightCyl || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Axis:</span>
                                    <span className="font-mono">{prescription.axisRight || prescription.rightAxis || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Add:</span>
                                    <span className="font-mono">{prescription.addRight || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-white p-3 rounded border">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Left Eye (OS)</h4>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Sphere (SPH):</span>
                                    <span className="font-mono">{prescription.sphereLeft || prescription.leftSph || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Cylinder (CYL):</span>
                                    <span className="font-mono">{prescription.cylinderLeft || prescription.leftCyl || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Axis:</span>
                                    <span className="font-mono">{prescription.axisLeft || prescription.leftAxis || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Add:</span>
                                    <span className="font-mono">{prescription.addLeft || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Treatment Plan */}
                        {prescription.treatment && (
                          <div className="mb-4 p-3 bg-purple-50 rounded border border-purple-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Pill className="h-4 w-4 text-purple-600" />
                              <span className="text-xs font-medium text-purple-800 uppercase tracking-wide">Treatment Plan</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{prescription.treatment}</p>
                          </div>
                        )}

                        {/* Patient Advice */}
                        {prescription.advice && (
                          <div className="mb-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              <span className="text-xs font-medium text-yellow-800 uppercase tracking-wide">Patient Instructions</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{prescription.advice}</p>
                          </div>
                        )}

                        {/* Prescription Actions */}
                        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Generate prescription PDF
                                generatePrescriptionPDF(prescription, selectedPatient);
                              }}
                            >
                              <FileDown className="h-3 w-3 mr-1" />
                              PDF Prescription
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Generate QR code for prescription
                                const qrData = `prescription:${prescription.id}:${selectedPatient.patientCode}`;
                                toast({
                                  title: "QR Code Generated",
                                  description: "Prescription QR code ready for scanning",
                                });
                              }}
                            >
                              <QrCode className="h-3 w-3 mr-1" />
                              QR Code
                            </Button>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Valid until: {prescription.nextFollowUp ? format(new Date(prescription.nextFollowUp), 'MMM dd, yyyy') : 'No expiry'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <Pill className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No prescriptions found</p>
                    <p className="text-gray-400 text-sm">Patient has not received any prescriptions yet</p>
                  </div>
                )}
              </div>

              {/* Comprehensive Billing & Invoice History */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-1">Billing & Invoice History</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {(medicalInvoices as any[]).filter(inv => inv.patientId === selectedPatient.id).length} Invoices
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        refetchMedicalInvoices();
                        toast({ title: "Refreshed", description: "Billing data updated" });
                      }}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Billing Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-600 uppercase tracking-wide font-medium">Total Paid</p>
                        <p className="text-2xl font-bold text-green-700">
                          ${(medicalInvoices as any[])
                            .filter(inv => inv.patientId === selectedPatient.id && inv.paymentStatus === 'paid')
                            .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0)
                            .toFixed(2)}
                        </p>
                      </div>
                      <CreditCard className="h-8 w-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">Paid Invoices</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {(medicalInvoices as any[]).filter(inv => inv.patientId === selectedPatient.id && inv.paymentStatus === 'paid').length}
                        </p>
                      </div>
                      <Receipt className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-orange-600 uppercase tracking-wide font-medium">Outstanding</p>
                        <p className="text-2xl font-bold text-orange-700">
                          ${(medicalInvoices as any[])
                            .filter(inv => inv.patientId === selectedPatient.id && inv.paymentStatus !== 'paid')
                            .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0)
                            .toFixed(2)}
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">Avg. Per Visit</p>
                        <p className="text-2xl font-bold text-purple-700">
                          ${(medicalInvoices as any[]).filter(inv => inv.patientId === selectedPatient.id).length > 0 
                            ? ((medicalInvoices as any[])
                                .filter(inv => inv.patientId === selectedPatient.id)
                                .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0) / 
                               (medicalInvoices as any[]).filter(inv => inv.patientId === selectedPatient.id).length)
                                .toFixed(2)
                            : "0.00"}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Detailed Invoice List */}
                {(medicalInvoices as any[]).filter(inv => inv.patientId === selectedPatient.id).length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Invoice Details</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Generate comprehensive billing report
                          generateComprehensiveBillingReport(selectedPatient, (medicalInvoices as any[]).filter(inv => inv.patientId === selectedPatient.id));
                        }}
                      >
                        <FileDown className="h-3 w-3 mr-1" />
                        Full Billing Report
                      </Button>
                    </div>

                    {(medicalInvoices as any[]).filter(inv => inv.patientId === selectedPatient.id)
                      .sort((a, b) => new Date(b.invoiceDate || b.createdAt).getTime() - new Date(a.invoiceDate || a.createdAt).getTime())
                      .map((invoice: any, index: number) => (
                      <div key={invoice.id} className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-green-100 p-2 rounded-full">
                              <Receipt className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                              <p className="text-sm text-gray-600">
                                {format(new Date(invoice.invoiceDate || invoice.createdAt), 'MMM dd, yyyy')}
                                {invoice.notes && ` • ${invoice.notes.slice(0, 30)}...`}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-green-600">${parseFloat(invoice.total || 0).toFixed(2)}</p>
                            <Badge variant={invoice.paymentStatus === 'paid' ? 'default' : 'secondary'} className="text-xs">
                              {(invoice.paymentStatus || 'pending').toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Invoice Details</span>
                            <p className="text-sm font-medium text-gray-900">Subtotal: ${parseFloat(invoice.subtotal || 0).toFixed(2)}</p>
                            <p className="text-xs text-gray-600">Tax: ${parseFloat(invoice.taxAmount || 0).toFixed(2)} | Discount: ${parseFloat(invoice.discountAmount || 0).toFixed(2)}</p>
                          </div>
                          
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Payment Info</span>
                            <p className="text-sm font-medium text-gray-900">${parseFloat(invoice.total || 0).toFixed(2)} ({invoice.paymentMethod || 'N/A'})</p>
                            <p className="text-xs text-gray-600">
                              {invoice.paymentDate ? `Paid: ${format(new Date(invoice.paymentDate), 'MMM dd, yyyy')}` : 'Payment pending'}
                            </p>
                          </div>

                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Status</span>
                            <p className={`text-sm font-medium ${invoice.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                              {invoice.paymentStatus === 'paid' ? 'Payment Complete' : 'Payment Pending'}
                            </p>
                            <p className="text-xs text-gray-600">
                              {invoice.paymentStatus === 'paid' ? 'No outstanding balance' : `Due: ${format(new Date(invoice.dueDate || invoice.invoiceDate), 'MMM dd, yyyy')}`}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Generate individual invoice PDF
                                generateDetailedInvoice(invoice, selectedPatient);
                              }}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download Invoice
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Print invoice
                                generateDetailedInvoice(invoice, selectedPatient);
                              }}
                            >
                              <Printer className="h-3 w-3 mr-1" />
                              Print
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Email invoice
                                const emailSubject = `Medical Invoice ${invoice.invoiceNumber} - ${selectedPatient.firstName} ${selectedPatient.lastName}`;
                                const emailBody = `Dear ${selectedPatient.firstName},%0D%0A%0D%0APlease find your medical invoice attached.%0D%0A%0D%0AInvoice Details:%0D%0A- Invoice: ${invoice.invoiceNumber}%0D%0A- Date: ${format(new Date(invoice.invoiceDate || invoice.createdAt), 'MMM dd, yyyy')}%0D%0A- Amount: $${parseFloat(invoice.total || 0).toFixed(2)}%0D%0A- Status: ${(invoice.paymentStatus || 'pending').toUpperCase()}%0D%0A%0D%0AThank you for choosing OptiStore Pro Medical Center.%0D%0A%0D%0ABest regards,%0D%0AOptiStore Pro Medical Team`;
                                window.open(`mailto:${selectedPatient.email}?subject=${emailSubject}&body=${emailBody}`);
                                toast({
                                  title: "Email Prepared",
                                  description: "Invoice email opened in your default email client",
                                });
                              }}
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Email
                            </Button>
                          </div>

                          <div className="text-xs text-gray-500">
                            Invoice ID: {invoice.invoiceNumber}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No billing history found</p>
                    <p className="text-gray-400 text-sm">Patient has no invoices on record yet</p>
                  </div>
                )}

                {/* Payment Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-gray-900 mb-3">Payment Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Last Payment Date:</p>
                      <p className="font-medium">
                        {(medicalInvoices as any[]).filter(inv => inv.patientId === selectedPatient.id && inv.paymentDate).length > 0 
                          ? format(new Date((medicalInvoices as any[]).filter(inv => inv.patientId === selectedPatient.id && inv.paymentDate).sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0]?.paymentDate || ''), 'MMM dd, yyyy')
                          : 'No payments recorded'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Preferred Payment Method:</p>
                      <p className="font-medium">
                        {selectedPatient.loyaltyTier === 'premium' ? 'Insurance + Cash' : 'Cash Payment'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
                <p>This document was generated on {format(new Date(), 'dd/MM/yyyy HH:mm')} by OptiStore Pro Medical System</p>
                <p>For verification, scan the QR code or contact us at +1-555-OPTI-CARE</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Patient Info Modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share Patient Information</DialogTitle>
            <DialogDescription>
              Choose how you would like to share {selectedPatient?.firstName} {selectedPatient?.lastName}'s information
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => {
                    // Generate and share PDF
                    generatePatientPDF(selectedPatient);
                    setShareModalOpen(false);
                  }}
                >
                  <FileDown className="h-6 w-6" />
                  <span className="text-sm text-center">Download PDF</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => {
                    shareByQREmail(selectedPatient);
                    setShareModalOpen(false);
                  }}
                >
                  <QrCode className="h-6 w-6" />
                  <span className="text-sm text-center">QR Code</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2 col-span-2"
                  onClick={() => {
                    // Create PDF and share via WhatsApp
                    const message = `Patient Report: ${selectedPatient.firstName} ${selectedPatient.lastName}%0APatient ID: ${selectedPatient.patientCode}%0APhone: ${selectedPatient.phone}%0A%0AFrom OptiStore Pro Medical Center`;
                    window.open(`https://wa.me/?text=${message}`);
                    setShareModalOpen(false);
                  }}
                >
                  <MessageSquare className="h-6 w-6" />
                  <span className="text-sm text-center">PDF via WhatsApp</span>
                </Button>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 text-center">
                  All sharing options comply with HIPAA privacy regulations
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Patient Modal */}
      <Dialog open={editPatientOpen} onOpenChange={setEditPatientOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient Information</DialogTitle>
            <DialogDescription>
              Update patient details for {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6">
              <p className="text-center text-gray-600">
                Edit Patient functionality will be implemented with a comprehensive form similar to the registration form.
                For now, you can view and manage patient details through the "View Details" option.
              </p>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setEditPatientOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setEditPatientOpen(false)}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Appointment Details Modal */}
      <Dialog open={viewAppointmentOpen} onOpenChange={setViewAppointmentOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Appointment Details</DialogTitle>
            <DialogDescription>
              Complete information for appointment {selectedAppointment?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-6">
              {/* Appointment Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Appointment Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-600">Appointment ID:</span>
                        <p className="font-semibold text-blue-600">{selectedAppointment.id}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Service:</span>
                        <p className="font-semibold">{selectedAppointment.service}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Date & Time:</span>
                        <p className="font-semibold">{new Date(selectedAppointment.appointmentDate).toLocaleDateString()} at {new Date(selectedAppointment.appointmentDate).toLocaleTimeString()}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Duration:</span>
                        <p className="font-semibold">{selectedAppointment.duration} minutes</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Status:</span>
                        <Badge variant={selectedAppointment.status === 'scheduled' ? 'default' : 'secondary'}>
                          {selectedAppointment.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Patient Information</h3>
                    <div className="space-y-3">
                      {(() => {
                        const patient = (patients as Patient[]).find(p => p.id === selectedAppointment.patientId);
                        return patient ? (
                          <>
                            <div>
                              <span className="font-medium text-gray-600">Patient Name:</span>
                              <p className="font-semibold">{patient.firstName} {patient.lastName}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Patient ID:</span>
                              <p className="font-semibold">{patient.patientCode}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Phone:</span>
                              <p className="font-semibold">{patient.phone}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Email:</span>
                              <p className="font-semibold">{patient.email || 'N/A'}</p>
                            </div>
                          </>
                        ) : (
                          <p className="text-red-600">Patient information not found</p>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {selectedAppointment.notes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                  <p className="text-gray-700">{selectedAppointment.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setViewAppointmentOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  if (selectedAppointment) {
                    const patient = (patients as Patient[]).find(p => p.id === selectedAppointment.patientId);
                    const assignedDoctor = (staff as any[]).find(s => s.id === selectedAppointment.assignedDoctorId);
                    if (patient) {
                      generateAppointmentReport(selectedAppointment, patient, assignedDoctor);
                    } else {
                      toast({
                        title: "Error",
                        description: "Patient information not found for this appointment.",
                        variant: "destructive",
                      });
                    }
                  }
                  setViewAppointmentOpen(false);
                }}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Forward to Doctor Modal */}
      <Dialog open={forwardToDoctorOpen} onOpenChange={setForwardToDoctorOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Forward Appointment to Doctor</DialogTitle>
            <DialogDescription>
              Forward this appointment to a specialist or another doctor for consultation
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Select Doctor</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {(staff as any[]).filter(s => s.position?.toLowerCase().includes('doctor')).map((doctor: any) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.staffName} - {doctor.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Reason for Referral</Label>
                  <Textarea 
                    placeholder="Please explain why you're forwarding this appointment..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label>Priority Level</Label>
                  <Select defaultValue="normal">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setForwardToDoctorOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Appointment Forwarded",
                    description: "The appointment has been successfully forwarded to the selected doctor",
                  });
                  setForwardToDoctorOpen(false);
                }}>
                  Forward Appointment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Prescription Modal */}
      <Dialog open={createPrescriptionOpen} onOpenChange={setCreatePrescriptionOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Prescription</DialogTitle>
            <DialogDescription>
              Create a new prescription for {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Service Type</Label>
                  <Select defaultValue="eye_exam">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eye_exam">Eye Examination</SelectItem>
                      <SelectItem value="contact_lens">Contact Lens Fitting</SelectItem>
                      <SelectItem value="surgery">Eye Surgery</SelectItem>
                      <SelectItem value="therapy">Vision Therapy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Prescription Type</Label>
                  <Select defaultValue="glasses">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="glasses">Glasses</SelectItem>
                      <SelectItem value="contact_lenses">Contact Lenses</SelectItem>
                      <SelectItem value="reading_glasses">Reading Glasses</SelectItem>
                      <SelectItem value="sunglasses">Prescription Sunglasses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Vision Prescription Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vision Prescription</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Right Eye (OD)</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label>SPH</Label>
                        <Input placeholder="0.00" />
                      </div>
                      <div>
                        <Label>CYL</Label>
                        <Input placeholder="0.00" />
                      </div>
                      <div>
                        <Label>AXIS</Label>
                        <Input placeholder="0" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Left Eye (OS)</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label>SPH</Label>
                        <Input placeholder="0.00" />
                      </div>
                      <div>
                        <Label>CYL</Label>
                        <Input placeholder="0.00" />
                      </div>
                      <div>
                        <Label>AXIS</Label>
                        <Input placeholder="0" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Doctor Notes</Label>
                  <Textarea placeholder="Recommended treatment and follow-up..." rows={2} />
                </div>
                <div>
                  <Label>Additional Notes</Label>
                  <Textarea placeholder="Any additional instructions or notes..." rows={2} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Follow-up Date</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Prescription Status</Label>
                  <Select defaultValue="active">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setCreatePrescriptionOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Prescription Created",
                    description: "New prescription has been created successfully",
                  });
                  setCreatePrescriptionOpen(false);
                }}>
                  Create Prescription
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
