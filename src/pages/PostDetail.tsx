
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Bookmark, ArrowLeft, User, AlertCircle } from 'lucide-react';
import { Post } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { getPostWithLikeAndSaveStatus, toggleLike, toggleSave } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId || !user) return;

      try {
        setLoading(true);
        const fetchedPost = await getPostWithLikeAndSaveStatus(postId, user.id);
        setPost(fetchedPost);
      } catch (error) {
        console.error('Error fetching post:', error);
        toast({
          title: "Error loading design",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, user, toast]);

  const handleLike = async () => {
    if (!user || !post) return;

    try {
      await toggleLike(user.id, post.id, !!post.is_liked);
      setPost({
        ...post,
        is_liked: !post.is_liked,
        likes_count: post.is_liked 
          ? (post.likes_count || 1) - 1 
          : (post.likes_count || 0) + 1
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Could not like the design",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!user || !post) return;

    try {
      await toggleSave(user.id, post.id, !!post.is_saved);
      setPost({
        ...post,
        is_saved: !post.is_saved
      });
      
      toast({
        title: post.is_saved ? "Removed from saved" : "Saved successfully",
        description: post.is_saved 
          ? "Design removed from your saved items" 
          : "Design added to your saved items",
      });
    } catch (error) {
      console.error('Error toggling save:', error);
      toast({
        title: "Error",
        description: "Could not save the design",
        variant: "destructive",
      });
    }
  };

  if (!post && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container px-4 py-8">
          <div className="max-w-md mx-auto text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">Design not found</h2>
            <p className="text-muted-foreground mb-6">
              The design you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        {post && (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <img 
                src={post.image_url} 
                alt={post.title} 
                className="w-full h-auto object-cover"
              />
            </div>
            
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
                {post.user && (
                  <Link 
                    to={`/architect/${post.user.id}`} 
                    className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <User size={14} className="mr-1" />
                    {post.user.username}
                  </Link>
                )}
              </div>
              
              <Card>
                <CardContent className="pt-6">
                  <p className="whitespace-pre-line">{post.description}</p>
                </CardContent>
              </Card>
              
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center space-x-2"
                  onClick={handleLike}
                >
                  <Heart 
                    size={18} 
                    className={post.is_liked ? "fill-red-500 text-red-500" : ""} 
                  />
                  <span>{post.likes_count || 0}</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center space-x-2"
                  onClick={handleSave}
                >
                  <Bookmark 
                    size={18} 
                    className={post.is_saved ? "fill-primary text-primary" : ""} 
                  />
                  <span>{post.is_saved ? "Saved" : "Save"}</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PostDetail;
