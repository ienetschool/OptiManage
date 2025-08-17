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

import Appointments from "@/pages/Appointments";
import Customers from "@/pages/Customers";
import Patients from "@/pages/Patients";
import PatientManagement from "@/pages/PatientManagement";
import InvoiceManagement from "@/pages/InvoiceManagement";
import PrescriptionsFixed from "@/pages/PrescriptionsFixed";
import SpecsWorkflow from "@/pages/SpecsWorkflowSimple";
import SpecsOrderCreation from "@/pages/SpecsOrderCreationSimple";
import LensCuttingWorkflow from "@/pages/LensCuttingWorkflowSimple";
import Billing from "@/pages/Billing";
import Staff from "@/pages/Staff";
import Attendance from "@/pages/Attendance";
import Payroll from "@/pages/Payroll";
import Communication from "@/pages/Communication";
import Notifications from "@/pages/Notifications";
import Reports from "@/pages/Reports";
import CustomReports from "@/pages/CustomReports";
import Settings from "@/pages/Settings";
import Support from "@/pages/Support";
import BookAppointment from "@/pages/BookAppointment";
import LeaveManagement from "@/pages/LeaveManagement";
import Analytics from "@/pages/Analytics";
import StorePerformance from "@/pages/StorePerformance";
import Profile from "@/pages/Profile";


import Payments from "@/pages/Payments";
import StoreSettings from "@/pages/StoreSettings";
import Pages from "@/pages/Pages";
import Themes from "@/pages/Themes";
import Domains from "@/pages/Domains";
import SEO from "@/pages/SEO";
import AdvancedReports from "@/pages/AdvancedReports";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Features from "@/pages/Features";
import Reviews from "@/pages/Reviews";
import Contact from "@/pages/Contact";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Services from "@/pages/Services";
import Login from "@/pages/Login";
import AuthPage from "@/pages/AuthPage";
import QuickLogin from "@/pages/QuickLogin";
import SidebarFixed from "@/components/layout/SidebarFixed";
import AppLayout from "@/components/layout/AppLayout";
import InstallWizardSimple from "@/pages/InstallWizardSimple";
import TestPage from "@/pages/TestPage";
import PublicLayout from "@/components/layout/PublicLayout";
import PatientPortalLayout from "@/components/layout/PatientPortalLayout";
import PrintPreview from "@/pages/PrintPreview";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }

  return (
    <Switch>
      {/* Installation Wizard Route - Now handled by server */}
      
      {/* Print Preview Route - Standalone for direct printing */}
      <Route path="/print-preview/:invoiceId?">
        <PrintPreview />
      </Route>
      
      {/* Patient Portal routes (clean UI without menu/top bar) */}
      <Route path="/patient-portal">
        <PatientPortalLayout title="Patient Portal" description="Access your medical information and services">
          <Profile />
        </PatientPortalLayout>
      </Route>
      <Route path="/patient-portal/settings">
        <PatientPortalLayout title="Settings" description="Manage your account preferences">
          <Settings />
        </PatientPortalLayout>
      </Route>
      <Route path="/patient-portal/patients">
        <PatientPortalLayout title="Patient Information" description="View and update your patient details">
          <Patients />
        </PatientPortalLayout>
      </Route>

      <Route path="/patient-portal/prescriptions">
        <PatientPortalLayout title="Prescriptions" description="View your current and past prescriptions">
          <PrescriptionsFixed />
        </PatientPortalLayout>
      </Route>
      <Route path="/patient-portal/invoices">
        <PatientPortalLayout title="Invoices & Billing" description="View and manage your medical invoices">
          <InvoiceManagement />
        </PatientPortalLayout>
      </Route>
      <Route path="/patient-portal/appointments">
        <PatientPortalLayout title="Appointments" description="Schedule and manage your appointments">
          <Appointments />
        </PatientPortalLayout>
      </Route>

      {/* Public marketing pages */}
      <Route path="/login" component={Login} />
      <Route path="/auth" component={Login} />
      <Route path="/auth-page" component={AuthPage} />
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
      
      {/* Public website homepage */}
      <Route path="/home">
        <PublicLayout><Home /></PublicLayout>
      </Route>

      {/* Dashboard routes */}
      <Route path="/dashboard">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Dashboard />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/stores">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Stores />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/inventory">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Inventory />
          </div>
        </AppLayout>
      </Route>
      

      

      
      <Route path="/customers">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Customers />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/patients">
        {isAuthenticated ? (
          <AppLayout>
            <SidebarFixed />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Patients />
            </div>
          </AppLayout>
        ) : (
          <QuickLogin />
        )}
      </Route>
      
      <Route path="/patient-management">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <PatientManagement />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/prescriptions">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <PrescriptionsFixed />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/specs-workflow">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <SpecsWorkflow />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/specs-order-creation">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <SpecsOrderCreation />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/lens-cutting-workflow">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <LensCuttingWorkflow />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/invoices">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <InvoiceManagement />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/billing">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Billing />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/staff">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Staff />
          </div>
        </AppLayout>
      </Route>

      <Route path="/attendance">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Attendance />
          </div>
        </AppLayout>
      </Route>

      <Route path="/payroll">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Payroll />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/attendance">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Attendance />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/payroll">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Payroll />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/leave-management">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <LeaveManagement />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/reports">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Reports />
          </div>
        </AppLayout>
      </Route>

      <Route path="/custom-reports">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <CustomReports />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/analytics">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Analytics />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/store-performance">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <StorePerformance />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/communication">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Communication />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/notifications">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Notifications />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/profile">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Profile />
          </div>
        </AppLayout>
      </Route>
      

      
      <Route path="/settings">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Settings />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/support">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Support />
          </div>
        </AppLayout>
      </Route>
      
      <Route path="/store-settings">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <StoreSettings />
          </div>
        </AppLayout>
      </Route>
      

      
      <Route path="/payments">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Payments />
          </div>
        </AppLayout>
      </Route>

      <Route path="/pages">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Pages />
          </div>
        </AppLayout>
      </Route>

      <Route path="/themes">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Themes />
          </div>
        </AppLayout>
      </Route>

      <Route path="/domains">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Domains />
          </div>
        </AppLayout>
      </Route>

      <Route path="/seo">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-y-auto">
            <SEO />
          </div>
        </AppLayout>
      </Route>

      <Route path="/advanced-reports">
        <AppLayout>
          <SidebarFixed />
          <div className="flex-1 flex flex-col overflow-hidden">
            <AdvancedReports />
          </div>
        </AppLayout>
      </Route>

      {/* Homepage - conditional based on authentication */}
      <Route path="/">
        {isAuthenticated ? (
          <AppLayout>
            <SidebarFixed />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Dashboard />
            </div>
          </AppLayout>
        ) : (
          <PublicLayout><Home /></PublicLayout>
        )}
      </Route>
      
      <Route component={NotFound} />
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