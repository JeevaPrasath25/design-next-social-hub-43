
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { User, Post } from '@/types';
import { 
  getUserById, 
  getProfileStats, 
  getPosts, 
  toggleFollow, 
  hireArchitect 
} from '@/lib/supabase';
import { Briefcase, Mail, Phone, MapPin, UserCheck, UserPlus, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import DesignCard from '@/components/DesignCard';

const HireArchitect: React.FC = () => {
  const { architectId } = useParams<{ architectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [architect, setArchitect] = useState<User | null>(null);
  const [stats, setStats] = useState<{ followers_count: number, designs_count: number }>();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isHired, setIsHired] = useState(false);
  const [architectPosts, setArchitectPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!architectId) {
      navigate('/homeowner-dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Get architect details
        const architectData = await getUserById(architectId);
        
        if (!architectData || architectData.role !== 'architect') {
          toast({
            title: "Not found",
            description: "The architect you're looking for doesn't exist",
            variant: "destructive",
          });
          navigate('/homeowner-dashboard');
          return;
        }

        setArchitect(architectData);

        // Get profile stats
        const profileStats = await getProfileStats(architectId, user.id);
        setStats({
          followers_count: profileStats.followers_count,
          designs_count: profileStats.designs_count,
        });
        setIsFollowing(profileStats.is_following || false);
        setIsHired(profileStats.is_hired || false);

        // Get architect's posts
        const posts = await getPosts(architectId);
        setArchitectPosts(posts);
      } catch (error) {
        console.error('Error fetching architect data:', error);
        toast({
          title: "Error",
          description: "Could not load architect data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [architectId, user, navigate, toast]);

  const handleFollow = async () => {
    if (!user || !architect) return;

    try {
      await toggleFollow(user.id, architect.id, isFollowing);
      setIsFollowing(!isFollowing);
      
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing 
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
      setIsHired(true);
      
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container px-4 py-8">
          <div className="text-center py-12">Loading architect details...</div>
        </main>
      </div>
    );
  }

  if (!architect) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Architect Not Found</CardTitle>
              <CardDescription>
                The architect you're looking for doesn't exist or has been removed.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate('/homeowner-dashboard')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container px-4 py-8">
        {/* Back button */}
        <div className="mb-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
        
        {/* Architect Profile */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={architect.avatar_url || ''} alt={architect.username} />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {architect.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">{architect.username}</CardTitle>
                    {isHired && (
                      <Badge variant="secondary" className="ml-2">Hired</Badge>
                    )}
                  </div>
                  <CardDescription>
                    Architect • {stats?.followers_count || 0} followers • {stats?.designs_count || 0} designs
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {architect.bio && (
                <div>
                  <h3 className="text-lg font-medium mb-2">About</h3>
                  <p className="text-sm text-muted-foreground">{architect.bio}</p>
                </div>
              )}
              
              {isHired && architect.contact && (
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <Mail className="h-5 w-5 mr-2" /> Contact Information
                  </h3>
                  <p className="text-sm whitespace-pre-line">{architect.contact}</p>
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  onClick={handleFollow}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" /> Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" /> Follow
                    </>
                  )}
                </Button>
                
                {!isHired ? (
                  <Button
                    variant="secondary"
                    onClick={handleHire}
                  >
                    <Briefcase className="h-4 w-4 mr-2" /> Hire Now
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    disabled
                  >
                    <Briefcase className="h-4 w-4 mr-2" /> Hired
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
          
          {/* Action Card */}
          <Card>
            <CardHeader>
              <CardTitle>Why Hire {architect.username}?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Professional Architect</h3>
                  <p className="text-sm text-muted-foreground">View their portfolio below</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Direct Contact</h3>
                  <p className="text-sm text-muted-foreground">Get access to contact details</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {!isHired ? (
                <Button className="w-full" onClick={handleHire}>
                  <Briefcase className="h-4 w-4 mr-2" /> Hire Now
                </Button>
              ) : (
                <p className="text-sm text-center w-full text-muted-foreground">
                  You've already hired this architect
                </p>
              )}
            </CardFooter>
          </Card>
        </div>
        
        {/* Architect's Designs */}
        <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
        {architectPosts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                {architect.username} hasn't posted any designs yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {architectPosts.map(post => (
              <DesignCard 
                key={post.id} 
                post={post} 
                currentUser={user}
                showControls={false}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HireArchitect;
