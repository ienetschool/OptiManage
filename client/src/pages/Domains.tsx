import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Globe, 
  Plus, 
  Settings, 
  Shield,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink
} from "lucide-react";

export default function Domains() {
  const [newDomain, setNewDomain] = useState("");

  // Mock domains data
  const domains = [
    {
      id: "1",
      domain: "myopticalstore.com",
      status: "active",
      isPrimary: true,
      sslStatus: "enabled",
      dnsStatus: "configured",
      addedDate: "2025-01-15"
    },
    {
      id: "2", 
      domain: "www.myopticalstore.com",
      status: "active",
      isPrimary: false,
      sslStatus: "enabled",
      dnsStatus: "configured",
      addedDate: "2025-01-15"
    },
    {
      id: "3",
      domain: "clinic.myopticalstore.com",
      status: "pending",
      isPrimary: false,
      sslStatus: "pending",
      dnsStatus: "pending",
      addedDate: "2025-01-30"
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: "default" as const, text: "Active", icon: CheckCircle },
      pending: { variant: "secondary" as const, text: "Pending", icon: AlertCircle },
      error: { variant: "destructive" as const, text: "Error", icon: AlertCircle }
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const handleAddDomain = () => {
    if (newDomain) {
      // Mock add domain functionality
      console.log("Adding domain:", newDomain);
      setNewDomain("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Domain Settings</h1>
          <p className="text-slate-600">Manage your custom domains and DNS configuration</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Domain
        </Button>
      </div>

      {/* Current Plan Info */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro Plan:</strong> You can add up to 10 custom domains. SSL certificates are automatically provisioned for all domains.
        </AlertDescription>
      </Alert>

      {/* Add New Domain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Add New Domain
          </CardTitle>
          <CardDescription>Connect your custom domain to your website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Domain Name</Label>
              <Input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="example.com"
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddDomain}>Add Domain</Button>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Enter your domain without http:// or www. We'll automatically configure both versions.
          </p>
        </CardContent>
      </Card>

      {/* Current Domains */}
      <Card>
        <CardHeader>
          <CardTitle>Your Domains</CardTitle>
          <CardDescription>Manage your connected domains and their settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {domains.map((domain) => {
              const statusBadge = getStatusBadge(domain.status);
              const StatusIcon = statusBadge.icon;
              
              return (
                <div key={domain.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Globe className="h-8 w-8 text-slate-400" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{domain.domain}</h4>
                        {domain.isPrimary && (
                          <Badge variant="outline" className="text-xs">Primary</Badge>
                        )}
                        <Badge {...statusBadge}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusBadge.text}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <span>SSL: {domain.sslStatus}</span>
                        <span>DNS: {domain.dnsStatus}</span>
                        <span>Added: {domain.addedDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* DNS Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>DNS Configuration</CardTitle>
          <CardDescription>
            Configure these DNS records with your domain provider
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-4 p-3 bg-slate-50 rounded-md text-sm font-medium">
              <span>Type</span>
              <span>Name</span>
              <span>Value</span>
              <span>Action</span>
            </div>
            
            <div className="grid grid-cols-4 gap-4 p-3 border rounded-md text-sm">
              <span>A</span>
              <span>@</span>
              <span className="font-mono">192.168.1.100</span>
              <Button variant="ghost" size="sm">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 p-3 border rounded-md text-sm">
              <span>CNAME</span>
              <span>www</span>
              <span className="font-mono">myopticalstore.com</span>
              <Button variant="ghost" size="sm">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 p-3 border rounded-md text-sm">
              <span>TXT</span>
              <span>@</span>
              <span className="font-mono">optistore-verification=abc123def456</span>
              <Button variant="ghost" size="sm">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              DNS changes can take up to 48 hours to propagate globally. SSL certificates will be automatically issued once DNS is configured.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Domain Transfer */}
      <Card>
        <CardHeader>
          <CardTitle>Domain Transfer</CardTitle>
          <CardDescription>
            Transfer your domain to OptiStore Pro for easier management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Globe className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">
              Simplify domain management by transferring your domain to OptiStore Pro
            </p>
            <Button variant="outline">
              Start Domain Transfer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}