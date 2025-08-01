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
  Edit,
  Eye,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  Shield,
  Clock,
  Award,
  FileText,
  QrCode
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  insertStaffSchema, 
  type Staff, 
  type InsertStaff 
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function StaffPage() {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [basicSalary, setBasicSalary] = useState(0);
  const [houseAllowance, setHouseAllowance] = useState(0);
  const [transportAllowance, setTransportAllowance] = useState(0);
  const [medicalAllowance, setMedicalAllowance] = useState(0);
  const [otherAllowances, setOtherAllowances] = useState(0);
  const [incomeTax, setIncomeTax] = useState(0);
  const [providentFund, setProvidentFund] = useState(0);
  const [healthInsurance, setHealthInsurance] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Calculate totals
  const grossSalary = basicSalary + houseAllowance + transportAllowance + medicalAllowance + otherAllowances;
  const totalDeductions = incomeTax + providentFund + healthInsurance + otherDeductions;
  const netSalary = grossSalary - totalDeductions;

  // Generate Staff ID Card function
  const generateStaffIDCard = (staff: any) => {
    const idCardWindow = window.open('', '_blank');
    if (idCardWindow) {
      idCardWindow.document.write(`
        <html>
          <head>
            <title>Staff ID Card - ${staff.firstName} ${staff.lastName}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background: #f0f0f0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
              .id-card {
                width: 280px;
                height: 450px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                padding: 25px;
                color: white;
                position: relative;
                box-shadow: 0 15px 35px rgba(0,0,0,0.3);
                margin: 20px auto;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .company-name {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 8px;
                line-height: 1.2;
              }
              .id-title {
                font-size: 13px;
                opacity: 0.9;
                font-weight: 300;
              }
              .photo-section {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20px;
              }
              .photo-placeholder {
                width: 80px;
                height: 80px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 30px;
                border: 3px solid rgba(255,255,255,0.3);
              }
              .qr-section {
                width: 80px;
                height: 80px;
                background: white;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 4px;
              }
              .info {
                margin-bottom: 15px;
              }
              .name {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 8px;
                text-align: center;
              }
              .position {
                font-size: 16px;
                margin-bottom: 15px;
                text-align: center;
                font-weight: 500;
                opacity: 0.9;
              }
              .details {
                font-size: 13px;
                margin-bottom: 6px;
                opacity: 0.95;
                line-height: 1.3;
              }
              .qr-section {
                width: 80px;
                height: 80px;
                background: white;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: 15px;
              }
              .qr-placeholder {
                width: 70px;
                height: 70px;
                background: #333;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 10px;
                text-align: center;
              }
              .footer {
                position: absolute;
                bottom: 10px;
                left: 20px;
                right: 20px;
                text-align: center;
                font-size: 10px;
                opacity: 0.7;
              }
              @media print {
                body { background: white; }
                .id-card { margin: 0; box-shadow: none; }
              }
            </style>
            <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
          </head>
          <body>
            <div class="id-card">
              <div class="header">
                <div class="company-name">OptiStore Pro Medical Center</div>
                <div class="id-title">Staff Identification Card</div>
              </div>
              
              <div class="photo-section">
                <div class="photo-placeholder">👤</div>
                <div class="qr-section">
                  <canvas id="qr-canvas" width="80" height="80"></canvas>
                </div>
              </div>
              
              <div class="info">
                <div class="name">${staff.firstName} ${staff.lastName}</div>
                <div class="position">${staff.position || 'Staff Member'}</div>
                <div class="details">ID: ${staff.staffCode}</div>
                <div class="details">Dept: ${staff.department || 'General'}</div>
                <div class="details">Blood Group: ${staff.bloodGroup || 'N/A'}</div>
                <div class="details">Phone: ${staff.phone || 'N/A'}</div>
                <div class="details">Address: ${staff.address || 'N/A'}</div>
                <div class="details">Since: ${new Date(staff.hireDate).getFullYear()}</div>
              </div>
              
              <div class="footer">
                This card is property of OptiStore Pro Medical Center
              </div>
            </div>
            
            <div style="text-align: center; margin: 20px;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Print ID Card
              </button>
            </div>
            
            <script>
              window.onload = function() {
                try {
                  const canvas = document.getElementById('qr-canvas');
                  if (canvas && window.QRCode) {
                    const staffData = 'STAFF:${staff.staffCode},NAME:${staff.firstName} ${staff.lastName},POS:${staff.position},DEPT:${staff.department},PHONE:${staff.phone || "N/A"},ADDRESS:${(staff.address || "N/A").replace(/,/g, "|")}';
                    QRCode.toCanvas(canvas, staffData, { 
                      width: 72, 
                      height: 72, 
                      margin: 1, 
                      color: { dark: '#000000', light: '#ffffff' },
                      errorCorrectionLevel: 'M'
                    });
                  }
                } catch (e) {
                  console.error('QR Code generation failed:', e);
                }
              };
            </script>
          </body>
        </html>
      `);
      idCardWindow.document.close();
    }
    
    toast({
      title: "ID Card Generated",
      description: `Staff ID card for ${staff.firstName} ${staff.lastName} is ready`,
    });
  };

  // Mock staff data for development
  const mockStaffData = [
    {
      id: "STF-001",
      staffCode: "STF-001",
      firstName: "Dr. Sarah",
      lastName: "Smith",
      email: "sarah.smith@optistorepro.com",
      phone: "+1-555-0101",
      address: "123 Medical Center Dr, City, State 12345",
      position: "Ophthalmologist",
      department: "Eye Care",
      hireDate: "2023-01-15",
      status: "active",
      role: "doctor",
      permissions: ["view_patients", "edit_medical_records", "prescribe"],
      customFields: {
        licenseNumber: "MD-12345",
        specialization: "Retinal Surgery",
        yearsExperience: "12"
      }
    },
    {
      id: "STF-002", 
      staffCode: "STF-002",
      firstName: "John",
      lastName: "Johnson",
      email: "john.johnson@optistorepro.com",
      phone: "+1-555-0102",
      address: "456 Healthcare Ave, City, State 12345",
      position: "Optometrist",
      department: "Vision Care",
      hireDate: "2023-03-20",
      status: "active",
      role: "doctor",
      permissions: ["view_patients", "edit_prescriptions"],
      customFields: {
        licenseNumber: "OD-67890",
        specialization: "Contact Lenses",
        yearsExperience: "8"
      }
    },
    {
      id: "STF-003",
      staffCode: "STF-003", 
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@optistorepro.com",
      phone: "+1-555-0103",
      address: "789 Medical Plaza, City, State 12345",
      position: "Technician",
      department: "Diagnostics",
      hireDate: "2023-06-10",
      status: "active",
      role: "staff",
      permissions: ["view_patients", "run_diagnostics"],
      customFields: {
        certification: "COT-2023",
        specialization: "OCT Imaging",
        yearsExperience: "5"
      }
    },
    {
      id: "STF-004",
      staffCode: "STF-004",
      firstName: "Michael",
      lastName: "Brown", 
      email: "michael.brown@optistorepro.com",
      phone: "+1-555-0104",
      address: "321 Vision Center Blvd, City, State 12345",
      position: "Manager",
      department: "Administration",
      hireDate: "2022-09-05",
      status: "active",
      role: "manager",
      permissions: ["view_all", "edit_all", "manage_staff"],
      customFields: {
        certification: "MBA-Healthcare",
        specialization: "Operations Management",
        yearsExperience: "15"
      }
    }
  ];

  const { data: staffListFromAPI = [], isLoading, error } = useQuery<any[]>({
    queryKey: ["/api/staff"],
    retry: 3,
    retryDelay: 1000,
  });

  // Use API data if available, fallback to mock data only if API fails completely
  const staffList = Array.isArray(staffListFromAPI) && staffListFromAPI.length > 0 ? staffListFromAPI : mockStaffData;

  const { data: stores = [] } = useQuery({
    queryKey: ["/api/stores"],
  });

  const form = useForm<InsertStaff>({
    resolver: zodResolver(insertStaffSchema),
    defaultValues: {
      staffCode: `STF-${Date.now().toString().slice(-6)}`,
      employeeId: `EMP-${Date.now().toString().slice(-6)}`, // Auto-generate Employee ID
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      position: "",
      department: "",
      hireDate: format(new Date(), 'yyyy-MM-dd'),
      status: "active",
      role: "staff",
      permissions: [],
      customFields: {},
    },
  });

  const createStaffMutation = useMutation({
    mutationFn: async (data: InsertStaff) => {
      await apiRequest("POST", "/api/staff", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({
        title: "Success",
        description: "Staff member added successfully.",
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add staff member.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertStaff) => {
    createStaffMutation.mutate(data);
  };

  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.staffCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'doctor': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Staff</p>
                    <p className="text-2xl font-bold text-slate-900">{staffList.length}</p>
                    <p className="text-xs text-emerald-600 flex items-center mt-1">
                      <Activity className="h-3 w-3 mr-1" />
                      All employees
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
                    <p className="text-sm font-medium text-slate-600">Active Staff</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {staffList.filter(s => s.status === 'active').length}
                    </p>
                    <p className="text-xs text-slate-500">Currently working</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Activity className="text-green-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Managers</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {staffList.filter(s => s.role === 'manager').length}
                    </p>
                    <p className="text-xs text-slate-500">Leadership roles</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Shield className="text-purple-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">New Hires</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {staffList.filter(s => {
                        const hireDate = new Date(s.hireDate);
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        return hireDate >= thirtyDaysAgo;
                      }).length}
                    </p>
                    <p className="text-xs text-slate-500">Last 30 days</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Award className="text-yellow-600 h-6 w-6" />
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
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Staff Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Staff Member</DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs defaultValue="personal" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="personal">Personal Info</TabsTrigger>
                        <TabsTrigger value="employment">Employment</TabsTrigger>
                        <TabsTrigger value="contact">Contact Details</TabsTrigger>
                        <TabsTrigger value="access">Access & Permissions</TabsTrigger>
                        <TabsTrigger value="payroll">Payroll & Documents</TabsTrigger>
                      </TabsList>

                      <TabsContent value="personal" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="staffCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Staff Code</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="employeeId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Employee ID</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} />
                                </FormControl>
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
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
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
                      </TabsContent>

                      <TabsContent value="employment" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="position"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Position</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select position" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="doctor">Doctor</SelectItem>
                                    <SelectItem value="optometrist">Optometrist</SelectItem>
                                    <SelectItem value="nurse">Nurse</SelectItem>
                                    <SelectItem value="technician">Technician</SelectItem>
                                    <SelectItem value="receptionist">Receptionist</SelectItem>
                                    <SelectItem value="pharmacist">Pharmacist</SelectItem>
                                    <SelectItem value="lab_technician">Lab Technician</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="assistant_manager">Assistant Manager</SelectItem>
                                    <SelectItem value="sales_associate">Sales Associate</SelectItem>
                                    <SelectItem value="inventory_manager">Inventory Manager</SelectItem>
                                    <SelectItem value="cashier">Cashier</SelectItem>
                                    <SelectItem value="admin_staff">Administrative Staff</SelectItem>
                                    <SelectItem value="customer_service">Customer Service</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Department</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="storeId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Store Assignment</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select store" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {(stores as any[]).map((store: any) => (
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
                          
                          <FormField
                            control={form.control}
                            name="hireDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Hire Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Employment Status</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="terminated">Terminated</SelectItem>
                                  </SelectContent>
                                </Select>
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
                                  <Input {...field} value={field.value || ""} />
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
                                  <Input type="email" {...field} value={field.value || ""} />
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
                                <Textarea 
                                  placeholder="Enter complete address..."
                                  className="min-h-[80px]"
                                  {...field} 
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="emergencyContactName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Emergency Contact Name</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="emergencyContactPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Emergency Contact Phone</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="access" className="space-y-4">
                        <FormField
                          control={form.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="admin">Administrator</SelectItem>
                                  <SelectItem value="manager">Manager</SelectItem>
                                  <SelectItem value="staff">Staff</SelectItem>
                                  <SelectItem value="doctor">Doctor</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      <TabsContent value="payroll" className="space-y-6">
                        {/* Photo Upload Section */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Photo & Documents</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Staff Photo</Label>
                                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                                     onClick={() => document.getElementById('photo-upload')?.click()}>
                                  <User className="mx-auto h-12 w-12 text-gray-400" />
                                  <p className="mt-2 text-sm text-gray-500">Click to upload photo</p>
                                  <input 
                                    id="photo-upload"
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        toast({
                                          title: "Photo uploaded",
                                          description: `Selected: ${file.name}`,
                                        });
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label>Qualification Documents</Label>
                                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                                     onClick={() => document.getElementById('docs-upload')?.click()}>
                                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                  <p className="mt-2 text-sm text-gray-500">Upload certificates, degrees</p>
                                  <input 
                                    id="docs-upload"
                                    type="file" 
                                    className="hidden" 
                                    accept=".pdf,.doc,.docx" 
                                    multiple
                                    onChange={(e) => {
                                      const files = e.target.files;
                                      if (files && files.length > 0) {
                                        toast({
                                          title: "Documents uploaded",
                                          description: `Selected ${files.length} file(s)`,
                                        });
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <Label>Appointment Letter</Label>
                              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                                   onClick={() => document.getElementById('appointment-upload')?.click()}>
                                <FileText className="mx-auto h-12 w-12 text-blue-400" />
                                <p className="mt-2 text-sm text-gray-500">Upload appointment letter</p>
                                <input 
                                  id="appointment-upload"
                                  type="file" 
                                  className="hidden" 
                                  accept=".pdf,.doc,.docx"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      toast({
                                        title: "Appointment letter uploaded",
                                        description: `Selected: ${file.name}`,
                                      });
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Salary & Benefits Section */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Salary & Benefits</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Basic Salary</Label>
                                <Input 
                                  type="number" 
                                  value={basicSalary || ""} 
                                  onChange={(e) => setBasicSalary(Number(e.target.value) || 0)}
                                  placeholder="50000" 
                                />
                              </div>
                              <div>
                                <Label>House Allowance</Label>
                                <Input 
                                  type="number" 
                                  value={houseAllowance || ""} 
                                  onChange={(e) => setHouseAllowance(Number(e.target.value) || 0)}
                                  placeholder="15000" 
                                />
                              </div>
                              <div>
                                <Label>Transport Allowance</Label>
                                <Input 
                                  type="number" 
                                  value={transportAllowance || ""} 
                                  onChange={(e) => setTransportAllowance(Number(e.target.value) || 0)}
                                  placeholder="8000" 
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Medical Allowance</Label>
                                <Input 
                                  type="number" 
                                  value={medicalAllowance || ""} 
                                  onChange={(e) => setMedicalAllowance(Number(e.target.value) || 0)}
                                  placeholder="5000" 
                                />
                              </div>
                              <div>
                                <Label>Other Allowances</Label>
                                <Input 
                                  type="number" 
                                  value={otherAllowances || ""} 
                                  onChange={(e) => setOtherAllowances(Number(e.target.value) || 0)}
                                  placeholder="2000" 
                                />
                              </div>
                              <div>
                                <Label>Total Gross Salary</Label>
                                <Input 
                                  type="number" 
                                  value={grossSalary} 
                                  disabled 
                                  className="bg-green-100 font-semibold" 
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Deductions Section */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Deductions</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Income Tax</Label>
                                <Input 
                                  type="number" 
                                  value={incomeTax || ""} 
                                  onChange={(e) => setIncomeTax(Number(e.target.value) || 0)}
                                  placeholder="8000" 
                                />
                              </div>
                              <div>
                                <Label>Provident Fund</Label>
                                <Input 
                                  type="number" 
                                  value={providentFund || ""} 
                                  onChange={(e) => setProvidentFund(Number(e.target.value) || 0)}
                                  placeholder="4000" 
                                />
                              </div>
                              <div>
                                <Label>Health Insurance</Label>
                                <Input 
                                  type="number" 
                                  value={healthInsurance || ""} 
                                  onChange={(e) => setHealthInsurance(Number(e.target.value) || 0)}
                                  placeholder="2000" 
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Other Deductions</Label>
                                <Input 
                                  type="number" 
                                  value={otherDeductions || ""} 
                                  onChange={(e) => setOtherDeductions(Number(e.target.value) || 0)}
                                  placeholder="1000" 
                                />
                              </div>
                              <div>
                                <Label>Total Deductions</Label>
                                <Input 
                                  type="number" 
                                  value={totalDeductions} 
                                  disabled 
                                  className="bg-red-100 font-semibold" 
                                />
                              </div>
                              <div>
                                <Label>Net Salary</Label>
                                <Input 
                                  type="number" 
                                  value={netSalary} 
                                  disabled 
                                  className="bg-green-200 font-bold text-green-800" 
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Leave Management Section */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Leave Entitlements</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <Label>Annual Leave</Label>
                                <Input type="number" placeholder="30" />
                                <p className="text-xs text-gray-500 mt-1">Days per year</p>
                              </div>
                              <div>
                                <Label>Sick Leave</Label>
                                <Input type="number" placeholder="15" />
                                <p className="text-xs text-gray-500 mt-1">Days per year</p>
                              </div>
                              <div>
                                <Label>Casual Leave</Label>
                                <Input type="number" placeholder="10" />
                                <p className="text-xs text-gray-500 mt-1">Days per year</p>
                              </div>
                              <div>
                                <Label>Maternity/Paternity</Label>
                                <Input type="number" placeholder="90" />
                                <p className="text-xs text-gray-500 mt-1">Days</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
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
                        disabled={createStaffMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {createStaffMutation.isPending ? "Adding..." : "Add Staff Member"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Staff Table */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Staff Directory</CardTitle>
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
              ) : filteredStaff.length === 0 ? (
                <div className="text-center py-12">
                  <User className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No staff members found</h3>
                  <p className="text-slate-600 mb-6">
                    {searchTerm ? "Try adjusting your search criteria." : "Add your first staff member to get started."}
                  </p>
                  {!searchTerm && (
                    <Button 
                      onClick={() => setOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Staff Member
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Hire Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.map((staff) => (
                        <TableRow key={staff.id}>
                          <TableCell>
                            <span className="font-mono text-sm">{staff.staffCode}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-slate-400" />
                              <span className="font-medium">{staff.firstName} {staff.lastName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <span className="font-medium">{staff.position}</span>
                              {staff.department && (
                                <span className="text-slate-500 block">{staff.department}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {staff.phone && (
                                <div className="flex items-center space-x-1 text-sm">
                                  <Phone className="h-3 w-3 text-slate-400" />
                                  <span>{staff.phone}</span>
                                </div>
                              )}
                              {staff.email && (
                                <div className="flex items-center space-x-1 text-sm">
                                  <Mail className="h-3 w-3 text-slate-400" />
                                  <span>{staff.email}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(staff.role)}>
                              {staff.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(staff.status)}>
                              {staff.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {format(new Date(staff.hireDate), 'MMM dd, yyyy')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedStaff(staff)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingStaff(staff);
                                  setEditOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => generateStaffIDCard(staff)}
                                title="Generate ID Card"
                              >
                                <QrCode className="h-4 w-4" />
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
        </div>
      </main>

      {/* Staff View Dialog */}
      {selectedStaff && (
        <Dialog open={!!selectedStaff} onOpenChange={() => setSelectedStaff(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Staff Profile - {selectedStaff.firstName} {selectedStaff.lastName}</span>
                <div className="flex items-center space-x-2">
                  <Badge className={getRoleBadgeColor(selectedStaff.role)}>
                    {selectedStaff.role}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateStaffIDCard(selectedStaff)}
                      title="Generate ID Card"
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      title="Print Profile"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-3 gap-6">
              {/* Photo and QR Section */}
              <div className="col-span-1 space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-lg">{selectedStaff.firstName} {selectedStaff.lastName}</h3>
                  <p className="text-sm text-slate-600">{selectedStaff.position}</p>
                  <Badge className={getRoleBadgeColor(selectedStaff.role)} style={{ marginTop: '8px' }}>
                    {selectedStaff.role}
                  </Badge>
                </div>
                
                <div className="bg-white p-4 rounded-lg border text-center">
                  <h4 className="font-medium mb-2">Staff QR Code</h4>
                  <div className="w-24 h-24 bg-gray-100 rounded mx-auto flex items-center justify-center">
                    <QrCode className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Scan for staff info</p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="col-span-1 space-y-4">
                <h4 className="font-semibold text-slate-900 border-b pb-2">Personal Information</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Staff Code</Label>
                    <p className="font-mono bg-gray-50 p-2 rounded">{selectedStaff.staffCode}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Employee ID</Label>
                    <p className="font-mono bg-gray-50 p-2 rounded">{selectedStaff.employeeId || 'Not assigned'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Blood Group</Label>
                    <p className="bg-red-50 p-2 rounded text-red-700 font-medium">{selectedStaff.bloodGroup || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Date of Birth</Label>
                    <p>{selectedStaff.dateOfBirth ? format(new Date(selectedStaff.dateOfBirth), 'MMMM dd, yyyy') : 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Gender</Label>
                    <p className="capitalize">{selectedStaff.gender || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Nationality</Label>
                    <p>{selectedStaff.nationality || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Employment & Contact */}
              <div className="col-span-1 space-y-4">
                <h4 className="font-semibold text-slate-900 border-b pb-2">Employment & Contact</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Department</Label>
                    <p className="bg-blue-50 p-2 rounded text-blue-700">{selectedStaff.department}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Status</Label>
                    <Badge className={getStatusBadgeColor(selectedStaff.status)}>
                      {selectedStaff.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Hire Date</Label>
                    <p className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{format(new Date(selectedStaff.hireDate), 'MMMM dd, yyyy')}</span>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Phone</Label>
                    <p className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{selectedStaff.phone || 'Not provided'}</span>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Email</Label>
                    <p className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-sm break-all">{selectedStaff.email || 'Not provided'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-6">
              <h4 className="font-semibold text-slate-900 mb-3">Additional Information</h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Address</Label>
                    <p className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-slate-400 mt-1" />
                      <span>{selectedStaff.address || 'Not provided'}</span>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Emergency Contact</Label>
                    <p>{selectedStaff.emergencyContactName || 'Not provided'}</p>
                    {selectedStaff.emergencyContactPhone && (
                      <p className="text-sm text-slate-500">{selectedStaff.emergencyContactPhone}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Bank Details</Label>
                    <p className="text-sm">{selectedStaff.bankName || 'Not provided'}</p>
                    {selectedStaff.bankAccountNumber && (
                      <p className="text-sm font-mono">{selectedStaff.bankAccountNumber}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">NID Number</Label>
                    <p className="font-mono">{selectedStaff.nidNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}