import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Store, 
  Globe, 
  CreditCard, 
  MessageSquare,
  Mail,
  Settings,
  Save,
  Eye,
  Edit
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface StoreSettings {
  id: string;
  name: string;
  domain?: string;
  websiteTitle?: string;
  websiteDescription?: string;
  logo?: string;
  favicon?: string;
  theme?: string;
  primaryColor?: string;
  secondaryColor?: string;
  // Payment Gateway Settings
  stripeEnabled: boolean;
  stripePublicKey?: string;
  stripeSecretKey?: string;
  paypalEnabled: boolean;
  paypalClientId?: string;
  paypalSecret?: string;
  // SMS Gateway Settings
  smsEnabled: boolean;
  smsProvider?: string;
  smsApiKey?: string;
  smsFrom?: string;
  // Email Settings
  emailEnabled: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpFromEmail?: string;
  smtpFromName?: string;
  // SEO Settings
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
}

export default function StoreSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [activeTab, setActiveTab] = useState("general");

  const { data: stores = [] } = useQuery({
    queryKey: ["/api/stores"],
    queryFn: async () => {
      const response = await fetch("/api/stores");
      if (!response.ok) throw new Error("Failed to fetch stores");
      return response.json();
    }
  });

  const { data: storeSettings, isLoading } = useQuery<StoreSettings>({
    queryKey: ["/api/store-settings", selectedStore],
    queryFn: async () => {
      if (!selectedStore) return null;
      const response = await fetch(`/api/store-settings/${selectedStore}`);
      if (!response.ok) throw new Error("Failed to fetch store settings");
      return response.json();
    },
    enabled: !!selectedStore
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<StoreSettings>) => {
      return await apiRequest("PUT", `/api/store-settings/${selectedStore}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Store settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/store-settings", selectedStore] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update store settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const [formData, setFormData] = useState<Partial<StoreSettings>>({});

  // Initialize formData when storeSettings loads
  useEffect(() => {
    if (storeSettings) {
      setFormData(storeSettings);
    }
  }, [storeSettings]);

  const handleSave = (tabData: Partial<StoreSettings>) => {
    updateSettingsMutation.mutate(tabData);
  };

  if (!selectedStore) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Store Settings</h1>
          <p className="text-slate-600">Configure individual store settings and integrations</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Select Store</CardTitle>
            <CardDescription>Choose a store to configure its settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger>
                <SelectValue placeholder="Select a store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store: any) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Store Settings</h1>
          <p className="text-slate-600">Configure settings for {stores.find((s: any) => s.id === selectedStore)?.name}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store: any) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-slate-500">Loading store settings...</p>
        </div>
      ) : (
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="website">Website</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="h-5 w-5 mr-2" />
                  General Settings
                </CardTitle>
                <CardDescription>Basic store information and branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Store Name</Label>
                    <Input 
                      value={formData?.name || storeSettings?.name || ""} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Domain</Label>
                    <Input 
                      value={formData?.domain || storeSettings?.domain || ""} 
                      onChange={(e) => setFormData({...formData, domain: e.target.value})}
                      placeholder="example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <Input 
                      type="color"
                      value={formData?.primaryColor || storeSettings?.primaryColor || "#3b82f6"} 
                      onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <Input 
                      type="color"
                      value={formData?.secondaryColor || storeSettings?.secondaryColor || "#64748b"} 
                      onChange={(e) => setFormData({...formData, secondaryColor: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={() => handleSave(formData)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save General Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="website" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Website Settings
                </CardTitle>
                <CardDescription>Configure your store's website appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Website Title</Label>
                  <Input 
                    value={formData?.websiteTitle ?? storeSettings?.websiteTitle ?? ""} 
                    onChange={(e) => setFormData({...formData, websiteTitle: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website Description</Label>
                  <Textarea
                    value={formData?.websiteDescription ?? storeSettings?.websiteDescription ?? ""} 
                    onChange={(e) => setFormData({...formData, websiteDescription: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Logo URL</Label>
                    <Input 
                      value={formData?.logo ?? storeSettings?.logo ?? ""} 
                      onChange={(e) => setFormData({...formData, logo: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Favicon URL</Label>
                    <Input 
                      value={formData?.favicon ?? storeSettings?.favicon ?? ""} 
                      onChange={(e) => setFormData({...formData, favicon: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select value={formData?.theme ?? storeSettings?.theme ?? "modern"} onValueChange={(value) => setFormData({...formData, theme: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern Medical</SelectItem>
                        <SelectItem value="classic">Classic Healthcare</SelectItem>
                        <SelectItem value="premium">Premium Vision Care</SelectItem>
                        <SelectItem value="minimal">Minimal Clean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={() => handleSave(formData)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Website Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Gateways
                </CardTitle>
                <CardDescription>Configure payment processing for this store</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stripe Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Stripe</h3>
                      <p className="text-sm text-slate-600">Process credit card payments</p>
                    </div>
                    <Switch 
                      checked={formData?.stripeEnabled ?? storeSettings?.stripeEnabled ?? false}
                      onCheckedChange={(checked) => setFormData({...formData, stripeEnabled: checked})}
                    />
                  </div>
                  {(formData?.stripeEnabled ?? storeSettings?.stripeEnabled) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-slate-200">
                      <div className="space-y-2">
                        <Label>Stripe Public Key</Label>
                        <Input 
                          value={formData?.stripePublicKey ?? storeSettings?.stripePublicKey ?? ""} 
                          onChange={(e) => setFormData({...formData, stripePublicKey: e.target.value})}
                          placeholder="pk_..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Stripe Secret Key</Label>
                        <Input 
                          type="password"
                          value={formData?.stripeSecretKey ?? storeSettings?.stripeSecretKey ?? ""} 
                          onChange={(e) => setFormData({...formData, stripeSecretKey: e.target.value})}
                          placeholder="sk_..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* PayPal Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">PayPal</h3>
                      <p className="text-sm text-slate-600">Accept PayPal payments</p>
                    </div>
                    <Switch 
                      checked={formData?.paypalEnabled ?? storeSettings?.paypalEnabled ?? false}
                      onCheckedChange={(checked) => setFormData({...formData, paypalEnabled: checked})}
                    />
                  </div>
                  {(formData?.paypalEnabled ?? storeSettings?.paypalEnabled) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-slate-200">
                      <div className="space-y-2">
                        <Label>PayPal Client ID</Label>
                        <Input 
                          value={formData?.paypalClientId ?? storeSettings?.paypalClientId ?? ""} 
                          onChange={(e) => setFormData({...formData, paypalClientId: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>PayPal Secret</Label>
                        <Input 
                          type="password"
                          value={formData?.paypalSecret ?? storeSettings?.paypalSecret ?? ""} 
                          onChange={(e) => setFormData({...formData, paypalSecret: e.target.value})}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <Button onClick={() => handleSave(formData)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Payment Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  SMS Gateway
                </CardTitle>
                <CardDescription>Configure SMS notifications for this store</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">SMS Notifications</h3>
                    <p className="text-sm text-slate-600">Send appointment reminders and notifications via SMS</p>
                  </div>
                  <Switch 
                    checked={formData?.smsEnabled ?? storeSettings?.smsEnabled ?? false}
                    onCheckedChange={(checked) => setFormData({...formData, smsEnabled: checked})}
                  />
                </div>
                {(formData?.smsEnabled ?? storeSettings?.smsEnabled) && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>SMS Provider</Label>
                      <Select value={formData?.smsProvider ?? storeSettings?.smsProvider ?? "twilio"} onValueChange={(value) => setFormData({...formData, smsProvider: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="twilio">Twilio</SelectItem>
                          <SelectItem value="aws">AWS SNS</SelectItem>
                          <SelectItem value="nexmo">Vonage (Nexmo)</SelectItem>
                          <SelectItem value="textlocal">TextLocal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>API Key</Label>
                        <Input 
                          type="password"
                          value={formData?.smsApiKey ?? storeSettings?.smsApiKey ?? ""} 
                          onChange={(e) => setFormData({...formData, smsApiKey: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>From Number</Label>
                        <Input 
                          value={formData?.smsFrom ?? storeSettings?.smsFrom ?? ""} 
                          onChange={(e) => setFormData({...formData, smsFrom: e.target.value})}
                          placeholder="+592 750-3901"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <Button onClick={() => handleSave(formData)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save SMS Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  SMTP Configuration
                </CardTitle>
                <CardDescription>Configure email settings for this store</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Email Notifications</h3>
                    <p className="text-sm text-slate-600">Send appointment confirmations and notifications via email</p>
                  </div>
                  <Switch 
                    checked={formData?.emailEnabled ?? storeSettings?.emailEnabled ?? false}
                    onCheckedChange={(checked) => setFormData({...formData, emailEnabled: checked})}
                  />
                </div>
                {(formData?.emailEnabled ?? storeSettings?.emailEnabled) && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>SMTP Host</Label>
                        <Input 
                          value={formData?.smtpHost ?? storeSettings?.smtpHost ?? ""} 
                          onChange={(e) => setFormData({...formData, smtpHost: e.target.value})}
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>SMTP Port</Label>
                        <Input 
                          type="number"
                          value={formData?.smtpPort ?? storeSettings?.smtpPort ?? 587} 
                          onChange={(e) => setFormData({...formData, smtpPort: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>SMTP Username</Label>
                        <Input 
                          value={formData?.smtpUsername ?? storeSettings?.smtpUsername ?? ""} 
                          onChange={(e) => setFormData({...formData, smtpUsername: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>SMTP Password</Label>
                        <Input 
                          type="password"
                          value={formData?.smtpPassword ?? storeSettings?.smtpPassword ?? ""} 
                          onChange={(e) => setFormData({...formData, smtpPassword: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>From Email</Label>
                        <Input 
                          value={formData?.smtpFromEmail ?? storeSettings?.smtpFromEmail ?? ""} 
                          onChange={(e) => setFormData({...formData, smtpFromEmail: e.target.value})}
                          placeholder="info.indiaespectacular@gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>From Name</Label>
                        <Input 
                          value={formData?.smtpFromName ?? storeSettings?.smtpFromName ?? ""} 
                          onChange={(e) => setFormData({...formData, smtpFromName: e.target.value})}
                          placeholder="Sandy Babb Street, Kitty, Georgetown, Guyana"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <Button onClick={() => handleSave(formData)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Email Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  SEO & Analytics
                </CardTitle>
                <CardDescription>Configure SEO settings and analytics for this store</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input 
                    value={formData?.metaTitle ?? storeSettings?.metaTitle ?? ""} 
                    onChange={(e) => setFormData({...formData, metaTitle: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea
                    value={formData?.metaDescription ?? storeSettings?.metaDescription ?? ""} 
                    onChange={(e) => setFormData({...formData, metaDescription: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meta Keywords</Label>
                  <Input 
                    value={formData?.metaKeywords ?? storeSettings?.metaKeywords ?? ""} 
                    onChange={(e) => setFormData({...formData, metaKeywords: e.target.value})}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Google Analytics ID</Label>
                    <Input 
                      value={formData?.googleAnalyticsId ?? storeSettings?.googleAnalyticsId ?? ""} 
                      onChange={(e) => setFormData({...formData, googleAnalyticsId: e.target.value})}
                      placeholder="GA-XXXXXXXXX-X"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Facebook Pixel ID</Label>
                    <Input 
                      value={formData?.facebookPixelId ?? storeSettings?.facebookPixelId ?? ""} 
                      onChange={(e) => setFormData({...formData, facebookPixelId: e.target.value})}
                      placeholder="123456789012345"
                    />
                  </div>
                </div>
                <Button onClick={() => handleSave(formData)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save SEO Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}