
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/types';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserPlus, Briefcase } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getArchitects, toggleFollow } from '@/lib/supabase';

const Architects: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [architects, setArchitects] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArchitects = async () => {
      try {
        setLoading(true);
        if (user) {
          const architectList = await getArchitects(user.id);
          setArchitects(architectList);
        }
      } catch (error) {
        console.error('Error fetching architects:', error);
        toast({
          title: "Error",
          description: "Could not load architects",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArchitects();
  }, [user, toast]);

  const handleToggleFollow = async (architectId: string, isFollowing: boolean) => {
    if (!user) return;
    
    try {
      await toggleFollow(user.id, architectId, isFollowing);
      
      // Update local state
      setArchitects(prev => prev.map(arch => {
        if (arch.id === architectId) {
          return { 
            ...arch, 
            is_following: !isFollowing 
          };
        }
        return arch;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container py-8">
          <h1 className="text-2xl font-bold mb-6">Discover Architects</h1>
          <div className="text-center py-12">Loading architects...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Discover Architects</h1>
        
        {architects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No architects found</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {architects.map(architect => (
              <Card key={architect.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={architect.avatar_url || ''} alt={architect.username} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {architect.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{architect.username}</CardTitle>
                      <div className="flex space-x-2 mt-1">
                        <Badge variant="outline">Architect</Badge>
                        {architect.is_hired && (
                          <Badge className="bg-green-500">Hired</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-2">
                  {architect.bio && (
                    <CardDescription className="line-clamp-3 mb-4">
                      {architect.bio}
                    </CardDescription>
                  )}
                </CardContent>
                
                <CardFooter className="flex justify-between gap-2">
                  <Button
                    variant={architect.is_following ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => handleToggleFollow(architect.id, !!architect.is_following)}
                    className="flex-1"
                  >
                    {architect.is_following ? (
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
                  
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => navigate(`/architect/${architect.id}`)}
                    className="flex-1"
                  >
                    View Profile
                  </Button>
                  
                  {user?.role === 'homeowner' && !architect.is_hired && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate(`/hire/${architect.id}`)}
                      className="flex-1"
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      Hire
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Architects;
