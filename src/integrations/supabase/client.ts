
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://cxwwtlxqmhgxozcgazvk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4d3d0bHhxbWhneG96Y2dhenZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NzEzNjEsImV4cCI6MjA1NzM0NzM2MX0.86rCxvb26A7UrPUd0xx3GjQ5U7nlprkJ-Pf97erQcE8";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
