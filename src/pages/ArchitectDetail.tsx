
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Post, ProfileStats } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { getPosts, toggleFollow, hireArchitect, getProfileStats } from '@/lib/supabase';
import DesignCard from '@/components/DesignCard';
import { Users, Mail, AlertCircle } from 'lucide-react';

const ArchitectDetail: React.FC = () => {
  const { architectId } = useParams<{ architectId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [architect, setArchitect] = useState<User | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArchitectData = async () => {
      if (!architectId) return;

      try {
        setLoading(true);
        
        // Fetch architect's posts
        const fetchedPosts = await getPosts(architectId);
        setPosts(fetchedPosts);
        
        // Get architect profile from their first post
        if (fetchedPosts.length > 0 && fetchedPosts[0].user) {
          setArchitect(fetchedPosts[0].user);
        }
        
        // Get profile stats
        const profileStats = await getProfileStats(architectId, user?.id);
        setStats(profileStats);
      } catch (error) {
        console.error('Error fetching architect data:', error);
        toast({
          title: "Error loading architect profile",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArchitectData();
  }, [architectId, user?.id, toast]);

  const handleFollow = async () => {
    if (!user || !architectId || !stats) return;

    try {
      await toggleFollow(user.id, architectId, !!stats.is_following);
      setStats({
        ...stats,
        is_following: !stats.is_following,
        followers_count: stats.is_following 
          ? stats.followers_count - 1 
          : stats.followers_count + 1
      });
      
      toast({
        title: stats.is_following ? "Unfollowed" : "Following",
        description: stats.is_following 
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

  const handleHire = async () => {
    if (!user || !architectId || !stats) return;

    try {
      await hireArchitect(user.id, architectId);
      setStats({
        ...stats,
        is_hired: true
      });
      
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

  if (!architect && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container px-4 py-8">
          <div className="max-w-md mx-auto text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">Architect not found</h2>
            <p className="text-muted-foreground mb-6">
              The architect profile you're looking for doesn't exist or has been removed.
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
        {architect && stats && (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{architect.username}</CardTitle>
                <CardDescription>Architect</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{stats.designs_count}</div>
                      <div className="text-sm text-muted-foreground">Designs</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stats.followers_count}</div>
                      <div className="text-sm text-muted-foreground">Followers</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stats.following_count}</div>
                      <div className="text-sm text-muted-foreground">Following</div>
                    </div>
                  </div>
                  
                  {user && user.role === 'homeowner' && (
                    <div className="flex gap-2">
                      <Button 
                        variant={stats.is_following ? "outline" : "default"} 
                        onClick={handleFollow}
                        className="flex-1"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        {stats.is_following ? "Following" : "Follow"}
                      </Button>
                      
                      {stats.is_hired ? (
                        <Button 
                          variant="default" 
                          className="flex-1"
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Contact
                        </Button>
                      ) : (
                        <Button 
                          variant="secondary" 
                          onClick={handleHire}
                          className="flex-1"
                        >
                          Hire
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                {stats.is_hired && architect.contact && (
                  <Card className="bg-muted/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-line text-sm">{architect.contact}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
            
            <Tabs defaultValue="designs">
              <TabsList className="mb-4">
                <TabsTrigger value="designs">Designs</TabsTrigger>
              </TabsList>
              <TabsContent value="designs">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {!loading && posts.length === 0 && (
                    <div className="col-span-full py-12 text-center">
                      <p className="text-muted-foreground">This architect hasn't posted any designs yet.</p>
                    </div>
                  )}
                  {posts.map(post => (
                    <DesignCard key={post.id} post={post} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default ArchitectDetail;
