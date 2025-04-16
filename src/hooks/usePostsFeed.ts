
import { useState, useEffect } from 'react';
import { Post, User } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export const usePostsFeed = (userId?: string, followedOnly = false) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('posts')
          .select(`
            *,
            user:users(*)
          `)
          .order('created_at', { ascending: false });
        
        // If we want only posts from architects the user follows
        if (followedOnly && userId) {
          query = query.in('user_id', 
            supabase
              .from('follows')
              .select('following_id')
              .eq('follower_id', userId)
          );
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Format the posts
        const formattedPosts = data.map(post => ({
          ...post,
          user: post.user ? {
            ...post.user,
            role: post.user.role as UserRole,
            contact: post.user.contact_details
          } : undefined
        })) as Post[];
        
        setPosts(formattedPosts);
      } catch (error) {
        console.error('Error fetching posts feed:', error);
        toast({
          title: "Error loading posts",
          description: "Could not load the design posts feed",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [userId, followedOnly, toast]);

  return { posts, loading };
};
