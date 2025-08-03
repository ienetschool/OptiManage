import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  TrendingUp, 
  Eye,
  Users,
  BarChart3,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Building,
  Save,
  Download,
  Share,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  Link,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SEO() {
  const [siteTitle, setSiteTitle] = useState("OptiStore Pro - Professional Eye Care Management");
  const [siteDescription, setSiteDescription] = useState("Complete optical store management system with patient records, appointments, inventory tracking, and more.");
  const [keywords, setKeywords] = useState("optical store, eye care, vision care, glasses, contact lenses");
  const [selectedStore, setSelectedStore] = useState("primary");
  
  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stores = [] } = useQuery({
    queryKey: ["/api/stores"],
  });

  // Mock SEO data
  const seoMetrics = {
    searchImpressions: 12500,
    clicks: 850,
    averagePosition: 3.2,
    organicTraffic: 2140
  };

  const allPageAnalysis = [
    {
      id: "1",
      page: "/",
      title: "OptiStore Pro - Professional Eye Care",
      status: "good",
      issues: [],
      score: 95,
      lastUpdated: "2025-08-03"
    },
    {
      id: "2",
      page: "/services",
      title: "Our Services - Eye Exams & More",
      status: "warning",
      issues: ["Meta description too short"],
      score: 78,
      lastUpdated: "2025-08-02"
    },
    {
      id: "3",
      page: "/about",
      title: "About Us",
      status: "error",
      issues: ["Missing meta description", "Title too short"],
      score: 45,
      lastUpdated: "2025-08-01"
    },
    {
      id: "4",
      page: "/contact",
      title: "Contact Us - Get in Touch",
      status: "good",
      issues: [],
      score: 92,
      lastUpdated: "2025-08-03"
    },
    {
      id: "5",
      page: "/products",
      title: "Our Products",
      status: "warning",
      issues: ["Missing alt tags on images"],
      score: 73,
      lastUpdated: "2025-08-02"
    },
    {
      id: "6",
      page: "/blog",
      title: "Eye Care Blog & Tips",
      status: "good",
      issues: [],
      score: 88,
      lastUpdated: "2025-08-03"
    },
    {
      id: "7",
      page: "/appointments",
      title: "Book an Appointment",
      status: "error",
      issues: ["Missing meta description", "Title too generic"],
      score: 52,
      lastUpdated: "2025-07-30"
    },
    {
      id: "8",
      page: "/reviews",
      title: "Customer Reviews",
      status: "warning",
      issues: ["Meta description too long"],
      score: 76,
      lastUpdated: "2025-08-01"
    }
  ];

  // Filter and paginate pages
  const filteredPages = allPageAnalysis.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.page.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || page.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);
  const paginatedPages = filteredPages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      good: { variant: "default" as const, text: "Good", icon: CheckCircle },
      warning: { variant: "secondary" as const, text: "Needs Attention", icon: AlertCircle },
      error: { variant: "destructive" as const, text: "Issues Found", icon: AlertCircle }
    };
    return variants[status as keyof typeof variants] || variants.warning;
  };

  // Action handlers
  const handleSaveSEOSettings = () => {
    toast({
      title: "SEO Settings Saved",
      description: "Your SEO configuration has been successfully updated.",
    });
  };

  const handleSaveSocialSettings = () => {
    toast({
      title: "Social Settings Saved", 
      description: "Social media integration settings have been updated.",
    });
  };

  const handleFixIssues = (pageId: string) => {
    toast({
      title: "Fixing SEO Issues",
      description: "Running automated fixes for page SEO issues...",
    });
    // Simulate fixing
    setTimeout(() => {
      toast({
        title: "Issues Fixed",
        description: "SEO issues have been automatically resolved.",
      });
    }, 2000);
  };

  const handleGenerateReport = () => {
    toast({
      title: "Generating SEO Report",
      description: "Creating comprehensive SEO analysis report...",
    });
  };

  const handleConnect = (service: string) => {
    toast({
      title: `Connecting to ${service}`,
      description: `Opening ${service} integration setup...`,
    });
  };

  const handleExportData = (format: string) => {
    const data = format === 'json' ? JSON.stringify(filteredPages, null, 2) : 
                 filteredPages.map(p => `${p.page},${p.title},${p.status},${p.score}`).join('\n');
    
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-analysis.${format === 'json' ? 'json' : 'csv'}`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: `SEO data exported as ${format.toUpperCase()} file.`,
    });
  };

  const handleCopyToClipboard = () => {
    const data = filteredPages.map(p => `${p.page}: ${p.title} (Score: ${p.score})`).join('\n');
    navigator.clipboard.writeText(data);
    toast({
      title: "Copied to Clipboard",
      description: "SEO analysis data copied to clipboard.",
    });
  };

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/seo-report?pages=${selectedPages.join(',')}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Share Link Created",
      description: "SEO report link copied to clipboard.",
    });
  };

  const handleSelectPage = (pageId: string, checked: boolean) => {
    if (checked) {
      setSelectedPages([...selectedPages, pageId]);
    } else {
      setSelectedPages(selectedPages.filter(id => id !== pageId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPages(paginatedPages.map(p => p.id));
    } else {
      setSelectedPages([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">SEO & Analytics</h1>
            <p className="text-slate-600">Optimize your website for search engines and track performance</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => window.open('https://search.google.com/search-console', '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Google Search Console
            </Button>
            <Button onClick={handleGenerateReport}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

      {/* SEO Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Search Impressions</p>
                <p className="text-2xl font-bold text-slate-900">{seoMetrics.searchImpressions.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Clicks</p>
                <p className="text-2xl font-bold text-slate-900">{seoMetrics.clicks.toLocaleString()}</p>
              </div>
              <Search className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Average Position</p>
                <p className="text-2xl font-bold text-slate-900">{seoMetrics.averagePosition}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Organic Traffic</p>
                <p className="text-2xl font-bold text-slate-900">{seoMetrics.organicTraffic.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analysis">Page Analysis</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site SEO Settings</CardTitle>
              <CardDescription>Configure your website's basic SEO information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Site Title</Label>
                <Input
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  placeholder="Your website title"
                />
                <p className="text-sm text-slate-500">
                  {siteTitle.length}/60 characters. This appears in search results and browser tabs.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  placeholder="A brief description of your website"
                  rows={3}
                />
                <p className="text-sm text-slate-500">
                  {siteDescription.length}/160 characters. This appears in search results.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Keywords</Label>
                <Input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-sm text-slate-500">
                  Separate keywords with commas. Focus on terms your customers search for.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Google Analytics ID</Label>
                  <Input placeholder="GA-XXXXXXXXX-X" />
                </div>
                <div className="space-y-2">
                  <Label>Google Search Console</Label>
                  <Input placeholder="Verification code" />
                </div>
              </div>

              <Button onClick={handleSaveSEOSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save SEO Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media Integration</CardTitle>
              <CardDescription>Configure how your pages appear when shared on social media</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Facebook App ID</Label>
                  <Input placeholder="Your Facebook App ID" />
                </div>
                <div className="space-y-2">
                  <Label>Twitter Handle</Label>
                  <Input placeholder="@yourusername" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Default Social Image</Label>
                <div className="flex space-x-2">
                  <Input placeholder="https://yoursite.com/image.jpg" className="flex-1" />
                  <Button variant="outline">Upload</Button>
                </div>
              </div>

              <Button onClick={handleSaveSocialSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save Social Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Page SEO Analysis</CardTitle>
                  <CardDescription>Review SEO status for all your pages</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportData('csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportData('json')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShareLink} disabled={selectedPages.length === 0}>
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1">
                  <Input
                    placeholder="Search pages or titles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Select All Checkbox */}
              <div className="flex items-center space-x-2 pb-2 border-b">
                <Checkbox
                  checked={selectedPages.length === paginatedPages.length && paginatedPages.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-slate-600">
                  Select All ({selectedPages.length} selected)
                </span>
              </div>

              {/* Pages List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {paginatedPages.map((page) => {
                  const statusBadge = getStatusBadge(page.status);
                  const StatusIcon = statusBadge.icon;
                  
                  return (
                    <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={selectedPages.includes(page.id)}
                          onCheckedChange={(checked) => handleSelectPage(page.id, checked as boolean)}
                        />
                        <div className="flex-shrink-0">
                          <StatusIcon className={`h-8 w-8 ${
                            page.status === 'good' ? 'text-green-500' :
                            page.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-slate-900">{page.title}</h4>
                            <Badge {...statusBadge}>
                              {statusBadge.text}
                            </Badge>
                            <Badge variant="outline">Score: {page.score}/100</Badge>
                          </div>
                          <div className="text-sm text-slate-500">
                            <span className="font-mono">{page.page}</span>
                            <span className="mx-2">•</span>
                            <span>Updated: {page.lastUpdated}</span>
                            {page.issues.length > 0 && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="text-red-600">{page.issues.join(", ")}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(page.page, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleFixIssues(page.id)}
                          disabled={page.issues.length === 0}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Fix Issues
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-slate-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredPages.length)} of {filteredPages.length} pages
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Integration</CardTitle>
              <CardDescription>Connect and configure analytics tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <BarChart3 className="h-4 w-4" />
                <AlertDescription>
                  <strong>Google Analytics:</strong> Connected and tracking. Last updated 5 minutes ago.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-medium">Google Analytics</h4>
                      <p className="text-sm text-slate-500 mb-3">Comprehensive website analytics</p>
                      <Badge className="mb-3">Connected</Badge>
                      <div>
                        <Button variant="outline" size="sm" onClick={() => handleConnect("Google Analytics")}>
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Search className="h-12 w-12 text-green-600 mx-auto mb-2" />
                      <h4 className="font-medium">Search Console</h4>
                      <p className="text-sm text-slate-500 mb-3">Search performance insights</p>
                      <Badge variant="secondary" className="mb-3">Not Connected</Badge>
                      <div>
                        <Button size="sm" onClick={() => handleConnect("Search Console")}>
                          Connect
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Tools & Utilities</CardTitle>
              <CardDescription>Tools to help improve your website's SEO</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Sitemap Generator</h4>
                  <p className="text-sm text-slate-500 mb-3">Generate and submit XML sitemap</p>
                  <Button variant="outline" size="sm" onClick={() => toast({ title: "Generating Sitemap", description: "XML sitemap is being generated..." })}>
                    Generate Sitemap
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Robots.txt Editor</h4>
                  <p className="text-sm text-slate-500 mb-3">Configure search engine crawling</p>
                  <Button variant="outline" size="sm" onClick={() => toast({ title: "Opening Editor", description: "Robots.txt editor is loading..." })}>
                    Edit Robots.txt
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Schema Markup</h4>
                  <p className="text-sm text-slate-500 mb-3">Add structured data to your pages</p>
                  <Button variant="outline" size="sm" onClick={() => toast({ title: "Schema Configuration", description: "Opening structured data editor..." })}>
                    Configure Schema
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Page Speed Test</h4>
                  <p className="text-sm text-slate-500 mb-3">Test and optimize page loading speed</p>
                  <Button variant="outline" size="sm" onClick={() => window.open('https://pagespeed.web.dev/', '_blank')}>
                    Run Speed Test
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">SEO Checklist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Site title and meta descriptions configured</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Google Analytics connected</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm">Google Search Console needs setup</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm">Some pages need meta descriptions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}