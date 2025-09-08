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
  Activity,
  DollarSign
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Enhanced Appointment Schema - matching the old UI structure
const appointmentSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  appointmentDate: z.string().min(1, "Appointment date is required"),
  appointmentTime: z.string().min(1, "Appointment time is required"),
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
  doctorId: z.string().optional(),
  appointmentFee: z.number().min(0, "Fee must be non-negative").default(0),
  paymentStatus: z.enum(["pending", "paid", "partial", "cancelled"], { required_error: "Please select payment status" }).default("pending"),
  notes: z.string().optional(),
  status: z.enum(["scheduled", "confirmed", "in-progress", "completed", "cancelled", "no-show"], { required_error: "Please select status" }).default("scheduled"),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  patientCode?: string;
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
      serviceType: editingAppointment.appointmentType || editingAppointment.serviceType || "consultation",
      doctorId: editingAppointment.doctorId || "",
      appointmentFee: editingAppointment.appointmentFee || 0,
      paymentStatus: editingAppointment.paymentStatus || "pending",
      notes: editingAppointment.notes || "",
      status: editingAppointment.status || "scheduled",
    } : {
      patientId: "",
      appointmentDate: "",
      appointmentTime: "",
      serviceType: "consultation",
      doctorId: "",
      appointmentFee: 0,
      paymentStatus: "pending",
      notes: "",
      status: "scheduled",
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
        appointmentType: data.serviceType, // Map to the expected field
        patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : "Unknown Patient",
        patientCode: selectedPatient?.patientCode || "",
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

  // Service type options - matching the old UI
  const serviceTypes = [
    { value: "consultation", label: "Initial Consultation", icon: User },
    { value: "eye-exam", label: "Comprehensive Eye Exam", icon: Activity },
    { value: "contact-fitting", label: "Contact Lens Fitting", icon: Heart },
    { value: "follow-up", label: "Follow-up Visit", icon: CheckCircle },
    { value: "prescription-update", label: "Prescription Update", icon: Calendar },
    { value: "emergency", label: "Emergency Visit", icon: AlertTriangle },
    { value: "routine-checkup", label: "Routine Checkup", icon: Stethoscope },
    { value: "glasses-fitting", label: "Glasses Fitting", icon: Activity },
    { value: "surgery", label: "Surgery", icon: Activity },
    { value: "other", label: "Other", icon: Plus }
  ];

  // Doctor options
  const doctors = [
    { id: "dr1", name: "Dr. Sarah Johnson" },
    { id: "dr2", name: "Dr. Michael Chen" }, 
    { id: "dr3", name: "Dr. Emily Rodriguez" },
    { id: "dr4", name: "Dr. David Kim" },
    { id: "dr5", name: "Dr. Lisa Thompson" }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6" data-testid="appointment-form">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {editingAppointment ? 'Update Appointment' : 'Schedule New Appointment'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {editingAppointment ? 'Update appointment details' : 'Schedule an appointment for a patient'}
          </DialogDescription>
        </DialogHeader>
      </motion.div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Patient and Service Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-1">
                    <span>Patient</span>
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger data-testid="select-patient">
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.firstName} {patient.lastName}
                            {patient.patientCode && ` (${patient.patientCode})`}
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
                  <FormLabel className="flex items-center space-x-1">
                    <span>Service Type</span>
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger data-testid="select-service">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((service) => (
                          <SelectItem key={service.value} value={service.value}>
                            {service.label}
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

          {/* Doctor Assignment */}
          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center space-x-1">
                  <span>Assign Doctor</span>
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger data-testid="select-doctor">
                      <SelectValue placeholder="Select doctor *" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Doctor assignment is required
                </FormDescription>
              </FormItem>
            )}
          />

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="appointmentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-1">
                    <span>Appointment Date</span>
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
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
                  <FormLabel className="flex items-center space-x-1">
                    <span>Appointment Time</span>
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="time"
                      data-testid="input-appointment-time"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Fee and Payment Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="appointmentFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment Fee</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input 
                        {...field} 
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-10"
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
                  <FormLabel>Payment Status</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger data-testid="select-payment-status">
                        <SelectValue placeholder="Payment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending Payment</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="partial">Partial Payment</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Additional notes for the appointment..."
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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
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
              className="bg-blue-600 hover:bg-blue-700"
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

export default AppointmentForm;