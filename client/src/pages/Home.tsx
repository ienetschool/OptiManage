import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Stethoscope, 
  Users, 
  Calendar, 
  FileText, 
  Shield, 
  Activity, 
  Heart,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  Award,
  Zap,
  Globe,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from "lucide-react";

const heroSlides = [
  {
    id: 1,
    title: "Advanced Medical Practice Management",
    subtitle: "Complete healthcare management solution with HIPAA compliance",
    description: "Streamline your medical practice with our comprehensive platform featuring patient management, appointment scheduling, and integrated billing.",
    image: "/api/placeholder/800/400",
    cta: "Get Started",
    ctaLink: "/api/login"
  },
  {
    id: 2,
    title: "Comprehensive HR & Staff Management",
    subtitle: "Powerful tools for workforce management",
    description: "Manage staff schedules, payroll, attendance tracking, and leave management all in one integrated platform.",
    image: "/api/placeholder/800/400",
    cta: "Learn More",
    ctaLink: "/features"
  },
  {
    id: 3,
    title: "Smart Appointment & Patient Care",
    subtitle: "Optimize patient experience and care quality",
    description: "Advanced appointment booking system with automated reminders, patient records, and prescription management.",
    image: "/api/placeholder/800/400",
    cta: "Book Demo",
    ctaLink: "/contact"
  }
];

const features = [
  {
    icon: Stethoscope,
    title: "Medical Practice Management",
    description: "Complete medical practice management with patient records, prescriptions, and treatment history",
    color: "blue"
  },
  {
    icon: Users,
    title: "Patient Management",
    description: "Comprehensive patient profiles with medical history, appointments, and loyalty tracking",
    color: "green"
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Advanced scheduling system with automated reminders and multi-doctor support",
    color: "purple"
  },
  {
    icon: FileText,
    title: "Digital Prescriptions",
    description: "Electronic prescription management with dosage tracking and refill notifications",
    color: "orange"
  },
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "Secure, HIPAA-compliant system with role-based access and comprehensive audit trails",
    color: "red"
  },
  {
    icon: Activity,
    title: "Real-time Analytics",
    description: "Advanced analytics and reporting for better decision making and practice optimization",
    color: "indigo"
  }
];

const testimonials = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    role: "Chief Medical Officer",
    clinic: "HealthFirst Medical Center",
    content: "OptiCare has revolutionized how we manage our practice. The integrated approach to patient care and staff management has improved our efficiency by 40%.",
    rating: 5,
    avatar: "/api/placeholder/60/60"
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    role: "Practice Owner",
    clinic: "Downtown Family Medicine",
    content: "The HIPAA compliance features and security measures give us complete peace of mind. Our patients trust us more knowing their data is protected.",
    rating: 5,
    avatar: "/api/placeholder/60/60"
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    role: "Pediatric Specialist",
    clinic: "Children's Health Clinic",
    content: "The appointment scheduling and patient management features have streamlined our workflow tremendously. Highly recommended for any medical practice.",
    rating: 5,
    avatar: "/api/placeholder/60/60"
  }
];

const stats = [
  { number: "5000+", label: "Healthcare Providers" },
  { number: "500K+", label: "Patients Managed" },
  { number: "99.9%", label: "Uptime Guarantee" },
  { number: "24/7", label: "Support Available" }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-blue-600 text-white py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>(555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>info@opticare.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Mon-Fri: 8AM-6PM</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <Facebook className="h-4 w-4 hover:text-blue-200 cursor-pointer" />
              <Twitter className="h-4 w-4 hover:text-blue-200 cursor-pointer" />
              <Instagram className="h-4 w-4 hover:text-blue-200 cursor-pointer" />
              <Linkedin className="h-4 w-4 hover:text-blue-200 cursor-pointer" />
            </div>
            <Button size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
              Patient Portal
            </Button>
          </div>
        </div>
      </div>

      {/* Sticky Navigation */}
      <nav className={`bg-white shadow-lg transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 right-0 z-50' : ''}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Eye className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    OptiCare
                  </h1>
                  <p className="text-sm text-slate-600">Medical Center</p>
                </div>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              <div className="relative group">
                <Link href="/" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                  Home
                </Link>
              </div>
              
              <div className="relative group">
                <button className="text-slate-700 hover:text-blue-600 font-medium transition-colors flex items-center">
                  Services
                  <ChevronRight className="ml-1 h-4 w-4 group-hover:rotate-90 transition-transform" />
                </button>
                {/* Mega Menu */}
                <div className="absolute top-full left-0 w-96 bg-white shadow-xl rounded-lg p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Patient Care</h3>
                      <ul className="space-y-2">
                        <li><Link href="/services/consultations" className="text-slate-600 hover:text-blue-600">Medical Consultations</Link></li>
                        <li><Link href="/services/diagnostics" className="text-slate-600 hover:text-blue-600">Diagnostic Services</Link></li>
                        <li><Link href="/services/prescriptions" className="text-slate-600 hover:text-blue-600">Digital Prescriptions</Link></li>
                        <li><Link href="/services/follow-up" className="text-slate-600 hover:text-blue-600">Follow-up Care</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Practice Management</h3>
                      <ul className="space-y-2">
                        <li><Link href="/services/scheduling" className="text-slate-600 hover:text-blue-600">Appointment Scheduling</Link></li>
                        <li><Link href="/services/billing" className="text-slate-600 hover:text-blue-600">Medical Billing</Link></li>
                        <li><Link href="/services/hr" className="text-slate-600 hover:text-blue-600">HR Management</Link></li>
                        <li><Link href="/services/analytics" className="text-slate-600 hover:text-blue-600">Analytics & Reports</Link></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <Link href="/features" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Features
              </Link>
              <Link href="/about" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                About Us
              </Link>
              <Link href="/reviews" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Reviews
              </Link>
              <Link href="/contact" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Contact
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <MessageCircle className="mr-2 h-4 w-4" />
                Live Chat
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t py-4">
              <div className="space-y-4">
                <Link href="/" className="block text-slate-700 hover:text-blue-600 font-medium">Home</Link>
                <Link href="/services" className="block text-slate-700 hover:text-blue-600 font-medium">Services</Link>
                <Link href="/features" className="block text-slate-700 hover:text-blue-600 font-medium">Features</Link>
                <Link href="/about" className="block text-slate-700 hover:text-blue-600 font-medium">About Us</Link>
                <Link href="/reviews" className="block text-slate-700 hover:text-blue-600 font-medium">Reviews</Link>
                <Link href="/contact" className="block text-slate-700 hover:text-blue-600 font-medium">Contact</Link>
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full mb-2">Live Chat</Button>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Get Started</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Slider */}
      <section className="relative h-[600px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : 
              index < currentSlide ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            <div className="relative h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 flex items-center">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl text-white">
                  <Badge className="bg-white bg-opacity-20 text-white mb-4">
                    {slide.subtitle}
                  </Badge>
                  <h1 className="text-5xl font-bold mb-6">{slide.title}</h1>
                  <p className="text-xl mb-8 text-blue-100">{slide.description}</p>
                  <div className="flex space-x-4">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                      {slide.cta}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                      Watch Demo
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Slider Controls */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slider Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-800 mb-4">Our Features</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Comprehensive Healthcare Management
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to run a modern medical practice efficiently and securely, 
              all in one integrated platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                green: 'bg-green-100 text-green-600',
                purple: 'bg-purple-100 text-purple-600',
                orange: 'bg-orange-100 text-orange-600',
                red: 'bg-red-100 text-red-600',
                indigo: 'bg-indigo-100 text-indigo-600'
              };
              
              return (
                <Card key={index} className="border-slate-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 ${colorClasses[feature.color]} rounded-xl flex items-center justify-center mb-6`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-800 mb-4">Testimonials</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See what medical professionals are saying about OptiCare and how it's 
              transforming their practices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="border-slate-200">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                      <p className="text-sm text-slate-600">{testimonial.role}</p>
                      <p className="text-sm text-blue-600">{testimonial.clinic}</p>
                    </div>
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
              Ready to Transform Your Medical Practice?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of healthcare providers who trust OptiCare for their practice management needs.
              Start your free trial today and see the difference.
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

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Logo & Description */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Eye className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">OptiCare</h3>
                  <p className="text-slate-400 text-sm">Medical Center</p>
                </div>
              </div>
              <p className="text-slate-400 mb-6">
                Comprehensive medical practice management solution designed for modern healthcare providers.
              </p>
              <div className="flex space-x-4">
                <Facebook className="h-5 w-5 text-slate-400 hover:text-white cursor-pointer" />
                <Twitter className="h-5 w-5 text-slate-400 hover:text-white cursor-pointer" />
                <Instagram className="h-5 w-5 text-slate-400 hover:text-white cursor-pointer" />
                <Linkedin className="h-5 w-5 text-slate-400 hover:text-white cursor-pointer" />
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Services</h4>
              <ul className="space-y-3">
                <li><Link href="/services/patient-management" className="text-slate-400 hover:text-white transition-colors">Patient Management</Link></li>
                <li><Link href="/services/scheduling" className="text-slate-400 hover:text-white transition-colors">Appointment Scheduling</Link></li>
                <li><Link href="/services/prescriptions" className="text-slate-400 hover:text-white transition-colors">Digital Prescriptions</Link></li>
                <li><Link href="/services/billing" className="text-slate-400 hover:text-white transition-colors">Medical Billing</Link></li>
                <li><Link href="/services/hr" className="text-slate-400 hover:text-white transition-colors">HR Management</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/features" className="text-slate-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/reviews" className="text-slate-400 hover:text-white transition-colors">Reviews</Link></li>
                <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/careers" className="text-slate-400 hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Contact Info</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-slate-400 mt-1" />
                  <div>
                    <p className="text-slate-400">123 Medical Plaza</p>
                    <p className="text-slate-400">Healthcare City, HC 12345</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-slate-400" />
                  <p className="text-slate-400">(555) 123-4567</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <p className="text-slate-400">info@opticare.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400 text-sm mb-4 md:mb-0">
                © 2025 OptiCare Medical Center. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <Link href="/privacy" className="text-slate-400 hover:text-white text-sm transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="text-slate-400 hover:text-white text-sm transition-colors">Terms of Service</Link>
                <Link href="/cookies" className="text-slate-400 hover:text-white text-sm transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Quick Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button className="bg-blue-600 hover:bg-blue-700 rounded-full w-14 h-14 shadow-lg">
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}