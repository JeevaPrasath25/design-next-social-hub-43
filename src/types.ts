
// User-related types
export type UserRole = 'architect' | 'homeowner';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
  bio: string | null;
  contact: string | null;
  contact_details?: string | null; // For database compatibility
  is_following?: boolean;
  is_hired?: boolean;
}

// Post-related types
export interface Post {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  design_type?: string;
  tags?: string[];
  hire_me?: boolean;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  is_saved?: boolean;
  user?: User;
}

// Stats types
export interface ProfileStats {
  followers_count: number;
  following_count: number;
  designs_count: number;
  is_following?: boolean;
  is_hired?: boolean;
}

// Interaction types
export interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower?: User;
}

export interface SavedPost {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
  post?: Post;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface HiredArchitect {
  id: string;
  homeowner_id: string;
  architect_id: string;
  created_at: string;
  architect?: User;
}
