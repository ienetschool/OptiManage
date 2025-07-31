import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Send, 
  Plus, 
  Search, 
  CheckCircle,
  Clock,
  MessageSquare,
  Bell,
  Archive
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { z } from "zod";

const messageSchema = z.object({
  type: z.enum(["email", "sms"]),
  recipients: z.array(z.string()).min(1, "At least one recipient is required"),
  subject: z.string().optional(),
  message: z.string().min(1, "Message is required"),
});

type MessageFormData = z.infer<typeof messageSchema>;

export default function Communication() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
  });

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      type: "email",
      recipients: [],
      subject: "",
      message: "",
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageFormData) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Message sent successfully.",
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    },
  });

  // Mock data for communication features
  const communications = [
    {
      id: "1",
      type: "email",
      subject: "Appointment Reminder",
      message: "Your eye exam appointment is scheduled for tomorrow at 2:00 PM.",
      recipients: ["sarah.johnson@email.com"],
      status: "sent",
      timestamp: new Date(),
      customerName: "Sarah Johnson"
    },
    {
      id: "2",
      type: "sms",
      subject: "",
      message: "Hi! Your prescription glasses are ready for pickup.",
      recipients: ["(555) 987-6543"],
      status: "delivered",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      customerName: "Michael Chen"
    },
    {
      id: "3",
      type: "email",
      subject: "Thank you for your visit",
      message: "Thank you for choosing our optical store. We hope you're happy with your new glasses!",
      recipients: ["emma.wilson@email.com"],
      status: "sent",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      customerName: "Emma Wilson"
    }
  ];

  const templates = [
    {
      id: "1",
      name: "Appointment Reminder",
      type: "email",
      subject: "Appointment Reminder - {{customerName}}",
      content: "Dear {{customerName}}, This is a reminder that you have an appointment scheduled for {{appointmentDate}} at {{appointmentTime}}."
    },
    {
      id: "2",
      name: "Prescription Ready",
      type: "sms",
      subject: "",
      content: "Hi {{customerName}}! Your prescription glasses are ready for pickup at {{storeName}}."
    },
    {
      id: "3",
      name: "Welcome New Customer",
      type: "email",
      subject: "Welcome to {{storeName}}!",
      content: "Dear {{customerName}}, Welcome to our optical family! We're excited to help you with all your vision needs."
    }
  ];

  const onSubmit = (data: MessageFormData) => {
    sendMessageMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-emerald-100 text-emerald-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <main className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="inbox" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inbox">Message History</TabsTrigger>
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Message History Tab */}
          <TabsContent value="inbox" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Communication History</h3>
                <p className="text-sm text-slate-600">Track all sent emails and SMS messages</p>
              </div>
              
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Send New Message</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="sms">SMS</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="recipients"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recipients</FormLabel>
                              <Select onValueChange={(value) => field.onChange([value])}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select customers" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {(customers as any[]).map((customer: any) => (
                                    <SelectItem key={customer.id} value={customer.email || customer.phone}>
                                      {customer.firstName} {customer.lastName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {form.watch("type") === "email" && (
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter email subject" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Type your message here..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={sendMessageMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {sendMessageMutation.isPending ? (
                            <>
                              <Clock className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>

            {/* Message List */}
            <div className="space-y-4">
              {communications.map((comm) => (
                <Card key={comm.id} className="border-slate-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {comm.type === 'email' ? (
                            <Mail className="h-5 w-5 text-blue-600" />
                          ) : (
                            <MessageSquare className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {comm.customerName}
                            </h3>
                            <Badge className={getStatusColor(comm.status)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span className="capitalize">{comm.status}</span>
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {comm.type.toUpperCase()}
                            </Badge>
                          </div>
                          
                          {comm.subject && (
                            <p className="font-medium text-slate-900 mb-2">{comm.subject}</p>
                          )}
                          
                          <p className="text-sm text-slate-600 mb-3">
                            {comm.message}
                          </p>
                          
                          <div className="flex items-center text-xs text-slate-500 space-x-4">
                            <span>To: {comm.recipients.join(", ")}</span>
                            <span>•</span>
                            <span>{format(comm.timestamp, 'MMM dd, yyyy HH:mm')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Message Templates</h3>
                <p className="text-sm text-slate-600">Pre-built templates for common communications</p>
              </div>
              
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="border-slate-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">{template.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {template.type.toUpperCase()}
                      </Badge>
                    </div>
                    
                    {template.subject && (
                      <p className="font-medium text-slate-700 mb-2">
                        Subject: {template.subject}
                      </p>
                    )}
                    
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                      {template.content}
                    </p>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">Messages Sent</p>
                      <p className="text-2xl font-bold text-slate-900">156</p>
                      <p className="text-sm font-medium text-emerald-600 mt-1">
                        +12 this week
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Send className="text-blue-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">Delivery Rate</p>
                      <p className="text-2xl font-bold text-slate-900">94.2%</p>
                      <p className="text-sm font-medium text-emerald-600 mt-1">
                        +2.1% improvement
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="text-emerald-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">Email Opens</p>
                      <p className="text-2xl font-bold text-slate-900">67.8%</p>
                      <p className="text-sm font-medium text-blue-600 mt-1">
                        Above average
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
                      <p className="text-slate-600 text-sm font-medium">Response Rate</p>
                      <p className="text-2xl font-bold text-slate-900">23.4%</p>
                      <p className="text-sm font-medium text-purple-600 mt-1">
                        +5.2% vs last month
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <MessageCircle className="text-purple-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
