import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Header removed for Patient Portal compatibility
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
  Edit,
  History,
  User,
  Calendar,
  Heart,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Activity
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
      gender: "male",
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
      loyaltyTier: "bronze",
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

  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    
    // Fetch patient history
    try {
      const history = await apiRequest("GET", `/api/patients/${patient.id}/history`);
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

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Patient Management</h1>
          <p className="text-slate-600">Manage patient records, medical history, and personal information securely.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Register Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Patient</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="personal">Personal Info</TabsTrigger>
                    <TabsTrigger value="contact">Contact Details</TabsTrigger>
                    <TabsTrigger value="medical">Medical Info</TabsTrigger>
                    <TabsTrigger value="insurance">Insurance & Loyalty</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="patientCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Patient Code</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
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

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
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
                            <FormControl>
                              <Input {...field} placeholder="e.g., A+, O-, B+, AB+" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
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
                            <FormLabel>Emergency Contact Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="medical" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="allergies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Known Allergies</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="List any known allergies or sensitivities" />
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
                            <Textarea {...field} placeholder="Previous medical conditions, surgeries, treatments" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="insurance" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="insuranceProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Insurance Provider</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                            <FormLabel>Insurance Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
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
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPatientMutation.isPending}>
                    {createPatientMutation.isPending ? "Registering..." : "Register Patient"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        
        <Button className="bg-green-600 hover:bg-green-700">
          <Calendar className="mr-2 h-4 w-4" />
          Book Appointment
        </Button>
      </div>

      {/* Patients Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
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
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No patients found</h3>
              <p className="text-slate-600 mb-6">
                {searchTerm ? "Try adjusting your search criteria." : "Register your first patient to get started."}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Register Patient
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age/Gender</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Loyalty Tier</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <span className="font-mono text-sm">{patient.patientCode}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="font-medium">{patient.firstName} {patient.lastName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span>{calculateAge(patient.dateOfBirth || '')} years</span>
                          <span className="text-slate-500 capitalize"> • {patient.gender}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {patient.phone && (
                            <div className="flex items-center space-x-1 text-sm">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{patient.phone}</span>
                            </div>
                          )}
                          {patient.email && (
                            <div className="flex items-center space-x-1 text-sm">
                              <Mail className="h-3 w-3 text-slate-400" />
                              <span>{patient.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            patient.loyaltyTier === 'gold' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : patient.loyaltyTier === 'silver'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-orange-100 text-orange-800'
                          }
                        >
                          {patient.loyaltyTier === 'gold' ? '🥇' : patient.loyaltyTier === 'silver' ? '🥈' : '🥉'} {patient.loyaltyTier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {format(new Date(patient.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewPatient(patient)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
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

      {/* Patient Details Dialog */}
      {selectedPatient && (
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Patient Details - {selectedPatient.firstName} {selectedPatient.lastName}</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="medical">Medical Info</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900">Personal Information</h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Full Name</Label>
                        <p className="text-lg font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-600">Age</Label>
                          <p>{calculateAge(selectedPatient.dateOfBirth || '')} years old</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-600">Gender</Label>
                          <p className="capitalize">{selectedPatient.gender}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Date of Birth</Label>
                        <p>{selectedPatient.dateOfBirth ? format(new Date(selectedPatient.dateOfBirth), 'MMMM dd, yyyy') : 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Blood Group</Label>
                        <p>{selectedPatient.bloodGroup || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900">Contact Information</h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Phone</Label>
                        <p className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span>{selectedPatient.phone || 'Not provided'}</span>
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Email</Label>
                        <p className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span>{selectedPatient.email || 'Not provided'}</span>
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Address</Label>
                        <p className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-slate-400 mt-1" />
                          <span>{selectedPatient.address || 'Not provided'}</span>
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Emergency Contact</Label>
                        <p>{selectedPatient.emergencyContact || 'Not provided'}</p>
                        {selectedPatient.emergencyPhone && (
                          <p className="text-sm text-slate-500">{selectedPatient.emergencyPhone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Insurance Provider</Label>
                      <p>{selectedPatient.insuranceProvider || 'Not provided'}</p>
                      {selectedPatient.insuranceNumber && (
                        <p className="text-sm text-slate-500 font-mono">{selectedPatient.insuranceNumber}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Loyalty Program</Label>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={
                            selectedPatient.loyaltyTier === 'gold' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : selectedPatient.loyaltyTier === 'silver'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-orange-100 text-orange-800'
                          }
                        >
                          {selectedPatient.loyaltyTier === 'gold' ? '🥇' : selectedPatient.loyaltyTier === 'silver' ? '🥈' : '🥉'} {selectedPatient.loyaltyTier}
                        </Badge>
                        <span className="text-sm text-slate-500">{selectedPatient.loyaltyPoints} points</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="medical" className="space-y-6">
                {selectedPatient.allergies && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <Label className="text-sm font-medium text-red-800">Allergies</Label>
                        <p className="text-red-700 mt-1">{selectedPatient.allergies}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPatient.medicalHistory && (
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Medical History</Label>
                    <p className="mt-1 p-3 bg-slate-50 rounded-md">{selectedPatient.medicalHistory}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900">Patient History</h4>
                  <Badge variant="outline">
                    {patientHistory.length} records
                  </Badge>
                </div>

                {patientHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <p className="text-slate-600">No medical history available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {patientHistory.map((record) => (
                      <div key={record.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-slate-900">{record.title}</h5>
                            <p className="text-sm text-slate-600 mt-1">{record.description}</p>
                            <Badge variant="outline" className="mt-2 capitalize">
                              {record.recordType}
                            </Badge>
                          </div>
                          <span className="text-sm text-slate-500">
                            {format(new Date(record.recordDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}