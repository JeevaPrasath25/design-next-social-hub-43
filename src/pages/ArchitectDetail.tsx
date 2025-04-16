
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Post, ProfileStats } from '@/types';
import { getCurrentUser, getPosts, getProfileStats, toggleFollow, hireArchitect } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import DesignCard from '@/components/DesignCard';
import { UserCheck, UserPlus, Users, BriefcaseIcon, Mail } from 'lucide-react';

const ArchitectDetail: React.FC = () => {
  const { architectId } = useParams<{ architectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [architect, setArchitect] = useState<User | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!architectId) return;

      try {
        setLoading(true);
        
        // Get architect data
        const architectData = await getCurrentUser();
        
        if (!architectData || architectData.id !== architectId) {
          // If the currently logged in user is not the architect we're looking for,
          // we need to fetch the architect's data differently
          // This would normally be a separate API call
          
          // For demo, we'll use a workaround
          const allPosts = await getPosts();
          const architectPost = allPosts.find(p => p.user_id === architectId);
          
          if (architectPost?.user) {
            setArchitect(architectPost.user);
          } else {
            toast({
              title: "Architect not found",
              description: "Could not find the architect you're looking for",
              variant: "destructive",
            });
            navigate('/dashboard');
            return;
          }
        } else {
          setArchitect(architectData);
        }
        
        // Get architect's stats
        const profileStats = await getProfileStats(architectId, user?.id);
        setStats(profileStats);
        
        // Get architect's posts
        const architectPosts = await getPosts(architectId);
        setPosts(architectPosts);
      } catch (error) {
        console.error('Error fetching architect details:', error);
        toast({
          title: "Error loading data",
          description: "Could not load architect details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [architectId, user, navigate, toast]);

  const handleFollow = async () => {
    if (!user || !architect || !stats) return;

    try {
      await toggleFollow(user.id, architect.id, !!stats.is_following);
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
          ? `You are no longer following ${architect.username}` 
          : `You are now following ${architect.username}`,
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
    if (!user || !architect) return;

    try {
      await hireArchitect(user.id, architect.id);
      
      setStats(prev => {
        if (!prev) return prev;
        return { ...prev, is_hired: true };
      });
      
      toast({
        title: "Architect hired",
        description: `You've successfully hired ${architect.username}`,
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
            <p>Loading architect details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!architect || !stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container px-4 py-8">
          <div className="text-center py-12">
            <p>Architect not found.</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const isCurrentUser = user?.id === architect.id;
  const canHire = !isCurrentUser && user?.role === 'homeowner' && architect.role === 'architect';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-2xl">{architect.username}</CardTitle>
                <CardDescription>
                  {architect.role.charAt(0).toUpperCase() + architect.role.slice(1)}
                </CardDescription>
              </div>
              
              {!isCurrentUser && (
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={stats.is_following ? "outline" : "default"}
                    onClick={handleFollow}
                  >
                    {stats.is_following ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                  
                  {canHire && (
                    stats.is_hired ? (
                      <Button variant="outline">
                        <BriefcaseIcon className="h-4 w-4 mr-2" />
                        Hired
                      </Button>
                    ) : (
                      <Button 
                        variant="secondary"
                        onClick={handleHire}
                      >
                        <BriefcaseIcon className="h-4 w-4 mr-2" />
                        Hire Now
                      </Button>
                    )
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Followers</div>
                <div>{stats.followers_count}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Following</div>
                <div>{stats.following_count}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <BriefcaseIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Designs</div>
                <div>{stats.designs_count}</div>
              </div>
            </div>
            
            {(isCurrentUser || stats.is_hired) && architect.contact && (
              <div className="md:col-span-3 mt-4 p-4 bg-purple-50 rounded-md">
                <div className="flex items-start space-x-2">
                  <Mail className="h-5 w-5 text-purple-500 mt-1" />
                  <div>
                    <div className="text-sm font-medium text-purple-700">Contact Information</div>
                    <div className="whitespace-pre-line">{architect.contact}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <h2 className="text-xl font-bold mb-4">Designs by {architect.username}</h2>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground">
                {isCurrentUser 
                  ? "You haven't posted any designs yet." 
                  : `${architect.username} hasn't posted any designs yet.`}
              </p>
              
              {isCurrentUser && (
                <Button 
                  className="mt-4" 
                  onClick={() => navigate('/post/create')}
                >
                  Post a Design
                </Button>
              )}
            </div>
          )}
          
          {posts.map(post => (
            <DesignCard 
              key={post.id} 
              post={post} 
              currentUser={user}
              showControls={false}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default ArchitectDetail;
