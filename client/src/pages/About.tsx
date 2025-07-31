import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Users, 
  Award, 
  Target, 
  Heart, 
  Shield, 
  Globe, 
  Zap,
  CheckCircle,
  Star,
  ArrowRight,
  Linkedin,
  Twitter
} from "lucide-react";
import { Link } from "wouter";

const team = [
  {
    name: "Dr. Sarah Mitchell",
    role: "Chief Executive Officer",
    bio: "20+ years in healthcare technology and medical practice management",
    image: "/api/placeholder/300/300",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "Dr. Michael Chen",
    role: "Chief Medical Officer",
    bio: "Board-certified physician with expertise in healthcare operations",
    image: "/api/placeholder/300/300",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "Emily Rodriguez",
    role: "Chief Technology Officer",
    bio: "Former healthcare IT executive with 15+ years in system development",
    image: "/api/placeholder/300/300",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "David Kim",
    role: "VP of Product Development",
    bio: "Product strategist focused on user experience in healthcare technology",
    image: "/api/placeholder/300/300",
    linkedin: "#",
    twitter: "#"
  }
];

const values = [
  {
    icon: Heart,
    title: "Patient-Centered Care",
    description: "We believe every decision should prioritize patient welfare and improve healthcare outcomes."
  },
  {
    icon: Shield,
    title: "Security & Privacy",
    description: "HIPAA compliance and data security are fundamental to everything we build and maintain."
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "We continuously evolve our platform with cutting-edge technology and user feedback."
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Healthcare is a team effort. Our platform enhances collaboration between all stakeholders."
  }
];

const milestones = [
  {
    year: "2019",
    title: "Company Founded",
    description: "OptiCare was established with a vision to revolutionize medical practice management."
  },
  {
    year: "2020",
    title: "First 100 Practices",
    description: "Reached our first milestone of 100 medical practices using our platform."
  },
  {
    year: "2021",
    title: "HIPAA Certification",
    description: "Achieved full HIPAA compliance certification and enhanced security features."
  },
  {
    year: "2022",
    title: "1000+ Healthcare Providers",
    description: "Expanded to serve over 1000 healthcare providers across multiple specialties."
  },
  {
    year: "2023",
    title: "AI Integration",
    description: "Introduced AI-powered analytics and automated workflow optimization."
  },
  {
    year: "2024",
    title: "5000+ Providers",
    description: "Reached 5000+ healthcare providers with 99.9% uptime and 24/7 support."
  }
];

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="bg-white bg-opacity-20 text-white mb-6">About OptiCare</Badge>
            <h1 className="text-5xl font-bold mb-6">
              Transforming Healthcare Through Technology
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              We're on a mission to empower healthcare providers with comprehensive, 
              secure, and intuitive practice management solutions that improve patient 
              care and operational efficiency.
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Our Story
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Meet Our Team
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">5000+</div>
              <div className="text-slate-600">Healthcare Providers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">500K+</div>
              <div className="text-slate-600">Patients Managed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-slate-600">Uptime Guarantee</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-slate-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="bg-blue-100 text-blue-800 mb-6">Our Mission</Badge>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                Empowering Healthcare Excellence
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Our mission is to provide healthcare professionals with the most comprehensive, 
                secure, and user-friendly practice management platform available. We believe 
                that when healthcare providers have the right tools, they can focus on what 
                matters most: delivering exceptional patient care.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Streamlined Operations</h4>
                    <p className="text-slate-600">Automate routine tasks and focus on patient care</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Enhanced Security</h4>
                    <p className="text-slate-600">HIPAA-compliant platform with advanced security features</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Better Patient Outcomes</h4>
                    <p className="text-slate-600">Improve care quality through better data and workflows</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/api/placeholder/600/400" 
                alt="Healthcare professionals using OptiCare"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">4.9/5</div>
                    <div className="text-sm text-slate-600">Customer Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-800 mb-4">Our Values</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              What Drives Us Forward
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our core values guide every decision we make and every feature we build. 
              They're not just words on a wall – they're the foundation of who we are.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="border-slate-200 text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">{value.title}</h3>
                    <p className="text-slate-600">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-800 mb-4">Our Journey</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Milestones & Achievements
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From a small startup to a trusted platform serving thousands of healthcare 
              providers, here's how we've grown and evolved over the years.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>
              
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="relative flex items-start space-x-8">
                    <div className="flex-shrink-0 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold relative z-10">
                      {milestone.year.slice(-2)}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-slate-900">{milestone.title}</h3>
                          <Badge variant="outline">{milestone.year}</Badge>
                        </div>
                        <p className="text-slate-600">{milestone.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-indigo-100 text-indigo-800 mb-4">Leadership Team</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Meet the People Behind OptiCare
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our diverse team of healthcare professionals, technologists, and industry 
              experts are united by a shared passion for improving healthcare delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-slate-200 hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                  <p className="text-slate-600 text-sm mb-6">{member.bio}</p>
                  <div className="flex justify-center space-x-3">
                    <a href={member.linkedin} className="text-slate-400 hover:text-blue-600">
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a href={member.twitter} className="text-slate-400 hover:text-blue-600">
                      <Twitter className="h-5 w-5" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl font-bold mb-6">
              Join the OptiCare Community
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Ready to transform your medical practice? Join thousands of healthcare 
              providers who trust OptiCare for their practice management needs.
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