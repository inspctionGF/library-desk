import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSystemConfig } from "@/hooks/useSystemConfig";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminLayoutContent } from "@/components/layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Categories from "./pages/Categories";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";
import Profiles from "./pages/Profiles";
import GuestPins from "./pages/GuestPins";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Reports from "./pages/Reports";
import ExtraActivities from "./pages/ExtraActivities";
import BookResumes from "./pages/BookResumes";
import Classes from "./pages/Classes";
import Participants from "./pages/Participants";
import ReadingSessions from "./pages/ReadingSessions";
import Loans from "./pages/Loans";
import Inventory from "./pages/Inventory";
import Materials from "./pages/Materials";
import OtherReaders from "./pages/OtherReaders";
import Help from "./pages/Help";
import Feedback from "./pages/Feedback";
import BookIssues from "./pages/BookIssues";
import About from "./pages/About";
import Notifications from "./pages/Notifications";
import AuditLog from "./pages/AuditLog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isConfigured } = useSystemConfig();
  const { isLoggedIn } = useAuth();

  // Step 1: Not configured -> Onboarding
  if (!isConfigured) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  // Step 2: Configured but not logged in -> Login
  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Step 3: Configured and logged in -> Full app
  const { isAdmin, isGuest } = useAuth();

  // Guest users only have access to books
  if (isGuest) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AdminSidebar />
          <Routes>
            <Route path="/books" element={<AdminLayoutContent><Books /></AdminLayoutContent>} />
            <Route path="*" element={<Navigate to="/books" replace />} />
          </Routes>
        </div>
      </SidebarProvider>
    );
  }

  // Admin has full access
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        <Routes>
          <Route path="/" element={<AdminLayoutContent><Dashboard /></AdminLayoutContent>} />
          <Route path="/books" element={<AdminLayoutContent><Books /></AdminLayoutContent>} />
          <Route path="/categories" element={<AdminLayoutContent><Categories /></AdminLayoutContent>} />
          <Route path="/book-resumes" element={<AdminLayoutContent><BookResumes /></AdminLayoutContent>} />
          <Route path="/tasks" element={<AdminLayoutContent><Tasks /></AdminLayoutContent>} />
          <Route path="/extra-activities" element={<AdminLayoutContent><ExtraActivities /></AdminLayoutContent>} />
          <Route path="/guest-pins" element={<AdminLayoutContent><GuestPins /></AdminLayoutContent>} />
          <Route path="/classes" element={<AdminLayoutContent><Classes /></AdminLayoutContent>} />
          <Route path="/participants" element={<AdminLayoutContent><Participants /></AdminLayoutContent>} />
          <Route path="/reading-sessions" element={<AdminLayoutContent><ReadingSessions /></AdminLayoutContent>} />
          <Route path="/loans" element={<AdminLayoutContent><Loans /></AdminLayoutContent>} />
          <Route path="/inventory" element={<AdminLayoutContent><Inventory /></AdminLayoutContent>} />
          <Route path="/materials" element={<AdminLayoutContent><Materials /></AdminLayoutContent>} />
          <Route path="/other-readers" element={<AdminLayoutContent><OtherReaders /></AdminLayoutContent>} />
          <Route path="/book-issues" element={<AdminLayoutContent><BookIssues /></AdminLayoutContent>} />
          <Route path="/reports" element={<AdminLayoutContent><Reports /></AdminLayoutContent>} />
          <Route path="/help" element={<AdminLayoutContent><Help /></AdminLayoutContent>} />
          <Route path="/feedback" element={<AdminLayoutContent><Feedback /></AdminLayoutContent>} />
          <Route path="/about" element={<AdminLayoutContent><About /></AdminLayoutContent>} />
          <Route path="/notifications" element={<AdminLayoutContent><Notifications /></AdminLayoutContent>} />
          <Route path="/audit-log" element={<AdminLayoutContent><AuditLog /></AdminLayoutContent>} />
          <Route path="/settings" element={<AdminLayoutContent><Settings /></AdminLayoutContent>} />
          <Route path="/profile" element={<AdminLayoutContent><Profile /></AdminLayoutContent>} />
          <Route path="/profiles" element={<AdminLayoutContent><Profiles /></AdminLayoutContent>} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/onboarding" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </SidebarProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
