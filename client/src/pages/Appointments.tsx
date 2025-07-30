import Header from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function Appointments() {
  return (
    <>
      <Header 
        title="Appointment Management" 
        subtitle="Schedule and manage customer appointments across all locations." 
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-12 w-12 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Appointment Management</h3>
          <p className="text-slate-600 mb-6">This feature is under development.</p>
        </div>
      </main>
    </>
  );
}
