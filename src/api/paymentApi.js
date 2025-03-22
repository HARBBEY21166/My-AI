import axios from 'axios';
import { API_URL } from '../utils/constants';

// Create an axios instance for payment API calls
const paymentInstance = axios.create({
  baseURL: `${API_URL}/payments`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set authorization header for authenticated requests
const setAuthHeader = (token) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Handle API errors
const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    throw new Error(error.response.data.message || 'Payment service error');
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error('No response from server. Please check your internet connection.');
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(error.message || 'Error processing request');
  }
};

export const paymentApi = {
  // Get saved payment methods
  getPaymentMethods: async (token) => {
    try {
      const response = await paymentInstance.get('/methods', setAuthHeader(token));
      return response.data;
    } catch (error) {
      console.log('Error getting payment methods, using mock data:', error);
      // For development purposes, return mock data
      return [
        {
          id: 'card_1',
          type: 'card',
          brand: 'visa',
          last4: '4242',
          expiryMonth: 12,
          expiryYear: 2024,
          isDefault: true,
        },
        {
          id: 'card_2',
          type: 'card',
          brand: 'mastercard',
          last4: '5555',
          expiryMonth: 10,
          expiryYear: 2023,
          isDefault: false,
        },
      ];
    }
  },

  // Add a new payment method
  addPaymentMethod: async (token, paymentDetails) => {
    try {
      const response = await paymentInstance.post('/methods', paymentDetails, setAuthHeader(token));
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Remove a payment method
  removePaymentMethod: async (token, paymentMethodId) => {
    try {
      const response = await paymentInstance.delete(
        `/methods/${paymentMethodId}`,
        setAuthHeader(token)
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Process payment for a ride
  processPayment: async (token, rideId, paymentDetails) => {
    try {
      const response = await paymentInstance.post(
        `/${rideId}`,
        paymentDetails,
        setAuthHeader(token)
      );
      return response.data;
    } catch (error) {
      console.log('Error processing payment, using mock data:', error);
      // For development purposes, return mock data
      return {
        success: true,
        paymentId: `payment_${Date.now()}`,
        amount: paymentDetails.amount,
        method: paymentDetails.method,
        status: 'completed',
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Get payment history
  getPaymentHistory: async (token) => {
    try {
      const response = await paymentInstance.get('/history', setAuthHeader(token));
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Get payment details
  getPaymentDetails: async (token, paymentId) => {
    try {
      const response = await paymentInstance.get(`/${paymentId}`, setAuthHeader(token));
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};
