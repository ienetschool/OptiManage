import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Stores from "@/pages/Stores";
import Inventory from "@/pages/Inventory";
import Sales from "@/pages/Sales";
import Appointments from "@/pages/Appointments";
import Customers from "@/pages/Customers";
import Prescriptions from "@/pages/Prescriptions";
import Reports from "@/pages/Reports";
import Communication from "@/pages/Communication";
import Settings from "@/pages/Settings";
import Support from "@/pages/Support";
import Sidebar from "@/components/layout/Sidebar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/stores" component={Stores} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/sales" component={Sales} />
          <Route path="/appointments" component={Appointments} />
          <Route path="/customers" component={Customers} />
          <Route path="/prescriptions" component={Prescriptions} />
          <Route path="/reports" component={Reports} />
          <Route path="/communication" component={Communication} />
          <Route path="/settings" component={Settings} />
          <Route path="/support" component={Support} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
