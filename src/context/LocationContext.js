import React, { createContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { locationApi } from '../api/locationApi';

// Create the context
export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchLocationSubscription, setWatchLocationSubscription] = useState(null);

  // Get initial location on component mount
  useEffect(() => {
    getCurrentLocation();
    
    // Clean up any subscriptions when unmounting
    return () => {
      if (watchLocationSubscription) {
        watchLocationSubscription.remove();
      }
    };
  }, []);

  // Get current location
  const getCurrentLocation = async () => {
    setIsLocationLoading(true);
    setError(null);
    
    try {
      // Check if we have location permissions
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError({ message: 'Permission to access location was denied' });
        setIsLocationLoading(false);
        return;
      }
      
      // Get the current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      
      // Reverse geocode to get address
      const address = await reverseGeocode(
        location.coords.latitude,
        location.coords.longitude
      );
      
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address,
      });
      
      // Start watching location
      startWatchingLocation();
    } catch (e) {
      setError({ message: e.message || 'Error getting current location' });
      console.error('Get current location error:', e);
    } finally {
      setIsLocationLoading(false);
    }
  };

  // Start watching location changes
  const startWatchingLocation = async () => {
    try {
      // Check if we have location permissions
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        return;
      }
      
      // Start watching location
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10, // update every 10 meters
          timeInterval: 5000, // or every 5 seconds
        },
        async (location) => {
          // Reverse geocode to get address
          const address = await reverseGeocode(
            location.coords.latitude,
            location.coords.longitude
          );
          
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            address,
          });
        }
      );
      
      setWatchLocationSubscription(subscription);
    } catch (e) {
      console.error('Start watching location error:', e);
    }
  };

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (latitude, longitude) => {
    try {
      // Get address using Expo Location
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      if (results && results.length > 0) {
        const { street, city, region, postalCode, country } = results[0];
        return `${street || ''}, ${city || ''}, ${region || ''} ${postalCode || ''}, ${country || ''}`;
      }
      
      // If Expo Location fails, use our API
      const response = await locationApi.reverseGeocode(latitude, longitude);
      return response.address;
    } catch (e) {
      console.error('Reverse geocode error:', e);
      return 'Unknown location';
    }
  };

  // Search for places by query
  const searchPlaces = async (query) => {
    try {
      const results = await locationApi.searchPlaces(query);
      return results;
    } catch (e) {
      console.error('Search places error:', e);
      throw e;
    }
  };

  // Get place details by ID
  const getPlaceDetails = async (placeId) => {
    try {
      const details = await locationApi.getPlaceDetails(placeId);
      return details;
    } catch (e) {
      console.error('Get place details error:', e);
      throw e;
    }
  };

  // Provide the location context value
  const locationContext = {
    currentLocation,
    isLocationLoading,
    error,
    getCurrentLocation,
    searchPlaces,
    getPlaceDetails,
  };

  return (
    <LocationContext.Provider value={locationContext}>
      {children}
    </LocationContext.Provider>
  );
};
