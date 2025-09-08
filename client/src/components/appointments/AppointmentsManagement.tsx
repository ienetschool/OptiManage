import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
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
  Star
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
import ModernAppointmentForm from "@/components/forms/ModernAppointmentForm";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Appointment {
  id: string;
  appointmentNumber?: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  serviceType?: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  duration: number;
  notes?: string;
  doctorName?: string;
  doctorId?: string;
  reason?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  appointmentFee?: number;
  paymentStatus?: 'pending' | 'paid' | 'partial' | 'cancelled';
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

const AppointmentsManagement: React.FC = () => {
  const [activeView, setActiveView] = useState("list");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch appointments
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  // Fetch patients for dropdown
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      (appointment.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.doctorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.reason || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    const matchesType = typeFilter === "all" || appointment.appointmentType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Get today's appointments
  const todayAppointments = appointments.filter(
    apt => apt.appointmentDate === new Date().toISOString().split('T')[0]
  );

  // Calculate statistics
  const stats = {
    total: appointments.length,
    today: todayAppointments.length,
    confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
    completed: appointments.filter(apt => apt.status === 'completed').length,
    pending: appointments.filter(apt => apt.status === 'scheduled').length,
    cancelled: appointments.filter(apt => apt.status === 'cancelled').length
  };

  // Get status color
  const getStatusColor = (status: Appointment['status']) => {
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

  // Get priority color
  const getPriorityColor = (priority: Appointment['priority']) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Delete appointment mutation
  const deleteAppointmentMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/appointments/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "✅ Success!",
        description: "Appointment has been deleted successfully.",
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "❌ Error",
        description: "Failed to delete appointment. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  // Update appointment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Appointment['status'] }) => 
      apiRequest(`/api/appointments/${id}`, "PATCH", { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "✅ Status Updated!",
        description: "Appointment status has been updated successfully.",
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "❌ Error",
        description: "Failed to update appointment status. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  return (
    <div className="space-y-6" data-testid="appointments-management">
      {/* Header */}
      <ModernPageHeader
        title="Appointments Management"
        description="Schedule, track, and manage patient appointments efficiently"
        icon={Calendar}
      >
        <ModernActionButton
          onClick={() => setShowCreateDialog(true)}
          icon={Plus}
          data-testid="button-create-appointment"
        >
          Schedule New Appointment
        </ModernActionButton>
      </ModernPageHeader>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatsCard
          title="Total Appointments"
          value={stats.total}
          icon={CalendarDays}
          color="blue"
        />
        <ModernStatsCard
          title="Today's Appointments"
          value={stats.today}
          icon={Clock}
          color="emerald"
        />
        <ModernStatsCard
          title="Confirmed"
          value={stats.confirmed}
          icon={CheckCircle}
          color="emerald"
        />
        <ModernStatsCard
          title="Completed"
          value={stats.completed}
          icon={UserCheck}
          color="purple"
        />
      </div>

      {/* Main Content */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white border rounded-lg p-1 shadow-sm">
          <TabsTrigger 
            value="list" 
            className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            data-testid="tab-list"
          >
            <Users className="h-4 w-4" />
            <span>List ({filteredAppointments.length})</span>
          </TabsTrigger>
          <TabsTrigger 
            value="calendar" 
            className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            data-testid="tab-calendar"
          >
            <Calendar className="h-4 w-4" />
            <span>Calendar</span>
          </TabsTrigger>
          <TabsTrigger 
            value="today" 
            className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            data-testid="tab-today"
          >
            <Clock className="h-4 w-4" />
            <span>Today ({stats.today})</span>
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            data-testid="tab-analytics"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by patient name, doctor, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
                data-testid="input-search-appointments"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 h-12" data-testid="select-status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no-show">No Show</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48 h-12" data-testid="select-type-filter">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="eye-exam">Eye Exam</SelectItem>
              <SelectItem value="follow-up">Follow-up</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="contact-fitting">Contact Fitting</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Appointments List Tab */}
        <TabsContent value="list" className="space-y-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>All Appointments ({filteredAppointments.length})</span>
              </CardTitle>
              <CardDescription className="text-blue-100">
                Manage and track all patient appointments
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading appointments...</p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                      ? "Try adjusting your search criteria or filters."
                      : "Get started by scheduling your first appointment."}
                  </p>
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    data-testid="button-create-first-appointment"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule First Appointment
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Appointment #</TableHead>
                      <TableHead className="font-semibold">Patient Name</TableHead>
                      <TableHead className="font-semibold">Service</TableHead>
                      <TableHead className="font-semibold">Date & Time</TableHead>
                      <TableHead className="font-semibold">Fee</TableHead>
                      <TableHead className="font-semibold">Payment</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredAppointments.map((appointment, index) => (
                        <motion.tr
                          key={appointment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className="hover:bg-blue-50 border-b border-gray-100"
                          data-testid={`row-appointment-${appointment.id}`}
                        >
                          {/* Appointment # */}
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              #{appointment.appointmentNumber || appointment.id.slice(-6)}
                            </div>
                          </TableCell>
                          
                          {/* Patient Name */}
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {(appointment.patientName || 'U U').split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{appointment.patientName || 'Unknown Patient'}</div>
                                <div className="text-sm text-gray-500">ID: {(appointment.patientId || 'unknown').slice(-6)}</div>
                              </div>
                            </div>
                          </TableCell>
                          
                          {/* Service */}
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {(appointment.appointmentType || appointment.serviceType || 'consultation').replace('-', ' ')}
                            </Badge>
                          </TableCell>
                          
                          {/* Date & Time */}
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">
                                  {new Date(appointment.appointmentDate).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">{appointment.appointmentTime}</span>
                              </div>
                            </div>
                          </TableCell>
                          
                          {/* Fee */}
                          <TableCell>
                            <div className="font-medium">
                              ${appointment.appointmentFee?.toFixed(2) || '0.00'}
                            </div>
                          </TableCell>
                          
                          {/* Payment */}
                          <TableCell>
                            <Badge className={`capitalize border-0 ${
                              appointment.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                              appointment.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                              appointment.paymentStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.paymentStatus || 'pending'}
                            </Badge>
                          </TableCell>
                          
                          {/* Status */}
                          <TableCell>
                            <Badge className={`${getStatusColor(appointment.status)} capitalize border-0`}>
                              {appointment.status.replace('-', ' ')}
                            </Badge>
                          </TableCell>
                          {/* Actions */}
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  data-testid={`button-actions-${appointment.id}`}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => setSelectedAppointment(appointment)}
                                  data-testid={`action-view-${appointment.id}`}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setShowCreateDialog(true);
                                  }}
                                  data-testid={`action-edit-${appointment.id}`}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Appointment
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => updateStatusMutation.mutate({ id: appointment.id, status: 'confirmed' })}
                                  disabled={appointment.status === 'confirmed'}
                                  data-testid={`action-confirm-${appointment.id}`}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Confirm
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => deleteAppointmentMutation.mutate(appointment.id)}
                                  className="text-red-600"
                                  data-testid={`action-delete-${appointment.id}`}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar View Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Calendar View</span>
              </CardTitle>
              <CardDescription className="text-cyan-100">
                Visual calendar for appointment scheduling and management
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View Coming Soon</h3>
                <p className="text-gray-600">
                  Interactive calendar view for visual appointment management is under development.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Today's Schedule Tab */}
        <TabsContent value="today" className="space-y-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Today's Schedule ({stats.today})</span>
              </CardTitle>
              <CardDescription className="text-green-100">
                Overview of today's appointments and schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {todayAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments today</h3>
                  <p className="text-gray-600 mb-4">You have a clear schedule for today.</p>
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule New Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayAppointments
                    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
                    .map((appointment) => (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                        data-testid={`today-appointment-${appointment.id}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {appointment.appointmentTime}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                            <p className="text-sm text-gray-600 capitalize">
                              {appointment.appointmentType.replace('-', ' ')} • {appointment.doctorName || 'Unassigned'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getStatusColor(appointment.status)} capitalize border-0`}>
                            {appointment.status.replace('-', ' ')}
                          </Badge>
                          <Badge className={`${getPriorityColor(appointment.priority)} capitalize border-0`}>
                            {appointment.priority}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Appointment Analytics</span>
              </CardTitle>
              <CardDescription className="text-purple-100">
                Insights and analytics for appointment management
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
                <p className="text-gray-600">
                  Comprehensive analytics and reporting features are being developed.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Appointment Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto modern-glass-effect">
          <ModernAppointmentForm
            onSuccess={() => setShowCreateDialog(false)}
            onCancel={() => setShowCreateDialog(false)}
            editingAppointment={selectedAppointment}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsManagement;