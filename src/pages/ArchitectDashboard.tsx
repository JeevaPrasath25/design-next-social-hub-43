
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Heart, BookmarkIcon, Users, Plus, Briefcase } from 'lucide-react';
import Navbar from '@/components/Navbar';
import DesignCard from '@/components/DesignCard';
import PostForm from '@/components/PostForm';
import { useToast } from '@/components/ui/use-toast';
import { Post, ProfileStats } from '@/types';
import { getPosts, getProfileStats, getFollowers, getFollowing, toggleLike, toggleFollow, toggleHireStatus } from '@/lib/supabase';
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

const ArchitectDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [otherPosts, setOtherPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    followers_count: 0,
    following_count: 0,
    designs_count: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || '',
      contact: user?.contact || '',
      bio: user?.bio || '',
    },
  });

  useEffect(() => {
    // Redirect if not logged in or not an architect
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'architect') {
      navigate('/homeowner-dashboard');
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get posts
        const fetchedPosts = await getPosts();
        setMyPosts(fetchedPosts.filter(p => p.user_id === user.id));
        setOtherPosts(fetchedPosts.filter(p => p.user_id !== user.id));
        
        // Get profile stats
        const profileStats = await getProfileStats(user.id);
        setStats(profileStats);
        
        // Get followers and following
        const followersData = await getFollowers(user.id);
        setFollowers(followersData.map(f => f.follower));
        
        const followingData = await getFollowing(user.id);
        setFollowing(followingData.map(f => f.following));
      } catch (error) {
        console.error('Error fetching architect dashboard data:', error);
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
      const fetchedPosts = await getPosts();
      setMyPosts(fetchedPosts.filter(p => p.user_id === user.id));
      setOtherPosts(fetchedPosts.filter(p => p.user_id !== user.id));
      
      const profileStats = await getProfileStats(user.id);
      setStats(profileStats);
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
      
      setMyPosts(updatePost(myPosts));
      setOtherPosts(updatePost(otherPosts));
      
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Could not like the post",
        variant: "destructive",
      });
    }
  };

  const handleToggleHireStatus = async (postId: string, currentStatus: boolean) => {
    if (!user) return;

    try {
      await toggleHireStatus(postId, currentStatus);
      
      // Update posts list
      setMyPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, hire_me: !currentStatus };
        }
        return p;
      }));
      
      toast({
        title: currentStatus ? "Not available for hire" : "Available for hire",
        description: currentStatus 
          ? "You are no longer showing as available for this design" 
          : "You are now showing as available for this design",
      });
    } catch (error) {
      console.error('Error toggling hire status:', error);
      toast({
        title: "Error",
        description: "Could not update availability status",
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
          {/* Profile Summary */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Followers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.followers_count}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Following</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.following_count}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Designs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.designs_count}</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Profile Details */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Architect Profile</CardTitle>
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
                            Contact information visible to clients who hire you.
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
                          <FormLabel>Biography</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about yourself, your experience, and your expertise..."
                              className="min-h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Your bio will be visible on your public profile.
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
                      <Badge className="mt-2">Architect</Badge>
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
          
          {/* Post New Design */}
          <div className="flex justify-end">
            <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" /> Upload New Design
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Upload a New Design</DialogTitle>
                  <DialogDescription>
                    Share your architectural work with clients and fellow architects.
                  </DialogDescription>
                </DialogHeader>
                <PostForm 
                  user={user} 
                  onSuccess={() => {
                    setPostDialogOpen(false);
                    refreshData();
                    toast({
                      title: "Design uploaded",
                      description: "Your design has been successfully posted",
                    });
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Tabs for different sections */}
          <Tabs defaultValue="my-designs" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="my-designs">My Designs</TabsTrigger>
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="followers">Followers</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>
            
            {/* My Designs Tab */}
            <TabsContent value="my-designs">
              {loading ? (
                <div className="text-center py-12">Loading your designs...</div>
              ) : myPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">You haven't posted any designs yet.</p>
                  <Button onClick={() => setPostDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Upload Your First Design
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {myPosts.map(post => (
                    <Card key={post.id} className="overflow-hidden">
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={post.image_url} 
                          alt={post.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle>{post.title}</CardTitle>
                        {post.description && (
                          <CardDescription className="line-clamp-2">
                            {post.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardFooter className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/post/${post.id}`)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant={post.hire_me ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => handleToggleHireStatus(post.id, !!post.hire_me)}
                        >
                          <Briefcase className="h-4 w-4 mr-1" />
                          {post.hire_me ? "Available for hire" : "Mark as available"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Discover Tab */}
            <TabsContent value="discover">
              {loading ? (
                <div className="text-center py-12">Loading designs...</div>
              ) : otherPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No designs from other architects yet.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {otherPosts.map(post => (
                    <DesignCard 
                      key={post.id} 
                      post={post} 
                      currentUser={user}
                      onLike={handleLike}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Followers Tab */}
            <TabsContent value="followers">
              {loading ? (
                <div className="text-center py-12">Loading followers...</div>
              ) : followers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">You don't have any followers yet.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {followers.map(follower => (
                    <Card key={follower.id}>
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={follower.avatar_url} />
                            <AvatarFallback>
                              {follower.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{follower.username}</CardTitle>
                            <CardDescription>
                              {follower.role.charAt(0).toUpperCase() + follower.role.slice(1)}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardFooter>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/architect/${follower.id}`)}
                          className="w-full"
                        >
                          View Profile
                        </Button>
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
                  <p className="text-muted-foreground">You aren't following anyone yet.</p>
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
                            <CardDescription>
                              {follow.role.charAt(0).toUpperCase() + follow.role.slice(1)}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardFooter>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/architect/${follow.id}`)}
                          className="w-full"
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

export default ArchitectDashboard;
