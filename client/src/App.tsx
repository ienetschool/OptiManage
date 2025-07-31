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
import Login from "@/pages/Login";
import Sidebar from "@/components/layout/Sidebar";
import AppLayout from "@/components/layout/AppLayout";
import PublicLayout from "@/components/layout/PublicLayout";
import PatientPortalLayout from "@/components/layout/PatientPortalLayout";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }

  return (
    <Switch>
      {/* Patient Portal routes (clean UI without menu/top bar) */}
      <Route path="/patient-portal">
        <PatientPortalLayout>
          <Profile />
        </PatientPortalLayout>
      </Route>
      <Route path="/patient-portal/settings">
        <PatientPortalLayout>
          <Settings />
        </PatientPortalLayout>
      </Route>
      <Route path="/patient-portal/patients">
        <PatientPortalLayout>
          <Patients />
        </PatientPortalLayout>
      </Route>
      <Route path="/patient-portal/medical-records">
        <PatientPortalLayout>
          <MedicalRecords />
        </PatientPortalLayout>
      </Route>
      <Route path="/patient-portal/prescriptions">
        <PatientPortalLayout>
          <Prescriptions />
        </PatientPortalLayout>
      </Route>
      <Route path="/patient-portal/invoices">
        <PatientPortalLayout>
          <InvoiceManagement />
        </PatientPortalLayout>
      </Route>
      <Route path="/patient-portal/inventory">
        <PatientPortalLayout>
          <Inventory />
        </PatientPortalLayout>
      </Route>
      <Route path="/patient-portal/stores">
        <PatientPortalLayout>
          <Stores />
        </PatientPortalLayout>
      </Route>
      <Route path="/patient-portal/store-settings">
        <PatientPortalLayout>
          <StoreSettings />
        </PatientPortalLayout>
      </Route>
      <Route path="/patient-portal/staff">
        <PatientPortalLayout>
          <Staff />
        </PatientPortalLayout>
      </Route>
      <Route path="/patient-portal/attendance">
        <PatientPortalLayout>
          <Attendance />
        </PatientPortalLayout>
      </Route>
      <Route path="/patient-portal/payroll">
        <PatientPortalLayout>
          <Payroll />
        </PatientPortalLayout>
      </Route>
      <Route path="/patient-portal/communication">
        <PatientPortalLayout>
          <Communication />
        </PatientPortalLayout>
      </Route>
      <Route path="/patient-portal/notifications">
        <PatientPortalLayout>
          <Notifications />
        </PatientPortalLayout>
      </Route>

      {/* Public marketing pages */}
      <Route path="/login" component={Login} />
      <Route path="/about">
        <PublicLayout><About /></PublicLayout>
      </Route>
      <Route path="/features">
        <PublicLayout><Features /></PublicLayout>
      </Route>
      <Route path="/services">
        <PublicLayout><Services /></PublicLayout>
      </Route>
      <Route path="/reviews">
        <PublicLayout><Reviews /></PublicLayout>
      </Route>
      <Route path="/contact">
        <PublicLayout><Contact /></PublicLayout>
      </Route>
      <Route path="/terms">
        <PublicLayout><Terms /></PublicLayout>
      </Route>
      <Route path="/privacy">
        <PublicLayout><Privacy /></PublicLayout>
      </Route>
      <Route path="/book-appointment">
        <PublicLayout><BookAppointment /></PublicLayout>
      </Route>

      {/* Protected Dashboard routes - require authentication */}
      {!isAuthenticated ? (
        <Route path="/dashboard" component={Login} />
      ) : (
        <>
        <Route path="/dashboard">
          <AppLayout>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Dashboard />
            </div>
          </AppLayout>
        </Route>
      
      <Route path="/stores">
        <AppLayout>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Stores />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/inventory">
        <AppLayout>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Inventory />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/sales">
        <AppLayout>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Sales />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/appointments">
        <AppLayout>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Appointments />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/customers">
        <AppLayout>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Customers />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/patients">
        <AppLayout>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Patients />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/staff">
        <AppLayout>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Staff />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/attendance">
        <AppLayout>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Attendance />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/payroll">
        <AppLayout>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Payroll />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/notifications">
        <AppLayout>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Notifications />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/communication">
        <AppLayout>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Communication />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/settings">
        <AppLayout>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Settings />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/medical-records">
        <AppLayout>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <MedicalRecords />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/prescriptions">
        <AppLayout>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Prescriptions />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/invoices">
        <AppLayout>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <InvoiceManagement />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/store-settings">
        <AppLayout>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <StoreSettings />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/quick-sale">
        <AppLayout>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <QuickSale />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/payments">
        <AppLayout>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Payments />
          </div>
        </AppLayout>
      </Route>

        </>
      )}

      {/* Homepage - conditional based on authentication */}
      <Route path="/">
        {isAuthenticated ? (
          <AppLayout>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Dashboard />
            </div>
          </AppLayout>
        ) : (
          <PublicLayout><Home /></PublicLayout>
        )}
      </Route>
    </Switch>
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
