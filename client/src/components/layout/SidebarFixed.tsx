import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  Package, 
  DollarSign, 
  Receipt, 
  Store, 
  Eye,
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Pill,
  ShoppingCart,
  Building,
  CreditCard
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function SidebarFixed() {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Patient Management", "Billing & Invoices", "Store Management"]);
  
  console.log("🔥 SIDEBAR FIXED LOADING - All 5 Patient Management items should appear");
  
  // ALL 5 Patient Management items - HARDCODED
  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
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
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

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

  // Debug log all Patient Management items
  React.useEffect(() => {
    const pmItems = navigationItems.find(item => item.title === "Patient Management")?.items || [];
    console.log("🎯 SIDEBAR FIXED: Patient Management items count:", pmItems.length);
    pmItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.title} -> ${item.href}`);
    });
  }, []);

  return (
    <div className={cn(
      "flex flex-col bg-white border-r border-slate-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <ScrollArea className="flex-1 px-3 py-2" style={{ height: "100vh", overflow: "auto" }}>
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
        
        <nav className="space-y-2" style={{ minHeight: "500px" }}>
          {navigationItems.map((item) => {
            if (item.items) {
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
                    <CollapsibleContent className="mt-1" style={{ minHeight: "200px", overflow: "visible" }}>
                      <div className="pl-4 space-y-1" style={{ minHeight: "150px" }}>
                        {item.items?.map((subItem, index: number) => {
                          console.log(`🔧 Rendering: ${subItem.title}`);
                          return (
                            <Link key={`${subItem.href}-${index}`} href={subItem.href}>
                              <Button
                                variant={isActiveItem(subItem.href) ? "secondary" : "ghost"}
                                size="sm"
                                className="w-full justify-start h-8"
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
                          <span className={cn(
                            "ml-2 px-1.5 py-0.5 text-xs rounded-full",
                            (item.badge as any)?.variant === "destructive" && "bg-red-100 text-red-700",
                            (item.badge as any)?.variant === "secondary" && "bg-gray-100 text-gray-700",
                            (item.badge as any)?.variant === "default" && "bg-blue-100 text-blue-700"
                          )}>
                            {item.badge.text}
                          </span>
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