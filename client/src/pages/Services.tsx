import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  Contact, 
  Glasses, 
  Search, 
  ArrowRight,
  CheckCircle,
  Star,
  Clock,
  Shield
} from "lucide-react";
import { useParams, Link } from "wouter";

const services = [
  {
    id: 1,
    name: "Comprehensive Eye Examination",
    description: "Complete vision and eye health assessment including retinal imaging and glaucoma screening",
    price: "$150",
    duration: "60 minutes",
    category: "Primary Care",
    features: ["Vision Testing", "Retinal Imaging", "Glaucoma Screening", "Prescription Update"],
    popular: true
  },
  {
    id: 2,
    name: "Contact Lens Fitting",
    description: "Professional contact lens consultation and fitting with trial lenses",
    price: "$100",
    duration: "45 minutes", 
    category: "Contact Lenses",
    features: ["Lens Selection", "Fitting Assessment", "Trial Lenses", "Care Instructions"]
  },
  {
    id: 3,
    name: "Prescription Eyewear",
    description: "Custom eyeglasses with designer frames and high-quality lenses",
    price: "From $199",
    duration: "30 minutes",
    category: "Eyewear",
    features: ["Frame Selection", "Lens Options", "UV Protection", "Anti-Glare Coating"]
  },
  {
    id: 4,
    name: "Pediatric Eye Care",
    description: "Specialized eye care for children including vision screening and treatment",
    price: "$120",
    duration: "30 minutes",
    category: "Specialized Care", 
    features: ["Child-Friendly Exams", "Vision Development", "Learning-Related Vision", "Early Detection"]
  },
  {
    id: 5,
    name: "LASIK Consultation",
    description: "Pre-surgical consultation and evaluation for laser vision correction",
    price: "$75",
    duration: "45 minutes",
    category: "Treatment",
    features: ["Candidacy Assessment", "Corneal Mapping", "Risk Evaluation", "Procedure Planning"]
  },
  {
    id: 6,
    name: "Emergency Eye Care",
    description: "Urgent treatment for eye injuries, infections, and sudden vision changes",
    price: "$200",
    duration: "30 minutes",
    category: "Emergency",
    features: ["Immediate Assessment", "Pain Relief", "Infection Treatment", "Referral Coordination"]
  }
];

const categories = ["All", "Primary Care", "Contact Lenses", "Eyewear", "Specialized Care", "Treatment", "Emergency"];

export default function Services() {
  const params = useParams();
  const serviceType = params.serviceType;
  
  // If specific service type is requested, show detailed service page
  if (serviceType) {
    const service = services.find(s => s.name.toLowerCase().replace(/\s+/g, '-') === serviceType);
    if (service) {
      return (
        <div className="min-h-screen bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-6 w-6 text-blue-600 mr-2" />
                  {service.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-4">{service.description}</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="font-semibold">Duration</h4>
                    <p>{service.duration}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Price</h4>
                    <p>{service.price}</p>
                  </div>
                </div>
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Included Features</h4>
                  <ul className="space-y-1">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button size="lg" className="w-full" asChild>
                  <Link href="/book-appointment">Book This Service</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Comprehensive eye care services with the latest technology and personalized attention.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-blue-100 text-blue-800 mb-4">Professional Eye Care</Badge>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Complete Vision Care Solutions
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From routine eye exams to specialized treatments, we provide comprehensive care 
              for all your vision needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card key={service.id} className="border-slate-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    {service.popular && (
                      <Badge className="bg-orange-100 text-orange-800">Popular</Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {service.category}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600">{service.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-slate-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration}
                    </div>
                    <div className="font-semibold text-blue-600">
                      {service.price}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Includes:</h4>
                    <ul className="text-sm text-slate-600">
                      {service.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-3 w-3 text-green-600 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                      {service.features.length > 3 && (
                        <li className="text-blue-600 text-xs">
                          +{service.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button className="flex-1" asChild>
                      <Link href="/book-appointment">
                        Book Now
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/services/${service.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to Schedule Your Appointment?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Our experienced team is here to provide you with the best possible eye care. 
            Contact us today to book your consultation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" asChild>
              <Link href="/book-appointment">
                <Eye className="h-5 w-5 mr-2" />
                Schedule Appointment
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}