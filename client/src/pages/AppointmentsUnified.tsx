import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Stethoscope,
  Users,
  TrendingUp,
  CalendarDays,
  Timer,
  UserCheck,
  Eye,
  Star,
  ArrowLeft
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

import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AppointmentForm from "@/components/appointments/AppointmentForm";

type AppointmentStatus = 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
type AppointmentPriority = 'low' | 'medium' | 'high' | 'urgent';
type PaymentStatus = 'pending' | 'paid' | 'partial' | 'cancelled';
type ViewMode = 'all' | 'patient' | 'patient-specific';

interface Appointment {
  id: string;
  appointmentNumber?: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  serviceType?: string;
  status: AppointmentStatus;
  duration: number;
  notes?: string;
  doctorName?: string;
  doctorId?: string;
  reason?: string;
  priority: AppointmentPriority;
  appointmentFee?: number;
  paymentStatus?: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface AppointmentsUnifiedProps {
  patientId?: string; // Optional: if provided, shows patient-specific view
  viewMode?: ViewMode;
  showBackButton?: boolean;
}

const AppointmentsUnified: React.FC<AppointmentsUnifiedProps> = ({ 
  patientId, 
  viewMode = 'all',
  showBackButton = false 
}) => {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>(viewMode);
  const [currentPatientId, setCurrentPatientId] = useState<string | undefined>(patientId);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Parse URL parameters for patient-specific view
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlPatientId = urlParams.get('patientId');
    const urlTab = urlParams.get('tab');
    
    if (urlPatientId) {
      setCurrentPatientId(urlPatientId);
      setCurrentViewMode('patient-specific');
    } else if (urlTab === 'appointments') {
      setCurrentViewMode('all');
    }
  }, [location]);

  // Fetch appointments
  const { data: rawAppointments = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/medical-appointments"],
  });
  
  // Fetch patients for dropdown and patient names
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });
  
  // Normalize backend payload to UI shape expected by this page
  const normalizeStatus = (status: string): AppointmentStatus => {
    if (!status) return "scheduled";
    switch (status) {
      case "in_progress":
        return "in-progress";
      case "no_show":
        return "no-show";
      default:
        return status as AppointmentStatus;
    }
  };

  const formatTimeFromDate = (dateStr?: string): string => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const appointments: Appointment[] = (rawAppointments as any[]).map((a: any) => ({
    id: a.id,
    appointmentNumber: a.appointmentNumber,
    patientId: a.patientId,
    patientName: a.patientName || (a.patientFirstName && a.patientLastName ? `${a.patientFirstName} ${a.patientLastName}` : "Unknown Patient"),
    appointmentDate: a.appointmentDate,
    appointmentTime: a.appointmentTime || formatTimeFromDate(a.appointmentDate),
    appointmentType: a.appointmentType || a.service || a.serviceType || "General",
    serviceType: a.service || a.serviceType,
    status: normalizeStatus(a.status),
    duration: a.duration ?? 30,
    notes: a.notes,
    doctorName: a.doctorName || a?.customFields?.doctor?.name || a?.customFields?.uiMeta?.providerName,
    doctorId: a.doctorId || a?.customFields?.doctor?.id,
    reason: a.reason,
    priority: (a.priority || a?.customFields?.uiMeta?.priority || "medium") as AppointmentPriority,
    appointmentFee: a.appointmentFee ?? a?.customFields?.pricing?.appointmentFee,
    paymentStatus: (a.paymentStatus ?? a?.customFields?.pricing?.paymentStatus) as PaymentStatus,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }));
  
  // Filter appointments based on current view mode and filters
  const filteredAppointments = appointments.filter(appointment => {
    // Patient-specific filtering
    if (currentViewMode === 'patient-specific' && currentPatientId) {
      if (appointment.patientId !== currentPatientId) return false;
    }

    // Search term filtering
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        appointment.patientName?.toLowerCase().includes(searchLower) ||
        appointment.appointmentType?.toLowerCase().includes(searchLower) ||
        appointment.doctorName?.toLowerCase().includes(searchLower) ||
        appointment.appointmentNumber?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filtering
    if (statusFilter !== "all" && appointment.status !== statusFilter) {
      return false;
    }

    // Priority filtering
    if (priorityFilter !== "all" && appointment.priority !== priorityFilter) {
      return false;
    }

    return true;
  }).sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());

  // Get current patient info for patient-specific view
  const currentPatient = currentPatientId ? 
    patients.find(p => p.id === currentPatientId) : null;

  // Statistics calculation
  const stats = {
    total: filteredAppointments.length,
    scheduled: filteredAppointments.filter(a => a.status === 'scheduled').length,
    confirmed: filteredAppointments.filter(a => a.status === 'confirmed').length,
    completed: filteredAppointments.filter(a => a.status === 'completed').length,
    cancelled: filteredAppointments.filter(a => a.status === 'cancelled').length,
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: AppointmentPriority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBackToPatients = () => {
    setLocation('/patients');
  };

  const handleViewAllAppointments = () => {
    setCurrentViewMode('all');
    setCurrentPatientId(undefined);
    setLocation('/appointments');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBackToPatients}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Patients</span>
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentViewMode === 'patient-specific' && currentPatient
                ? `${currentPatient.firstName} ${currentPatient.lastName} - Appointments`
                : 'Appointments Management'
              }
            </h1>
            <p className="text-gray-600 mt-1">
              {currentViewMode === 'patient-specific'
                ? 'View and manage patient-specific appointments'
                : 'Comprehensive appointment scheduling and management system'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!showBackButton && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBackToPatients}
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>View Patients</span>
            </Button>
          )}
        </div>
      </div>
        
      <div className="flex items-center space-x-3">
          {currentViewMode === 'patient-specific' && (
            <Button 
              variant="outline" 
              onClick={handleViewAllAppointments}
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>View All Appointments</span>
            </Button>
          )}
          <ModernActionButton
            onClick={() => setShowAppointmentForm(true)}
            icon={Plus}
          >
            New Appointment
          </ModernActionButton>
        </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <ModernStatsCard
          title="Total Appointments"
          value={stats.total.toString()}
          icon={Calendar}
          change="+12%"
          changeType="positive"
        />
        <ModernStatsCard
          title="Scheduled"
          value={stats.scheduled.toString()}
          icon={Clock}
          change="+5%"
          changeType="positive"
        />
        <ModernStatsCard
          title="Confirmed"
          value={stats.confirmed.toString()}
          icon={CheckCircle}
          change="+8%"
          changeType="positive"
        />
        <ModernStatsCard
          title="Completed"
          value={stats.completed.toString()}
          icon={UserCheck}
          change="+15%"
          changeType="positive"
        />
        <ModernStatsCard
          title="Cancelled"
          value={stats.cancelled.toString()}
          icon={AlertCircle}
          change="-3%"
          changeType="negative"
        />
      </div>

      {/* Filters and Search */}
      <Card className="modern-glass-effect">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card className="modern-glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Appointments ({filteredAppointments.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No appointments found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Appointment #</TableHead>
                    {currentViewMode === 'all' && <TableHead>Patient</TableHead>}
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {appointment.appointmentNumber || `APT-${appointment.id.slice(-6)}`}
                      </TableCell>
                      {currentViewMode === 'all' && (
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{appointment.patientName}</span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {new Date(appointment.appointmentDate).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {appointment.appointmentTime}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{appointment.appointmentType}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="h-4 w-4 text-gray-400" />
                          <span>{appointment.doctorName || 'Not assigned'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(appointment.priority)}>
                          {appointment.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {appointment.appointmentFee ? `$${appointment.appointmentFee}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowAppointmentForm(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Cancel
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

      {/* Appointment Form Modal */}
      <Dialog open={showAppointmentForm} onOpenChange={setShowAppointmentForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AppointmentForm
            editingAppointment={selectedAppointment}
            onSuccess={() => {
              setShowAppointmentForm(false);
              setSelectedAppointment(null);
            }}
            onCancel={() => {
              setShowAppointmentForm(false);
              setSelectedAppointment(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsUnified;