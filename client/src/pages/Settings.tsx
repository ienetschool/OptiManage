import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Settings as SettingsIcon,
  Mail,
  Database,
  Users,
  Shield,
  Bell,
  Palette,
  Globe,
  Plus,
  Edit,
  Trash2,
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  Key,
  Lock
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { insertSystemSettingsSchema, insertCustomFieldConfigSchema, type SystemSettings, type CustomFieldConfig } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const smtpSchema = z.object({
  host: z.string().min(1, "SMTP host is required"),
  port: z.coerce.number().min(1).max(65535),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  fromEmail: z.string().email("Valid email is required"),
  fromName: z.string().min(1, "From name is required"),
  secure: z.boolean(),
  enabled: z.boolean(),
});

type SMTPConfig = z.infer<typeof smtpSchema>;

export default function Settings() {
  const [activeTab, setActiveTab] = useState("smtp");
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [openCustomField, setOpenCustomField] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldConfig | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch system settings
  const { data: systemSettings = [] } = useQuery<SystemSettings[]>({
    queryKey: ["/api/settings"],
  });

  // Fetch custom fields config
  const { data: customFields = [] } = useQuery<CustomFieldConfig[]>({
    queryKey: ["/api/custom-fields"],
  });

  // Get SMTP settings from system settings
  const getSettingValue = (key: string, defaultValue: any = "") => {
    const setting = systemSettings.find(s => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  const smtpForm = useForm<SMTPConfig>({
    resolver: zodResolver(smtpSchema),
    defaultValues: {
      host: getSettingValue("smtp_host"),
      port: parseInt(getSettingValue("smtp_port", "587")),
      username: getSettingValue("smtp_username"),
      password: getSettingValue("smtp_password"),
      fromEmail: getSettingValue("smtp_from_email"),
      fromName: getSettingValue("smtp_from_name"),
      secure: getSettingValue("smtp_secure", "false") === "true",
      enabled: getSettingValue("smtp_enabled", "false") === "true",
    },
  });

  const customFieldForm = useForm({
    resolver: zodResolver(insertCustomFieldConfigSchema),
    defaultValues: {
      fieldName: "",
      fieldLabel: "",
      fieldType: "text",
      entityType: "customers",
      isRequired: false,
      isActive: true,
      options: null,
      defaultValue: "",
      validation: null,
      sortOrder: 0,
    },
  });

  // Update SMTP settings mutation
  const updateSMTPMutation = useMutation({
    mutationFn: async (data: SMTPConfig) => {
      const settingsToUpdate = [
        { key: "smtp_host", value: data.host, category: "email" },
        { key: "smtp_port", value: data.port.toString(), category: "email" },
        { key: "smtp_username", value: data.username, category: "email" },
        { key: "smtp_password", value: data.password, category: "email" },
        { key: "smtp_from_email", value: data.fromEmail, category: "email" },
        { key: "smtp_from_name", value: data.fromName, category: "email" },
        { key: "smtp_secure", value: data.secure.toString(), category: "email" },
        { key: "smtp_enabled", value: data.enabled.toString(), category: "email" },
      ];

      for (const setting of settingsToUpdate) {
        await apiRequest("PUT", "/api/settings", setting);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Success",
        description: "SMTP settings updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update SMTP settings.",
        variant: "destructive",
      });
    },
  });

  // Test email mutation
  const testEmailMutation = useMutation({
    mutationFn: async (config: SMTPConfig) => {
      await apiRequest("POST", "/api/settings/test-email", {
        ...config,
        testEmail: config.fromEmail,
      });
    },
    onSuccess: () => {
      toast({
        title: "Test Email Sent",
        description: "Check your inbox for the test email.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message || "Failed to send test email.",
        variant: "destructive",
      });
    },
  });

  // Custom field mutations
  const createCustomFieldMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/custom-fields", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-fields"] });
      toast({
        title: "Success",
        description: "Custom field created successfully.",
      });
      setOpenCustomField(false);
      customFieldForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create custom field.",
        variant: "destructive",
      });
    },
  });

  const updateCustomFieldMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PUT", `/api/custom-fields/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-fields"] });
      toast({
        title: "Success",
        description: "Custom field updated successfully.",
      });
      setOpenCustomField(false);
      setEditingField(null);
      customFieldForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update custom field.",
        variant: "destructive",
      });
    },
  });

  const deleteCustomFieldMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/custom-fields/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-fields"] });
      toast({
        title: "Success",
        description: "Custom field deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete custom field.",
        variant: "destructive",
      });
    },
  });

  const onSMTPSubmit = (data: SMTPConfig) => {
    updateSMTPMutation.mutate(data);
  };

  const onTestEmail = async () => {
    const isValid = await smtpForm.trigger();
    if (isValid) {
      setIsTestingEmail(true);
      const formData = smtpForm.getValues();
      testEmailMutation.mutate(formData);
      setTimeout(() => setIsTestingEmail(false), 3000);
    }
  };

  const onCustomFieldSubmit = (data: any) => {
    if (editingField) {
      updateCustomFieldMutation.mutate({ id: editingField.id, data });
    } else {
      createCustomFieldMutation.mutate(data);
    }
  };

  const handleEditCustomField = (field: CustomFieldConfig) => {
    setEditingField(field);
    customFieldForm.reset({
      fieldName: field.fieldName,
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      entityType: field.entityType,
      isRequired: field.isRequired,
      isActive: field.isActive,
      options: field.options,
      defaultValue: field.defaultValue || "",
      validation: field.validation,
      sortOrder: field.sortOrder || 0,
    });
    setOpenCustomField(true);
  };

  const handleDeleteCustomField = (id: string) => {
    if (confirm("Are you sure you want to delete this custom field?")) {
      deleteCustomFieldMutation.mutate(id);
    }
  };

  return (
    <>
      <Header 
        title="System Settings" 
        subtitle="Configure SMTP, custom fields, and system preferences for your optical store management system." 
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="smtp" className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>SMTP Email</span>
              </TabsTrigger>
              <TabsTrigger value="custom-fields" className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>Custom Fields</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="general" className="flex items-center space-x-2">
                <SettingsIcon className="h-4 w-4" />
                <span>General</span>
              </TabsTrigger>
            </TabsList>

            {/* SMTP Email Configuration */}
            <TabsContent value="smtp" className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <span>SMTP Email Configuration</span>
                  </CardTitle>
                  <p className="text-sm text-slate-600">
                    Configure email settings for notifications, invoices, and customer communication.
                  </p>
                </CardHeader>
                <CardContent>
                  <Form {...smtpForm}>
                    <form onSubmit={smtpForm.handleSubmit(onSMTPSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={smtpForm.control}
                          name="enabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Enable SMTP</FormLabel>
                                <FormDescription>
                                  Turn on email notifications and communications
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

                        <FormField
                          control={smtpForm.control}
                          name="secure"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Use SSL/TLS</FormLabel>
                                <FormDescription>
                                  Enable secure connection to email server
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
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={smtpForm.control}
                          name="host"
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
                          control={smtpForm.control}
                          name="port"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SMTP Port</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="587" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={smtpForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="your-email@gmail.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={smtpForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="App-specific password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={smtpForm.control}
                          name="fromEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>From Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="noreply@yourstore.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={smtpForm.control}
                          name="fromName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>From Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your Optical Store" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex space-x-4">
                        <Button
                          type="submit"
                          disabled={updateSMTPMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {updateSMTPMutation.isPending ? "Saving..." : "Save Settings"}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={onTestEmail}
                          disabled={isTestingEmail || testEmailMutation.isPending}
                        >
                          <TestTube className="mr-2 h-4 w-4" />
                          {isTestingEmail ? "Testing..." : "Test Email"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Custom Fields Configuration */}
            <TabsContent value="custom-fields" className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Database className="h-5 w-5 text-purple-600" />
                        <span>Custom Fields</span>
                      </CardTitle>
                      <p className="text-sm text-slate-600">
                        Add custom fields to customers, products, and other entities.
                      </p>
                    </div>
                    <Dialog open={openCustomField} onOpenChange={setOpenCustomField}>
                      <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Custom Field
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>
                            {editingField ? "Edit Custom Field" : "Add Custom Field"}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <Form {...customFieldForm}>
                          <form onSubmit={customFieldForm.handleSubmit(onCustomFieldSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={customFieldForm.control}
                                name="fieldName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Field Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="insurance_provider" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                      Internal name (no spaces, lowercase)
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={customFieldForm.control}
                                name="fieldLabel"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Field Label</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Insurance Provider" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                      Display name shown to users
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={customFieldForm.control}
                                name="fieldType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Field Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="text">Text</SelectItem>
                                        <SelectItem value="number">Number</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="phone">Phone</SelectItem>
                                        <SelectItem value="date">Date</SelectItem>
                                        <SelectItem value="select">Dropdown</SelectItem>
                                        <SelectItem value="checkbox">Checkbox</SelectItem>
                                        <SelectItem value="textarea">Text Area</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={customFieldForm.control}
                                name="entityType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Apply To</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="customers">Customers</SelectItem>
                                        <SelectItem value="products">Products</SelectItem>
                                        <SelectItem value="stores">Stores</SelectItem>
                                        <SelectItem value="appointments">Appointments</SelectItem>
                                        <SelectItem value="sales">Sales</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="flex items-center space-x-6">
                              <FormField
                                control={customFieldForm.control}
                                name="isRequired"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>Required Field</FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={customFieldForm.control}
                                name="isActive"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>Active</FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setOpenCustomField(false);
                                  setEditingField(null);
                                  customFieldForm.reset();
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                disabled={createCustomFieldMutation.isPending || updateCustomFieldMutation.isPending}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                {createCustomFieldMutation.isPending || updateCustomFieldMutation.isPending
                                  ? "Saving..." 
                                  : editingField ? "Update Field" : "Create Field"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {customFields.length === 0 ? (
                    <div className="text-center py-12">
                      <Database className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No custom fields</h3>
                      <p className="text-slate-600 mb-6">
                        Add custom fields to collect additional information for your business.
                      </p>
                      <Button 
                        onClick={() => setOpenCustomField(true)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Custom Field
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Field Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Entity</TableHead>
                            <TableHead>Required</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customFields.map((field) => (
                            <TableRow key={field.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{field.fieldLabel}</p>
                                  <p className="text-sm text-slate-500">{field.fieldName}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {field.fieldType}
                                </Badge>
                              </TableCell>
                              <TableCell className="capitalize">{field.entityType}</TableCell>
                              <TableCell>
                                {field.isRequired ? (
                                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-slate-400" />
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={field.isActive 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-red-100 text-red-800'
                                  }
                                >
                                  {field.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditCustomField(field)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteCustomField(field.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other tabs placeholder */}
            <TabsContent value="notifications">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-amber-600" />
                    <span>Notification Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">Notification preferences coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    <span>Security Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">Security configurations coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="general">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <SettingsIcon className="h-5 w-5 text-slate-600" />
                    <span>General Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">General system preferences coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}