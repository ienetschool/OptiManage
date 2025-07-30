import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Store, Package, Calendar, Users, BarChart3 } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const features = [
    {
      icon: Store,
      title: "Multi-Store Management",
      description: "Manage multiple optical store locations from a single dashboard"
    },
    {
      icon: Package,
      title: "Inventory Control",
      description: "Track stock levels, manage suppliers, and automate reordering"
    },
    {
      icon: Calendar,
      title: "Appointment Booking",
      description: "Schedule and manage customer appointments across all locations"
    },
    {
      icon: Users,
      title: "Customer Management",
      description: "Maintain detailed customer profiles and loyalty programs"
    },
    {
      icon: BarChart3,
      title: "Sales Analytics",
      description: "Real-time sales reporting and business intelligence"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mr-4">
              <Eye className="text-white text-2xl" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-slate-900">OptiStore Pro</h1>
              <p className="text-xl text-slate-600">Multi-Store Management System</p>
            </div>
          </div>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Streamline your optical business operations with our comprehensive management system. 
            Handle inventory, sales, appointments, and customer relationships across multiple store locations.
          </p>
          
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Sign In to Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-slate-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-blue-600 h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Why Choose OptiStore Pro?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <p className="text-slate-600">Uptime Guarantee</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <p className="text-slate-600">Customer Support</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <p className="text-slate-600">Satisfied Stores</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-slate-500">
          <p>&copy; 2024 OptiStore Pro. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
