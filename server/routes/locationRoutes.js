const express = require('express');
const locationController = require('../controllers/locationController');

const router = express.Router();

// Search for places
router.get('/search', locationController.searchPlaces);

// Get place details by ID
router.get('/place/:placeId', locationController.getPlaceDetails);

// Reverse geocode
router.get('/reverse-geocode', locationController.reverseGeocode);

// Get directions
router.post('/directions', locationController.getDirections);

// Estimate trip
router.post('/estimate', locationController.estimateTrip);

module.exports = router;
