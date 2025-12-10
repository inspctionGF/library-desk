import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Categories from "./pages/Categories";
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
          <Route path="/classes" element={<ComingSoon title="Classes" description="Manage school grades and classes." />} />
          <Route path="/participants" element={<ComingSoon title="Participants" description="Manage students with PIN-based access." />} />
          <Route path="/loans" element={<ComingSoon title="Loans" description="Track book loans and returns." />} />
          <Route path="/reports" element={<ComingSoon title="Reports" description="View borrowing trends and statistics." />} />
          <Route path="/settings" element={<ComingSoon title="Settings" description="Configure system preferences." />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
