import Header from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function Inventory() {
  return (
    <>
      <Header 
        title="Inventory Management" 
        subtitle="Track and manage your product inventory across all store locations." 
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-12 w-12 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Inventory Management</h3>
          <p className="text-slate-600 mb-6">This feature is under development.</p>
        </div>
      </main>
    </>
  );
}
