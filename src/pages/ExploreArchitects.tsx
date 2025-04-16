
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getArchitects, toggleFollow } from '@/lib/supabase';
import { User } from '@/types';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, UserCheck, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ExploreArchitects: React.FC = () => {
  const [architects, setArchitects] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchArchitects = async () => {
      try {
        setLoading(true);
        const data = await getArchitects(user?.id);
        setArchitects(data.filter(a => a.id !== user?.id)); // Don't show current user
      } catch (error) {
        console.error('Error fetching architects:', error);
        toast({
          title: "Error loading architects",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchArchitects();
  }, [user]);

  const handleFollowToggle = async (architectId: string, isFollowing: boolean) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow architects",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await toggleFollow(user.id, architectId, isFollowing);
      
      // Update local state
      setArchitects(prev => prev.map(architect => {
        if (architect.id === architectId) {
          return {
            ...architect,
            is_following: !isFollowing
          };
        }
        return architect;
      }));
      
      toast({
        title: isFollowing ? "Unfollowed" : "Now Following",
        description: isFollowing ? "You are no longer following this architect" : "You are now following this architect",
      });
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Action failed",
        description: "Could not update follow status",
        variant: "destructive",
      });
    }
  };

  const filteredArchitects = architects.filter(architect => 
    architect.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (architect.bio && architect.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container py-8 px-4">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Explore Architects</h1>
            <p className="text-muted-foreground">
              Connect with architects and find design inspiration
            </p>
          </div>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search architects by name or bio..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Architects Grid */}
          {loading ? (
            <div className="text-center py-12">Loading architects...</div>
          ) : filteredArchitects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? "No architects found for your search" : "No architects available"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredArchitects.map(architect => (
                <Card key={architect.id} className="flex flex-col h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={architect.avatar_url || ''} />
                        <AvatarFallback>
                          {architect.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{architect.username}</CardTitle>
                        {architect.rating && (
                          <Badge variant="outline" className="mt-1">Rating: {architect.rating} ★</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {architect.bio ? (
                      <p className="text-sm text-muted-foreground line-clamp-4">
                        {architect.bio}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No bio available
                      </p>
                    )}
                    
                    {architect.is_hired && (
                      <Badge className="mt-3">Hired</Badge>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-2 border-t">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/architect/${architect.id}`)}
                    >
                      View Profile
                    </Button>
                    <Button 
                      variant={architect.is_following ? "secondary" : "default"}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleFollowToggle(architect.id, !!architect.is_following)}
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
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExploreArchitects;
