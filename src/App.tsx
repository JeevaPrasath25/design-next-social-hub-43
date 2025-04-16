import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ArchitectDashboard from "./pages/ArchitectDashboard";
import HomeownerDashboard from "./pages/HomeownerDashboard";
import HireArchitect from "./pages/HireArchitect";
import SavedPosts from "./pages/SavedPosts";
import CreatePost from "./pages/CreatePost";
import ArchitectDetail from "./pages/ArchitectDetail";
import PostDetail from "./pages/PostDetail";
import NotFound from "./pages/NotFound";
import { useAuth } from "./context/AuthContext";

// Initialize QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// A wrapper component to handle auth-based redirects
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Role-based redirect component
const RoleRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user.role === 'architect') {
    return <Navigate to="/architect-dashboard" />;
  }
  
  if (user.role === 'homeowner') {
    return <Navigate to="/homeowner-dashboard" />;
  }
  
  return <Navigate to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<RoleRedirect />} />
            <Route path="/profile" element={<RoleRedirect />} />
            
            {/* New Role-based Dashboard Routes */}
            <Route path="/architect-dashboard" element={
              <RequireAuth>
                <ArchitectDashboard />
              </RequireAuth>
            } />
            <Route path="/homeowner-dashboard" element={
              <RequireAuth>
                <HomeownerDashboard />
              </RequireAuth>
            } />
            <Route path="/hire/:architectId" element={
              <RequireAuth>
                <HireArchitect />
              </RequireAuth>
            } />
            
            {/* Existing Routes */}
            <Route path="/saved" element={<SavedPosts />} />
            <Route path="/post/create" element={<CreatePost />} />
            <Route path="/post/:postId" element={<PostDetail />} />
            <Route path="/architect/:architectId" element={<ArchitectDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
