export type UserRole = 'architect' | 'homeowner';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  contact?: string;
  created_at: string;
  avatar_url?: string; 
  bio?: string;
  contact_details?: string;
  updated_at?: string;
  is_following?: boolean; // Added for UI state
  is_hired?: boolean; // Added for UI state
}

export interface Post {
  id: string;
  title: string;
  description: string;
  image_url: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  user?: User;
  likes_count?: number;
  is_liked?: boolean;
  is_saved?: boolean;
  design_type?: string; // Added field
  tags?: string[]; // Added field
  hire_me?: boolean; // Added field
}

export interface ProfileStats {
  followers_count: number;
  following_count: number;
  designs_count: number;
  is_following?: boolean;
  is_hired?: boolean;
}

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
