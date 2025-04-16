
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, Briefcase, BookmarkIcon, HeartIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';
import DesignCard from '@/components/DesignCard';
import PostForm from '@/components/PostForm';
import { Post, User } from '@/types';
import { getPosts, getArchitects, getProfileStats, toggleLike, toggleSave, toggleFollow, hireArchitect, toggleHireStatus, getSavedPosts, getFollowers, getFollowing } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [architects, setArchitects] = useState<(User & { is_following?: boolean, is_hired?: boolean })[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, designs: 0 });
  const [loading, setLoading] = useState(true);
  const [postDialogOpen, setPostDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Get posts
        const fetchedPosts = await getPosts();
        setPosts(fetchedPosts);
        
        // If architect, get profile stats
        if (user.role === 'architect') {
          const profileStats = await getProfileStats(user.id);
          setStats({
            followers: profileStats.followers_count,
            following: profileStats.following_count,
            designs: profileStats.designs_count
          });
          
          // Get followers
          const followersData = await getFollowers(user.id);
          setFollowers(followersData.map(f => f.follower!));
          
          // Get following
          const followingData = await getFollowing(user.id);
          setFollowing(followingData.map(f => f.following!));
        }
        
        // If homeowner, get architects and saved posts
        if (user.role === 'homeowner') {
          const fetchedArchitects = await getArchitects(user.id);
          setArchitects(fetchedArchitects);
          
          // Get saved posts
          const savedPostsData = await getSavedPosts(user.id);
          setSavedPosts(savedPostsData.map(sp => sp.post!));
          
          // Get following
          const followingData = await getFollowing(user.id);
          setFollowing(followingData.map(f => f.following!));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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
  }, [user, toast]);

  const handleLike = async (post: Post) => {
    if (!user) return;

    try {
      await toggleLike(user.id, post.id, !!post.is_liked);
      setPosts(prev => prev.map(p => {
        if (p.id === post.id) {
          const newLikesCount = post.is_liked ? (post.likes_count || 1) - 1 : (post.likes_count || 0) + 1;
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
      await toggleSave(user.id, post.id, !!post.is_saved);
      setPosts(prev => prev.map(p => {
        if (p.id === post.id) {
          return { ...p, is_saved: !post.is_saved };
        }
        return p;
      }));
      
      // Update saved posts list
      if (post.is_saved) {
        setSavedPosts(prev => prev.filter(p => p.id !== post.id));
      } else {
        setSavedPosts(prev => [...prev, {...post, is_saved: true}]);
      }
      
      toast({
        title: post.is_saved ? "Removed from saved" : "Saved successfully",
        description: post.is_saved ? "Design removed from your saved items" : "Design added to your saved items",
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

  const handleFollow = async (architectId: string, isFollowing: boolean) => {
    if (!user) return;

    try {
      await toggleFollow(user.id, architectId, isFollowing);
      
      // Update architects list
      setArchitects(prev => prev.map(a => {
        if (a.id === architectId) {
          return { ...a, is_following: !isFollowing };
        }
        return a;
      }));
      
      // Update following list
      if (isFollowing) {
        setFollowing(prev => prev.filter(a => a.id !== architectId));
      } else {
        const architect = architects.find(a => a.id === architectId);
        if (architect) {
          setFollowing(prev => [...prev, architect]);
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
      setArchitects(prev => prev.map(a => {
        if (a.id === architectId) {
          return { ...a, is_hired: true };
        }
        return a;
      }));
      
      toast({
        title: "Architect hired",
        description: "You can now view their contact details",
      });
      
      // Navigate to architect detail page
      navigate(`/architect/${architectId}`);
    } catch (error) {
      console.error('Error hiring architect:', error);
      toast({
        title: "Error",
        description: "Could not hire architect",
        variant: "destructive",
      });
    }
  };

  const handleToggleHireStatus = async (postId: string, currentStatus: boolean) => {
    if (!user) return;

    try {
      await toggleHireStatus(postId, currentStatus);
      
      // Update posts list
      setPosts(prev => prev.map(p => {
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

  // Architect Dashboard
  if (user.role === 'architect') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container px-4 py-8">
          <div className="grid gap-6 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Followers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.followers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Following</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.following}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Designs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.designs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="mr-2 h-4 w-4" /> Post Design
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Post a New Design</DialogTitle>
                      <DialogDescription>
                        Share your architectural work with clients and fellow architects.
                      </DialogDescription>
                    </DialogHeader>
                    <PostForm 
                      user={user} 
                      onSuccess={() => {
                        setPostDialogOpen(false);
                        // Refresh posts
                        getPosts().then(posts => setPosts(posts));
                      }} 
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="my-designs">
            <TabsList className="mb-4">
              <TabsTrigger value="my-designs">My Designs</TabsTrigger>
              <TabsTrigger value="all-designs">Discover Designs</TabsTrigger>
              <TabsTrigger value="followers">My Followers</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-designs">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {!loading && posts.filter(p => p.user_id === user.id).length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-muted-foreground">You haven't posted any designs yet.</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="mt-4">
                          <Plus className="mr-2 h-4 w-4" /> Post Design
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Post a New Design</DialogTitle>
                          <DialogDescription>
                            Share your architectural work with clients and fellow architects.
                          </DialogDescription>
                        </DialogHeader>
                        <PostForm 
                          user={user} 
                          onSuccess={() => {
                            // Refresh posts
                            getPosts().then(posts => setPosts(posts));
                          }} 
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
                {posts
                  .filter(p => p.user_id === user.id)
                  .map(post => (
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
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/post/${post.id}`)}
                          >
                            View Details
                          </Button>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant={post.hire_me ? "secondary" : "ghost"}
                              size="sm"
                              onClick={() => handleToggleHireStatus(post.id, !!post.hire_me)}
                            >
                              <Briefcase className="h-4 w-4 mr-1" />
                              {post.hire_me ? "Available for hire" : "Mark as available"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="all-designs">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {!loading && posts.filter(p => p.user_id !== user.id).length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-muted-foreground">No designs found from other architects.</p>
                  </div>
                )}
                {posts
                  .filter(p => p.user_id !== user.id)
                  .map(post => (
                    <DesignCard 
                      key={post.id} 
                      post={post} 
                      currentUser={user}
                      onLike={handleLike}
                    />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="followers">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {!loading && followers.length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-muted-foreground">No one is following you yet.</p>
                  </div>
                )}
                {followers.map(follower => (
                  <Card key={follower.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle>{follower.username}</CardTitle>
                      <CardDescription>{follower.role}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/architect/${follower.id}`)}
                      >
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="following">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {!loading && following.length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-muted-foreground">You are not following anyone yet.</p>
                  </div>
                )}
                {following.map(followedUser => (
                  <Card key={followedUser.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle>{followedUser.username}</CardTitle>
                      <CardDescription>{followedUser.role}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/architect/${followedUser.id}`)}
                        >
                          View Profile
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleFollow(followedUser.id, true)}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Unfollow
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  // Homeowner Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container px-4 py-8">
        <Tabs defaultValue="designs">
          <TabsList className="mb-4">
            <TabsTrigger value="designs">Discover Designs</TabsTrigger>
            <TabsTrigger value="architects">Find Architects</TabsTrigger>
            <TabsTrigger value="saved">Saved Designs</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          
          <TabsContent value="designs">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {!loading && posts.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <p className="text-muted-foreground">No designs have been posted yet.</p>
                </div>
              )}
              {posts.map(post => (
                <DesignCard 
                  key={post.id} 
                  post={post} 
                  currentUser={user}
                  onLike={handleLike}
                  onSave={handleSave}
                  onFollow={post.user ? handleFollow : undefined}
                  onHire={post.user ? handleHire : undefined}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="architects">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {!loading && architects.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <p className="text-muted-foreground">No architects have registered yet.</p>
                </div>
              )}
              {architects.map(architect => (
                <Card key={architect.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>{architect.username}</CardTitle>
                    <CardDescription>Architect</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
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
                          onClick={() => navigate(`/architect/${architect.id}`)}
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="saved">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {!loading && savedPosts.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <p className="text-muted-foreground">You haven't saved any designs yet.</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => {
                      const designsTab = document.querySelector('[data-value="designs"]') as HTMLElement;
                      if (designsTab) designsTab.click();
                    }}
                  >
                    Discover Designs
                  </Button>
                </div>
              )}
              {savedPosts.map(post => (
                <DesignCard 
                  key={post.id} 
                  post={post} 
                  currentUser={user}
                  onLike={handleLike}
                  onSave={handleSave}
                  onFollow={post.user ? handleFollow : undefined}
                  onHire={post.user ? handleHire : undefined}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="following">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {!loading && following.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <p className="text-muted-foreground">You are not following any architects yet.</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => {
                      const architectsTab = document.querySelector('[data-value="architects"]') as HTMLElement;
                      if (architectsTab) architectsTab.click();
                    }}
                  >
                    Find Architects
                  </Button>
                </div>
              )}
              {following.map(followedUser => (
                <Card key={followedUser.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>{followedUser.username}</CardTitle>
                    <CardDescription>Architect</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/architect/${followedUser.id}`)}
                      >
                        View Profile
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleFollow(followedUser.id, true)}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Unfollow
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
