import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell,
  Eye,
  Check,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  Package,
  ShoppingCart,
  Settings,
  Mail,
  Archive,
  Trash2
} from "lucide-react";
// Removed NotificationHR import as we'll use API response directly
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["/api/notifications"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest("PUT", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Success",
        description: "Notification marked as read.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    },
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate to relevant page based on notification type
    const navigationMap: { [key: string]: string } = {
      'hr': '/staff',
      'appointment': '/appointments',
      'inventory': '/inventory',
      'sales': '/sales',
      'system': '/settings',
      'billing': '/invoices',
      'communication': '/communication'
    };
    
    const targetPath = navigationMap[notification.type] || '/dashboard';
    window.location.href = targetPath;
    
    toast({
      title: "Navigating",
      description: `Opening ${notification.type} management...`,
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'hr': return <User className="h-5 w-5 text-blue-600" />;
      case 'appointment': return <Calendar className="h-5 w-5 text-green-600" />;
      case 'inventory': return <Package className="h-5 w-5 text-orange-600" />;
      case 'sales': return <ShoppingCart className="h-5 w-5 text-purple-600" />;
      case 'system': return <Settings className="h-5 w-5 text-gray-600" />;
      default: return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-4 w-4" />;
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'normal': return <Info className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 'unread': return !notification.isRead;
      case 'read': return notification.isRead;
      case 'hr': return notification.type === 'hr';
      case 'system': return notification.type === 'system';
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const todayCount = notifications.filter(n => {
    if (!n.sentAt) return false;
    const notificationDate = new Date(n.sentAt);
    const today = new Date();
    return notificationDate.toDateString() === today.toDateString();
  }).length;

  return (
    <>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Notifications</p>
                    <p className="text-2xl font-bold text-slate-900">{notifications.length}</p>
                    <p className="text-xs text-slate-500">All time</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Bell className="text-blue-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Unread</p>
                    <p className="text-2xl font-bold text-slate-900">{unreadCount}</p>
                    <p className="text-xs text-amber-600 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Needs attention
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Mail className="text-amber-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Today</p>
                    <p className="text-2xl font-bold text-slate-900">{todayCount}</p>
                    <p className="text-xs text-slate-500">New notifications</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Clock className="text-green-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">HR Notifications</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {notifications.filter(n => n.type === 'hr').length}
                    </p>
                    <p className="text-xs text-slate-500">Employee related</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <User className="text-purple-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900">Recent Notifications</h3>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
                  unreadIds.forEach(id => markAsReadMutation.mutate(id));
                  toast({
                    title: "Success",
                    description: `Marked ${unreadIds.length} notifications as read`,
                  });
                }}
                disabled={markAsReadMutation.isPending || unreadCount === 0}
              >
                <Check className="mr-2 h-4 w-4" />
                Mark All Read
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  toast({
                    title: "Archive All",
                    description: "Archiving all notifications...",
                  });
                }}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive All
              </Button>
            </div>
          </div>

          {/* Notifications */}
          <Card className="border-slate-200">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b px-6 py-4">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">
                      Unread {unreadCount > 0 && <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="read">Read</TabsTrigger>
                    <TabsTrigger value="hr">HR</TabsTrigger>
                    <TabsTrigger value="system">System</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value={activeTab} className="m-0">
                  {isLoading ? (
                    <div className="p-6 space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse flex space-x-4">
                          <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No notifications</h3>
                      <p className="text-slate-600">
                        {activeTab === 'unread' 
                          ? "You're all caught up! No unread notifications." 
                          : "No notifications found for this category."
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200 max-h-[calc(100vh-600px)] overflow-y-auto">
                      {filteredNotifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-6 hover:bg-slate-50 transition-colors cursor-pointer ${
                            !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                !notification.isRead ? 'bg-blue-100' : 'bg-slate-100'
                              }`}>
                                {getNotificationIcon(notification.type)}
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className={`text-sm font-medium ${
                                    !notification.isRead ? 'text-slate-900' : 'text-slate-700'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  <p className="text-sm text-slate-600 mt-1">
                                    {notification.message}
                                  </p>
                                  
                                  <div className="flex items-center space-x-4 mt-3">
                                    <div className="flex items-center space-x-2">
                                      <Badge className={getPriorityBadgeColor(notification.priority || 'medium')}>
                                        {getPriorityIcon(notification.priority || 'medium')}
                                        <span className="ml-1 capitalize">{notification.priority || 'medium'}</span>
                                      </Badge>
                                      
                                      <Badge variant="outline" className="capitalize">
                                        {notification.type}
                                      </Badge>
                                    </div>
                                    
                                    <div className="flex items-center space-x-1 text-xs text-slate-500">
                                      <Clock className="h-3 w-3" />
                                      <span>{notification.sentAt ? formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true }) : 'Unknown time'}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2 ml-4">
                                  {!notification.isRead && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleMarkAsRead(notification.id)}
                                      disabled={markAsReadMutation.isPending}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  )}
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toast({
                                        title: "View Details",
                                        description: `Opening details for ${notification.title}`,
                                      });
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Mock delete functionality
                                      toast({
                                        title: "Deleted",
                                        description: `${notification.title} has been deleted`,
                                        variant: "destructive",
                                      });
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              {notification.relatedType && notification.relatedId && (
                                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                                  <p className="text-xs text-slate-600">
                                    Related to: <span className="font-medium capitalize">{notification.relatedType}</span>
                                  </p>
                                  <p className="text-xs text-slate-500 font-mono">
                                    ID: {notification.relatedId}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}