import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  FileText,
  Download,
  Send,
  Eye,
  User,
  Calendar,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle
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

  const renderServiceSpecificFields = () => {
    switch (serviceType) {
      case "eye_examination":
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900 border-b pb-2">👁️ Eye Examination Fields</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="visualAcuityRightEye"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visual Acuity - Right Eye</FormLabel>
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
                    <FormLabel>Visual Acuity - Left Eye</FormLabel>
                    <FormControl>
                      <Input placeholder="20/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="sphereRight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sphere (Right)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.25" placeholder="0.00" {...field} />
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
                    <FormLabel>Cylinder (Right)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.25" placeholder="0.00" {...field} />
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
                    <FormLabel>Axis (Right)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="180" placeholder="90" {...field} value={field.value || 0} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="sphereLeft"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sphere (Left)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.25" placeholder="0.00" {...field} />
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
                    <FormLabel>Cylinder (Left)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.25" placeholder="0.00" {...field} />
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
                    <FormLabel>Axis (Left)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="180" placeholder="90" {...field} value={field.value || 0} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />  
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eye Examination Findings</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter detailed eye examination findings and diagnosis..." className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "contact_lens":
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900 border-b pb-2">🔍 Contact Lens Prescription</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Lens Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Daily, Weekly, Monthly..." {...field} />
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
                    <FormLabel>Brand & Material</FormLabel>
                    <FormControl>
                      <Input placeholder="Acuvue, Biofinity, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="sphereRight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Power (Right)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.25" placeholder="-2.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sphereLeft"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Power (Left)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.25" placeholder="-2.00" {...field} />
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
                    <FormLabel>Base Curve</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="8.4" {...field} />
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
                    <FormLabel>Diameter</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="14.2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="advice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Lens Care Instructions</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Wear time, cleaning instructions, replacement schedule..." className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "fitting_glasses":
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900 border-b pb-2">👓 Glasses Fitting</h4>
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="pdDistance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pupillary Distance (mm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" placeholder="62.0" {...field} />
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
                    <FormLabel>PD Near (mm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" placeholder="59.0" {...field} />
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
                    <FormLabel>PD Far (mm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" placeholder="65.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frame Selection & Measurements</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Frame style, size, bridge width, temple length..." className="min-h-[100px]" {...field} />
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
                  <FormLabel>Lens Options & Coatings</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Anti-glare, UV protection, blue light filter, progressive, bifocal..." className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "fitting_followup":
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900 border-b pb-2">📋 Fitting Follow-up</h4>
            
            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Status Assessment</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Comfort level, vision clarity, fit assessment..." className="min-h-[100px]" {...field} />
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
                  <FormLabel>Adjustments Made</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Frame adjustments, nose pad alignment, temple adjustment..." className="min-h-[100px]" {...field} />
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
                  <FormLabel>Next Steps & Recommendations</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Further adjustments needed, wear schedule, next appointment..." className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "visit_consultation":
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900 border-b pb-2">💬 Visit Consultation</h4>
            
            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chief Complaint & Symptoms</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Patient's main concerns, symptoms, duration..." className="min-h-[100px]" {...field} />
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
                  <FormLabel>Clinical Assessment</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Examination findings, observations, measurements..." className="min-h-[100px]" {...field} />
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
                  <FormLabel>Treatment Plan & Recommendations</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Recommended treatment, lifestyle changes, precautions..." className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional observations, patient history, special instructions..." className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return (
          <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <p className="text-slate-600">Please select a service type to see relevant prescription fields</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Prescription Management</h1>
        <p className="text-slate-600 mt-2">Create and manage patient prescriptions with service-specific formats</p>
      </header>

      <main className="space-y-8">
        <Tabs defaultValue="prescriptions" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="prescriptions">All Prescriptions</TabsTrigger>
            <TabsTrigger value="appointments">Doctor Appointments</TabsTrigger>
            <TabsTrigger value="eye_examination">Eye Examination</TabsTrigger>
            <TabsTrigger value="contact_lens">Contact Lens</TabsTrigger>
            <TabsTrigger value="fitting_glasses">Glasses Fitting</TabsTrigger>
          </TabsList>

          <TabsContent value="prescriptions" className="space-y-6">
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
                    <SelectItem value="eye_examination">Eye Examination</SelectItem>
                    <SelectItem value="contact_lens">Contact Lens</SelectItem>
                    <SelectItem value="fitting_glasses">Glasses Fitting</SelectItem>
                    <SelectItem value="fitting_followup">Fitting Follow-up</SelectItem>
                    <SelectItem value="visit_consultation">Visit Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Prescription
              </Button>
            </div>

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
                              <span className="capitalize">{prescription.prescriptionType?.replace('_', ' ')}</span>
                            </TableCell>
                            <TableCell>{format(new Date(prescription.createdAt || ''), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                                prescription.status === 'filled' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {prescription.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setViewPrescription(prescription)}
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

          <TabsContent value="appointments" className="space-y-6">
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
                    form.reset({
                      prescriptionNumber: `RX-${Date.now().toString().slice(-6)}`,
                      patientId: "",
                      doctorId: "",
                      appointmentId: "",
                      storeId: "",
                      prescriptionType: "eye_examination",
                      status: "active",
                    });
                    setServiceType("eye_examination");
                    setSelectedPatient(null);
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
                                    {patient?.firstName} {patient?.lastName}
                                  </h4>
                                  <span className="text-sm text-slate-500">({patient?.patientCode})</span>
                                </div>
                                <div className="text-sm text-slate-600 space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{appointment.appointmentDate ? format(new Date(appointment.appointmentDate), 'MMM dd, yyyy') : 'Date not set'}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{appointment.appointmentTime || 'Time not set'}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Activity className="h-4 w-4" />
                                    <span>{appointment.serviceType || appointment.appointmentType || 'General Consultation'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const detailedInstructions = `
Patient: ${patient?.firstName} ${patient?.lastName}
Age: ${patient?.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() + ' years' : 'Not specified'}
Gender: ${patient?.gender || 'Not specified'}  
Phone: ${patient?.phone || 'Not provided'}
Email: ${patient?.email || 'Not provided'}

Appointment Details:
Service Type: ${appointment.serviceType || appointment.appointmentType || 'General Consultation'}
Date: ${appointment.appointmentDate ? format(new Date(appointment.appointmentDate), 'MMMM dd, yyyy') : 'Not set'}
Time: ${appointment.appointmentTime || 'Not set'} 
Doctor: ${doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Not assigned'}
Status: ${appointment.status || 'Scheduled'}

Notes: ${appointment.notes || 'No additional notes'}
Treatment Plan: ${appointment.treatmentPlan || 'To be determined during consultation'}
Follow-up Instructions: ${appointment.followUpInstructions || 'Standard follow-up as needed'}

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

          <TabsContent value="eye_examination" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-slate-600">Eye examination prescriptions will be displayed here.</p>
            </div>
          </TabsContent>

          <TabsContent value="contact_lens" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-slate-600">Contact lens prescriptions will be displayed here.</p>
            </div>
          </TabsContent>

          <TabsContent value="fitting_glasses" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-slate-600">Glasses fitting prescriptions will be displayed here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Create/Edit Prescription Dialog - Available from all tabs */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Service-Specific Prescription</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="service">Service Details</TabsTrigger>
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
                          <FormLabel>Service Type</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            setServiceType(value);
                          }} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select service type..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="eye_examination">👁️ Eye Examination</SelectItem>
                              <SelectItem value="contact_lens">🔍 Contact Lens</SelectItem>
                              <SelectItem value="fitting_glasses">👓 Fitting Glasses</SelectItem>
                              <SelectItem value="fitting_followup">📋 Fitting Follow-up</SelectItem>
                              <SelectItem value="visit_consultation">💬 Visit Consultation</SelectItem>
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
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            const patient = patients.find(p => p.id === value);
                            setSelectedPatient(patient || null);
                          }} value={field.value}>
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
                          <FormLabel>Doctor (Optional)</FormLabel>
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
                  </div>

                  {/* Patient Information Display */}
                  {selectedPatient && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-3">Patient Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-blue-700">Name:</span> {selectedPatient.firstName} {selectedPatient.lastName}
                        </div>
                        <div>
                          <span className="font-medium text-blue-700">Patient ID:</span> {selectedPatient.patientCode}
                        </div>
                        <div>
                          <span className="font-medium text-blue-700">Age:</span> {selectedPatient.dateOfBirth ? new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear() + ' years' : 'Not specified'}
                        </div>
                        <div>
                          <span className="font-medium text-blue-700">Gender:</span> {selectedPatient.gender || 'Not specified'}
                        </div>
                        <div>
                          <span className="font-medium text-blue-700">Phone:</span> {selectedPatient.phone || 'Not provided'}
                        </div>
                        <div>
                          <span className="font-medium text-blue-700">Email:</span> {selectedPatient.email || 'Not provided'}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="service" className="space-y-4">
                  {renderServiceSpecificFields()}
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