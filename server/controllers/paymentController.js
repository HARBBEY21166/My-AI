const { v4: uuidv4 } = require('uuid');
const { users, rides, payments } = require('../utils/inMemoryDb');

// Get saved payment methods
exports.getPaymentMethods = (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user
    const user = users.find(user => user.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the user's payment methods
    res.json(user.paymentMethods || []);
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: 'Error getting payment methods' });
  }
};

// Add a new payment method
exports.addPaymentMethod = (req, res) => {
  try {
    const userId = req.user.id;
    const { type, cardNumber, expiryMonth, expiryYear, cvv, isDefault } = req.body;

    // Validate input
    if (!type || !cardNumber || !expiryMonth || !expiryYear || !cvv) {
      return res.status(400).json({ message: 'All payment details are required' });
    }

    // Find the user
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize payment methods array if it doesn't exist
    if (!users[userIndex].paymentMethods) {
      users[userIndex].paymentMethods = [];
    }

    // Create a new payment method
    const newPaymentMethod = {
      id: uuidv4(),
      type,
      brand: 'visa', // In a real app, determine this from the card number
      last4: cardNumber.slice(-4),
      expiryMonth,
      expiryYear,
      isDefault: isDefault || users[userIndex].paymentMethods.length === 0,
      createdAt: new Date().toISOString(),
    };

    // If this is the default payment method, make all others non-default
    if (newPaymentMethod.isDefault) {
      users[userIndex].paymentMethods = users[userIndex].paymentMethods.map(method => ({
        ...method,
        isDefault: false,
      }));
    }

    // Add the new payment method
    users[userIndex].paymentMethods.push(newPaymentMethod);

    // Return the new payment method
    res.status(201).json(newPaymentMethod);
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({ message: 'Error adding payment method' });
  }
};

// Remove a payment method
exports.removePaymentMethod = (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethodId } = req.params;

    // Find the user
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user has payment methods
    if (!users[userIndex].paymentMethods || users[userIndex].paymentMethods.length === 0) {
      return res.status(400).json({ message: 'No payment methods found' });
    }

    // Find the payment method
    const methodIndex = users[userIndex].paymentMethods.findIndex(method => method.id === paymentMethodId);
    if (methodIndex === -1) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    // Check if it's the default method
    const isDefault = users[userIndex].paymentMethods[methodIndex].isDefault;

    // Remove the payment method
    users[userIndex].paymentMethods.splice(methodIndex, 1);

    // If it was the default method and there are other methods, make the first one default
    if (isDefault && users[userIndex].paymentMethods.length > 0) {
      users[userIndex].paymentMethods[0].isDefault = true;
    }

    // Return success message
    res.json({ message: 'Payment method removed successfully' });
  } catch (error) {
    console.error('Remove payment method error:', error);
    res.status(500).json({ message: 'Error removing payment method' });
  }
};

// Process payment for a ride
exports.processPayment = (req, res) => {
  try {
    const userId = req.user.id;
    const { rideId } = req.params;
    const { method, amount } = req.body;

    // Validate input
    if (!method || !amount) {
      return res.status(400).json({ message: 'Payment method and amount are required' });
    }

    // Find the ride
    const rideIndex = rides.findIndex(ride => ride.rideId === rideId);
    if (rideIndex === -1) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if the ride belongs to the user
    if (rides[rideIndex].userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Create a new payment
    const newPayment = {
      paymentId: uuidv4(),
      userId,
      rideId,
      amount: parseFloat(amount),
      method,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    // Save the payment
    payments.push(newPayment);

    // Update the ride status
    rides[rideIndex].status = 'completed';
    rides[rideIndex].payment = {
      paymentId: newPayment.paymentId,
      amount: newPayment.amount,
      method: newPayment.method,
      status: newPayment.status,
    };
    rides[rideIndex].updatedAt = new Date().toISOString();

    // Return the payment info
    res.json({
      success: true,
      paymentId: newPayment.paymentId,
      amount: newPayment.amount,
      method: newPayment.method,
      status: newPayment.status,
      timestamp: newPayment.createdAt,
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ message: 'Error processing payment' });
  }
};

// Get payment history
exports.getPaymentHistory = (req, res) => {
  try {
    const userId = req.user.id;

    // Find all payments for the user
    const userPayments = payments.filter(payment => payment.userId === userId);

    // Sort by date (most recent first)
    userPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Map to include ride details
    const formattedPayments = userPayments.map(payment => {
      const ride = rides.find(ride => ride.rideId === payment.rideId);
      return {
        paymentId: payment.paymentId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        date: payment.createdAt,
        ride: ride ? {
          rideId: ride.rideId,
          origin: ride.origin,
          destination: ride.destination,
          status: ride.status,
        } : null,
      };
    });

    res.json(formattedPayments);
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Error getting payment history' });
  }
};

// Get payment details
exports.getPaymentDetails = (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentId } = req.params;

    // Find the payment
    const payment = payments.find(payment => payment.paymentId === paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if the payment belongs to the user
    if (payment.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Find the associated ride
    const ride = rides.find(ride => ride.rideId === payment.rideId);

    // Return the payment details
    res.json({
      paymentId: payment.paymentId,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      date: payment.createdAt,
      ride: ride ? {
        rideId: ride.rideId,
        origin: ride.origin,
        destination: ride.destination,
        status: ride.status,
        createdAt: ride.createdAt,
      } : null,
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({ message: 'Error getting payment details' });
  }
};
