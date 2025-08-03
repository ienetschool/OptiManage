import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  ChevronRight
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
    title: "Seamless Patient Experience",
    subtitle: "Modern healthcare delivery with digital-first approach",
    description: "Enhance patient satisfaction with online scheduling, telemedicine integration, and automated follow-up systems.",
    image: "/api/placeholder/800/400",
    cta: "Learn More",
    ctaLink: "/features"
  },
  {
    id: 3,
    title: "Data-Driven Healthcare Insights",
    subtitle: "Analytics and reporting for better patient outcomes",
    description: "Make informed decisions with comprehensive analytics, patient trends, and performance metrics.",
    image: "/api/placeholder/800/400",
    cta: "View Demo",
    ctaLink: "/contact"
  }
];

const features = [
  {
    icon: Stethoscope,
    title: "Comprehensive Care",
    description: "Complete medical practice management with integrated patient care workflows",
    color: "blue" as const
  },
  {
    icon: Users,
    title: "Patient Management",
    description: "Comprehensive patient profiles with medical history, appointments, and loyalty tracking",
    color: "green" as const
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Advanced scheduling system with automated reminders and multi-doctor support",
    color: "purple" as const
  },
  {
    icon: FileText,
    title: "Digital Prescriptions",
    description: "Electronic prescription management with dosage tracking and refill notifications",
    color: "orange" as const
  },
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "Secure, HIPAA-compliant system with role-based access and comprehensive audit trails",
    color: "red" as const
  },
  {
    icon: Activity,
    title: "Real-time Analytics",
    description: "Advanced analytics and reporting for better decision making and practice optimization",
    color: "indigo" as const
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600", 
    purple: "text-purple-600",
    orange: "text-orange-600",
    red: "text-red-600",
    indigo: "text-indigo-600"
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Slider */}
      <section className="relative h-screen bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        {/* Slider Content */}
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <Badge className="bg-white/20 text-white border-white/30 mb-6">
                Next-Generation Healthcare Management
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                {heroSlides[currentSlide].title}
              </h1>
              
              <h2 className="text-2xl md:text-3xl font-light mb-6 text-blue-100">
                {heroSlides[currentSlide].subtitle}
              </h2>
              
              <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
                {heroSlides[currentSlide].description}
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    if (heroSlides[currentSlide].ctaLink === "/api/login") {
                      window.location.href = "/api/login";
                    } else {
                      window.location.href = heroSlides[currentSlide].ctaLink;
                    }
                  }}
                >
                  {heroSlides[currentSlide].cta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                  <Link href="/book-appointment">
                    Book Appointment
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Slider Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
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
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-800 mb-4">Comprehensive Features</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Everything You Need for Modern Healthcare
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with intuitive design to deliver 
              the most comprehensive healthcare management solution available.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-slate-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-8">
                  <div className={`inline-flex p-3 rounded-lg bg-${feature.color}-100 mb-6`}>
                    <feature.icon className={`h-8 w-8 ${colorClasses[feature.color]}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-800 mb-4">Testimonials</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See what medical professionals are saying about our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="border-slate-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
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
                      <div className="font-semibold text-slate-900">{testimonial.name}</div>
                      <div className="text-sm text-slate-600">{testimonial.role}</div>
                      <div className="text-sm text-blue-600">{testimonial.clinic}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Practice?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of healthcare providers who trust OptiCare for their practice management needs.
              Start your free trial today and see the difference.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => window.location.href = "/api/login"}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                <Link href="/contact">
                  Schedule Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}