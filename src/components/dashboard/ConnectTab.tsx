
import React from 'react';
import { User } from '@/types';
import ArchitectCard from '@/components/ArchitectCard';

interface ConnectTabProps {
  architects: User[];
  loading: boolean;
  currentUser: User | null;
  onFollowToggle: (architectId: string, isFollowing: boolean) => Promise<void>;
}

const ConnectTab: React.FC<ConnectTabProps> = ({ 
  architects, 
  loading, 
  currentUser, 
  onFollowToggle 
}) => {
  return (
    <>
      {loading ? (
        <div className="text-center py-12">Loading architects...</div>
      ) : architects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No other architects found.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {architects.map(architect => (
            <ArchitectCard
              key={architect.id}
              architect={architect}
              currentUser={currentUser}
              onFollowToggle={onFollowToggle}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ConnectTab;
