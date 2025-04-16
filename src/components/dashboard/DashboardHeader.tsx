
import React from 'react';
import { User, ProfileStats } from '@/types';
import StatsCards from '@/components/dashboard/StatsCards';
import ProfileCard from '@/components/dashboard/ProfileCard';
import PostDesignDialog from '@/components/dashboard/PostDesignDialog';

interface DashboardHeaderProps {
  user: User;
  stats: ProfileStats;
  postDialogOpen: boolean;
  setPostDialogOpen: (open: boolean) => void;
  refreshData: () => void;
  updateUser: (user: User) => void;
  postDesignRef: React.RefObject<HTMLDivElement>;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  stats,
  postDialogOpen,
  setPostDialogOpen,
  refreshData,
  updateUser,
  postDesignRef
}) => {
  return (
    <>
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
    </>
  );
};

export default DashboardHeader;
