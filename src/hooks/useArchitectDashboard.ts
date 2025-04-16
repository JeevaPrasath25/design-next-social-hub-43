
import { useState, useEffect } from 'react';
import { User, Post, ProfileStats } from '@/types';
import { 
  getPosts, 
  getProfileStats, 
  getFollowers, 
  getFollowing, 
  toggleFollow, 
  toggleHireStatus, 
  getArchitects 
} from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export const useArchitectDashboard = (user: User | null) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    followers_count: 0,
    following_count: 0,
    designs_count: 0,
  });
  const [otherArchitects, setOtherArchitects] = useState<User[]>([]);
  const [postDialogOpen, setPostDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get posts
        const fetchedPosts = await getPosts(user.id);
        setMyPosts(fetchedPosts);
        
        // Get profile stats
        const profileStats = await getProfileStats(user.id);
        setStats(profileStats);
        
        // Get followers and following
        const followersData = await getFollowers(user.id);
        setFollowers(followersData.map(f => f.follower!));
        
        const followingData = await getFollowing(user.id);
        setFollowing(followingData.map(f => f.following!));
        
        // Get other architects for the "Connect" tab
        const architectsData = await getArchitects(user.id);
        setOtherArchitects(architectsData.filter(arch => arch.id !== user.id));
      } catch (error) {
        console.error('Error fetching architect dashboard data:', error);
        toast({
          title: "Error loading data",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);

  const refreshData = async () => {
    if (!user) return;
    
    try {
      const fetchedPosts = await getPosts(user.id);
      setMyPosts(fetchedPosts);
      
      const profileStats = await getProfileStats(user.id);
      setStats(profileStats);
      
      // Refresh followers and following
      const followersData = await getFollowers(user.id);
      setFollowers(followersData.map(f => f.follower!));
      
      const followingData = await getFollowing(user.id);
      setFollowing(followingData.map(f => f.following!));
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const handleToggleFollow = async (architectId: string, isFollowing: boolean) => {
    if (!user) return;
    
    try {
      await toggleFollow(user.id, architectId, isFollowing);
      
      // Update architects state
      setOtherArchitects(prev => prev.map(architect => {
        if (architect.id === architectId) {
          return {
            ...architect,
            is_following: !isFollowing
          };
        }
        return architect;
      }));
      
      // Refresh following list
      const followingData = await getFollowing(user.id);
      setFollowing(followingData.map(f => f.following!));
      
      // Update stats
      const profileStats = await getProfileStats(user.id);
      setStats(profileStats);
      
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing 
          ? "You are no longer following this architect" 
          : "You are now following this architect",
      });
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Could not update follow status",
        variant: "destructive",
      });
    }
  };

  const handleToggleHireStatus = async (postId: string, currentStatus: boolean) => {
    if (!user) return;

    try {
      await toggleHireStatus(postId, currentStatus);
      
      // Update posts list
      setMyPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, hire_me: !currentStatus };
        }
        return p;
      }));
      
      toast({
        title: currentStatus ? "Not available for hire" : "Available for hire",
        description: currentStatus 
          ? "You are no longer showing as available for this design" 
          : "You are now showing as available for this design",
      });
    } catch (error) {
      console.error('Error toggling hire status:', error);
      toast({
        title: "Error",
        description: "Could not update availability status",
        variant: "destructive",
      });
    }
  };

  return {
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
  };
};
