
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import PostForm from '@/components/PostForm';

const CreatePost: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in or not an architect
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'architect') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'architect') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container max-w-4xl px-4 py-8">
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
                navigate('/dashboard');
              }} 
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreatePost;
