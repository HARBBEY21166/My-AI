// API base URL - using the server port 8000
export const API_URL = 'http://localhost:8000/api';

// Ride types
export const RIDE_TYPES = {
  ECONOMY: 'economy',
  STANDARD: 'standard',
  PREMIUM: 'premium',
};

// Ride statuses
export const RIDE_STATUS = {
  PENDING: 'pending',
  DRIVER_ASSIGNED: 'driver_assigned',
  PICKING_UP: 'picking_up',
  ARRIVED: 'arrived',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Payment methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  CASH: 'cash',
};

// Default map region (New York City)
export const DEFAULT_MAP_REGION = {
  latitude: 40.7128,
  longitude: -74.0060,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Rating options
export const RATING_OPTIONS = [1, 2, 3, 4, 5];

// Application theme colors
export const COLORS = {
  PRIMARY: '#4A80F0',
  SECONDARY: '#F49D37',
  BACKGROUND: '#F8F8F8',
  TEXT: '#333333',
  ERROR: '#D32F2F',
  SUCCESS: '#4CAF50',
  LIGHT_TEXT: '#666666',
  BORDER: '#EEEEEE',
};
