
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '@/types';

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
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'architect') {
      navigate('/homeowner-dashboard');
      return;
    }
    
    if (location.hash === '#post-design') {
      setPostDialogOpen(true);
      if (postDesignRef.current) {
        postDesignRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (location.hash === '#following') {
      if (followingTabRef.current) {
        followingTabRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (location.hash === '#ai-generator') {
      navigate('/architect-dashboard/ai-generator');
    }
  }, [user, navigate, location.hash, postDesignRef, followingTabRef, setPostDialogOpen]);
  
  const getDefaultTab = () => {
    if (location.hash === '#following') return 'following';
    if (location.hash === '#post-design') {
      setTimeout(() => setPostDialogOpen(true), 300);
      return 'my-designs';
    }
    return 'my-designs';
  };
  
  return { getDefaultTab };
};
