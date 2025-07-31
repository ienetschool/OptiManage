import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Palette, 
  Download, 
  Upload,
  Eye,
  Settings,
  Brush,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle
} from "lucide-react";

export default function Themes() {
  const [selectedTheme, setSelectedTheme] = useState("modern");
  const [previewDevice, setPreviewDevice] = useState("desktop");

  // Mock themes data
  const themes = [
    {
      id: "modern",
      name: "Modern Medical",
      description: "Clean, professional design for medical practices",
      preview: "/api/placeholder/400/300",
      category: "Medical",
      isActive: true,
      price: "Free"
    },
    {
      id: "classic",
      name: "Classic Healthcare",
      description: "Traditional healthcare design with professional styling",
      preview: "/api/placeholder/400/300",
      category: "Medical",
      isActive: false,
      price: "Free"
    },
    {
      id: "premium",
      name: "Premium Vision Care",
      description: "Premium design for optical and vision care practices",
      preview: "/api/placeholder/400/300",
      category: "Optical",
      isActive: false,
      price: "$29"
    },
    {
      id: "minimal",
      name: "Minimal Clean",
      description: "Minimalist design focusing on content and usability",
      preview: "/api/placeholder/400/300",
      category: "General",
      isActive: false,
      price: "Free"
    }
  ];

  const colorSchemes = [
    { name: "Blue Medical", primary: "#3b82f6", secondary: "#64748b", accent: "#06b6d4" },
    { name: "Green Health", primary: "#059669", secondary: "#6b7280", accent: "#10b981" },
    { name: "Purple Care", primary: "#7c3aed", secondary: "#64748b", accent: "#a855f7" },
    { name: "Orange Energy", primary: "#ea580c", secondary: "#6b7280", accent: "#f97316" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Themes & Design</h1>
          <p className="text-slate-600">Customize your website's appearance and branding</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Theme
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Theme
          </Button>
        </div>
      </div>

      <Tabs defaultValue="themes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="themes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map((theme) => (
              <Card key={theme.id} className={`relative ${theme.isActive ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader className="p-0">
                  <div className="relative">
                    <img 
                      src={theme.preview} 
                      alt={theme.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {theme.isActive && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-blue-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{theme.name}</h3>
                      <Badge variant="outline">{theme.category}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{theme.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">{theme.price}</span>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!theme.isActive && (
                          <Button size="sm" onClick={() => setSelectedTheme(theme.id)}>
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Color Schemes
              </CardTitle>
              <CardDescription>Choose or customize your website's color palette</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {colorSchemes.map((scheme, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{scheme.name}</h4>
                      <Button variant="outline" size="sm">Apply</Button>
                    </div>
                    <div className="flex space-x-2">
                      <div 
                        className="w-12 h-12 rounded-lg border"
                        style={{ backgroundColor: scheme.primary }}
                        title="Primary Color"
                      />
                      <div 
                        className="w-12 h-12 rounded-lg border"
                        style={{ backgroundColor: scheme.secondary }}
                        title="Secondary Color"
                      />
                      <div 
                        className="w-12 h-12 rounded-lg border"
                        style={{ backgroundColor: scheme.accent }}
                        title="Accent Color"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Custom Colors</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex space-x-2">
                      <Input type="color" className="w-16 h-10 p-1" defaultValue="#3b82f6" />
                      <Input defaultValue="#3b82f6" className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <div className="flex space-x-2">
                      <Input type="color" className="w-16 h-10 p-1" defaultValue="#64748b" />
                      <Input defaultValue="#64748b" className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Accent Color</Label>
                    <div className="flex space-x-2">
                      <Input type="color" className="w-16 h-10 p-1" defaultValue="#06b6d4" />
                      <Input defaultValue="#06b6d4" className="flex-1" />
                    </div>
                  </div>
                </div>
                <Button>
                  <Brush className="h-4 w-4 mr-2" />
                  Apply Custom Colors
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Typography Settings</CardTitle>
              <CardDescription>Customize fonts and text styling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Heading Font</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Inter</option>
                      <option>Poppins</option>
                      <option>Open Sans</option>
                      <option>Roboto</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Body Font</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Inter</option>
                      <option>Open Sans</option>
                      <option>Roboto</option>
                      <option>Source Sans Pro</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Base Font Size</Label>
                    <Input type="number" defaultValue="16" min="12" max="20" />
                  </div>
                  <div className="space-y-2">
                    <Label>Line Height</Label>
                    <Input type="number" defaultValue="1.5" min="1" max="2" step="0.1" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Preview</h4>
                <div className="p-4 border rounded-lg bg-slate-50">
                  <h1 className="text-3xl font-bold mb-2">Heading Example</h1>
                  <h2 className="text-xl font-semibold mb-2">Subheading Example</h2>
                  <p className="text-base mb-2">
                    This is a sample paragraph to show how your body text will look with the selected typography settings. 
                    You can see how the font family, size, and line height affect readability.
                  </p>
                  <p className="text-sm text-slate-600">Small text example for captions and metadata.</p>
                </div>
              </div>
              
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Apply Typography Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Live Preview</h3>
            <div className="flex items-center space-x-2">
              <Button 
                variant={previewDevice === "desktop" ? "default" : "outline"} 
                size="sm"
                onClick={() => setPreviewDevice("desktop")}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button 
                variant={previewDevice === "tablet" ? "default" : "outline"} 
                size="sm"
                onClick={() => setPreviewDevice("tablet")}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button 
                variant={previewDevice === "mobile" ? "default" : "outline"} 
                size="sm"
                onClick={() => setPreviewDevice("mobile")}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className={`mx-auto bg-white border rounded-lg overflow-hidden ${
                previewDevice === "desktop" ? "w-full" : 
                previewDevice === "tablet" ? "w-3/4 mx-auto" : "w-1/2 mx-auto"
              }`}>
                <div className="aspect-[16/10] bg-slate-100 flex items-center justify-center">
                  <div className="text-center">
                    <Monitor className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">Website Preview</p>
                    <p className="text-sm text-slate-400">Your customized theme will appear here</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}