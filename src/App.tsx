import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Vocabularies from "./pages/Vocabularies";
import AddVocabulary from "./pages/AddVocabulary";
import BulkAddVocabulary from "./pages/BulkAddVocabulary";
import VocabularyDetail from "./pages/VocabularyDetail";
import ResourceDetail from "./pages/ResourceDetail";
import ResourcesGallery from "./pages/ResourcesGallery";
import AdminUsers from "./pages/AdminUsers";
import Favorites from "./pages/Favorites";
import DuplicateManager from "./pages/DuplicateManager";
import NotFound from "./pages/NotFound";
import { AdminRoute } from "@/components/AdminRoute";

import { LoadingSpinner } from "@/components/LoadingSpinner";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? <>{children}</> : <Navigate to="/auth" />;
};



import { Layout } from "@/components/Layout";
import { LandingLayout } from "@/components/LandingLayout";
import LandingPage from "./pages/LandingPage";

import IELTSDashboard from "./pages/ielts/IELTSDashboard";
import Speaking from "./pages/ielts/Speaking";
import Reading from "./pages/ielts/Reading";
import Writing from "./pages/ielts/Writing";
import Listening from "./pages/ielts/Listening";

const AppRoutes = () => {
  const { user, loading } = useAuth();

  return (
    <Routes>
      {/* Landing Page - No Sidebar/BottomNav (for non-authenticated users) */}
      <Route element={<LandingLayout />}>
        {/* Show LandingPage only if not authenticated */}
        <Route path="/" element={!loading && !user ? <LandingPage /> : <Navigate to="/home" replace />} />
        <Route path="/auth" element={<Auth />} />
      </Route>

      {/* App Pages - With Sidebar/BottomNav (for authenticated users) */}
      <Route element={<Layout />}>
        {/* Home dashboard with navigation bars */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/vocabularies" element={<ProtectedRoute><Vocabularies /></ProtectedRoute>} />
        <Route path="/vocabularies/add" element={<AdminRoute><AddVocabulary /></AdminRoute>} />
        <Route path="/vocabularies/bulk-add" element={<AdminRoute><BulkAddVocabulary /></AdminRoute>} />
        <Route path="/vocabularies/edit/:id" element={<AdminRoute><AddVocabulary /></AdminRoute>} />
        <Route path="/vocabularies/:id" element={<ProtectedRoute><VocabularyDetail /></ProtectedRoute>} />
        <Route path="/resources" element={<ProtectedRoute><ResourcesGallery /></ProtectedRoute>} />
        <Route path="/resources/:id" element={<ProtectedRoute><ResourceDetail /></ProtectedRoute>} />

        {/* Redirects from old grammar routes to new resources routes */}
        <Route path="/grammar" element={<Navigate to="/resources" replace />} />
        <Route path="/grammar/:id" element={<Navigate to="/resources/:id" replace />} />

        {/* IELTS Routes */}
        <Route path="/ielts" element={<ProtectedRoute><IELTSDashboard /></ProtectedRoute>} />
        <Route path="/ielts/speaking" element={<ProtectedRoute><Speaking /></ProtectedRoute>} />
        <Route path="/ielts/reading" element={<ProtectedRoute><Reading /></ProtectedRoute>} />
        <Route path="/ielts/writing" element={<ProtectedRoute><Writing /></ProtectedRoute>} />
        <Route path="/ielts/listening" element={<ProtectedRoute><Listening /></ProtectedRoute>} />

        {/* Redirect old admin routes to resources gallery */}
        <Route path="/admin/resources" element={<Navigate to="/resources" replace />} />
        <Route path="/admin/grammar" element={<Navigate to="/resources" replace />} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/duplicates" element={<AdminRoute><DuplicateManager /></AdminRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

import { NetworkStatus } from "@/components/NetworkStatus";

const App = () => {
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
