import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope,
  DollarSign,
  FileText,
  Users,
  CalendarDays,
  CreditCard,
  Eye,
  Glasses,
  Activity,
  Heart,
  CheckCircle,
  AlertTriangle,
  Plus
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Enhanced Appointment Schema with comprehensive validation
const appointmentSchema = z.object({
  // Patient & Service
  patientId: z.string().min(1, "Please select a patient"),
  serviceType: z.enum([
    "consultation", 
    "eye-exam", 
    "contact-fitting", 
    "follow-up", 
    "prescription-update", 
    "emergency", 
    "routine-checkup",
    "glasses-fitting",
    "surgery",
    "other"
  ], { required_error: "Please select service type" }),
  
  // Schedule
  appointmentDate: z.string().min(1, "Appointment date is required"),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  duration: z.number().min(15, "Duration must be at least 15 minutes").max(240, "Duration cannot exceed 4 hours").default(30),
  doctorId: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  
  // Payment
  appointmentFee: z.number().min(0, "Fee must be non-negative").default(0),
  paymentStatus: z.enum(["pending", "paid", "partial", "cancelled"]).default("pending"),
  paymentMethod: z.enum(["cash", "card", "insurance", "online"]).optional(),
  
  // Details
  chiefComplaint: z.string().optional(),
  notes: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().optional(),
  status: z.enum(["scheduled", "confirmed", "in-progress", "completed", "cancelled", "no-show"]).default("scheduled"),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  patientCode?: string;
  dateOfBirth?: string;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization?: string;
  consultationFee?: number;
}

interface CompactAppointmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editingAppointment?: any;
}

const CompactAppointmentForm: React.FC<CompactAppointmentFormProps> = ({ 
  onSuccess, 
  onCancel, 
  editingAppointment 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("patient");

  // Fetch patients and doctors
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
  });

  // Form configuration
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: editingAppointment ? {
      patientId: editingAppointment.patientId,
      appointmentDate: editingAppointment.appointmentDate,
      appointmentTime: editingAppointment.appointmentTime,
      serviceType: editingAppointment.appointmentType || editingAppointment.serviceType || "consultation",
      duration: editingAppointment.duration || 30,
      doctorId: editingAppointment.doctorId || "",
      priority: editingAppointment.priority || "normal",
      appointmentFee: editingAppointment.appointmentFee || editingAppointment.fee || 0,
      paymentStatus: editingAppointment.paymentStatus || "pending",
      paymentMethod: editingAppointment.paymentMethod || "cash",
      chiefComplaint: editingAppointment.chiefComplaint || "",
      notes: editingAppointment.notes || "",
      followUpRequired: false,
      followUpDate: editingAppointment.followUpDate || "",
      status: editingAppointment.status || "scheduled",
    } : {
      patientId: "",
      appointmentDate: "",
      appointmentTime: "",
      serviceType: "consultation",
      duration: 30,
      doctorId: "",
      priority: "normal",
      appointmentFee: 0,
      paymentStatus: "pending",
      paymentMethod: "cash",
      chiefComplaint: "",
      notes: "",
      followUpRequired: false,
      followUpDate: "",
      status: "scheduled",
    },
  });

  // Create/Update appointment mutation
  const appointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      const endpoint = editingAppointment 
        ? `/api/appointments/${editingAppointment.id}`
        : "/api/appointments";
      const method = editingAppointment ? "PATCH" : "POST";
      
      // Add patient name for display
      const selectedPatient = patients.find(p => p.id === data.patientId);
      const selectedDoctor = doctors.find(d => d.id === data.doctorId);
      
      const appointmentData = {
        ...data,
        appointmentType: data.serviceType, // Map to the expected field
        patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : "Unknown Patient",
        patientCode: selectedPatient?.patientCode || "",
        doctorName: selectedDoctor ? `${selectedDoctor.firstName} ${selectedDoctor.lastName}` : "",
        fee: data.appointmentFee, // Map for compatibility
        appointmentNumber: editingAppointment?.appointmentNumber || `APT-${Date.now()}`,
      };
      
      return apiRequest(method, endpoint, appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "✅ Success!",
        description: `Appointment has been ${editingAppointment ? 'updated' : 'scheduled'} successfully.`,
        duration: 3000,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || `Failed to ${editingAppointment ? 'update' : 'schedule'} appointment. Please try again.`,
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  // Submit form
  const onSubmit = async (data: AppointmentFormData) => {
    appointmentMutation.mutate(data);
  };

  // Service type options
  const serviceTypes = [
    { value: "consultation", label: "Initial Consultation", icon: User },
    { value: "eye-exam", label: "Comprehensive Eye Exam", icon: Eye },
    { value: "contact-fitting", label: "Contact Lens Fitting", icon: Heart },
    { value: "follow-up", label: "Follow-up Visit", icon: CheckCircle },
    { value: "prescription-update", label: "Prescription Update", icon: Glasses },
    { value: "emergency", label: "Emergency Visit", icon: AlertTriangle },
    { value: "routine-checkup", label: "Routine Checkup", icon: Stethoscope },
    { value: "glasses-fitting", label: "Glasses Fitting", icon: Glasses },
    { value: "surgery", label: "Surgery", icon: Activity },
    { value: "other", label: "Other", icon: Plus }
  ];

  const priorities = [
    { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
    { value: "normal", label: "Normal", color: "bg-blue-100 text-blue-800" },
    { value: "high", label: "High", color: "bg-yellow-100 text-yellow-800" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" }
  ];

  const paymentMethods = [
    { value: "cash", label: "Cash", icon: DollarSign },
    { value: "card", label: "Card", icon: CreditCard },
    { value: "insurance", label: "Insurance", icon: User },
    { value: "online", label: "Online", icon: Activity }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto" data-testid="compact-appointment-form">
      {/* Header */}
      <DialogHeader className="mb-6">
        <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {editingAppointment ? 'Update Appointment' : 'Schedule New Appointment'}
        </DialogTitle>
        <DialogDescription className="text-center text-gray-600">
          {editingAppointment ? 'Update appointment details' : 'Complete the form to schedule a new appointment'}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="patient" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Patient & Service</span>
                <span className="sm:hidden">Patient</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center space-x-2">
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">Schedule</span>
                <span className="sm:hidden">Time</span>
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Payment</span>
                <span className="sm:hidden">Pay</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Details</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patient" className="space-y-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 rounded-full bg-blue-500 text-white">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Patient & Service</h3>
                      <p className="text-sm text-gray-600">Select patient and service type</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-1 font-medium">
                            <span>Patient</span>
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11" data-testid="select-patient">
                                <SelectValue placeholder="Select a patient" />
                              </SelectTrigger>
                              <SelectContent>
                                {patients.map((patient) => (
                                  <SelectItem key={patient.id} value={patient.id}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {patient.firstName} {patient.lastName}
                                      </span>
                                      {patient.patientCode && (
                                        <span className="text-xs text-gray-500">
                                          {patient.patientCode}
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-1 font-medium">
                            <span>Service Type</span>
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11" data-testid="select-service">
                                <SelectValue placeholder="Select service type" />
                              </SelectTrigger>
                              <SelectContent>
                                {serviceTypes.map((service) => (
                                  <SelectItem key={service.value} value={service.value}>
                                    <div className="flex items-center space-x-2">
                                      {React.createElement(service.icon, { className: "h-4 w-4" })}
                                      <span>{service.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 rounded-full bg-green-500 text-white">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
                      <p className="text-sm text-gray-600">Set date, time and assign doctor</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="appointmentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-1 font-medium">
                            <span>Date</span>
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                              className="h-11"
                              data-testid="input-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="appointmentTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-1 font-medium">
                            <span>Time</span>
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="time"
                              className="h-11"
                              data-testid="input-time"
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
                          <FormLabel className="font-medium">Duration</FormLabel>
                          <FormControl>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                              <SelectTrigger className="h-11" data-testid="select-duration">
                                <SelectValue placeholder="Duration" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 min</SelectItem>
                                <SelectItem value="30">30 min</SelectItem>
                                <SelectItem value="45">45 min</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="90">1.5 hours</SelectItem>
                                <SelectItem value="120">2 hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="doctorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium flex items-center space-x-1">
                            <span>Doctor</span>
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11" data-testid="select-doctor">
                                <SelectValue placeholder="Select doctor *" />
                              </SelectTrigger>
                              <SelectContent>
                                {doctors.map((doctor) => (
                                  <SelectItem key={doctor.id} value={doctor.id}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        Dr. {doctor.firstName} {doctor.lastName}
                                      </span>
                                      {doctor.specialization && (
                                        <span className="text-xs text-gray-500">
                                          {doctor.specialization}
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription className="text-xs">
                            Required
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Priority</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11" data-testid="select-priority">
                                <SelectValue placeholder="Priority" />
                              </SelectTrigger>
                              <SelectContent>
                                {priorities.map((priority) => (
                                  <SelectItem key={priority.value} value={priority.value}>
                                    <Badge className={priority.color}>
                                      {priority.label}
                                    </Badge>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="space-y-4">
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 rounded-full bg-purple-500 text-white">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Payment</h3>
                      <p className="text-sm text-gray-600">Configure fees and payment details</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="appointmentFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Fee</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input 
                                {...field} 
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="h-11 pl-10"
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                data-testid="input-fee"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Status</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11" data-testid="select-payment-status">
                                <SelectValue placeholder="Payment status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="partial">Partial</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Method</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11" data-testid="select-payment-method">
                                <SelectValue placeholder="Payment method" />
                              </SelectTrigger>
                              <SelectContent>
                                {paymentMethods.map((method) => (
                                  <SelectItem key={method.value} value={method.value}>
                                    <div className="flex items-center space-x-2">
                                      {React.createElement(method.icon, { className: "h-4 w-4" })}
                                      <span>{method.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 rounded-full bg-orange-500 text-white">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Details</h3>
                      <p className="text-sm text-gray-600">Additional notes and follow-up</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="chiefComplaint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Chief Complaint</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Patient's primary concern or reason for visit..."
                              className="min-h-[80px] resize-none"
                              data-testid="textarea-complaint"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Main reason for the appointment
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Additional notes for staff or doctor reference..."
                              className="min-h-[80px] resize-none"
                              data-testid="textarea-notes"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Optional notes for staff or doctor reference
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <FormField
                          control={form.control}
                          name="followUpRequired"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-4 h-4 text-orange-600 border rounded focus:ring-orange-500"
                                  data-testid="checkbox-followup"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-medium">
                                Follow-up Required
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>

                      {form.watch("followUpRequired") && (
                        <FormField
                          control={form.control}
                          name="followUpDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium text-sm">Follow-up Date</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="date"
                                  min={new Date().toISOString().split('T')[0]}
                                  className="h-10"
                                  data-testid="input-followup-date"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Appointment Status</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11" data-testid="select-status">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="no-show">No Show</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t bg-gray-50 p-4 rounded-lg">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-6"
              data-testid="button-cancel"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={appointmentMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 px-8"
              data-testid="button-submit"
            >
              {appointmentMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>{editingAppointment ? 'Updating...' : 'Scheduling...'}</span>
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{editingAppointment ? 'Update Appointment' : 'Schedule Appointment'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CompactAppointmentForm;