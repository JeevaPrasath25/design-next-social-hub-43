
import React from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
import PostForm from '@/components/PostForm';

interface PostDesignDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const PostDesignDialog: React.FC<PostDesignDialogProps> = ({ 
  user, 
  open, 
  onOpenChange, 
  onSuccess 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2" id="post-design-trigger">
          <Upload className="h-4 w-4" /> Upload New Design
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload a New Design</DialogTitle>
        </DialogHeader>
        <PostForm 
          user={user} 
          onSuccess={() => {
            onOpenChange(false);
            onSuccess();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PostDesignDialog;
