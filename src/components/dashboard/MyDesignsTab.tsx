
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Post, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Upload } from 'lucide-react';

interface MyDesignsTabProps {
  posts: Post[];
  loading: boolean;
  openPostDialog: () => void;
  onToggleHireStatus: (postId: string, currentStatus: boolean) => Promise<void>;
}

const MyDesignsTab: React.FC<MyDesignsTabProps> = ({ 
  posts, 
  loading, 
  openPostDialog, 
  onToggleHireStatus 
}) => {
  const navigate = useNavigate();

  return (
    <>
      {loading ? (
        <div className="text-center py-12">Loading your designs...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You haven't posted any designs yet.</p>
          <Button onClick={openPostDialog}>
            <Upload className="h-4 w-4 mr-2" /> Upload Your First Design
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <Card key={post.id} className="overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={post.image_url} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                {post.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {post.description}
                  </p>
                )}
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/post/${post.id}`)}
                >
                  View Details
                </Button>
                <Button
                  variant={post.hire_me ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onToggleHireStatus(post.id, !!post.hire_me)}
                >
                  <Briefcase className="h-4 w-4 mr-1" />
                  {post.hire_me ? "Available for hire" : "Mark as available"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default MyDesignsTab;
