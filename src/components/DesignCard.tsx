
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Bookmark, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Post } from '@/types';
import { cn } from '@/lib/utils';

interface DesignCardProps {
  post: Post;
  onLike?: (post: Post) => void;
  onSave?: (post: Post) => void;
  className?: string;
}

const DesignCard: React.FC<DesignCardProps> = ({ post, onLike, onSave, className }) => {
  return (
    <Card className={cn("design-card overflow-hidden h-full flex flex-col", className)}>
      <div className="relative">
        <img 
          src={post.image_url} 
          alt={post.title} 
          className="design-card-image"
        />
      </div>
      <CardHeader className="pt-4 pb-2">
        <div className="flex items-center justify-between">
          <Link to={`/post/${post.id}`} className="text-lg font-semibold hover:text-primary transition-colors">
            {post.title}
          </Link>
          {post.user && (
            <Link to={`/architect/${post.user.id}`} className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              <User size={14} className="mr-1" />
              {post.user.username}
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2">{post.description}</p>
      </CardContent>
      {(onLike || onSave) && (
        <CardFooter className="border-t p-3">
          <div className="flex justify-between items-center w-full">
            {onLike && (
              <Button variant="ghost" size="sm" className="px-2" onClick={() => onLike(post)}>
                <Heart 
                  size={18} 
                  className={post.is_liked ? "fill-red-500 text-red-500 mr-1" : "mr-1"} 
                />
                <span>{post.likes_count || 0}</span>
              </Button>
            )}
            {onSave && (
              <Button variant="ghost" size="sm" className="px-2" onClick={() => onSave(post)}>
                <Bookmark 
                  size={18} 
                  className={post.is_saved ? "fill-primary text-primary" : ""} 
                />
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default DesignCard;
