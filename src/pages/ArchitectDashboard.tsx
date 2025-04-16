import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/ui/use-toast';
import { useArchitectDashboard } from '@/hooks/useArchitectDashboard';
import StatsCards from '@/components/dashboard/StatsCards';
import ProfileCard from '@/components/dashboard/ProfileCard';
import PostDesignDialog from '@/components/dashboard/PostDesignDialog';
import MyDesignsTab from '@/components/dashboard/MyDesignsTab';
import ConnectTab from '@/components/dashboard/ConnectTab';
import FollowersTab from '@/components/dashboard/FollowersTab';
import FollowingTab from '@/components/dashboard/FollowingTab';

const ArchitectDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
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
  
  const getDefaultTab = () => {
    if (location.hash === '#following') return 'following';
    if (location.hash === '#post-design') {
      setTimeout(() => setPostDialogOpen(true), 300);
      return 'my-designs';
    }
    return 'my-designs';
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'architect') {
      navigate('/homeowner-dashboard');
      return;
    }
    
    if (location.hash === '#post-design') {
      setPostDialogOpen(true);
      if (postDesignRef.current) {
        postDesignRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (location.hash === '#following') {
      if (followingTabRef.current) {
        followingTabRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [user, navigate, location.hash]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container px-4 py-8">
        <div className="flex flex-col space-y-6">
          <StatsCards stats={stats} />
          
          <ProfileCard user={user} updateUser={updateUser} />
          
          <div className="flex justify-end" ref={postDesignRef} id="post-design">
            <PostDesignDialog
              user={user}
              open={postDialogOpen}
              onOpenChange={setPostDialogOpen}
              onSuccess={refreshData}
            />
          </div>
          
          <Tabs defaultValue={getDefaultTab()} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="my-designs">My Designs</TabsTrigger>
              <TabsTrigger value="connect">Connect</TabsTrigger>
              <TabsTrigger value="followers">Followers</TabsTrigger>
              <TabsTrigger 
                value="following" 
                ref={followingTabRef}
                id="following"
              >Following</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-designs">
              <MyDesignsTab 
                posts={myPosts}
                loading={loading}
                openPostDialog={() => setPostDialogOpen(true)}
                onToggleHireStatus={handleToggleHireStatus}
              />
            </TabsContent>
            
            <TabsContent value="connect">
              <ConnectTab 
                architects={otherArchitects}
                loading={loading}
                currentUser={user}
                onFollowToggle={handleToggleFollow}
              />
            </TabsContent>
            
            <TabsContent value="followers">
              <FollowersTab 
                followers={followers}
                loading={loading}
              />
            </TabsContent>
            
            <TabsContent value="following">
              <FollowingTab 
                following={following}
                loading={loading}
                onUnfollow={(userId) => handleToggleFollow(userId, true)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ArchitectDashboard;
