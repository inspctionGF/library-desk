import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Categories from "./pages/Categories";
import Tasks from "./pages/Tasks";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/books" element={<Books />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/classes" element={<ComingSoon title="Classes" description="Gérer les classes et niveaux scolaires." />} />
          <Route path="/participants" element={<ComingSoon title="Participants" description="Gérer les élèves avec accès par PIN." />} />
          <Route path="/loans" element={<ComingSoon title="Prêts" description="Suivre les prêts et retours de livres." />} />
          <Route path="/reports" element={<ComingSoon title="Rapports" description="Voir les tendances et statistiques." />} />
          <Route path="/settings" element={<ComingSoon title="Paramètres" description="Configurer les préférences système." />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;