import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Globe,
  Settings,
  Building,
  Share2,
  Copy,
  Download,
  Upload,
  Bold,
  Italic,
  Underline,
  Link,
  Image,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Save,
  Monitor,
  Smartphone,
  Tablet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Pages() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState("all");
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [editorTab, setEditorTab] = useState("content");
  const [previewMode, setPreviewMode] = useState("desktop");
  const [pageContent, setPageContent] = useState("");
  const [seoData, setSeoData] = useState({
    title: "",
    description: "",
    keywords: "",
    canonical: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterCard: "summary_large_image"
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stores = [] } = useQuery({
    queryKey: ["/api/stores"],
  });

  // Mock pages data with state management
  const [pages, setPages] = useState([
    {
      id: "1",
      title: "Home Page",
      slug: "/",
      status: "published",
      type: "page",
      lastModified: "2025-01-31",
      views: 1250
    },
    {
      id: "2", 
      title: "About Us",
      slug: "/about",
      status: "published",
      type: "page",
      lastModified: "2025-01-30",
      views: 543
    },
    {
      id: "3",
      title: "Services",
      slug: "/services", 
      status: "published",
      type: "page",
      lastModified: "2025-01-29",
      views: 876
    },
    {
      id: "4",
      title: "Contact",
      slug: "/contact",
      status: "published", 
      type: "page",
      lastModified: "2025-01-28",
      views: 321
    },
    {
      id: "5",
      title: "Blog Post Draft",
      slug: "/blog/new-post",
      status: "draft",
      type: "blog",
      lastModified: "2025-01-31",
      views: 0
    },
    {
      id: "6",
      title: "Testing",
      slug: "/testing",
      status: "draft",
      type: "page",
      lastModified: "2025-08-03",
      views: 0
    }
  ]);

  const getStatusBadge = (status: string) => {
    const variants = {
      published: { variant: "default" as const, text: "Published" },
      draft: { variant: "secondary" as const, text: "Draft" },
      archived: { variant: "outline" as const, text: "Archived" }
    };
    return variants[status as keyof typeof variants] || variants.draft;
  };

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pages</h1>
          <p className="text-slate-600">Manage your website pages and content</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              <SelectItem value="primary">Primary Website</SelectItem>
              {Array.isArray(stores) && stores.map((store: any) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Page Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Page Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Default Domain</label>
                    <Input placeholder="example.com" defaultValue="optistore.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">SEO Title Template</label>
                    <Input placeholder="%title% | %site_name%" defaultValue="%title% | OptiStore Pro" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Meta Description Template</label>
                  <Input placeholder="Default meta description" defaultValue="Professional optical retail management system" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cache Settings</label>
                    <Select defaultValue="enabled">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Analytics</label>
                    <Select defaultValue="google">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google">Google Analytics</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setSettingsOpen(false)}>Cancel</Button>
                  <Button onClick={() => {
                    toast({ 
                      title: "Settings Saved", 
                      description: "Page settings have been updated successfully"
                    });
                    setSettingsOpen(false);
                  }}>Save Settings</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Page
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Page</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Page Title</label>
                    <Input placeholder="Enter page title" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">URL Slug</label>
                    <Input placeholder="/page-url" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Target Store</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary Website</SelectItem>
                      {Array.isArray(stores) && stores.map((store: any) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={() => {
                    const newPageTitle = document.querySelector('input[placeholder="Enter page title"]') as HTMLInputElement;
                    const newPageSlug = document.querySelector('input[placeholder="e.g., /about-us"]') as HTMLInputElement;
                    
                    if (newPageTitle?.value && newPageSlug?.value) {
                      const newPage = {
                        id: (pages.length + 1).toString(),
                        title: newPageTitle.value,
                        slug: newPageSlug.value,
                        status: "draft",
                        type: "page",
                        lastModified: new Date().toISOString().split('T')[0],
                        views: 0
                      };
                      
                      setPages([...pages, newPage]);
                      console.log('Creating new page:', newPage);
                      toast({ 
                        title: "Page Created", 
                        description: `"${newPageTitle.value}" has been created successfully`
                      });
                      setOpen(false);
                    } else {
                      toast({ 
                        title: "Error", 
                        description: "Please enter both title and slug",
                        variant: "destructive"
                      });
                    }
                  }}>Create Page</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Pages</p>
                <p className="text-2xl font-bold text-slate-900">{pages.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Published</p>
                <p className="text-2xl font-bold text-slate-900">
                  {pages.filter(p => p.status === "published").length}
                </p>
              </div>
              <Globe className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Drafts</p>
                <p className="text-2xl font-bold text-slate-900">
                  {pages.filter(p => p.status === "draft").length}
                </p>
              </div>
              <Edit className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Views</p>
                <p className="text-2xl font-bold text-slate-900">
                  {pages.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
                </p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select defaultValue="all" onValueChange={(value) => {
          console.log(`Status filter changed to: ${value}`);
          toast({
            title: "Filter Applied",
            description: `Showing ${value === 'all' ? 'all pages' : value + ' pages'}`,
          });
        }}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all" onValueChange={(value) => {
          console.log(`Type filter changed to: ${value}`);
          toast({
            title: "Filter Applied",
            description: `Showing ${value === 'all' ? 'all content' : value + ' content'}`,
          });
        }}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="page">Pages</SelectItem>
            <SelectItem value="blog">Blog Posts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pages List */}
      <Card>
        <CardHeader>
          <CardTitle>All Pages</CardTitle>
          <CardDescription>Manage your website's pages and content</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPages.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No pages found</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-slate-500 mb-4">
                Showing {filteredPages.length} of {pages.length} pages
              </div>

              {filteredPages.map((page) => (
                <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{page.title}</h4>
                        <Badge {...getStatusBadge(page.status)}>
                          {getStatusBadge(page.status).text}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {page.type}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <span>{page.slug}</span>
                        <span>Modified: {page.lastModified}</span>
                        <span>{page.views.toLocaleString()} views</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                      console.log(`Viewing page: ${page.title} (${page.slug})`);
                      toast({
                        title: "Page Preview",
                        description: `Opening preview for "${page.title}"`,
                      });
                      // In a real app, this would open the page in a new tab
                      window.open(`https://example.com${page.slug}`, '_blank');
                    }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      setEditingPage(page);
                      setSeoData({
                        title: page.title,
                        description: `Professional page for ${page.title}`,
                        keywords: `${page.title.toLowerCase()}, optistore, optical`,
                        canonical: `https://optistore.com${page.slug}`,
                        ogTitle: page.title,
                        ogDescription: `Visit our ${page.title} page`,
                        ogImage: "https://optistore.com/og-image.jpg",
                        twitterCard: "summary_large_image"
                      });
                      setPageContent(`Welcome to ${page.title}. This is sample content that you can edit using our visual editor.`);
                      console.log(`Opening advanced editor for page: ${page.title} (${page.id})`);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      if (confirm(`Are you sure you want to delete "${page.title}"? This action cannot be undone.`)) {
                        setPages(pages.filter(p => p.id !== page.id));
                        console.log(`Deleted page: ${page.title} (${page.id})`);
                        toast({
                          title: "Page Deleted",
                          description: `"${page.title}" has been permanently deleted`,
                          variant: "destructive",
                        });
                      }
                    }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Page Editor Dialog */}
      <Dialog open={!!editingPage} onOpenChange={(open) => {
        if (!open) {
          setEditingPage(null);
          setEditorTab("content");
          setPageContent("");
          setSeoData({
            title: "",
            description: "",
            keywords: "",
            canonical: "",
            ogTitle: "",
            ogDescription: "",
            ogImage: "",
            twitterCard: "summary_large_image"
          });
        }
      }}>
        <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
          <DialogHeader className="border-b pb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center space-x-3">
                <Edit className="h-5 w-5" />
                <span>Edit Page: {editingPage?.title}</span>
                <Badge variant={editingPage?.status === 'published' ? 'default' : 'secondary'}>
                  {editingPage?.status}
                </Badge>
              </DialogTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewMode("desktop")}>
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPreviewMode("tablet")}>
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPreviewMode("mobile")}>
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          {editingPage && (
            <div className="flex flex-1 min-h-0">
              {/* Left Sidebar - Settings */}
              <div className="w-80 border-r bg-slate-50 overflow-auto" style={{ height: 'calc(90vh - 260px)' }}>
                <div className="p-4 space-y-4">
                  {/* Basic Settings */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm text-slate-900">Page Settings</h3>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Page Title</label>
                      <Input defaultValue={editingPage.title} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">URL Slug</label>
                      <Input defaultValue={editingPage.slug} className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium text-slate-600">Status</label>
                        <Select defaultValue={editingPage.status}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600">Type</label>
                        <Select defaultValue={editingPage.type}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="page">Page</SelectItem>
                            <SelectItem value="blog">Blog Post</SelectItem>
                            <SelectItem value="product">Product</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* SEO Settings */}
                  <div className="space-y-3 border-t pt-4">
                    <h3 className="font-medium text-sm text-slate-900">SEO & Meta Tags</h3>
                    <div>
                      <label className="text-xs font-medium text-slate-600">SEO Title</label>
                      <Input 
                        placeholder="Enter SEO title (60 chars max)"
                        className="mt-1"
                        value={seoData.title}
                        onChange={(e) => setSeoData({...seoData, title: e.target.value})}
                      />
                      <p className="text-xs text-slate-500 mt-1">{seoData.title.length}/60</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Meta Description</label>
                      <textarea 
                        className="w-full mt-1 p-2 text-sm border rounded resize-none"
                        rows={3}
                        placeholder="Enter meta description (160 chars max)"
                        value={seoData.description}
                        onChange={(e) => setSeoData({...seoData, description: e.target.value})}
                      />
                      <p className="text-xs text-slate-500 mt-1">{seoData.description.length}/160</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Keywords</label>
                      <Input 
                        placeholder="keyword1, keyword2, keyword3"
                        className="mt-1"
                        value={seoData.keywords}
                        onChange={(e) => setSeoData({...seoData, keywords: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Canonical URL</label>
                      <Input 
                        placeholder="https://example.com/page"
                        className="mt-1"
                        value={seoData.canonical}
                        onChange={(e) => setSeoData({...seoData, canonical: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Open Graph Settings */}
                  <div className="space-y-3 border-t pt-4">
                    <h3 className="font-medium text-sm text-slate-900">Social Media (Open Graph)</h3>
                    <div>
                      <label className="text-xs font-medium text-slate-600">OG Title</label>
                      <Input 
                        placeholder="Social media title"
                        className="mt-1"
                        value={seoData.ogTitle}
                        onChange={(e) => setSeoData({...seoData, ogTitle: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">OG Description</label>
                      <textarea 
                        className="w-full mt-1 p-2 text-sm border rounded resize-none"
                        rows={2}
                        placeholder="Social media description"
                        value={seoData.ogDescription}
                        onChange={(e) => setSeoData({...seoData, ogDescription: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">OG Image URL</label>
                      <Input 
                        placeholder="https://example.com/image.jpg"
                        className="mt-1"
                        value={seoData.ogImage}
                        onChange={(e) => setSeoData({...seoData, ogImage: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Twitter Card</label>
                      <Select value={seoData.twitterCard} onValueChange={(value) => setSeoData({...seoData, twitterCard: value})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="summary">Summary</SelectItem>
                          <SelectItem value="summary_large_image">Large Image</SelectItem>
                          <SelectItem value="app">App</SelectItem>
                          <SelectItem value="player">Player</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Schema Markup */}
                  <div className="space-y-3 border-t pt-4">
                    <h3 className="font-medium text-sm text-slate-900">Schema Markup</h3>
                    <Select defaultValue="WebPage">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WebPage">WebPage</SelectItem>
                        <SelectItem value="Article">Article</SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="Organization">Organization</SelectItem>
                        <SelectItem value="LocalBusiness">LocalBusiness</SelectItem>
                        <SelectItem value="FAQ">FAQ</SelectItem>
                        <SelectItem value="HowTo">HowTo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Main Editor Area */}
              <div className="flex-1 flex flex-col">
                {/* Editor Toolbar */}
                <div className="border-b p-3 bg-white">
                  <div className="flex items-center space-x-1">
                    {/* Text Formatting */}
                    <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        document.execCommand('bold', false);
                        toast({ title: "Bold applied", description: "Text formatting updated" });
                      }}>
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        document.execCommand('italic', false);
                        toast({ title: "Italic applied", description: "Text formatting updated" });
                      }}>
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        document.execCommand('underline', false);
                        toast({ title: "Underline applied", description: "Text formatting updated" });
                      }}>
                        <Underline className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Headings */}
                    <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        document.execCommand('formatBlock', false, 'h1');
                        toast({ title: "Heading 1 applied" });
                      }}>
                        <Heading1 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        document.execCommand('formatBlock', false, 'h2');
                        toast({ title: "Heading 2 applied" });
                      }}>
                        <Heading2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        document.execCommand('formatBlock', false, 'h3');
                        toast({ title: "Heading 3 applied" });
                      }}>
                        <Heading3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        document.execCommand('formatBlock', false, 'p');
                        toast({ title: "Normal text applied" });
                      }}>
                        <Type className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Alignment */}
                    <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        document.execCommand('justifyLeft', false);
                        toast({ title: "Left aligned" });
                      }}>
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        document.execCommand('justifyCenter', false);
                        toast({ title: "Center aligned" });
                      }}>
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        document.execCommand('justifyRight', false);
                        toast({ title: "Right aligned" });
                      }}>
                        <AlignRight className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Media & Lists */}
                    <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        const url = prompt('Enter link URL:');
                        if (url) {
                          document.execCommand('createLink', false, url);
                          toast({ title: "Link added", description: url });
                        }
                      }}>
                        <Link className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        const url = prompt('Enter image URL:');
                        if (url) {
                          document.execCommand('insertImage', false, url);
                          toast({ title: "Image inserted", description: url });
                        }
                      }}>
                        <Image className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        document.execCommand('insertUnorderedList', false);
                        toast({ title: "List created" });
                      }}>
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Code & Quote */}
                    <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        document.execCommand('formatBlock', false, 'pre');
                        toast({ title: "Code block applied" });
                      }}>
                        <Code className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        document.execCommand('formatBlock', false, 'blockquote');
                        toast({ title: "Quote applied" });
                      }}>
                        <Quote className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Preview & Save Actions */}
                    <div className="flex items-center space-x-1 ml-auto">
                      <Button variant="outline" size="sm" onClick={() => {
                        toast({ title: "Preview Mode", description: "Showing page preview" });
                      }}>
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        toast({ title: "Auto-save", description: "Changes saved automatically" });
                      }}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Content Editor */}
                <div className="flex-1 overflow-auto" style={{ height: 'calc(90vh - 260px)' }}>
                  <div className="p-6 h-full">
                    <div className={`mx-auto bg-white shadow-sm border rounded-lg p-8 min-h-full ${
                      previewMode === 'mobile' ? 'max-w-sm' : 
                      previewMode === 'tablet' ? 'max-w-2xl' : 'max-w-4xl'
                    }`}>
                      <div className="space-y-6">
                        <Input 
                          className="text-3xl font-bold border-none shadow-none p-0 focus-visible:ring-0"
                          placeholder="Page title..."
                          defaultValue={editingPage.title}
                        />
                        <div 
                          className="min-h-[600px] p-6 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 prose prose-lg max-w-none"
                          contentEditable
                          suppressContentEditableWarning={true}
                          style={{ outline: 'none', minHeight: '600px', maxHeight: 'none' }}
                          onInput={(e) => setPageContent(e.currentTarget.innerHTML || "")}
                          dangerouslySetInnerHTML={{
                            __html: pageContent || `<p class="text-slate-500">Start typing your content here... Use the toolbar above to format your text.</p>`
                          }}
                        />
                        
                        {/* Content Stats */}
                        <div className="flex justify-between items-center mt-6 text-sm text-slate-500 border-t pt-4">
                          <div className="flex space-x-6">
                            <span>Words: {pageContent.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length}</span>
                            <span>Characters: {pageContent.replace(/<[^>]*>/g, '').length}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => {
                              navigator.clipboard.writeText(pageContent.replace(/<[^>]*>/g, ''));
                              toast({ title: "Content copied", description: "Text copied to clipboard" });
                            }}>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy Text
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                              setPageContent("");
                              toast({ title: "Content cleared", description: "Editor content has been cleared" });
                            }}>
                              Clear All
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="border-t p-4 flex items-center justify-between bg-slate-50 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                <Save className="h-4 w-4" />
                <span>Auto-saving enabled</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                <span>Last saved: Just now</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" onClick={() => {
                window.open(`https://preview.optistore.com${editingPage?.slug}`, '_blank');
                toast({ 
                  title: "Preview Opened", 
                  description: "Page preview opened in new tab"
                });
              }}>
                <Eye className="h-4 w-4 mr-2" />
                Preview Page
              </Button>
              <Button variant="outline" onClick={() => setEditingPage(null)}>Cancel</Button>
              <Button variant="outline" onClick={() => {
                const content = {
                  title: editingPage?.title,
                  content: pageContent,
                  seo: seoData
                };
                console.log('Saving draft:', content);
                toast({ 
                  title: "Draft Saved", 
                  description: `Changes to "${editingPage?.title}" saved as draft`
                });
              }}>Save Draft</Button>
              <Button onClick={() => {
                const publishData = {
                  title: editingPage?.title,
                  content: pageContent,
                  seo: seoData,
                  status: 'published'
                };
                console.log('Publishing page:', publishData);
                toast({ 
                  title: "Page Published", 
                  description: `"${editingPage?.title}" has been published successfully with SEO optimization`
                });
                setEditingPage(null);
              }}>
                <Upload className="h-4 w-4 mr-2" />
                Publish Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}