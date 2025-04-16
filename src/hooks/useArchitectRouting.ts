
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface UseArchitectRoutingProps {
  user: User | null;
  setPostDialogOpen: (open: boolean) => void;
  postDesignRef: React.RefObject<HTMLDivElement>;
  followingTabRef: React.RefObject<HTMLButtonElement>;
}

export const useArchitectRouting = ({
  user,
  setPostDialogOpen,
  postDesignRef,
  followingTabRef
}: UseArchitectRoutingProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!user) {
      // Add a small delay before navigation to prevent abrupt transitions
      setTimeout(() => {
        navigate('/login');
      }, 300);
      return;
    }
    
    if (user.role !== 'architect') {
      // Add transition delay for role-based redirects
      setTimeout(() => {
        toast({
          title: "Access Restricted",
          description: "Redirecting to your dashboard...",
        });
        navigate('/homeowner-dashboard');
      }, 300);
      return;
    }
    
    // Handle hash-based navigation with smoother transitions
    if (location.hash === '#post-design') {
      // Delay opening the dialog to ensure smooth transition
      setTimeout(() => {
        setPostDialogOpen(true);
        if (postDesignRef.current) {
          postDesignRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
    } else if (location.hash === '#following') {
      // Delay the scroll to ensure elements are rendered
      setTimeout(() => {
        if (followingTabRef.current) {
          followingTabRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
    } else if (location.hash === '#ai-generator') {
      // Delay navigation to prevent screen flashing
      setTimeout(() => {
        navigate('/architect-dashboard/ai-generator');
      }, 300);
    }
  }, [user, navigate, location.hash, postDesignRef, followingTabRef, setPostDialogOpen, toast]);
  
  const getDefaultTab = () => {
    if (location.hash === '#following') return 'following';
    if (location.hash === '#post-design') {
      // Use a longer delay for opening dialog when it's the initial tab
      setTimeout(() => setPostDialogOpen(true), 500);
      return 'my-designs';
    }
    return 'my-designs';
  };
  
  return { getDefaultTab };
};
