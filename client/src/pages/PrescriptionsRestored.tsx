import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  User,
  Stethoscope,
  Pill,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  Share,
  Mail,
  FileDown,
  Users,
  Zap
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  insertPrescriptionSchema, 
  type Prescription, 
  type InsertPrescription, 
  type Patient, 
  type Doctor,
  type MedicalAppointment 
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

export default function Prescriptions() {
  const [open, setOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewPrescription, setViewPrescription] = useState<Prescription | null>(null);
  const [serviceType, setServiceType] = useState("eye_examination");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: prescriptions = [], isLoading } = useQuery<Prescription[]>({
    queryKey: ["/api/prescriptions"],
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: doctors = [] } = useQuery<any[]>({
    queryKey: ["/api/staff"],
  });

  const { data: medicalAppointments = [] } = useQuery<MedicalAppointment[]>({
    queryKey: ["/api/medical-appointments"],
  });

  const { data: regularAppointments = [] } = useQuery<any[]>({
    queryKey: ["/api/appointments"],
  });

  const appointments = [
    ...medicalAppointments,
    ...regularAppointments.filter((apt: any) => apt.doctorId || apt.staffId)
  ];

  // Full prescription form
  const form = useForm<InsertPrescription>({
    resolver: zodResolver(insertPrescriptionSchema),
    defaultValues: {
      prescriptionNumber: `RX-${Date.now().toString().slice(-6)}`,
      patientId: "",
      doctorId: "",
      appointmentId: "",
      storeId: "",
      prescriptionType: "eye_examination",
      visualAcuityRightEye: "",
      visualAcuityLeftEye: "",
      sphereRight: "",
      cylinderRight: "",
      axisRight: 0,
      addRight: "",
      sphereLeft: "",
      cylinderLeft: "",
      axisLeft: 0,
      addLeft: "",
      pdDistance: "",
      pdNear: "",
      pdFar: "",
      diagnosis: "",
      treatment: "",
      advice: "",
      notes: "",
      status: "active",
      nextFollowUp: null,
    },
  });

  // Quick prescription form
  const quickForm = useForm<InsertPrescription>({
    resolver: zodResolver(insertPrescriptionSchema),
    defaultValues: {
      prescriptionNumber: `QRX-${Date.now().toString().slice(-6)}`,
      patientId: "",
      prescriptionType: "eye_examination",
      diagnosis: "",
      treatment: "",
      status: "active",
    },
  });

  const createPrescriptionMutation = useMutation({
    mutationFn: async (data: InsertPrescription) => {
      return await apiRequest('/api/prescriptions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions'] });
      setOpen(false);
      setQuickOpen(false);
      form.reset();
      quickForm.reset();
      setSelectedPatient(null);
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

  const onSubmit = async (data: InsertPrescription) => {
    // Ensure we have the required storeId
    const prescriptionData = {
      ...data,
      storeId: data.storeId || "5ff902af-3849-4ea6-945b-4d49175d6638"
    };
    createPrescriptionMutation.mutate(prescriptionData);
  };

  const onQuickSubmit = async (data: InsertPrescription) => {
    // Ensure we have the required storeId
    const prescriptionData = {
      ...data,
      storeId: data.storeId || "5ff902af-3849-4ea6-945b-4d49175d6638"
    };
    createPrescriptionMutation.mutate(prescriptionData);
  };

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const matchesSearch = prescription.prescriptionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getPatientName(prescription.patientId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || prescription.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient";
  };

  const getDoctorName = (doctorId: string | null) => {
    if (!doctorId) return "No Doctor Assigned";
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Unknown Doctor";
  };

  const handleDownloadPDF = (prescription: Prescription) => {
    // Create PDF content
    const pdfContent = `
PRESCRIPTION REPORT
===================

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

    // Create and download PDF
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
OptiStore Pro Team`;

    const mailtoLink = `mailto:${patient?.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);

    toast({
      title: "Email Client Opened",
      description: `Email prepared for ${patient?.email || 'patient'}`,
    });
  };

  const handleViewDetails = (prescription: Prescription) => {
    setViewPrescription(prescription);
    toast({
      title: "Prescription Details",
      description: "Viewing prescription details",
    });
  };

  const handleEditPrescription = (prescription: Prescription) => {
    form.reset({
      prescriptionNumber: prescription.prescriptionNumber,
      patientId: prescription.patientId,
      doctorId: prescription.doctorId || "",
      appointmentId: prescription.appointmentId || "",
      storeId: prescription.storeId || "",
      prescriptionType: prescription.prescriptionType || "eye_examination",
      visualAcuityRightEye: prescription.visualAcuityRightEye || "",
      visualAcuityLeftEye: prescription.visualAcuityLeftEye || "",
      sphereRight: prescription.sphereRight || "",
      cylinderRight: prescription.cylinderRight || "",
      axisRight: prescription.axisRight || 0,
      addRight: prescription.addRight || "",
      sphereLeft: prescription.sphereLeft || "",
      cylinderLeft: prescription.cylinderLeft || "",
      axisLeft: prescription.axisLeft || 0,
      addLeft: prescription.addLeft || "",
      pdDistance: prescription.pdDistance || "",
      pdNear: prescription.pdNear || "",
      pdFar: prescription.pdFar || "",
      diagnosis: prescription.diagnosis || "",
      treatment: prescription.treatment || "",
      advice: prescription.advice || "",
      notes: prescription.notes || "",
      status: prescription.status || "active",
    });
    
    const patient = patients.find(p => p.id === prescription.patientId);
    setSelectedPatient(patient || null);
    setServiceType(prescription.prescriptionType || "eye_examination");
    setOpen(true);
    
    toast({
      title: "Edit Prescription",
      description: "Editing prescription details",
    });
  };

  const handleDeletePrescription = (prescription: Prescription) => {
    toast({
      title: "Delete Prescription",
      description: "This feature will be implemented soon",
      variant: "destructive",
    });
  };

  const handleSharePrescription = (prescription: Prescription) => {
    const shareUrl = `${window.location.origin}/prescriptions/${prescription.id}`;
    const shareText = `Prescription ${prescription.prescriptionNumber} - ${getPatientName(prescription.patientId)}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Prescription Details',
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
        toast({
          title: "Link Copied",
          description: "Prescription link copied to clipboard",
        });
      }).catch(() => {
        toast({
          title: "Share Link",
          description: shareUrl,
        });
      });
    }
  };

  const handleGenerateQR = (prescription: Prescription) => {
    setViewPrescription(prescription);
    toast({
      title: "QR Code Generated",
      description: "QR code for prescription access",
    });
  };

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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Tabs */}
      <div className="flex items-center gap-8 border-b">
        <div className="flex items-center gap-2 pb-4 border-b-2 border-blue-500">
          <Users className="h-4 w-4" />
          <span className="font-medium">Patients ({patients.length})</span>
        </div>
        <div className="flex items-center gap-2 pb-4 text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Appointments ({appointments.length})</span>
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
            <Button 
              onClick={() => setOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Prescription
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search prescriptions..."
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Prescriptions Table */}
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
                  <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700">
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
                                <DropdownMenuItem onClick={() => handleEditPrescription(prescription)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
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
                                <DropdownMenuItem onClick={() => handleGenerateQR(prescription)}>
                                  <QrCode className="mr-2 h-4 w-4" />
                                  QR Code
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSharePrescription(prescription)}>
                                  <Share className="mr-2 h-4 w-4" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeletePrescription(prescription)}
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
      </div>

      {/* Quick Prescription Dialog */}
      <Dialog open={quickOpen} onOpenChange={setQuickOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Prescription</DialogTitle>
          </DialogHeader>
          
          <Form {...quickForm}>
            <form onSubmit={quickForm.handleSubmit(onQuickSubmit)} className="space-y-4">
              <FormField
                control={quickForm.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Patient</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose patient..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.firstName} {patient.lastName}
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
                    <FormLabel>Service Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="eye_examination">Eye Examination</SelectItem>
                        <SelectItem value="contact_lens">Contact Lens</SelectItem>
                        <SelectItem value="fitting_glasses">Glasses Fitting</SelectItem>
                        <SelectItem value="fitting_followup">Follow-up</SelectItem>
                        <SelectItem value="visit_consultation">Consultation</SelectItem>
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
                    <FormLabel>Quick Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief diagnosis or notes..." 
                        className="h-20" 
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
                  disabled={createPrescriptionMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createPrescriptionMutation.isPending ? "Creating..." : "Create Quick Prescription"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Full Prescription Dialog with Tabs */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Prescription</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="patient-info" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="patient-info">Patient Info</TabsTrigger>
                  <TabsTrigger value="vision">Vision Prescription</TabsTrigger>
                  <TabsTrigger value="clinical">Clinical Details</TabsTrigger>
                  <TabsTrigger value="additional">Additional Info</TabsTrigger>
                </TabsList>

                <TabsContent value="patient-info" className="space-y-6">
                  {/* Patient & Appointment Info Section */}
                  <div className="bg-slate-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Patient & Appointment Info</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Patient:</Label>
                        <p className="text-base font-medium">{selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : 'Select patient...'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Service:</Label>
                        <p className="text-base font-medium">{serviceType.replace('_', '-')}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Date:</Label>
                        <p className="text-base">{format(new Date(), 'dd/MM/yyyy')}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Prescription Code:</Label>
                        <p className="text-base font-mono">{form.watch('prescriptionNumber')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Patient Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Patient</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            const patient = patients.find(p => p.id === value);
                            setSelectedPatient(patient || null);
                          }} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
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
                      control={form.control}
                      name="prescriptionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            setServiceType(value);
                          }} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select service..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="eye_examination">Eye Examination</SelectItem>
                              <SelectItem value="contact_lens">Contact Lens</SelectItem>
                              <SelectItem value="fitting_glasses">Glasses Fitting</SelectItem>
                              <SelectItem value="fitting_followup">Fitting Follow-up</SelectItem>
                              <SelectItem value="visit_consultation">Visit Consultation</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="doctorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prescribing Doctor</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select doctor..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {doctors.map((doctor) => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                Dr. {doctor.firstName} {doctor.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="vision" className="space-y-6">
                  {/* Vision Prescription Fields */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Vision Prescription</h3>
                    
                    {/* Right Eye */}
                    <div>
                      <h4 className="font-medium text-slate-700 mb-3">Right Eye</h4>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-700 block mb-2">Sphere</Label>
                          <FormField
                            control={form.control}
                            name="sphereRight"
                            render={({ field }) => (
                              <Input 
                                type="number" 
                                step="0.25" 
                                placeholder="-2.25" 
                                {...field} 
                                value={field.value || ""} 
                              />
                            )}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700 block mb-2">Cylinder</Label>
                          <FormField
                            control={form.control}
                            name="cylinderRight"
                            render={({ field }) => (
                              <Input 
                                type="number" 
                                step="0.25" 
                                placeholder="-0.50" 
                                {...field} 
                                value={field.value || ""} 
                              />
                            )}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700 block mb-2">Axis</Label>
                          <FormField
                            control={form.control}
                            name="axisRight"
                            render={({ field }) => (
                              <Input 
                                type="number" 
                                min="0" 
                                max="180" 
                                placeholder="90°" 
                                {...field} 
                                value={field.value || 0} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                              />
                            )}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700 block mb-2">Add</Label>
                          <FormField
                            control={form.control}
                            name="addRight"
                            render={({ field }) => (
                              <Input 
                                type="number" 
                                step="0.25" 
                                placeholder="+1.00" 
                                {...field} 
                                value={field.value || ""} 
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Left Eye */}
                    <div>
                      <h4 className="font-medium text-slate-700 mb-3">Left Eye</h4>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-700 block mb-2">Sphere</Label>
                          <FormField
                            control={form.control}
                            name="sphereLeft"
                            render={({ field }) => (
                              <Input 
                                type="number" 
                                step="0.25" 
                                placeholder="-2.00" 
                                {...field} 
                                value={field.value || ""} 
                              />
                            )}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700 block mb-2">Cylinder</Label>
                          <FormField
                            control={form.control}
                            name="cylinderLeft"
                            render={({ field }) => (
                              <Input 
                                type="number" 
                                step="0.25" 
                                placeholder="-0.75" 
                                {...field} 
                                value={field.value || ""} 
                              />
                            )}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700 block mb-2">Axis</Label>
                          <FormField
                            control={form.control}
                            name="axisLeft"
                            render={({ field }) => (
                              <Input 
                                type="number" 
                                min="0" 
                                max="180" 
                                placeholder="85°" 
                                {...field} 
                                value={field.value || 0} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                              />
                            )}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700 block mb-2">Add</Label>
                          <FormField
                            control={form.control}
                            name="addLeft"
                            render={({ field }) => (
                              <Input 
                                type="number" 
                                step="0.25" 
                                placeholder="+1.00" 
                                {...field} 
                                value={field.value || ""} 
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Vision Fields */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-700 block mb-2">Pupillary Distance</Label>
                        <FormField
                          control={form.control}
                          name="pdDistance"
                          render={({ field }) => (
                            <Input 
                              type="number" 
                              step="0.5" 
                              placeholder="62 mm" 
                              {...field} 
                              value={field.value || ""} 
                            />
                          )}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700 block mb-2">Visual Acuity (Right)</Label>
                        <FormField
                          control={form.control}
                          name="visualAcuityRightEye"
                          render={({ field }) => (
                            <Input 
                              placeholder="20/20" 
                              {...field} 
                              value={field.value || ""} 
                            />
                          )}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700 block mb-2">Visual Acuity (Left)</Label>
                        <FormField
                          control={form.control}
                          name="visualAcuityLeftEye"
                          render={({ field }) => (
                            <Input 
                              placeholder="20/20" 
                              {...field} 
                              value={field.value || ""} 
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="clinical" className="space-y-6">
                  {/* Clinical Fields */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-700 block mb-2">Diagnosis</Label>
                      <FormField
                        control={form.control}
                        name="diagnosis"
                        render={({ field }) => (
                          <Textarea 
                            placeholder="Patient diagnosis and findings..." 
                            className="min-h-[120px]" 
                            {...field} 
                            value={field.value || ""} 
                          />
                        )}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-slate-700 block mb-2">Treatment Plan</Label>
                      <FormField
                        control={form.control}
                        name="treatment"
                        render={({ field }) => (
                          <Textarea 
                            placeholder="Recommended treatment and follow-up..." 
                            className="min-h-[120px]" 
                            {...field} 
                            value={field.value || ""} 
                          />
                        )}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-slate-700 block mb-2">Patient Advice</Label>
                      <FormField
                        control={form.control}
                        name="advice"
                        render={({ field }) => (
                          <Textarea 
                            placeholder="Instructions and advice for patient..." 
                            className="min-h-[120px]" 
                            {...field} 
                            value={field.value || ""} 
                          />
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="additional" className="space-y-6">
                  {/* Additional Information */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-700 block mb-2">Additional Notes</Label>
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <Textarea 
                            placeholder="Any additional instructions or notes..." 
                            className="min-h-[120px]" 
                            {...field} 
                            value={field.value || ""} 
                          />
                        )}
                      />
                    </div>

                    {/* Follow-up Date & Status */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-slate-700 block mb-2">Follow-up Date</Label>
                        <FormField
                          control={form.control}
                          name="nextFollowUp"
                          render={({ field }) => (
                            <Input 
                              type="date" 
                              {...field} 
                              value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''} 
                              onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)} 
                            />
                          )}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700 block mb-2">Prescription Status</Label>
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="filled">Filled</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPrescriptionMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createPrescriptionMutation.isPending ? "Creating..." : "Create Prescription"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Enhanced Prescription View Dialog */}
      {viewPrescription && (
        <Dialog open={!!viewPrescription} onOpenChange={() => setViewPrescription(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Prescription Details - {viewPrescription.prescriptionNumber}</span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPDF(viewPrescription)}
                  >
                    <Download className="h-4 w-4 mr-2" />
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateQR(viewPrescription)}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSharePrescription(viewPrescription)}
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="patient">Patient Details</TabsTrigger>
                <TabsTrigger value="vision">Vision Data</TabsTrigger>
                <TabsTrigger value="clinical">Clinical Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h4 className="font-semibold text-slate-900 mb-3">Prescription Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Number:</span>
                        <span className="font-mono">{viewPrescription.prescriptionNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Date:</span>
                        <span>{format(new Date(viewPrescription.createdAt || ''), 'MMMM dd, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Service:</span>
                        <Badge variant="outline" className="capitalize">
                          {viewPrescription.prescriptionType?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Status:</span>
                        <Badge className={
                          viewPrescription.status === 'active' ? 'bg-green-100 text-green-800' :
                          viewPrescription.status === 'filled' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {viewPrescription.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-semibold text-slate-900 mb-3">Medical Team</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Patient:</span>
                        <span className="font-semibold">{getPatientName(viewPrescription.patientId)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Doctor:</span>
                        <span className="font-semibold">{getDoctorName(viewPrescription.doctorId)}</span>
                      </div>
                      {viewPrescription.nextFollowUp && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Follow-up:</span>
                          <span>{format(new Date(viewPrescription.nextFollowUp), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                <div className="flex justify-center">
                  <Card className="p-6">
                    <h4 className="font-semibold text-center mb-4">QR Code</h4>
                    <QRCode value={`prescription:${viewPrescription.prescriptionNumber}`} size={150} />
                    <p className="text-xs text-slate-500 text-center mt-2">Scan for quick access</p>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="patient" className="space-y-6">
                {(() => {
                  const patient = patients.find(p => p.id === viewPrescription.patientId);
                  return (
                    <div className="grid grid-cols-2 gap-6">
                      <Card className="p-4">
                        <h4 className="font-semibold text-slate-900 mb-3">Patient Information</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-lg font-medium text-blue-600">
                                {patient ? `${patient.firstName?.[0]}${patient.lastName?.[0]}` : 'UN'}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold">{patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}</p>
                              <p className="text-sm text-slate-600">{patient?.patientCode || 'No code'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="text-slate-600">Email</Label>
                              <p>{patient?.email || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-slate-600">Phone</Label>
                              <p>{patient?.phone || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-slate-600">Gender</Label>
                              <p>{patient?.gender || 'Not specified'}</p>
                            </div>
                            <div>
                              <Label className="text-slate-600">Blood Group</Label>
                              <p>{patient?.bloodGroup || 'Not specified'}</p>
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-semibold text-slate-900 mb-3">Appointment Details</h4>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-slate-600">Appointment ID</Label>
                            <p className="font-mono text-sm">{viewPrescription.appointmentId || 'Not linked'}</p>
                          </div>
                          <div>
                            <Label className="text-slate-600">Service Type</Label>
                            <p className="capitalize">{viewPrescription.prescriptionType?.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <Label className="text-slate-600">Prescription Date</Label>
                            <p>{format(new Date(viewPrescription.prescriptionDate || viewPrescription.createdAt || ''), 'EEEE, MMMM dd, yyyy')}</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })()}
              </TabsContent>

              <TabsContent value="vision" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h4 className="font-semibold text-slate-900 mb-3">Right Eye</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Sphere:</span>
                        <span className="font-mono">{viewPrescription.sphereRight || 'Not recorded'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Cylinder:</span>
                        <span className="font-mono">{viewPrescription.cylinderRight || 'Not recorded'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Axis:</span>
                        <span className="font-mono">{viewPrescription.axisRight ? `${viewPrescription.axisRight}°` : 'Not recorded'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Add:</span>
                        <span className="font-mono">{viewPrescription.addRight || 'Not recorded'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Visual Acuity:</span>
                        <span className="font-mono">{viewPrescription.visualAcuityRightEye || 'Not recorded'}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-semibold text-slate-900 mb-3">Left Eye</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Sphere:</span>
                        <span className="font-mono">{viewPrescription.sphereLeft || 'Not recorded'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Cylinder:</span>
                        <span className="font-mono">{viewPrescription.cylinderLeft || 'Not recorded'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Axis:</span>
                        <span className="font-mono">{viewPrescription.axisLeft ? `${viewPrescription.axisLeft}°` : 'Not recorded'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Add:</span>
                        <span className="font-mono">{viewPrescription.addLeft || 'Not recorded'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Visual Acuity:</span>
                        <span className="font-mono">{viewPrescription.visualAcuityLeftEye || 'Not recorded'}</span>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-4">
                  <h4 className="font-semibold text-slate-900 mb-3">Additional Measurements</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-600">Pupillary Distance</Label>
                      <p className="font-mono">{viewPrescription.pdDistance ? `${viewPrescription.pdDistance} mm` : 'Not recorded'}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600">PD Near</Label>
                      <p className="font-mono">{viewPrescription.pdNear ? `${viewPrescription.pdNear} mm` : 'Not recorded'}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600">PD Far</Label>
                      <p className="font-mono">{viewPrescription.pdFar ? `${viewPrescription.pdFar} mm` : 'Not recorded'}</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="clinical" className="space-y-6">
                <div className="space-y-4">
                  {viewPrescription.diagnosis && (
                    <Card className="p-4">
                      <h4 className="font-semibold text-slate-900 mb-3">Diagnosis</h4>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">{viewPrescription.diagnosis}</pre>
                      </div>
                    </Card>
                  )}

                  {viewPrescription.treatment && (
                    <Card className="p-4">
                      <h4 className="font-semibold text-slate-900 mb-3">Treatment Plan</h4>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">{viewPrescription.treatment}</pre>
                      </div>
                    </Card>
                  )}

                  {viewPrescription.advice && (
                    <Card className="p-4">
                      <h4 className="font-semibold text-slate-900 mb-3">Patient Advice</h4>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">{viewPrescription.advice}</pre>
                      </div>
                    </Card>
                  )}

                  {viewPrescription.notes && (
                    <Card className="p-4">
                      <h4 className="font-semibold text-slate-900 mb-3">Additional Notes</h4>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">{viewPrescription.notes}</pre>
                      </div>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}