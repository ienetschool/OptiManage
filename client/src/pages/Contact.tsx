import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Calendar,
  Globe,
  Headphones,
  FileText,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
  Send
} from "lucide-react";

const contactMethods = [
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our support team",
    contact: "(555) 123-4567",
    availability: "Mon-Fri, 8AM-8PM EST",
    color: "blue"
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Get detailed help via email",
    contact: "support@opticare.com",
    availability: "24/7 Response",
    color: "green"
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Instant chat with our team",
    contact: "Chat Now",
    availability: "Mon-Fri, 9AM-6PM EST",
    color: "purple"
  },
  {
    icon: Calendar,
    title: "Schedule Demo",
    description: "Book a personalized demo",
    contact: "Book Demo",
    availability: "Flexible Scheduling",
    color: "orange"
  }
];

const offices = [
  {
    city: "New York",
    address: "123 Medical Plaza, Suite 500",
    zipCode: "New York, NY 10001",
    phone: "(555) 123-4567",
    email: "ny@opticare.com"
  },
  {
    city: "San Francisco",
    address: "456 Health Avenue, Floor 10",
    zipCode: "San Francisco, CA 94102",
    email: "sf@opticare.com"
  },
  {
    city: "Chicago",
    address: "789 Wellness Street, Suite 300",
    zipCode: "Chicago, IL 60601",
    phone: "(555) 789-0123",
    email: "chicago@opticare.com"
  }
];

const faqs = [
  {
    question: "How quickly can I get started with OptiCare?",
    answer: "Most practices are up and running within 24-48 hours. Our onboarding team will help you migrate your data and train your staff."
  },
  {
    question: "Is my patient data secure and HIPAA compliant?",
    answer: "Yes, OptiCare is fully HIPAA compliant with end-to-end encryption, secure data centers, and comprehensive audit trails."
  },
  {
    question: "Can OptiCare integrate with my existing systems?",
    answer: "OptiCare integrates with most popular EHR systems, lab systems, and pharmacy networks. Our team will help set up integrations."
  },
  {
    question: "What kind of support do you provide?",
    answer: "We offer 24/7 phone support, live chat, email support, video training sessions, and dedicated account managers for enterprise clients."
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes, we offer a 30-day free trial with full access to all features. No credit card required to get started."
  }
];

export default function Contact() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', new FormData(e.target as HTMLFormElement));
    setFormSubmitted(true);
    // Show success message or redirect
    setTimeout(() => {
      alert('Thank you for your message! We will get back to you within 24 hours.');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="bg-white bg-opacity-20 text-white mb-6">Get in Touch</Badge>
            <h1 className="text-5xl font-bold mb-6">
              We're Here to Help
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Have questions about OptiCare? Need help getting started? Our team of healthcare 
              technology experts is ready to assist you every step of the way.
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Multiple Ways to Reach Us</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Choose the contact method that works best for you. Our team is standing by 
              to provide the support you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600 border-blue-200',
                green: 'bg-green-100 text-green-600 border-green-200',
                purple: 'bg-purple-100 text-purple-600 border-purple-200',
                orange: 'bg-orange-100 text-orange-600 border-orange-200'
              };
              
              return (
                <Card key={index} className="border-slate-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 ${colorClasses[method.color as keyof typeof colorClasses]} rounded-xl flex items-center justify-center mx-auto mb-6`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">{method.title}</h3>
                    <p className="text-slate-600 mb-4">{method.description}</p>
                    <div className="font-semibold text-slate-900 mb-2">{method.contact}</div>
                    <div className="text-sm text-slate-500">{method.availability}</div>
                    <Button className="mt-4 w-full" variant="outline">
                      Connect Now
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Office Info */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-8">Send Us a Message</h2>
                
                {formSubmitted ? (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-8 text-center">
                      <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-green-900 mb-2">Message Sent Successfully!</h3>
                      <p className="text-green-700">
                        Thank you for contacting us. We'll get back to you within 24 hours.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-slate-200">
                    <CardContent className="p-8">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input id="firstName" required />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input id="lastName" required />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="email">Email Address *</Label>
                            <Input id="email" type="email" required />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="practice">Practice/Clinic Name</Label>
                            <Input id="practice" />
                          </div>
                          <div>
                            <Label htmlFor="specialty">Medical Specialty</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select specialty" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="family">Family Medicine</SelectItem>
                                <SelectItem value="internal">Internal Medicine</SelectItem>
                                <SelectItem value="pediatrics">Pediatrics</SelectItem>
                                <SelectItem value="cardiology">Cardiology</SelectItem>
                                <SelectItem value="dermatology">Dermatology</SelectItem>
                                <SelectItem value="orthopedics">Orthopedics</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="inquiry">Type of Inquiry</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select inquiry type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="demo">Schedule Demo</SelectItem>
                              <SelectItem value="pricing">Pricing Information</SelectItem>
                              <SelectItem value="features">Product Features</SelectItem>
                              <SelectItem value="integration">System Integration</SelectItem>
                              <SelectItem value="support">Technical Support</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="message">Message *</Label>
                          <Textarea 
                            id="message" 
                            rows={6} 
                            placeholder="Tell us about your practice and how we can help..."
                            required 
                          />
                        </div>

                        <div className="flex items-start space-x-2">
                          <input type="checkbox" id="consent" className="mt-1" required />
                          <label htmlFor="consent" className="text-sm text-slate-600">
                            I agree to receive communications from OptiCare and understand that I can unsubscribe at any time. *
                          </label>
                        </div>

                        <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                          <Send className="mr-2 h-5 w-5" />
                          Send Message
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Office Information */}
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-8">Our Offices</h2>
                
                <div className="space-y-6 mb-12">
                  {offices.map((office, index) => (
                    <Card key={index} className="border-slate-200">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-slate-900 mb-4">{office.city}</h3>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <MapPin className="h-5 w-5 text-slate-400 mt-1" />
                            <div>
                              <p className="text-slate-600">{office.address}</p>
                              <p className="text-slate-600">{office.zipCode}</p>
                            </div>
                          </div>
                          {office.phone && (
                            <div className="flex items-center space-x-3">
                              <Phone className="h-5 w-5 text-slate-400" />
                              <p className="text-slate-600">{office.phone}</p>
                            </div>
                          )}
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-slate-400" />
                            <p className="text-slate-600">{office.email}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Business Hours */}
                <Card className="border-slate-200">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
                      <Clock className="mr-2 h-5 w-5" />
                      Business Hours
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Monday - Friday</span>
                        <span className="text-slate-900 font-medium">8:00 AM - 8:00 PM EST</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Saturday</span>
                        <span className="text-slate-900 font-medium">9:00 AM - 5:00 PM EST</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Sunday</span>
                        <span className="text-slate-900 font-medium">Closed</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <Headphones className="inline h-4 w-4 mr-1" />
                        Emergency support available 24/7 for critical issues
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
              <p className="text-xl text-slate-600">
                Quick answers to common questions about OptiCare and our services.
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-slate-200">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">{faq.question}</h3>
                    <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-slate-600 mb-6">Can't find what you're looking for?</p>
              <Button variant="outline" size="lg">
                <FileText className="mr-2 h-5 w-5" />
                View All FAQs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Practice?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Don't wait to improve your practice management. Start your free trial today 
              and see the difference OptiCare can make.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}