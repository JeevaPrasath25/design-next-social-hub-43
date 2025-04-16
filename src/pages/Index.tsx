
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

const Index: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      if (user.role === 'architect') {
        navigate('/architect-dashboard');
      } else if (user.role === 'homeowner') {
        navigate('/homeowner-dashboard');
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-8">
          Welcome to <span className="text-primary">Design</span>Next
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl">
          Connect with architects, discover amazing designs, and bring your dream home to life.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          {!user ? (
            <>
              <Button size="lg" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Log In</Link>
              </Button>
            </>
          ) : (
            <Button size="lg" asChild>
              <Link to={user.role === 'architect' ? '/architect-dashboard' : '/homeowner-dashboard'}>
                Go to Dashboard
              </Link>
            </Button>
          )}
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold mb-2">For Homeowners</h3>
            <p className="text-gray-600">Discover unique designs and connect with professional architects to bring your vision to life.</p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold mb-2">For Architects</h3>
            <p className="text-gray-600">Showcase your portfolio, build your network, and connect with potential clients.</p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold mb-2">Design Community</h3>
            <p className="text-gray-600">Join a community of design enthusiasts, share ideas, and stay inspired.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
