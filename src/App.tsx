import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Vocabularies from "./pages/Vocabularies";
import AddVocabulary from "./pages/AddVocabulary";
import VocabularyDetail from "./pages/VocabularyDetail";
import Grammar from "./pages/Grammar";
import AdminGrammar from "./pages/AdminGrammar";
import AdminUsers from "./pages/AdminUsers";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import { AdminRoute } from "@/components/AdminRoute";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useFcm } from "@/hooks/use-fcm";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? <>{children}</> : <Navigate to="/auth" />;
};



const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/vocabularies" element={<ProtectedRoute><Vocabularies /></ProtectedRoute>} />
      <Route path="/vocabularies/add" element={<AdminRoute><AddVocabulary /></AdminRoute>} />
      <Route path="/vocabularies/edit/:id" element={<AdminRoute><AddVocabulary /></AdminRoute>} />
      <Route path="/vocabularies/:id" element={<ProtectedRoute><VocabularyDetail /></ProtectedRoute>} />
      <Route path="/grammar" element={<ProtectedRoute><Grammar /></ProtectedRoute>} />
      <Route path="/admin/grammar" element={<AdminRoute><AdminGrammar /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

import { NetworkStatus } from "@/components/NetworkStatus";

const App = () => {
  useFcm();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <NetworkStatus />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
