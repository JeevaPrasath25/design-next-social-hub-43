
import React from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ProfileSummaryCard from '@/components/profile/ProfileSummaryCard';
import ProfileSettingsCard from '@/components/profile/ProfileSettingsCard';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <DashboardSidebar user={user} />
        <main className="flex-1 px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Summary Card */}
              <div className="w-full md:w-1/3">
                <ProfileSummaryCard user={user} />
              </div>
              
              {/* Profile Settings Card */}
              <div className="w-full md:w-2/3">
                <ProfileSettingsCard user={user} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
