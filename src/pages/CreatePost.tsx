
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { createPost } from '@/lib/supabase';
import Navbar from '@/components/Navbar';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  image: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, { message: "Image is required." })
    .refine(
      (files) => files[0]?.size <= MAX_FILE_SIZE,
      { message: `Max file size is 5MB.` }
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
      { message: "Only .jpg, .jpeg, .png and .webp formats are supported." }
    ),
});

type FormValues = z.infer<typeof formSchema>;

const CreatePost: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const imageFile = data.image[0];
      
      await createPost(
        {
          title: data.title,
          description: data.description,
          user_id: user.id,
        },
        imageFile
      );
      
      toast({
        title: "Design posted",
        description: "Your design has been published successfully",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Posting failed",
        description: error.message || "An error occurred while posting your design",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      fileReader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  if (user?.role !== 'architect') {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Post a Design</CardTitle>
            <CardDescription>
              Share your architectural designs with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Modern Minimalist House" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your design, materials used, inspiration, etc."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel>Design Image</FormLabel>
                      <FormControl>
                        <div className="flex flex-col items-center space-y-4">
                          <div 
                            className={`border-2 border-dashed rounded-lg p-6 w-full flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors ${
                              imagePreview ? 'border-primary' : 'border-border'
                            }`}
                            onClick={() => document.getElementById('image-upload')?.click()}
                          >
                            {imagePreview ? (
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="max-h-64 max-w-full rounded-md object-contain" 
                              />
                            ) : (
                              <div className="flex flex-col items-center space-y-2 py-4">
                                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                                <div className="text-center">
                                  <p className="text-sm font-medium">Click to upload an image</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    JPG, PNG or WebP (max. 5MB)
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              handleImageChange(e);
                              onChange(e.target.files);
                            }}
                            {...rest}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-4">
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      'Post Design'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreatePost;
