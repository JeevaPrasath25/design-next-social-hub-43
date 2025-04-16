
import { useState } from 'react';
import { User } from '@/types';
import { updateUserProfile } from '@/lib/supabase';
import { updateEnhancedProfile } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export const useProfileForms = (user: User, toast: any) => {
  const [loading, setLoading] = useState(false);
  const [enhancedLoading, setEnhancedLoading] = useState(false);
  const { updateUser: updateAuthUser } = useAuth();

  const onGeneralSubmit = async (data: any) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const updatedUser = await updateUserProfile(user.id, data);
      updateAuthUser(updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred during update",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onAboutMeSubmit = async (data: any) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const updatedUser = await updateUserProfile(user.id, data);
      updateAuthUser(updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your bio has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred during update",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onEnhancedSubmit = async (data: any) => {
    if (!user) return;
    
    try {
      setEnhancedLoading(true);
      const updatedUser = await updateEnhancedProfile(user.id, data);
      updateAuthUser({...user, ...updatedUser});
      
      toast({
        title: "Professional details updated",
        description: "Your professional information has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred during update",
        variant: "destructive",
      });
    } finally {
      setEnhancedLoading(false);
    }
  };

  return {
    loading,
    enhancedLoading,
    onGeneralSubmit,
    onAboutMeSubmit,
    onEnhancedSubmit,
    updateUser: updateAuthUser
  };
};
