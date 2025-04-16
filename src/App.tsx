
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import AuthRequired from "@/components/AuthRequired";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ArchitectDashboard from "./pages/ArchitectDashboard";
import HomeownerDashboard from "./pages/HomeownerDashboard";
import HireArchitect from "./pages/HireArchitect";
import SavedPosts from "./pages/SavedPosts";
import CreatePost from "./pages/CreatePost";
import ArchitectDetail from "./pages/ArchitectDetail";
import PostDetail from "./pages/PostDetail";
import NotFound from "./pages/NotFound";
import Architects from "./pages/Architects";
import ExploreArchitects from "./pages/ExploreArchitects";
import Profile from "./pages/Profile";
import AIDesignGenerator from "./pages/AIDesignGenerator";

// Initialize QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Role-Based Dashboard Routes */}
            <Route path="/architect-dashboard" element={
              <AuthRequired allowedRoles={['architect']}>
                <ArchitectDashboard />
              </AuthRequired>
            } />
            <Route path="/homeowner-dashboard" element={
              <AuthRequired allowedRoles={['homeowner']}>
                <HomeownerDashboard />
              </AuthRequired>
            } />
            
            {/* AI Design Generator Routes */}
            <Route path="/architect-dashboard/ai-generator" element={
              <AuthRequired allowedRoles={['architect']}>
                <AIDesignGenerator />
              </AuthRequired>
            } />
            <Route path="/homeowner-dashboard/ai-generator" element={
              <AuthRequired allowedRoles={['homeowner']}>
                <AIDesignGenerator />
              </AuthRequired>
            } />
            
            {/* Profile Route */}
            <Route path="/profile" element={
              <AuthRequired>
                <Profile />
              </AuthRequired>
            } />
            
            {/* Protected Routes */}
            <Route path="/hire/:architectId" element={
              <AuthRequired allowedRoles={['homeowner']}>
                <HireArchitect />
              </AuthRequired>
            } />
            <Route path="/saved" element={
              <AuthRequired>
                <SavedPosts />
              </AuthRequired>
            } />
            <Route path="/post/create" element={
              <AuthRequired allowedRoles={['architect']}>
                <CreatePost />
              </AuthRequired>
            } />
            <Route path="/post/:postId" element={<PostDetail />} />
            <Route path="/architect/:architectId" element={<ArchitectDetail />} />
            <Route path="/architects" element={<Architects />} />
            <Route path="/explore-architects" element={<ExploreArchitects />} />
            
            {/* Dashboard redirect */}
            <Route path="/dashboard" element={<Navigate to="/homeowner-dashboard" replace />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
