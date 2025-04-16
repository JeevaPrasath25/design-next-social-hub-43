
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HeartIcon, BookmarkIcon, ArrowLeft, UserCheck, UserPlus, BriefcaseIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Post } from '@/types';
import { getPostWithLikeAndSaveStatus, toggleLike, toggleSave, toggleFollow, hireArchitect } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      try {
        setLoading(true);
        
        // If user is logged in, get like and save status
        if (user) {
          const postData = await getPostWithLikeAndSaveStatus(postId, user.id);
          setPost(postData);
        } else {
          // Basic post fetch if user is not logged in
          const { data } = await fetch(`/api/posts/${postId}`).then(res => res.json());
          setPost(data);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        toast({
          title: "Error loading post",
          description: "Could not load the post details",
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
      setPost(prev => {
        if (!prev) return prev;
        
        const newLikesCount = prev.is_liked 
          ? (prev.likes_count || 1) - 1 
          : (prev.likes_count || 0) + 1;
        
        return { ...prev, is_liked: !prev.is_liked, likes_count: newLikesCount };
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Could not like the post",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!user || !post) return;
    
    try {
      await toggleSave(user.id, post.id, !!post.is_saved);
      setPost(prev => {
        if (!prev) return prev;
        return { ...prev, is_saved: !prev.is_saved };
      });
      
      toast({
        title: post.is_saved ? "Post unsaved" : "Post saved",
        description: post.is_saved 
          ? "The post has been removed from your saved collection" 
          : "The post has been added to your saved collection",
      });
    } catch (error) {
      console.error('Error toggling save:', error);
      toast({
        title: "Error",
        description: "Could not save the post",
        variant: "destructive",
      });
    }
  };

  const handleFollow = async () => {
    if (!user || !post || !post.user) return;
    
    try {
      await toggleFollow(user.id, post.user.id, !!post.user.is_following);
      setPost(prev => {
        if (!prev || !prev.user) return prev;
        
        return {
          ...prev,
          user: {
            ...prev.user,
            is_following: !prev.user.is_following
          }
        };
      });
      
      toast({
        title: post.user.is_following ? "Unfollowed" : "Following",
        description: post.user.is_following 
          ? `You are no longer following ${post.user.username}` 
          : `You are now following ${post.user.username}`,
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

  const handleHire = async () => {
    if (!user || !post || !post.user) return;
    
    try {
      await hireArchitect(user.id, post.user.id);
      setPost(prev => {
        if (!prev || !prev.user) return prev;
        
        return {
          ...prev,
          user: {
            ...prev.user,
            is_hired: true
          }
        };
      });
      
      toast({
        title: "Architect hired",
        description: `You've successfully hired ${post.user.username}`,
      });
    } catch (error) {
      console.error('Error hiring architect:', error);
      toast({
        title: "Error",
        description: "Could not hire architect",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container px-4 py-8">
          <div className="text-center py-12">
            <p>Loading design details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container px-4 py-8">
          <div className="text-center py-12">
            <p>Design not found.</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const isOwner = user?.id === post.user_id;
  const userIsArchitect = post.user?.role === 'architect';
  const canHire = !isOwner && user?.role === 'homeowner' && userIsArchitect;

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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Image */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="aspect-auto">
                <img 
                  src={post.image_url} 
                  alt={post.title} 
                  className="w-full h-full object-contain"
                />
              </div>
            </Card>
          </div>
          
          {/* Right column - Details */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.map((tag, i) => (
                          <Badge key={i} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {post.description && (
                      <p className="text-muted-foreground">{post.description}</p>
                    )}
                  </div>
                  
                  {post.user && (
                    <div className="pt-4 border-t">
                      <div 
                        className="flex items-center space-x-3 cursor-pointer"
                        onClick={() => navigate(`/architect/${post.user!.id}`)}
                      >
                        <Avatar>
                          <AvatarImage src={post.user.avatar_url || undefined} />
                          <AvatarFallback>
                            {post.user.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{post.user.username}</div>
                          <div className="text-xs text-muted-foreground">
                            {post.user.role.charAt(0).toUpperCase() + post.user.role.slice(1)}
                          </div>
                        </div>
                      </div>
                      
                      {post.hire_me && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="text-sm font-medium mb-2">Available for hire</div>
                          <div className="flex space-x-2">
                            {user && !isOwner && (
                              <>
                                {canHire && post.user && (
                                  <>
                                    {post.user.is_following !== undefined && (
                                      <Button
                                        variant={post.user.is_following ? "outline" : "secondary"}
                                        size="sm"
                                        onClick={handleFollow}
                                        className="flex-1"
                                      >
                                        {post.user.is_following ? (
                                          <>
                                            <UserCheck className="h-4 w-4 mr-1" />
                                            Following
                                          </>
                                        ) : (
                                          <>
                                            <UserPlus className="h-4 w-4 mr-1" />
                                            Follow
                                          </>
                                        )}
                                      </Button>
                                    )}
                                    
                                    {post.user.is_hired ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        disabled
                                      >
                                        <BriefcaseIcon className="h-4 w-4 mr-1" />
                                        Hired
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={handleHire}
                                        className="flex-1"
                                      >
                                        <BriefcaseIcon className="h-4 w-4 mr-1" />
                                        Hire Now
                                      </Button>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {user && (
                    <div className="pt-4 border-t flex justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLike}
                        className={post.is_liked ? "text-red-500" : ""}
                      >
                        <HeartIcon className="h-4 w-4 mr-2" />
                        {post.is_liked ? 'Liked' : 'Like'} 
                        {post.likes_count ? ` (${post.likes_count})` : ''}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSave}
                        className={post.is_saved ? "text-purple-500" : ""}
                      >
                        <BookmarkIcon className="h-4 w-4 mr-2" />
                        {post.is_saved ? 'Saved' : 'Save'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="text-sm text-muted-foreground">
              Posted on {new Date(post.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostDetail;
