import { Switch, Route, useLocation } from "wouter";
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
import Patients from "@/pages/Patients";
import PatientManagement from "@/pages/PatientManagement";
import InvoiceManagement from "@/pages/InvoiceManagement";
import Prescriptions from "@/pages/Prescriptions";
import Billing from "@/pages/Billing";
import Staff from "@/pages/Staff";
import Attendance from "@/pages/Attendance";
import Payroll from "@/pages/Payroll";
import Notifications from "@/pages/Notifications";
import Reports from "@/pages/Reports";
import Communication from "@/pages/Communication";
import Settings from "@/pages/Settings";
import Support from "@/pages/Support";
import BookAppointment from "@/pages/BookAppointment";
import LeaveManagement from "@/pages/LeaveManagement";
import Analytics from "@/pages/Analytics";
import StorePerformance from "@/pages/StorePerformance";
import Profile from "@/pages/Profile";
import MedicalRecords from "@/pages/MedicalRecords";
import QuickSale from "@/pages/QuickSale";
import Payments from "@/pages/Payments";
import StoreSettings from "@/pages/StoreSettings";
import Pages from "@/pages/Pages";
import Themes from "@/pages/Themes";
import Domains from "@/pages/Domains";
import SEO from "@/pages/SEO";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Features from "@/pages/Features";
import Reviews from "@/pages/Reviews";
import Contact from "@/pages/Contact";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Services from "@/pages/Services";
import Sidebar from "@/components/layout/Sidebar";
import AppLayout from "@/components/layout/AppLayout";
import PublicLayout from "@/components/layout/PublicLayout";
import PatientPortalLayout from "@/components/layout/PatientPortalLayout";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // Define patient portal routes (clean UI without menu/top bar)
  const patientPortalRoutes = [
    '/patient-portal',
    '/patient-portal/settings',
    '/patient-portal/records', 
    '/patient-portal/appointments',
    '/patient-portal/prescriptions',
    '/patient-portal/invoices'
  ];

  const isPatientPortal = patientPortalRoutes.some(route => location.startsWith(route));

  if (isLoading || (!isAuthenticated && !isPatientPortal)) {
    return (
      <PublicLayout>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/features" component={Features} />
          <Route path="/services" component={Services} />
          <Route path="/services/:serviceType" component={Services} />
          <Route path="/reviews" component={Reviews} />
          <Route path="/contact" component={Contact} />
          <Route path="/terms" component={Terms} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/book-appointment" component={BookAppointment} />
          <Route component={NotFound} />
        </Switch>
      </PublicLayout>
    );
  }

  // Patient Portal routes (clean UI without menu/top bar)
  if (isPatientPortal) {
    return (
      <PatientPortalLayout>
        <Switch>
          <Route path="/patient-portal" component={Profile} />
          <Route path="/patient-portal/settings" component={Settings} />
          <Route path="/patient-portal/records" component={MedicalRecords} />
          <Route path="/patient-portal/appointments" component={Appointments} />
          <Route path="/patient-portal/prescriptions" component={Prescriptions} />
          <Route path="/patient-portal/invoices" component={InvoiceManagement} />
          <Route component={NotFound} />
        </Switch>
      </PatientPortalLayout>
    );
  }

  return (
    <AppLayout>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/stores" component={Stores} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/sales" component={InvoiceManagement} />
          <Route path="/appointments" component={PatientManagement} />
          <Route path="/customers" component={Customers} />
          <Route path="/patients" component={PatientManagement} />
          <Route path="/patient-management" component={PatientManagement} />
          <Route path="/medical-appointments" component={PatientManagement} />
          <Route path="/invoices" component={InvoiceManagement} />
          <Route path="/prescriptions" component={Prescriptions} />
          <Route path="/billing" component={InvoiceManagement} />
          <Route path="/invoice-management" component={InvoiceManagement} />
          <Route path="/staff" component={Staff} />
          <Route path="/attendance" component={Attendance} />
          <Route path="/payroll" component={Payroll} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/reports" component={Reports} />
          <Route path="/communication" component={Communication} />
          <Route path="/settings" component={Settings} />
          <Route path="/support" component={Support} />
          <Route path="/book-appointment" component={BookAppointment} />
          <Route path="/leave-management" component={LeaveManagement} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/store-performance" component={StorePerformance} />
          <Route path="/profile" component={Profile} />
          <Route path="/medical-records" component={MedicalRecords} />
          <Route path="/quick-sale" component={QuickSale} />
          <Route path="/payments" component={Payments} />
          <Route path="/store-settings" component={StoreSettings} />
          <Route path="/reports/sales" component={Reports} />
          <Route path="/reports/financial" component={Reports} />
          <Route path="/reports/patients" component={Reports} />
          <Route path="/pages" component={Pages} />
          <Route path="/themes" component={Themes} />
          <Route path="/domains" component={Domains} />
          <Route path="/seo" component={SEO} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </AppLayout>
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
