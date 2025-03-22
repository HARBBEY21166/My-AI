import axios from 'axios';
import { API_URL } from '../utils/constants';

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

export const authApi = {
  // Register a new user
  register: async (name, email, phone, password) => {
    try {
      const response = await authInstance.post('/register', {
        name,
        email,
        phone,
        password,
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Login a user
  login: async (email, password) => {
    try {
      const response = await authInstance.post('/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Verify token validity
  verifyToken: async (token) => {
    try {
      const response = await authInstance.get('/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Update user profile
  updateProfile: async (token, userData) => {
    try {
      const response = await authInstance.put('/profile', userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      const response = await authInstance.post('/reset-password', {
        email,
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Change password
  changePassword: async (token, currentPassword, newPassword) => {
    try {
      const response = await authInstance.post(
        '/change-password',
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};
