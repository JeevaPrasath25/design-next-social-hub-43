
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
      throw error;
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
    const { data, error } = await supabase
      .from('users')
      .update({
        education,
        experience, 
        skills,
        contact_email,
        social_links,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating enhanced profile:', error);
      throw error;
    }
    
    return {
      ...data,
      role: data.role as User['role'],
      contact: data.contact_details
    } as User;
  } catch (error) {
    console.error('Error in updateEnhancedProfile:', error);
    throw error;
  }
};
