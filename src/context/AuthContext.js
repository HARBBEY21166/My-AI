import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../api/authApi';

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

  // Check for token on app start
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const userData = await SecureStore.getItemAsync('userData');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          setAuthState({
            token,
            user,
            isAuthenticated: true,
          });
          
          // Verify the token with the server
          try {
            await authApi.verifyToken(token);
          } catch (error) {
            // Token is invalid, clear storage
            await SecureStore.deleteItemAsync('userToken');
            await SecureStore.deleteItemAsync('userData');
            setAuthState({
              token: null,
              user: null,
              isAuthenticated: false,
            });
          }
        }
      } catch (e) {
        console.error('Error loading auth token:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  // Sign in
  const signIn = async ({ email, password }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login(email, password);
      
      // Store token and user data
      await SecureStore.setItemAsync('userToken', response.token);
      await SecureStore.setItemAsync('userData', JSON.stringify(response.user));
      
      setAuthState({
        token: response.token,
        user: response.user,
        isAuthenticated: true,
      });
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
      
      // Store token and user data
      await SecureStore.setItemAsync('userToken', response.token);
      await SecureStore.setItemAsync('userData', JSON.stringify(response.user));
      
      setAuthState({
        token: response.token,
        user: response.user,
        isAuthenticated: true,
      });
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
      // Clear stored data
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
      
      setAuthState({
        token: null,
        user: null,
        isAuthenticated: false,
      });
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
