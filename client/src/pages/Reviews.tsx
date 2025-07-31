import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Star,
  Quote,
  ThumbsUp,
  Award,
  Users,
  ArrowRight,
  Filter,
  Search,
  TrendingUp,
  Heart,
  CheckCircle,
  Calendar,
  MapPin
} from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    role: "Chief Medical Officer",
    clinic: "HealthFirst Medical Center",
    location: "New York, NY",
    rating: 5,
    date: "2024-12-15",
    title: "Game-changing practice management solution",
    content: "OptiCare has completely revolutionized how we manage our practice. The integrated approach to patient care, staff management, and billing has improved our efficiency by over 40%. The HIPAA compliance features give us complete peace of mind, and our patients appreciate the streamlined appointment booking system.",
    avatar: "/api/placeholder/80/80",
    verified: true,
    helpful: 28,
    specialty: "Family Medicine"
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    role: "Practice Owner",
    clinic: "Downtown Family Medicine",
    location: "San Francisco, CA",
    rating: 5,
    date: "2024-12-10",
    title: "Outstanding customer support and features",
    content: "What impressed me most about OptiCare is not just the comprehensive feature set, but the exceptional customer support. The team is always responsive and helpful. The prescription management system has eliminated errors and the automated billing has saved us countless hours each week.",
    avatar: "/api/placeholder/80/80",
    verified: true,
    helpful: 35,
    specialty: "Internal Medicine"
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    role: "Pediatric Specialist",
    clinic: "Children's Health Clinic",
    location: "Austin, TX",
    rating: 5,
    date: "2024-12-08",
    title: "Perfect for pediatric practices",
    content: "As a pediatric specialist, I need a system that can handle the unique needs of children and their families. OptiCare's patient management system is perfect for tracking growth charts, vaccination schedules, and family connections. The appointment reminders have reduced no-shows by 60%.",
    avatar: "/api/placeholder/80/80",
    verified: true,
    helpful: 22,
    specialty: "Pediatrics"
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    role: "Orthopedic Surgeon",
    clinic: "Advanced Orthopedics",
    location: "Chicago, IL",
    rating: 5,
    date: "2024-12-05",
    title: "Streamlined surgical practice management",
    content: "Managing a surgical practice requires precision and efficiency. OptiCare delivers on both fronts. The staff scheduling features help coordinate our OR schedules, and the billing integration with insurance providers has significantly reduced claim denials. Highly recommended for surgical practices.",
    avatar: "/api/placeholder/80/80",
    verified: true,
    helpful: 19,
    specialty: "Orthopedics"
  },
  {
    id: 5,
    name: "Dr. Lisa Thompson",
    role: "Dermatologist",
    clinic: "Skin Care Specialists",
    location: "Miami, FL",
    rating: 4,
    date: "2024-12-02",
    title: "Great features with room for improvement",
    content: "OptiCare has been a solid choice for our dermatology practice. The patient photo management and treatment tracking features are excellent. The analytics dashboard provides valuable insights into our practice metrics. My only suggestion would be more customization options for specialty-specific workflows.",
    avatar: "/api/placeholder/80/80",
    verified: true,
    helpful: 15,
    specialty: "Dermatology"
  },
  {
    id: 6,
    name: "Dr. Robert Kim",
    role: "Cardiologist",
    clinic: "Heart Health Center",
    location: "Seattle, WA",
    rating: 5,
    date: "2024-11-28",
    title: "Essential for modern cardiology practice",
    content: "The comprehensive reporting features in OptiCare have been invaluable for managing our cardiology patients. The ability to track multiple conditions, medications, and follow-up schedules in one place has improved our patient care quality. The integration with our EKG equipment is seamless.",
    avatar: "/api/placeholder/80/80",
    verified: true,
    helpful: 31,
    specialty: "Cardiology"
  }
];

const overallStats = {
  averageRating: 4.9,
  totalReviews: 1247,
  ratingDistribution: [
    { stars: 5, count: 986, percentage: 79 },
    { stars: 4, count: 186, percentage: 15 },
    { stars: 3, count: 50, percentage: 4 },
    { stars: 2, count: 15, percentage: 1 },
    { stars: 1, count: 10, percentage: 1 }
  ]
};

const achievements = [
  {
    icon: Award,
    title: "Healthcare Innovation Award 2024",
    organization: "Medical Technology Association"
  },
  {
    icon: Star,
    title: "Best Practice Management Software",
    organization: "Healthcare IT News"
  },
  {
    icon: Users,
    title: "Customer Choice Award",
    organization: "Software Reviews Platform"
  },
  {
    icon: TrendingUp,
    title: "Fastest Growing Health Tech",
    organization: "Industry Analytics Report"
  }
];

export default function Reviews() {
  const [filterRating, setFilterRating] = useState("all");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);

  const filteredReviews = reviews.filter(review => {
    const matchesRating = filterRating === "all" || review.rating.toString() === filterRating;
    const matchesSpecialty = filterSpecialty === "all" || review.specialty === filterSpecialty;
    const matchesSearch = review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.clinic.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRating && matchesSpecialty && matchesSearch;
  });

  const specialties = [...new Set(reviews.map(review => review.specialty))];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="bg-white bg-opacity-20 text-white mb-6">Customer Reviews</Badge>
            <h1 className="text-5xl font-bold mb-6">
              Trusted by Healthcare Professionals
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              See what medical professionals are saying about OptiCare and how it's 
              transforming their practices across the country.
            </p>
            <div className="flex justify-center items-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold">{overallStats.averageRating}</div>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="text-blue-100">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">{overallStats.totalReviews.toLocaleString()}</div>
                <div className="text-blue-100 mt-2">Total Reviews</div>
              </div>
            </div>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Rating Distribution */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Rating Distribution</h2>
            <div className="space-y-4">
              {overallStats.ratingDistribution.map((rating) => (
                <div key={rating.stars} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 w-20">
                    <span className="text-sm font-medium">{rating.stars}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${rating.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-slate-600 w-16">{rating.count}</div>
                  <div className="text-sm text-slate-600 w-10">{rating.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-green-100 text-green-800 mb-4">Awards & Recognition</Badge>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Industry Recognition</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              OptiCare has been recognized by leading healthcare and technology organizations 
              for innovation and excellence in practice management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <Card key={index} className="border-slate-200 text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gold-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                      <Icon className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{achievement.title}</h3>
                    <p className="text-sm text-slate-600">{achievement.organization}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 space-y-4 lg:space-y-0">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Customer Reviews</h2>
                <p className="text-slate-600">{filteredReviews.length} reviews found</p>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search reviews..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <Select value={filterRating} onValueChange={setFilterRating}>
                  <SelectTrigger className="w-40">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Dialog open={writeReviewOpen} onOpenChange={setWriteReviewOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Write Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Write a Review</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Your Name</Label>
                          <Input placeholder="Dr. John Smith" />
                        </div>
                        <div>
                          <Label>Practice/Clinic Name</Label>
                          <Input placeholder="Your Medical Practice" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Specialty</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select specialty" />
                            </SelectTrigger>
                            <SelectContent>
                              {specialties.map((specialty) => (
                                <SelectItem key={specialty} value={specialty}>
                                  {specialty}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Location</Label>
                          <Input placeholder="City, State" />
                        </div>
                      </div>

                      <div>
                        <Label>Rating</Label>
                        <div className="flex space-x-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-8 w-8 text-gray-300 hover:text-yellow-400 cursor-pointer" />
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Review Title</Label>
                        <Input placeholder="Summarize your experience" />
                      </div>

                      <div>
                        <Label>Your Review</Label>
                        <Textarea 
                          placeholder="Share your experience with OptiCare..."
                          rows={6}
                        />
                      </div>

                      <div className="flex justify-end space-x-4">
                        <Button variant="outline" onClick={() => setWriteReviewOpen(false)}>
                          Cancel
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Submit Review
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Reviews Grid */}
            <div className="space-y-8">
              {filteredReviews.map((review) => (
                <Card key={review.id} className="border-slate-200">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      <img 
                        src={review.avatar} 
                        alt={review.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-xl font-semibold text-slate-900">{review.name}</h3>
                              {review.verified && (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                            <p className="text-slate-600">{review.role}</p>
                            <p className="text-blue-600 font-medium">{review.clinic}</p>
                            <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{review.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(review.date).toLocaleDateString()}</span>
                              </div>
                              <Badge variant="outline">{review.specialty}</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex space-x-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-5 w-5 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                            <div className="text-sm text-slate-500">{review.rating}/5</div>
                          </div>
                        </div>
                        
                        <h4 className="text-lg font-semibold text-slate-900 mb-3">{review.title}</h4>
                        
                        <div className="relative">
                          <Quote className="absolute -top-2 -left-2 h-8 w-8 text-blue-200" />
                          <p className="text-slate-600 leading-relaxed pl-6">{review.content}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                          <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 transition-colors">
                              <ThumbsUp className="h-4 w-4" />
                              <span className="text-sm">Helpful ({review.helpful})</span>
                            </button>
                          </div>
                          <div className="text-sm text-slate-500">
                            Verified Purchase
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl font-bold mb-6">
              Join Thousands of Satisfied Healthcare Providers
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Start your free trial today and see why so many medical professionals 
              choose OptiCare for their practice management needs.
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