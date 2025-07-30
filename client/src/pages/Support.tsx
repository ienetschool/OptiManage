import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle, 
  MessageSquare, 
  Book, 
  Phone, 
  Mail, 
  Search, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  FileText,
  Video,
  Headphones,
  Bug,
  Lightbulb,
  Settings
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { z } from "zod";

const ticketSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  category: z.enum(["bug", "feature", "support", "billing"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type TicketFormData = z.infer<typeof ticketSchema>;

export default function Support() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: "",
      category: "support",
      priority: "medium",
      description: "",
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketFormData) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Support ticket created successfully.",
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create support ticket.",
        variant: "destructive",
      });
    },
  });

  // Mock support tickets
  const supportTickets = [
    {
      id: "TICK-001",
      subject: "Unable to sync inventory between stores",
      category: "bug",
      priority: "high",
      status: "open",
      description: "Inventory updates in Store A are not reflecting in Store B...",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "TICK-002",
      subject: "Feature request: Dark mode",
      category: "feature",
      priority: "low",
      status: "in-progress",
      description: "Would love to have a dark mode option for the dashboard...",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "TICK-003",
      subject: "Questions about billing cycle",
      category: "billing",
      priority: "medium",
      status: "resolved",
      description: "Need clarification on monthly subscription charges...",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    }
  ];

  // FAQ Data
  const faqData = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I set up my first store?",
          answer: "Navigate to the Stores page and click 'Add Store'. Fill in the required information including store name, address, and contact details. Once created, you can assign staff and configure inventory."
        },
        {
          question: "How do I add products to inventory?",
          answer: "Go to the Inventory page and click 'Add Product'. You'll need to specify product details, category, supplier, and initial stock levels. Products can be assigned to specific stores or shared across all locations."
        },
        {
          question: "How do I manage user permissions?",
          answer: "User permissions are role-based. Admins can create users in Settings > User Management. Available roles are Admin (full access), Manager (store-specific management), and Staff (basic operations)."
        }
      ]
    },
    {
      category: "Inventory Management",
      questions: [
        {
          question: "How do I set up low stock alerts?",
          answer: "In Settings > Notifications, enable inventory alerts and set your low stock threshold. You'll receive notifications when products fall below this level."
        },
        {
          question: "Can I transfer inventory between stores?",
          answer: "Yes, use the inventory transfer feature in the Inventory page. Select the product, source store, destination store, and quantity to transfer."
        },
        {
          question: "How do I track product suppliers?",
          answer: "Each product can be assigned to a supplier in the product details. Use the supplier management feature to maintain contact information and order history."
        }
      ]
    },
    {
      category: "Sales & Appointments",
      questions: [
        {
          question: "How do I process a sale?",
          answer: "Use the Quick Sale feature from the dashboard or navigate to Sales. Select products, customer (optional), payment method, and complete the transaction."
        },
        {
          question: "How do I schedule appointments?",
          answer: "Go to Appointments and click 'Book Appointment'. Select the customer, service type, date/time, and assign to a staff member and store location."
        },
        {
          question: "Can I send appointment reminders?",
          answer: "Yes, automatic appointment reminders can be enabled in Settings > Notifications. Customers will receive email or SMS reminders based on your configuration."
        }
      ]
    }
  ];

  const onSubmit = (data: TicketFormData) => {
    createTicketMutation.mutate(data);
  };

  return (
    <>
      <Header 
        title="Support & Help" 
        subtitle="Get help, documentation, and technical support for the system." 
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Frequently Asked Questions</h3>
                <p className="text-sm text-slate-600">Find answers to common questions</p>
              </div>
              
              <div className="relative max-w-md">
                <Input
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-6">
              {faqData.map((category) => (
                <Card key={category.category} className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, index) => (
                        <AccordionItem key={index} value={`${category.category}-${index}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-slate-600">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Support Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Support Tickets</h3>
                <p className="text-sm text-slate-600">View and manage your support requests</p>
              </div>
              
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Support Ticket</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="Brief description of the issue" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="bug">Bug Report</SelectItem>
                                  <SelectItem value="feature">Feature Request</SelectItem>
                                  <SelectItem value="support">General Support</SelectItem>
                                  <SelectItem value="billing">Billing Question</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Provide detailed information about your issue..."
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
                          disabled={createTicketMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {createTicketMutation.isPending ? "Creating..." : "Create Ticket"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Tickets List */}
            <div className="space-y-4">
              {supportTickets.map((ticket) => (
                <Card key={ticket.id} className="border-slate-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {ticket.category === 'bug' && <Bug className="h-5 w-5 text-blue-600" />}
                          {ticket.category === 'feature' && <Lightbulb className="h-5 w-5 text-blue-600" />}
                          {ticket.category === 'support' && <HelpCircle className="h-5 w-5 text-blue-600" />}
                          {ticket.category === 'billing' && <Settings className="h-5 w-5 text-blue-600" />}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {ticket.subject}
                            </h3>
                            <Badge className={
                              ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                              ticket.status === 'in-progress' ? 'bg-amber-100 text-amber-800' :
                              ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {ticket.status.replace('-', ' ')}
                            </Badge>
                            <Badge className={
                              ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }>
                              {ticket.priority}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-slate-600 mb-3">
                            {ticket.description}
                          </p>
                          
                          <div className="flex items-center text-xs text-slate-500 space-x-4">
                            <span>#{ticket.id}</span>
                            <span>•</span>
                            <span>Created: {format(ticket.createdAt, 'MMM dd, yyyy')}</span>
                            <span>•</span>
                            <span>Updated: {format(ticket.updatedAt, 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="documentation" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Documentation</h3>
              <p className="text-sm text-slate-600 mb-6">Comprehensive guides and documentation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-slate-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Book className="text-blue-600 h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">User Guide</h3>
                  <p className="text-sm text-slate-600 mb-4">Complete guide to using OptiStore Pro</p>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Guide
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Settings className="text-emerald-600 h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Admin Manual</h3>
                  <p className="text-sm text-slate-600 mb-4">Advanced configuration and management</p>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Manual
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Video className="text-purple-600 h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Video Tutorials</h3>
                  <p className="text-sm text-slate-600 mb-4">Step-by-step video guides</p>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Watch Videos
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-amber-600 h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">API Documentation</h3>
                  <p className="text-sm text-slate-600 mb-4">Integration and API reference</p>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    API Docs
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="text-red-600 h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Troubleshooting</h3>
                  <p className="text-sm text-slate-600 mb-4">Common issues and solutions</p>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Guide
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="text-indigo-600 h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Best Practices</h3>
                  <p className="text-sm text-slate-600 mb-4">Tips for optimal system usage</p>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contact Support Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Contact Support</h3>
              <p className="text-sm text-slate-600 mb-6">Get in touch with our support team</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="mr-2 h-5 w-5" />
                    Phone Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">
                    Speak directly with our support team for immediate assistance.
                  </p>
                  <div className="space-y-2">
                    <p className="font-semibold">1-800-OPTI-PRO</p>
                    <p className="text-sm text-slate-600">
                      Monday - Friday: 8:00 AM - 6:00 PM EST<br />
                      Saturday: 9:00 AM - 2:00 PM EST
                    </p>
                  </div>
                  <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="mr-2 h-5 w-5" />
                    Email Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">
                    Send us an email and we'll respond within 24 hours.
                  </p>
                  <div className="space-y-2">
                    <p className="font-semibold">support@optipro.com</p>
                    <p className="text-sm text-slate-600">
                      Response time: Within 24 hours<br />
                      Priority tickets: Within 4 hours
                    </p>
                  </div>
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Live Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">
                    Chat with our support team in real-time during business hours.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">
                      Available: Monday - Friday, 9:00 AM - 5:00 PM EST
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm text-emerald-600 font-medium">Online now</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Start Chat
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Headphones className="mr-2 h-5 w-5" />
                    Remote Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">
                    Allow our team to remotely access your system for troubleshooting.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">
                      Secure screen sharing available<br />
                      By appointment only
                    </p>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Headphones className="mr-2 h-4 w-4" />
                    Schedule Session
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
