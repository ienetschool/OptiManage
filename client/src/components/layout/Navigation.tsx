import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
// Removed unused Separator import
import { 
  LayoutDashboard,
  Users,
  Calendar,
  Pill,
  Eye,
  ShoppingCart,
  Settings,
  DollarSign,
  Receipt,
  CreditCard,
  Package,
  Building,
  BarChart3,
  MessageSquare,
  Bell,
  Globe,
  UserCog,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface NavigationProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: { text: string; variant: "default" | "destructive" | "secondary" | "outline" };
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Patient Management",
    icon: Users,
    children: [
      { title: "Patient Registration", href: "/patients", icon: Users },
      { title: "Appointments", href: "/appointments", icon: Calendar },
      { title: "Prescriptions", href: "/prescriptions", icon: Pill },
      { title: "Specs Workflow", href: "/specs-workflow", icon: Eye },
      { title: "Specs Order Creation", href: "/specs-order-creation", icon: ShoppingCart },
      { title: "Lens Cutting & Fitting", href: "/lens-cutting-workflow", icon: Settings },
    ],
  },
  {
    title: "Billing & Invoices",
    icon: DollarSign,
    children: [
      { title: "Invoice Management", href: "/invoices", icon: Receipt },
      { title: "Payment History", href: "/payments", icon: CreditCard },
    ],
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Package,
    badge: { text: "Low Stock", variant: "destructive" },
  },
  {
    title: "Store Management",
    icon: Building,
    children: [
      { title: "All Stores", href: "/stores", icon: Building },
      { title: "Store Settings", href: "/store-settings", icon: Settings },
    ],
  },
  {
    title: "Website Management",
    href: "/website",
    icon: Globe,
  },
  {
    title: "Staff & HR",
    href: "/staff",
    icon: UserCog,
  },
  {
    title: "Reports & Analytics",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Communication",
    href: "/communication",
    icon: MessageSquare,
    badge: { text: "3", variant: "secondary" },
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    badge: { text: "5", variant: "secondary" },
  },
];

export default function Navigation({ collapsed = false, onToggle }: NavigationProps) {
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Patient Management"]);

  const isActiveItem = (href: string) => {
    return location === href || location.startsWith(href + "/");
  };

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const isActive = item.href ? isActiveItem(item.href) : false;

    if (hasChildren) {
      return (
        <div key={item.title} className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => toggleExpanded(item.title)}
            className={cn(
              "w-full justify-start h-9 px-3",
              level > 0 && "pl-6",
              collapsed && "px-2 justify-center"
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="ml-3 flex-1 text-left">{item.title}</span>
                {item.badge && (
                  <Badge variant={item.badge.variant} className="ml-2 text-xs">
                    {item.badge.text}
                  </Badge>
                )}
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isExpanded && "rotate-90"
                  )}
                />
              </>
            )}
          </Button>
          
          {!collapsed && isExpanded && item.children && (
            <div className="ml-4 space-y-1 border-l border-border pl-4">
              {item.children.map(child => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.title} href={item.href!}>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start h-9 px-3",
            level > 0 && "pl-6",
            collapsed && "px-2 justify-center"
          )}
        >
          <item.icon className="h-4 w-4 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="ml-3 flex-1 text-left">{item.title}</span>
              {item.badge && (
                <Badge variant={item.badge.variant} className="ml-2 text-xs">
                  {item.badge.text}
                </Badge>
              )}
            </>
          )}
        </Button>
      </Link>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Eye className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">IeOMS</h2>
              <p className="text-xs text-muted-foreground">Practice Management</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigationItems.map(item => renderNavItem(item))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <div>Version 2.0.0</div>
            <div>All systems operational</div>
          </div>
        </div>
      )}
    </div>
  );
}