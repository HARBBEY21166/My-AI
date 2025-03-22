import axios from 'axios';
import { API_URL } from '../utils/constants';
import supabase from '../utils/supabaseClient';

// Create an axios instance for auth API calls
const authInstance = axios.create({
  baseURL: `${API_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Handle API errors
const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    throw new Error(error.response.data.message || 'Authentication failed');
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error('No response from server. Please check your internet connection.');
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(error.message || 'Error processing request');
  }
};

// Handle Supabase errors
const handleSupabaseError = (error) => {
  if (error.message) {
    throw new Error(error.message);
  } else {
    throw new Error('An error occurred with authentication');
  }
};

export const authApi = {
  // Register a new user with Supabase
  register: async (name, email, phone, password) => {
    try {
      // Register the user with Supabase
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
          },
        },
      });

      if (error) {
        handleSupabaseError(error);
      }

      // Get the session data
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Registration successful, but please check your email to confirm your account');
      }

      // Format the response to match our app's expected format
      return {
        token: session.access_token,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.user_metadata.name,
          phone: authData.user.user_metadata.phone,
          createdAt: authData.user.created_at,
        },
      };
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  // Login a user with Supabase
  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        handleSupabaseError(error);
      }

      // Format the response to match our app's expected format
      return {
        token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata.name,
          phone: data.user.user_metadata.phone,
          createdAt: data.user.created_at,
        },
      };
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  // Verify token validity with Supabase
  verifyToken: async (token) => {
    try {
      const { data, error } = await supabase.auth.getUser(token);

      if (error) {
        handleSupabaseError(error);
      }

      return {
        verified: true,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      };
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  // Update user profile with Supabase
  updateProfile: async (token, userData) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: userData.name,
          phone: userData.phone,
        },
      });

      if (error) {
        handleSupabaseError(error);
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata.name,
          phone: data.user.user_metadata.phone,
          updatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  // Reset password with Supabase
  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        handleSupabaseError(error);
      }

      return {
        message: 'If your email is registered, you will receive a password reset link',
      };
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  // Sign out with Supabase
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        handleSupabaseError(error);
      }
      
      return { success: true };
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  // Change password with Supabase
  changePassword: async (token, currentPassword, newPassword) => {
    try {
      // Supabase requires re-authentication before changing password
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError) {
        handleSupabaseError(authError);
      }
      
      // Re-authenticate with current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      
      if (signInError) {
        throw new Error('Current password is incorrect');
      }
      
      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (updateError) {
        handleSupabaseError(updateError);
      }
      
      return { message: 'Password changed successfully' };
    } catch (error) {
      handleSupabaseError(error);
    }
  },
};
