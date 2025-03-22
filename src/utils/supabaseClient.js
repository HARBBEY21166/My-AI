import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fcpogalyoisdzcngjpbx.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjcG9nYWx5b2lzZHpjbmdqcGJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MzkyMTMsImV4cCI6MjA1ODIxNTIxM30.W-5Y9DWI9ketCRbxGxwuprR52JqwKHLH-9ZmLRKtJD0';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;