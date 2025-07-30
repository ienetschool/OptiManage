import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import NotificationModal from "@/components/modals/NotificationModal";
import QuickSaleModal from "@/components/modals/QuickSaleModal";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickSale, setShowQuickSale] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            <p className="text-slate-600">{subtitle}</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(true)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  3
                </Badge>
              </Button>
            </div>
            
            {/* Quick Sale */}
            <Button onClick={() => setShowQuickSale(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Quick Sale
            </Button>
          </div>
        </div>
      </header>

      <NotificationModal 
        open={showNotifications} 
        onOpenChange={setShowNotifications} 
      />
      <QuickSaleModal 
        open={showQuickSale} 
        onOpenChange={setShowQuickSale} 
      />
    </>
  );
}
