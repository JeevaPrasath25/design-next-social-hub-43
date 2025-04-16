
import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { useArchitectDashboard } from '@/hooks/useArchitectDashboard';
import { useArchitectRouting } from '@/hooks/useArchitectRouting';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Toaster } from '@/components/ui/toaster';

const ArchitectDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  
  const postDesignRef = useRef<HTMLDivElement>(null);
  const followingTabRef = useRef<HTMLButtonElement>(null);
  
  const {
    loading,
    stats,
    myPosts,
    followers,
    following,
    otherArchitects,
    postDialogOpen,
    setPostDialogOpen,
    refreshData,
    handleToggleFollow,
    handleToggleHireStatus
  } = useArchitectDashboard(user);
  
  const { getDefaultTab } = useArchitectRouting({
    user,
    setPostDialogOpen,
    postDesignRef,
    followingTabRef
  });

  // Add fade-in effect when component mounts
  useEffect(() => {
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className={`flex transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <DashboardSidebar user={user} />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex flex-col space-y-6">
            <DashboardHeader
              user={user}
              stats={stats}
              postDialogOpen={postDialogOpen}
              setPostDialogOpen={setPostDialogOpen}
              refreshData={refreshData}
              updateUser={updateUser}
              postDesignRef={postDesignRef}
            />
            
            <DashboardTabs
              defaultTab={getDefaultTab()}
              posts={myPosts}
              followers={followers}
              following={following}
              otherArchitects={otherArchitects}
              loading={loading}
              currentUser={user}
              openPostDialog={() => setPostDialogOpen(true)}
              onToggleHireStatus={handleToggleHireStatus}
              onFollowToggle={handleToggleFollow}
              followingTabRef={followingTabRef}
            />
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default ArchitectDashboard;
