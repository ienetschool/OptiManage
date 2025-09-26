import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  QrCode,
  FileText,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Receipt,
  Stethoscope
} from 'lucide-react';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  date: string;
  time: string;
  endTime: string;
  provider: string;
  room: string;
  type: 'consultation' | 'follow-up' | 'procedure' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
  reason: string;
  duration: number; // in minutes
  encounterId?: string;
  invoiceId?: string;
}

interface AppointmentCalendarProps {
  patientId?: string;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ patientId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Mock data for demonstration
  const mockAppointments: Appointment[] = [
    {
      id: '1',
      patientId: 'P001',
      patientName: 'John Doe',
      patientPhone: '+1-555-0123',
      patientEmail: 'john.doe@email.com',
      date: '2024-01-15',
      time: '10:00',
      endTime: '10:30',
      provider: 'Dr. Smith',
      room: 'Room 101',
      type: 'consultation',
      status: 'scheduled',
      priority: 'medium',
      notes: 'Regular eye examination',
      reason: 'Annual eye check-up',
      duration: 30,
      encounterId: 'E001'
    },
    {
      id: '2',
      patientId: 'P002',
      patientName: 'Jane Smith',
      patientPhone: '+1-555-0124',
      patientEmail: 'jane.smith@email.com',
      date: '2024-01-15',
      time: '14:00',
      endTime: '15:00',
      provider: 'Dr. Johnson',
      room: 'Room 102',
      type: 'procedure',
      status: 'confirmed',
      priority: 'high',
      notes: 'Cataract surgery consultation',
      reason: 'Pre-operative assessment',
      duration: 60
    },
    {
      id: '3',
      patientId: 'P003',
      patientName: 'Bob Wilson',
      patientPhone: '+1-555-0125',
      patientEmail: 'bob.wilson@email.com',
      date: '2024-01-16',
      time: '09:00',
      endTime: '09:30',
      provider: 'Dr. Smith',
      room: 'Room 101',
      type: 'follow-up',
      status: 'completed',
      priority: 'low',
      notes: 'Post-surgery follow-up',
      reason: 'Check healing progress',
      duration: 30,
      encounterId: 'E002',
      invoiceId: 'INV001'
    }
  ];

  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 30,
    type: 'consultation',
    priority: 'medium',
    status: 'scheduled'
  });

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    'checked-in': 'bg-purple-100 text-purple-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    'no-show': 'bg-orange-100 text-orange-800'
  };

  const priorityColors = {
    low: 'border-l-green-500',
    medium: 'border-l-yellow-500',
    high: 'border-l-orange-500',
    urgent: 'border-l-red-500'
  };

  const typeIcons = {
    consultation: Eye,
    'follow-up': CheckCircle,
    procedure: Stethoscope,
    emergency: AlertCircle
  };

  const filteredAppointments = mockAppointments.filter(appointment => {
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPatient = !patientId || appointment.patientId === patientId;
    return matchesStatus && matchesSearch && matchesPatient;
  });

  const handleQRCheckIn = (appointmentId: string) => {
    setIsCheckingIn(true);
    // Simulate QR code scanning
    setTimeout(() => {
      setIsCheckingIn(false);
      // Update appointment status
      const updatedAppointments = mockAppointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status: 'checked-in' as const } : apt
      );
      toast({
        title: "Check-in Successful",
        description: "Patient has been checked in successfully.",
      });
    }, 2000);
  };

  const startEncounter = (appointmentId: string) => {
    toast({
      title: "Starting Encounter",
      description: "Clinical encounter has been initiated.",
    });
    // This would typically navigate to the encounter page or open encounter modal
  };

  const rescheduleAppointment = (appointmentId: string) => {
    toast({
      title: "Reschedule Appointment",
      description: "Appointment rescheduling feature will be implemented.",
    });
  };

  const cancelAppointment = (appointmentId: string) => {
    toast({
      title: "Cancel Appointment",
      description: "Appointment has been cancelled.",
    });
  };

  const createInvoice = (appointmentId: string) => {
    toast({
      title: "Create Invoice",
      description: "Invoice creation feature will be implemented.",
    });
  };

  const convertToClaim = (appointmentId: string) => {
    toast({
      title: "Convert to Claim",
      description: "Insurance claim conversion feature will be implemented.",
    });
  };

  const saveAppointment = () => {
    toast({
      title: "Appointment Saved",
      description: "New appointment has been scheduled successfully.",
    });
    setShowNewAppointment(false);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayAppointments = filteredAppointments.filter(apt => apt.date === dateStr);
      
      days.push(
        <div key={day} className="h-24 border border-gray-200 p-1 overflow-y-auto">
          <div className="font-medium text-sm mb-1">{day}</div>
          {dayAppointments.slice(0, 2).map(appointment => {
            const TypeIcon = typeIcons[appointment.type];
            return (
              <div
                key={appointment.id}
                className={`text-xs p-1 mb-1 rounded cursor-pointer border-l-2 ${priorityColors[appointment.priority]} ${statusColors[appointment.status]}`}
                onClick={() => setSelectedAppointment(appointment)}
              >
                <div className="flex items-center space-x-1">
                  <TypeIcon className="w-3 h-3" />
                  <span className="truncate">{appointment.time}</span>
                </div>
                <div className="truncate font-medium">{appointment.patientName}</div>
              </div>
            );
          })}
          {dayAppointments.length > 2 && (
            <div className="text-xs text-gray-500">+{dayAppointments.length - 2} more</div>
          )}
        </div>
      );
    }

    return days;
  };

  const renderWeekView = () => {
    // Week view implementation would go here
    return <div className="text-center py-8 text-gray-500">Week view coming soon...</div>;
  };

  const renderDayView = () => {
    // Day view implementation would go here
    return <div className="text-center py-8 text-gray-500">Day view coming soon...</div>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appointment Calendar</h2>
          <p className="text-gray-600">Manage appointments and clinical encounters</p>
        </div>
        <div className="flex flex-wrap items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="checked-in">Checked In</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-1">
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('day')}
            >
              Day
            </Button>
          </div>
          <Button onClick={() => setShowNewAppointment(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={() => setCurrentDate(new Date())}
        >
          Today
        </Button>
      </div>

      {/* Calendar Content */}
      <Card>
        <CardContent className="p-0">
          {viewMode === 'month' && (
            <div>
              {/* Calendar Header */}
              <div className="grid grid-cols-7 border-b">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-3 text-center font-medium text-gray-700 border-r last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7">
                {renderCalendarGrid()}
              </div>
            </div>
          )}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </CardContent>
      </Card>

      {/* Appointment Detail Modal */}
      <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          {selectedAppointment && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-2xl">
                      Appointment - {selectedAppointment.patientName}
                    </DialogTitle>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge className={statusColors[selectedAppointment.status]}>
                        {selectedAppointment.status}
                      </Badge>
                      <Badge variant="outline">
                        {selectedAppointment.type}
                      </Badge>
                      <Badge variant="outline">
                        {selectedAppointment.priority} priority
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {selectedAppointment.status === 'scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => handleQRCheckIn(selectedAppointment.id)}
                        disabled={isCheckingIn}
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        {isCheckingIn ? 'Checking In...' : 'QR Check-in'}
                      </Button>
                    )}
                    {selectedAppointment.status === 'checked-in' && (
                      <Button
                        size="sm"
                        onClick={() => startEncounter(selectedAppointment.id)}
                      >
                        <Stethoscope className="w-4 h-4 mr-2" />
                        Start Encounter
                      </Button>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Appointment Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Appointment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{selectedAppointment.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{selectedAppointment.time} - {selectedAppointment.endTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{selectedAppointment.duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Provider:</span>
                      <span className="font-medium">{selectedAppointment.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">{selectedAppointment.room}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reason:</span>
                      <span className="font-medium">{selectedAppointment.reason}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Patient Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Patient Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{selectedAppointment.patientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{selectedAppointment.patientPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedAppointment.patientEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Patient ID:</span>
                      <span className="font-medium">{selectedAppointment.patientId}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{selectedAppointment.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => rescheduleAppointment(selectedAppointment.id)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Reschedule
                </Button>
                <Button
                  variant="outline"
                  onClick={() => cancelAppointment(selectedAppointment.id)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                {selectedAppointment.status === 'completed' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => createInvoice(selectedAppointment.id)}
                    >
                      <Receipt className="w-4 h-4 mr-2" />
                      Create Invoice
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => convertToClaim(selectedAppointment.id)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Convert to Claim
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Appointment Modal */}
      <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient">Patient</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="p1">John Doe</SelectItem>
                    <SelectItem value="p2">Jane Smith</SelectItem>
                    <SelectItem value="p3">Bob Wilson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="provider">Provider</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dr1">Dr. Smith</SelectItem>
                    <SelectItem value="dr2">Dr. Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date"
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input 
                  id="time"
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select 
                  value={newAppointment.duration?.toString()}
                  onValueChange={(value) => setNewAppointment(prev => ({ ...prev, duration: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
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
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Appointment Type</Label>
                <Select 
                  value={newAppointment.type}
                  onValueChange={(value) => setNewAppointment(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="procedure">Procedure</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={newAppointment.priority}
                  onValueChange={(value) => setNewAppointment(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="reason">Reason for Visit</Label>
              <Input 
                id="reason"
                placeholder="Enter reason for appointment"
                value={newAppointment.reason || ''}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes"
                placeholder="Additional notes..."
                value={newAppointment.notes || ''}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowNewAppointment(false)}>
              Cancel
            </Button>
            <Button onClick={saveAppointment}>
              Schedule Appointment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentCalendar;