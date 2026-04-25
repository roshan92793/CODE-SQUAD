import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hjpkglweeajapufpwono.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqcGtnbHdlZWFqYXB1ZnB3b25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMjgzODEsImV4cCI6MjA5MjcwNDM4MX0.kGyctV9aPFseD59bD4sSDVdefe8VjViG9HZG_UxQ5PY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
