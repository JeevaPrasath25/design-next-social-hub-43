
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PostForm from '@/components/PostForm';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const CreatePost: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Small delay to ensure auth state is properly loaded
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle redirect logic
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to create a post",
        variant: "destructive",
      });
      navigate('/login');
    } else if (!loading && user && user.role !== 'architect') {
      toast({
        title: "Unauthorized",
        description: "Only architects can create design posts",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  }, [user, navigate, loading, toast]);

  // Show a loading state instead of a blank screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container max-w-4xl px-4 py-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Guard clause to prevent blank screen
  if (!user || user.role !== 'architect') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container max-w-4xl px-4 py-8">
          <Alert>
            <AlertDescription>
              Redirecting to the appropriate page...
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container max-w-4xl px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/architect-dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Post a New Design</CardTitle>
            <CardDescription>
              Share your architectural work with clients and fellow architects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PostForm 
              user={user} 
              onSuccess={() => {
                toast({
                  title: "Design posted",
                  description: "Your design has been successfully shared",
                });
                navigate('/architect-dashboard');
              }} 
            />
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/architect-dashboard')}
            >
              Cancel
            </Button>
            <div className="text-sm text-muted-foreground">
              Your designs help homeowners discover your work
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default CreatePost;
