
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookmarkIcon, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import DesignCard from '@/components/DesignCard';
import { Post } from '@/types';
import { getSavedPosts, toggleLike, toggleSave, toggleFollow, hireArchitect } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const SavedPosts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const savedPostsData = await getSavedPosts(user.id);
        setSavedPosts(savedPostsData.map(sp => ({
          ...sp.post!,
          is_saved: true
        })));
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
      setSavedPosts(prev => prev.map(p => {
        if (p.id === post.id) {
          const newLikesCount = post.is_liked 
            ? (post.likes_count || 1) - 1 
            : (post.likes_count || 0) + 1;
          return { ...p, is_liked: !post.is_liked, likes_count: newLikesCount };
        }
        return p;
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

  const handleSave = async (post: Post) => {
    if (!user) return;
    
    try {
      await toggleSave(user.id, post.id, true); // Always unsave since these are saved posts
      setSavedPosts(prev => prev.filter(p => p.id !== post.id));
      
      toast({
        title: "Post unsaved",
        description: "The post has been removed from your saved collection",
      });
    } catch (error) {
      console.error('Error unsaving post:', error);
      toast({
        title: "Error",
        description: "Could not unsave the post",
        variant: "destructive",
      });
    }
  };

  const handleFollow = async (userId: string, isFollowing: boolean) => {
    if (!user) return;
    
    try {
      await toggleFollow(user.id, userId, isFollowing);
      
      // Update the posts list to reflect the new following status
      setSavedPosts(prev => prev.map(p => {
        if (p.user?.id === userId) {
          return {
            ...p,
            user: {
              ...p.user,
              is_following: !isFollowing
            }
          };
        }
        return p;
      }));
      
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing 
          ? "You are no longer following this architect" 
          : "You are now following this architect",
      });
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Could not update follow status",
        variant: "destructive",
      });
    }
  };

  const handleHire = async (architectId: string) => {
    if (!user) return;
    
    try {
      await hireArchitect(user.id, architectId);
      
      // Update posts to reflect hired status
      setSavedPosts(prev => prev.map(p => {
        if (p.user?.id === architectId) {
          return {
            ...p,
            user: {
              ...p.user,
              is_hired: true
            }
          };
        }
        return p;
      }));
      
      toast({
        title: "Architect hired",
        description: "You have successfully hired this architect",
      });
    } catch (error) {
      console.error('Error hiring architect:', error);
      toast({
        title: "Error",
        description: "Could not hire the architect",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookmarkIcon className="h-5 w-5" /> Saved Designs
          </h1>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p>Loading your saved designs...</p>
          </div>
        ) : savedPosts.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No saved designs</CardTitle>
              <CardDescription>
                You haven't saved any designs yet. Browse the designs and save the ones you like.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate(user?.role === 'architect' ? '/architect-dashboard' : '/homeowner-dashboard')}
              >
                Browse Designs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedPosts.map(post => (
              <DesignCard 
                key={post.id} 
                post={post} 
                currentUser={user}
                onLike={handleLike}
                onSave={handleSave}
                onFollow={handleFollow}
                onHire={handleHire}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedPosts;
