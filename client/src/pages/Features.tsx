import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Stethoscope,
  Users,
  Calendar,
  FileText,
  DollarSign,
  Shield,
  Activity,
  Heart,
  Clock,
  Bell,
  BarChart3,
  Pill,
  UserCheck,
  Package,
  MessageCircle,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Zap,
  Globe,
  Lock,
  Smartphone,
  Cloud,
  RefreshCw
} from "lucide-react";

const coreFeatures = [
  {
    icon: Users,
    title: "Patient Management",
    description: "Comprehensive patient profiles with medical history, contact information, insurance details, and treatment tracking.",
    benefits: ["Complete patient records", "Medical history tracking", "Insurance management", "Family connections"]
  },
  {
    icon: Calendar,
    title: "Appointment Scheduling",
    description: "Advanced scheduling system with automated reminders, multi-provider support, and conflict resolution.",
    benefits: ["Real-time availability", "Automated reminders", "Multi-provider booking", "Waitlist management"]
  },
  {
    icon: Pill,
    title: "Prescription Management",
    description: "Digital prescription management with dosage tracking, refill notifications, and drug interaction alerts.",
    benefits: ["Electronic prescriptions", "Drug interaction alerts", "Refill tracking", "Pharmacy integration"]
  },
  {
    icon: DollarSign,
    title: "Medical Billing",
    description: "Integrated billing system with insurance processing, payment tracking, and automated invoicing.",
    benefits: ["Insurance claim processing", "Payment tracking", "Automated invoicing", "Financial reporting"]
  },
  {
    icon: UserCheck,
    title: "Staff Management",
    description: "Complete HR suite with employee profiles, role management, and performance tracking.",
    benefits: ["Employee profiles", "Role-based access", "Performance tracking", "Shift scheduling"]
  },
  {
    icon: Clock,
    title: "Attendance Tracking",
    description: "Digital attendance system with QR code check-ins, overtime calculation, and leave management.",
    benefits: ["QR code check-ins", "Overtime calculation", "Leave tracking", "Timesheet reports"]
  }
];

const advancedFeatures = [
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Comprehensive reporting and analytics for better decision making and practice optimization.",
    benefits: ["Revenue analytics", "Patient flow reports", "Staff performance", "Operational insights"]
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Intelligent notification system for appointments, payments, inventory, and critical alerts.",
    benefits: ["Appointment reminders", "Payment alerts", "Inventory notifications", "Emergency alerts"]
  },
  {
    icon: MessageCircle,
    title: "Communication Hub",
    description: "Integrated communication platform for staff coordination and patient engagement.",
    benefits: ["Team messaging", "Patient communication", "Announcement system", "File sharing"]
  },
  {
    icon: Package,
    title: "Inventory Management",
    description: "Track medical supplies, equipment, and pharmaceuticals with automated reorder alerts.",
    benefits: ["Supply tracking", "Automated reorders", "Expiration alerts", "Cost management"]
  },
  {
    icon: Shield,
    title: "HIPAA Compliance",
    description: "Built-in HIPAA compliance with advanced security features and audit trails.",
    benefits: ["Data encryption", "Audit trails", "Access controls", "Compliance reporting"]
  },
  {
    icon: Activity,
    title: "Workflow Automation",
    description: "Automate routine tasks and workflows to improve efficiency and reduce errors.",
    benefits: ["Task automation", "Workflow templates", "Process optimization", "Error reduction"]
  }
];

const integrations = [
  {
    name: "Electronic Health Records (EHR)",
    description: "Seamless integration with popular EHR systems",
    logo: "/api/placeholder/60/60"
  },
  {
    name: "Laboratory Systems",
    description: "Direct connection to lab systems for results",
    logo: "/api/placeholder/60/60"
  },
  {
    name: "Pharmacy Networks",
    description: "Integration with major pharmacy chains",
    logo: "/api/placeholder/60/60"
  },
  {
    name: "Insurance Providers",
    description: "Direct billing to insurance companies",
    logo: "/api/placeholder/60/60"
  },
  {
    name: "Payment Processors",
    description: "Secure payment processing integration",
    logo: "/api/placeholder/60/60"
  },
  {
    name: "Telehealth Platforms",
    description: "Video consultation integration",
    logo: "/api/placeholder/60/60"
  }
];

const securityFeatures = [
  {
    icon: Lock,
    title: "Data Encryption",
    description: "End-to-end encryption for all data in transit and at rest"
  },
  {
    icon: Shield,
    title: "Access Controls",
    description: "Role-based access controls with multi-factor authentication"
  },
  {
    icon: Activity,
    title: "Audit Trails",
    description: "Comprehensive logging of all system activities and access"
  },
  {
    icon: Cloud,
    title: "Secure Cloud",
    description: "HIPAA-compliant cloud infrastructure with 99.9% uptime"
  }
];

export default function Features() {
  const [activeTab, setActiveTab] = useState("core");

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="bg-white bg-opacity-20 text-white mb-6">Platform Features</Badge>
            <h1 className="text-5xl font-bold mb-6">
              Everything You Need to Run Your Practice
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              OptiCare provides a comprehensive suite of features designed specifically 
              for modern medical practices, from patient management to financial reporting.
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-4 mb-16">
              <TabsTrigger value="core" className="text-sm">Core Features</TabsTrigger>
              <TabsTrigger value="advanced" className="text-sm">Advanced Tools</TabsTrigger>
              <TabsTrigger value="integrations" className="text-sm">Integrations</TabsTrigger>
              <TabsTrigger value="security" className="text-sm">Security</TabsTrigger>
            </TabsList>

            {/* Core Features */}
            <TabsContent value="core" className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-slate-900 mb-6">Core Features</h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Essential tools that form the foundation of effective medical practice management.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {coreFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={index} className="border-slate-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <CardContent className="p-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                          <Icon className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-4">{feature.title}</h3>
                        <p className="text-slate-600 mb-6">{feature.description}</p>
                        <div className="space-y-2">
                          {feature.benefits.map((benefit, benefitIndex) => (
                            <div key={benefitIndex} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <span className="text-sm text-slate-600">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Advanced Features */}
            <TabsContent value="advanced" className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-slate-900 mb-6">Advanced Tools</h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Powerful advanced features that take your practice management to the next level.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {advancedFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={index} className="border-slate-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <CardContent className="p-8">
                        <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                          <Icon className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-4">{feature.title}</h3>
                        <p className="text-slate-600 mb-6">{feature.description}</p>
                        <div className="space-y-2">
                          {feature.benefits.map((benefit, benefitIndex) => (
                            <div key={benefitIndex} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <span className="text-sm text-slate-600">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Integrations */}
            <TabsContent value="integrations" className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-slate-900 mb-6">Seamless Integrations</h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Connect OptiCare with your existing systems and workflows for a unified experience.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {integrations.map((integration, index) => (
                  <Card key={index} className="border-slate-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-8 text-center">
                      <img 
                        src={integration.logo} 
                        alt={integration.name}
                        className="w-16 h-16 mx-auto mb-6 rounded-lg"
                      />
                      <h3 className="text-xl font-semibold text-slate-900 mb-4">{integration.name}</h3>
                      <p className="text-slate-600">{integration.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <p className="text-slate-600 mb-6">Don't see your preferred system? We're constantly adding new integrations.</p>
                <Button variant="outline">
                  Request Integration
                </Button>
              </div>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security" className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-slate-900 mb-6">Enterprise-Grade Security</h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Your patient data is protected by industry-leading security measures and HIPAA compliance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {securityFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={index} className="border-slate-200 text-center hover:shadow-lg transition-shadow">
                      <CardContent className="p-8">
                        <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                          <Icon className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">{feature.title}</h3>
                        <p className="text-slate-600">{feature.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Compliance Badges */}
              <div className="bg-slate-50 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Compliance & Certifications</h3>
                  <p className="text-slate-600">OptiCare meets the highest standards for healthcare data security and privacy.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div>
                    <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-10 w-10 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900">HIPAA Compliant</h4>
                  </div>
                  <div>
                    <div className="w-20 h-20 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Lock className="h-10 w-10 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900">SOC 2 Certified</h4>
                  </div>
                  <div>
                    <div className="w-20 h-20 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Globe className="h-10 w-10 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900">GDPR Ready</h4>
                  </div>
                  <div>
                    <div className="w-20 h-20 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Activity className="h-10 w-10 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900">ISO 27001</h4>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Feature Highlight */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge className="bg-green-100 text-green-800 mb-6">AI-Powered Insights</Badge>
                <h2 className="text-4xl font-bold text-slate-900 mb-6">
                  Smart Analytics for Better Decisions
                </h2>
                <p className="text-lg text-slate-600 mb-8">
                  Our AI-powered analytics engine provides actionable insights to help you 
                  optimize your practice operations, improve patient outcomes, and increase revenue.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start space-x-3">
                    <Zap className="h-6 w-6 text-yellow-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-slate-900">Predictive Analytics</h4>
                      <p className="text-slate-600">Predict patient no-shows and optimize scheduling</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <BarChart3 className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-slate-900">Revenue Optimization</h4>
                      <p className="text-slate-600">Identify opportunities to increase practice revenue</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Activity className="h-6 w-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-slate-900">Performance Tracking</h4>
                      <p className="text-slate-600">Monitor key performance indicators in real-time</p>
                    </div>
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Learn More About Analytics
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <div className="relative">
                <img 
                  src="/api/placeholder/600/400" 
                  alt="Analytics Dashboard"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Live Data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Experience These Features?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Start your free trial today and discover how OptiCare can transform 
              your medical practice with these powerful features.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
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
    </div>
  );
}