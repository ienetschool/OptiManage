import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Store,
  Package,
  DollarSign,
  Calendar,
  Users,
  UserCheck,
  FileText,
  Receipt,
  ClipboardList,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
  Eye,
  Stethoscope,
  Building,
  UserCog,
  CreditCard,
  BarChart3,
  MessageSquare,
  Bell,
  ChevronDown,
  Briefcase,
  BookOpen,
  Hospital,
  Pill,
  TrendingUp,
  Globe,
  Palette,
  Link as LinkIcon,
  Search as SearchIcon,
  ShoppingCart
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Updated navigation with specs order creation module - FIXED VERSION
const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "Patient Management",
    icon: Users,
    items: [
      { title: "Patient Registration", href: "/patients", icon: Calendar },
      { title: "Prescriptions", href: "/prescriptions", icon: Pill },
      { title: "Specs Workflow", href: "/specs-workflow", icon: Eye },
      { title: "Specs Order Creation", href: "/specs-order-creation", icon: ShoppingCart },
      { title: "Lens Cutting & Fitting", href: "/lens-cutting-workflow", icon: Settings },
    ],
  },
  {
    title: "Billing & Invoices",
    icon: DollarSign,
    items: [
      { title: "Invoice Management", href: "/invoices", icon: Receipt },
      { title: "Payment History", href: "/payments", icon: CreditCard },

    ],
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Package,
    badge: { text: "Low Stock", variant: "destructive" as const },
  },
  {
    title: "Store Management",
    icon: Building,
    items: [
      { title: "All Stores", href: "/stores", icon: Store },
      { title: "Store Settings", href: "/store-settings", icon: Settings },
    ],
  },
  {
    title: "Website Management",
    icon: Globe,
    items: [
      { title: "Pages", href: "/pages", icon: FileText },
      { title: "Themes", href: "/themes", icon: Palette },
      { title: "Domains", href: "/domains", icon: LinkIcon },
      { title: "SEO", href: "/seo", icon: SearchIcon },
    ],
  },
  {
    title: "Staff & HR",
    icon: UserCog,
    items: [
      { title: "Staff Management", href: "/staff", icon: Users },
      { title: "Attendance", href: "/attendance", icon: UserCheck },
      { title: "Payroll", href: "/payroll", icon: Briefcase },
    ],
  },
  {
    title: "Reports & Analytics",
    icon: BarChart3,
    items: [
      { title: "Analytics Dashboard", href: "/analytics", icon: TrendingUp },
      { title: "Advanced Reports", href: "/advanced-reports", icon: FileText },
      { title: "Custom Reports", href: "/custom-reports", icon: Settings },
      { title: "Store Performance", href: "/store-performance", icon: Building },
      { title: "Standard Reports", href: "/reports", icon: FileText },
    ],
  },
  {
    title: "Communication",
    href: "/communication",
    icon: MessageSquare,
    badge: { text: "3", variant: "default" as const },
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    badge: { text: "5", variant: "secondary" as const },
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Support",
    href: "/support",
    icon: HelpCircle,
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Patient Management", "Billing & Invoices", "Store Management"]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActiveItem = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const isParentActive = (items?: Array<{ href: string }>) => {
    return items?.some(item => isActiveItem(item.href)) || false;
  };

  return (
    <div className={cn(
      "flex flex-col bg-white border-r border-slate-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Navigation with integrated collapse toggle */}
      <ScrollArea className="flex-1 px-3 py-2">
        {/* Collapse Toggle at top of navigation */}
        <div className="flex justify-end mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            if (item.items) {
              // Group with subitems
              const isExpanded = expandedItems.includes(item.title);
              const isActive = isParentActive(item.items);

              return (
                <Collapsible key={item.title} open={isExpanded} onOpenChange={() => toggleExpanded(item.title)}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start h-10",
                        collapsed && "px-2 justify-center"
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="ml-3 flex-1 text-left">{item.title}</span>
                          <ChevronDown className={cn(
                            "h-4 w-4 transition-transform",
                            isExpanded && "rotate-180"
                          )} />
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  {!collapsed && (
                    <CollapsibleContent className="mt-1">
                      <div className="pl-4 space-y-1">

                        {item.items?.map((subItem, index) => {
                          console.log(`Rendering menu item ${index}:`, subItem.title, subItem.href, subItem.icon);
                          return (
                            <Link key={`${subItem.href}-${index}`} href={subItem.href}>
                              <Button
                                variant={isActiveItem(subItem.href) ? "secondary" : "ghost"}
                                size="sm"
                                className="w-full justify-start h-8"
                                data-testid={`menu-item-${subItem.title.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                <subItem.icon className="h-3 w-3 flex-shrink-0" />
                                <span className="ml-3">{subItem.title}</span>
                              </Button>
                            </Link>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              );
            } else {
              // Single item
              return (
                <Link key={item.href} href={item.href!}>
                  <Button
                    variant={isActiveItem(item.href!) ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start h-10",
                      collapsed && "px-2 justify-center"
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="ml-3 flex-1 text-left">{item.title}</span>
                        {item.badge && (
                          <Badge variant={item.badge.variant} className="ml-auto text-xs">
                            {item.badge.text}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                </Link>
              );
            }
          })}
        </nav>
      </ScrollArea>


    </div>
  );
}