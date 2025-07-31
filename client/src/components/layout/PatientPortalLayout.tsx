import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PatientPortalLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function PatientPortalLayout({ children, className }: PatientPortalLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-slate-50", className)}>
      {/* Clean patient portal without header/menu */}
      <main className="w-full h-full">
        <div className="max-w-7xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}