// This file contains functions to generate mock data for the server
const { v4: uuidv4 } = require('uuid');

// Generate mock locations based on search query
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
    {
      id: 'place_5',
      description: 'Statue of Liberty, New York, NY, USA',
      placeId: 'ChIJPTacEpBQwokRKwIlDXelxkA',
    },
    {
      id: 'place_6',
      description: 'Grand Central Terminal, New York, NY, USA',
      placeId: 'ChIJkTIl_5ZZwokRCej5GlgV-BQ',
    },
    {
      id: 'place_7',
      description: 'One World Trade Center, New York, NY, USA',
      placeId: 'ChIJTWE_0BtawokRVJNGH5RS448',
    },
    {
      id: 'place_8',
      description: 'Madison Square Garden, New York, NY, USA',
      placeId: 'ChIJhRwB-yFawokR5Phil-QQ3zM',
    },
  ];

  // Filter locations based on query
  const lowerCaseQuery = query.toLowerCase();
  return locations.filter((location) =>
    location.description.toLowerCase().includes(lowerCaseQuery)
  );
};

// Generate mock place details based on place ID
const generateMockPlaceDetails = (placeId) => {
  // Mock coordinates for different places
  const placeCoordinates = {
    'ChIJmQJIxlVYwokRLgeuocVOGVU': { latitude: 40.7580, longitude: -73.9855 }, // Times Square
    'ChIJ4zGFAZpYwokRGUGph3Mf37k': { latitude: 40.7829, longitude: -73.9654 }, // Central Park
    'ChIJaXQRs6lZwokRY6EFpJnhNNE': { latitude: 40.7484, longitude: -73.9857 }, // Empire State Building
    'ChIJK3vOQyNawokRXVbUbU6qWYE': { latitude: 40.7061, longitude: -73.9969 }, // Brooklyn Bridge
    'ChIJPTacEpBQwokRKwIlDXelxkA': { latitude: 40.6892, longitude: -74.0445 }, // Statue of Liberty
    'ChIJkTIl_5ZZwokRCej5GlgV-BQ': { latitude: 40.7527, longitude: -73.9772 }, // Grand Central Terminal
    'ChIJTWE_0BtawokRVJNGH5RS448': { latitude: 40.7127, longitude: -74.0134 }, // One World Trade Center
    'ChIJhRwB-yFawokR5Phil-QQ3zM': { latitude: 40.7505, longitude: -73.9934 }, // Madison Square Garden
  };

  // Default coordinates if placeId is not found
  const defaultCoords = { latitude: 40.7128, longitude: -74.0060 }; // New York City

  return {
    placeId,
    name: placeId.replace('ChIJ', '').replace(/[A-Z0-9]/g, ''),
    formattedAddress: 'New York, NY, USA',
    latitude: placeCoordinates[placeId]?.latitude || defaultCoords.latitude,
    longitude: placeCoordinates[placeId]?.longitude || defaultCoords.longitude,
  };
};

// Generate mock driver data
const generateMockDriver = () => {
  const drivers = [
    {
      id: 'driver_1',
      name: 'John Smith',
      phone: '+1 (555) 123-4567',
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
      eta: 3, // minutes
    },
    {
      id: 'driver_2',
      name: 'Sarah Johnson',
      phone: '+1 (555) 987-6543',
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
      eta: 5, // minutes
    },
    {
      id: 'driver_3',
      name: 'Michael Chen',
      phone: '+1 (555) 234-5678',
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
      eta: 4, // minutes
    },
  ];

  // Return a random driver
  return drivers[Math.floor(Math.random() * drivers.length)];
};

// Generate mock ride response
const generateMockRideResponse = (rideDetails) => {
  return {
    rideId: `ride_${Date.now()}`,
    origin: rideDetails.origin,
    destination: rideDetails.destination,
    rideType: rideDetails.rideType,
    estimatedPrice: rideDetails.estimatedPrice,
    estimatedTime: rideDetails.estimatedTime,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
};

// Generate mock ride status
const generateMockRideStatus = () => {
  const statuses = ['pending', 'driver_assigned', 'picking_up', 'arrived', 'in_progress', 'completed'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    status: randomStatus,
    updatedAt: new Date().toISOString(),
  };
};

// Generate mock ride details
const generateMockRideDetails = (rideId) => {
  return {
    rideId,
    baseFare: 5.00,
    distanceFare: 12.50,
    timeFare: 3.75,
    fare: 21.25,
    tipAmount: 0,
    distance: 5.3, // km
    duration: 18, // minutes
    paymentMethod: 'card',
  };
};

// Generate mock ride history
const generateMockRideHistory = () => {
  const mockDestinations = [
    {
      address: 'Times Square, New York, NY, USA',
      latitude: 40.7580,
      longitude: -73.9855,
    },
    {
      address: 'Central Park, New York, NY, USA',
      latitude: 40.7829,
      longitude: -73.9654,
    },
    {
      address: 'Empire State Building, New York, NY, USA',
      latitude: 40.7484,
      longitude: -73.9857,
    },
    {
      address: 'Brooklyn Bridge, New York, NY, USA',
      latitude: 40.7061,
      longitude: -73.9969,
    },
    {
      address: 'Grand Central Terminal, New York, NY, USA',
      latitude: 40.7527,
      longitude: -73.9772,
    },
  ];

  const mockOrigins = [
    {
      address: 'Madison Square Garden, New York, NY, USA',
      latitude: 40.7505,
      longitude: -73.9934,
    },
    {
      address: '30 Rockefeller Plaza, New York, NY, USA',
      latitude: 40.7587,
      longitude: -73.9787,
    },
    {
      address: 'Chelsea Market, New York, NY, USA',
      latitude: 40.7420,
      longitude: -74.0048,
    },
    {
      address: 'Washington Square Park, New York, NY, USA',
      latitude: 40.7308,
      longitude: -73.9973,
    },
    {
      address: 'Metropolitan Museum of Art, New York, NY, USA',
      latitude: 40.7794,
      longitude: -73.9632,
    },
  ];

  const mockDrivers = [
    {
      id: 'driver_1',
      name: 'John Smith',
      rating: 4.8,
      photo: 'https://ui-avatars.com/api/?name=John+Smith&background=0D8ABC&color=fff',
    },
    {
      id: 'driver_2',
      name: 'Sarah Johnson',
      rating: 4.9,
      photo: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=F0812B&color=fff',
    },
    {
      id: 'driver_3',
      name: 'Michael Chen',
      rating: 4.7,
      photo: 'https://ui-avatars.com/api/?name=Michael+Chen&background=4A80F0&color=fff',
    },
  ];

  const getRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
  };

  // Generate 10 random rides
  const rides = [];
  for (let i = 1; i <= 10; i++) {
    const origin = mockOrigins[Math.floor(Math.random() * mockOrigins.length)];
    const destination = mockDestinations[Math.floor(Math.random() * mockDestinations.length)];
    const driver = mockDrivers[Math.floor(Math.random() * mockDrivers.length)];
    const distance = (Math.random() * 10 + 1).toFixed(1);
    const duration = Math.floor(Math.random() * 30 + 10);
    const fare = (5 + distance * 2.5).toFixed(2);
    
    rides.push({
      id: `ride_${i}`,
      origin,
      destination,
      driver,
      distance,
      duration,
      fare,
      date: getRandomDate(new Date(2023, 0, 1), new Date()),
      status: Math.random() > 0.2 ? 'completed' : 'cancelled',
    });
  }

  // Sort by date, most recent first
  return rides.sort((a, b) => new Date(b.date) - new Date(a.date));
};

module.exports = {
  generateMockLocations,
  generateMockPlaceDetails,
  generateMockDriver,
  generateMockRideResponse,
  generateMockRideStatus,
  generateMockRideDetails,
  generateMockRideHistory,
};