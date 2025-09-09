import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User, DollarSign, Phone } from 'lucide-react';

interface Appointment {
  id: string;
  patientId: string;
  appointmentNumber?: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  serviceType?: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  appointmentFee?: number;
  paymentStatus?: 'pending' | 'paid' | 'partial' | 'cancelled';
  doctorName?: string;
  notes?: string;
  createdAt: string;
}

interface PatientAppointmentsProps {
  patientId: string;
}

export default function PatientAppointments({ patientId }: PatientAppointmentsProps) {
  // Fetch all appointments and filter by patient
  const { data: allAppointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  // Filter appointments for this patient
  const patientAppointments = allAppointments.filter(
    appointment => appointment.patientId === patientId
  ).sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());

  const getStatusColor = (status: string) => {
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (patientAppointments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Found</h3>
          <p className="text-gray-600">This patient doesn't have any appointments yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Appointment History</h3>
        <Badge variant="outline">{patientAppointments.length} appointments</Badge>
      </div>

      <div className="grid gap-4">
        {patientAppointments.map((appointment) => (
          <Card key={appointment.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {appointment.appointmentType?.replace('-', ' ') || 'Consultation'}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge className={`${getStatusColor(appointment.status)} border-0 capitalize`}>
                    {appointment.status.replace('-', ' ')}
                  </Badge>
                  {appointment.paymentStatus && (
                    <Badge className={`${getPaymentStatusColor(appointment.paymentStatus)} border-0 capitalize`}>
                      {appointment.paymentStatus}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">
                      {new Date(appointment.appointmentDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{appointment.appointmentTime}</span>
                  </div>
                  {appointment.doctorName && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>Dr. {appointment.doctorName}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {appointment.appointmentFee && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">${appointment.appointmentFee.toFixed(2)}</span>
                    </div>
                  )}
                  {appointment.appointmentNumber && (
                    <div className="text-sm">
                      <span className="text-gray-500">Appointment #:</span>
                      <span className="font-mono ml-1">#{appointment.appointmentNumber}</span>
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-1">
                      {new Date(appointment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              {appointment.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Notes:</span> {appointment.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}