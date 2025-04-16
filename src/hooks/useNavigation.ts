
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const useNavigation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goToDashboard = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'architect') {
      navigate('/architect-dashboard');
    } else {
      navigate('/homeowner-dashboard');
    }
  };

  const goToAIGenerator = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'architect') {
      navigate('/architect-dashboard/ai-generator');
    } else {
      navigate('/homeowner-dashboard/ai-generator');
    }
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  const goToExploreArchitects = () => {
    navigate('/explore-architects');
  };

  return {
    goToDashboard,
    goToAIGenerator,
    goToProfile,
    goToExploreArchitects,
  };
};
