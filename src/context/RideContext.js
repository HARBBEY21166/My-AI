import React, { createContext, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { rideApi } from '../api/rideApi';
import { paymentApi } from '../api/paymentApi';

// Create the context
export const RideContext = createContext();

export const RideProvider = ({ children }) => {
  const { authState } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeRide, setActiveRide] = useState(null);

  // Request a new ride
  const requestRide = async (rideDetails) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await rideApi.requestRide(authState.token, rideDetails);
      setActiveRide(response);
      return response;
    } catch (e) {
      setError(e.message || 'Error requesting ride');
      console.error('Request ride error:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Find a driver for the ride
  const findDriver = async (rideId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await rideApi.findDriver(authState.token, rideId);
      
      // Update active ride with driver info
      if (activeRide && activeRide.rideId === rideId) {
        setActiveRide({
          ...activeRide,
          driver: response,
          status: 'driver_assigned'
        });
      }
      
      return response;
    } catch (e) {
      setError(e.message || 'Error finding driver');
      console.error('Find driver error:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Get ride status
  const getRideStatus = async (rideId) => {
    try {
      const response = await rideApi.getRideStatus(authState.token, rideId);
      
      // Update active ride status
      if (activeRide && activeRide.rideId === rideId) {
        setActiveRide({
          ...activeRide,
          status: response.status
        });
      }
      
      return response;
    } catch (e) {
      console.error('Get ride status error:', e);
      throw e;
    }
  };

  // Update ride status
  const updateRideStatus = async (rideId, status) => {
    try {
      const response = await rideApi.updateRideStatus(authState.token, rideId, status);
      
      // Update active ride status
      if (activeRide && activeRide.rideId === rideId) {
        setActiveRide({
          ...activeRide,
          status: response.status
        });
      }
      
      return response;
    } catch (e) {
      console.error('Update ride status error:', e);
      throw e;
    }
  };

  // Cancel a ride
  const cancelRide = async (rideId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await rideApi.cancelRide(authState.token, rideId);
      
      // Clear active ride if it's the one being canceled
      if (activeRide && activeRide.rideId === rideId) {
        setActiveRide(null);
      }
      
      return response;
    } catch (e) {
      setError(e.message || 'Error canceling ride');
      console.error('Cancel ride error:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Get ride details
  const getRideDetails = async (rideId) => {
    try {
      const response = await rideApi.getRideDetails(authState.token, rideId);
      return response;
    } catch (e) {
      console.error('Get ride details error:', e);
      throw e;
    }
  };

  // Process payment for a ride
  const processPayment = async (rideId, paymentDetails) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await paymentApi.processPayment(
        authState.token,
        rideId,
        paymentDetails
      );
      
      // Update active ride status
      if (activeRide && activeRide.rideId === rideId) {
        setActiveRide({
          ...activeRide,
          status: 'completed',
          payment: {
            status: 'paid',
            method: paymentDetails.method,
            amount: paymentDetails.amount
          }
        });
      }
      
      return response;
    } catch (e) {
      setError(e.message || 'Error processing payment');
      console.error('Process payment error:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Submit rating for a ride
  const submitRating = async (rideId, ratingDetails) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await rideApi.submitRating(
        authState.token,
        rideId,
        ratingDetails
      );
      
      // Clear active ride after rating is submitted
      if (activeRide && activeRide.rideId === rideId) {
        setActiveRide(null);
      }
      
      return response;
    } catch (e) {
      setError(e.message || 'Error submitting rating');
      console.error('Submit rating error:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Get ride history
  const getRideHistory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await rideApi.getRideHistory(authState.token);
      return response;
    } catch (e) {
      setError(e.message || 'Error getting ride history');
      console.error('Get ride history error:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Provide the ride context value
  const rideContext = {
    activeRide,
    isLoading,
    error,
    requestRide,
    findDriver,
    getRideStatus,
    updateRideStatus,
    cancelRide,
    getRideDetails,
    processPayment,
    submitRating,
    getRideHistory,
  };

  return (
    <RideContext.Provider value={rideContext}>
      {children}
    </RideContext.Provider>
  );
};
