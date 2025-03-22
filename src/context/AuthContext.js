import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../api/authApi';
import supabase from '../utils/supabaseClient';

// Create the context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    user: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for session on app start and set up listener
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if we have a stored session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          setIsLoading(false);
          return;
        }
        
        if (session) {
          // Get user data
          const { data: { user } } = await supabase.auth.getUser();
          const userData = {
            id: user.id,
            email: user.email,
            name: user?.user_metadata?.name || '',
            phone: user?.user_metadata?.phone || '',
            createdAt: user.created_at,
          };
          
          // Update auth state
          setAuthState({
            token: session.access_token,
            user: userData,
            isAuthenticated: true,
          });
          
          // Store user data
          await SecureStore.setItemAsync('userData', JSON.stringify(userData));
        }
      } catch (e) {
        console.error('Error loading auth session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          // Get user data
          const { data: { user } } = await supabase.auth.getUser();
          const userData = {
            id: user.id,
            email: user.email,
            name: user?.user_metadata?.name || '',
            phone: user?.user_metadata?.phone || '',
            createdAt: user.created_at,
          };
          
          // Update auth state
          setAuthState({
            token: session.access_token,
            user: userData,
            isAuthenticated: true,
          });
          
          // Store user data
          await SecureStore.setItemAsync('userData', JSON.stringify(userData));
        } else if (event === 'SIGNED_OUT') {
          // Clear auth state
          setAuthState({
            token: null,
            user: null,
            isAuthenticated: false,
          });
          
          // Clear stored data
          await SecureStore.deleteItemAsync('userData');
        }
      }
    );

    // Check session on start
    checkSession();

    // Cleanup
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign in
  const signIn = async ({ email, password }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login(email, password);
      
      // Store user data
      await SecureStore.setItemAsync('userData', JSON.stringify(response.user));
      
      // Auth state will be updated by the listener
    } catch (e) {
      setError(e.message || 'An error occurred during sign in');
      console.error('Sign in error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up
  const signUp = async ({ name, email, phone, password }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.register(name, email, phone, password);
      
      // Store user data
      await SecureStore.setItemAsync('userData', JSON.stringify(response.user));
      
      // Auth state will be updated by the listener
    } catch (e) {
      setError(e.message || 'An error occurred during sign up');
      console.error('Sign up error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    setIsLoading(true);
    
    try {
      // Sign out with Supabase
      await authApi.signOut();
      
      // Auth state will be updated by the listener
    } catch (e) {
      console.error('Sign out error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.updateProfile(authState.token, userData);
      
      // Update stored user data
      const updatedUser = { ...authState.user, ...response.user };
      await SecureStore.setItemAsync('userData', JSON.stringify(updatedUser));
      
      setAuthState({
        ...authState,
        user: updatedUser,
      });
      
      return updatedUser;
    } catch (e) {
      setError(e.message || 'An error occurred while updating your profile');
      console.error('Update profile error:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Provide the auth context value
  const authContext = {
    authState,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};
