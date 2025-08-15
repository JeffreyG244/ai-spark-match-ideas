import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tzskjzkolyiwhijslqmq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔗 Supabase client initialized:', SUPABASE_URL);