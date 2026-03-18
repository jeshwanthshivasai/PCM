import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nopfkuiufaxxrhlvijht.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vcGZrdWl1ZmF4eHJobHZpamh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzgxNjQ3NywiZXhwIjoyMDg5MzkyNDc3fQ.36oN6x-xc2K84-js0xxeu45-foWa_iXmrlzoHLvXi0g';

export const supabase = createClient(supabaseUrl, supabaseKey);
