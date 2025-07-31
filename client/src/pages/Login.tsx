import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, User, Eye } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();

  const handleLogin = async () => {
    // Redirect to the backend login endpoint
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">OptiStore Pro</CardTitle>
          <CardDescription>
            Access your medical practice management system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleLogin}
            className="w-full h-12 text-lg"
            size="lg"
          >
            <User className="mr-2 h-5 w-5" />
            Sign In to Dashboard
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            Secure access to patient records, appointments, and practice management
          </div>
          
          <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Stethoscope className="h-4 w-4 mr-1" />
              HIPAA Compliant
            </div>
            <div>•</div>
            <div>Secure Access</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}