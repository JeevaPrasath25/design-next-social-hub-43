
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCircle, Heart, BookmarkIcon, Users, Briefcase, UserCheck, UserPlus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import DesignCard from '@/components/DesignCard';
import { useToast } from '@/components/ui/use-toast';
import { Post, User } from '@/types';
import { getPosts, getArchitects, getSavedPosts, getFollowing, toggleLike, toggleSave, toggleFollow, hireArchitect } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const profileFormSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
  contact: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const HomeownerDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [architects, setArchitects] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || '',
      contact: user?.contact || '',
      bio: user?.bio || '',
    },
  });

  useEffect(() => {
    // Redirect if not logged in or not a homeowner
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'homeowner') {
      navigate('/architect-dashboard');
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get all posts
        const fetchedPosts = await getPosts();
        setPosts(fetchedPosts);
        
        // Get architects
        const fetchedArchitects = await getArchitects(user.id);
        setArchitects(fetchedArchitects);
        
        // Get saved posts
        const savedPostsData = await getSavedPosts(user.id);
        setSavedPosts(savedPostsData.map(sp => sp.post || {} as Post).filter(p => p.id));
        
        // Get following
        const followingData = await getFollowing(user.id);
        setFollowing(followingData.map(f => f.following || {} as User).filter(a => a.id));
        
      } catch (error) {
        console.error('Error fetching homeowner dashboard data:', error);
        toast({
          title: "Error loading data",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, navigate, toast]);

  const refreshData = async () => {
    if (!user) return;
    
    try {
      // Get all posts
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
      
      // Get saved posts
      const savedPostsData = await getSavedPosts(user.id);
      setSavedPosts(savedPostsData.map(sp => sp.post || {} as Post).filter(p => p.id));
      
      // Get following
      const followingData = await getFollowing(user.id);
      setFollowing(followingData.map(f => f.following || {} as User).filter(a => a.id));
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const handleSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Update user profile in Supabase
      const updatedUser = {
        ...user,
        username: data.username,
        contact: data.contact,
        bio: data.bio,
      };
      
      // Call updateUserProfile from supabase.ts
      await fetch('/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });
      
      updateUser(updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred during update",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (post: Post) => {
    if (!user) return;
    
    try {
      await toggleLike(user.id, post.id, !!post.is_liked);
      
      // Update posts state
      const updatePost = (posts: Post[]) => 
        posts.map(p => {
          if (p.id === post.id) {
            const newLikesCount = post.is_liked 
              ? (post.likes_count || 1) - 1 
              : (post.likes_count || 0) + 1;
            return { ...p, is_liked: !post.is_liked, likes_count: newLikesCount };
          }
          return p;
        });
      
      setPosts(updatePost(posts));
      setSavedPosts(updatePost(savedPosts));
      
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
      await toggleSave(user.id, post.id, !!post.is_saved);
      
      // Update posts state
      const updatePost = (posts: Post[]) => 
        posts.map(p => {
          if (p.id === post.id) {
            return { ...p, is_saved: !post.is_saved };
          }
          return p;
        });
      
      setPosts(updatePost(posts));
      
      // Update saved posts
      if (post.is_saved) {
        setSavedPosts(prev => prev.filter(p => p.id !== post.id));
      } else {
        const updatedPost = { ...post, is_saved: true };
        setSavedPosts(prev => [...prev, updatedPost]);
      }
      
    } catch (error) {
      console.error('Error toggling save:', error);
      toast({
        title: "Error",
        description: "Could not save the post",
        variant: "destructive",
      });
    }
  };

  const handleFollow = async (architectId: string, isFollowing: boolean) => {
    if (!user) return;
    
    try {
      await toggleFollow(user.id, architectId, isFollowing);
      
      // Update architects list
      const updatedArchitects = architects.map(a => {
        if (a.id === architectId) {
          return { ...a, is_following: !isFollowing };
        }
        return a;
      });
      setArchitects(updatedArchitects);
      
      // Update following list
      if (isFollowing) {
        setFollowing(prev => prev.filter(a => a.id !== architectId));
      } else {
        const architect = architects.find(a => a.id === architectId);
        if (architect) {
          setFollowing(prev => [...prev, { ...architect, is_following: true }]);
        }
      }
      
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing ? "You are no longer following this architect" : "You are now following this architect",
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
      
      // Update architects list
      const updatedArchitects = architects.map(a => {
        if (a.id === architectId) {
          return { ...a, is_hired: true };
        }
        return a;
      });
      setArchitects(updatedArchitects);
      
      toast({
        title: "Architect hired",
        description: "You can now view their contact details",
      });
      
      // Navigate to architect detail page
      navigate(`/hire/${architectId}`);
      
    } catch (error) {
      console.error('Error hiring architect:', error);
      toast({
        title: "Error",
        description: "Could not hire architect",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container px-4 py-8">
        <div className="flex flex-col space-y-6">
          {/* Profile Details */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Homeowner Profile</CardTitle>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            This is your public display name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Details</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Add your contact details (email, phone, etc.)"
                              className="min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Your contact information will be shared with architects you hire.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>About Me</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell architects about yourself and your project needs..."
                              className="min-h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This will help architects understand your needs better.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Profile'}
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user.avatar_url || ''} alt={user.username} />
                      <AvatarFallback className="text-xl bg-primary/10 text-primary">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h2 className="text-2xl font-bold">{user.username}</h2>
                      <p className="text-sm text-muted-foreground">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                      <Badge className="mt-2">Homeowner</Badge>
                    </div>
                  </div>
                  
                  {user.bio && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">About Me</h3>
                      <p className="text-sm text-muted-foreground">{user.bio}</p>
                    </div>
                  )}
                  
                  {user.contact && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{user.contact}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Content Tabs */}
          <Tabs defaultValue="feed" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="feed">Design Feed</TabsTrigger>
              <TabsTrigger value="saved">Saved Designs</TabsTrigger>
              <TabsTrigger value="architects">Find Architects</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>
            
            {/* Design Feed Tab */}
            <TabsContent value="feed">
              {loading ? (
                <div className="text-center py-12">Loading designs...</div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No designs have been posted yet.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {posts.map(post => (
                    <DesignCard 
                      key={post.id} 
                      post={post} 
                      currentUser={user}
                      onLike={handleLike}
                      onSave={handleSave}
                      onFollow={post.user ? (userId, isFollowing) => handleFollow(userId, isFollowing) : undefined}
                      onHire={post.user ? (userId) => handleHire(userId) : undefined}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Saved Designs Tab */}
            <TabsContent value="saved">
              {loading ? (
                <div className="text-center py-12">Loading saved designs...</div>
              ) : savedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">You haven't saved any designs yet.</p>
                  <Button onClick={() => document.querySelector('[data-value="feed"]')?.dispatchEvent(new Event('click'))}>
                    Browse Designs
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {savedPosts.map(post => (
                    <DesignCard 
                      key={post.id} 
                      post={post} 
                      currentUser={user}
                      onLike={handleLike}
                      onSave={handleSave}
                      onFollow={post.user ? (userId, isFollowing) => handleFollow(userId, isFollowing) : undefined}
                      onHire={post.user ? (userId) => handleHire(userId) : undefined}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Find Architects Tab */}
            <TabsContent value="architects">
              {loading ? (
                <div className="text-center py-12">Loading architects...</div>
              ) : architects.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No architects have registered yet.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {architects.map(architect => (
                    <Card key={architect.id}>
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={architect.avatar_url} />
                            <AvatarFallback>
                              {architect.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{architect.username}</CardTitle>
                            <CardDescription>Architect</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      {architect.bio && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">{architect.bio}</p>
                        </CardContent>
                      )}
                      <CardFooter className="flex justify-between">
                        <Button 
                          variant={architect.is_following ? "outline" : "default"} 
                          size="sm"
                          onClick={() => handleFollow(architect.id, !!architect.is_following)}
                        >
                          {architect.is_following ? (
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
                        
                        {architect.is_hired ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/hire/${architect.id}`)}
                          >
                            View Contact
                          </Button>
                        ) : (
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => handleHire(architect.id)}
                          >
                            <Briefcase className="h-4 w-4 mr-1" />
                            Hire Now
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Following Tab */}
            <TabsContent value="following">
              {loading ? (
                <div className="text-center py-12">Loading following...</div>
              ) : following.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">You aren't following any architects yet.</p>
                  <Button onClick={() => document.querySelector('[data-value="architects"]')?.dispatchEvent(new Event('click'))}>
                    Find Architects
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {following.map(follow => (
                    <Card key={follow.id}>
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={follow.avatar_url} />
                            <AvatarFallback>
                              {follow.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{follow.username}</CardTitle>
                            <CardDescription>Architect</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      {follow.bio && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">{follow.bio}</p>
                        </CardContent>
                      )}
                      <CardFooter className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleFollow(follow.id, true)}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Unfollow
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => navigate(`/architect/${follow.id}`)}
                        >
                          View Profile
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default HomeownerDashboard;
