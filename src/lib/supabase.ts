import { User, UserRole, Post, ProfileStats, Follower, SavedPost, Like, HiredArchitect } from '@/types';
import { supabase as configuredSupabase } from '@/integrations/supabase/client';

// Use the configured Supabase client from the integration
export const supabase = configuredSupabase;

// Auth functions
export const signUp = async (email: string, password: string, username: string, role: UserRole) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          role
        }
      }
    });

    if (authError) throw authError;

    // No need to manually create user profile here - it's handled by the trigger
    return { user: authData.user, session: authData.session };
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    // Get the user profile from the users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    
    // Cast role to UserRole type
    return {
      ...data,
      role: data.role as UserRole,
      contact: data.contact_details
    } as User;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Profile functions
export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Cast role to UserRole type
    return {
      ...data,
      role: data.role as UserRole,
      contact: data.contact_details
    } as User;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const getProfileStats = async (userId: string, currentUserId?: string): Promise<ProfileStats> => {
  try {
    // Get followers count
    const { count: followersCount, error: followersError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);
    
    if (followersError) throw followersError;
    
    // Get following count
    const { count: followingCount, error: followingError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);
    
    if (followingError) throw followingError;
    
    // Get designs count
    const { count: designsCount, error: designsError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (designsError) throw designsError;
    
    // Check if current user is following this profile
    let isFollowing = false;
    let isHired = false;
    
    if (currentUserId) {
      const { data: followData, error: followError } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', currentUserId)
        .eq('following_id', userId)
        .single();
      
      if (!followError && followData) {
        isFollowing = true;
      }
      
      // Check if architect is hired by homeowner
      const { data: hiredData, error: hiredError } = await supabase
        .from('hired_architects')
        .select('*')
        .eq('homeowner_id', currentUserId)
        .eq('architect_id', userId)
        .single();
      
      if (!hiredError && hiredData) {
        isHired = true;
      }
    }
    
    return {
      followers_count: followersCount || 0,
      following_count: followingCount || 0,
      designs_count: designsCount || 0,
      is_following: isFollowing,
      is_hired: isHired
    };
  } catch (error) {
    console.error('Error getting profile stats:', error);
    throw error;
  }
};

// Post functions
export const createPost = async (postData: Partial<Post>, imageFile: File) => {
  try {
    // 1. Upload image to storage
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `designs/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('designs')
      .upload(filePath, imageFile);
    
    if (uploadError) throw uploadError;
    
    // 2. Get the public URL for the uploaded image
    const { data: urlData } = supabase.storage
      .from('designs')
      .getPublicUrl(filePath);
    
    const imageUrl = urlData.publicUrl;
    
    // 3. Create post in the database with additional fields
    // Ensure required fields are present
    if (!postData.title || !postData.user_id) {
      throw new Error("Title and user_id are required for creating a post");
    }
    
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: postData.title,
        description: postData.description || null,
        image_url: imageUrl,
        user_id: postData.user_id,
        design_type: postData.design_type || 'Residential',
        tags: postData.tags || [],
        hire_me: postData.hire_me || false
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const getPosts = async (userId?: string) => {
  try {
    let query = supabase
      .from('posts')
      .select(`
        *,
        user:users(*)
      `)
      .order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Transform data to match our types
    return data.map(post => ({
      ...post,
      user: post.user ? {
        ...post.user,
        role: post.user.role as UserRole,
        contact: post.user.contact_details
      } : undefined
    })) as Post[];
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
};

export const getPostWithLikeAndSaveStatus = async (postId: string, userId: string) => {
  try {
    // Get post details
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(*)
      `)
      .eq('id', postId)
      .single();
    
    if (postError) throw postError;
    
    // Check if user has liked the post
    const { data: likeData, error: likeError } = await supabase
      .from('likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();
    
    // Check if user has saved the post
    const { data: saveData, error: saveError } = await supabase
      .from('saved_posts')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();
    
    // Get like count
    const { count: likesCount, error: countError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);
    
    if (countError) throw countError;
    
    return {
      ...post,
      user: post.user ? {
        ...post.user,
        role: post.user.role as UserRole,
        contact: post.user.contact_details
      } : undefined,
      is_liked: !!likeData,
      is_saved: !!saveData,
      likes_count: likesCount || 0
    } as Post;
  } catch (error) {
    console.error('Error getting post with status:', error);
    throw error;
  }
};

// Interaction functions
export const toggleFollow = async (followerId: string, followingId: string, isFollowing: boolean) => {
  try {
    if (isFollowing) {
      // Unfollow
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);
      
      if (error) throw error;
    } else {
      // Follow
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: followerId,
          following_id: followingId
        });
      
      if (error) throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error toggling follow:', error);
    throw error;
  }
};

export const toggleLike = async (userId: string, postId: string, isLiked: boolean) => {
  try {
    if (isLiked) {
      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);
      
      if (error) throw error;
    } else {
      // Like
      const { error } = await supabase
        .from('likes')
        .insert({
          user_id: userId,
          post_id: postId
        });
      
      if (error) throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

export const toggleSave = async (userId: string, postId: string, isSaved: boolean) => {
  try {
    if (isSaved) {
      // Unsave
      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);
      
      if (error) throw error;
    } else {
      // Save
      const { error } = await supabase
        .from('saved_posts')
        .insert({
          user_id: userId,
          post_id: postId
        });
      
      if (error) throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error toggling save:', error);
    throw error;
  }
};

export const hireArchitect = async (homeownerId: string, architectId: string) => {
  try {
    const { error } = await supabase
      .from('hired_architects')
      .insert({
        homeowner_id: homeownerId,
        architect_id: architectId
      });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error hiring architect:', error);
    throw error;
  }
};

// Update toggleHireStatus function for architects to toggle hire_me status
export const toggleHireStatus = async (postId: string, currentStatus: boolean) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .update({ hire_me: !currentStatus })
      .eq('id', postId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error toggling hire status:', error);
    throw error;
  }
};

// Get follows/followers
export const getFollowers = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        *,
        follower:users!follower_id(*)
      `)
      .eq('following_id', userId);
    
    if (error) throw error;
    
    return data.map(item => ({
      ...item,
      follower: item.follower ? {
        ...item.follower,
        role: item.follower.role as UserRole,
        contact: item.follower.contact_details
      } : undefined
    })) as Follower[];
  } catch (error) {
    console.error('Error getting followers:', error);
    throw error;
  }
};

export const getFollowing = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        *,
        following:users!following_id(*)
      `)
      .eq('follower_id', userId);
    
    if (error) throw error;
    
    return data.map(item => ({
      ...item,
      following: item.following ? {
        ...item.following,
        role: item.following.role as UserRole,
        contact: item.following.contact_details
      } : undefined
    }));
  } catch (error) {
    console.error('Error getting following:', error);
    throw error;
  }
};

// Get saved posts
export const getSavedPosts = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('saved_posts')
      .select(`
        *,
        post:posts(*, user:users(*))
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return data.map(item => ({
      ...item,
      post: item.post ? {
        ...item.post,
        user: item.post.user ? {
          ...item.post.user,
          role: item.post.user.role as UserRole,
          contact: item.post.user.contact_details
        } : undefined
      } : undefined
    })) as SavedPost[];
  } catch (error) {
    console.error('Error getting saved posts:', error);
    throw error;
  }
};

// Get architects
export const getArchitects = async (currentUserId?: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'architect');
    
    if (error) throw error;
    
    // Map data to match our User type
    const architectsWithRoleCast = data.map(architect => ({
      ...architect,
      role: architect.role as UserRole,
      contact: architect.contact_details
    })) as User[];
    
    // If current user is provided, check following and hired status for each architect
    if (currentUserId) {
      const architects = await Promise.all(
        architectsWithRoleCast.map(async (architect) => {
          const stats = await getProfileStats(architect.id, currentUserId);
          return {
            ...architect,
            is_following: stats.is_following,
            is_hired: stats.is_hired
          };
        })
      );
      
      return architects;
    }
    
    return architectsWithRoleCast;
  } catch (error) {
    console.error('Error getting architects:', error);
    throw error;
  }
};

// Get hired architects
export const getHiredArchitects = async (homeownerId: string) => {
  try {
    const { data, error } = await supabase
      .from('hired_architects')
      .select(`
        *,
        architect:users!architect_id(*)
      `)
      .eq('homeowner_id', homeownerId);
    
    if (error) throw error;
    
    return data.map(item => ({
      ...item,
      architect: item.architect ? {
        ...item.architect,
        role: item.architect.role as UserRole,
        contact: item.architect.contact_details
      } : undefined
    })) as HiredArchitect[];
  } catch (error) {
    console.error('Error getting hired architects:', error);
    throw error;
  }
};
