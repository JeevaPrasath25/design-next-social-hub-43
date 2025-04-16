
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Post, User } from '@/types';
import { HeartIcon, BookmarkIcon, UserCheck, UserPlus, BriefcaseIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DesignCardProps {
  post: Post;
  onLike?: (post: Post) => void;
  onSave?: (post: Post) => void;
  onFollow?: (userId: string, isFollowing: boolean) => void;
  onHire?: (userId: string) => void;
  currentUser?: User | null;
  showControls?: boolean;
  showHireMe?: boolean;
  className?: string;
}

const DesignCard: React.FC<DesignCardProps> = ({
  post,
  onLike,
  onSave,
  onFollow,
  onHire,
  currentUser,
  showControls = true,
  showHireMe = true,
  className
}) => {
  const isOwner = currentUser?.id === post.user_id;
  const userIsArchitect = post.user?.role === 'architect';
  const canHire = currentUser?.role === 'homeowner' && userIsArchitect && !isOwner;
  
  return (
    <Card className={cn("overflow-hidden h-full flex flex-col", className)}>
      <Link to={`/post/${post.id}`} className="block overflow-hidden aspect-video">
        <img
          src={post.image_url}
          alt={post.title}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </Link>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            <Link to={`/post/${post.id}`} className="hover:underline">
              {post.title}
            </Link>
          </CardTitle>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 2).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{post.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {post.user && (
          <div className="flex items-center justify-between mt-1">
            <Link 
              to={`/architect/${post.user.id}`} 
              className="text-sm text-muted-foreground hover:underline"
            >
              by {post.user.username}
            </Link>
            
            {showHireMe && post.hire_me && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Available for hire
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      {post.description && (
        <CardContent className="py-2 flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {post.description}
          </p>
        </CardContent>
      )}
      
      {showControls && currentUser && (
        <CardFooter className="pt-2 flex justify-between">
          <div className="flex gap-2">
            {onLike && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  onLike(post);
                }}
                className={post.is_liked ? "text-red-500" : ""}
              >
                <HeartIcon className="w-4 h-4 mr-1" />
                {post.likes_count || 0}
              </Button>
            )}
            
            {onSave && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  onSave(post);
                }}
                className={post.is_saved ? "text-purple-500" : ""}
              >
                <BookmarkIcon className="w-4 h-4 mr-1" />
                {post.is_saved ? "Saved" : "Save"}
              </Button>
            )}
          </div>
          
          {canHire && post.user && (
            <div className="flex gap-2">
              {onFollow && (
                <Button
                  variant={post.user.is_following ? "outline" : "secondary"}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onFollow(post.user!.id, !!post.user!.is_following);
                  }}
                >
                  {post.user.is_following ? (
                    <>
                      <UserCheck className="w-4 h-4 mr-1" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1" />
                      Follow
                    </>
                  )}
                </Button>
              )}
              
              {onHire && post.hire_me && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onHire(post.user!.id);
                  }}
                  disabled={post.user.is_hired}
                >
                  <BriefcaseIcon className="w-4 h-4 mr-1" />
                  {post.user.is_hired ? "Hired" : "Hire Now"}
                </Button>
              )}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default DesignCard;
