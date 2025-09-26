import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Header removed for Patient Portal compatibility
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  Building, 
  Mail, 
  Bell, 
  Shield, 
  Monitor, 
  CreditCard,
  Save,
  TestTube,
  Globe,
  Palette,
  Users,
  Key,
  Database,
  FileText,
  Download,
  Upload,
  RefreshCw
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const generalSettingsSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessEmail: z.string().email("Valid email is required"),
  businessPhone: z.string().min(10, "Valid phone number is required"),
  businessAddress: z.string().min(1, "Address is required"),
  businessWebsite: z.string().url("Valid website URL is required").optional().or(z.literal("")),
  taxId: z.string().optional(),
  timeZone: z.string().min(1, "Time zone is required"),
  currency: z.string().min(1, "Currency is required"),
  dateFormat: z.string().min(1, "Date format is required"),
});

const emailSettingsSchema = z.object({
  smtpHost: z.string().min(1, "SMTP host is required"),
  smtpPort: z.number().min(1, "SMTP port is required"),
  smtpUsername: z.string().min(1, "SMTP username is required"),
  smtpPassword: z.string().min(1, "SMTP password is required"),
  fromEmail: z.string().email("Valid email is required"),
  fromName: z.string().min(1, "From name is required"),
  enableSSL: z.boolean(),
});

const oauthSettingsSchema = z.object({
  googleClientId: z.string().optional(),
  googleClientSecret: z.string().optional(),
  twitterConsumerKey: z.string().optional(),
  twitterConsumerSecret: z.string().optional(),
  appleClientId: z.string().optional(),
  appleTeamId: z.string().optional(),
  appleKeyId: z.string().optional(),
  enableGoogleAuth: z.boolean(),
  enableTwitterAuth: z.boolean(),
  enableAppleAuth: z.boolean(),
});

type GeneralSettingsData = z.infer<typeof generalSettingsSchema>;
type EmailSettingsData = z.infer<typeof emailSettingsSchema>;
type OAuthSettingsData = z.infer<typeof oauthSettingsSchema>;

interface SystemSettings {
  general: GeneralSettingsData;
  email: EmailSettingsData;
  oauth: OAuthSettingsData;
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    appointmentReminders: boolean;
    billingAlerts: boolean;
    inventoryAlerts: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
  };
  system: {
    maintenanceMode: boolean;
    autoBackup: boolean;
    backupFrequency: string;
    debugMode: boolean;
    logLevel: string;
  };
  billing: {
    defaultPaymentMethod: string;
    taxRate: number;
    lateFee: number;
    paymentTerms: number;
  };
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [testingEmail, setTestingEmail] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock settings data
  const { data: settings, isLoading } = useQuery<SystemSettings>({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      return {
        general: {
          businessName: "IeNet",
          businessEmail: "info.indiaespectacular@gmail.com",
          businessPhone: "+592 750-3901",
          businessAddress: "Sandy Babb Street, Kitty, Georgetown, Guyana",
          businessWebsite: "https://www.ienet.com",
          taxId: "12-3456789",
          timeZone: "America/New_York",
          currency: "USD",
          dateFormat: "MM/dd/yyyy",
        },
        email: {
          smtpHost: "smtp.gmail.com",
          smtpPort: 587,
          smtpUsername: "info.indiaespectacular@gmail.com",
          smtpPassword: "",
          fromEmail: "info.indiaespectacular@gmail.com",
          fromName: "IeNet",
          enableSSL: true,
        },
        oauth: {
          googleClientId: "",
          googleClientSecret: "",
          twitterConsumerKey: "",
          twitterConsumerSecret: "",
          appleClientId: "",
          appleTeamId: "",
          appleKeyId: "",
          enableGoogleAuth: false,
          enableTwitterAuth: false,
          enableAppleAuth: false,
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          appointmentReminders: true,
          billingAlerts: true,
          inventoryAlerts: true,
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSymbols: false,
          },
        },
        system: {
          maintenanceMode: false,
          autoBackup: true,
          backupFrequency: "daily",
          debugMode: false,
          logLevel: "info",
        },
        billing: {
          defaultPaymentMethod: "card",
          taxRate: 8.25,
          lateFee: 25.00,
          paymentTerms: 30,
        },
      };
    }
  });

  const generalForm = useForm<GeneralSettingsData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: settings?.general,
  });

  const emailForm = useForm<EmailSettingsData>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: settings?.email,
  });

  const oauthForm = useForm<OAuthSettingsData>({
    resolver: zodResolver(oauthSettingsSchema),
    defaultValues: settings?.oauth,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async ({ section, data }: { section: string; data: any }) => {
      await apiRequest("PATCH", `/api/settings/${section}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Success",
        description: "Settings updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: async (emailData: EmailSettingsData) => {
      await apiRequest("POST", "/api/settings/test-email", emailData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test email sent successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send test email. Please check your settings.",
        variant: "destructive",
      });
    },
  });

  const onGeneralSubmit = (data: GeneralSettingsData) => {
    updateSettingsMutation.mutate({ section: "general", data });
  };

  const onEmailSubmit = (data: EmailSettingsData) => {
    updateSettingsMutation.mutate({ section: "email", data });
  };

  const onOAuthSubmit = (data: OAuthSettingsData) => {
    updateSettingsMutation.mutate({ section: "oauth", data });
  };

  const handleTestEmail = () => {
    const emailData = emailForm.getValues();
    testEmailMutation.mutate(emailData);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header removed for Patient Portal compatibility */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-600 mt-1">Configure system preferences, email settings, security, and billing options.</p>
      </div>
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="general" className="flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>General</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </TabsTrigger>
              <TabsTrigger value="oauth" className="flex items-center space-x-2">
                <Key className="h-4 w-4" />
                <span>OAuth</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center space-x-2">
                <Monitor className="h-4 w-4" />
                <span>System</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>Billing</span>
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Business Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...generalForm}>
                    <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <FormField
                          control={generalForm.control}
                          name="businessName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter business name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={generalForm.control}
                          name="businessEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="business@email.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <FormField
                          control={generalForm.control}
                          name="businessPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="(555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={generalForm.control}
                          name="businessWebsite"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="https://www.business.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={generalForm.control}
                        name="businessAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Address</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter full business address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-6">
                        <FormField
                          control={generalForm.control}
                          name="timeZone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time Zone</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={generalForm.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={generalForm.control}
                          name="dateFormat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date Format</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                                  <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                                  <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end pt-6 border-t">
                        <Button 
                          type="submit"
                          disabled={updateSettingsMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Settings */}
            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="h-5 w-5" />
                    <span>SMTP Email Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <FormField
                          control={emailForm.control}
                          name="smtpHost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SMTP Host</FormLabel>
                              <FormControl>
                                <Input placeholder="smtp.gmail.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={emailForm.control}
                          name="smtpPort"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SMTP Port</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="587" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <FormField
                          control={emailForm.control}
                          name="smtpUsername"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SMTP Username</FormLabel>
                              <FormControl>
                                <Input placeholder="username@gmail.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={emailForm.control}
                          name="smtpPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SMTP Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <FormField
                          control={emailForm.control}
                          name="fromEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>From Email</FormLabel>
                              <FormControl>
                                <Input placeholder="noreply@business.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={emailForm.control}
                          name="fromName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>From Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Business Name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={emailForm.control}
                        name="enableSSL"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable SSL/TLS</FormLabel>
                              <FormDescription>
                                Use SSL/TLS encryption for secure email transmission
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-between items-center pt-6 border-t">
                        <Button 
                          type="button"
                          variant="outline" 
                          onClick={handleTestEmail}
                          disabled={testEmailMutation.isPending}
                        >
                          <TestTube className="mr-2 h-4 w-4" />
                          {testEmailMutation.isPending ? "Testing..." : "Test Email"}
                        </Button>
                        
                        <Button 
                          type="submit"
                          disabled={updateSettingsMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* OAuth Settings */}
            <TabsContent value="oauth">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="h-5 w-5" />
                    <span>Social Authentication Setup</span>
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-2">
                    Configure OAuth credentials for Google, Apple, and Twitter social login options
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Google OAuth */}
                  <div className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">G</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Google OAuth</h3>
                        <p className="text-sm text-slate-600">Allow users to sign in with their Google accounts</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium">Enable Google Sign-In</span>
                      <Switch />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Google Client ID</Label>
                        <Input 
                          placeholder="123456789012-abcdef.apps.googleusercontent.com"
                          type="text"
                        />
                        <p className="text-xs text-slate-500">Get this from Google Cloud Console</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Google Client Secret</Label>
                        <Input 
                          placeholder="GOCSPX-abcdef123456789"
                          type="password"
                        />
                        <p className="text-xs text-slate-500">Keep this secret and secure</p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Setup Instructions:</h4>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Go to <a href="https://console.cloud.google.com/" target="_blank" className="underline">Google Cloud Console</a></li>
                        <li>Create a new project or select existing one</li>
                        <li>Enable Google+ API</li>
                        <li>Create OAuth 2.0 credentials</li>
                        <li>Add your domain to authorized redirect URIs</li>
                      </ol>
                    </div>
                  </div>

                  {/* Twitter OAuth */}
                  <div className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">𝕏</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Twitter/X OAuth</h3>
                        <p className="text-sm text-slate-600">Allow users to sign in with their Twitter/X accounts</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium">Enable Twitter Sign-In</span>
                      <Switch />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Twitter Consumer Key</Label>
                        <Input 
                          placeholder="abcdef123456789"
                          type="text"
                        />
                        <p className="text-xs text-slate-500">Get this from Twitter Developer Portal</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Twitter Consumer Secret</Label>
                        <Input 
                          placeholder="abcdef123456789abcdef123456789"
                          type="password"
                        />
                        <p className="text-xs text-slate-500">Keep this secret and secure</p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Setup Instructions:</h4>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Go to <a href="https://developer.twitter.com/" target="_blank" className="underline">Twitter Developer Portal</a></li>
                        <li>Create a new app or select existing one</li>
                        <li>Generate Consumer Keys</li>
                        <li>Configure app permissions and callback URLs</li>
                        <li>Enable "Request email from users" if needed</li>
                      </ol>
                    </div>
                  </div>

                  {/* Apple OAuth */}
                  <div className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm"></span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Apple Sign In</h3>
                        <p className="text-sm text-slate-600">Allow users to sign in with their Apple ID</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium">Enable Apple Sign-In</span>
                      <Switch />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Apple Client ID</Label>
                        <Input 
                          placeholder="com.yourapp.service"
                          type="text"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Apple Team ID</Label>
                        <Input 
                          placeholder="ABCDEF1234"
                          type="text"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Apple Key ID</Label>
                        <Input 
                          placeholder="ABCDEF1234"
                          type="text"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-orange-900 mb-2">Advanced Setup Required:</h4>
                      <p className="text-sm text-orange-800 mb-2">
                        Apple Sign-In requires additional setup including private keys and certificates.
                      </p>
                      <ol className="text-sm text-orange-800 space-y-1 list-decimal list-inside">
                        <li>Join Apple Developer Program</li>
                        <li>Create App ID and Service ID</li>
                        <li>Generate private key for Sign In</li>
                        <li>Configure domain verification</li>
                        <li>Implement frontend JavaScript SDK</li>
                      </ol>
                    </div>
                  </div>

                  <Form {...oauthForm}>
                    <form onSubmit={oauthForm.handleSubmit(onOAuthSubmit)} className="space-y-6">
                      <div className="flex justify-end pt-6 border-t">
                        <Button 
                          type="submit"
                          disabled={updateSettingsMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {updateSettingsMutation.isPending ? "Saving..." : "Save OAuth Settings"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium">Communication Channels</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Email Notifications</h5>
                          <p className="text-sm text-slate-600">Receive notifications via email</p>
                        </div>
                        <Switch defaultChecked={settings?.notifications.emailNotifications} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">SMS Notifications</h5>
                          <p className="text-sm text-slate-600">Receive notifications via SMS</p>
                        </div>
                        <Switch defaultChecked={settings?.notifications.smsNotifications} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Push Notifications</h5>
                          <p className="text-sm text-slate-600">Receive browser push notifications</p>
                        </div>
                        <Switch defaultChecked={settings?.notifications.pushNotifications} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-lg font-medium">Notification Types</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Appointment Reminders</h5>
                          <p className="text-sm text-slate-600">Automatic reminders for upcoming appointments</p>
                        </div>
                        <Switch defaultChecked={settings?.notifications.appointmentReminders} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Billing Alerts</h5>
                          <p className="text-sm text-slate-600">Notifications for payment due dates and overdue bills</p>
                        </div>
                        <Switch defaultChecked={settings?.notifications.billingAlerts} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Inventory Alerts</h5>
                          <p className="text-sm text-slate-600">Low stock and reorder notifications</p>
                        </div>
                        <Switch defaultChecked={settings?.notifications.inventoryAlerts} />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Save className="mr-2 h-4 w-4" />
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Security Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium">Authentication</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">Two-Factor Authentication</h5>
                        <p className="text-sm text-slate-600">Require 2FA for all user logins</p>
                      </div>
                      <Switch defaultChecked={settings?.security.twoFactorAuth} />
                    </div>
                    <div className="space-y-2">
                      <Label>Session Timeout (minutes)</Label>
                      <Input 
                        type="number" 
                        defaultValue={settings?.security.sessionTimeout}
                        className="w-32"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-lg font-medium">Password Policy</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Minimum Length</Label>
                        <Input 
                          type="number" 
                          defaultValue={settings?.security.passwordPolicy.minLength}
                          className="w-20"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Require Uppercase Letters</span>
                        <Switch defaultChecked={settings?.security.passwordPolicy.requireUppercase} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Require Lowercase Letters</span>
                        <Switch defaultChecked={settings?.security.passwordPolicy.requireLowercase} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Require Numbers</span>
                        <Switch defaultChecked={settings?.security.passwordPolicy.requireNumbers} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Require Symbols</span>
                        <Switch defaultChecked={settings?.security.passwordPolicy.requireSymbols} />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Save className="mr-2 h-4 w-4" />
                      Save Security Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5" />
                    <span>System Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium">Maintenance</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">Maintenance Mode</h5>
                        <p className="text-sm text-slate-600">Put system in maintenance mode</p>
                      </div>
                      <Switch defaultChecked={settings?.system.maintenanceMode} />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-6">
                    <h4 className="text-lg font-medium flex items-center">
                      <Database className="h-5 w-5 mr-2" />
                      Backup & Recovery Management
                    </h4>
                    
                    {/* Automatic Backup Settings */}
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h5 className="font-medium">Automatic Backup</h5>
                          <p className="text-sm text-slate-600">Enable scheduled automatic data backups</p>
                        </div>
                        <Switch defaultChecked={settings?.system.autoBackup} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Backup Frequency</Label>
                          <Select defaultValue={settings?.system.backupFrequency}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hourly">Every Hour</SelectItem>
                              <SelectItem value="daily">Daily at 2:00 AM</SelectItem>
                              <SelectItem value="weekly">Weekly (Sundays)</SelectItem>
                              <SelectItem value="monthly">Monthly (1st of each month)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Retention Period</Label>
                          <Select defaultValue="30">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="7">7 days</SelectItem>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Backup History & Management */}
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-3">Recent Backups</h5>
                      <div className="space-y-3">
                        {[
                          { date: "2024-03-15 02:00 AM", size: "245 MB", status: "Success", type: "Automatic" },
                          { date: "2024-03-14 02:00 AM", size: "243 MB", status: "Success", type: "Automatic" },
                          { date: "2024-03-13 03:30 PM", size: "241 MB", status: "Success", type: "Manual" },
                          { date: "2024-03-12 02:00 AM", size: "239 MB", status: "Success", type: "Automatic" },
                          { date: "2024-03-11 02:00 AM", size: "237 MB", status: "Failed", type: "Automatic" }
                        ].map((backup, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`h-2 w-2 rounded-full ${
                                backup.status === 'Success' ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              <div>
                                <p className="font-medium text-sm">{backup.date}</p>
                                <p className="text-xs text-slate-500">{backup.size} • {backup.type}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                backup.status === 'Success' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {backup.status}
                              </span>
                              {backup.status === 'Success' && (
                                <>
                                  <Button size="sm" variant="ghost" onClick={() => {
                                    toast({ title: "Downloading backup", description: `Backup from ${backup.date}` });
                                  }}>
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => {
                                    toast({ 
                                      title: "Restore Initiated", 
                                      description: "System will restore from this backup. This may take several minutes." 
                                    });
                                  }}>
                                    Restore
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Backup Actions */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="text-sm text-slate-600">
                          <p>Next backup: Today at 2:00 AM</p>
                          <p>Storage used: 1.2 GB of 5 GB limit</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" onClick={() => {
                            toast({ 
                              title: "Manual Backup Started", 
                              description: "Creating full system backup..." 
                            });
                          }}>
                            <Database className="h-4 w-4 mr-2" />
                            Backup Now
                          </Button>
                          <Button variant="outline" onClick={() => {
                            toast({ 
                              title: "Backup Settings", 
                              description: "Opening advanced backup configuration..." 
                            });
                          }}>
                            Configure
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Import/Export Tools */}
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-3">Data Import/Export</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Export Data</Label>
                          <p className="text-xs text-slate-600 mb-2">Download your data in various formats</p>
                          <div className="space-y-2">
                            <Button size="sm" variant="outline" className="w-full justify-start">
                              <FileText className="h-4 w-4 mr-2" />
                              Export as JSON
                            </Button>
                            <Button size="sm" variant="outline" className="w-full justify-start">
                              <FileText className="h-4 w-4 mr-2" />
                              Export as CSV
                            </Button>
                            <Button size="sm" variant="outline" className="w-full justify-start">
                              <Database className="h-4 w-4 mr-2" />
                              Export Database
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Import Data</Label>
                          <p className="text-xs text-slate-600 mb-2">Import data from backup files</p>
                          <div className="space-y-2">
                            <Button size="sm" variant="outline" className="w-full justify-start">
                              Import from File
                            </Button>
                            <Button size="sm" variant="outline" className="w-full justify-start">
                              Restore from Backup
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-lg font-medium">Debug Settings</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">Debug Mode</h5>
                        <p className="text-sm text-slate-600">Enable detailed logging and debugging</p>
                      </div>
                      <Switch defaultChecked={settings?.system.debugMode} />
                    </div>
                    <div className="space-y-2">
                      <Label>Log Level</Label>
                      <Select defaultValue={settings?.system.logLevel}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="error">Error</SelectItem>
                          <SelectItem value="warn">Warning</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="debug">Debug</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Save className="mr-2 h-4 w-4" />
                      Save System Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Settings */}
            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Billing Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Default Payment Method</Label>
                      <Select defaultValue={settings?.billing.defaultPaymentMethod}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Credit/Debit Card</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tax Rate (%)</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        defaultValue={settings?.billing.taxRate}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Late Fee ($)</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        defaultValue={settings?.billing.lateFee}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Payment Terms (days)</Label>
                      <Input 
                        type="number"
                        defaultValue={settings?.billing.paymentTerms}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Save className="mr-2 h-4 w-4" />
                      Save Billing Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}