
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { getSavedPosts, toggleLike, toggleSave } from '@/lib/supabase';
import { SavedPost, Post } from '@/types';
import DesignCard from '@/components/DesignCard';
import { useToast } from '@/components/ui/use-toast';
import { BookmarkIcon } from 'lucide-react';

const SavedPosts: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const posts = await getSavedPosts(user.id);
        setSavedPosts(posts);
      } catch (error) {
        console.error('Error fetching saved posts:', error);
        toast({
          title: "Error loading saved posts",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [user, toast]);

  const handleLike = async (post: Post) => {
    if (!user) return;

    try {
      await toggleLike(user.id, post.id, !!post.is_liked);
      
      // Update the post in the saved posts list
      setSavedPosts(prev => prev.map(savedPost => {
        if (savedPost.post?.id === post.id) {
          const newLikesCount = post.is_liked ? (post.likes_count || 1) - 1 : (post.likes_count || 0) + 1;
          return {
            ...savedPost,
            post: {
              ...savedPost.post,
              is_liked: !post.is_liked,
              likes_count: newLikesCount
            }
          };
        }
        return savedPost;
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Could not like the post",
        variant: "destructive",
      });
    }
  };

  const handleUnsave = async (post: Post) => {
    if (!user) return;

    try {
      await toggleSave(user.id, post.id, true);
      
      // Remove the post from the saved posts list
      setSavedPosts(prev => prev.filter(savedPost => savedPost.post?.id !== post.id));
      
      toast({
        title: "Removed from saved",
        description: "Design removed from your saved items",
      });
    } catch (error) {
      console.error('Error removing saved post:', error);
      toast({
        title: "Error",
        description: "Could not remove the post from saved",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Saved Designs</h1>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {!loading && savedPosts.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <BookmarkIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">No saved designs</h2>
              <p className="text-muted-foreground">
                You haven't saved any designs yet. Browse designs and click the bookmark icon to save them.
              </p>
            </div>
          )}
          
          {savedPosts.map(savedPost => savedPost.post && (
            <DesignCard 
              key={savedPost.id} 
              post={{ ...savedPost.post, is_saved: true }} 
              onLike={handleLike}
              onSave={handleUnsave}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default SavedPosts;
