// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://olwapbbjgyahmtpgbrgt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sd2FwYmJqZ3lhaG10cGdicmd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MDcxNDAsImV4cCI6MjA2MDI4MzE0MH0.Dpkk9f-93mLciLrvbfjTkm9b7c4UVjB1qmdS2mTQJpM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);