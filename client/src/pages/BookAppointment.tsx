import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Phone, Mail, MapPin, Plus, Search, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";
import { z } from "zod";

const appointmentSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  patientEmail: z.string().email("Valid email is required"),
  patientPhone: z.string().min(10, "Valid phone number is required"),
  appointmentDate: z.string().min(1, "Date is required"),
  appointmentTime: z.string().min(1, "Time is required"),
  doctorId: z.string().min(1, "Doctor selection is required"),
  appointmentType: z.string().min(1, "Appointment type is required"),
  notes: z.string().optional(),
  duration: z.number().min(15, "Minimum 15 minutes").max(180, "Maximum 3 hours"),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  doctorId: string;
  doctorName?: string;
  appointmentType: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  duration: number;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  availability: string[];
}

export default function BookAppointment() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock doctors data
  const doctors: Doctor[] = [
    { id: '1', name: 'Dr. Sarah Johnson', specialization: 'Ophthalmologist', availability: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
    { id: '2', name: 'Dr. Michael Chen', specialization: 'Optometrist', availability: ['08:00', '09:00', '10:00', '13:00', '14:00', '15:00'] },
    { id: '3', name: 'Dr. Emily Rodriguez', specialization: 'Pediatric Ophthalmologist', availability: ['10:00', '11:00', '14:00', '15:00', '16:00'] }
  ];

  const appointmentTypes = [
    'Eye Examination',
    'Contact Lens Fitting',
    'Glaucoma Screening',
    'Diabetic Eye Exam',
    'Pediatric Eye Exam',
    'Surgical Consultation',
    'Follow-up Visit',
    'Emergency Consultation'
  ];

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments", selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/appointments?date=${selectedDate}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return response.json();
    }
  });

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientName: "",
      patientEmail: "",
      patientPhone: "",
      appointmentDate: format(new Date(), 'yyyy-MM-dd'),
      appointmentTime: "",
      doctorId: "",
      appointmentType: "",
      notes: "",
      duration: 30,
    },
  });

  const bookAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      await apiRequest("POST", "/api/appointments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Appointment booked successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      await apiRequest("PATCH", `/api/appointments/${appointmentId}`, { status: 'cancelled' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
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

  const onSubmit = (data: AppointmentFormData) => {
    bookAppointmentMutation.mutate(data);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAppointments = appointments.filter(appointment =>
    appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.appointmentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todayAppointments = appointments.filter(a => a.appointmentDate === format(new Date(), 'yyyy-MM-dd'));
  const upcomingAppointments = appointments.filter(a => new Date(a.appointmentDate) > new Date());

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header 
        title="Book Appointment" 
        subtitle="Schedule and manage patient appointments with doctors and specialists." 
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Today's Appointments</p>
                    <p className="text-2xl font-bold text-slate-900">{todayAppointments.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Upcoming</p>
                    <p className="text-2xl font-bold text-slate-900">{upcomingAppointments.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Available Doctors</p>
                    <p className="text-2xl font-bold text-slate-900">{doctors.length}</p>
                  </div>
                  <User className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Appointment Types</p>
                    <p className="text-2xl font-bold text-slate-900">{appointmentTypes.length}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Available Time Slots */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Available Time Slots - {format(new Date(selectedDate), 'MMMM dd, yyyy')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-48"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-1">{doctor.name}</h4>
                    <p className="text-sm text-slate-600 mb-3">{doctor.specialization}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {doctor.availability.map((time) => (
                        <Button
                          key={time}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            form.setValue('doctorId', doctor.id);
                            form.setValue('appointmentTime', time);
                            setOpen(true);
                          }}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Book New Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Book New Appointment</DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="patientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Patient Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter patient name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="patientEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="patient@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="patientPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} />
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
                            <FormControl>
                              <Input 
                                type="number" 
                                min="15" 
                                max="180" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="appointmentDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
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
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="doctorId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Doctor</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select doctor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {doctors.map((doctor) => (
                                  <SelectItem key={doctor.id} value={doctor.id}>
                                    {doctor.name} - {doctor.specialization}
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
                        name="appointmentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Appointment Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {appointmentTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
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
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any additional notes or special requirements..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                        disabled={bookAppointmentMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {bookAppointmentMutation.isPending ? "Booking..." : "Book Appointment"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Appointments Table */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Scheduled Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No appointments scheduled</h3>
                  <p className="text-slate-600 mb-6">Start by booking your first appointment.</p>
                  <Button 
                    onClick={() => setOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Book First Appointment
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.map((appointment) => {
                        const doctor = doctors.find(d => d.id === appointment.doctorId);
                        return (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{appointment.patientName}</p>
                                <p className="text-sm text-slate-500">{appointment.patientEmail}</p>
                                <p className="text-sm text-slate-500">{appointment.patientPhone}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <div>
                                  <p>{format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}</p>
                                  <p className="text-sm text-slate-500">{appointment.appointmentTime}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{doctor?.name}</p>
                                <p className="text-sm text-slate-500">{doctor?.specialization}</p>
                              </div>
                            </TableCell>
                            <TableCell>{appointment.appointmentType}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeColor(appointment.status)}>
                                {appointment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{appointment.duration} min</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => cancelAppointmentMutation.mutate(appointment.id)}
                                  disabled={cancelAppointmentMutation.isPending}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
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
      </main>
    </>
  );
}