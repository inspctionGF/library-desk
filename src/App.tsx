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
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import ComingSoon from "./pages/ComingSoon";
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
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/guest-pins" element={<GuestPins />} />
      <Route path="/classes" element={<ComingSoon title="Classes" description="Gérer les classes et niveaux scolaires." />} />
      <Route path="/participants" element={<ComingSoon title="Participants" description="Gérer les élèves avec accès par PIN." />} />
      <Route path="/loans" element={<ComingSoon title="Prêts" description="Suivre les prêts et retours de livres." />} />
      <Route path="/reports" element={<ComingSoon title="Rapports" description="Voir les tendances et statistiques." />} />
      <Route path="/settings" element={<ComingSoon title="Paramètres" description="Configurer les préférences système." />} />
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
