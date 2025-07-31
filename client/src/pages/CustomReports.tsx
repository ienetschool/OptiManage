import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus,
  Save,
  Play,
  Eye,
  Settings,
  BarChart3,
  FileText,
  Download,
  Calendar,
  Filter,
  X
} from "lucide-react";

interface CustomReport {
  id: string;
  name: string;
  description: string;
  query: string;
  parameters: any[];
  schedule: string;
  status: 'Active' | 'Draft' | 'Inactive';
  createdAt: string;
  lastRun?: string;
}

export default function CustomReports() {
  const [reports, setReports] = useState<CustomReport[]>([
    {
      id: '1',
      name: 'High-Value Patients',
      description: 'Patients with total purchases over $2000 in the last year',
      query: 'SELECT * FROM patients WHERE total_spent > 2000',
      parameters: [{ name: 'min_amount', type: 'number', default: 2000 }],
      schedule: 'Monthly',
      status: 'Active',
      createdAt: '2025-01-15',
      lastRun: '2025-01-30'
    },
    {
      id: '2',
      name: 'Prescription Refill Alerts',
      description: 'Patients due for prescription refills in the next 30 days',
      query: 'SELECT * FROM prescriptions WHERE refill_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)',
      parameters: [{ name: 'days_ahead', type: 'number', default: 30 }],
      schedule: 'Weekly',
      status: 'Active',
      createdAt: '2025-01-10',
      lastRun: '2025-01-29'
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingReport, setEditingReport] = useState<CustomReport | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    query: '',
    schedule: 'On Demand',
    parameters: [] as any[]
  });

  const { toast } = useToast();

  const handleCreateReport = () => {
    const newReport: CustomReport = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      query: formData.query,
      parameters: formData.parameters,
      schedule: formData.schedule,
      status: 'Draft',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setReports([...reports, newReport]);
    setIsCreating(false);
    setFormData({ name: '', description: '', query: '', schedule: 'On Demand', parameters: [] });
    
    toast({
      title: "Custom Report Created",
      description: `${formData.name} has been created successfully`,
    });
  };

  const runReport = (report: CustomReport) => {
    toast({
      title: "Running Report",
      description: `${report.name} is being generated...`,
    });
  };

  const previewReport = (report: CustomReport) => {
    toast({
      title: "Report Preview",
      description: `Showing preview for ${report.name}`,
    });
  };

  const exportReport = (report: CustomReport, format: string) => {
    toast({
      title: "Exporting Report",
      description: `${report.name} is being exported as ${format}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom Reports</h1>
          <p className="text-muted-foreground">Create and manage custom business reports</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Custom Report</span>
        </Button>
      </div>

      {/* Create/Edit Report Form */}
      {(isCreating || editingReport) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{isCreating ? 'Create' : 'Edit'} Custom Report</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setIsCreating(false);
                  setEditingReport(null);
                  setFormData({ name: '', description: '', query: '', schedule: 'On Demand', parameters: [] });
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Report Name</Label>
                <Input
                  id="name"
                  placeholder="Enter report name..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule</Label>
                <Select value={formData.schedule} onValueChange={(value) => setFormData({ ...formData, schedule: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On Demand">On Demand</SelectItem>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this report will show..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="query">SQL Query</Label>
              <Textarea
                id="query"
                placeholder="SELECT * FROM table_name WHERE condition..."
                className="font-mono text-sm"
                rows={6}
                value={formData.query}
                onChange={(e) => setFormData({ ...formData, query: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Write a SQL query to generate your custom report. Use proper table names and conditions.
              </p>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleCreateReport}>
                <Save className="h-4 w-4 mr-2" />
                {isCreating ? 'Create Report' : 'Update Report'}
              </Button>
              <Button variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Test Query
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{report.name}</CardTitle>
                <Badge variant={
                  report.status === 'Active' ? 'default' : 
                  report.status === 'Draft' ? 'secondary' : 'destructive'
                }>
                  {report.status}
                </Badge>
              </div>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Schedule:</span>
                    <span>{report.schedule}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{report.createdAt}</span>
                  </div>
                  {report.lastRun && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last Run:</span>
                      <span>{report.lastRun}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => runReport(report)} className="flex-1">
                      <Play className="h-4 w-4 mr-1" />
                      Run
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => previewReport(report)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingReport(report)}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" onClick={() => exportReport(report, 'PDF')} className="flex-1">
                      <FileText className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => exportReport(report, 'Excel')} className="flex-1">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Excel
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => exportReport(report, 'CSV')} className="flex-1">
                      <Download className="h-3 w-3 mr-1" />
                      CSV
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reports.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No Custom Reports Yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first custom report to generate specific business insights.
          </p>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Report
          </Button>
        </div>
      )}
    </div>
  );
}