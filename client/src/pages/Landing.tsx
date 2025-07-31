import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Stethoscope, Users, Calendar, FileText, Shield, Activity, Heart } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/login";
  };

  const features = [
    {
      icon: Stethoscope,
      title: "Medical Practice Management",
      description: "Complete medical practice management with patient records, prescriptions, and treatment history"
    },
    {
      icon: Users,
      title: "Patient Management",
      description: "Comprehensive patient profiles with medical history, appointments, and loyalty tracking"
    },
    {
      icon: Calendar,
      title: "Appointment Scheduling",
      description: "Advanced scheduling system with automated reminders and multi-doctor support"
    },
    {
      icon: Eye,
      title: "Optical Services",
      description: "Specialized optical care with prescription management and visual acuity tracking"
    },
    {
      icon: FileText,
      title: "Medical Billing",
      description: "Integrated billing system with insurance processing and automated invoicing"
    },
    {
      icon: Activity,
      title: "HR Management",
      description: "Complete HR suite with staff management, attendance tracking, and payroll"
    },
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description: "Secure, HIPAA-compliant system with role-based access and audit trails"
    },
    {
      icon: Heart,
      title: "Patient Care",
      description: "Enhanced patient care with treatment tracking and follow-up management"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <Eye className="text-white text-2xl" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                OptiCare Medical Center
              </h1>
              <p className="text-xl text-slate-600">Advanced Medical Practice Management</p>
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Comprehensive Medical Practice Management System
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Advanced HR functionality, unified patient/customer management, integrated billing, 
              and complete prescription management for modern medical practices
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg shadow-lg"
            >
              Sign In to Get Started
            </Button>
            <div className="text-sm text-slate-500">
              Secure • HIPAA Compliant • Cloud-Based
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-slate-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-blue-600 h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Key Benefits */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-center text-slate-900 mb-8">
            Why Choose OptiCare Medical Center?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="text-green-600 h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Streamlined Operations</h4>
              <p className="text-slate-600">Automate routine tasks and focus on patient care with our integrated workflow system.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-purple-600 h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Secure & Compliant</h4>
              <p className="text-slate-600">HIPAA-compliant security with encrypted data and comprehensive audit trails.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-blue-600 h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Better Patient Care</h4>
              <p className="text-slate-600">Enhanced patient experience with comprehensive records and seamless communication.</p>
            </div>
          </div>
        </div>

        {/* System Modules */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-center text-slate-900 mb-8">
            Complete System Modules
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
            {[
              "Dashboard", "Patients", "Appointments", "Prescriptions", 
              "Billing", "Inventory", "Staff", "Attendance", 
              "Payroll", "Reports", "Settings", "Support"
            ].map((module, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-700">{module}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-slate-500">
          <p>&copy; 2025 OptiCare Medical Center. All rights reserved.</p>
          <p className="text-sm mt-2">Professional Medical Practice Management System</p>
        </div>
      </div>
    </div>
  );
}