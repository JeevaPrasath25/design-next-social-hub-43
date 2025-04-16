
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserPlus, Briefcase } from 'lucide-react';

interface ArchitectCardProps {
  architect: User;
  currentUser: User | null;
  onFollowToggle: (architectId: string, isFollowing: boolean) => Promise<void>;
}

const ArchitectCard: React.FC<ArchitectCardProps> = ({ 
  architect, 
  currentUser,
  onFollowToggle 
}) => {
  const navigate = useNavigate();
  
  const isFollowing = !!architect.is_following;
  const isHired = !!architect.is_hired;
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
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
              {isHired && (
                <Badge className="bg-green-500">Hired</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2 flex-grow">
        {architect.bio && (
          <CardDescription className="line-clamp-3 mb-4">
            {architect.bio}
          </CardDescription>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-2">
        {currentUser && currentUser.id !== architect.id && (
          <Button
            variant={isFollowing ? "secondary" : "outline"}
            size="sm"
            onClick={() => onFollowToggle(architect.id, isFollowing)}
            className="flex-1"
          >
            {isFollowing ? (
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
        )}
        
        <Button 
          variant="default" 
          size="sm"
          onClick={() => navigate(`/architect/${architect.id}`)}
          className="flex-1"
        >
          View Profile
        </Button>
        
        {currentUser?.role === 'homeowner' && !isHired && currentUser.id !== architect.id && (
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
  );
};

export default ArchitectCard;
