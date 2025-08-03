import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  CheckCircle,
  Building,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Themes() {
  const [selectedTheme, setSelectedTheme] = useState("modern");
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [selectedStore, setSelectedStore] = useState("primary");
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [activeThemes, setActiveThemes] = useState<{[key: string]: boolean}>({ modern: true });
  const [customColors, setCustomColors] = useState({
    primary: "#3b82f6",
    secondary: "#64748b", 
    accent: "#06b6d4"
  });
  const [typography, setTypography] = useState({
    headingFont: "Inter",
    bodyFont: "Inter", 
    baseFontSize: 16,
    lineHeight: 1.5
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stores = [] } = useQuery({
    queryKey: ["/api/stores"],
  });

  const applyThemeMutation = useMutation({
    mutationFn: async ({ themeId, storeId }: { themeId: string; storeId: string }) => {
      // Mock API call - simulate theme application
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { themeId, storeId };
    },
    onSuccess: (data) => {
      // Update active themes state
      setActiveThemes(prev => ({
        ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
        [data.themeId]: true
      }));
      toast({
        title: "Theme Applied Successfully",
        description: `Theme has been applied to the selected store.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
    },
  });

  const activateTheme = (themeId: string) => {
    applyThemeMutation.mutate({ themeId, storeId: selectedStore });
  };

  const viewThemePreview = (themeId: string) => {
    setPreviewTheme(themeId);
    toast({
      title: "Theme Preview",
      description: `Previewing ${themes.find(t => t.id === themeId)?.name} theme.`,
    });
  };

  const applyColorScheme = (scheme: any) => {
    setCustomColors({
      primary: scheme.primary,
      secondary: scheme.secondary,
      accent: scheme.accent
    });
    toast({
      title: "Color Scheme Applied",
      description: `${scheme.name} color scheme has been applied.`,
    });
  };

  const applyCustomColors = () => {
    toast({
      title: "Custom Colors Applied",
      description: "Your custom color palette has been applied to the theme.",
    });
  };

  const applyTypographySettings = () => {
    toast({
      title: "Typography Settings Applied",
      description: "Your font and text styling settings have been applied to the theme.",
    });
  };

  // Mock themes data
  const themes = [
    {
      id: "modern",
      name: "Modern Medical",
      description: "Clean, professional design for medical practices",
      preview: "/api/placeholder/400/300",
      category: "Medical",
      isActive: activeThemes.modern || false,
      price: "Free"
    },
    {
      id: "classic",
      name: "Classic Healthcare", 
      description: "Traditional healthcare design with professional styling",
      preview: "/api/placeholder/400/300",
      category: "Medical",
      isActive: activeThemes.classic || false,
      price: "Free"
    },
    {
      id: "premium",
      name: "Premium Vision Care",
      description: "Premium design for optical and vision care practices",
      preview: "/api/placeholder/400/300",
      category: "Optical",
      isActive: activeThemes.premium || false,
      price: "$29"
    },
    {
      id: "minimal",
      name: "Minimal Clean",
      description: "Minimalist design focusing on content and usability",
      preview: "/api/placeholder/400/300",
      category: "General",
      isActive: activeThemes.minimal || false,
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
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-48">
              <SelectValue />
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
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Theme
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Theme
          </Button>
          <Button onClick={() => applyThemeMutation.mutate({ themeId: selectedTheme, storeId: selectedStore })}>
            <Save className="h-4 w-4 mr-2" />
            Apply Theme
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
                        <Button variant="ghost" size="sm" onClick={() => viewThemePreview(theme.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!theme.isActive && (
                          <Button size="sm" onClick={() => activateTheme(theme.id)} disabled={applyThemeMutation.isPending}>
                            {applyThemeMutation.isPending ? "Activating..." : "Activate"}
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
                      <Button variant="outline" size="sm" onClick={() => applyColorScheme(scheme)}>Apply</Button>
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
                      <Input 
                        type="color" 
                        className="w-16 h-10 p-1" 
                        value={customColors.primary}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, primary: e.target.value }))}
                      />
                      <Input 
                        value={customColors.primary} 
                        className="flex-1"
                        onChange={(e) => setCustomColors(prev => ({ ...prev, primary: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <div className="flex space-x-2">
                      <Input 
                        type="color" 
                        className="w-16 h-10 p-1" 
                        value={customColors.secondary}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, secondary: e.target.value }))}
                      />
                      <Input 
                        value={customColors.secondary} 
                        className="flex-1"
                        onChange={(e) => setCustomColors(prev => ({ ...prev, secondary: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Accent Color</Label>
                    <div className="flex space-x-2">
                      <Input 
                        type="color" 
                        className="w-16 h-10 p-1" 
                        value={customColors.accent}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, accent: e.target.value }))}
                      />
                      <Input 
                        value={customColors.accent} 
                        className="flex-1"
                        onChange={(e) => setCustomColors(prev => ({ ...prev, accent: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={applyCustomColors}>
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
                    <Select value={typography.headingFont} onValueChange={(value) => setTypography(prev => ({ ...prev, headingFont: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Poppins">Poppins</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Body Font</Label>
                    <Select value={typography.bodyFont} onValueChange={(value) => setTypography(prev => ({ ...prev, bodyFont: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Base Font Size</Label>
                    <Input 
                      type="number" 
                      value={typography.baseFontSize} 
                      min="12" 
                      max="20"
                      onChange={(e) => setTypography(prev => ({ ...prev, baseFontSize: parseInt(e.target.value) || 16 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Line Height</Label>
                    <Input 
                      type="number" 
                      value={typography.lineHeight} 
                      min="1" 
                      max="2" 
                      step="0.1"
                      onChange={(e) => setTypography(prev => ({ ...prev, lineHeight: parseFloat(e.target.value) || 1.5 }))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Live Preview</h4>
                <div className="p-4 border rounded-lg bg-slate-50">
                  <h1 
                    className="text-3xl font-bold mb-2"
                    style={{ 
                      fontFamily: typography.headingFont,
                      fontSize: `${typography.baseFontSize * 2}px`,
                      lineHeight: typography.lineHeight
                    }}
                  >
                    Heading Example ({typography.headingFont})
                  </h1>
                  <h2 
                    className="text-xl font-semibold mb-2"
                    style={{ 
                      fontFamily: typography.headingFont,
                      fontSize: `${typography.baseFontSize * 1.5}px`,
                      lineHeight: typography.lineHeight
                    }}
                  >
                    Subheading Example
                  </h2>
                  <p 
                    className="text-base mb-2"
                    style={{ 
                      fontFamily: typography.bodyFont,
                      fontSize: `${typography.baseFontSize}px`,
                      lineHeight: typography.lineHeight
                    }}
                  >
                    This is a sample paragraph to show how your body text will look with the selected typography settings ({typography.bodyFont}). 
                    You can see how the font family, size ({typography.baseFontSize}px), and line height ({typography.lineHeight}) affect readability.
                  </p>
                  <p 
                    className="text-sm text-slate-600"
                    style={{ 
                      fontFamily: typography.bodyFont,
                      fontSize: `${typography.baseFontSize * 0.875}px`,
                      lineHeight: typography.lineHeight
                    }}
                  >
                    Small text example for captions and metadata.
                  </p>
                </div>
              </div>
              
              <Button onClick={applyTypographySettings}>
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