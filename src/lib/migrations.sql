
-- Create schema for our application
CREATE SCHEMA IF NOT EXISTS public;

-- Enable RLS
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hired_architects ENABLE ROW LEVEL SECURITY;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('architect', 'homeowner')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  contact_details TEXT
);

-- Create posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  design_type TEXT,
  tags TEXT[],
  hire_me BOOLEAN DEFAULT false
);

-- Create likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, post_id)
);

-- Create saved_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.saved_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, post_id)
);

-- Create follows table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(follower_id, following_id)
);

-- Create hired_architects table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.hired_architects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  homeowner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  architect_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(homeowner_id, architect_id)
);

-- Add missing columns to posts table if they don't exist
DO $$ 
BEGIN
    -- Add design_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'design_type') THEN
        ALTER TABLE posts ADD COLUMN design_type text;
    END IF;

    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'tags') THEN
        ALTER TABLE posts ADD COLUMN tags text[];
    END IF;

    -- Add hire_me column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'hire_me') THEN
        ALTER TABLE posts ADD COLUMN hire_me boolean DEFAULT false;
    END IF;
END $$;

-- Function to create a trigger to automatically create a user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, username, role, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'homeowner'),
    now(),
    now()
  );
  RETURN new;
END;
$$;

-- Trigger to create a user profile when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Create RLS policies

-- Users policies
CREATE POLICY IF NOT EXISTS "Users can read all profiles"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Posts policies
CREATE POLICY IF NOT EXISTS "Anyone can read posts"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Architects can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'architect')
  );

CREATE POLICY IF NOT EXISTS "Architects can update their own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Architects can delete their own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY IF NOT EXISTS "Anyone can read likes"
  ON public.likes FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Users can create their own likes"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- Saved posts policies
CREATE POLICY IF NOT EXISTS "Users can read their own saved posts"
  ON public.saved_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can save posts"
  ON public.saved_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can unsave posts"
  ON public.saved_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY IF NOT EXISTS "Anyone can read follows"
  ON public.follows FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Users can follow others"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY IF NOT EXISTS "Users can unfollow others"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Hired architects policies
CREATE POLICY IF NOT EXISTS "Anyone can read hired architects"
  ON public.hired_architects FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Homeowners can hire architects"
  ON public.hired_architects FOR INSERT
  WITH CHECK (
    auth.uid() = homeowner_id AND 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'homeowner') AND
    EXISTS (SELECT 1 FROM public.users WHERE id = architect_id AND role = 'architect')
  );

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at column
DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_posts_updated_at ON public.posts;
CREATE TRIGGER trigger_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
