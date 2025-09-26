import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Calendar,
  Stethoscope,
  Shield,
  Award,
  Heart
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">IeOMS</h3>
                <p className="text-sm text-slate-400">Modern Eye Care</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your trusted partner in comprehensive eye care and vision health. 
              We provide professional optical services with the latest technology 
              and personalized patient care.
            </p>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-sm text-slate-300">HIPAA Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-slate-300">Licensed & Certified</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-slate-300 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Patient Reviews
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Patient Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/services/eye-exams" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Comprehensive Eye Exams
                </Link>
              </li>
              <li>
                <Link href="/services/contact-lenses" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Contact Lens Fittings
                </Link>
              </li>
              <li>
                <Link href="/services/glasses" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Prescription Glasses
                </Link>
              </li>
              <li>
                <Link href="/services/surgery" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Eye Surgery Consultations
                </Link>
              </li>
              <li>
                <Link href="/services/pediatric" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Pediatric Eye Care
                </Link>
              </li>
              <li>
                <Link href="/services/emergency" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Emergency Eye Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">
                  Sandy Babb Street, Kitty<br />
                  Georgetown, Guyana
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">+592 750-3901</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-red-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">info.indiaespectacular@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                <div className="text-slate-300 text-sm">
                  Mon-Fri: 8:00 AM - 6:00 PM<br />
                  Sat: 9:00 AM - 4:00 PM<br />
                  Sun: Closed
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="pt-4">
              <h5 className="font-medium mb-2">Stay Updated</h5>
              <p className="text-slate-400 text-sm mb-3">
                Get health tips and appointment reminders
              </p>
              <div className="flex space-x-2">
                <Input 
                  type="email" 
                  placeholder="Your email"
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-400"
                />
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="mt-8 pt-8 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700" asChild>
              <Link href="/book-appointment">
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </Link>
            </Button>
            <Button variant="outline" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700" asChild>
              <Link href="/api/login">
                <Stethoscope className="h-4 w-4 mr-2" />
                Patient Portal
              </Link>
            </Button>
            <Button variant="outline" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              <Phone className="h-4 w-4 mr-2" />
              Emergency Contact
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-slate-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-slate-400">
              <span>© 2025 IeNet. All rights reserved.</span>
              <div className="flex items-center space-x-4">
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <span className="text-slate-600">|</span>
                <div className="flex items-center space-x-1">
                  <Heart className="h-3 w-3 text-red-400" />
                  <span>Made with care for your vision</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-2">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-2">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-2">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-2">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-2">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}