import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  TrendingUp, 
  Eye,
  Users,
  BarChart3,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy
} from "lucide-react";

export default function SEO() {
  const [siteTitle, setSiteTitle] = useState("OptiStore Pro - Professional Eye Care Management");
  const [siteDescription, setSiteDescription] = useState("Complete optical store management system with patient records, appointments, inventory tracking, and more.");
  const [keywords, setKeywords] = useState("optical store, eye care, vision care, glasses, contact lenses");

  // Mock SEO data
  const seoMetrics = {
    searchImpressions: 12500,
    clicks: 850,
    averagePosition: 3.2,
    organicTraffic: 2140
  };

  const pageAnalysis = [
    {
      page: "/",
      title: "OptiStore Pro - Professional Eye Care",
      status: "good",
      issues: [],
      score: 95
    },
    {
      page: "/services",
      title: "Our Services - Eye Exams & More",
      status: "warning",
      issues: ["Meta description too short"],
      score: 78
    },
    {
      page: "/about",
      title: "About Us",
      status: "error",
      issues: ["Missing meta description", "Title too short"],
      score: 45
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      good: { variant: "default" as const, text: "Good", icon: CheckCircle },
      warning: { variant: "secondary" as const, text: "Needs Attention", icon: AlertCircle },
      error: { variant: "destructive" as const, text: "Issues Found", icon: AlertCircle }
    };
    return variants[status as keyof typeof variants] || variants.warning;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">SEO & Analytics</h1>
          <p className="text-slate-600">Optimize your website for search engines and track performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Google Search Console
          </Button>
          <Button>
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

              <Button>Save SEO Settings</Button>
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

              <Button>Save Social Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page SEO Analysis</CardTitle>
              <CardDescription>Review SEO status for all your pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pageAnalysis.map((page, index) => {
                  const statusBadge = getStatusBadge(page.status);
                  const StatusIcon = statusBadge.icon;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <StatusIcon className={`h-8 w-8 ${
                            page.status === 'good' ? 'text-green-500' :
                            page.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{page.title}</h4>
                            <Badge {...statusBadge}>
                              {statusBadge.text}
                            </Badge>
                            <Badge variant="outline">Score: {page.score}/100</Badge>
                          </div>
                          <div className="text-sm text-slate-500">
                            <span>{page.page}</span>
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
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          Fix Issues
                        </Button>
                      </div>
                    </div>
                  );
                })}
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
                        <Button variant="outline" size="sm">Configure</Button>
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
                        <Button size="sm">Connect</Button>
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
                  <Button variant="outline" size="sm">Generate Sitemap</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Robots.txt Editor</h4>
                  <p className="text-sm text-slate-500 mb-3">Configure search engine crawling</p>
                  <Button variant="outline" size="sm">Edit Robots.txt</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Schema Markup</h4>
                  <p className="text-sm text-slate-500 mb-3">Add structured data to your pages</p>
                  <Button variant="outline" size="sm">Configure Schema</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Page Speed Test</h4>
                  <p className="text-sm text-slate-500 mb-3">Test and optimize page loading speed</p>
                  <Button variant="outline" size="sm">Run Speed Test</Button>
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
  );
}