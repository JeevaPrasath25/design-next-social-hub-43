
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { createPost } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface PostFormProps {
  user: User;
  onSuccess?: () => void;
}

const DESIGN_TYPES = [
  'Residential',
  'Commercial',
  'Interior',
  'Exterior',
  'Landscape',
  'Sustainable',
  'Modern',
  'Traditional',
  'Industrial',
  'Minimalist',
];

const PostForm: React.FC<PostFormProps> = ({ user, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [designType, setDesignType] = useState('Residential');
  const [tags, setTags] = useState('');
  const [hireMe, setHireMe] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 5242880, // 5MB
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles?.length) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        
        // Create a preview URL
        const previewUrl = URL.createObjectURL(selectedFile);
        setPreview(previewUrl);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Image required",
        description: "Please upload an image for your design",
        variant: "destructive",
      });
      return;
    }
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your design",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      await createPost({
        title,
        description,
        user_id: user.id,
        design_type: designType,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        hire_me: hireMe
      }, file);
      
      toast({
        title: "Design posted",
        description: "Your design has been posted successfully",
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Post failed",
        description: error.message || "An error occurred while posting your design",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="image">Design Image (Required)</Label>
        <div {...getRootProps()} className="border-2 border-dashed rounded-md p-6 mt-2 cursor-pointer hover:bg-gray-50 transition-colors">
          <input {...getInputProps()} id="image" />
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Design preview" className="max-h-80 rounded-md mx-auto" />
              <Button 
                type="button" 
                variant="destructive" 
                size="sm" 
                className="absolute top-2 right-2" 
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setPreview('');
                }}
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Drag and drop an image here, or click to select</p>
              <p className="text-xs text-muted-foreground mt-1">Max size: 5MB</p>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <Label htmlFor="title">Title (Required)</Label>
        <Input 
          id="title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Enter a title for your design" 
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Tell us about your design" 
          className="mt-1 min-h-32"
        />
      </div>
      
      <div>
        <Label htmlFor="designType">Design Type</Label>
        <Select value={designType} onValueChange={setDesignType}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select design type" />
          </SelectTrigger>
          <SelectContent>
            {DESIGN_TYPES.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="tags">Tags (Comma-separated)</Label>
        <Input 
          id="tags" 
          value={tags} 
          onChange={(e) => setTags(e.target.value)} 
          placeholder="e.g. modern, kitchen, sustainable" 
          className="mt-1"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch checked={hireMe} onCheckedChange={setHireMe} id="hireMe" />
        <Label htmlFor="hireMe">Available for hire</Label>
      </div>
      
      <Button type="submit" disabled={loading || !file || !title.trim()} className="w-full">
        {loading ? 'Posting...' : 'Post Design'}
      </Button>
    </form>
  );
};

export default PostForm;
