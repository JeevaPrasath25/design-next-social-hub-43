
import React, { useRef } from 'react';
import { User, ProfileStats, Post } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MyDesignsTab from '@/components/dashboard/MyDesignsTab';
import ConnectTab from '@/components/dashboard/ConnectTab';
import FollowersTab from '@/components/dashboard/FollowersTab';
import FollowingTab from '@/components/dashboard/FollowingTab';

interface DashboardTabsProps {
  defaultTab: string;
  posts: Post[];
  followers: User[];
  following: User[];
  otherArchitects: User[];
  loading: boolean;
  currentUser: User;
  openPostDialog: () => void;
  onToggleHireStatus: (postId: string, currentStatus: boolean) => Promise<void>;
  onFollowToggle: (userId: string, isFollowing: boolean) => Promise<void>;
  followingTabRef: React.RefObject<HTMLButtonElement>;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  defaultTab,
  posts,
  followers,
  following,
  otherArchitects,
  loading,
  currentUser,
  openPostDialog,
  onToggleHireStatus,
  onFollowToggle,
  followingTabRef
}) => {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
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
          posts={posts}
          loading={loading}
          openPostDialog={openPostDialog}
          onToggleHireStatus={onToggleHireStatus}
        />
      </TabsContent>
      
      <TabsContent value="connect">
        <ConnectTab 
          architects={otherArchitects}
          loading={loading}
          currentUser={currentUser}
          onFollowToggle={onFollowToggle}
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
          onUnfollow={(userId) => onFollowToggle(userId, true)}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
