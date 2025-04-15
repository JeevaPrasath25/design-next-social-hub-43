
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, BookmarkIcon, HeartIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';
import DesignCard from '@/components/DesignCard';
import { Post, User } from '@/types';
import { getPosts, getArchitects, getProfileStats, toggleLike, toggleSave, toggleFollow, hireArchitect } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [architects, setArchitects] = useState<(User & { is_following?: boolean, is_hired?: boolean })[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, designs: 0 });
  const [loading, setLoading] = useState(true);

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
        }
        
        // If homeowner, get architects
        if (user.role === 'homeowner') {
          const fetchedArchitects = await getArchitects(user.id);
          setArchitects(fetchedArchitects);
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
      setArchitects(prev => prev.map(a => {
        if (a.id === architectId) {
          return { ...a, is_following: !isFollowing };
        }
        return a;
      }));
      
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
    } catch (error) {
      console.error('Error hiring architect:', error);
      toast({
        title: "Error",
        description: "Could not hire architect",
        variant: "destructive",
      });
    }
  };

  // Architect Dashboard
  if (user?.role === 'architect') {
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
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/post/create')}
                >
                  <Plus className="mr-2 h-4 w-4" /> Post Design
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="designs">
            <TabsList className="mb-4">
              <TabsTrigger value="designs">Recent Designs</TabsTrigger>
              <TabsTrigger value="my-designs">My Designs</TabsTrigger>
            </TabsList>
            <TabsContent value="designs">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {!loading && posts.length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-muted-foreground">No designs have been posted yet.</p>
                  </div>
                )}
                {posts.map(post => (
                  <DesignCard key={post.id} post={post} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="my-designs">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {!loading && posts.filter(p => p.user_id === user.id).length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-muted-foreground">You haven't posted any designs yet.</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => navigate('/post/create')}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Post Design
                    </Button>
                  </div>
                )}
                {posts
                  .filter(p => p.user_id === user.id)
                  .map(post => (
                    <DesignCard key={post.id} post={post} />
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
                  onLike={handleLike}
                  onSave={handleSave}
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
                        <Users className="mr-2 h-4 w-4" />
                        {architect.is_following ? "Following" : "Follow"}
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
                          Hire
                        </Button>
                      )}
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
