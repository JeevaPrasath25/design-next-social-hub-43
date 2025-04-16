
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface FollowersTabProps {
  followers: User[];
  loading: boolean;
}

const FollowersTab: React.FC<FollowersTabProps> = ({ followers, loading }) => {
  const navigate = useNavigate();

  return (
    <>
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
                    <AvatarImage src={follower.avatar_url || ''} />
                    <AvatarFallback>
                      {follower.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{follower.username}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {follower.role.charAt(0).toUpperCase() + follower.role.slice(1)}
                    </p>
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
    </>
  );
};

export default FollowersTab;
