
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

// Function to update the basic profile
export const updateProfile = async (userId: string, data: Partial<User>) => {
  try {
    // Convert contact to contact_details for database compatibility
    const dbUpdates = {
      ...data,
      contact_details: data.contact,
      updated_at: new Date().toISOString()
    };
    
    // Remove contact field from updates if it exists, as it doesn't exist in DB schema
    if (dbUpdates.contact) {
      delete dbUpdates.contact;
    }
    
    const { data: userData, error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      throw new Error(error.message || 'Error updating profile');
    }
    
    if (!userData) {
      throw new Error('No user data returned after update');
    }
    
    return {
      ...userData,
      contact: userData.contact_details
    } as User;
  } catch (error) {
    console.error('Error in updateProfile:', error);
    throw error;
  }
};

// Function to update the enhanced profile (education, experience, etc.)
export const updateEnhancedProfile = async (
  userId: string, 
  { education, experience, skills, contact_email, social_links }: Partial<User>
) => {
  try {
    const updates = {
      education,
      experience, 
      skills,
      contact_email,
      social_links,
      updated_at: new Date().toISOString()
    };
    
    // Filter out undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating enhanced profile:', error);
      throw new Error(error.message || 'Error updating enhanced profile');
    }
    
    if (!data) {
      throw new Error('No user data returned after update');
    }
    
    return {
      ...data,
      role: data.role,
      contact: data.contact_details
    } as User;
  } catch (error) {
    console.error('Error in updateEnhancedProfile:', error);
    throw error;
  }
};
