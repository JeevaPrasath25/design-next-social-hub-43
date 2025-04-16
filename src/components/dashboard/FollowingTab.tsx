
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCheck } from 'lucide-react';

interface FollowingTabProps {
  following: User[];
  loading: boolean;
  onUnfollow: (userId: string) => Promise<void>;
}

const FollowingTab: React.FC<FollowingTabProps> = ({ following, loading, onUnfollow }) => {
  const navigate = useNavigate();

  return (
    <>
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
                    <AvatarImage src={follow.avatar_url || ''} />
                    <AvatarFallback>
                      {follow.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{follow.username}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {follow.role.charAt(0).toUpperCase() + follow.role.slice(1)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/architect/${follow.id}`)}
                  className="flex-1"
                >
                  View Profile
                </Button>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => onUnfollow(follow.id)}
                  className="flex-1"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Unfollow
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default FollowingTab;
