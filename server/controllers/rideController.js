const { v4: uuidv4 } = require('uuid');
const { users, rides, drivers } = require('../utils/inMemoryDb');

// Get all drivers
exports.getAllDrivers = (req, res) => {
  try {
    // Return all drivers (in a real app, you'd filter by location, availability, etc.)
    res.json(drivers);
  } catch (error) {
    console.error('Get all drivers error:', error);
    res.status(500).json({ message: 'Error getting drivers' });
  }
};

// Request a new ride
exports.requestRide = (req, res) => {
  try {
    const userId = req.user.id;
    const { origin, destination, rideType, estimatedPrice, estimatedTime } = req.body;

    // Validate input
    if (!origin || !destination || !rideType) {
      return res.status(400).json({ message: 'Origin, destination, and ride type are required' });
    }

    // Create a new ride
    const newRide = {
      rideId: uuidv4(),
      userId,
      origin,
      destination,
      rideType,
      estimatedPrice,
      estimatedTime,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save the ride to the in-memory database
    rides.push(newRide);

    // Find the user and add the ride to their rides array
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      users[userIndex].rides.push(newRide.rideId);
    }

    // Return the new ride
    res.status(201).json(newRide);
  } catch (error) {
    console.error('Request ride error:', error);
    res.status(500).json({ message: 'Error requesting ride' });
  }
};

// Find a driver for a ride
exports.findDriver = (req, res) => {
  try {
    const { rideId } = req.params;

    // Find the ride
    const rideIndex = rides.findIndex(ride => ride.rideId === rideId);
    if (rideIndex === -1) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if the ride belongs to the user
    if (rides[rideIndex].userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Choose a random driver (in a real app, you'd use a matching algorithm)
    const randomDriverIndex = Math.floor(Math.random() * drivers.length);
    const driver = drivers[randomDriverIndex];

    // Update the ride with the driver
    rides[rideIndex].driverId = driver.id;
    rides[rideIndex].status = 'driver_assigned';
    rides[rideIndex].updatedAt = new Date().toISOString();

    // Return the driver info
    res.json(driver);
  } catch (error) {
    console.error('Find driver error:', error);
    res.status(500).json({ message: 'Error finding driver' });
  }
};

// Get ride status
exports.getRideStatus = (req, res) => {
  try {
    const { rideId } = req.params;

    // Find the ride
    const ride = rides.find(ride => ride.rideId === rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if the ride belongs to the user
    if (ride.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Return the ride status
    res.json({
      status: ride.status,
      updatedAt: ride.updatedAt,
    });
  } catch (error) {
    console.error('Get ride status error:', error);
    res.status(500).json({ message: 'Error getting ride status' });
  }
};

// Update ride status
exports.updateRideStatus = (req, res) => {
  try {
    const { rideId } = req.params;
    const { status } = req.body;

    // Validate input
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Find the ride
    const rideIndex = rides.findIndex(ride => ride.rideId === rideId);
    if (rideIndex === -1) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if the ride belongs to the user
    if (rides[rideIndex].userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update the ride status
    rides[rideIndex].status = status;
    rides[rideIndex].updatedAt = new Date().toISOString();

    // Return the updated status
    res.json({
      status: rides[rideIndex].status,
      updatedAt: rides[rideIndex].updatedAt,
    });
  } catch (error) {
    console.error('Update ride status error:', error);
    res.status(500).json({ message: 'Error updating ride status' });
  }
};

// Cancel a ride
exports.cancelRide = (req, res) => {
  try {
    const { rideId } = req.params;

    // Find the ride
    const rideIndex = rides.findIndex(ride => ride.rideId === rideId);
    if (rideIndex === -1) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if the ride belongs to the user
    if (rides[rideIndex].userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if the ride can be cancelled
    const status = rides[rideIndex].status;
    if (status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed ride' });
    }

    // Update the ride status
    rides[rideIndex].status = 'cancelled';
    rides[rideIndex].updatedAt = new Date().toISOString();

    // Return success message
    res.json({
      message: 'Ride cancelled successfully',
      status: rides[rideIndex].status,
    });
  } catch (error) {
    console.error('Cancel ride error:', error);
    res.status(500).json({ message: 'Error cancelling ride' });
  }
};

// Get ride details
exports.getRideDetails = (req, res) => {
  try {
    const { rideId } = req.params;

    // Find the ride
    const ride = rides.find(ride => ride.rideId === rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if the ride belongs to the user
    if (ride.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Calculate fare components
    const baseFare = ride.rideType === 'premium' ? 10.00 : (ride.rideType === 'standard' ? 7.50 : 5.00);
    const distance = parseFloat(ride.estimatedTime) / 3; // Rough calculation based on time
    const distanceFare = parseFloat((distance * 2.5).toFixed(2));
    const timeFare = parseFloat((ride.estimatedTime * 0.25).toFixed(2));
    const fare = parseFloat((baseFare + distanceFare + timeFare).toFixed(2));

    // Return ride details with fare breakdown
    res.json({
      rideId: ride.rideId,
      status: ride.status,
      origin: ride.origin,
      destination: ride.destination,
      rideType: ride.rideType,
      createdAt: ride.createdAt,
      updatedAt: ride.updatedAt,
      baseFare: baseFare.toFixed(2),
      distanceFare: distanceFare.toFixed(2),
      timeFare: timeFare.toFixed(2),
      fare: fare.toFixed(2),
      tipAmount: 0.00,
      distance: distance.toFixed(1),
      duration: ride.estimatedTime,
      paymentMethod: 'card',
    });
  } catch (error) {
    console.error('Get ride details error:', error);
    res.status(500).json({ message: 'Error getting ride details' });
  }
};

// Submit rating for a ride
exports.submitRating = (req, res) => {
  try {
    const { rideId } = req.params;
    const { rating, comment, driverId } = req.body;

    // Validate input
    if (!rating || !driverId) {
      return res.status(400).json({ message: 'Rating and driver ID are required' });
    }

    // Find the ride
    const rideIndex = rides.findIndex(ride => ride.rideId === rideId);
    if (rideIndex === -1) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if the ride belongs to the user
    if (rides[rideIndex].userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update the ride with rating info
    rides[rideIndex].rating = {
      value: rating,
      comment: comment || '',
      createdAt: new Date().toISOString(),
    };
    rides[rideIndex].updatedAt = new Date().toISOString();

    // Find the driver and update their rating (in a real app)
    // This is simplified for the in-memory DB
    const driverIndex = drivers.findIndex(driver => driver.id === driverId);
    if (driverIndex !== -1) {
      // Update driver's average rating (simplified)
      const currentRating = drivers[driverIndex].rating || 5;
      drivers[driverIndex].rating = ((currentRating * 10) + (rating * 1)) / 11;
    }

    // Return success message
    res.json({
      message: 'Rating submitted successfully',
      rating,
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ message: 'Error submitting rating' });
  }
};

// Get ride history
exports.getRideHistory = (req, res) => {
  try {
    const userId = req.user.id;

    // Find all rides for the user
    const userRides = rides.filter(ride => ride.userId === userId);

    // Format the rides for the response
    const formattedRides = userRides.map(ride => {
      // Find the driver for this ride
      const driver = ride.driverId ? drivers.find(d => d.id === ride.driverId) : null;

      // Calculate distance based on time (simplified)
      const distance = parseFloat(ride.estimatedTime) / 3;
      
      // Calculate fare
      const baseFare = ride.rideType === 'premium' ? 10.00 : (ride.rideType === 'standard' ? 7.50 : 5.00);
      const distanceFare = distance * 2.5;
      const timeFare = ride.estimatedTime * 0.25;
      const fare = (baseFare + distanceFare + timeFare).toFixed(2);

      return {
        id: ride.rideId,
        origin: ride.origin,
        destination: ride.destination,
        date: ride.createdAt,
        status: ride.status,
        rideType: ride.rideType,
        distance: distance.toFixed(1),
        duration: ride.estimatedTime,
        fare,
        driver: driver ? {
          id: driver.id,
          name: driver.name,
          rating: driver.rating,
          photo: driver.photo,
        } : null,
      };
    });

    // Sort by date (most recent first)
    formattedRides.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(formattedRides);
  } catch (error) {
    console.error('Get ride history error:', error);
    res.status(500).json({ message: 'Error getting ride history' });
  }
};
