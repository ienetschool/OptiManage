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
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Pages() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState("all");
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stores = [] } = useQuery({
    queryKey: ["/api/stores"],
  });

  // Mock pages data
  const pages = [
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
    }
  ];

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
                    console.log('Creating new page with form data');
                    toast({ 
                      title: "Page Created", 
                      description: "New page has been created successfully"
                    });
                    setOpen(false);
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
                      console.log(`Opening editor for page: ${page.title} (${page.id})`);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      if (confirm(`Are you sure you want to delete "${page.title}"? This action cannot be undone.`)) {
                        console.log(`Deleting page: ${page.title} (${page.id})`);
                        toast({
                          title: "Page Deleted",
                          description: `"${page.title}" has been moved to trash`,
                          variant: "destructive",
                        });
                        // In a real app, this would call the delete API
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

      {/* Edit Page Dialog */}
      <Dialog open={!!editingPage} onOpenChange={(open) => !open && setEditingPage(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Page: {editingPage?.title}</DialogTitle>
          </DialogHeader>
          {editingPage && (
            <div className="space-y-6 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Page Title</label>
                  <Input defaultValue={editingPage.title} />
                </div>
                <div>
                  <label className="text-sm font-medium">URL Slug</label>
                  <Input defaultValue={editingPage.slug} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select defaultValue={editingPage.status}>
                    <SelectTrigger>
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
                  <label className="text-sm font-medium">Page Type</label>
                  <Select defaultValue={editingPage.type}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="page">Page</SelectItem>
                      <SelectItem value="blog">Blog Post</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">SEO Meta Description</label>
                <Input placeholder="Enter meta description for SEO" />
              </div>
              <div>
                <label className="text-sm font-medium">Page Content</label>
                <div className="border rounded-lg p-4 min-h-[200px] bg-slate-50">
                  <p className="text-sm text-slate-500 mb-4">Page Editor</p>
                  <div className="space-y-2">
                    <Input placeholder="Page heading..." />
                    <textarea 
                      className="w-full min-h-[120px] p-3 border rounded resize-none"
                      placeholder="Page content goes here..."
                      defaultValue={`This is the content for ${editingPage.title}. You can edit this content using the page editor.`}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingPage(null)}>Cancel</Button>
                <Button variant="outline" onClick={() => {
                  toast({ 
                    title: "Draft Saved", 
                    description: `Changes to "${editingPage.title}" saved as draft`
                  });
                }}>Save Draft</Button>
                <Button onClick={() => {
                  toast({ 
                    title: "Page Updated", 
                    description: `"${editingPage.title}" has been updated successfully`
                  });
                  setEditingPage(null);
                }}>Update Page</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}