import { Link, useLocation } from "wouter";
import { Eye, Home, Store, Package, ShoppingCart, Calendar, CalendarPlus, Users, FileText, BarChart3, MessageCircle, Settings, HelpCircle, LogOut, Clock, DollarSign, Bell, User, UserCheck, Pill, Stethoscope } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User as UserType } from "@shared/schema";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Patient Management", href: "/patients", icon: Users },
  { name: "Invoice & Sales", href: "/sales", icon: ShoppingCart },
  { name: "Prescriptions", href: "/prescriptions", icon: Pill },
  { name: "Billing", href: "/billing", icon: DollarSign },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Staff", href: "/staff", icon: UserCheck },
  { name: "Attendance", href: "/attendance", icon: Clock },
  { name: "Leave Management", href: "/leave-management", icon: Calendar },
  { name: "Payroll", href: "/payroll", icon: DollarSign },
  { name: "Stores", href: "/stores", icon: Store },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Communication", href: "/communication", icon: MessageCircle },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help & Support", href: "/support", icon: HelpCircle },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth() as { user: UserType | undefined };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Eye className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold">OptiCare</h1>
            <p className="text-slate-400 text-sm">Medical Center</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || "User"} />
            <AvatarFallback>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-400 capitalize">{user?.role || "Staff"}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
