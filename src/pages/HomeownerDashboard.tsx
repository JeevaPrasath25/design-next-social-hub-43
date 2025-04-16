import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImagePlus } from 'lucide-react';

const HomeownerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <DashboardSidebar user={user} />
        <main className="flex-1 px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Homeowner Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Generate AI Designs</CardTitle>
                  <CardDescription>
                    Use AI to visualize your dream home or space
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Create stunning visualizations of your design ideas using our AI-powered design generator.
                  </p>
                  <Button 
                    onClick={() => navigate('/homeowner-dashboard/ai-generator')}
                    className="w-full"
                  >
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Create AI Design
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Find Architects</CardTitle>
                  <CardDescription>
                    Connect with professional architects for your project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Browse our directory of talented architects and find the perfect match for your project.
                  </p>
                  <Button 
                    onClick={() => navigate('/explore-architects')}
                    className="w-full"
                  >
                    Explore Architects
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Additional dashboard content can be added here */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomeownerDashboard;
