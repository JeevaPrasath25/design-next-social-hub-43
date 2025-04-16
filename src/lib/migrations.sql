
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
