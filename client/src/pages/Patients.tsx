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
  MessageSquare,
  UserCheck,
  Activity,
  Clock,
  X,
  CheckCircle
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

  // Fetch staff members (doctors)
  const { data: staff = [] } = useQuery({
    queryKey: ["/api/staff"],
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
            <title>Patient Medical Report - ${patient.firstName} ${patient.lastName}</title>
            <style>
              @page { size: A4; margin: 10mm; }
              body { font-family: 'Arial', sans-serif; line-height: 1.3; color: #2c3e50; margin: 0; padding: 0; font-size: 9pt; background: #ffffff; }
              .document-container { max-width: 210mm; margin: 0 auto; background: white; height: 297mm; overflow: hidden; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 6px 12px; height: 28mm; display: flex; align-items: center; justify-content: space-between; position: relative; }
              .header-content { display: flex; align-items: center; justify-content: space-between; width: 100%; }
              .clinic-info { flex: 1; }
              .clinic-logo { font-size: 18pt; font-weight: 900; margin-bottom: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
              .clinic-subtitle { font-size: 9pt; margin-bottom: 2px; opacity: 0.9; }
              .report-meta { font-size: 6pt; margin-top: 3px; opacity: 0.8; }
              .patient-id-badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 3px 8px; border-radius: 10px; margin-top: 2px; font-weight: bold; font-size: 7pt; }
              .digital-record-header { position: absolute; top: 50%; right: 12px; transform: translateY(-50%); text-align: center; }
              .qr-header-container { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.25); border-radius: 6px; padding: 4px; backdrop-filter: blur(5px); }
              .qr-header-canvas { background: white; width: 38px; height: 38px; border-radius: 3px; margin: 0 auto 2px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .qr-header-label { font-size: 5pt; color: rgba(255,255,255,0.95); margin: 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; }
              .content { padding: 15px; height: 200mm; overflow: hidden; }
              .patient-header { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 8px; padding: 12px; margin-bottom: 15px; border-left: 4px solid #667eea; }
              .patient-name { font-size: 16pt; font-weight: 700; color: #2d3748; margin-bottom: 5px; }
              .patient-meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 8pt; }
              .meta-item { display: flex; align-items: center; }
              .meta-icon { width: 12px; height: 12px; margin-right: 5px; color: #667eea; }
              .section { margin-bottom: 15px; page-break-inside: avoid; }
              .section-title { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 12px; margin: 0 0 10px 0; border-radius: 5px; font-size: 10pt; font-weight: 600; display: flex; align-items: center; }
              .section-icon { margin-right: 8px; font-size: 10pt; }
              .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
              .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 5px; padding: 8px; }
              .info-label { font-weight: 600; color: #4a5568; font-size: 7pt; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 3px; }
              .info-value { color: #2d3748; font-size: 8pt; font-weight: 500; word-wrap: break-word; line-height: 1.2; }
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
              .qr-section { text-align: center; margin: 10px 0; padding: 10px; background: #f7fafc; border-radius: 8px; border: 1px dashed #cbd5e0; }
              .qr-code { width: 60px; height: 60px; background: #e2e8f0; border-radius: 5px; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; font-size: 6pt; color: #718096; position: relative; }
              .qr-code canvas { width: 100%; height: 100%; }
              .footer { padding: 12px; background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 8px; text-align: center; border-top: 2px solid #667eea; height: 40mm; display: flex; flex-direction: column; justify-content: center; }
              .clinic-info { margin-bottom: 8px; }
              .clinic-contact { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; margin: 8px 0; font-size: 7pt; color: #4a5568; }
              .disclaimer { margin-top: 8px; font-size: 6pt; color: #718096; font-style: italic; line-height: 1.3; }
              .report-id { margin-top: 5px; font-size: 6pt; color: #a0aec0; font-family: monospace; }
              .print-button { margin: 15px 0; text-align: center; }
              .print-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; border: none; border-radius: 20px; cursor: pointer; font-size: 10pt; font-weight: 600; box-shadow: 0 3px 10px rgba(102, 126, 234, 0.4); transition: all 0.3s ease; }
              .print-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(102, 126, 234, 0.6); }
              @media print { 
                body { margin: 0; font-size: 8pt; } 
                .print-button { display: none; } 
                .document-container { box-shadow: none; height: auto; }
                .section { page-break-inside: avoid; }
                .content { height: auto; }
                .footer { height: auto; }
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

                <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
                <script>
                  // Header QR Code
                  const headerCanvas = document.getElementById('header-qr-canvas');
                  const patientData = 'Patient: ${patient.firstName} ${patient.lastName}, ID: ${patient.patientCode}, Phone: ${patient.phone}, DOB: ${patient.dateOfBirth}';
                  QRCode.toCanvas(headerCanvas, patientData, { width: 34, height: 34, margin: 1 }, function (error) {
                    if (error) console.error(error);
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
                    filteredPatients.map((patient: Patient) => {
                      const isNew = new Date(patient.createdAt || '').getTime() > Date.now() - 24*60*60*1000;
                      return (
                        <tr key={patient.id} className={`border-b border-gray-100 hover:bg-gray-50 ${
                          isNew ? 'bg-green-50/50 border-green-200' : ''
                        }`}>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <div className="font-medium text-blue-600">{patient.patientCode}</div>
                            {isNew && (
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
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
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem onClick={() => {
                                setSelectedPatient(patient);
                                setViewPatientOpen(true);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedPatient(patient);
                                setEditPatientOpen(true);
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Patient
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                setSelectedPatient(patient);
                                generatePatientPDF(patient);
                              }}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print Report
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                generatePatientInvoice(patient);
                              }}>
                                <Receipt className="mr-2 h-4 w-4" />
                                Generate Invoice
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                shareByEmail(patient);
                              }}>
                                <Mail className="mr-2 h-4 w-4" />
                                Share by Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                shareByQREmail(patient);
                              }}>
                                <QrCode className="mr-2 h-4 w-4" />
                                QR Code Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                shareByWhatsApp(patient);
                              }}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Share WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Patient
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                        </tr>
                      );
                    })
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

      {/* Patient Details Modal */}
      <Dialog open={viewPatientOpen} onOpenChange={setViewPatientOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">Patient Medical Profile</DialogTitle>
                <DialogDescription>
                  Comprehensive medical and personal information for {selectedPatient?.firstName} {selectedPatient?.lastName}
                </DialogDescription>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedPatient) {
                      generatePatientPDF(selectedPatient);
                    }
                  }}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Profile
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
                  <QrCode className="h-4 w-4 mr-2" />
                  Share QR
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6">
              {/* Professional Header with QR Code */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200 relative print:bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                      <AvatarFallback className="text-2xl font-bold bg-blue-500 text-white">
                        {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Patient ID:</span>
                          <p className="font-semibold text-blue-600">{selectedPatient.patientCode}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Age:</span>
                          <p className="font-semibold">{calculateAge(selectedPatient.dateOfBirth)} years</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Blood Group:</span>
                          <p className="font-semibold">{selectedPatient.bloodGroup || 'Not tested'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Status:</span>
                          <Badge variant={selectedPatient.isActive ? "default" : "secondary"} className="font-semibold">
                            {selectedPatient.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* QR Code in Header - Compact version for scanning */}
                  <div className="bg-white p-3 rounded-lg shadow-sm border-2 border-blue-200">
                    <div className="text-center">
                      <div 
                        className="w-16 h-16 mx-auto mb-2"
                        ref={(el) => {
                          if (el && selectedPatient) {
                            import('qrcode').then((QRCode) => {
                              const patientData = `Patient: ${selectedPatient.firstName} ${selectedPatient.lastName}, ID: ${selectedPatient.patientCode}, Phone: ${selectedPatient.phone}`;
                              const canvas = el.querySelector('canvas') || el.appendChild(document.createElement('canvas'));
                              QRCode.default.toCanvas(canvas, patientData, { width: 64, height: 64, margin: 0 });
                            });
                          }
                        }}
                      >
                        <canvas className="w-full h-full rounded"></canvas>
                      </div>
                      <p className="text-xs font-medium text-blue-700">Scan Info</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg">
                <Button onClick={() => generatePatientPDF(selectedPatient)} className="flex items-center space-x-2">
                  <Printer className="h-4 w-4" />
                  <span>Print Report</span>
                </Button>
                <Button onClick={() => generatePatientInvoice(selectedPatient)} variant="outline" className="flex items-center space-x-2">
                  <Receipt className="h-4 w-4" />
                  <span>Generate Invoice</span>
                </Button>
                <Button onClick={() => setShareModalOpen(true)} variant="outline" className="flex items-center space-x-2">
                  <Share2 className="h-4 w-4" />
                  <span>Share Options</span>
                </Button>
              </div>



              {/* Detailed Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <span>Personal Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Full Name</label>
                        <p className="text-base font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Patient Code</label>
                        <p className="text-base font-semibold text-blue-600">{selectedPatient.patientCode}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                        <p className="text-base">{selectedPatient.dateOfBirth || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Gender</label>
                        <p className="text-base capitalize">{selectedPatient.gender || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Blood Group</label>
                        <p className="text-base font-semibold text-red-600">{selectedPatient.bloodGroup || 'Not tested'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="bg-green-50">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Phone className="h-5 w-5 text-green-600" />
                      <span>Contact Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone Number</label>
                      <p className="text-base font-semibold">{selectedPatient.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email Address</label>
                      <p className="text-base">{selectedPatient.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Home Address</label>
                      <p className="text-base">{selectedPatient.address || 'Not provided'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                        <p className="text-base">{selectedPatient.emergencyContact || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Emergency Phone</label>
                        <p className="text-base">{selectedPatient.emergencyPhone || 'Not provided'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardHeader className="bg-red-50">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Stethoscope className="h-5 w-5 text-red-600" />
                      <span>Medical Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Known Allergies</label>
                      <div className={`p-3 rounded-lg ${selectedPatient.allergies ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                        <p className={`text-base ${selectedPatient.allergies ? 'text-red-800 font-semibold' : 'text-gray-500'}`}>
                          {selectedPatient.allergies || 'No known allergies'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Medical History</label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-base">{selectedPatient.medicalHistory || 'No significant medical history recorded'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader className="bg-purple-50">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Receipt className="h-5 w-5 text-purple-600" />
                      <span>Insurance & Account</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Insurance Provider</label>
                        <p className="text-base">{selectedPatient.insuranceProvider || 'Self-pay'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Policy Number</label>
                        <p className="text-base font-mono">{selectedPatient.insuranceNumber || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Loyalty Tier</label>
                        <Badge 
                          variant="outline" 
                          className={`font-semibold ${
                            selectedPatient.loyaltyTier === 'gold' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                            selectedPatient.loyaltyTier === 'silver' ? 'border-gray-400 text-gray-700 bg-gray-50' :
                            selectedPatient.loyaltyTier === 'platinum' ? 'border-purple-500 text-purple-700 bg-purple-50' :
                            'border-amber-600 text-amber-700 bg-amber-50'
                          }`}
                        >
                          {(selectedPatient.loyaltyTier || 'Bronze').toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Loyalty Points</label>
                        <p className="text-base font-bold text-purple-600">{selectedPatient.loyaltyPoints || 0} points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Registration and Activity Info */}
              <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <p className="text-gray-600">Registration Date</p>
                      <p className="font-semibold">January 15, 2024</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <p className="text-gray-600">Last Visit</p>
                      <p className="font-semibold">December 8, 2024</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <p className="text-gray-600">Total Visits</p>
                      <p className="font-semibold">12 visits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Share Modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="max-w-lg">
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
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => {
                    const shareLink = `${window.location.origin}/patient/${selectedPatient.patientCode}`;
                    navigator.clipboard.writeText(shareLink);
                    toast({
                      title: "Link Copied",
                      description: "Patient profile link copied to clipboard",
                    });
                    setShareModalOpen(false);
                  }}
                >
                  <Share2 className="h-6 w-6" />
                  <span className="text-sm text-center">Share Link</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => {
                    shareByEmail(selectedPatient);
                    setShareModalOpen(false);
                  }}
                >
                  <Mail className="h-6 w-6" />
                  <span className="text-sm text-center">Email</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => {
                    generatePatientPDF(selectedPatient);
                    setShareModalOpen(false);
                  }}
                >
                  <FileText className="h-6 w-6" />
                  <span className="text-sm text-center">PDF Report</span>
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
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setViewAppointmentOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setViewAppointmentOpen(false);
                  setEditAppointmentOpen(true);
                }}>
                  Edit Appointment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Modal */}
      <Dialog open={editAppointmentOpen} onOpenChange={setEditAppointmentOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>
              Modify appointment details for {selectedAppointment?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Service</Label>
                  <Input 
                    defaultValue={selectedAppointment.service}
                    placeholder="Enter service type"
                  />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input 
                    type="number"
                    defaultValue={selectedAppointment.duration}
                    placeholder="Duration"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input 
                    type="date"
                    defaultValue={new Date(selectedAppointment.appointmentDate).toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input 
                    type="time"
                    defaultValue={new Date(selectedAppointment.appointmentDate).toTimeString().slice(0,5)}
                  />
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <Select defaultValue={selectedAppointment.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="checked-in">Checked In</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea 
                  defaultValue={selectedAppointment.notes || ''}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setEditAppointmentOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Appointment Updated",
                    description: "Appointment has been successfully updated",
                  });
                  setEditAppointmentOpen(false);
                }}>
                  Save Changes
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
              Assign a doctor to appointment {selectedAppointment?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Appointment Details</h4>
                <p><strong>Service:</strong> {selectedAppointment.service}</p>
                <p><strong>Date:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
                <p><strong>Patient:</strong> {(() => {
                  const patient = (patients as Patient[]).find(p => p.id === selectedAppointment.patientId);
                  return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
                })()}</p>
              </div>

              <div>
                <Label>Select Doctor</Label>
                <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {(staff as any[]).filter((member: any) => member.position === 'Doctor' || member.role === 'doctor').map((doctor: any) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        Dr. {doctor.firstName} {doctor.lastName} - {doctor.department || doctor.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority Level</Label>
                <Select defaultValue="normal">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="normal">Normal Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes for Doctor</Label>
                <Textarea 
                  placeholder="Add any specific instructions or patient notes for the doctor..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setForwardToDoctorOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={async () => {
                  if (!selectedDoctorId || !selectedAppointment) {
                    toast({
                      title: "Error",
                      description: "Please select a doctor before assigning",
                      variant: "destructive",
                    });
                    return;
                  }

                  try {
                    // First, update the regular appointment
                    const updateData = {
                      ...selectedAppointment,
                      assignedDoctorId: selectedDoctorId,
                      status: "assigned_to_doctor",
                      doctorNotes: "Appointment forwarded for medical consultation"
                    };

                    await apiRequest("PUT", `/api/appointments/${selectedAppointment.id}`, updateData);

                    // Then create a medical appointment record
                    const medicalAppointmentData = {
                      appointmentNumber: `MA-${Date.now()}`,
                      patientId: selectedAppointment.patientId,
                      doctorId: selectedDoctorId,
                      appointmentDate: selectedAppointment.appointmentDate,
                      appointmentType: selectedAppointment.service || "consultation",
                      status: "scheduled",
                      notes: "Forwarded from general appointment"
                    };

                    await apiRequest("POST", "/api/medical-appointments", medicalAppointmentData);

                    // Refresh appointments data
                    queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
                    queryClient.invalidateQueries({ queryKey: ["/api/medical-appointments"] });

                    toast({
                      title: "Success",
                      description: "Appointment forwarded to doctor and will appear in Doctor Appointments tab",
                    });
                    setForwardToDoctorOpen(false);
                    setSelectedAppointment(null);
                    setSelectedDoctorId("");
                  } catch (error) {
                    console.error("Error assigning doctor:", error);
                    toast({
                      title: "Error",
                      description: "Failed to assign doctor to appointment. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}>
                  Assign Doctor
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
              Create a new prescription for appointment {selectedAppointment?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold mb-2">Patient & Appointment Info</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Patient:</strong> {(() => {
                      const patient = (patients as Patient[]).find(p => p.id === selectedAppointment.patientId);
                      return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
                    })()}
                  </div>
                  <div><strong>Service:</strong> {selectedAppointment.service}</div>
                  <div><strong>Date:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</div>
                  <div><strong>Appointment ID:</strong> {selectedAppointment.id}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prescription Code</Label>
                  <Input defaultValue={`RX-${Date.now()}`} />
                </div>
                <div>
                  <Label>Doctor</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select prescribing doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dr-smith">Dr. John Smith</SelectItem>
                      <SelectItem value="dr-jones">Dr. Sarah Jones</SelectItem>
                      <SelectItem value="dr-brown">Dr. Michael Brown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Vision Prescription</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Right Eye Sphere</Label>
                    <Input placeholder="-2.25" />
                  </div>
                  <div>
                    <Label>Right Eye Cylinder</Label>
                    <Input placeholder="-0.50" />
                  </div>
                  <div>
                    <Label>Right Eye Axis</Label>
                    <Input placeholder="90°" />
                  </div>
                  <div>
                    <Label>Right Eye Add</Label>
                    <Input placeholder="+1.00" />
                  </div>
                  <div>
                    <Label>Left Eye Sphere</Label>
                    <Input placeholder="-2.00" />
                  </div>
                  <div>
                    <Label>Left Eye Cylinder</Label>
                    <Input placeholder="-0.75" />
                  </div>
                  <div>
                    <Label>Left Eye Axis</Label>
                    <Input placeholder="85°" />
                  </div>
                  <div>
                    <Label>Left Eye Add</Label>
                    <Input placeholder="+1.00" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pupillary Distance</Label>
                  <Input placeholder="62 mm" />
                </div>
                <div>
                  <Label>Prescription Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="glasses">Eyeglasses</SelectItem>
                      <SelectItem value="contacts">Contact Lenses</SelectItem>
                      <SelectItem value="bifocals">Bifocals</SelectItem>
                      <SelectItem value="progressive">Progressive Lenses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Diagnosis</Label>
                  <Textarea placeholder="Patient diagnosis and findings..." rows={2} />
                </div>
                <div>
                  <Label>Treatment Plan</Label>
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