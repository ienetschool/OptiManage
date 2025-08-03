import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Bell, 
  BellRing, 
  Settings, 
  Plus, 
  Edit, 
  Trash2,
  Check,
  X,
  Clock,
  Calendar,
  User,
  Users,
  Mail,
  MessageCircle,
  Gift,
  CreditCard,
  Stethoscope,
  FileText,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Zap,
  Volume2,
  VolumeX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isYesterday } from "date-fns";

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("notifications");
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock notification data
  const notifications = [
    {
      id: "1",
      title: "Appointment Reminder",
      message: "John Smith has an appointment in 30 minutes",
      type: "appointment",
      priority: "high",
      status: "unread",
      timestamp: new Date(2024, 2, 15, 14, 30),
      recipient: "staff",
      actions: ["view", "dismiss"]
    },
    {
      id: "2",
      title: "Birthday Alert",
      message: "Sarah Johnson's birthday is today. Send wishes!",
      type: "birthday",
      priority: "medium",
      status: "read",
      timestamp: new Date(2024, 2, 15, 9, 0),
      recipient: "admin",
      actions: ["send_wishes", "dismiss"]
    },
    {
      id: "3",
      title: "Payment Overdue",
      message: "Invoice #12345 is 5 days overdue - $850",
      type: "payment",
      priority: "high",
      status: "unread",
      timestamp: new Date(2024, 2, 14, 16, 45),
      recipient: "finance",
      actions: ["send_reminder", "view_invoice"]
    },
    {
      id: "4",
      title: "Low Inventory Alert",
      message: "Contact Lens Solution stock is running low (5 units left)",
      type: "inventory",
      priority: "medium",
      status: "unread",
      timestamp: new Date(2024, 2, 14, 11, 20),
      recipient: "staff",
      actions: ["reorder", "view_inventory"]
    },
    {
      id: "5",
      title: "Prescription Ready",
      message: "Prescription for Mike Wilson is ready for pickup",
      type: "prescription",
      priority: "low",
      status: "read",
      timestamp: new Date(2024, 2, 13, 15, 10),
      recipient: "pharmacy",
      actions: ["notify_patient", "mark_collected"]
    },
    {
      id: "6",
      title: "Staff Attendance Alert",
      message: "Dr. Emma Davis hasn't clocked in yet (15 mins late)",
      type: "attendance",
      priority: "medium",
      status: "unread",
      timestamp: new Date(2024, 2, 15, 9, 15),
      recipient: "hr",
      actions: ["call_staff", "mark_excused"]
    }
  ];

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    appointments: {
      enabled: true,
      reminder: 30, // minutes before
      methods: ["email", "sms", "push"]
    },
    birthdays: {
      enabled: true,
      reminder: "morning", // time of day
      methods: ["email", "push"]
    },
    payments: {
      enabled: true,
      reminder: [1, 3, 7], // days overdue
      methods: ["email", "sms"]
    },
    inventory: {
      enabled: true,
      threshold: 10, // units
      methods: ["email", "push"]
    },
    prescriptions: {
      enabled: true,
      methods: ["sms", "push"]
    },
    attendance: {
      enabled: true,
      lateThreshold: 15, // minutes
      methods: ["email", "push"]
    },
    payroll: {
      enabled: true,
      methods: ["email"]
    },
    leave: {
      enabled: true,
      methods: ["email", "push"]
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Notification Updated",
        description: "Notification marked as read",
      });
    },
  });

  const dismissNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Notification Dismissed",
        description: "Notification has been dismissed",
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'birthday':
        return <Gift className="h-5 w-5 text-pink-600" />;
      case 'payment':
        return <CreditCard className="h-5 w-5 text-red-600" />;
      case 'inventory':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'prescription':
        return <Stethoscope className="h-5 w-5 text-green-600" />;
      case 'attendance':
        return <Clock className="h-5 w-5 text-purple-600" />;
      case 'payroll':
        return <FileText className="h-5 w-5 text-indigo-600" />;
      case 'leave':
        return <User className="h-5 w-5 text-teal-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getTimeDisplay = (timestamp: Date) => {
    if (isToday(timestamp)) {
      return `Today ${format(timestamp, 'h:mm a')}`;
    } else if (isYesterday(timestamp)) {
      return `Yesterday ${format(timestamp, 'h:mm a')}`;
    } else {
      return format(timestamp, 'MMM d, h:mm a');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "all" || notification.priority === priorityFilter;
    const matchesType = typeFilter === "all" || notification.type === typeFilter;
    return matchesSearch && matchesPriority && matchesType;
  });

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications Center</h1>
          <p className="text-slate-600">Automatic notifications for all business events</p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Notification Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {Object.entries(notificationSettings).map(([key, settings]) => (
                  <Card key={key}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getNotificationIcon(key)}
                          <div>
                            <CardTitle className="text-base capitalize">{key} Notifications</CardTitle>
                          </div>
                        </div>
                        <Switch
                          checked={settings.enabled}
                          onCheckedChange={(enabled) => {
                            setNotificationSettings(prev => ({
                              ...prev,
                              [key]: { ...prev[key as keyof typeof prev], enabled }
                            }));
                          }}
                        />
                      </div>
                    </CardHeader>
                    {settings.enabled && (
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-600">Notification Methods</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {['email', 'sms', 'push'].map((method) => (
                              <div key={method} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${key}-${method}`}
                                  checked={settings.methods.includes(method)}
                                  onCheckedChange={(checked) => {
                                    const newMethods = checked 
                                      ? [...settings.methods, method]
                                      : settings.methods.filter(m => m !== method);
                                    setNotificationSettings(prev => ({
                                      ...prev,
                                      [key]: { ...prev[key as keyof typeof prev], methods: newMethods }
                                    }));
                                  }}
                                />
                                <Label htmlFor={`${key}-${method}`} className="text-sm capitalize">
                                  {method === 'push' ? 'In-App' : method}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Specific settings based on notification type */}
                        {key === 'appointments' && (
                          <div>
                            <Label>Reminder Time (minutes before)</Label>
                            <Input
                              type="number"
                              value={settings.reminder}
                              onChange={(e) => {
                                setNotificationSettings(prev => ({
                                  ...prev,
                                  [key]: { ...prev[key as keyof typeof prev], reminder: parseInt(e.target.value) }
                                }));
                              }}
                              className="w-24"
                            />
                          </div>
                        )}
                        
                        {key === 'inventory' && (
                          <div>
                            <Label>Low Stock Threshold</Label>
                            <Input
                              type="number"
                              value={settings.threshold}
                              onChange={(e) => {
                                setNotificationSettings(prev => ({
                                  ...prev,
                                  [key]: { ...prev[key as keyof typeof prev], threshold: parseInt(e.target.value) }
                                }));
                              }}
                              className="w-24"
                            />
                          </div>
                        )}
                        
                        {key === 'attendance' && (
                          <div>
                            <Label>Late Threshold (minutes)</Label>
                            <Input
                              type="number"
                              value={settings.lateThreshold}
                              onChange={(e) => {
                                setNotificationSettings(prev => ({
                                  ...prev,
                                  [key]: { ...prev[key as keyof typeof prev], lateThreshold: parseInt(e.target.value) }
                                }));
                              }}
                              className="w-24"
                            />
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
                
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    toast({
                      title: "Settings Saved",
                      description: "Notification settings have been updated",
                    });
                    setSettingsOpen(false);
                  }}>
                    Save Settings
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button>
            <BellRing className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Unread Notifications</p>
                <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
              </div>
              <Bell className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Today's Notifications</p>
                <p className="text-2xl font-bold text-blue-600">
                  {notifications.filter(n => isToday(n.timestamp)).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">
                  {notifications.filter(n => n.priority === 'high').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Auto-sent Today</p>
                <p className="text-2xl font-bold text-green-600">18</p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-3">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="appointment">Appointments</SelectItem>
                  <SelectItem value="birthday">Birthdays</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="prescription">Prescriptions</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start justify-between p-4 border rounded-lg transition-colors ${
                  notification.status === 'unread' 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-medium ${
                        notification.status === 'unread' ? 'text-slate-900' : 'text-slate-700'
                      }`}>
                        {notification.title}
                      </h4>
                      {getPriorityBadge(notification.priority)}
                      {notification.status === 'unread' && (
                        <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{notification.message}</p>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-slate-500">
                        {getTimeDisplay(notification.timestamp)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {notification.recipient}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {notification.status === 'unread' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsReadMutation.mutate(notification.id)}
                      disabled={markAsReadMutation.isPending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissNotificationMutation.mutate(notification.id)}
                    disabled={dismissNotificationMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No notifications found</h3>
                <p className="text-slate-600">
                  {searchTerm ? "Try adjusting your search criteria." : "You're all caught up!"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}