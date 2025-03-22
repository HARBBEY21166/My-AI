import axios from 'axios';
import { API_URL } from '../utils/constants';
import { generateMockLocations, generateMockPlaceDetails } from '../utils/mockData';

// Create an axios instance for location API calls
const locationInstance = axios.create({
  baseURL: `${API_URL}/location`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Handle API errors
const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    throw new Error(error.response.data.message || 'Location service error');
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error('No response from server. Please check your internet connection.');
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(error.message || 'Error processing request');
  }
};

export const locationApi = {
  // Search for places by query
  searchPlaces: async (query) => {
    try {
      const response = await locationInstance.get('/search', {
        params: { query },
      });
      return response.data;
    } catch (error) {
      console.log('Error searching for places, using mock data:', error);
      // For development purposes, return mock data
      return generateMockLocations(query);
    }
  },

  // Get place details by ID
  getPlaceDetails: async (placeId) => {
    try {
      const response = await locationInstance.get(`/place/${placeId}`);
      return response.data;
    } catch (error) {
      console.log('Error getting place details, using mock data:', error);
      // For development purposes, return mock data
      return generateMockPlaceDetails(placeId);
    }
  },

  // Reverse geocode coordinates to address
  reverseGeocode: async (latitude, longitude) => {
    try {
      const response = await locationInstance.get('/reverse-geocode', {
        params: { latitude, longitude },
      });
      return response.data;
    } catch (error) {
      console.log('Error reverse geocoding, using fallback:', error);
      // Fallback to a simple format
      return {
        address: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
      };
    }
  },

  // Get directions between two points
  getDirections: async (origin, destination, waypoints = []) => {
    try {
      const response = await locationInstance.post('/directions', {
        origin,
        destination,
        waypoints,
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Estimate travel time and distance
  estimateTrip: async (origin, destination) => {
    try {
      const response = await locationInstance.post('/estimate', {
        origin,
        destination,
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};
