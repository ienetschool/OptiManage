import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Clock
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

export default function Prescriptions() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [viewPrescription, setViewPrescription] = useState<Prescription | null>(null);
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

  // Get both medical appointments and regular appointments
  const { data: medicalAppointments = [] } = useQuery<MedicalAppointment[]>({
    queryKey: ["/api/medical-appointments"],
  });

  const { data: regularAppointments = [] } = useQuery<any[]>({
    queryKey: ["/api/appointments"],
  });

  // Combine appointments that have doctors assigned
  const appointments = [
    ...medicalAppointments,
    ...regularAppointments.filter((apt: any) => apt.doctorId || apt.staffId)
  ];

  const form = useForm<InsertPrescription>({
    resolver: zodResolver(insertPrescriptionSchema),
    defaultValues: {
      prescriptionNumber: `RX-${Date.now().toString().slice(-6)}`,
      patientId: "",
      doctorId: "",
      appointmentId: "",
      storeId: "",
      prescriptionType: "glasses",
      visualAcuityRightEye: null,
      visualAcuityLeftEye: null,
      sphereRight: "0",
      cylinderRight: "0",
      axisRight: 0,
      addRight: "0",
      sphereLeft: "0",
      cylinderLeft: "0",
      axisLeft: 0,
      addLeft: "0",
      pdDistance: "0",
      diagnosis: null,
      treatment: null,
      advice: null,
      notes: null,
      status: "active",
    },
  });

  const createPrescriptionMutation = useMutation({
    mutationFn: async (data: InsertPrescription) => {
      await apiRequest("POST", "/api/prescriptions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      toast({
        title: "Success",
        description: "Prescription created successfully.",
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create prescription.",
        variant: "destructive",
      });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      await apiRequest("PUT", `/api/appointments/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/medical-appointments"] });
      toast({
        title: "Success",
        description: "Appointment updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update appointment.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPrescription) => {
    createPrescriptionMutation.mutate(data);
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patients.find(p => p.id === prescription.patientId)?.firstName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || prescription.status === selectedStatus;
    const matchesType = selectedType === "all" || prescription.prescriptionType === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Unknown Doctor';
  };

  const handleViewPrescription = (prescription: Prescription) => {
    setViewPrescription(prescription);
  };

  const handleDownloadPDF = async (prescription: Prescription) => {
    try {
      const response = await apiRequest("POST", `/api/prescriptions/${prescription.id}/pdf`);
      // Handle PDF download logic here
      toast({
        title: "PDF Generated",
        description: "Prescription PDF has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF.",
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async (prescription: Prescription) => {
    try {
      await apiRequest("POST", `/api/prescriptions/${prescription.id}/email`);
      toast({
        title: "Email Sent",
        description: "Prescription has been sent via email.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <main className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="appointments">Doctor Appointments</TabsTrigger>
            <TabsTrigger value="all">All Prescriptions</TabsTrigger>
            <TabsTrigger value="glasses">Glasses</TabsTrigger>
            <TabsTrigger value="contact-lenses">Contact Lenses</TabsTrigger>
            <TabsTrigger value="medication">Medication</TabsTrigger>
          </TabsList>

          {/* Doctor Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            {/* Appointments Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Today's Appointments</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {appointments.filter(apt => {
                          const today = new Date().toISOString().split('T')[0];
                          return apt.appointmentDate?.split('T')[0] === today;
                        }).length}
                      </p>
                      <p className="text-xs text-blue-600 flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        Scheduled today
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Calendar className="text-blue-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Pending Consultations</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {appointments.filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed' || apt.status === 'assigned_to_doctor').length}
                      </p>
                      <p className="text-xs text-amber-600">Awaiting consultation</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Stethoscope className="text-amber-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Prescriptions Created</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {prescriptions.filter(p => {
                          const today = new Date().toISOString().split('T')[0];
                          return p.createdAt && new Date(p.createdAt).toISOString().split('T')[0] === today;
                        }).length}
                      </p>
                      <p className="text-xs text-emerald-600">Today</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Pill className="text-emerald-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Completed Today</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {appointments.filter(apt => apt.status === 'completed' && 
                          (apt.appointmentDate ? apt.appointmentDate.split('T')[0] === new Date().toISOString().split('T')[0] : false)).length}
                      </p>
                      <p className="text-xs text-emerald-600">Consultations done</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="text-emerald-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Appointment Actions */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">My Appointments</h2>
              <div className="flex space-x-3">
                <Select defaultValue="today">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    // Reset form for new prescription
                    form.reset({
                      prescriptionNumber: `RX-${Date.now().toString().slice(-6)}`,
                      patientId: "",
                      doctorId: "",
                      appointmentId: "",
                      storeId: "",
                      prescriptionType: "glasses",
                      visualAcuityRightEye: null,
                      visualAcuityLeftEye: null,
                      sphereRight: "0",
                      cylinderRight: "0",
                      axisRight: 0,
                      addRight: "0",
                      sphereLeft: "0",
                      cylinderLeft: "0",
                      axisLeft: 0,
                      addLeft: "0",
                      pdDistance: "0",
                      diagnosis: null,
                      treatment: null,
                      advice: null,
                      notes: null,
                      status: "active",
                    });
                    setOpen(true);
                    toast({
                      title: "Quick Prescription",
                      description: "Opening new prescription form",
                    });
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Quick Prescription
                </Button>
              </div>
            </div>

            {/* Appointments List */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No appointments scheduled</h3>
                    <p className="text-slate-600">Check back later for new appointments.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => {
                      const patient = patients.find(p => p.id === appointment.patientId);
                      const doctor = doctors.find(d => d.id === (appointment.assignedDoctorId || appointment.doctorId || appointment.staffId));
                      
                      return (
                        <div key={appointment.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="font-semibold text-slate-900">
                                    {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                                  </h4>
                                  <Badge className={
                                    appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                    appointment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                    appointment.status === 'assigned_to_doctor' ? 'bg-purple-100 text-purple-800' :
                                    appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                  }>
                                    {appointment.status === 'assigned_to_doctor' ? 'Assigned to Doctor' : appointment.status}
                                  </Badge>
                                  {doctor && (
                                    <Badge variant="outline" className="text-xs">
                                      Dr. {doctor.firstName} {doctor.lastName}
                                    </Badge>
                                  )}
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm text-slate-600">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {appointment.appointmentDate ? format(new Date(appointment.appointmentDate), 'MMM dd, yyyy') : 'Date TBD'}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2" />
                                    {appointment.appointmentTime || appointment.time || 'Time TBD'}
                                  </div>
                                  <div className="flex items-center">
                                    <Stethoscope className="h-4 w-4 mr-2" />
                                    {appointment.appointmentType || appointment.service || 'General Consultation'}
                                  </div>
                                </div>
                                {(appointment.reason || appointment.notes) && (
                                  <p className="text-sm text-slate-600 mt-2">
                                    <strong>Reason:</strong> {appointment.reason || appointment.notes}
                                  </p>
                                )}
                                {appointment.doctorNotes && (
                                  <p className="text-sm text-blue-600 mt-1">
                                    <strong>Doctor Notes:</strong> {appointment.doctorNotes}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  // Set patient and appointment in prescription form
                                  form.setValue('patientId', appointment.patientId);
                                  form.setValue('appointmentId', appointment.id);
                                  form.setValue('doctorId', appointment.assignedDoctorId || appointment.doctorId || appointment.staffId || '');
                                  setOpen(true);
                                  toast({
                                    title: "Prescription Form",
                                    description: "Opening prescription form for patient",
                                  });
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Pill className="h-4 w-4 mr-2" />
                                Create Prescription
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const doctor = doctors.find(d => d.id === (appointment.assignedDoctorId || appointment.doctorId || appointment.staffId));
                                  const detailedInstructions = `
APPOINTMENT DETAILS REPORT
═══════════════════════════════════════

Patient Information:
• Name: ${patient?.firstName} ${patient?.lastName}
• Age: ${patient?.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() + ' years' : 'Not specified'}
• Gender: ${patient?.gender || 'Not specified'}
• Phone: ${patient?.phone || 'Not provided'}
• Email: ${patient?.email || 'Not provided'}

Appointment Information:
• Date: ${appointment.appointmentDate ? format(new Date(appointment.appointmentDate), 'MMMM dd, yyyy') : 'Date to be confirmed'}
• Time: ${appointment.appointmentTime || appointment.time || 'Time to be confirmed'}
• Type: ${appointment.appointmentType || appointment.service || 'General Consultation'}
• Status: ${appointment.status || 'scheduled'}
• Duration: ${appointment.duration || '30 minutes (estimated)'}

Doctor/Staff Details:
• Name: ${doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'To be assigned'}
• Position: ${doctor?.position || 'Medical Professional'}
• Department: ${doctor?.department || 'General'}

Chief Complaint:
• Reason for Visit: ${appointment.reason || appointment.notes || 'General medical consultation and examination'}

Clinical Notes:
• Doctor Notes: ${appointment.doctorNotes || 'No additional notes recorded yet'}
• Appointment ID: ${appointment.id}
• Scheduled by: System

Medical History Summary:
• Previous appointments with this patient
• Any recurring conditions or treatments
• Medication allergies or special considerations

Follow-up Instructions:
• Post-appointment care instructions will be provided
• Next appointment recommendations if needed
• Prescription details will be recorded separately

═══════════════════════════════════════
Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
OptiStore Pro Medical Center - Comprehensive Patient Care
                                  `;
                                  
                                  setViewPrescription({
                                    id: appointment.id,
                                    prescriptionNumber: `APT-${appointment.id.slice(-8)}`,
                                    patientId: appointment.patientId,
                                    appointmentId: appointment.id,
                                    doctorId: appointment.assignedDoctorId || appointment.doctorId || appointment.staffId,
                                    storeId: null,
                                    prescriptionDate: new Date(),
                                    prescriptionType: 'appointment_details',
                                    diagnosis: detailedInstructions,
                                    treatment: appointment.treatmentPlan || null,
                                    advice: appointment.followUpInstructions || null,
                                    notes: appointment.notes || null,
                                    status: 'active',
                                    visualAcuityRightEye: null,
                                    visualAcuityLeftEye: null,
                                    sphereRight: null,
                                    cylinderRight: null,
                                    axisRight: null,
                                    addRight: null,
                                    sphereLeft: null,
                                    cylinderLeft: null,
                                    axisLeft: null,
                                    addLeft: null,
                                    pdDistance: null,
                                    pdNear: null,
                                    pdFar: null,
                                    nextFollowUp: null,
                                    customFields: null,
                                    qrCode: null,
                                    createdAt: new Date(),
                                    updatedAt: new Date()
                                  });
                                  
                                  toast({
                                    title: "Appointment Details",
                                    description: `Comprehensive details loaded for ${patient?.firstName} ${patient?.lastName}`,
                                  });
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Prescriptions</p>
                    <p className="text-2xl font-bold text-slate-900">{prescriptions.length}</p>
                    <p className="text-xs text-emerald-600 flex items-center mt-1">
                      <Activity className="h-3 w-3 mr-1" />
                      Active prescriptions
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="text-blue-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Glasses Prescriptions</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {prescriptions.filter(p => p.prescriptionType === 'glasses').length}
                    </p>
                    <p className="text-xs text-slate-500">Most common type</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Eye className="text-purple-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Pending Follow-ups</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {prescriptions.filter(p => p.nextFollowUp && new Date(p.nextFollowUp) <= new Date()).length}
                    </p>
                    <p className="text-xs text-amber-600 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Requires attention
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Calendar className="text-amber-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">This Month</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {prescriptions.filter(p => {
                        if (!p.createdAt) return false;
                        const date = new Date(p.createdAt);
                        const now = new Date();
                        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                      }).length}
                    </p>
                    <p className="text-xs text-emerald-600">New prescriptions</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="text-emerald-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search prescriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
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

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="glasses">Glasses</SelectItem>
                  <SelectItem value="contact_lenses">Contact Lenses</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  New Prescription
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Prescription</DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="measurements">Measurements</TabsTrigger>
                        <TabsTrigger value="medical">Medical Details</TabsTrigger>
                        <TabsTrigger value="notes">Notes & Follow-up</TabsTrigger>
                      </TabsList>

                      <TabsContent value="basic" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="prescriptionNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Prescription Number</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="prescriptionType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Prescription Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="glasses">👓 Glasses</SelectItem>
                                    <SelectItem value="contact_lenses">👁️ Contact Lenses</SelectItem>
                                    <SelectItem value="medication">💊 Medication</SelectItem>
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
                            name="patientId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Patient</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select patient..." />
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
                            name="doctorId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Doctor</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select doctor..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {doctors.filter(d => d.position === 'Doctor' || d.role === 'doctor').map((doctor) => (
                                      <SelectItem key={doctor.id} value={doctor.id}>
                                        Dr. {doctor.firstName} {doctor.lastName} ({doctor.department})
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

                      <TabsContent value="measurements" className="space-y-4">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="font-semibold text-slate-900">Visual Acuity</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="visualAcuityRightEye"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Right Eye</FormLabel>
                                    <FormControl>
                                      <Input placeholder="20/20" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="visualAcuityLeftEye"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Left Eye</FormLabel>
                                    <FormControl>
                                      <Input placeholder="20/20" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-semibold text-slate-900">Pupillary Distance</h4>
                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="pdDistance"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Distance PD</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.1" 
                                        placeholder="62.0"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="pdNear"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Near PD</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.1" 
                                        placeholder="58.0"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="pdFar"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Far PD</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.1" 
                                        placeholder="64.0"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="font-semibold text-slate-900">Right Eye (OD)</h4>
                            <div className="grid grid-cols-4 gap-4">
                              <FormField
                                control={form.control}
                                name="sphereRight"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Sphere (SPH)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.25" 
                                        placeholder="-2.00"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="cylinderRight"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Cylinder (CYL)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.25" 
                                        placeholder="-0.50"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="axisRight"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Axis</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="0" 
                                        max="180" 
                                        placeholder="90"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="addRight"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Add</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.25" 
                                        placeholder="+2.00"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-semibold text-slate-900">Left Eye (OS)</h4>
                            <div className="grid grid-cols-4 gap-4">
                              <FormField
                                control={form.control}
                                name="sphereLeft"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Sphere (SPH)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.25" 
                                        placeholder="-2.00"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="cylinderLeft"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Cylinder (CYL)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.25" 
                                        placeholder="-0.50"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="axisLeft"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Axis</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="0" 
                                        max="180" 
                                        placeholder="90"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="addLeft"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Add</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.25" 
                                        placeholder="+2.00"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="medical" className="space-y-4">
                        <FormField
                          control={form.control}
                          name="diagnosis"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Diagnosis</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter medical diagnosis..."
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="treatment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Treatment Plan</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter treatment recommendations..."
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="advice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Medical Advice</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter medical advice and recommendations..."
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      <TabsContent value="notes" className="space-y-4">
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Notes</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter any additional notes or observations..."
                                  className="min-h-[120px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="nextFollowUp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Next Follow-up Date</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field}
                                  value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>
                    
                    <div className="flex justify-end space-x-2 pt-4 border-t">
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
          </div>

          {/* Prescriptions Table */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Prescription Records</CardTitle>
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
              ) : filteredPrescriptions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No prescriptions found</h3>
                  <p className="text-slate-600 mb-6">
                    {searchTerm ? "Try adjusting your search criteria." : "Create your first prescription to get started."}
                  </p>
                  {!searchTerm && (
                    <Button 
                      onClick={() => setOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
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
                        <TableHead>Patient</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrescriptions.map((prescription) => (
                        <TableRow key={prescription.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <QrCode className="h-4 w-4 text-slate-400" />
                              <span className="font-mono text-sm">{prescription.prescriptionNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-slate-400" />
                              <span>{getPatientName(prescription.patientId)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Stethoscope className="h-4 w-4 text-slate-400" />
                              <span>{getDoctorName(prescription.doctorId)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {prescription.prescriptionType.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {format(new Date(prescription.createdAt), 'MMM dd, yyyy')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                prescription.status === 'active' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : prescription.status === 'filled'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {prescription.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewPrescription(prescription)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadPDF(prescription)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendEmail(prescription)}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
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
          </TabsContent>

          <TabsContent value="glasses" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-slate-600">Glasses prescriptions will be displayed here.</p>
            </div>
          </TabsContent>

          <TabsContent value="contact-lenses" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-slate-600">Contact lens prescriptions will be displayed here.</p>
            </div>
          </TabsContent>

          <TabsContent value="medication" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-slate-600">Medication prescriptions will be displayed here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Prescription View Dialog */}
      {viewPrescription && (
        <Dialog open={!!viewPrescription} onOpenChange={() => setViewPrescription(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Patient</Label>
                  <p className="text-lg font-semibold">{getPatientName(viewPrescription.patientId)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Doctor</Label>
                  <p className="text-lg font-semibold">{getDoctorName(viewPrescription.doctorId)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Date</Label>
                  <p>{format(new Date(viewPrescription.createdAt), 'MMMM dd, yyyy')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Type</Label>
                  <p className="capitalize">{viewPrescription.prescriptionType.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Visual Measurements */}
              {(viewPrescription.sphereRight || viewPrescription.sphereLeft) && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-4">Optical Measurements</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="border border-slate-300 p-2 text-left">Eye</th>
                          <th className="border border-slate-300 p-2">Sphere</th>
                          <th className="border border-slate-300 p-2">Cylinder</th>
                          <th className="border border-slate-300 p-2">Axis</th>
                          <th className="border border-slate-300 p-2">Add</th>
                          <th className="border border-slate-300 p-2">Visual Acuity</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-300 p-2 font-medium">Right (OD)</td>
                          <td className="border border-slate-300 p-2 text-center">{viewPrescription.sphereRight || '-'}</td>
                          <td className="border border-slate-300 p-2 text-center">{viewPrescription.cylinderRight || '-'}</td>
                          <td className="border border-slate-300 p-2 text-center">{viewPrescription.axisRight || '-'}</td>
                          <td className="border border-slate-300 p-2 text-center">{viewPrescription.addRight || '-'}</td>
                          <td className="border border-slate-300 p-2 text-center">{viewPrescription.visualAcuityRightEye || '-'}</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-2 font-medium">Left (OS)</td>
                          <td className="border border-slate-300 p-2 text-center">{viewPrescription.sphereLeft || '-'}</td>
                          <td className="border border-slate-300 p-2 text-center">{viewPrescription.cylinderLeft || '-'}</td>
                          <td className="border border-slate-300 p-2 text-center">{viewPrescription.axisLeft || '-'}</td>
                          <td className="border border-slate-300 p-2 text-center">{viewPrescription.addLeft || '-'}</td>
                          <td className="border border-slate-300 p-2 text-center">{viewPrescription.visualAcuityLeftEye || '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  {viewPrescription.pdDistance && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-slate-600">Pupillary Distance (PD)</Label>
                      <p>Distance: {viewPrescription.pdDistance}mm {viewPrescription.pdNear && `, Near: ${viewPrescription.pdNear}mm`} {viewPrescription.pdFar && `, Far: ${viewPrescription.pdFar}mm`}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Medical Information */}
              {viewPrescription.diagnosis && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Diagnosis</Label>
                  <p className="mt-1 p-3 bg-slate-50 rounded-md">{viewPrescription.diagnosis}</p>
                </div>
              )}

              {viewPrescription.treatment && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Treatment</Label>
                  <p className="mt-1 p-3 bg-slate-50 rounded-md">{viewPrescription.treatment}</p>
                </div>
              )}

              {viewPrescription.advice && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Medical Advice</Label>
                  <p className="mt-1 p-3 bg-slate-50 rounded-md">{viewPrescription.advice}</p>
                </div>
              )}

              {viewPrescription.notes && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Notes</Label>
                  <p className="mt-1 p-3 bg-slate-50 rounded-md">{viewPrescription.notes}</p>
                </div>
              )}

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="text-center">
                  <Label className="text-sm font-medium text-slate-600">Verification QR Code</Label>
                  <div className="mt-2 p-4 bg-white border rounded-lg">
                    <QRCode
                      value={`${window.location.origin}/verify/prescription/${viewPrescription.id}`}
                      size={150}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Scan to verify prescription</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}