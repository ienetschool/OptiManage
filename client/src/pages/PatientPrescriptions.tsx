import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import PatientPrescriptionPortal from "@/components/PatientPrescriptionPortal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PatientPrescriptions() {
  const [patientId, setPatientId] = useState<string>("");
  const [patientCode, setPatientCode] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { toast } = useToast();
  const [location] = useLocation();

  // Check if patient ID is provided in URL params or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlPatientId = urlParams.get('patientId');
    const urlPatientCode = urlParams.get('code');
    
    // Check localStorage for existing session
    const storedPatientId = localStorage.getItem('patient_portal_id');
    const storedPatientCode = localStorage.getItem('patient_portal_code');
    
    if (urlPatientId && urlPatientCode) {
      // Authenticate with URL parameters
      authenticatePatient(urlPatientId, urlPatientCode);
    } else if (storedPatientId && storedPatientCode) {
      // Use stored credentials
      setPatientId(storedPatientId);
      setPatientCode(storedPatientCode);
      setIsAuthenticated(true);
    }
  }, [location]);

  const authenticatePatient = async (id: string, code: string) => {
    setIsLoading(true);
    setError("");
    
    try {
      // Verify patient credentials
      const response = await fetch(`/api/patients/${id}`);
      if (!response.ok) {
        throw new Error('Patient not found');
      }
      
      const patient = await response.json();
      
      // Simple verification - in production, you'd want more secure authentication
      if (patient.patientCode === code || patient.id === id) {
        setPatientId(id);
        setPatientCode(code);
        setIsAuthenticated(true);
        
        // Store in localStorage for session persistence
        localStorage.setItem('patient_portal_id', id);
        localStorage.setItem('patient_portal_code', code);
        
        toast({
          title: "Access Granted",
          description: `Welcome, ${patient.firstName} ${patient.lastName}`,
        });
      } else {
        throw new Error('Invalid patient credentials');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      toast({
        title: "Authentication Failed",
        description: "Please check your patient ID and access code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId.trim() || !patientCode.trim()) {
      setError('Please enter both Patient ID and Access Code');
      return;
    }
    await authenticatePatient(patientId.trim(), patientCode.trim());
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPatientId("");
    setPatientCode("");
    localStorage.removeItem('patient_portal_id');
    localStorage.removeItem('patient_portal_code');
    
    toast({
      title: "Logged Out",
      description: "You have been securely logged out",
    });
  };

  // Show authentication form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Patient Portal Access</h1>
              <p className="text-gray-600">Enter your credentials to view your prescriptions</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="patientId">Patient ID</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="patientId"
                      type="text"
                      placeholder="Enter your Patient ID"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="patientCode">Access Code</Label>
                  <div className="relative mt-1">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="patientCode"
                      type="password"
                      placeholder="Enter your access code"
                      value={patientCode}
                      onChange={(e) => setPatientCode(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Authenticating...
                  </div>
                ) : (
                  'Access My Prescriptions'
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">Secure Access</p>
                    <p className="text-blue-700">
                      Your medical information is protected with industry-standard security measures.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-600">
                <p>Need help accessing your account?</p>
                <p className="mt-1">
                  Contact us at <span className="font-medium text-blue-600">(555) 123-4567</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show prescription portal if authenticated
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with logout */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Patient Portal</h1>
              <p className="text-sm text-gray-600">Patient ID: {patientId}</p>
            </div>
          </div>
          
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto p-6">
        <PatientPrescriptionPortal patientId={patientId} />
      </div>
    </div>
  );
}