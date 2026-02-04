import { createClient } from '@supabase/supabase-js'

// --- DIRECT KEYS FOR PRODUCTION FIX ---
const supabaseUrl = 'https://ugjvckpqatrnmjzuudkn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnanZja3BxYXRybm1qenV1ZGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDA2NTgsImV4cCI6MjA4NTQ3NjY1OH0.ClsGEiOyDoQWi8iEQNGWcBQu7hbcDOt3LWTpSnRqnME'

export const supabase = createClient(supabaseUrl, supabaseKey)