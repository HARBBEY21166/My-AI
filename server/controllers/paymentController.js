const { v4: uuidv4 } = require('uuid');
const { users, rides, payments } = require('../utils/inMemoryDb');

// Use the environment variable if available, otherwise use a fallback test key
// In production, never hardcode the secret key and always use proper environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_51NHnRlBwLFuTJaxQq8sePfOpZx3mGEIZqVMWTqQkJjGqWYmfFTLPIISqIKMZnV19j0vpXH3gzXdFjwHIzKlRwkd900JvVugvGW';
const stripe = require('stripe')(STRIPE_SECRET_KEY);

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

// Create a payment intent (Stripe)
exports.createPaymentIntent = async (req, res) => {
  try {
    if (!STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Stripe is not configured properly' });
    }
    
    const userId = req.user.id;
    const { rideId } = req.params;
    const { amount } = req.body;

    // Validate input
    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
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

    // Calculate amount in cents for Stripe
    const amountInCents = Math.round(parseFloat(amount) * 100);

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        userId,
        rideId,
      },
    });

    // Store the payment intent ID in the ride record
    rides[rideIndex].paymentIntentId = paymentIntent.id;
    rides[rideIndex].updatedAt = new Date().toISOString();

    // Return the client secret to the client
    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: error.message || 'Error creating payment intent' });
  }
};

// Process payment for a ride (for cash or non-Stripe payments)
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

// Handle Stripe webhook
exports.handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    // Verify webhook signature
    try {
      // Note: in production you would use a proper webhook secret
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test');
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const { userId, rideId } = paymentIntent.metadata;

        // Find the ride
        const rideIndex = rides.findIndex(ride => ride.rideId === rideId);
        if (rideIndex !== -1) {
          // Create a new payment record
          const newPayment = {
            paymentId: uuidv4(),
            userId,
            rideId,
            amount: paymentIntent.amount / 100, // Convert from cents
            method: 'card', // Stripe payment is always card
            status: 'completed',
            stripePaymentIntentId: paymentIntent.id,
            createdAt: new Date().toISOString(),
          };

          // Save the payment
          payments.push(newPayment);

          // Update the ride status
          rides[rideIndex].status = 'completed';
          rides[rideIndex].payment = {
            paymentId: newPayment.paymentId,
            amount: newPayment.amount,
            method: 'card',
            status: 'completed',
          };
          rides[rideIndex].updatedAt = new Date().toISOString();
        }
        break;
      
      case 'payment_intent.payment_failed':
        // Handle failed payment
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        break;
      
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).json({ message: 'Error handling Stripe webhook' });
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
