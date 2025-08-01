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
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  Share,
  Mail,
  FileDown
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
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
      form.reset();
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
    createPrescriptionMutation.mutate(data);
  };

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const matchesSearch = prescription.prescriptionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getPatientName(prescription.patientId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || prescription.status === selectedStatus;
    const matchesType = selectedType === "all" || prescription.prescriptionType === selectedType;
    return matchesSearch && matchesStatus && matchesType;
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
    toast({
      title: "PDF Download",
      description: "Downloading prescription PDF...",
    });
  };

  const handleSendEmail = (prescription: Prescription) => {
    toast({
      title: "Email Sent",
      description: "Prescription sent via email",
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
    // Pre-populate form with prescription data
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
    toast({
      title: "Share Prescription",
      description: "Prescription link copied to clipboard",
    });
  };

  const handleGenerateQR = (prescription: Prescription) => {
    setViewPrescription(prescription);
    toast({
      title: "QR Code Generated",
      description: "QR code for prescription access",
    });
  };

  const renderServiceSpecificFields = () => {
    return (
      <div className="space-y-6">
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
              <Label className="text-sm font-medium text-slate-700">Appointment ID:</Label>
              <p className="text-base text-slate-600">{form.watch('appointmentId') || 'Not assigned'}</p>
            </div>
          </div>
        </div>

        {/* Prescription Code */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-slate-700 block mb-2">Prescription Code</Label>
            <Input 
              value={form.watch('prescriptionNumber')} 
              onChange={(e) => form.setValue('prescriptionNumber', e.target.value)}
              className="font-mono"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 block mb-2">Doctor</Label>
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select prescribing doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.firstName} {doctor.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Vision Prescription Section */}
        {(serviceType === 'eye_examination' || serviceType === 'contact_lens' || serviceType === 'fitting_glasses') && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Vision Prescription</h3>
            
            {/* Right Eye */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-slate-700 block mb-2">Right Eye Sphere</Label>
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
                <Label className="text-sm font-medium text-slate-700 block mb-2">Right Eye Cylinder</Label>
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
                <Label className="text-sm font-medium text-slate-700 block mb-2">Right Eye Axis</Label>
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
                <Label className="text-sm font-medium text-slate-700 block mb-2">Right Eye Add</Label>
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

            {/* Left Eye */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-slate-700 block mb-2">Left Eye Sphere</Label>
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
                <Label className="text-sm font-medium text-slate-700 block mb-2">Left Eye Cylinder</Label>
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
                <Label className="text-sm font-medium text-slate-700 block mb-2">Left Eye Axis</Label>
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
                <Label className="text-sm font-medium text-slate-700 block mb-2">Left Eye Add</Label>
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

            {/* Pupillary Distance & Prescription Type */}
            <div className="grid grid-cols-2 gap-6">
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
                <Label className="text-sm font-medium text-slate-700 block mb-2">Prescription Type</Label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eye_examination">Eye Examination</SelectItem>
                    <SelectItem value="contact_lens">Contact Lens</SelectItem>
                    <SelectItem value="fitting_glasses">Glasses Fitting</SelectItem>
                    <SelectItem value="fitting_followup">Fitting Follow-up</SelectItem>
                    <SelectItem value="visit_consultation">Visit Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

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
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-600 mt-2">Manage and create patient prescriptions</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          New Prescription
        </Button>
      </div>

      {/* Filters */}
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
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="eye_examination">Eye Examination</SelectItem>
              <SelectItem value="contact_lens">Contact Lens</SelectItem>
              <SelectItem value="fitting_glasses">Glasses Fitting</SelectItem>
              <SelectItem value="fitting_followup">Fitting Follow-up</SelectItem>
              <SelectItem value="visit_consultation">Visit Consultation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="prescriptions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="prescriptions">All Prescriptions</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Prescription Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
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
                        <TableHead>Patient</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Service Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrescriptions.map((prescription) => (
                        <TableRow key={prescription.id}>
                          <TableCell className="font-medium">{prescription.prescriptionNumber}</TableCell>
                          <TableCell>{getPatientName(prescription.patientId)}</TableCell>
                          <TableCell>{getDoctorName(prescription.doctorId)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {prescription.prescriptionType?.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(prescription.createdAt || ''), 'MMM dd, yyyy')}</TableCell>
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
                                  <Download className="mr-2 h-4 w-4" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendEmail(prescription)}>
                                  <Send className="mr-2 h-4 w-4" />
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
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Recent prescription activities will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Prescriptions pending review will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Prescription Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Prescription</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              {/* Service-Specific Fields */}
              {serviceType && renderServiceSpecificFields()}
              
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
                  <p>{format(new Date(viewPrescription.createdAt || ''), 'MMMM dd, yyyy')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Service Type</Label>
                  <p className="capitalize">{viewPrescription.prescriptionType?.replace('_', ' ')}</p>
                </div>
              </div>

              {viewPrescription.diagnosis && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Diagnosis/Details</Label>
                  <div className="bg-slate-50 p-4 rounded-lg mt-2">
                    <pre className="whitespace-pre-wrap text-sm">{viewPrescription.diagnosis}</pre>
                  </div>
                </div>
              )}

              {(viewPrescription.visualAcuityRightEye || viewPrescription.visualAcuityLeftEye) && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Visual Acuity</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <span className="text-xs text-slate-500">Right Eye:</span>
                      <p>{viewPrescription.visualAcuityRightEye || 'Not recorded'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Left Eye:</span>
                      <p>{viewPrescription.visualAcuityLeftEye || 'Not recorded'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-4">
                <div className="bg-white p-4 rounded-lg border">
                  <QRCode value={`prescription:${viewPrescription.prescriptionNumber}`} size={128} />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}