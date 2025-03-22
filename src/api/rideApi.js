import axios from 'axios';
import { API_URL } from '../utils/constants';
import { 
  generateMockRideResponse, 
  generateMockDriver, 
  generateMockRideStatus,
  generateMockRideDetails,
  generateMockRideHistory
} from '../utils/mockData';

// Create an axios instance for ride API calls
const rideInstance = axios.create({
  baseURL: `${API_URL}/rides`,
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
    throw new Error(error.response.data.message || 'Ride service error');
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error('No response from server. Please check your internet connection.');
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(error.message || 'Error processing request');
  }
};

export const rideApi = {
  // Request a new ride
  requestRide: async (token, rideDetails) => {
    try {
      const response = await rideInstance.post('/', rideDetails, setAuthHeader(token));
      return response.data;
    } catch (error) {
      console.log('Error requesting ride, using mock data:', error);
      // For development purposes, return mock data
      return generateMockRideResponse(rideDetails);
    }
  },

  // Find a driver for a ride
  findDriver: async (token, rideId) => {
    try {
      const response = await rideInstance.get(`/${rideId}/driver`, setAuthHeader(token));
      return response.data;
    } catch (error) {
      console.log('Error finding driver, using mock data:', error);
      // For development purposes, return mock data
      return generateMockDriver();
    }
  },

  // Get ride status
  getRideStatus: async (token, rideId) => {
    try {
      const response = await rideInstance.get(`/${rideId}/status`, setAuthHeader(token));
      return response.data;
    } catch (error) {
      console.log('Error getting ride status, using mock data:', error);
      // For development purposes, return mock data
      return generateMockRideStatus();
    }
  },

  // Update ride status
  updateRideStatus: async (token, rideId, status) => {
    try {
      const response = await rideInstance.put(
        `/${rideId}/status`,
        { status },
        setAuthHeader(token)
      );
      return response.data;
    } catch (error) {
      console.log('Error updating ride status, using mock data:', error);
      // For development purposes, return mock data
      return { status };
    }
  },

  // Cancel a ride
  cancelRide: async (token, rideId) => {
    try {
      const response = await rideInstance.post(`/${rideId}/cancel`, {}, setAuthHeader(token));
      return response.data;
    } catch (error) {
      console.log('Error canceling ride, using mock data:', error);
      // For development purposes, return mock data
      return { success: true, message: 'Ride cancelled successfully' };
    }
  },

  // Get ride details
  getRideDetails: async (token, rideId) => {
    try {
      const response = await rideInstance.get(`/${rideId}`, setAuthHeader(token));
      return response.data;
    } catch (error) {
      console.log('Error getting ride details, using mock data:', error);
      // For development purposes, return mock data
      return generateMockRideDetails(rideId);
    }
  },

  // Submit rating for a ride
  submitRating: async (token, rideId, ratingDetails) => {
    try {
      const response = await rideInstance.post(
        `/${rideId}/rating`,
        ratingDetails,
        setAuthHeader(token)
      );
      return response.data;
    } catch (error) {
      console.log('Error submitting rating, using mock data:', error);
      // For development purposes, return mock data
      return { 
        success: true, 
        message: 'Rating submitted successfully',
        rating: ratingDetails.rating 
      };
    }
  },

  // Get ride history
  getRideHistory: async (token) => {
    try {
      const response = await rideInstance.get('/history', setAuthHeader(token));
      return response.data;
    } catch (error) {
      console.log('Error getting ride history, using mock data:', error);
      // For development purposes, return mock data
      return generateMockRideHistory();
    }
  },
};
