import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = 'https://lqrnkjdxxrnwiyghlaed.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxcm5ramR4eHJud2l5Z2hsYWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTQ3NjUsImV4cCI6MjA2NzYzMDc2NX0.QVASntY3WPs0Kx0aiVTA0y-0BUcfUoFTpcZKx6Ne-5g';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
