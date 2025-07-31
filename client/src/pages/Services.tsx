import Header from "@/components/layout/Header";
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
    name: "Dry Eye Treatment",
    description: "Advanced treatments for dry eye syndrome including IPL therapy",
    price: "$200",
    duration: "45 minutes",
    category: "Treatment",
    features: ["Diagnostic Testing", "IPL Therapy", "Tear Duct Treatment", "Ongoing Care"]
  },
  {
    id: 6,
    name: "Emergency Eye Care",
    description: "Urgent care for eye injuries, infections, and sudden vision changes",
    price: "$175",
    duration: "30 minutes",
    category: "Emergency",
    features: ["Same-Day Appointments", "Injury Assessment", "Infection Treatment", "Vision Restoration"]
  }
];

const categories = ["All", "Primary Care", "Contact Lenses", "Eyewear", "Specialized Care", "Treatment", "Emergency"];

export default function Services() {
  return (
    <>
      <Header 
        title="Our Services" 
        subtitle="Comprehensive eye care services with the latest technology and personalized attention."
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Complete Vision Care Solutions
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-6">
                From routine eye exams to specialized treatments, we provide comprehensive care for all your vision needs.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Latest Technology</span>
                </div>
                <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium">Expert Care</span>
                </div>
                <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">Insurance Accepted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Categories Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button 
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="group hover:shadow-lg transition-shadow duration-300 relative">
                {service.popular && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-orange-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                        {service.name}
                      </CardTitle>
                      <Badge variant="outline" className="mt-2">
                        {service.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {service.price}
                      </div>
                      <div className="flex items-center text-sm text-slate-500 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.duration}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                      What's Included:
                    </h4>
                    <ul className="grid grid-cols-2 gap-1">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1 group-hover:bg-blue-600 transition-colors">
                      Book Appointment
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <span>Vision Insurance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  We accept most major vision insurance plans including VSP, EyeMed, and more.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  <span>Flexible Hours</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  Extended hours including evenings and weekends to fit your schedule.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <span>Advanced Technology</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  State-of-the-art equipment for accurate diagnosis and effective treatment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}