import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Eye,
  Download,
  Send,
  QrCode,
  FileText,
  Calendar,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Share,
  Mail,
  FileDown,
  Zap,
  CheckCircle,
  Clock,
  Stethoscope,
  UserCheck,
  CalendarCheck
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  insertPrescriptionSchema, 
  type Prescription, 
  type InsertPrescription, 
  type Patient
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import QRCode from "react-qr-code";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PrescriptionSearchFilter from "@/components/PrescriptionSearchFilter";

export default function PrescriptionsFixed() {
  const [createOpen, setCreateOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewPrescription, setViewPrescription] = useState<Prescription | null>(null);
  const [activeTab, setActiveTab] = useState("doctor-appointments");
  const [sortBy, setSortBy] = useState("date");
  const [currentServiceType, setCurrentServiceType] = useState("eye_examination");
  const [searchFilteredPrescriptions, setSearchFilteredPrescriptions] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data queries
  const { data: prescriptions = [], isLoading } = useQuery<Prescription[]>({
    queryKey: ["/api/prescriptions"],
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: staff = [] } = useQuery<any[]>({
    queryKey: ["/api/staff"],
  });

  const { data: appointments = [] } = useQuery<any[]>({
    queryKey: ["/api/medical-appointments"],
  });

  // Create prescription form
  const createForm = useForm<InsertPrescription>({
    mode: "onChange",
    defaultValues: {
      prescriptionNumber: `RX-${Date.now().toString().slice(-6)}`,
      patientId: "",
      doctorId: "",
      storeId: "5ff902af-3849-4ea6-945b-4d49175d6638",
      prescriptionType: "eye_examination",
      diagnosis: "",
      treatment: "",
      status: "active",
    },
  });

  // Quick prescription form
  const quickForm = useForm<InsertPrescription>({
    mode: "onChange",
    defaultValues: {
      prescriptionNumber: `QRX-${Date.now().toString().slice(-6)}`,
      patientId: "",
      storeId: "5ff902af-3849-4ea6-945b-4d49175d6638",
      prescriptionType: "eye_examination",
      diagnosis: "",
      status: "active",
    },
  });

  // Mutation for creating prescriptions
  const createPrescriptionMutation = useMutation({
    mutationFn: async (data: InsertPrescription) => {
      const response = await apiRequest('POST', '/api/prescriptions', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions'] });
      setCreateOpen(false);
      setQuickOpen(false);
      createForm.reset();
      quickForm.reset();
      toast({
        title: "Success",
        description: "Prescription created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create prescription",
        variant: "destructive",
      });
    },
  });

  // Form submit handlers
  const onCreateSubmit = (data: InsertPrescription) => {
    console.log('Submitting prescription data:', data);
    console.log('Form errors:', createForm.formState.errors);
    
    // Ensure required fields are present
    if (!data.patientId) {
      toast({
        title: "Validation Error",
        description: "Please select a patient",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.prescriptionNumber) {
      data.prescriptionNumber = `RX-${Date.now().toString().slice(-6)}`;
    }
    
    // Clean up the data - ensure all required fields have proper values
    const cleanedData = {
      ...data,
      doctorId: null, // Always set to null to avoid FK constraint issues
      prescriptionDate: data.prescriptionDate || new Date().toISOString(),
      storeId: data.storeId || "5ff902af-3849-4ea6-945b-4d49175d6638",
      status: data.status || "active",
      // Clean up empty date fields that cause database errors
      nextFollowUp: data.nextFollowUp || null,
      expirationDate: data.expirationDate || null,
      // Ensure numeric fields are properly formatted
      axisRight: data.axisRight ? parseInt(data.axisRight.toString()) : null,
      axisLeft: data.axisLeft ? parseInt(data.axisLeft.toString()) : null,
    };

    // Remove any empty string values that could cause database errors
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] === "" || cleanedData[key] === undefined) {
        cleanedData[key] = null;
      }
    });
    
    console.log('Cleaned data for submission:', cleanedData);
    createPrescriptionMutation.mutate(cleanedData);
  };

  const onQuickSubmit = (data: InsertPrescription) => {
    console.log('Submitting quick prescription data:', data);
    
    if (!data.patientId) {
      toast({
        title: "Validation Error",
        description: "Please select a patient",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.prescriptionNumber) {
      data.prescriptionNumber = `QRX-${Date.now().toString().slice(-6)}`;
    }

    // Clean up quick form data too
    const cleanedQuickData = {
      ...data,
      doctorId: null,
      prescriptionDate: data.prescriptionDate || new Date().toISOString(),
      storeId: data.storeId || "5ff902af-3849-4ea6-945b-4d49175d6638",
      status: data.status || "active",
    };

    // Remove empty strings
    Object.keys(cleanedQuickData).forEach(key => {
      if (cleanedQuickData[key] === "" || cleanedQuickData[key] === undefined) {
        cleanedQuickData[key] = null;
      }
    });
    
    createPrescriptionMutation.mutate(cleanedQuickData);
  };



  // Helper functions
  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient";
  };

  const getDoctorName = (doctorId: string | null) => {
    if (!doctorId) return "No Doctor";
    const doctor = staff.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Unknown Doctor";
  };

  // Action handlers
  const handleDownloadPDF = (prescription: Prescription) => {
    const patient = patients.find(p => p.id === prescription.patientId);
    const pdfContent = `
PRESCRIPTION REPORT
==================

Prescription Number: ${prescription.prescriptionNumber}
Patient: ${getPatientName(prescription.patientId)}
Doctor: ${getDoctorName(prescription.doctorId)}
Date: ${format(new Date(prescription.createdAt || ''), 'MMMM dd, yyyy')}
Service Type: ${prescription.prescriptionType?.replace('_', ' ')}
Status: ${prescription.status}

VISION PRESCRIPTION:
Right Eye: SPH ${prescription.sphereRight || 'N/A'} CYL ${prescription.cylinderRight || 'N/A'} AXIS ${prescription.axisRight || 'N/A'}°
Left Eye: SPH ${prescription.sphereLeft || 'N/A'} CYL ${prescription.cylinderLeft || 'N/A'} AXIS ${prescription.axisLeft || 'N/A'}°
PD: ${prescription.pdDistance || 'N/A'} mm

DIAGNOSIS:
${prescription.diagnosis || 'No diagnosis recorded'}

TREATMENT:
${prescription.treatment || 'No treatment recorded'}

NOTES:
${prescription.notes || 'No additional notes'}
    `;

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prescription-${prescription.prescriptionNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "PDF Downloaded",
      description: `Prescription ${prescription.prescriptionNumber} downloaded successfully`,
    });
  };

  const handleSendEmail = (prescription: Prescription) => {
    const patient = patients.find(p => p.id === prescription.patientId);
    const subject = `Prescription ${prescription.prescriptionNumber} - ${patient?.firstName} ${patient?.lastName}`;
    const body = `Dear ${patient?.firstName},

Your prescription is ready:

Prescription Number: ${prescription.prescriptionNumber}
Date: ${format(new Date(prescription.createdAt || ''), 'MMMM dd, yyyy')}
Service: ${prescription.prescriptionType?.replace('_', ' ')}

Please contact us if you have any questions.

Best regards,
IeOMS Team`;

    const mailtoLink = `mailto:${patient?.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);

    toast({
      title: "Email Client Opened",
      description: `Email prepared for ${patient?.email || 'patient'}`,
    });
  };

  const handleSharePrescription = (prescription: Prescription) => {
    const shareUrl = `${window.location.origin}/prescriptions/${prescription.id}`;
    const shareText = `Prescription ${prescription.prescriptionNumber} - ${getPatientName(prescription.patientId)}`;
    
    try {
      if (navigator.share && typeof navigator.canShare === 'function' && navigator.canShare({ url: shareUrl })) {
        navigator.share({
          title: 'Prescription Details',
          text: shareText,
          url: shareUrl,
        }).catch((error) => {
          console.log('Share failed:', error);
          // Fallback to clipboard
          handleClipboardShare(shareText, shareUrl);
        });
      } else {
        handleClipboardShare(shareText, shareUrl);
      }
    } catch (error) {
      handleClipboardShare(shareText, shareUrl);
    }
  };

  const handleClipboardShare = (shareText: string, shareUrl: string) => {
    const shareContent = `${shareText}\n${shareUrl}`;
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(shareContent).then(() => {
        toast({
          title: "Link Copied",
          description: "Prescription link copied to clipboard",
        });
      }).catch(() => {
        // Final fallback - show the URL
        toast({
          title: "Share Link",
          description: shareUrl,
          duration: 10000,
        });
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareContent;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast({
          title: "Link Copied",
          description: "Prescription link copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Share Link",
          description: shareUrl,
          duration: 10000,
        });
      }
      document.body.removeChild(textArea);
    }
  };

  const handleViewDetails = (prescription: Prescription) => {
    setViewPrescription(prescription);
  };

  const handleEdit = (prescription: Prescription) => {
    createForm.reset({
      prescriptionNumber: prescription.prescriptionNumber,
      patientId: prescription.patientId,
      doctorId: prescription.doctorId || "",
      storeId: prescription.storeId || "5ff902af-3849-4ea6-945b-4d49175d6638",
      prescriptionType: prescription.prescriptionType || "eye_examination",
      diagnosis: prescription.diagnosis || "",
      treatment: prescription.treatment || "",
      status: prescription.status || "active",
    });
    setCreateOpen(true);
  };

  const handleDelete = (prescription: Prescription) => {
    toast({
      title: "Delete Prescription",
      description: "This feature will be implemented soon",
      variant: "destructive",
    });
  };

  const handleServiceTypeChange = (serviceType: string) => {
    setCurrentServiceType(serviceType);
    // Reset form fields that might be service-type specific
    const currentValues = createForm.getValues();
    createForm.reset({
      ...currentValues,
      prescriptionType: serviceType,
      // Clear vision fields for non-vision services
      ...(serviceType !== 'eye_examination' && serviceType !== 'fitting_glasses' ? {
        visualAcuityRightEye: '',
        visualAcuityLeftEye: '',
        sphereRight: '',
        cylinderRight: '',
        axisRight: null,
        addRight: '',
        sphereLeft: '',
        cylinderLeft: '',
        axisLeft: null,
        addLeft: '',
        pdDistance: '',
        pdNear: '',
        pdFar: '',
      } : {})
    });
  };

  const handleCreatePrescriptionFromAppointment = async (prescription: Prescription) => {
    const patient = patients.find(p => p.id === prescription.patientId);
    if (patient) {
      // Find appointment data for this patient to get the assigned doctor
      try {
        const appointmentsResponse = await fetch('/api/medical-appointments');
        const appointments = await appointmentsResponse.json();
        const patientAppointment = appointments.find((app: any) => 
          app.patientId === patient.id && app.serviceType === prescription.prescriptionType
        );
        
        const assignedDoctorId = patientAppointment?.assignedDoctorId || prescription.doctorId || "";
        
        // Auto-populate the create form with patient and appointment data
        createForm.reset({
          prescriptionNumber: `RX-${Date.now().toString().slice(-6)}`,
          patientId: patient.id,
          doctorId: assignedDoctorId,
          prescriptionType: prescription.prescriptionType || 'eye_examination',
          storeId: prescription.storeId || "5ff902af-3849-4ea6-945b-4d49175d6638",
          status: 'active',
          diagnosis: '',
          treatment: '',
          advice: '',
          notes: '',
          visualAcuityRightEye: '',
          visualAcuityLeftEye: '',
          sphereRight: '',
          cylinderRight: '',
          axisRight: null,
          addRight: '',
          sphereLeft: '',
          cylinderLeft: '',
          axisLeft: null,
          addLeft: '',
          pdDistance: '',
          pdNear: '',
          pdFar: '',
          nextFollowUp: ''
        });
        
        setCurrentServiceType(prescription.prescriptionType || 'eye_examination');
        setCreateOpen(true);
        
        const doctorName = assignedDoctorId ? 
          `Dr. ${staff.find(s => s.id === assignedDoctorId)?.firstName || 'Unknown'}` : 
          'No doctor assigned';
        
        toast({
          title: "Create Prescription",
          description: `Auto-filled form for ${patient.firstName} ${patient.lastName} - ${doctorName}`,
        });
      } catch (error) {
        console.error('Error fetching appointments:', error);
        // Fallback without appointment data
        createForm.reset({
          prescriptionNumber: `RX-${Date.now().toString().slice(-6)}`,
          patientId: patient.id,
          doctorId: prescription.doctorId || "",
          prescriptionType: prescription.prescriptionType || 'eye_examination',
          storeId: prescription.storeId || "5ff902af-3849-4ea6-945b-4d49175d6638",
          status: 'active',
        });
        
        setCreateOpen(true);
        
        toast({
          title: "Create Prescription",
          description: `Auto-filled form for ${patient.firstName} ${patient.lastName}`,
        });
      }
    }
  };

  // Stats data
  const statsData = [
    {
      title: "Total Prescriptions",
      value: prescriptions.length,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Active Prescriptions", 
      value: prescriptions.filter(p => p.status === 'active').length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "This Month",
      value: prescriptions.filter(p => {
        const prescriptionDate = new Date(p.createdAt || '');
        const currentMonth = new Date().getMonth();
        return prescriptionDate.getMonth() === currentMonth;
      }).length,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Pending Review",
      value: prescriptions.filter(p => p.status === 'pending').length,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  // Filter and sort prescriptions based on active tab
  const filteredPrescriptions = prescriptions
    .filter((prescription) => {
      const matchesSearch = 
        prescription.prescriptionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patients.find(p => p.id === prescription.patientId)?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patients.find(p => p.id === prescription.patientId)?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTab = (() => {
        switch (activeTab) {
          case "all":
            return true;
          case "active":
            return prescription.status === 'active';
          case "pending":
            return prescription.status === 'pending';
          case "month":
            const prescriptionDate = new Date(prescription.createdAt || '');
            const currentMonth = new Date().getMonth();
            return prescriptionDate.getMonth() === currentMonth;

          case "doctor-appointments":
            return true; // Show all for doctor appointments tab
          default:
            return true;
        }
      })();

      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        case "patient":
          const patientA = patients.find(p => p.id === a.patientId);
          const patientB = patients.find(p => p.id === b.patientId);
          return `${patientA?.firstName} ${patientA?.lastName}`.localeCompare(`${patientB?.firstName} ${patientB?.lastName}`);
        case "status":
          return (a.status || '').localeCompare(b.status || '');
        case "number":
          return (a.prescriptionNumber || '').localeCompare(b.prescriptionNumber || '');
        default:
          return 0;
      }
    });

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-grow min-h-0 p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header Tabs */}
      <div className="flex items-center gap-8 border-b">
        <div 
          className={`flex items-center gap-2 pb-4 cursor-pointer relative ${
            activeTab === "doctor-appointments" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("doctor-appointments")}
        >
          <Stethoscope className="h-4 w-4" />
          <span>Doctor Appointments ({appointments.filter(apt => apt.assignedDoctorId && !prescriptions.some(p => p.appointmentId === apt.id)).length})</span>
          {appointments.filter(apt => apt.assignedDoctorId && !prescriptions.some(p => p.appointmentId === apt.id)).length > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </div>
        <div 
          className={`flex items-center gap-2 pb-4 cursor-pointer relative ${
            activeTab === "all" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("all")}
        >
          <FileText className="h-4 w-4" />
          <span className="font-medium">All Prescriptions ({prescriptions.length})</span>
          {prescriptions.filter(p => {
            const createdDate = new Date(p.createdAt || '');
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return createdDate > yesterday;
          }).length > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </div>
        <div 
          className={`flex items-center gap-2 pb-4 cursor-pointer relative ${
            activeTab === "active" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("active")}
        >
          <CheckCircle className="h-4 w-4" />
          <span>Active ({prescriptions.filter(p => p.status === 'active').length})</span>
          {prescriptions.filter(p => p.status === 'active' && new Date(p.createdAt || '') > new Date(Date.now() - 24*60*60*1000)).length > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </div>
        <div 
          className={`flex items-center gap-2 pb-4 cursor-pointer relative ${
            activeTab === "pending" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("pending")}
        >
          <Clock className="h-4 w-4" />
          <span>Pending ({prescriptions.filter(p => p.status === 'pending').length})</span>
          {prescriptions.filter(p => p.status === 'pending').length > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          )}
        </div>
        <div 
          className={`flex items-center gap-2 pb-4 cursor-pointer ${
            activeTab === "month" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("month")}
        >
          <Calendar className="h-4 w-4" />
          <span>This Month ({prescriptions.filter(p => {
            const prescriptionDate = new Date(p.createdAt || '');
            const currentMonth = new Date().getMonth();
            return prescriptionDate.getMonth() === currentMonth;
          }).length})</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Prescriptions Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Prescriptions</h2>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setQuickOpen(true)}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Zap className="mr-2 h-4 w-4" />
              Quick Prescription
            </Button>
          </div>
        </div>

        {/* Advanced Search and Filters */}
        {activeTab !== "doctor-appointments" && (
          <PrescriptionSearchFilter
            prescriptions={prescriptions.map(p => ({
              ...p,
              patientName: patients.find(patient => patient.id === p.patientId)?.firstName + ' ' + patients.find(patient => patient.id === p.patientId)?.lastName || 'Unknown Patient',
              patientCode: patients.find(patient => patient.id === p.patientId)?.patientCode || 'N/A',
              doctorName: staff.find(s => s.id === p.doctorId)?.firstName + ' ' + staff.find(s => s.id === p.doctorId)?.lastName || 'Unknown Doctor',
              doctorSpecialization: staff.find(s => s.id === p.doctorId)?.specialization || 'General',
              prescriptionDate: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
              lastModified: p.updatedAt ? p.updatedAt.toISOString() : (p.createdAt ? p.createdAt.toISOString() : new Date().toISOString()),
              createdBy: staff.find(s => s.id === p.doctorId)?.firstName + ' ' + staff.find(s => s.id === p.doctorId)?.lastName || 'System',
              priority: 'medium',
              medications: [],
              tags: []
            }))}
            onFilteredResults={(filtered: any[]) => setSearchFilteredPrescriptions(filtered)}
            onExport={(filtered) => {
              // Export functionality can be implemented here
              toast({
                title: "Export Started",
                description: `Exporting ${filtered.length} prescriptions...`,
              });
            }}
            className="mb-6"
          />
        )}
        
        {/* Simple Search for Doctor Appointments */}
        {activeTab === "doctor-appointments" && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search appointments..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Appointments</SelectItem>
                  <SelectItem value="assigned_to_doctor">Assigned to Doctor</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="patient">Sort by Patient</SelectItem>
                  <SelectItem value="service">Sort by Service</SelectItem>
                  <SelectItem value="doctor">Sort by Doctor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        )}

        {/* Conditional Content based on Active Tab */}
        {activeTab === "doctor-appointments" ? (
          // Doctor Appointments Tab Content
          <Card>
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Pending Doctor Appointments</h3>
                    <p className="text-sm text-gray-600">Appointments waiting for prescription creation</p>
                  </div>
                  <Badge variant="outline" className="px-3 py-1">
                    {appointments.filter(apt => 
                      apt.assignedDoctorId && 
                      apt.assignedDoctorId !== null && 
                      apt.assignedDoctorId !== '' &&
                      !prescriptions.some(p => p.appointmentId === apt.id)
                    ).length} Pending
                  </Badge>
                </div>

                {appointments.filter(apt => 
                  apt.assignedDoctorId && 
                  apt.assignedDoctorId !== null && 
                  apt.assignedDoctorId !== '' &&
                  !prescriptions.some(p => p.appointmentId === apt.id)
                ).length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending appointments</h3>
                    <p className="text-gray-600">All doctor appointments have been processed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments
                      .filter(apt => {
                        const hasDoctor = apt.assignedDoctorId && !prescriptions.some(p => p.appointmentId === apt.id);
                        if (!hasDoctor) return false;
                        
                        // Search filter
                        const patient = patients.find(p => p.id === apt.patientId);
                        const doctor = staff.find(d => d.id === apt.assignedDoctorId);
                        const patientName = patient ? `${patient.firstName} ${patient.lastName}` : '';
                        const doctorName = doctor ? `${doctor.firstName} ${doctor.lastName}` : '';
                        const searchMatch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          apt.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          apt.id.toLowerCase().includes(searchTerm.toLowerCase());
                        if (searchTerm && !searchMatch) return false;
                        
                        // Status filter
                        if (selectedStatus !== "all" && apt.status !== selectedStatus) return false;
                        
                        return true;
                      })
                      .sort((a, b) => {
                        const patientA = patients.find(p => p.id === a.patientId);
                        const patientB = patients.find(p => p.id === b.patientId);
                        const doctorA = staff.find(d => d.id === a.assignedDoctorId);
                        const doctorB = staff.find(d => d.id === b.assignedDoctorId);
                        
                        switch (sortBy) {
                          case "patient":
                            const nameA = patientA ? `${patientA.firstName} ${patientA.lastName}` : '';
                            const nameB = patientB ? `${patientB.firstName} ${patientB.lastName}` : '';
                            return nameA.localeCompare(nameB);
                          case "service":
                            return (a.service || '').localeCompare(b.service || '');
                          case "doctor":
                            const docNameA = doctorA ? `${doctorA.firstName} ${doctorA.lastName}` : '';
                            const docNameB = doctorB ? `${doctorB.firstName} ${doctorB.lastName}` : '';
                            return docNameA.localeCompare(docNameB);
                          case "date":
                          default:
                            return new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime();
                        }
                      })
                      .map((appointment) => {
                        const patient = patients.find(p => p.id === appointment.patientId);
                        const doctor = staff.find(d => d.id === appointment.assignedDoctorId);
                        const isNew = new Date(appointment.createdAt || '').getTime() > Date.now() - 24*60*60*1000;
                        return (
                          <div key={appointment.id} className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow ${
                            isNew ? 'border-green-300 shadow-green-50 bg-green-50/30' : 'border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                  <UserCheck className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">
                                    {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                                  </h4>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span>ID: {patient?.patientCode}</span>
                                    <span>•</span>
                                    <span>Service: {appointment.service}</span>
                                    <span>•</span>
                                    <span>Doctor: {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Unknown'}</span>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {new Date(appointment.appointmentDate).toLocaleDateString()} at {new Date(appointment.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="flex flex-col space-y-1">
                                  <Badge 
                                    variant="secondary" 
                                    className="bg-green-100 text-green-800 border-green-200"
                                  >
                                    Doctor Assigned
                                  </Badge>
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs"
                                  >
                                    Status: {appointment.status}
                                  </Badge>
                                </div>
                                <Button
                                  onClick={() => {
                                    // Auto-fill prescription form with appointment data
                                    createForm.reset({
                                      prescriptionNumber: `RX-${Date.now().toString().slice(-6)}`,
                                      patientId: appointment.patientId,
                                      doctorId: appointment.assignedDoctorId,
                                      storeId: "5ff902af-3849-4ea6-945b-4d49175d6638",
                                      prescriptionType: appointment.service?.includes('eye') ? 'eye_examination' : 
                                                      appointment.service?.includes('contact') ? 'contact_lens' : 'eye_examination',
                                      appointmentId: appointment.id,
                                      status: "active",
                                      prescriptionDate: new Date(),
                                    });
                                    setCurrentServiceType(appointment.service?.includes('eye') ? 'eye_examination' : 
                                                        appointment.service?.includes('contact') ? 'contact_lens' : 'eye_examination');
                                    setCreateOpen(true);
                                    
                                    toast({
                                      title: "Prescription Form Ready",
                                      description: `Auto-filled for ${patient?.firstName} ${patient?.lastName}`,
                                    });
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Create Prescription
                                </Button>
                              </div>
                            </div>
                            
                            {appointment.notes && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                  <strong>Notes:</strong> {appointment.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          // Regular Prescriptions Table
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
              <div className="p-8 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  </div>
                ))}
              </div>
            ) : filteredPrescriptions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No prescriptions found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? "Try adjusting your search criteria." : "Create your first prescription to get started."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Prescription
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prescription #</TableHead>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrescriptions.map((prescription) => {
                      const patient = patients.find(p => p.id === prescription.patientId);
                      return (
                        <TableRow key={prescription.id}>
                          <TableCell className="font-medium text-blue-600">
                            {prescription.prescriptionNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {patient ? `${patient.firstName?.[0]}${patient.lastName?.[0]}` : 'UN'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{getPatientName(prescription.patientId)}</p>
                                <p className="text-sm text-gray-500">{patient?.email || 'No email'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{patient?.phone || 'No phone'}</p>
                              <p className="text-xs text-gray-500">{patient?.gender || 'Not specified'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {prescription.prescriptionType?.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                              prescription.status === 'filled' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {prescription.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onClick={() => handleViewDetails(prescription)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(prescription)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleCreatePrescriptionFromAppointment(prescription)}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Create Prescription
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDownloadPDF(prescription)}>
                                  <FileDown className="mr-2 h-4 w-4" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendEmail(prescription)}>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setViewPrescription(prescription)}>
                                  <QrCode className="mr-2 h-4 w-4" />
                                  QR Code
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSharePrescription(prescription)}>
                                  <Share className="mr-2 h-4 w-4" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(prescription)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        )}
      </div>

      {/* Quick Prescription Dialog */}
      <Dialog open={quickOpen} onOpenChange={setQuickOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Quick Prescription
              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-300">
                Fill all red (*) fields
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {/* Progress Indicator for Quick Form */}
          <div className="bg-slate-100 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Required Fields:</span>
              <span className="text-blue-600 font-medium">
                {(() => {
                  const requiredFields = ['patientId', 'prescriptionType', 'diagnosis'];
                  const filledCount = requiredFields.filter(field => quickForm.watch(field)).length;
                  return `${filledCount}/${requiredFields.length} completed`;
                })()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{
                  width: `${(() => {
                    const requiredFields = ['patientId', 'prescriptionType', 'diagnosis'];
                    const filledCount = requiredFields.filter(field => quickForm.watch(field)).length;
                    return (filledCount / requiredFields.length) * 100;
                  })()}%`
                }}
              ></div>
            </div>
          </div>
          
          <Form {...quickForm}>
            <form onSubmit={quickForm.handleSubmit(onQuickSubmit)} className="space-y-4">
              <FormField
                control={quickForm.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Select Patient 
                      <span className="text-red-500 font-bold">*</span>
                      <span className="text-xs text-gray-500">(Required)</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={`${!field.value ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
                          <SelectValue placeholder="Choose patient..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.firstName} {patient.lastName} ({patient.patientCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={quickForm.control}
                name="prescriptionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Service Type 
                      <span className="text-red-500 font-bold">*</span>
                      <span className="text-xs text-gray-500">(Required)</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={`${!field.value ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
                          <SelectValue placeholder="Select service type..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="eye_examination">👁️ Eye Examination</SelectItem>
                        <SelectItem value="contact_lens">📱 Contact Lens Fitting</SelectItem>
                        <SelectItem value="fitting_glasses">👓 Glasses Fitting</SelectItem>
                        <SelectItem value="fitting_followup">🔄 Follow-up Visit</SelectItem>
                        <SelectItem value="visit_consultation">💬 General Consultation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={quickForm.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Quick Notes 
                      <span className="text-red-500 font-bold">*</span>
                      <span className="text-xs text-gray-500">(Required)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief diagnosis or notes..." 
                        className={`h-20 ${!field.value ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}
                        {...field} 
                        value={field.value || ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setQuickOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPrescriptionMutation.isPending || !quickForm.watch('patientId') || !quickForm.watch('prescriptionType') || !quickForm.watch('diagnosis')}
                  className={`transition-all duration-300 ${
                    quickForm.watch('patientId') && quickForm.watch('prescriptionType') && quickForm.watch('diagnosis')
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {createPrescriptionMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      {quickForm.watch('patientId') && quickForm.watch('prescriptionType') && quickForm.watch('diagnosis') ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Create Quick Prescription
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          Complete Required Fields
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Prescription Dialog with Tabs */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Create New Prescription
              <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                Fill all red (*) fields to submit
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {/* Progress Indicator */}
          <div className="bg-slate-100 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Required Fields Progress:</span>
              <span className="text-blue-600 font-medium">
                {(() => {
                  const requiredFields = ['patientId', 'prescriptionType', 'doctorId', 'diagnosis', 'treatment', 'status'];
                  const filledCount = requiredFields.filter(field => createForm.watch(field)).length;
                  return `${filledCount}/${requiredFields.length} completed`;
                })()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{
                  width: `${(() => {
                    const requiredFields = ['patientId', 'prescriptionType', 'doctorId', 'diagnosis', 'treatment', 'status'];
                    const filledCount = requiredFields.filter(field => createForm.watch(field)).length;
                    return (filledCount / requiredFields.length) * 100;
                  })()}%`
                }}
              ></div>
            </div>
          </div>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
              <Tabs defaultValue="patient-info" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="patient-info" className="relative">
                    Patient Info
                    {!createForm.watch('patientId') && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="vision" className="relative">
                    Vision Prescription
                    {!createForm.watch('prescriptionType') && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="clinical" className="relative">
                    Clinical Details
                    {!createForm.watch('diagnosis') && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="additional" className="relative">
                    Additional Info
                    {!createForm.watch('status') && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="patient-info" className="space-y-6">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="patientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              Select Patient 
                              <span className="text-red-500 font-bold">*</span>
                              <span className="text-xs text-gray-500">(Required)</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className={`${!field.value ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
                                  <SelectValue placeholder="Choose patient..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {patients.map((patient) => (
                                  <SelectItem key={patient.id} value={patient.id}>
                                    {patient.firstName} {patient.lastName} ({patient.patientCode})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={createForm.control}
                        name="prescriptionType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              Service Type 
                              <span className="text-red-500 font-bold">*</span>
                              <span className="text-xs text-gray-500">(Required)</span>
                            </FormLabel>
                            <Select onValueChange={(value) => {
                              field.onChange(value);
                              // Reset form sections when service type changes
                              handleServiceTypeChange(value);
                            }} value={field.value}>
                              <FormControl>
                                <SelectTrigger className={`${!field.value ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
                                  <SelectValue placeholder="Select service type..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="eye_examination">👁️ Eye Examination</SelectItem>
                                <SelectItem value="contact_lens">📱 Contact Lens Fitting</SelectItem>
                                <SelectItem value="fitting_glasses">👓 Glasses Fitting</SelectItem>
                                <SelectItem value="fitting_followup">🔄 Follow-up Visit</SelectItem>
                                <SelectItem value="visit_consultation">💬 General Consultation</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={createForm.control}
                      name="doctorId"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel className="flex items-center gap-1">
                            Prescribing Doctor 
                            <span className="text-red-500 font-bold">*</span>
                            <span className="text-xs text-gray-500">(Required)</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger className={`${!field.value ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
                                <SelectValue placeholder="Select prescribing doctor..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {staff.map((doctor) => (
                                <SelectItem key={doctor.id} value={doctor.id}>
                                  👨‍⚕️ Dr. {doctor.firstName} {doctor.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="vision" className="space-y-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {currentServiceType === 'eye_examination' ? 'Vision Prescription Details' :
                         currentServiceType === 'contact_lens' ? 'Contact Lens Prescription' :
                         currentServiceType === 'fitting_glasses' ? 'Glasses Fitting Details' :
                         currentServiceType === 'fitting_followup' ? 'Follow-up Assessment' :
                         'Consultation Notes'}
                      </h3>
                      <Badge variant="outline" className="capitalize">
                        {currentServiceType.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {/* Visual Acuity - show for eye examination and glasses fitting */}
                    {(currentServiceType === 'eye_examination' || currentServiceType === 'fitting_glasses') && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="visualAcuityLeftEye"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Visual Acuity - Left Eye</FormLabel>
                              <FormControl>
                                <Input placeholder="20/25" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="visualAcuityRightEye"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Visual Acuity - Right Eye</FormLabel>
                              <FormControl>
                                <Input placeholder="20/20" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Service-type specific content */}
                    {currentServiceType === 'contact_lens' ? (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-medium mb-4">Contact Lens Specifications</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={createForm.control}
                            name="diagnosis"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Lens Brand</FormLabel>
                                <FormControl>
                                  <Input placeholder="Acuvue Oasys" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={createForm.control}
                            name="treatment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Base Curve</FormLabel>
                                <FormControl>
                                  <Input placeholder="8.4 mm" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={createForm.control}
                            name="advice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Diameter</FormLabel>
                                <FormControl>
                                  <Input placeholder="14.0 mm" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ) : currentServiceType === 'fitting_followup' ? (
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-medium mb-4">Follow-up Assessment</h4>
                        <FormField
                          control={createForm.control}
                          name="diagnosis"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Status & Progress</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Patient progress, comfort level, any adjustments needed..." 
                                  className="h-24" 
                                  {...field} 
                                  value={field.value || ""} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ) : currentServiceType === 'consultation' && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-medium mb-4">Consultation Notes</h4>
                        <FormField
                          control={createForm.control}
                          name="diagnosis"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discussion & Recommendations</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Patient concerns, consultation findings, recommendations..." 
                                  className="h-24" 
                                  {...field} 
                                  value={field.value || ""} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Right Eye Prescription */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium mb-4">Right Eye (OD)</h4>
                      <div className="grid grid-cols-4 gap-4">
                        <FormField
                          control={createForm.control}
                          name="sphereRight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sphere (SPH)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.25" placeholder="-2.25" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="cylinderRight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cylinder (CYL)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.25" placeholder="-0.50" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="axisRight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Axis</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="180" 
                                  placeholder="90" 
                                  {...field} 
                                  value={field.value || ""} 
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="addRight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Add</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.25" placeholder="+1.00" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Left Eye Prescription */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-medium mb-4">Left Eye (OS)</h4>
                      <div className="grid grid-cols-4 gap-4">
                        <FormField
                          control={createForm.control}
                          name="sphereLeft"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sphere (SPH)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.25" placeholder="-2.00" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="cylinderLeft"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cylinder (CYL)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.25" placeholder="-0.75" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="axisLeft"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Axis</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="180" 
                                  placeholder="85" 
                                  {...field} 
                                  value={field.value || ""} 
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="addLeft"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Add</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.25" placeholder="+1.00" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Pupillary Distance */}
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={createForm.control}
                        name="pdDistance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PD Distance (mm)</FormLabel>
                            <FormControl>
                              <Input placeholder="62.0" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="pdNear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PD Near (mm)</FormLabel>
                            <FormControl>
                              <Input placeholder="58.0" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="pdFar"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PD Far (mm)</FormLabel>
                            <FormControl>
                              <Input placeholder="64.0" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="clinical" className="space-y-6">
                  <div className="space-y-6">
                    <FormField
                      control={createForm.control}
                      name="diagnosis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            Clinical Diagnosis 
                            <span className="text-red-500 font-bold">*</span>
                            <span className="text-xs text-gray-500">(Required for medical prescription)</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Patient diagnosis, findings, and clinical observations..." 
                              className={`h-32 ${!field.value ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="treatment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            Treatment Plan & Recommendations 
                            <span className="text-red-500 font-bold">*</span>
                            <span className="text-xs text-gray-500">(Required for complete prescription)</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Recommended treatment, medications, and follow-up instructions..." 
                              className={`h-32 ${!field.value ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="advice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient Advice & Instructions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Care instructions, lifestyle recommendations, and patient guidance..." 
                              className="h-24" 
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="nextFollowUp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Next Follow-up Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="additional" className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={createForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any additional instructions or notes..." 
                              className="h-32" 
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            Prescription Status 
                            <span className="text-red-500 font-bold">*</span>
                            <span className="text-xs text-gray-500">(Required)</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger className={`${!field.value ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
                                <SelectValue placeholder="Select prescription status..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="filled">Filled</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-between items-center pt-6 border-t">
                {/* Validation Status */}
                <div className="flex items-center gap-2 text-sm">
                  {(() => {
                    const requiredFields = ['patientId', 'prescriptionType', 'doctorId', 'diagnosis', 'treatment', 'status'];
                    const filledCount = requiredFields.filter(field => createForm.watch(field)).length;
                    const allFilled = filledCount === requiredFields.length;
                    
                    return allFilled ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Ready to submit</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-orange-600">
                        <Clock className="h-4 w-4" />
                        <span>{6 - filledCount} required field{6 - filledCount !== 1 ? 's' : ''} remaining</span>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createPrescriptionMutation.isPending || (() => {
                      const requiredFields = ['patientId', 'prescriptionType', 'doctorId', 'diagnosis', 'treatment', 'status'];
                      return !requiredFields.every(field => createForm.watch(field));
                    })()}
                    className={`${(() => {
                      const requiredFields = ['patientId', 'prescriptionType', 'doctorId', 'diagnosis', 'treatment', 'status'];
                      const allFilled = requiredFields.every(field => createForm.watch(field));
                      return allFilled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed';
                    })()} transition-colors duration-200`}
                  >
                    {createPrescriptionMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </div>
                    ) : (() => {
                      const requiredFields = ['patientId', 'prescriptionType', 'doctorId', 'diagnosis', 'treatment', 'status'];
                      const allFilled = requiredFields.every(field => createForm.watch(field));
                      return allFilled ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Create Prescription
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Complete Required Fields
                        </div>
                      );
                    })()}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* A4 Print-Ready Prescription View Dialog */}
      {viewPrescription && (
        <Dialog open={!!viewPrescription} onOpenChange={() => setViewPrescription(null)}>
          <DialogContent className="max-w-[210mm] max-h-[90vh] overflow-y-auto p-0">
            <div className="sticky top-0 bg-white z-10 p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Prescription Details</h3>
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
                  onClick={() => handleDownloadPDF(viewPrescription)}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendEmail(viewPrescription)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>
            
            {/* A4 Formatted Content */}
            <div className="w-[210mm] min-h-[297mm] bg-white p-8 print:p-6 print:shadow-none" style={{ fontSize: '12px', lineHeight: '1.4' }}>
              {/* Header */}
              <div className="border-b-2 border-blue-600 pb-4 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-blue-800">IeOMS</h1>
                    <p className="text-gray-600">Medical Prescription</p>
                    <p className="text-sm text-gray-500">Professional Eye Care Services</p>
                  </div>
                  <div className="text-right">
                    <div className="w-20 h-20 border border-gray-300 flex items-center justify-center">
                      <QRCode value={`prescription:${viewPrescription.prescriptionNumber}`} size={75} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Scan for verification</p>
                  </div>
                </div>
              </div>

              {/* Prescription Info */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">Prescription Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prescription No:</span>
                      <span className="font-mono font-semibold">{viewPrescription.prescriptionNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date Issued:</span>
                      <span>{format(new Date(viewPrescription.createdAt || ''), 'dd/MM/yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Type:</span>
                      <span className="capitalize">{viewPrescription.prescriptionType?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="capitalize font-semibold text-green-600">{viewPrescription.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prescribing Doctor:</span>
                      <span className="font-semibold">{getDoctorName(viewPrescription.doctorId)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">Patient Information</h3>
                  {(() => {
                    const patient = patients.find(p => p.id === viewPrescription.patientId);
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-semibold">{patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Patient ID:</span>
                          <span className="font-mono">{patient?.patientCode || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span>{patient?.phone || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="text-sm">{patient?.email || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gender:</span>
                          <span className="capitalize">{patient?.gender || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Blood Group:</span>
                          <span>{patient?.bloodGroup || 'Not specified'}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Vision Prescription */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-1">Vision Prescription</h3>
                
                {/* Visual Acuity */}
                {(viewPrescription.visualAcuityRightEye || viewPrescription.visualAcuityLeftEye) && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Visual Acuity</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <span className="text-gray-600">Right Eye (OD)</span>
                        <p className="font-mono text-lg">{viewPrescription.visualAcuityRightEye || 'N/A'}</p>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-600">Left Eye (OS)</span>
                        <p className="font-mono text-lg">{viewPrescription.visualAcuityLeftEye || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Prescription Table */}
                <div className="border border-gray-300 rounded">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left border-r border-gray-300">Eye</th>
                        <th className="p-2 text-center border-r border-gray-300">Sphere (SPH)</th>
                        <th className="p-2 text-center border-r border-gray-300">Cylinder (CYL)</th>
                        <th className="p-2 text-center border-r border-gray-300">Axis</th>
                        <th className="p-2 text-center">Add</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-300">
                        <td className="p-2 font-medium border-r border-gray-300">Right Eye (OD)</td>
                        <td className="p-2 text-center font-mono border-r border-gray-300">{viewPrescription.sphereRight || '-'}</td>
                        <td className="p-2 text-center font-mono border-r border-gray-300">{viewPrescription.cylinderRight || '-'}</td>
                        <td className="p-2 text-center font-mono border-r border-gray-300">{viewPrescription.axisRight || '-'}°</td>
                        <td className="p-2 text-center font-mono">{viewPrescription.addRight || '-'}</td>
                      </tr>
                      <tr className="border-t border-gray-300">
                        <td className="p-2 font-medium border-r border-gray-300">Left Eye (OS)</td>
                        <td className="p-2 text-center font-mono border-r border-gray-300">{viewPrescription.sphereLeft || '-'}</td>
                        <td className="p-2 text-center font-mono border-r border-gray-300">{viewPrescription.cylinderLeft || '-'}</td>
                        <td className="p-2 text-center font-mono border-r border-gray-300">{viewPrescription.axisLeft || '-'}°</td>
                        <td className="p-2 text-center font-mono">{viewPrescription.addLeft || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Pupillary Distance */}
                {(viewPrescription.pdDistance || viewPrescription.pdNear || viewPrescription.pdFar) && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Pupillary Distance (PD)</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <span className="text-gray-600 text-sm">Distance</span>
                        <p className="font-mono">{viewPrescription.pdDistance || 'N/A'} mm</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Near</span>
                        <p className="font-mono">{viewPrescription.pdNear || 'N/A'} mm</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Far</span>
                        <p className="font-mono">{viewPrescription.pdFar || 'N/A'} mm</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Clinical Information */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-1">Clinical Information</h3>
                
                {viewPrescription.diagnosis && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Diagnosis</h4>
                    <div className="bg-gray-50 p-3 rounded border">
                      <pre className="whitespace-pre-wrap text-sm">{viewPrescription.diagnosis}</pre>
                    </div>
                  </div>
                )}

                {viewPrescription.treatment && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Treatment Plan</h4>
                    <div className="bg-gray-50 p-3 rounded border">
                      <pre className="whitespace-pre-wrap text-sm">{viewPrescription.treatment}</pre>
                    </div>
                  </div>
                )}

                {viewPrescription.advice && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Patient Advice</h4>
                    <div className="bg-gray-50 p-3 rounded border">
                      <pre className="whitespace-pre-wrap text-sm">{viewPrescription.advice}</pre>
                    </div>
                  </div>
                )}

                {viewPrescription.notes && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Additional Notes</h4>
                    <div className="bg-gray-50 p-3 rounded border">
                      <pre className="whitespace-pre-wrap text-sm">{viewPrescription.notes}</pre>
                    </div>
                  </div>
                )}

                {viewPrescription.nextFollowUp && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Next Follow-up</h4>
                    <p className="text-sm">{format(new Date(viewPrescription.nextFollowUp), 'dd/MM/yyyy')}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-300 pt-4 mt-8">
                <div className="grid grid-cols-2 gap-8 text-xs text-gray-600">
                  <div>
                    <p className="font-semibold">IeOMS</p>
                    <p>Professional Eye Care Services</p>
                    <p>Phone: +1 (555) 123-4567</p>
                    <p>Email: info@optistorepro.com</p>
                  </div>
                  <div className="text-right">
                    <p>This prescription is valid for 12 months from the date of issue.</p>
                    <p>For any queries, please contact our office.</p>
                    <p className="mt-2 font-medium">Doctor's Signature: ________________________</p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </div>
  );
}