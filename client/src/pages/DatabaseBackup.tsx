import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Database, 
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  Users,
  Store,
  Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DatabaseBackup() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownloadBackup = async () => {
    try {
      setIsDownloading(true);
      
      const response = await fetch('/api/download/database-backup');
      
      if (!response.ok) {
        throw new Error('Failed to download backup');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      a.download = `optistore_backup_${timestamp}.sql`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Complete",
        description: "Database backup has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download database backup.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const backupStats = [
    { label: "Users", count: 1, icon: Users, color: "blue" },
    { label: "Stores", count: 1, icon: Store, color: "green" },
    { label: "Products", count: 2, icon: Package, color: "purple" },
    { label: "Staff", count: 2, icon: Users, color: "orange" },
    { label: "Patients", count: 1, icon: Users, color: "red" },
    { label: "Customers", count: 4, icon: Users, color: "indigo" },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Database Backup</h1>
          <p className="text-slate-600">Export and download your complete database backup for safekeeping.</p>
        </div>
      </div>

      {/* Backup Status Card */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-green-900">Backup Ready</CardTitle>
              <p className="text-sm text-green-700">Your database backup has been generated and is ready for download.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-900">6.4 KB</p>
              <p className="text-sm text-green-600">File Size</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-900">115</p>
              <p className="text-sm text-green-600">Lines of SQL</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-900">29</p>
              <p className="text-sm text-green-600">Tables</p>
            </div>
          </div>
          
          <Button 
            onClick={handleDownloadBackup} 
            disabled={isDownloading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? "Downloading..." : "Download Database Backup"}
          </Button>
        </CardContent>
      </Card>

      {/* Backup Contents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Backup Contents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {backupStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`h-5 w-5 text-${stat.color}-600`} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{stat.count}</p>
                    <p className="text-sm text-slate-600">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Backup Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Backup Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Format:</span>
              <Badge variant="outline">SQL</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Compression:</span>
              <Badge variant="outline">None</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Type:</span>
              <Badge variant="outline">Data Export</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Created:</span>
              <span className="text-slate-900">{new Date().toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-slate-600 space-y-2">
              <p>• This backup contains all your business data including patient records</p>
              <p>• Keep the backup file secure and confidential</p>
              <p>• To restore: Execute the SQL file on your target database</p>
              <p>• Compatible with PostgreSQL databases</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Restore Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Restore</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-2">Restoration Steps:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
              <li>Create a new PostgreSQL database</li>
              <li>Ensure your database schema is set up</li>
              <li>Run: <code className="bg-slate-200 px-2 py-1 rounded">psql -d your_database &lt; optistore_backup_YYYYMMDD.sql</code></li>
              <li>Verify data import completed successfully</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}