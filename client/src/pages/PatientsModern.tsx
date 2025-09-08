import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Star,
  Activity
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { 
  ModernPageHeader, 
  ModernStatsCard, 
  ModernActionButton, 
  ModernTabHeader,
  ModernProgressBar 
} from "@/components/ui/modern-components";
import ComprehensivePatientForm from "@/components/forms/ComprehensivePatientForm";
import AppointmentsManagement from "@/components/appointments/AppointmentsManagement";
import { useToast } from "@/hooks/use-toast";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  patientCode: string;
  gender: string;
  isActive?: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  medicalHistory?: string;
  lastVisit?: string;
  nextAppointment?: string;
  totalVisits?: number;
  insuranceProvider?: string;
}

const PatientsModern: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [activeMainTab, setActiveMainTab] = useState("patients"); // New state for main tabs
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch patients
  const { data: patients = [], isLoading, error } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  // Filter and sort patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.patientCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || 
      (filterStatus === "active" && patient.isActive) ||
      (filterStatus === "inactive" && !patient.isActive);
    
    return matchesSearch && matchesFilter;
  });

  // Sort patients
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      case "date":
        return new Date(b.dateOfBirth).getTime() - new Date(a.dateOfBirth).getTime();
      case "visits":
        return (b.totalVisits || 0) - (a.totalVisits || 0);
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedPatients.length / pageSize);
  const paginatedPatients = sortedPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Statistics
  const stats = {
    total: patients.length,
    active: patients.filter(p => p.isActive !== false).length,
    newThisMonth: patients.filter(p => {
      const patientDate = new Date(p.dateOfBirth);
      const thisMonth = new Date();
      thisMonth.setDate(1);
      return patientDate >= thisMonth;
    }).length,
    withInsurance: patients.filter(p => p.insuranceProvider).length
  };

  // Tab configuration
  const tabs = [
    { id: "all", label: "All Patients", icon: Users, count: stats.total },
    { id: "active", label: "Active", icon: CheckCircle2, count: stats.active },
    { id: "recent", label: "Recent", icon: Clock, count: stats.newThisMonth },
    { id: "vip", label: "VIP", icon: Star, count: Math.floor(stats.total * 0.1) }
  ];

  const getPatientStatus = (patient: Patient) => {
    if (patient.isActive === false) return { label: "Inactive", color: "destructive" };
    if (patient.nextAppointment) return { label: "Scheduled", color: "default" };
    return { label: "Active", color: "secondary" };
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="modern-page-background p-6 space-y-8">
      {/* Modern Header */}
      <ModernPageHeader
        title="Patient Management"
        description="Comprehensive patient registration and medical record management"
        icon={Users}
        gradient="primary"
      >
        <ModernActionButton
          variant="success"
          size="lg"
          icon={UserPlus}
          onClick={() => setShowPatientForm(true)}
          className="shadow-2xl"
        >
          Register New Patient
        </ModernActionButton>
      </ModernPageHeader>

      {/* Main Tabs - Patients and Appointments */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white border rounded-lg p-1 shadow-sm mb-6">
          <TabsTrigger 
            value="patients" 
            className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            data-testid="main-tab-patients"
          >
            <Users className="h-5 w-5" />
            <span>Patients</span>
            <Badge variant="secondary" className="ml-2">{stats.total}</Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="appointments" 
            className="flex items-center space-x-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
            data-testid="main-tab-appointments"
          >
            <Calendar className="h-5 w-5" />
            <span>Appointments</span>
          </TabsTrigger>
        </TabsList>

        {/* Patients Tab Content */}
        <TabsContent value="patients" className="space-y-6">

      {/* Statistics Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <ModernStatsCard
          title="Total Patients"
          value={stats.total}
          change="12%"
          changeType="positive"
          icon={Users}
          color="blue"
        />
        <ModernStatsCard
          title="Active Patients"
          value={stats.active}
          change="8%"
          changeType="positive"
          icon={Activity}
          color="emerald"
        />
        <ModernStatsCard
          title="New This Month"
          value={stats.newThisMonth}
          change="15%"
          changeType="positive"
          icon={TrendingUp}
          color="purple"
        />
        <ModernStatsCard
          title="With Insurance"
          value={stats.withInsurance}
          change="5%"
          changeType="positive"
          icon={Heart}
          color="amber"
        />
      </motion.div>

      {/* Modern Tab Navigation */}
      <ModernTabHeader
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="modern-card">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search patients by name, email, phone, or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="modern-form-input pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 modern-form-input">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 modern-form-input">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="date">Date Added</SelectItem>
                    <SelectItem value="visits">Visit Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="modern-glass-effect">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" className="modern-glass-effect">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Patients Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="modern-table">
          <CardHeader className="modern-table-header">
            <CardTitle className="text-white">
              Patient Records ({filteredPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-500 border-t-transparent"></div>
              </div>
            ) : paginatedPatients.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchTerm ? "No patients found" : "No patients yet"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? "Try adjusting your search criteria" 
                    : "Get started by registering your first patient"}
                </p>
                {!searchTerm && (
                  <ModernActionButton
                    variant="primary"
                    icon={UserPlus}
                    onClick={() => setShowPatientForm(true)}
                  >
                    Register First Patient
                  </ModernActionButton>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="modern-table-header">
                    <TableHead className="text-white font-semibold">Patient</TableHead>
                    <TableHead className="text-white font-semibold">Contact</TableHead>
                    <TableHead className="text-white font-semibold">Age/Gender</TableHead>
                    <TableHead className="text-white font-semibold">Status</TableHead>
                    <TableHead className="text-white font-semibold">Last Visit</TableHead>
                    <TableHead className="text-white font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPatients.map((patient, index) => {
                    const status = getPatientStatus(patient);
                    
                    return (
                      <motion.tr
                        key={patient.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="modern-table-row"
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {patient.firstName[0]}{patient.lastName[0]}
                            </div>
                            <div>
                              <div className="font-semibold">
                                {patient.firstName} {patient.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {patient.patientCode}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-2 text-gray-400" />
                              {patient.phone}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-3 w-3 mr-2 text-gray-400" />
                              {patient.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {calculateAge(patient.dateOfBirth)} years
                            </div>
                            <div className="text-sm text-gray-600 capitalize">
                              {patient.gender}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.color as any}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {patient.lastVisit 
                              ? new Date(patient.lastVisit).toLocaleDateString()
                              : "No visits yet"
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="modern-glass-effect">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Patient
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule Appointment
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Patient
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center space-x-2"
        >
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="modern-glass-effect"
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "bg-gradient-to-r from-sky-500 to-blue-600" : "modern-glass-effect"}
            >
              {page}
            </Button>
          ))}
          <Button 
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="modern-glass-effect"
          >
            Next
          </Button>
        </motion.div>
      )}
        </TabsContent>

        {/* Appointments Tab Content */}
        <TabsContent value="appointments" className="space-y-6">
          <AppointmentsManagement />
        </TabsContent>
      </Tabs>

      {/* Patient Registration Modal */}
      <Dialog open={showPatientForm} onOpenChange={setShowPatientForm}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto modern-glass-effect">
          <ComprehensivePatientForm 
            onSuccess={() => {
              setShowPatientForm(false);
              queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
            }}
            onCancel={() => setShowPatientForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientsModern;