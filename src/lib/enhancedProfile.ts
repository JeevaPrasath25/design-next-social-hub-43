
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

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
    
    if (error) throw error;
    
    return {
      ...data,
      role: data.role as User['role'],
      contact: data.contact_details
    } as User;
  } catch (error) {
    console.error('Error updating enhanced profile:', error);
    throw error;
  }
};

export const getArchitectPortfolio = async (architectId: string, currentUserId?: string) => {
  try {
    // Get architect's profile
    const { data: architect, error: architectError } = await supabase
      .from('users')
      .select('*')
      .eq('id', architectId)
      .eq('role', 'architect')
      .single();
    
    if (architectError) throw architectError;
    
    // Get architect's designs
    const { data: designs, error: designsError } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', architectId)
      .order('created_at', { ascending: false });
    
    if (designsError) throw designsError;
    
    // Check if current user is following this architect
    let isFollowing = false;
    
    if (currentUserId) {
      const { data: followData, error: followError } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', currentUserId)
        .eq('following_id', architectId)
        .maybeSingle();
      
      if (!followError && followData) {
        isFollowing = true;
      }
    }
    
    return {
      architect: {
        ...architect,
        role: architect.role as User['role'],
        contact: architect.contact_details,
        is_following: isFollowing
      } as User,
      designs
    };
  } catch (error) {
    console.error('Error fetching architect portfolio:', error);
    throw error;
  }
};
