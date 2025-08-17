import React, { useState } from "react";
import Navigation from "./Navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, User, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
// import { useAuth } from "@/hooks/useAuth";

interface AppLayoutNewProps {
  children: React.ReactNode;
}

export default function AppLayoutNew({ children }: AppLayoutNewProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Mock user data for now
  const user = {
    firstName: "Admin",
    lastName: "User", 
    email: "admin@optistorepro.com"
  };
  const logout = () => console.log("Logout");

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Navigation 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients, appointments, orders..."
                className="pl-10 pr-4"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Actions */}
            <Button variant="outline" size="sm">
              Quick Sale
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main 
          className={cn(
            "flex-1 overflow-y-auto bg-background p-6 transition-all duration-300"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}