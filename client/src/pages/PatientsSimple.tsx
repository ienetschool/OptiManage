import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  Users, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  Sparkles
} from "lucide-react";
import UltraModernPatientForm from "@/components/forms/UltraModernPatientForm";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  patientCode: string;
}

const PatientsSimple: React.FC = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch patients
  const { data: patients = [], isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6" data-testid="patients-simple-page">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Users className="h-12 w-12 text-blue-600" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Patient Management
          </h1>
          <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Comprehensive patient registration and management system for OptiStore Pro
        </p>
      </motion.div>

      {/* Main Action Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto mb-12"
      >
        <Card className="border-4 border-gradient-to-r from-blue-400 to-purple-400 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center space-x-3">
              <UserPlus className="h-8 w-8 text-blue-600" />
              <span>Register New Patient</span>
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Start by registering a new patient with comprehensive medical information
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold px-12 py-6 text-2xl shadow-2xl border-4 border-yellow-300 transform hover:scale-105 transition-all duration-300 animate-pulse"
                  data-testid="new-patient-button-hero"
                >
                  <UserPlus className="mr-4 h-10 w-10" />
                  🚀 REGISTER NEW PATIENT
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
                <UltraModernPatientForm 
                  onSuccess={() => setOpen(false)}
                  onCancel={() => setOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12"
      >
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Patients</p>
                <p className="text-3xl font-bold">{patients.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Patients</p>
                <p className="text-3xl font-bold">{patients.length}</p>
              </div>
              <Heart className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">This Month</p>
                <p className="text-3xl font-bold">+{Math.min(patients.length, 5)}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold">100%</p>
              </div>
              <Sparkles className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Patient List Preview */}
      {patients.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                <Users className="h-6 w-6" />
                <span>Recent Patients</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patients.slice(0, 6).map((patient) => (
                  <motion.div
                    key={patient.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <Badge variant="secondary">{patient.patientCode}</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3" />
                        <span>{patient.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{patient.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{patient.address}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {patients.length === 0 && !isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center py-16"
        >
          <Users className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-500 mb-2">No Patients Yet</h3>
          <p className="text-gray-400 mb-8">Get started by registering your first patient</p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-4"
                data-testid="new-patient-button-empty"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Register First Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
              <UltraModernPatientForm 
                onSuccess={() => setOpen(false)}
                onCancel={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </motion.div>
      )}
    </div>
  );
};

export default PatientsSimple;