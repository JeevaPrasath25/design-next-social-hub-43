
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get the current user and their profile data
  const getCurrentUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) return null;
      
      // Get the user profile from the users table
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error getting user profile:', error);
        return null;
      }
      
      if (!data) {
        // Create a default user profile if it doesn't exist
        const defaultUser: User = {
          id: authUser.id,
          email: authUser.email || '',
          username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'User',
          role: (authUser.user_metadata?.role || 'homeowner') as UserRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          avatar_url: null,
          bio: null,
          contact: null,
        };
        
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: defaultUser.id,
            email: defaultUser.email,
            username: defaultUser.username,
            role: defaultUser.role,
            created_at: defaultUser.created_at,
            updated_at: defaultUser.updated_at,
            avatar_url: defaultUser.avatar_url,
            bio: defaultUser.bio,
            contact_details: defaultUser.contact
          })
          .select()
          .single();
          
        if (insertError) {
          console.error('Error creating user profile:', insertError);
          return defaultUser;
        }
        
        return {
          ...newUser,
          role: newUser.role as UserRole,
          contact: newUser.contact_details
        } as User;
      }
      
      return {
        ...data,
        role: data.role as UserRole, 
        contact: data.contact_details
      } as User;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up the auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          setLoading(true);
          // Don't call other Supabase functions directly in the callback
          // Use setTimeout to defer the operation
          setTimeout(async () => {
            const user = await getCurrentUser();
            setUser(user);
            setLoading(false);
            
            // Redirect based on role
            if (user) {
              if (user.role === 'architect') {
                navigate('/architect-dashboard');
              } else if (user.role === 'homeowner') {
                navigate('/homeowner-dashboard');
              }
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/login');
        }
      }
    );

    // THEN check for existing session
    const initializeUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const user = await getCurrentUser();
          setUser(user);
          
          // Redirect based on role for initial load
          if (user) {
            if (user.role === 'architect') {
              navigate('/architect-dashboard');
            } else if (user.role === 'homeowner') {
              navigate('/homeowner-dashboard');
            }
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // User data will be set by the auth state listener
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
        duration: 3000,
      });
      
      // Auth state listener will handle redirects based on role
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
        duration: 3000,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string, role: UserRole) => {
    try {
      setLoading(true);
      
      // Sign up with Supabase Auth, including metadata for the trigger
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            role
          }
        }
      });
      
      if (error) throw error;
      
      // The users table entry will be created by the database trigger
      // If not, it will be handled in getCurrentUser
      
      toast({
        title: "Registration successful",
        description: "Please log in with your new account",
        duration: 3000,
      });
      
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
        duration: 3000,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
        duration: 3000,
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
