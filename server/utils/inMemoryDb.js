const { v4: uuidv4 } = require('uuid');

// In-memory database

// Users collection
const users = [
  {
    id: 'user_1',
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1 (555) 123-4567',
    password: '$2a$10$xJP3mWf6WmdmUs4nNjkrOe6Q3Hl8UeZZh5KHw/XVGubMPcqw9YaH.', // 'password'
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rides: [],
    paymentMethods: [
      {
        id: 'pm_1',
        type: 'card',
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

// Drivers collection
const drivers = [
  {
    id: 'driver_1',
    name: 'John Smith',
    phone: '+1 (555) 123-4567',
    email: 'john.smith@example.com',
    rating: 4.8,
    photo: 'https://ui-avatars.com/api/?name=John+Smith&background=0D8ABC&color=fff',
    car: {
      model: 'Toyota Camry',
      color: 'Silver',
      plate: 'ABC 123',
    },
    location: {
      latitude: 40.7431,
      longitude: -73.9712,
    },
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'driver_2',
    name: 'Sarah Johnson',
    phone: '+1 (555) 987-6543',
    email: 'sarah.johnson@example.com',
    rating: 4.9,
    photo: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=F0812B&color=fff',
    car: {
      model: 'Honda Accord',
      color: 'Black',
      plate: 'XYZ 789',
    },
    location: {
      latitude: 40.7589,
      longitude: -73.9851,
    },
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'driver_3',
    name: 'Michael Chen',
    phone: '+1 (555) 234-5678',
    email: 'michael.chen@example.com',
    rating: 4.7,
    photo: 'https://ui-avatars.com/api/?name=Michael+Chen&background=4A80F0&color=fff',
    car: {
      model: 'Tesla Model 3',
      color: 'White',
      plate: 'EV 1234',
    },
    location: {
      latitude: 40.7549,
      longitude: -73.9840,
    },
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Rides collection
const rides = [
  {
    rideId: 'ride_1',
    userId: 'user_1',
    driverId: 'driver_2',
    origin: {
      address: 'Times Square, New York, NY, USA',
      latitude: 40.7580,
      longitude: -73.9855,
    },
    destination: {
      address: 'Central Park, New York, NY, USA',
      latitude: 40.7829,
      longitude: -73.9654,
    },
    rideType: 'standard',
    estimatedPrice: '15.50',
    estimatedTime: 12, // minutes
    status: 'completed',
    createdAt: '2023-06-01T14:30:00.000Z',
    updatedAt: '2023-06-01T15:00:00.000Z',
    payment: {
      paymentId: 'payment_1',
      amount: 15.50,
      method: 'card',
      status: 'completed',
    },
    rating: {
      value: 5,
      comment: 'Great driver, very friendly!',
      createdAt: '2023-06-01T15:05:00.000Z',
    },
  },
  {
    rideId: 'ride_2',
    userId: 'user_1',
    driverId: 'driver_1',
    origin: {
      address: 'Empire State Building, New York, NY, USA',
      latitude: 40.7484,
      longitude: -73.9857,
    },
    destination: {
      address: 'Brooklyn Bridge, New York, NY, USA',
      latitude: 40.7061,
      longitude: -73.9969,
    },
    rideType: 'premium',
    estimatedPrice: '25.00',
    estimatedTime: 18, // minutes
    status: 'cancelled',
    createdAt: '2023-06-15T10:00:00.000Z',
    updatedAt: '2023-06-15T10:05:00.000Z',
  },
];

// Payments collection
const payments = [
  {
    paymentId: 'payment_1',
    userId: 'user_1',
    rideId: 'ride_1',
    amount: 15.50,
    method: 'card',
    status: 'completed',
    createdAt: '2023-06-01T15:00:00.000Z',
  },
];

// Generate mock locations
const generateMockLocations = (query) => {
  const locations = [
    {
      id: 'place_1',
      description: 'Times Square, New York, NY, USA',
      placeId: 'ChIJmQJIxlVYwokRLgeuocVOGVU',
    },
    {
      id: 'place_2',
      description: 'Central Park, New York, NY, USA',
      placeId: 'ChIJ4zGFAZpYwokRGUGph3Mf37k',
    },
    {
      id: 'place_3',
      description: 'Empire State Building, New York, NY, USA',
      placeId: 'ChIJaXQRs6lZwokRY6EFpJnhNNE',
    },
    {
      id: 'place_4',
      description: 'Brooklyn Bridge, New York, NY, USA',
      placeId: 'ChIJK3vOQyNawokRXVbUbU6qWYE',
    },
  ];

  const lowerCaseQuery = query.toLowerCase();
  return locations.filter((location) =>
    location.description.toLowerCase().includes(lowerCaseQuery)
  );
};

// Generate mock place details
const generateMockPlaceDetails = (placeId) => {
  const placeCoordinates = {
    'ChIJmQJIxlVYwokRLgeuocVOGVU': { latitude: 40.7580, longitude: -73.9855 }, // Times Square
    'ChIJ4zGFAZpYwokRGUGph3Mf37k': { latitude: 40.7829, longitude: -73.9654 }, // Central Park
    'ChIJaXQRs6lZwokRY6EFpJnhNNE': { latitude: 40.7484, longitude: -73.9857 }, // Empire State Building
    'ChIJK3vOQyNawokRXVbUbU6qWYE': { latitude: 40.7061, longitude: -73.9969 }, // Brooklyn Bridge
  };

  const defaultCoords = { latitude: 40.7128, longitude: -74.0060 }; // New York City

  return {
    placeId,
    name: placeId,
    formattedAddress: 'New York, NY, USA',
    latitude: placeCoordinates[placeId]?.latitude || defaultCoords.latitude,
    longitude: placeCoordinates[placeId]?.longitude || defaultCoords.longitude,
  };
};

module.exports = {
  users,
  drivers,
  rides,
  payments,
  generateMockLocations,
  generateMockPlaceDetails,
};
