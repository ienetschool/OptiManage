import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";

export default function QuickLogin() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-900">
            OptiStore Pro
          </CardTitle>
          <p className="text-slate-600">Medical Practice Management System</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Login to Dashboard
          </Button>
          <p className="text-sm text-slate-500 text-center">
            Click to access your patient management system
          </p>
        </CardContent>
      </Card>
    </div>
  );
}