import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Inbox from "./pages/Inbox";
import Resolved from "./pages/Resolved";
import Snoozed from "./pages/Snoozed";
import Agents from "./pages/Agents";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import QuickReplies from "./pages/QuickReplies";
import Contacts from "./pages/Contacts";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./components/AuthProvider";

const queryClient = new QueryClient();

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/app/inbox" replace />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="resolved" element={<Resolved />} />
        <Route path="snoozed" element={<Snoozed />} />
        <Route path="stats" element={<Stats />} />
        <Route path="agents" element={<Agents />} />
        <Route path="settings" element={<Settings />} />
        <Route path="replies" element={<QuickReplies />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="*" element={<div className="p-8 text-slate-500">Feature coming soon...</div>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;