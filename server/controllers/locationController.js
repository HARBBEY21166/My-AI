const { generateMockLocations, generateMockPlaceDetails } = require('../utils/mockData');

// Search for places
exports.searchPlaces = (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    // Generate mock locations for the query
    // In a real app, you'd use a service like Google Places API
    const locations = generateMockLocations(query);

    res.json(locations);
  } catch (error) {
    console.error('Search places error:', error);
    res.status(500).json({ message: 'Error searching for places' });
  }
};

// Get place details by ID
exports.getPlaceDetails = (req, res) => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return res.status(400).json({ message: 'Place ID is required' });
    }

    // Generate mock place details
    // In a real app, you'd use a service like Google Places API
    const placeDetails = generateMockPlaceDetails(placeId);

    res.json(placeDetails);
  } catch (error) {
    console.error('Get place details error:', error);
    res.status(500).json({ message: 'Error getting place details' });
  }
};

// Reverse geocode coordinates to address
exports.reverseGeocode = (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // In a real app, you'd use a service like Google Geocoding API
    // For now, return a simple formatted address
    const address = `Location (${parseFloat(latitude).toFixed(4)}, ${parseFloat(longitude).toFixed(4)})`;

    res.json({ address });
  } catch (error) {
    console.error('Reverse geocode error:', error);
    res.status(500).json({ message: 'Error reverse geocoding coordinates' });
  }
};

// Get directions between two points
exports.getDirections = (req, res) => {
  try {
    const { origin, destination, waypoints } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ message: 'Origin and destination are required' });
    }

    // In a real app, you'd use a service like Google Directions API
    // For now, return a simple straight line between points
    const route = [
      { latitude: origin.latitude, longitude: origin.longitude },
      { latitude: destination.latitude, longitude: destination.longitude },
    ];

    // Calculate simple distance and duration
    const latDiff = Math.abs(destination.latitude - origin.latitude);
    const lngDiff = Math.abs(destination.longitude - origin.longitude);
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // rough conversion to km
    const duration = Math.round(distance / 0.5); // assuming 0.5 km per minute

    res.json({
      route,
      distance: distance.toFixed(1),
      duration,
    });
  } catch (error) {
    console.error('Get directions error:', error);
    res.status(500).json({ message: 'Error getting directions' });
  }
};

// Estimate trip time and distance
exports.estimateTrip = (req, res) => {
  try {
    const { origin, destination } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ message: 'Origin and destination are required' });
    }

    // In a real app, you'd use a service like Google Distance Matrix API
    // For now, calculate a simple straight-line distance
    const latDiff = Math.abs(destination.latitude - origin.latitude);
    const lngDiff = Math.abs(destination.longitude - origin.longitude);
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // rough conversion to km
    const duration = Math.round(distance / 0.5); // assuming 0.5 km per minute

    res.json({
      distance: distance.toFixed(1),
      duration,
      fare: {
        economy: (5 + distance * 1.5).toFixed(2),
        standard: (7.5 + distance * 2.5).toFixed(2),
        premium: (10 + distance * 3.5).toFixed(2),
      },
    });
  } catch (error) {
    console.error('Estimate trip error:', error);
    res.status(500).json({ message: 'Error estimating trip' });
  }
};
