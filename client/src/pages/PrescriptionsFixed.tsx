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
  Clock
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

export default function PrescriptionsFixed() {
  const [createOpen, setCreateOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewPrescription, setViewPrescription] = useState<Prescription | null>(null);
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

  // Create prescription form
  const createForm = useForm<InsertPrescription>({
    resolver: zodResolver(insertPrescriptionSchema),
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
    resolver: zodResolver(insertPrescriptionSchema),
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
      return await apiRequest('/api/prescriptions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
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
    createPrescriptionMutation.mutate(data);
  };

  const onQuickSubmit = (data: InsertPrescription) => {
    createPrescriptionMutation.mutate(data);
  };

  // Filter prescriptions
  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const patient = patients.find(p => p.id === prescription.patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "";
    
    const matchesSearch = prescription.prescriptionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || prescription.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

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
OptiStore Pro Team`;

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
          <span>Appointments (8)</span>
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
              onClick={() => setCreateOpen(true)}
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

      {/* Create Prescription Dialog with Tabs */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Prescription</DialogTitle>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
              <Tabs defaultValue="patient-info" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="patient-info">Patient Info</TabsTrigger>
                  <TabsTrigger value="vision">Vision Prescription</TabsTrigger>
                  <TabsTrigger value="clinical">Clinical Details</TabsTrigger>
                  <TabsTrigger value="additional">Additional Info</TabsTrigger>
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
                    </div>

                    <FormField
                      control={createForm.control}
                      name="doctorId"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Prescribing Doctor</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select doctor..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {staff.map((doctor) => (
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
                </TabsContent>

                <TabsContent value="vision" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Vision Prescription</h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Right Eye</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm">Sphere</Label>
                            <FormField
                              control={createForm.control}
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
                            <Label className="text-sm">Cylinder</Label>
                            <FormField
                              control={createForm.control}
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
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Left Eye</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm">Sphere</Label>
                            <FormField
                              control={createForm.control}
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
                            <Label className="text-sm">Cylinder</Label>
                            <FormField
                              control={createForm.control}
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
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="clinical" className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={createForm.control}
                      name="diagnosis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnosis</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Patient diagnosis and findings..." 
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
                      name="treatment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Treatment Plan</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Recommended treatment and follow-up..." 
                              className="h-32" 
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
                          <FormLabel>Prescription Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
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
              
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
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

      {/* View Prescription Dialog */}
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
                    <h4 className="font-semibold mb-3">Prescription Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Number:</span>
                        <span className="font-mono">{viewPrescription.prescriptionNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span>{format(new Date(viewPrescription.createdAt || ''), 'MMMM dd, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service:</span>
                        <Badge variant="outline" className="capitalize">
                          {viewPrescription.prescriptionType?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
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
                    <h4 className="font-semibold mb-3">Medical Team</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Patient:</span>
                        <span className="font-semibold">{getPatientName(viewPrescription.patientId)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Doctor:</span>
                        <span className="font-semibold">{getDoctorName(viewPrescription.doctorId)}</span>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="flex justify-center">
                  <Card className="p-6">
                    <h4 className="font-semibold text-center mb-4">QR Code</h4>
                    <QRCode value={`prescription:${viewPrescription.prescriptionNumber}`} size={150} />
                    <p className="text-xs text-gray-500 text-center mt-2">Scan for quick access</p>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="patient" className="space-y-6">
                {(() => {
                  const patient = patients.find(p => p.id === viewPrescription.patientId);
                  return (
                    <Card className="p-4">
                      <h4 className="font-semibold mb-3">Patient Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-medium text-blue-600">
                              {patient ? `${patient.firstName?.[0]}${patient.lastName?.[0]}` : 'UN'}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold">{patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}</p>
                            <p className="text-sm text-gray-600">{patient?.patientCode || 'No code'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label className="text-gray-600">Email</Label>
                            <p>{patient?.email || 'Not provided'}</p>
                          </div>
                          <div>
                            <Label className="text-gray-600">Phone</Label>
                            <p>{patient?.phone || 'Not provided'}</p>
                          </div>
                          <div>
                            <Label className="text-gray-600">Gender</Label>
                            <p>{patient?.gender || 'Not specified'}</p>
                          </div>
                          <div>
                            <Label className="text-gray-600">Blood Group</Label>
                            <p>{patient?.bloodGroup || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })()}
              </TabsContent>

              <TabsContent value="vision" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3">Right Eye</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sphere:</span>
                        <span className="font-mono">{viewPrescription.sphereRight || 'Not recorded'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cylinder:</span>
                        <span className="font-mono">{viewPrescription.cylinderRight || 'Not recorded'}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-semibold mb-3">Left Eye</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sphere:</span>
                        <span className="font-mono">{viewPrescription.sphereLeft || 'Not recorded'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cylinder:</span>
                        <span className="font-mono">{viewPrescription.cylinderLeft || 'Not recorded'}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="clinical" className="space-y-6">
                <div className="space-y-4">
                  {viewPrescription.diagnosis && (
                    <Card className="p-4">
                      <h4 className="font-semibold mb-3">Diagnosis</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">{viewPrescription.diagnosis}</pre>
                      </div>
                    </Card>
                  )}

                  {viewPrescription.treatment && (
                    <Card className="p-4">
                      <h4 className="font-semibold mb-3">Treatment Plan</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">{viewPrescription.treatment}</pre>
                      </div>
                    </Card>
                  )}

                  {viewPrescription.notes && (
                    <Card className="p-4">
                      <h4 className="font-semibold mb-3">Additional Notes</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
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