
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@/types';
import { updateEnhancedProfile } from '@/lib/api';
import { EnhancedProfileFormValues, enhancedProfileSchema } from '@/components/dashboard/profile/EnhancedProfileForm';
import { useToast } from '@/hooks/use-toast';

// Define the toast function type based on what's returned from useToast
interface ToastType {
  toast: (props: {
    title: string;
    description: string;
    variant?: "default" | "destructive";
  }) => void;
}

export const useEnhancedProfileForm = (user: User, toast: ToastType, updateUser: (user: User) => void) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const form = useForm<EnhancedProfileFormValues>({
    resolver: zodResolver(enhancedProfileSchema),
    defaultValues: {
      education: user?.education || '',
      experience: user?.experience || '',
      skills: user?.skills || '',
      contact_email: user?.contact_email || '',
      social_links: user?.social_links || '',
    },
  });

  const handleSubmit = async (data: EnhancedProfileFormValues) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Update enhanced profile in Supabase
      const updatedUser = await updateEnhancedProfile(user.id, data);
      
      // Update user context with new data
      updateUser({
        ...user,
        ...updatedUser
      });
      
      toast.toast({
        title: "Professional details updated",
        description: "Your professional information has been updated successfully",
      });
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating enhanced profile:', error);
      toast.toast({
        title: "Update failed",
        description: error.message || "An error occurred during update",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    isEditing,
    setIsEditing,
    handleSubmit
  };
};
