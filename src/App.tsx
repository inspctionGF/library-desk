import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSystemConfig } from "@/hooks/useSystemConfig";
import { useAuth } from "@/hooks/useAuth";
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
import ComingSoon from "./pages/ComingSoon";
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
      <Routes>
        <Route path="/books" element={<Books />} />
        <Route path="*" element={<Navigate to="/books" replace />} />
      </Routes>
    );
  }

  // Admin has full access
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/books" element={<Books />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/book-resumes" element={<BookResumes />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/extra-activities" element={<ExtraActivities />} />
      <Route path="/guest-pins" element={<GuestPins />} />
      <Route path="/classes" element={<Classes />} />
      <Route path="/participants" element={<Participants />} />
      <Route path="/reading-sessions" element={<ReadingSessions />} />
      <Route path="/loans" element={<Loans />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/materials" element={<Materials />} />
      <Route path="/other-readers" element={<OtherReaders />} />
      <Route path="/book-issues" element={<BookIssues />} />
      <Route path="/reports" element={<ComingSoon title="Rapports" description="Voir les tendances et statistiques." />} />
      <Route path="/help" element={<Help />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/about" element={<About />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/audit-log" element={<AuditLog />} />
        <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profiles" element={<Profiles />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/onboarding" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
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
