import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { 
  Users, 
  LayoutDashboard, 
  Calendar, 
  Receipt, 
  Package, 
  Building, 
  Settings, 
  HelpCircle, 
  Bell, 
  DollarSign, 
  CreditCard, 
  Store, 
  Pill, 
  Eye, 
  ShoppingCart, 
  BarChart3, 
  MessageSquare, 
  Globe 
} from "lucide-react";

// FORCED SIDEBAR - BYPASSING ALL RENDERING ISSUES
export default function SidebarForced() {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Patient Management", "Billing & Invoices", "Store Management"]);

  console.log("🔥 FORCED SIDEBAR LOADING - NEW COMPONENT");

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

  const isExpanded = (title: string) => expandedItems.includes(title);

  return (
    <div className={cn(
      "flex flex-col h-full bg-background border-r transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-lg font-semibold">Navigation</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-2">
          {/* Dashboard */}
          <Link href="/dashboard">
            <Button
              variant={isActiveItem("/dashboard") ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-10",
                collapsed && "px-2 justify-center"
              )}
            >
              <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="ml-3">Dashboard</span>}
            </Button>
          </Link>

          {/* Patient Management - FORCED ALL 5 ITEMS */}
          <Collapsible open={isExpanded("Patient Management")} onOpenChange={() => toggleExpanded("Patient Management")}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-10",
                  collapsed && "px-2 justify-center"
                )}
              >
                <Users className="h-4 w-4 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="ml-3 flex-1 text-left">Patient Management</span>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded("Patient Management") && "rotate-180"
                    )} />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            {!collapsed && (
              <CollapsibleContent className="mt-1">
                <div className="pl-4 space-y-1">
                  
                  {/* FORCED ALL 5 PATIENT MANAGEMENT ITEMS */}
                  <Link href="/patients">
                    <Button variant="ghost" size="sm" className="w-full justify-start h-8">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="ml-3">Patient Registration</span>
                    </Button>
                  </Link>
                  
                  <Link href="/prescriptions">
                    <Button variant="ghost" size="sm" className="w-full justify-start h-8">
                      <Pill className="h-3 w-3 flex-shrink-0" />
                      <span className="ml-3">Prescriptions</span>
                    </Button>
                  </Link>
                  
                  <Link href="/specs-workflow">
                    <Button variant="ghost" size="sm" className="w-full justify-start h-8">
                      <Eye className="h-3 w-3 flex-shrink-0" />
                      <span className="ml-3">Specs Workflow</span>
                    </Button>
                  </Link>
                  
                  <Link href="/specs-order-creation">
                    <Button variant="ghost" size="sm" className="w-full justify-start h-8">
                      <ShoppingCart className="h-3 w-3 flex-shrink-0" />
                      <span className="ml-3">Specs Order Creation</span>
                    </Button>
                  </Link>
                  
                  <Link href="/lens-cutting-workflow">
                    <Button variant="ghost" size="sm" className="w-full justify-start h-8">
                      <Settings className="h-3 w-3 flex-shrink-0" />
                      <span className="ml-3">Lens Cutting & Fitting</span>
                    </Button>
                  </Link>
                  
                </div>
              </CollapsibleContent>
            )}
          </Collapsible>

          {/* Billing & Invoices */}
          <Collapsible open={isExpanded("Billing & Invoices")} onOpenChange={() => toggleExpanded("Billing & Invoices")}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-10",
                  collapsed && "px-2 justify-center"
                )}
              >
                <DollarSign className="h-4 w-4 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="ml-3 flex-1 text-left">Billing & Invoices</span>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded("Billing & Invoices") && "rotate-180"
                    )} />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            {!collapsed && (
              <CollapsibleContent className="mt-1">
                <div className="pl-4 space-y-1">
                  <Link href="/invoices">
                    <Button variant="ghost" size="sm" className="w-full justify-start h-8">
                      <Receipt className="h-3 w-3 flex-shrink-0" />
                      <span className="ml-3">Invoice Management</span>
                    </Button>
                  </Link>
                  <Link href="/payments">
                    <Button variant="ghost" size="sm" className="w-full justify-start h-8">
                      <CreditCard className="h-3 w-3 flex-shrink-0" />
                      <span className="ml-3">Payment History</span>
                    </Button>
                  </Link>
                </div>
              </CollapsibleContent>
            )}
          </Collapsible>

          {/* Inventory */}
          <Link href="/inventory">
            <Button
              variant={isActiveItem("/inventory") ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-10",
                collapsed && "px-2 justify-center"
              )}
            >
              <Package className="h-4 w-4 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="ml-3 flex-1 text-left">Inventory</span>
                  <Badge variant="destructive" className="ml-auto text-xs">Low Stock</Badge>
                </>
              )}
            </Button>
          </Link>

          {/* Store Management */}
          <Collapsible open={isExpanded("Store Management")} onOpenChange={() => toggleExpanded("Store Management")}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-10",
                  collapsed && "px-2 justify-center"
                )}
              >
                <Building className="h-4 w-4 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="ml-3 flex-1 text-left">Store Management</span>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded("Store Management") && "rotate-180"
                    )} />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            {!collapsed && (
              <CollapsibleContent className="mt-1">
                <div className="pl-4 space-y-1">
                  <Link href="/stores">
                    <Button variant="ghost" size="sm" className="w-full justify-start h-8">
                      <Store className="h-3 w-3 flex-shrink-0" />
                      <span className="ml-3">All Stores</span>
                    </Button>
                  </Link>
                  <Link href="/store-settings">
                    <Button variant="ghost" size="sm" className="w-full justify-start h-8">
                      <Settings className="h-3 w-3 flex-shrink-0" />
                      <span className="ml-3">Store Settings</span>
                    </Button>
                  </Link>
                </div>
              </CollapsibleContent>
            )}
          </Collapsible>

          {/* Website Management */}
          <Link href="/website">
            <Button
              variant={isActiveItem("/website") ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-10",
                collapsed && "px-2 justify-center"
              )}
            >
              <Globe className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="ml-3">Website Management</span>}
            </Button>
          </Link>

          {/* Staff & HR */}
          <Link href="/staff">
            <Button
              variant={isActiveItem("/staff") ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-10",
                collapsed && "px-2 justify-center"
              )}
            >
              <Users className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="ml-3">Staff & HR</span>}
            </Button>
          </Link>

          {/* Reports & Analytics */}
          <Link href="/reports">
            <Button
              variant={isActiveItem("/reports") ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-10",
                collapsed && "px-2 justify-center"
              )}
            >
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="ml-3">Reports & Analytics</span>}
            </Button>
          </Link>

          {/* Communication */}
          <Link href="/communication">
            <Button
              variant={isActiveItem("/communication") ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-10",
                collapsed && "px-2 justify-center"
              )}
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="ml-3 flex-1 text-left">Communication</span>
                  <Badge variant="secondary" className="ml-auto text-xs">3</Badge>
                </>
              )}
            </Button>
          </Link>

          {/* Notifications */}
          <Link href="/notifications">
            <Button
              variant={isActiveItem("/notifications") ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-10",
                collapsed && "px-2 justify-center"
              )}
            >
              <Bell className="h-4 w-4 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="ml-3 flex-1 text-left">Notifications</span>
                  <Badge variant="secondary" className="ml-auto text-xs">5</Badge>
                </>
              )}
            </Button>
          </Link>

        </nav>
      </ScrollArea>
    </div>
  );
}