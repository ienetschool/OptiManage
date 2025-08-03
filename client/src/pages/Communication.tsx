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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Edit, 
  Trash2,
  Mail,
  MessageCircle,
  Users,
  User,
  Search,
  Filter,
  FileText as Template,
  Calendar,
  Clock,
  Check,
  X,
  Settings,
  Copy,
  FileText,
  Zap,
  Bell
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Communication() {
  const [activeTab, setActiveTab] = useState("messages");
  const [searchTerm, setSearchTerm] = useState("");
  const [messageFilter, setMessageFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [messageTemplate, setMessageTemplate] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [messageSubject, setMessageSubject] = useState("");
  const [messageType, setMessageType] = useState("email");
  const [recipientType, setRecipientType] = useState("individual");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for recipients
  const recipients = [
    { id: "1", name: "John Smith", type: "patient", email: "john.smith@email.com", phone: "+1234567890" },
    { id: "2", name: "Sarah Johnson", type: "staff", email: "sarah.j@clinic.com", phone: "+1234567891" },
    { id: "3", name: "Mike Wilson", type: "customer", email: "mike.w@email.com", phone: "+1234567892" },
    { id: "4", name: "Dr. Emma Davis", type: "staff", email: "emma.davis@clinic.com", phone: "+1234567893" },
    { id: "5", name: "Lisa Brown", type: "patient", email: "lisa.brown@email.com", phone: "+1234567894" },
  ];

  // Mock data for message templates
  const messageTemplates = [
    {
      id: "1",
      name: "Appointment Reminder",
      type: "appointment",
      subject: "Upcoming Appointment Reminder",
      content: "Dear {name}, this is a reminder for your appointment on {date} at {time}. Please arrive 15 minutes early.",
      variables: ["name", "date", "time"]
    },
    {
      id: "2",
      name: "Birthday Wishes",
      type: "birthday",
      subject: "Happy Birthday!",
      content: "Dear {name}, wishing you a very happy birthday! As a special gift, enjoy 10% off your next visit.",
      variables: ["name"]
    },
    {
      id: "3",
      name: "Payment Reminder",
      type: "payment",
      subject: "Payment Due Reminder",
      content: "Dear {name}, this is a friendly reminder that your payment of ${amount} is due on {date}.",
      variables: ["name", "amount", "date"]
    },
    {
      id: "4",
      name: "Prescription Ready",
      type: "prescription",
      subject: "Your Prescription is Ready",
      content: "Dear {name}, your prescription for {medication} is ready for pickup at our pharmacy.",
      variables: ["name", "medication"]
    },
    {
      id: "5",
      name: "Welcome Message",
      type: "welcome",
      subject: "Welcome to Our Clinic",
      content: "Dear {name}, welcome to our clinic! We're excited to provide you with excellent healthcare services.",
      variables: ["name"]
    }
  ];

  // Mock data for sent messages
  const sentMessages = [
    {
      id: "1",
      recipient: "John Smith",
      recipientType: "patient",
      subject: "Appointment Reminder",
      type: "email",
      status: "delivered",
      sentAt: new Date(2024, 2, 15, 10, 30),
      template: "Appointment Reminder"
    },
    {
      id: "2",
      recipient: "Multiple Recipients",
      recipientType: "staff",
      subject: "Monthly Meeting Notice",
      type: "sms",
      status: "sent",
      sentAt: new Date(2024, 2, 14, 15, 45),
      template: "Custom"
    },
    {
      id: "3",
      recipient: "Sarah Johnson",
      recipientType: "staff",
      subject: "Payroll Information",
      type: "email",
      status: "failed",
      sentAt: new Date(2024, 2, 13, 9, 15),
      template: "Custom"
    }
  ];

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return messageData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully",
      });
      setOpen(false);
      setMessageContent("");
      setMessageSubject("");
      setSelectedRecipients([]);
    },
  });

  const handleSendMessage = () => {
    if (!messageSubject || !messageContent || selectedRecipients.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select recipients",
        variant: "destructive"
      });
      return;
    }

    sendMessageMutation.mutate({
      subject: messageSubject,
      content: messageContent,
      recipients: selectedRecipients,
      type: messageType,
      template: messageTemplate
    });
  };

  const applyTemplate = (template: any) => {
    setMessageTemplate(template.name);
    setMessageSubject(template.subject);
    setMessageContent(template.content);
    setTemplateOpen(false);
    toast({
      title: "Template Applied",
      description: `Applied template: ${template.name}`,
    });
  };

  const filteredMessages = sentMessages.filter(message => {
    const matchesSearch = message.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = messageFilter === "all" || message.status === messageFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Delivered</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800"><Send className="h-3 w-3 mr-1" />Sent</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><X className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getRecipientTypeIcon = (type: string) => {
    switch (type) {
      case 'patient':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'staff':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'customer':
        return <MessageCircle className="h-4 w-4 text-purple-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Communication Center</h1>
          <p className="text-slate-600">Send messages to patients, staff, and customers</p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Template className="h-4 w-4 mr-2" />
                Message Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Message Templates</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {messageTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge variant="outline">{template.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-xs font-medium text-slate-600">Subject</Label>
                        <p className="text-sm font-medium">{template.subject}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-slate-600">Content Preview</Label>
                        <p className="text-sm text-slate-600 line-clamp-3">{template.content}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-slate-600">Variables</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.variables.map((variable) => (
                            <Badge key={variable} variant="secondary" className="text-xs">
                              {`{${variable}}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" onClick={() => applyTemplate(template)}>
                          Use Template
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Send New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Send New Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {/* Message Type & Recipients */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Message Type</Label>
                    <Select value={messageType} onValueChange={setMessageType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </div>
                        </SelectItem>
                        <SelectItem value="sms">
                          <div className="flex items-center">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            SMS
                          </div>
                        </SelectItem>
                        <SelectItem value="notification">
                          <div className="flex items-center">
                            <Bell className="h-4 w-4 mr-2" />
                            In-App Notification
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Recipient Type</Label>
                    <Select value={recipientType} onValueChange={setRecipientType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="group">Group (All Patients)</SelectItem>
                        <SelectItem value="staff">All Staff</SelectItem>
                        <SelectItem value="customers">All Customers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Recipients Selection */}
                {recipientType === "individual" && (
                  <div>
                    <Label>Select Recipients</Label>
                    <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                      {recipients.map((recipient) => (
                        <div key={recipient.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded">
                          <Checkbox
                            checked={selectedRecipients.includes(recipient.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedRecipients([...selectedRecipients, recipient.id]);
                              } else {
                                setSelectedRecipients(selectedRecipients.filter(id => id !== recipient.id));
                              }
                            }}
                          />
                          <div className="flex items-center space-x-2">
                            {getRecipientTypeIcon(recipient.type)}
                            <div>
                              <p className="font-medium text-sm">{recipient.name}</p>
                              <p className="text-xs text-slate-500">
                                {messageType === "email" ? recipient.email : recipient.phone} • {recipient.type}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Template Selection */}
                <div>
                  <Label>Use Template (Optional)</Label>
                  <Select value={messageTemplate} onValueChange={(value) => {
                    const template = messageTemplates.find(t => t.name === value);
                    if (template) {
                      applyTemplate(template);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {messageTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.name}>
                          <div className="flex items-center justify-between w-full">
                            <span>{template.name}</span>
                            <Badge variant="outline" className="ml-2">{template.type}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Message Content */}
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    placeholder="Enter message subject..."
                  />
                </div>

                <div>
                  <Label>Message Content</Label>
                  <Textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type your message here..."
                    className="min-h-[150px]"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Use variables like {`{name}, {date}, {time}`} for personalization
                  </p>
                </div>

                {/* Auto-send Options */}
                <div className="border-t pt-4">
                  <Label className="text-base font-medium">Auto-send Options</Label>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="birthday-auto" />
                      <label htmlFor="birthday-auto" className="text-sm">
                        Auto-send birthday wishes
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="appointment-auto" />
                      <label htmlFor="appointment-auto" className="text-sm">
                        Auto-send appointment reminders
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="payment-auto" />
                      <label htmlFor="payment-auto" className="text-sm">
                        Auto-send payment reminders
                      </label>
                    </div>
                  </div>
                </div>

                {/* Send Actions */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendMessage} disabled={sendMessageMutation.isPending}>
                    {sendMessageMutation.isPending ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
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
                <p className="text-sm font-medium text-slate-600">Messages Sent Today</p>
                <p className="text-2xl font-bold text-blue-600">24</p>
              </div>
              <Send className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Delivery Rate</p>
                <p className="text-2xl font-bold text-green-600">98%</p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Templates</p>
                <p className="text-2xl font-bold text-purple-600">{messageTemplates.length}</p>
              </div>
              <Template className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Auto-messages</p>
                <p className="text-2xl font-bold text-orange-600">12</p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message History */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Message History</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={messageFilter} onValueChange={setMessageFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <div key={message.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getRecipientTypeIcon(message.recipientType)}
                    {message.type === "email" ? (
                      <Mail className="h-4 w-4 text-blue-600" />
                    ) : (
                      <MessageCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{message.subject}</h4>
                    <p className="text-sm text-slate-600">
                      To: {message.recipient} • Template: {message.template}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-600">
                      {format(message.sentAt, "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(message.sentAt, "h:mm a")}
                    </p>
                  </div>
                  {getStatusBadge(message.status)}
                  <Button size="sm" variant="ghost">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}