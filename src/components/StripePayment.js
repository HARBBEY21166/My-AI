import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { StripeProvider, CardField, useStripe, useConfirmPayment } from '@stripe/stripe-react-native';
import { API_URL } from '../utils/constants';
import axios from 'axios';

const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

const StripePaymentForm = ({ amount, rideId, onSuccess, token }) => {
  const { confirmPayment, loading } = useConfirmPayment();
  const [cardDetails, setCardDetails] = useState(null);
  const [isCardComplete, setIsCardComplete] = useState(false);

  const handlePayment = async () => {
    if (!cardDetails?.complete) {
      Alert.alert('Error', 'Please complete your card details first');
      return;
    }

    try {
      // Create a payment intent on the server
      const response = await axios.post(
        `${API_URL}/payments/intent/${rideId}`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const { clientSecret } = response.data;
      
      // Confirm the payment with the card details
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        type: 'Card',
      });

      if (error) {
        console.error('Payment confirmation error', error);
        Alert.alert('Payment Failed', error.message);
      } else if (paymentIntent) {
        console.log('Payment successful', paymentIntent);
        onSuccess(paymentIntent);
      }
    } catch (error) {
      console.error('Error creating payment intent', error);
      Alert.alert('Error', error.message || 'An error occurred while processing your payment');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Card Details</Text>
      
      <CardField
        postalCodeEnabled={true}
        placeholder={{
          number: '4242 4242 4242 4242',
        }}
        cardStyle={styles.card}
        style={styles.cardContainer}
        onCardChange={(cardDetails) => {
          setCardDetails(cardDetails);
          setIsCardComplete(cardDetails.complete);
        }}
      />
      
      <Button
        mode="contained"
        loading={loading}
        disabled={loading || !isCardComplete}
        style={styles.payButton}
        onPress={handlePayment}
      >
        Pay ${parseFloat(amount).toFixed(2)}
      </Button>
      
      <Text style={styles.secureText}>
        Your payment is processed securely via Stripe
      </Text>
    </View>
  );
};

const StripePayment = ({ amount, rideId, onSuccess, token }) => {
  if (!STRIPE_PUBLISHABLE_KEY) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Stripe configuration is missing. Please contact support.
        </Text>
      </View>
    );
  }

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <StripePaymentForm
        amount={amount}
        rideId={rideId}
        onSuccess={onSuccess}
        token={token}
      />
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cardContainer: {
    height: 50,
    marginVertical: 16,
  },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  payButton: {
    marginTop: 16,
    paddingVertical: 8,
    backgroundColor: '#4A80F0',
  },
  secureText: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default StripePayment;