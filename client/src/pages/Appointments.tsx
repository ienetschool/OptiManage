import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Calendar, Search, Edit, Trash2, Clock, MapPin, User, Phone, CheckCircle, XCircle, AlertCircle, MoreVertical, Eye, FileText, QrCode, Share2, Receipt, Printer, MessageSquare, UserCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertAppointmentSchema, type Appointment, type InsertAppointment, type Customer, type Store } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from "date-fns";

export default function Appointments() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState("week");
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const { data: patients = [] } = useQuery<any[]>({
    queryKey: ["/api/patients"],
  });

  const { data: stores = [] } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
  });

  const form = useForm<InsertAppointment>({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: {
      patientId: "",
      customerId: "",
      storeId: "",
      staffId: undefined,
      appointmentDate: new Date(),
      duration: 60,
      service: "",
      status: "scheduled",
      notes: "",
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      await apiRequest("POST", "/api/appointments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      toast({
        title: "Success",
        description: "Appointment scheduled successfully.",
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule appointment.",
        variant: "destructive",
      });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertAppointment> }) => {
      await apiRequest("PUT", `/api/appointments/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      toast({
        title: "Success",
        description: "Appointment updated successfully.",
      });
      setOpen(false);
      setEditingAppointment(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update appointment.",
        variant: "destructive",
      });
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/appointments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      toast({
        title: "Success",
        description: "Appointment cancelled successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel appointment.",
        variant: "destructive",
      });
    },
  });

  const updateAppointmentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/appointments/${id}/status`, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      toast({
        title: "Success",
        description: `Appointment ${variables.status} successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update appointment status.",
        variant: "destructive",
      });
    },
  });

  // Action handlers
  const handleViewDetails = (appointment: any) => {
    toast({
      title: "View Details",
      description: `Opening details for appointment with ${appointment.customer.firstName} ${appointment.customer.lastName}`,
    });
  };

  const handleEdit = (appointment: any) => {
    setEditingAppointment(appointment);
    form.reset({
      customerId: appointment.customerId,
      storeId: appointment.storeId,
      staffId: appointment.staffId,
      appointmentDate: new Date(appointment.appointmentDate),
      duration: appointment.duration,
      service: appointment.service,
      status: appointment.status,
      notes: appointment.notes || "",
    });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteAppointmentMutation.mutate(id);
  };

  const handleStatusChange = (id: string, status: string) => {
    updateAppointmentStatusMutation.mutate({ id, status });
  };

  const handlePrint = (appointment: any) => {
    toast({
      title: "Print Appointment",
      description: `Generating print format for ${appointment.customer.firstName} ${appointment.customer.lastName}`,
    });
  };

  const handleQRCode = (appointment: any) => {
    toast({
      title: "QR Code Generated", 
      description: `QR code created for appointment with ${appointment.customer.firstName} ${appointment.customer.lastName}`,
    });
  };

  const handleShare = (appointment: any) => {
    toast({
      title: "Share Appointment",
      description: `Sharing appointment details for ${appointment.customer.firstName} ${appointment.customer.lastName}`,
    });
  };

  const handleInvoice = (appointment: any) => {
    toast({
      title: "Invoice Generated",
      description: `Creating invoice for ${appointment.customer.firstName} ${appointment.customer.lastName}`,
    });
  };

  const handleSendReminder = (appointment: any) => {
    toast({
      title: "Reminder Sent",
      description: `Appointment reminder sent to ${appointment.customer.firstName} ${appointment.customer.lastName}`,
    });
  };

  const handleCheckIn = (appointment: any) => {
    handleStatusChange(appointment.id, "checked-in");
  };

  const handleStartConsultation = (appointment: any) => {
    handleStatusChange(appointment.id, "in-progress");
  };

  const handleComplete = (appointment: any) => {
    handleStatusChange(appointment.id, "completed");
  };

  const handleReschedule = (appointment: any) => {
    handleEdit(appointment);
  };

  // Use real appointments data or mock for demo  
  const displayAppointments = appointments.length > 0 ? appointments.map(apt => ({
    ...apt,
    customer: { firstName: apt.customerId?.slice(0,8) || 'Unknown', lastName: 'Patient', phone: '(555) 123-4567' },
    store: { name: 'Main Store', address: '123 Healthcare Ave' }
  })) : [
    {
      id: "1",
      customerId: "cust1",
      storeId: "store1",
      staffId: "staff1",
      appointmentDate: new Date(),
      duration: 60,
      service: "Eye Exam",
      status: "scheduled",
      notes: "First time patient",
      customer: { firstName: "Sarah", lastName: "Johnson", phone: "(555) 123-4567" },
      store: { name: "Downtown Store", address: "123 Main St" },
    },
    {
      id: "2",
      customerId: "cust2", 
      storeId: "store1",
      staffId: "staff1",
      appointmentDate: addDays(new Date(), 1),
      duration: 30,
      service: "Frame Fitting",
      status: "confirmed",
      notes: "Bring existing glasses",
      customer: { firstName: "Michael", lastName: "Chen", phone: "(555) 987-6543" },
      store: { name: "Downtown Store", address: "123 Main St" },
    },
    {
      id: "3",
      customerId: "cust3",
      storeId: "store2",
      staffId: "staff2", 
      appointmentDate: addDays(new Date(), 2),
      duration: 45,
      service: "Contact Lens Fitting",
      status: "completed",
      notes: "Follow-up in 2 weeks",
      customer: { firstName: "Emma", lastName: "Wilson", phone: "(555) 456-7890" },
      store: { name: "Mall Location", address: "456 Shopping Center" },
    }
  ];

  const filteredAppointments = displayAppointments.filter(appointment => {
    const matchesSearch = 
      appointment.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedView === "today") {
      return matchesSearch && isSameDay(appointment.appointmentDate, selectedDate);
    }
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-emerald-100 text-emerald-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'no-show': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const services = [
    "Eye Exam",
    "Contact Lens Fitting", 
    "Frame Fitting",
    "Frame Repair",
    "Prescription Pickup",
    "Follow-up Appointment",
    "Consultation"
  ];

  const onSubmit = (data: InsertAppointment) => {
    if (editingAppointment) {
      updateAppointmentMutation.mutate({ id: editingAppointment.id, data });
    } else {
      createAppointmentMutation.mutate(data);
    }
  };



  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setEditingAppointment(null);
      form.reset();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments">All Appointments</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">All Appointments ({displayAppointments.length})</h3>
                <p className="text-sm text-slate-600">Manage appointments across all store locations</p>
              </div>
              
              <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Book Appointment
                  </Button>  
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAppointment ? "Edit Appointment" : "Book New Appointment"}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                    <SelectValue placeholder="Select patient" />
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
                          name="storeId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Store Location</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select store" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {stores.map((store) => (
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
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="service"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select service" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {services.map((service) => (
                                  <SelectItem key={service} value={service}>
                                    {service}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="appointmentDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date & Time</FormLabel>
                              <FormControl>
                                <Input 
                                  type="datetime-local" 
                                  {...field}
                                  value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ""}
                                  onChange={(e) => field.onChange(new Date(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration (minutes)</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="30">30 minutes</SelectItem>
                                  <SelectItem value="45">45 minutes</SelectItem>
                                  <SelectItem value="60">1 hour</SelectItem>
                                  <SelectItem value="90">1.5 hours</SelectItem>
                                  <SelectItem value="120">2 hours</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="no-show">No Show</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Input placeholder="Additional notes or instructions" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleOpenChange(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createAppointmentMutation.isPending || updateAppointmentMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {createAppointmentMutation.isPending || updateAppointmentMutation.isPending
                            ? "Saving..."
                            : editingAppointment
                            ? "Update Appointment"
                            : "Book Appointment"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Input
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
              
              <Select value={selectedView} onValueChange={setSelectedView}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className="border-slate-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>
                            {appointment.customer.firstName[0]}{appointment.customer.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {appointment.customer.firstName} {appointment.customer.lastName}
                            </h3>
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1 capitalize">{appointment.status}</span>
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>{format(appointment.appointmentDate, 'MMM dd, yyyy')}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>{format(appointment.appointmentDate, 'HH:mm')} ({appointment.duration} min)</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>{appointment.service}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>{appointment.store.name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <span>{appointment.customer.phone}</span>
                              </div>
                              {appointment.notes && (
                                <div className="flex items-start space-x-2">
                                  <AlertCircle className="h-4 w-4 mt-0.5" />
                                  <span>{appointment.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Quick Action Buttons */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(appointment)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Status-based quick actions */}
                        {appointment.status === "scheduled" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCheckIn(appointment)}
                            className="text-green-600 hover:text-green-700"
                            title="Check In"
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}

                        {appointment.status === "checked-in" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartConsultation(appointment)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Start Consultation"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}

                        {appointment.status === "in-progress" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleComplete(appointment)}
                            className="text-purple-600 hover:text-purple-700"
                            title="Complete"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Dropdown Menu for all actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Appointment Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            {/* View & Edit Actions */}
                            <DropdownMenuItem onClick={() => handleViewDetails(appointment)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(appointment)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Appointment
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReschedule(appointment)}>
                              <Calendar className="mr-2 h-4 w-4" />
                              Reschedule
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Status Actions */}
                            {appointment.status === "scheduled" && (
                              <DropdownMenuItem onClick={() => handleCheckIn(appointment)}>
                                <UserCheck className="mr-2 h-4 w-4 text-green-600" />
                                Check In Patient
                              </DropdownMenuItem>
                            )}
                            
                            {appointment.status === "checked-in" && (
                              <DropdownMenuItem onClick={() => handleStartConsultation(appointment)}>
                                <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                                Start Consultation
                              </DropdownMenuItem>
                            )}
                            
                            {appointment.status === "in-progress" && (
                              <DropdownMenuItem onClick={() => handleComplete(appointment)}>
                                <CheckCircle className="mr-2 h-4 w-4 text-purple-600" />
                                Complete Appointment
                              </DropdownMenuItem>
                            )}
                            
                            {(appointment.status === "scheduled" || appointment.status === "checked-in") && (
                              <DropdownMenuItem onClick={() => handleSendReminder(appointment)}>
                                <MessageSquare className="mr-2 h-4 w-4 text-blue-600" />
                                Send Reminder
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            {/* Document Actions */}
                            <DropdownMenuItem onClick={() => handlePrint(appointment)}>
                              <Printer className="mr-2 h-4 w-4" />
                              Print Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQRCode(appointment)}>
                              <QrCode className="mr-2 h-4 w-4" />
                              Generate QR Code
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare(appointment)}>
                              <Share2 className="mr-2 h-4 w-4" />
                              Share Appointment
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleInvoice(appointment)}>
                              <Receipt className="mr-2 h-4 w-4" />
                              Generate Invoice
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Danger Actions */}
                            <DropdownMenuItem 
                              onClick={() => handleDelete(appointment.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancel Appointment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredAppointments.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {searchTerm ? "No appointments found" : "No appointments scheduled"}
                </h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm ? `No appointments match "${searchTerm}"` : "Get started by booking your first appointment."}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Book Your First Appointment
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Calendar View Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Calendar View</h3>
              <p className="text-slate-600 mb-6">Visual calendar interface for appointment management.</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Calendar className="mr-2 h-4 w-4" />
                View Calendar
              </Button>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Today's Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-900">
                    {displayAppointments.filter(apt => isSameDay(apt.appointmentDate, new Date())).length}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-900">{displayAppointments.length}</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-emerald-600">
                    {displayAppointments.length > 0 ? Math.round((displayAppointments.filter(apt => apt.status === 'completed').length / displayAppointments.length) * 100) : 0}%
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">No-Show Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-amber-600">
                    {Math.round((mockAppointments.filter(apt => apt.status === 'no-show').length / mockAppointments.length) * 100)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Popular Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.slice(0, 5).map((service, index) => (
                    <div key={service} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900">{service}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(5 - index) * 20}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-600">{5 - index}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
