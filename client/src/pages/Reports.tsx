import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Download, 
  Calendar,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Plus,
  Edit,
  Trash2,
  Play
} from "lucide-react";

const predefinedReports = [
  {
    id: 1,
    name: "Monthly Sales Summary",
    type: "sales",
    description: "Complete sales overview for the selected month",
    frequency: "Monthly",
    lastRun: "2025-01-30",
    status: "Active"
  },
  {
    id: 2,
    name: "Patient Demographics",
    type: "patients",
    description: "Age, gender, and location analysis of patient base",
    frequency: "Quarterly",
    lastRun: "2025-01-15",
    status: "Active"
  },
  {
    id: 3,
    name: "Inventory Turnover",
    type: "inventory",
    description: "Product movement and stock efficiency analysis",
    frequency: "Weekly",
    lastRun: "2025-01-29",
    status: "Active"
  },
  {
    id: 4,
    name: "Staff Performance",
    type: "staff",
    description: "Individual and team performance metrics",
    frequency: "Monthly",
    lastRun: "2025-01-25",
    status: "Inactive"
  }
];

const customReports = [
  {
    id: 101,
    name: "High-Value Customers",
    type: "custom",
    description: "Customers with purchases over $1000 in last 6 months",
    frequency: "On Demand",
    lastRun: "2025-01-28",
    status: "Active",
    createdBy: "Admin"
  },
  {
    id: 102,
    name: "Frame Brand Analysis",
    type: "custom",
    description: "Sales performance by frame brand and category",
    frequency: "Monthly",
    lastRun: "2025-01-20",
    status: "Active",
    createdBy: "Manager"
  }
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("predefined");
  const [selectedStore, setSelectedStore] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const runReport = (reportId: number, reportName: string) => {
    toast({
      title: "Report Generated",
      description: `${reportName} has been generated successfully`,
    });
  };

  const editReport = (reportId: number, reportName: string) => {
    toast({
      title: "Edit Report",
      description: `Opening editor for ${reportName}`,
    });
  };

  const deleteReport = (reportId: number, reportName: string) => {
    toast({
      title: "Report Deleted",
      description: `${reportName} has been deleted`,
      variant: "destructive",
    });
  };

  const createCustomReport = () => {
    toast({
      title: "Create Custom Report",
      description: "Opening custom report builder",
    });
  };

  const filteredPredefined = predefinedReports.filter(report =>
    report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustom = customReports.filter(report =>
    report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Generate and manage business reports</p>
        </div>
        <Button onClick={createCustomReport} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Custom Report</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Reports</Label>
              <Input
                id="search"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store">Store Location</Label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger>
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  <SelectItem value="downtown">Downtown Vision Center</SelectItem>
                  <SelectItem value="mall">Mall Optical Store</SelectItem>
                  <SelectItem value="suburban">Suburban Eye Care</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quick Actions</Label>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Export All
                </Button>
                <Button size="sm" variant="outline">
                  <Calendar className="h-4 w-4 mr-1" />
                  Schedule
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="predefined">Predefined Reports</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="predefined" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPredefined.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <Badge variant={report.status === 'Active' ? 'default' : 'secondary'}>
                      {report.status}
                    </Badge>
                  </div>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Frequency:</span>
                      <span>{report.frequency}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Run:</span>
                      <span>{report.lastRun}</span>
                    </div>
                    <Separator />
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => runReport(report.id, report.name)}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Run
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => editReport(report.id, report.name)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPredefined.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No reports found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustom.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <Badge variant={report.status === 'Active' ? 'default' : 'secondary'}>
                      {report.status}
                    </Badge>
                  </div>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Created By:</span>
                      <span>{report.createdBy}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Frequency:</span>
                      <span>{report.frequency}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Run:</span>
                      <span>{report.lastRun}</span>
                    </div>
                    <Separator />
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => runReport(report.id, report.name)}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Run
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => editReport(report.id, report.name)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteReport(report.id, report.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCustom.length === 0 && (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No custom reports yet</h3>
              <p className="text-muted-foreground mb-4">Create your first custom report to get started.</p>
              <Button onClick={createCustomReport}>
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Report
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}