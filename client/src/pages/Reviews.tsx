import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ChevronLeft, ChevronRight, Quote, MapPin, Calendar, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

const reviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=100",
    rating: 5,
    title: "Exceptional Eye Care Experience",
    content: "Dr. Smith and the entire team provided outstanding care during my comprehensive eye exam. The latest equipment and professional approach made me feel confident in their expertise. Highly recommend for anyone seeking quality eye care.",
    date: "2024-01-15",
    location: "Downtown Clinic",
    verified: true,
    helpfulCount: 24
  },
  {
    id: 2,
    name: "Michael Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    rating: 5,
    title: "Professional Contact Lens Fitting",
    content: "Got my first contact lenses here and the fitting process was thorough and comfortable. The staff took time to ensure proper fit and taught me proper care techniques. Great experience overall.",
    date: "2024-01-10",
    location: "Westside Branch",
    verified: true,
    helpfulCount: 18
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    rating: 5,
    title: "Excellent Pediatric Care",
    content: "Brought my 7-year-old for her first eye exam. The team was incredibly patient and made the experience fun for her. They detected a minor vision issue early and provided great solutions.",
    date: "2024-01-08",
    location: "Family Center",
    verified: true,
    helpfulCount: 31
  },
  {
    id: 4,
    name: "David Park",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    rating: 5,
    title: "Advanced Dry Eye Treatment",
    content: "After years of struggling with dry eyes, the IPL therapy here has been life-changing. The treatment was comfortable and results have been excellent. Professional staff and modern facilities.",
    date: "2024-01-05",
    location: "Downtown Clinic",
    verified: true,
    helpfulCount: 19
  },
  {
    id: 5,
    name: "Lisa Thompson",
    avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100",
    rating: 5,
    title: "Designer Frames & Quality Service",
    content: "Love my new prescription glasses! Great selection of designer frames and the staff helped me find the perfect fit. The anti-glare coating and UV protection are excellent additions.",
    date: "2024-01-03",
    location: "Fashion District",
    verified: true,
    helpfulCount: 15
  },
  {
    id: 6,
    name: "Robert Wilson",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    rating: 5,
    title: "Emergency Care Excellence",
    content: "Had an eye injury and was seen immediately. The emergency care was professional and thorough. They quickly diagnosed the issue and provided effective treatment. Grateful for their expertise.",
    date: "2024-01-01",
    location: "Emergency Center",
    verified: true,
    helpfulCount: 27
  }
];

const stats = [
  { label: "Total Reviews", value: "2,847" },
  { label: "Average Rating", value: "4.9" },
  { label: "5-Star Reviews", value: "94%" },
  { label: "Verified Patients", value: "100%" }
];

export default function Reviews() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % reviews.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % reviews.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + reviews.length) % reviews.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
        )}
      />
    ));
  };

  return (
    <>
      <Header 
        title="Patient Reviews" 
        subtitle="Read what our patients say about their vision care experience with us."
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-8">
          {/* Statistics Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Review Slider */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {reviews.map((review, index) => (
                    <div key={review.id} className="w-full flex-shrink-0">
                      <div className="p-8 md:p-12">
                        <div className="max-w-4xl mx-auto">
                          {/* Review Header */}
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={review.avatar} alt={review.name} />
                              <AvatarFallback>
                                {review.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold">{review.name}</h3>
                                {review.verified && (
                                  <Badge variant="outline" className="text-xs">
                                    Verified Patient
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                  {renderStars(review.rating)}
                                </div>
                                <span className="text-sm text-slate-500">({review.rating}.0)</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(review.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {review.location}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Review Content */}
                          <div className="relative">
                            <Quote className="absolute -top-2 -left-2 h-8 w-8 text-blue-200 dark:text-blue-800" />
                            <div className="pl-6">
                              <h4 className="text-lg font-medium mb-3 text-slate-900 dark:text-white">
                                {review.title}
                              </h4>
                              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                                {review.content}
                              </p>
                            </div>
                          </div>

                          {/* Review Footer */}
                          <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{review.helpfulCount} people found this helpful</span>
                            </div>
                            <Button variant="outline" size="sm">
                              Was this helpful?
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Slide Indicators */}
              <div className="flex justify-center gap-2 p-4">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={cn(
                      "w-3 h-3 rounded-full transition-colors",
                      index === currentSlide
                        ? "bg-blue-600"
                        : "bg-slate-300 hover:bg-slate-400"
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Review Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-6">All Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <Card key={review.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar>
                        <AvatarImage src={review.avatar} alt={review.name} />
                        <AvatarFallback>
                          {review.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{review.name}</h4>
                          {review.verified && (
                            <Badge variant="outline" className="text-xs">Verified</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <h5 className="font-medium mb-2">{review.title}</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                      {review.content}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <span className="text-xs text-slate-500">{review.location}</span>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <ThumbsUp className="h-3 w-3" />
                        {review.helpfulCount}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}