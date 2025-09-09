import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Calendar, Search, Edit, Trash2, Clock, MapPin, User, Phone, CheckCircle, XCircle, AlertCircle, MoreVertical, Eye, FileText, QrCode, Share2, Receipt, Printer, MessageSquare, UserCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertAppointmentSchema, type Appointment, type InsertAppointment, type Customer, type Store } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import EnhancedDataTable, { Column } from "@/components/EnhancedDataTable";

export default function Appointments() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState("week");
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const { data: patients = [] } = useQuery<any[]>({
    queryKey: ["/api/patients"],
  });

  const { data: stores = [] } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
  });

  const { data: doctors = [] } = useQuery<any[]>({
    queryKey: ["/api/doctors"],
  });

  // Define columns for EnhancedDataTable - wait for all data to load properly

  const appointmentColumns: Column[] = [
    {
      key: 'appointmentId',
      title: 'Appointment #',
      sortable: true,
      filterable: true,
      render: (value) => (
        <div className="font-medium text-blue-600">{value}</div>
      )
    },
    {
      key: 'patientName',
      title: 'Patient',
      sortable: true,
      filterable: true,
      render: (value, appointment) => {
        const patient = patients?.find(p => p.id === appointment.patientId);
        return (
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {patient?.firstName?.[0]}{patient?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900">
                {patient?.firstName} {patient?.lastName}
              </div>
              <div className="text-sm text-gray-500">{patient?.phone}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'appointmentDate',
      title: 'Date & Time',
      sortable: true,
      render: (value, appointment) => (
        <div className="text-sm">
          <div className="font-medium">{new Date(value).toLocaleDateString()}</div>
          <div className="text-gray-500">{appointment.appointmentTime}</div>
        </div>
      )
    },
    {
      key: 'service',
      title: 'Service',
      sortable: true,
      filterable: true,
      render: (value) => (
        <div className="text-sm text-gray-900">{value}</div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'no-show', label: 'No Show' }
      ],
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>
          {value}
        </Badge>
      )
    },
    {
      key: 'assignedDoctorId',
      title: 'Doctor',
      sortable: true,
      filterable: true,
      render: (value) => {
        // Safe doctor lookup to prevent scope errors
        const doctor = doctors?.find(d => d.id === value);
        return (
          <div className="text-sm text-gray-900">
            {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Unassigned'}
          </div>
        );
      }
    },
    {
      key: 'appointmentFee',
      title: 'Fee',
      sortable: true,
      render: (value, appointment) => {
        const fee = value || appointment.fee || appointment.appointmentFee || 0;
        return (
          <div className="text-sm font-medium">${Number(fee).toFixed(2)}</div>
        );
      }
    },
    {
      key: 'paymentStatus',
      title: 'Payment',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' },
        { value: 'partial', label: 'Partial' },
        { value: 'cancelled', label: 'Cancelled' }
      ],
      render: (value) => (
        <Badge variant={value === 'paid' ? 'default' : value === 'pending' ? 'secondary' : 'outline'}>
          {value}
        </Badge>
      )
    }
  ];

  // Available services for appointments
  const services = [
    "Comprehensive Eye Examination",
    "Contact Lens Fitting",
    "Frame Selection & Fitting",
    "Vision Screening",
    "Glaucoma Screening",
    "Prescription Update",
    "Eye Health Consultation",
    "Diabetic Eye Exam",
    "Children's Eye Exam",
    "Low Vision Assessment"
  ];

  const form = useForm<InsertAppointment>({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: {
      patientId: "",
      customerId: "",
      storeId: "",
      staffId: undefined,
      assignedDoctorId: undefined,
      appointmentDate: new Date(),
      duration: 60,
      service: "",
      appointmentFee: 0,
      paymentStatus: "pending",
      paymentMethod: undefined,
      paymentDate: undefined,
      status: "scheduled",
      notes: "",
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      await apiRequest("POST", "/api/appointments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      toast({
        title: "Success",
        description: "Appointment scheduled successfully.",
      });
      setOpen(false);
      form.reset();
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertAppointment> }) => {
      await apiRequest("PUT", `/api/appointments/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      toast({
        title: "Success",
        description: "Appointment updated successfully.",
      });
      setOpen(false);
      setEditingAppointment(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update appointment.",
        variant: "destructive",
      });
    },
  });

  // Helper function for status badge variants
  const getStatusVariant = (status: string) => {
    const variants = {
      scheduled: "secondary" as const,
      confirmed: "default" as const,
      "in-progress": "secondary" as const,
      completed: "default" as const,
      cancelled: "destructive" as const,
      "no-show": "outline" as const
    };
    return variants[status as keyof typeof variants] || "secondary";
  };

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/appointments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      toast({
        title: "Success",
        description: "Appointment cancelled successfully.",
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

  const updateAppointmentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/appointments/${id}/status`, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      const statusMessages = {
        'scheduled': 'Appointment scheduled successfully',
        'confirmed': 'Appointment confirmed',
        'checked-in': 'Patient checked in',
        'in-progress': 'Consultation started',
        'completed': 'Appointment completed',
        'cancelled': 'Appointment cancelled',
        'no-show': 'Marked as no-show',
        'rescheduled': 'Appointment rescheduled'
      };
      toast({
        title: "Status Updated",
        description: statusMessages[variables.status as keyof typeof statusMessages] || "Status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update appointment status.",
        variant: "destructive",
      });
    },
  });

  // Action handlers
  const handleViewDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
    setDetailsOpen(true);
  };

  const handleEdit = (appointment: any) => {
    setEditingAppointment(appointment);
    form.reset({
      customerId: appointment.customerId,
      storeId: appointment.storeId,
      staffId: appointment.staffId,
      appointmentDate: new Date(appointment.appointmentDate),
      duration: appointment.duration,
      service: appointment.service,
      status: appointment.status,
      notes: appointment.notes || "",
    });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteAppointmentMutation.mutate(id);
  };

  const handleStatusChange = (id: string, status: string) => {
    updateAppointmentStatusMutation.mutate({ id, status });
  };

  const handleCheckIn = (appointment: any) => {
    handleStatusChange(appointment.id, "checked-in");
  };

  const handleConfirm = (appointment: any) => {
    handleStatusChange(appointment.id, "confirmed");
  };

  const handleStartConsultation = (appointment: any) => {
    handleStatusChange(appointment.id, "in-progress");
  };

  const handleComplete = (appointment: any) => {
    handleStatusChange(appointment.id, "completed");
  };

  const handleCancel = (appointment: any) => {
    handleStatusChange(appointment.id, "cancelled");
  };

  const handleReschedule = (appointment: any) => {
    toast({
      title: "Reschedule",
      description: "Reschedule functionality would open a date picker modal.",
    });
  };

  const handleSendReminder = (appointment: any) => {
    toast({
      title: "Reminder Sent",
      description: `Reminder sent to ${appointment.customer.firstName} ${appointment.customer.lastName}`,
    });
  };

  const generateAppointmentReport = (appointment: any) => {
    generateAppointmentPDF(appointment);
  };



  const shareByEmailSimple = (appointment: any) => {
    const emailSubject = `Appointment Confirmation - ${appointment.customer.firstName} ${appointment.customer.lastName}`;
    const emailBody = `Appointment Details:%0D%0A%0D%0APatient: ${appointment.customer.firstName} ${appointment.customer.lastName}%0D%0ADate: ${new Date(appointment.appointmentDate).toLocaleDateString()}%0D%0ATime: ${new Date(appointment.appointmentDate).toLocaleTimeString()}%0D%0AService: ${appointment.service}%0D%0ADuration: ${appointment.duration} minutes%0D%0ALocation: ${appointment.store.name}%0D%0AStatus: ${appointment.status}%0D%0A%0D%0AGenerated from OptiStore Pro Medical Center`;
    window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
    
    toast({
      title: "Email Sharing",
      description: "Opening email client with appointment details",
    });
  };

  const generateAppointmentPDF = (appointment: any) => {
    const pdfWindow = window.open('', '_blank');
    if (pdfWindow) {
      pdfWindow.document.write(`
        <html>
          <head>
            <title>Appointment Details - ${appointment.customer.firstName} ${appointment.customer.lastName}</title>
            <style>
              @page { size: A4; margin: 15mm; }
              body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; font-size: 11pt; color: #333; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 15px; height: 25mm; display: flex; align-items: center; justify-content: space-between; border-radius: 8px; margin-bottom: 20px; }
              .clinic-logo { font-size: 18pt; font-weight: 900; margin-bottom: 2px; }
              .clinic-subtitle { font-size: 9pt; opacity: 0.9; }
              .appointment-qr { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; padding: 5px; text-align: center; }
              .qr-canvas { background: white; width: 35px; height: 35px; border-radius: 3px; margin: 0 auto 2px; }
              .qr-label { font-size: 5pt; margin: 0; font-weight: 700; }
              .content { padding: 20px; }
              .appointment-details { background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
              .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px; }
              .detail-item { border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
              .detail-label { font-weight: 600; color: #4a5568; font-size: 9pt; }
              .detail-value { color: #2d3748; font-size: 10pt; margin-top: 3px; }
              .status-badge { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 8pt; font-weight: 600; text-transform: uppercase; }
              @media print { body { margin: 0; } }
            </style>
            <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="clinic-logo">🏥 OptiStore Pro</div>
                <div class="clinic-subtitle">Advanced Medical Center & Eye Care Specialists</div>
              </div>
              <div class="appointment-qr">
                <div class="qr-canvas">
                  <canvas id="appointment-qr" style="width: 30px; height: 30px;"></canvas>
                </div>
                <p class="qr-label">Appointment QR</p>
              </div>
            </div>
            
            <div class="content">
              <div class="appointment-details">
                <h2 style="margin-top: 0; color: #667eea;">Appointment Details</h2>
                <div class="details-grid">
                  <div class="detail-item">
                    <div class="detail-label">Patient Name</div>
                    <div class="detail-value">${appointment.customer.firstName} ${appointment.customer.lastName}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Appointment Date</div>
                    <div class="detail-value">${new Date(appointment.appointmentDate).toLocaleDateString()}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Time</div>
                    <div class="detail-value">${new Date(appointment.appointmentDate).toLocaleTimeString()}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Service</div>
                    <div class="detail-value">${appointment.service}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Duration</div>
                    <div class="detail-value">${appointment.duration} minutes</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Status</div>
                    <div class="detail-value">
                      <span class="status-badge" style="background: #e2e8f0; color: #4a5568;">${appointment.status}</span>
                    </div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Location</div>
                    <div class="detail-value">${appointment.store.name}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Notes</div>
                    <div class="detail-value">${appointment.notes || 'No special notes'}</div>
                  </div>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <button onclick="window.print()" style="background: #667eea; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Print Appointment</button>
              </div>
            </div>
            
            <script>
              const canvas = document.getElementById('appointment-qr');
              const qrData = 'Appointment: ${appointment.id}, Patient: ${appointment.customer.firstName} ${appointment.customer.lastName}, Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}, Service: ${appointment.service}';
              QRCode.toCanvas(canvas, qrData, { width: 30, height: 30, margin: 1 }, function (error) {
                if (error) console.error(error);
              });
            </script>
          </body>
        </html>
      `);
      pdfWindow.document.close();
    }
    
    toast({
      title: "Appointment Report Generated",
      description: `Report for ${appointment.customer.firstName} ${appointment.customer.lastName} is ready for printing`,
    });
  };

  const generateAppointmentQR = (appointment: any) => {
    const qrWindow = window.open('', '_blank');
    if (qrWindow) {
      qrWindow.document.write(`
        <html>
          <head>
            <title>Appointment QR Code - ${appointment.customer.firstName} ${appointment.customer.lastName}</title>
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
              <h2>Appointment QR Code</h2>
              <div class="qr-code">
                <canvas id="qr-canvas"></canvas>
              </div>
              <p><strong>${appointment.customer.firstName} ${appointment.customer.lastName}</strong></p>
              <p>Appointment ID: ${appointment.id}</p>
              <p>Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
              <p>Service: ${appointment.service}</p>
              <p>Scan to access appointment details</p>
              <button onclick="window.print()">Print QR Code</button>
            </div>
            
            <script>
              const canvas = document.getElementById('qr-canvas');
              const qrData = 'Appointment: ${appointment.id}, Patient: ${appointment.customer.firstName} ${appointment.customer.lastName}, Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}, Service: ${appointment.service}, Status: ${appointment.status}';
              QRCode.toCanvas(canvas, qrData, { width: 200, height: 200, margin: 2 }, function (error) {
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
      description: `QR code for appointment with ${appointment.customer.firstName} ${appointment.customer.lastName}`,
    });
  };

  // Mark appointment as paid function
  const markAsPaidMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      await apiRequest("PUT", `/api/appointments/${appointmentId}`, {
        paymentStatus: "paid",
        paymentDate: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Appointment marked as paid.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment status.",
        variant: "destructive",
      });
    },
  });

  const shareByEmail = (appointment: any) => {
    const patient = patients?.find(p => p.id === appointment.patientId);
    const store = stores?.find(s => s.id === appointment.storeId);
    const emailSubject = `Appointment Confirmation - ${patient?.firstName || 'Patient'} ${patient?.lastName || ''}`;
    const emailBody = `Appointment Details:%0D%0A%0D%0APatient: ${patient?.firstName || 'Unknown'} ${patient?.lastName || 'Patient'}%0D%0ADate: ${new Date(appointment.appointmentDate).toLocaleDateString()}%0D%0ATime: ${new Date(appointment.appointmentDate).toLocaleTimeString()}%0D%0AService: ${appointment.service}%0D%0ADuration: ${appointment.duration} minutes%0D%0ALocation: ${store?.name || 'OptiStore Pro'}%0D%0AStatus: ${appointment.status}%0D%0A%0D%0AGenerated from OptiStore Pro Medical Center`;
    window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
    
    toast({
      title: "Email Sharing",
      description: "Opening email client with appointment details",
    });
  };

  const shareByQREmail = (appointment: any) => {
    toast({
      title: "QR Code Shared",
      description: "QR code shared via email.",
    });
  };

  const shareByWhatsApp = (appointment: any) => {
    const patient = patients?.find(p => p.id === appointment.patientId);
    const store = stores?.find(s => s.id === appointment.storeId);
    const message = `*Appointment Confirmation*%0A%0APatient: ${patient?.firstName || 'Unknown'} ${patient?.lastName || 'Patient'}%0ADate: ${new Date(appointment.appointmentDate).toLocaleDateString()}%0ATime: ${new Date(appointment.appointmentDate).toLocaleTimeString()}%0AService: ${appointment.service}%0ALocation: ${store?.name || 'OptiStore Pro'}%0A%0AGenerated from OptiStore Pro Medical Center`;
    window.open(`https://wa.me/?text=${message}`);
    
    toast({
      title: "WhatsApp Shared",
      description: "Opening WhatsApp with appointment details",
    });
  };

  const generateAppointmentInvoice = (appointment: any) => {
    const invoiceWindow = window.open('', '_blank');
    if (invoiceWindow) {
      invoiceWindow.document.write(`
        <html>
          <head>
            <title>Appointment Invoice - ${appointment.customer.firstName} ${appointment.customer.lastName}</title>
            <style>
              @page { size: A4; margin: 15mm; }
              body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; font-size: 12pt; color: #333; }
              .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #667eea; padding: 15px 0; margin-bottom: 25px; }
              .clinic-info h1 { color: #667eea; margin: 0; font-size: 24pt; font-weight: 900; }
              .clinic-info p { margin: 3px 0; font-size: 10pt; color: #666; }
              .invoice-details { text-align: right; }
              .invoice-details h2 { color: #333; margin: 0; font-size: 20pt; margin-bottom: 8px; }
              .services-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
              .services-table th, .services-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
              .services-table th { background: #f8fafc; font-weight: 600; color: #4a5568; }
              .total-section { text-align: right; margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; }
              .total-amount { font-size: 18pt; font-weight: 700; color: #667eea; margin: 10px 0; }
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
              <div class="invoice-details">
                <h2>INVOICE</h2>
                <p><strong>Invoice #:</strong> APT-${appointment.id}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</p>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
                <h3 style="margin-top: 0;">Bill To:</h3>
                <p><strong>${appointment.customer.firstName} ${appointment.customer.lastName}</strong></p>
                <p>Phone: ${appointment.customer.phone}</p>
              </div>
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
                <h3 style="margin-top: 0;">Appointment Details:</h3>
                <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${new Date(appointment.appointmentDate).toLocaleTimeString()}</p>
                <p><strong>Location:</strong> ${appointment.store.name}</p>
              </div>
            </div>

            <table class="services-table">
              <thead>
                <tr>
                  <th>Service Description</th>
                  <th>Duration</th>
                  <th>Rate</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${appointment.service}</td>
                  <td>${appointment.duration} minutes</td>
                  <td>$125.00</td>
                  <td>$125.00</td>
                </tr>
              </tbody>
            </table>

            <div class="total-section">
              <p><strong>Subtotal: $125.00</strong></p>
              <p><strong>Tax (8.5%): $10.63</strong></p>
              <p class="total-amount">Total Amount: $135.63</p>
            </div>

            <div style="margin-top: 30px; text-align: center;">
              <button onclick="window.print()" style="background: #667eea; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 12pt;">Print Invoice</button>
            </div>
          </body>
        </html>
      `);
      invoiceWindow.document.close();
    }
    
    toast({
      title: "Appointment Invoice Generated",
      description: `Invoice for ${appointment.customer.firstName} ${appointment.customer.lastName} is ready for printing`,
    });
  };



  // Use real appointments data or mock for demo  
  const displayAppointments = appointments.length > 0 ? appointments.map(apt => ({
    ...apt,
    customer: { firstName: apt.customerId?.slice(0,8) || 'Unknown', lastName: 'Patient', phone: '(555) 123-4567' },
    store: { name: 'Main Store', address: '123 Healthcare Ave' }
  })) : [
    {
      id: "1",
      customerId: "cust1",
      storeId: "store1",
      staffId: "staff1",
      appointmentDate: new Date(),
      duration: 60,
      service: "Eye Exam",
      status: "scheduled",
      notes: "First time patient",
      customer: { firstName: "Sarah", lastName: "Johnson", phone: "(555) 123-4567" },
      store: { name: "Downtown Store", address: "123 Main St" },
    },
    {
      id: "2",
      customerId: "cust2", 
      storeId: "store1",
      staffId: "staff1",
      appointmentDate: addDays(new Date(), 1),
      duration: 30,
      service: "Frame Fitting",
      status: "confirmed",
      notes: "Bring existing glasses",
      customer: { firstName: "Michael", lastName: "Chen", phone: "(555) 987-6543" },
      store: { name: "Downtown Store", address: "123 Main St" },
    },
    {
      id: "3",
      customerId: "cust3",
      storeId: "store2",
      staffId: "staff2", 
      appointmentDate: addDays(new Date(), 2),
      duration: 45,
      service: "Contact Lens Fitting",
      status: "completed",
      notes: "Follow-up in 2 weeks",
      customer: { firstName: "Emma", lastName: "Wilson", phone: "(555) 456-7890" },
      store: { name: "Mall Location", address: "456 Shopping Center" },
    }
  ];

  const filteredAppointments = displayAppointments.filter(appointment => {
    const matchesSearch = 
      appointment.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedView === "today") {
      return matchesSearch && isSameDay(appointment.appointmentDate, selectedDate);
    }
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-emerald-100 text-emerald-800';
      case 'checked-in': return 'bg-teal-100 text-teal-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-amber-100 text-amber-800';
      case 'rescheduled': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'checked-in': return <UserCheck className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'no-show': return <AlertCircle className="h-4 w-4" />;
      case 'rescheduled': return <Calendar className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const onSubmit = (data: InsertAppointment) => {
    if (editingAppointment) {
      updateAppointmentMutation.mutate({ id: editingAppointment.id, data });
    } else {
      createAppointmentMutation.mutate(data);
    }
  };



  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setEditingAppointment(null);
      form.reset();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments">All Appointments</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">All Appointments ({displayAppointments.length})</h3>
                <p className="text-sm text-slate-600">Manage appointments across all store locations</p>
              </div>
              
              <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Book Appointment
                  </Button>  
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAppointment ? "Edit Appointment" : "Book New Appointment"}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="patientId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Patient</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-patient">
                                    <SelectValue placeholder="Select patient" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {patients && patients.length > 0 ? patients.map((patient) => {
                                    // MySQL schema uses camelCase - no fallbacks needed
                                    const patientId = patient.id || '';
                                    const firstName = patient.firstName || 'Unknown';
                                    const lastName = patient.lastName || '';
                                    const patientCode = patient.patientCode || patient.id?.slice(-6) || 'N/A';
                                    
                                    // Ensure we have a valid patientId before rendering
                                    if (!patientId) {
                                      console.warn('Patient missing ID:', patient);
                                      return null;
                                    }
                                    
                                    return (
                                      <SelectItem key={patientId} value={patientId}>
                                        {firstName} {lastName} ({patientCode})
                                      </SelectItem>
                                    );
                                  }).filter(Boolean) : (
                                    <div className="p-2 text-sm text-gray-500 text-center">
                                      No patients found - Please register patients first
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="storeId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Store Location</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select store" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {stores.map((store) => (
                                    <SelectItem key={store.id} value={store.id}>
                                      {store.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="service"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select service" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {services.map((service) => (
                                  <SelectItem key={service} value={service}>
                                    {service}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="appointmentDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date & Time</FormLabel>
                              <FormControl>
                                <Input 
                                  type="datetime-local" 
                                  {...field}
                                  value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ""}
                                  onChange={(e) => field.onChange(new Date(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
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
                                  <SelectItem value="30">30 minutes</SelectItem>
                                  <SelectItem value="45">45 minutes</SelectItem>
                                  <SelectItem value="60">1 hour</SelectItem>
                                  <SelectItem value="90">1.5 hours</SelectItem>
                                  <SelectItem value="120">2 hours</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="no-show">No Show</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Doctor Assignment Field */}
                      <FormField
                        control={form.control}
                        name="assignedDoctorId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-1">
                              <span>Assigned Doctor</span>
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select doctor *" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {doctors.map((doctor) => (
                                  <SelectItem key={doctor.id} value={doctor.id}>
                                    Dr. {doctor.firstName} {doctor.lastName} ({doctor.specialization})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Appointment Fee and Payment Section */}
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="appointmentFee"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Appointment Fee</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="paymentStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Status</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Payment status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="paid">Paid</SelectItem>
                                  <SelectItem value="refunded">Refunded</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Method</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Payment method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="cash">Cash</SelectItem>
                                  <SelectItem value="card">Card</SelectItem>
                                  <SelectItem value="insurance">Insurance</SelectItem>
                                  <SelectItem value="online">Online</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Input placeholder="Additional notes or instructions" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleOpenChange(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createAppointmentMutation.isPending || updateAppointmentMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {createAppointmentMutation.isPending || updateAppointmentMutation.isPending
                            ? "Saving..."
                            : editingAppointment
                            ? "Update Appointment"
                            : "Book Appointment"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Input
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
              
              <Select value={selectedView} onValueChange={setSelectedView}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

          {/* Enhanced Appointments Table with Pagination, Filtering, and Sorting */}
          <EnhancedDataTable
            data={appointments as Appointment[]}
            columns={appointmentColumns}
            title="Appointment Management"
            searchPlaceholder="Search appointments by patient name, service, or appointment ID..."
            isLoading={isLoading}
            onRefresh={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
            }}
            onView={(appointment) => {
              setSelectedAppointment(appointment);
              setDetailsOpen(true);
            }}
            onEdit={(appointment) => {
              setEditingAppointment(appointment);
              form.reset({
                ...appointment,
                appointmentDate: new Date(appointment.appointmentDate),
              });
              setOpen(true);
            }}
            actions={(appointment) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setSelectedAppointment(appointment);
                    setDetailsOpen(true);
                  }}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setEditingAppointment(appointment);
                    form.reset({
                      ...appointment,
                      appointmentDate: new Date(appointment.appointmentDate),
                    });
                    setOpen(true);
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    updateAppointmentStatusMutation.mutate({
                      id: appointment.id,
                      status: appointment.status === 'completed' ? 'scheduled' : 'completed'
                    });
                  }}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {appointment.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => deleteAppointmentMutation.mutate(appointment.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Cancel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            pageSize={10}
            showPagination={true}
            emptyMessage="No appointments scheduled. Start booking appointments for your patients."
            totalCount={appointments.length}
          />
        </TabsContent>

        {/* Calendar View Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar View Coming Soon</h3>
            <p className="text-gray-600">Visual calendar interface for appointment management.</p>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
            <p className="text-gray-600">Appointment analytics and reporting.</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Appointment Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Patient Information</h3>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {patients?.find(p => p.id === selectedAppointment.patientId)?.firstName || 'Unknown'} {patients?.find(p => p.id === selectedAppointment.patientId)?.lastName || 'Patient'}</p>
                    <p><strong>Phone:</strong> {patients?.find(p => p.id === selectedAppointment.patientId)?.phone || 'N/A'}</p>
                    <p><strong>Email:</strong> {patients?.find(p => p.id === selectedAppointment.patientId)?.email || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Appointment Details</h3>
                  <div className="space-y-2">
                    <p><strong>Date:</strong> {format(selectedAppointment.appointmentDate, 'MMM dd, yyyy')}</p>
                    <p><strong>Time:</strong> {format(selectedAppointment.appointmentDate, 'HH:mm')}</p>
                    <p><strong>Duration:</strong> {selectedAppointment.duration} minutes</p>
                    <p><strong>Service:</strong> {selectedAppointment.service}</p>
                    <p><strong>Status:</strong> {selectedAppointment.status}</p>
                    <p><strong>Store:</strong> {stores?.find(s => s.id === selectedAppointment.storeId)?.name || 'OptiStore Pro'}</p>
                  </div>
                </div>
              </div>
              
              {selectedAppointment.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Notes</h3>
                  <p className="text-gray-600">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      </main>
    </>
  );
}


