import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  Plus,
  UserPlus,
  Heart,
  Activity
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Enhanced Appointment Schema
const appointmentSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  appointmentDate: z.string().min(1, "Appointment date is required"),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  appointmentType: z.enum([
    "consultation", 
    "eye-exam", 
    "contact-fitting", 
    "follow-up", 
    "prescription-update", 
    "emergency", 
    "routine-checkup",
    "glasses-fitting",
    "other"
  ], { required_error: "Please select appointment type" }),
  duration: z.number().min(15, "Duration must be at least 15 minutes").max(240, "Duration cannot exceed 4 hours"),
  doctorName: z.string().optional(),
  reason: z.string().min(5, "Please provide a reason for the appointment").max(500, "Reason too long"),
  notes: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"], { required_error: "Please select priority" }),
  status: z.enum(["scheduled", "confirmed"], { required_error: "Please select status" }).default("scheduled"),
  reminderEnabled: z.boolean().default(true),
  followUpRequired: z.boolean().default(false)
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface AppointmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editingAppointment?: any;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  onSuccess, 
  onCancel, 
  editingAppointment 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch patients for dropdown
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  // Form configuration
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: editingAppointment ? {
      patientId: editingAppointment.patientId,
      appointmentDate: editingAppointment.appointmentDate,
      appointmentTime: editingAppointment.appointmentTime,
      appointmentType: editingAppointment.appointmentType,
      duration: editingAppointment.duration || 60,
      doctorName: editingAppointment.doctorName || "",
      reason: editingAppointment.reason || "",
      notes: editingAppointment.notes || "",
      priority: editingAppointment.priority || "medium",
      status: editingAppointment.status || "scheduled",
      reminderEnabled: true,
      followUpRequired: false
    } : {
      patientId: "",
      appointmentDate: "",
      appointmentTime: "",
      appointmentType: "consultation",
      duration: 60,
      doctorName: "",
      reason: "",
      notes: "",
      priority: "medium",
      status: "scheduled",
      reminderEnabled: true,
      followUpRequired: false
    },
  });

  // Create/Update appointment mutation
  const appointmentMutation = useMutation({
    mutationFn: (data: AppointmentFormData) => {
      const endpoint = editingAppointment 
        ? `/api/appointments/${editingAppointment.id}`
        : "/api/appointments";
      const method = editingAppointment ? "PATCH" : "POST";
      
      // Add patient name for display
      const selectedPatient = patients.find(p => p.id === data.patientId);
      const appointmentData = {
        ...data,
        patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : "Unknown Patient"
      };
      
      return apiRequest(endpoint, method, appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
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

  // Appointment type options with descriptions
  const appointmentTypes = [
    { value: "consultation", label: "Initial Consultation", description: "First-time patient consultation", icon: User },
    { value: "eye-exam", label: "Comprehensive Eye Exam", description: "Complete vision and eye health assessment", icon: Activity },
    { value: "contact-fitting", label: "Contact Lens Fitting", description: "Contact lens fitting and training", icon: Heart },
    { value: "follow-up", label: "Follow-up Visit", description: "Follow-up after treatment or procedure", icon: CheckCircle },
    { value: "prescription-update", label: "Prescription Update", description: "Update glasses or contact prescription", icon: Calendar },
    { value: "emergency", label: "Emergency Visit", description: "Urgent eye care needs", icon: AlertTriangle },
    { value: "routine-checkup", label: "Routine Checkup", description: "Regular preventive eye care", icon: Stethoscope },
    { value: "glasses-fitting", label: "Glasses Fitting", description: "Glasses adjustment and fitting", icon: Activity },
    { value: "other", label: "Other", description: "Other appointment types", icon: Plus }
  ];

  // Doctor options
  const doctors = [
    "Dr. Sarah Johnson",
    "Dr. Michael Chen", 
    "Dr. Emily Rodriguez",
    "Dr. David Kim",
    "Dr. Lisa Thompson"
  ];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6" data-testid="appointment-form">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <DialogHeader>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex items-center justify-center space-x-2"
          >
            <Calendar className="h-8 w-8 text-cyan-600" />
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              {editingAppointment ? 'Update Appointment' : 'Schedule New Appointment'}
            </DialogTitle>
          </motion.div>
          <DialogDescription className="text-lg text-gray-600">
            {editingAppointment ? 'Update appointment details and preferences' : 'Schedule a new appointment with comprehensive details'}
          </DialogDescription>
        </DialogHeader>
      </motion.div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Step 1: Patient and Basic Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-lg border-l-4 border-cyan-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <User className="h-5 w-5 text-cyan-600" />
                <span>Patient & Appointment Details</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                        <User className="h-4 w-4" />
                        <span>Select Patient</span>
                        <span className="text-red-500 text-lg">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-12" data-testid="select-patient">
                            <SelectValue placeholder="Choose a patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {patients.map((patient) => (
                              <SelectItem key={patient.id} value={patient.id}>
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                    {patient.firstName[0]}{patient.lastName[0]}
                                  </div>
                                  <div>
                                    <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                                    <div className="text-sm text-gray-500">{patient.email}</div>
                                  </div>
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
                  name="appointmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                        <Stethoscope className="h-4 w-4" />
                        <span>Appointment Type</span>
                        <span className="text-red-500 text-lg">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-12" data-testid="select-appointment-type">
                            <SelectValue placeholder="Select appointment type" />
                          </SelectTrigger>
                          <SelectContent>
                            {appointmentTypes.map((type) => {
                              const IconComponent = type.icon;
                              return (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center space-x-3">
                                    <IconComponent className="h-4 w-4 text-cyan-600" />
                                    <div>
                                      <div className="font-medium">{type.label}</div>
                                      <div className="text-sm text-gray-500">{type.description}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                        <Calendar className="h-4 w-4" />
                        <span>Appointment Date</span>
                        <span className="text-red-500 text-lg">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          className="h-12"
                          data-testid="input-appointment-date"
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
                      <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                        <Clock className="h-4 w-4" />
                        <span>Appointment Time</span>
                        <span className="text-red-500 text-lg">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="time"
                          className="h-12"
                          data-testid="input-appointment-time"
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
                      <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                        <Clock className="h-4 w-4" />
                        <span>Duration (minutes)</span>
                      </FormLabel>
                      <FormControl>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <SelectTrigger className="h-12" data-testid="select-duration">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
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
                  name="doctorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                        <Stethoscope className="h-4 w-4" />
                        <span>Assigned Doctor</span>
                      </FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-12" data-testid="select-doctor">
                            <SelectValue placeholder="Assign doctor (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {doctors.map((doctor) => (
                              <SelectItem key={doctor} value={doctor}>
                                {doctor}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Leave empty if not assigned yet
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Step 2: Additional Details */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span>Additional Details</span>
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Priority Level</span>
                          <span className="text-red-500 text-lg">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12" data-testid="select-priority">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                  <span>Low Priority</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="medium">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                  <span>Medium Priority</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="high">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                  <span>High Priority</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="urgent">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                  <span>Urgent</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                          <CheckCircle className="h-4 w-4" />
                          <span>Initial Status</span>
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12" data-testid="select-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Set the initial appointment status
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                        <Heart className="h-4 w-4" />
                        <span>Reason for Appointment</span>
                        <span className="text-red-500 text-lg">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Please describe the reason for this appointment, symptoms, or specific concerns..."
                          className="min-h-[100px]"
                          data-testid="textarea-reason"
                        />
                      </FormControl>
                      <FormDescription>
                        Provide details about the purpose of this appointment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                        <Plus className="h-4 w-4" />
                        <span>Additional Notes</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Any additional notes, special requirements, or instructions..."
                          className="min-h-[80px]"
                          data-testid="textarea-notes"
                        />
                      </FormControl>
                      <FormDescription>
                        Optional notes for staff or doctor reference
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              data-testid="button-cancel"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={appointmentMutation.isPending}
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              data-testid="button-submit"
            >
              {appointmentMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{editingAppointment ? 'Updating...' : 'Scheduling...'}</span>
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
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

export default AppointmentForm;