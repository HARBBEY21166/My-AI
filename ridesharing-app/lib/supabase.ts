import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"
import { AppState } from "react-native"

// Replace with your Supabase URL and anon key
const supabaseUrl = "https://fcpogalyoisdzcngjpbx.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjcG9nYWx5b2lzZHpjbmdqcGJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MzkyMTMsImV4cCI6MjA1ODIxNTIxM30.W-5Y9DWI9ketCRbxGxwuprR52JqwKHLH-9ZmLRKtJD0"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

