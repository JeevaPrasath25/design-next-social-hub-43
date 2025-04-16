
import React, { useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { useArchitectDashboard } from '@/hooks/useArchitectDashboard';
import { useArchitectRouting } from '@/hooks/useArchitectRouting';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardTabs from '@/components/dashboard/DashboardTabs';

const ArchitectDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
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
  );
};

export default ArchitectDashboard;
