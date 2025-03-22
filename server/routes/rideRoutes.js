const express = require('express');
const rideController = require('../controllers/rideController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(authMiddleware.authenticate);

// Get all drivers (for testing)
router.get('/drivers', rideController.getAllDrivers);

// Request a new ride
router.post('/', rideController.requestRide);

// Find a driver for a ride
router.get('/:rideId/driver', rideController.findDriver);

// Get ride status
router.get('/:rideId/status', rideController.getRideStatus);

// Update ride status
router.put('/:rideId/status', rideController.updateRideStatus);

// Cancel a ride
router.post('/:rideId/cancel', rideController.cancelRide);

// Get ride details
router.get('/:rideId', rideController.getRideDetails);

// Submit rating for a ride
router.post('/:rideId/rating', rideController.submitRating);

// Get ride history
router.get('/history', rideController.getRideHistory);

module.exports = router;
