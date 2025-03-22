const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(authMiddleware.authenticate);

// Get saved payment methods
router.get('/methods', paymentController.getPaymentMethods);

// Add a new payment method
router.post('/methods', paymentController.addPaymentMethod);

// Remove a payment method
router.delete('/methods/:paymentMethodId', paymentController.removePaymentMethod);

// Process payment for a ride
router.post('/:rideId', paymentController.processPayment);

// Get payment history
router.get('/history', paymentController.getPaymentHistory);

// Get payment details
router.get('/:paymentId', paymentController.getPaymentDetails);

module.exports = router;
