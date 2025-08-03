import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, Mail, MapPin, Stethoscope, CheckCircle, Eye, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM"
];

const services = [
  { id: "eye-exam", name: "Comprehensive Eye Exam", duration: "60 min", price: "$150" },
  { id: "contact-fitting", name: "Contact Lens Fitting", duration: "30 min", price: "$75" },
  { id: "glasses-consultation", name: "Glasses Consultation", duration: "45 min", price: "$50" },
  { id: "follow-up", name: "Follow-up Visit", duration: "30 min", price: "$75" },
  { id: "emergency", name: "Emergency Consultation", duration: "30 min", price: "$125" }
];

export default function BookAppointment() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    insurance: "",
    reason: "",
    previousPatient: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!selectedService || !selectedDate || !selectedTime || !formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      alert("Please fill in all required fields.");
      return;
    }
    
    console.log('Appointment booking submitted:', {
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      patient: formData
    });
    
    // Show success message
    alert(`Appointment request submitted successfully!\n\nService: ${selectedServiceDetails?.name}\nDate: ${selectedDate}\nTime: ${selectedTime}\n\nWe'll contact you at ${formData.phone} within 2 hours to confirm your appointment.`);
    
    // Reset form
    setSelectedDate("");
    setSelectedTime("");
    setSelectedService("");
    setFormData({
      firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "",
      insurance: "", reason: "", previousPatient: ""
    });
  };

  const selectedServiceDetails = services.find(s => s.id === selectedService);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Book an Appointment</h1>
                <p className="text-slate-600">Schedule your visit with our eye care professionals</p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Appointment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  Appointment Details
                </CardTitle>
                <CardDescription>
                  Please fill out the information below to schedule your appointment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Service Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="service">Select Service *</Label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose the service you need" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            <div className="flex justify-between items-center w-full">
                              <span>{service.name}</span>
                              <Badge variant="outline" className="ml-2">
                                {service.duration} • {service.price}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Preferred Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Preferred Time *</Label>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Patient Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Patient Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="previousPatient">Are you a returning patient?</Label>
                        <Select value={formData.previousPatient} onValueChange={(value) => handleInputChange("previousPatient", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes, I'm a returning patient</SelectItem>
                            <SelectItem value="no">No, this is my first visit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insurance">Insurance Provider (Optional)</Label>
                      <Input
                        id="insurance"
                        value={formData.insurance}
                        onChange={(e) => handleInputChange("insurance", e.target.value)}
                        placeholder="e.g., Blue Cross Blue Shield"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for Visit</Label>
                      <Textarea
                        id="reason"
                        value={formData.reason}
                        onChange={(e) => handleInputChange("reason", e.target.value)}
                        placeholder="Please describe any symptoms or the reason for your visit..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Appointment Summary & Info */}
          <div className="space-y-6">
            {/* Appointment Summary */}
            {selectedServiceDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Appointment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{selectedServiceDetails.name}</p>
                      <p className="text-sm text-slate-600">{selectedServiceDetails.duration}</p>
                    </div>
                  </div>
                  {selectedDate && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">{new Date(selectedDate).toLocaleDateString()}</p>
                        <p className="text-sm text-slate-600">{selectedTime}</p>
                      </div>
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Cost:</span>
                      <span className="text-lg font-bold text-blue-600">{selectedServiceDetails.price}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">*Insurance coverage may apply</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">(555) 123-4567</p>
                    <p className="text-sm text-slate-600">Main office</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">info@optistorepro.com</p>
                    <p className="text-sm text-slate-600">Email support</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-red-600 mt-1" />
                  <div>
                    <p className="font-medium">123 Vision Street</p>
                    <p className="text-sm text-slate-600">Eye Care City, EC 12345</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p>• Please arrive 15 minutes early for check-in</p>
                  <p>• Bring a valid ID and insurance card</p>
                  <p>• If you wear contacts, bring your glasses as backup</p>
                  <p>• Cancellations must be made 24 hours in advance</p>
                  <p>• For eye exams, avoid eye makeup if possible</p>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-red-900 mb-1">Emergency?</h3>
                  <p className="text-sm text-red-700 mb-3">
                    For urgent eye emergencies, call us immediately
                  </p>
                  <Button variant="destructive" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Emergency Line
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}