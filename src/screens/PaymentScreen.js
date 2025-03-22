import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, Title, Subheading, Button, Surface, Divider, List, RadioButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { RideContext } from '../context/RideContext';
import { AuthContext } from '../context/AuthContext';
import LoadingOverlay from '../components/LoadingOverlay';
import StripePayment from '../components/StripePayment';

const PaymentScreen = ({ navigation, route }) => {
  const { rideId, driver, origin, destination } = route.params;
  const { processPayment, getRideDetails } = useContext(RideContext);
  const { authState } = useContext(AuthContext);
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [rideDetails, setRideDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStripeForm, setShowStripeForm] = useState(false);
  
  // Get ride details
  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        const details = await getRideDetails(rideId);
        setRideDetails(details);
        setIsLoading(false);
      } catch (error) {
        console.error('Error getting ride details:', error);
        setIsLoading(false);
        Alert.alert('Error', 'Could not retrieve ride details. Please try again.');
      }
    };
    
    fetchRideDetails();
  }, [rideId]);
  
  const handleCashPayment = async () => {
    setIsProcessing(true);
    
    try {
      await processPayment(rideId, {
        method: 'cash',
        amount: rideDetails.fare
      });
      
      // Navigate to rating screen after successful payment
      navigation.replace('Rating', {
        rideId,
        driver,
        origin,
        destination,
        fare: rideDetails.fare
      });
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
    }
  };
  
  const handlePayButtonClick = () => {
    if (paymentMethod === 'card') {
      setShowStripeForm(true);
    } else {
      handleCashPayment();
    }
  };
  
  const handleCardPaymentSuccess = (paymentIntent) => {
    // Navigate to rating screen after successful payment
    navigation.replace('Rating', {
      rideId,
      driver,
      origin,
      destination,
      fare: rideDetails.fare
    });
  };
  
  const handleAddTip = (tipPercentage) => {
    const tipAmount = (rideDetails.fare * tipPercentage / 100).toFixed(2);
    
    Alert.alert(
      'Add Tip',
      `Add $${tipAmount} (${tipPercentage}%) tip for ${driver.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add Tip',
          onPress: () => {
            setRideDetails({
              ...rideDetails,
              tipAmount: parseFloat(tipAmount),
              fare: (parseFloat(rideDetails.fare) + parseFloat(tipAmount)).toFixed(2)
            });
          }
        }
      ]
    );
  };

  if (isLoading || !rideDetails) {
    return <LoadingOverlay message="Preparing payment details..." />;
  }
  
  if (isProcessing) {
    return <LoadingOverlay message="Processing payment..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Ride Complete</Title>
      </View>
      
      <ScrollView style={styles.content}>
        <Surface style={styles.fareContainer}>
          <Title style={styles.totalFare}>${rideDetails.fare}</Title>
          <Text style={styles.fareLabel}>Total Fare</Text>
          
          <Divider style={styles.divider} />
          
          <View style={styles.fareBreakdown}>
            <View style={styles.fareRow}>
              <Text style={styles.fareItemLabel}>Base Fare</Text>
              <Text style={styles.fareItemValue}>${rideDetails.baseFare}</Text>
            </View>
            
            <View style={styles.fareRow}>
              <Text style={styles.fareItemLabel}>Distance ({rideDetails.distance} km)</Text>
              <Text style={styles.fareItemValue}>${rideDetails.distanceFare}</Text>
            </View>
            
            <View style={styles.fareRow}>
              <Text style={styles.fareItemLabel}>Time ({rideDetails.duration} min)</Text>
              <Text style={styles.fareItemValue}>${rideDetails.timeFare}</Text>
            </View>
            
            {rideDetails.tipAmount > 0 && (
              <View style={styles.fareRow}>
                <Text style={styles.fareItemLabel}>Tip</Text>
                <Text style={styles.fareItemValue}>${rideDetails.tipAmount}</Text>
              </View>
            )}
          </View>
        </Surface>
        
        <Surface style={styles.tripDetailsContainer}>
          <Subheading style={styles.sectionTitle}>Trip Details</Subheading>
          
          <View style={styles.locationsContainer}>
            <View style={styles.locationRow}>
              <MaterialIcons name="fiber-manual-record" size={16} color="#4A80F0" />
              <Text style={styles.locationText}>{origin.address}</Text>
            </View>
            
            <View style={styles.verticalLine} />
            
            <View style={styles.locationRow}>
              <MaterialIcons name="location-on" size={16} color="#F49D37" />
              <Text style={styles.locationText}>{destination.address}</Text>
            </View>
          </View>
          
          <View style={styles.tripInfoRow}>
            <View style={styles.tripInfoItem}>
              <MaterialIcons name="timeline" size={20} color="#4A80F0" />
              <Text style={styles.tripInfoText}>{rideDetails.distance} km</Text>
            </View>
            
            <View style={styles.tripInfoItem}>
              <MaterialIcons name="access-time" size={20} color="#4A80F0" />
              <Text style={styles.tripInfoText}>{rideDetails.duration} min</Text>
            </View>
            
            <View style={styles.tripInfoItem}>
              <MaterialIcons name="person" size={20} color="#4A80F0" />
              <Text style={styles.tripInfoText}>{driver.name}</Text>
            </View>
          </View>
        </Surface>
        
        <Surface style={styles.tipContainer}>
          <Subheading style={styles.sectionTitle}>Add a Tip</Subheading>
          <Text style={styles.tipDescription}>Show your appreciation for {driver.name}'s service with a tip!</Text>
          
          <View style={styles.tipButtonsContainer}>
            <Button 
              mode="outlined" 
              style={styles.tipButton}
              onPress={() => handleAddTip(10)}
            >
              10%
            </Button>
            
            <Button 
              mode="outlined" 
              style={styles.tipButton}
              onPress={() => handleAddTip(15)}
            >
              15%
            </Button>
            
            <Button 
              mode="outlined" 
              style={styles.tipButton}
              onPress={() => handleAddTip(20)}
            >
              20%
            </Button>
          </View>
        </Surface>
        
        {showStripeForm ? (
          <Surface style={styles.stripeContainer}>
            <Subheading style={styles.sectionTitle}>Payment Details</Subheading>
            <StripePayment 
              amount={rideDetails.fare}
              rideId={rideId}
              onSuccess={handleCardPaymentSuccess}
              token={authState.token}
            />
            <Button
              mode="outlined"
              style={styles.backButton}
              onPress={() => setShowStripeForm(false)}
            >
              Back to Payment Options
            </Button>
          </Surface>
        ) : (
          <>
            <Surface style={styles.paymentMethodContainer}>
              <Subheading style={styles.sectionTitle}>Payment Method</Subheading>
              
              <RadioButton.Group 
                onValueChange={value => setPaymentMethod(value)} 
                value={paymentMethod}
              >
                <List.Item
                  title="Credit Card"
                  description="Pay securely via Stripe"
                  left={() => <List.Icon icon="credit-card" />}
                  right={() => <RadioButton value="card" color="#4A80F0" />}
                  onPress={() => setPaymentMethod('card')}
                />
                
                <Divider />
                
                <List.Item
                  title="Cash"
                  description="Pay directly to driver"
                  left={() => <List.Icon icon="cash" />}
                  right={() => <RadioButton value="cash" color="#4A80F0" />}
                  onPress={() => setPaymentMethod('cash')}
                />
              </RadioButton.Group>
            </Surface>
            
            <Button
              mode="contained"
              style={styles.payButton}
              labelStyle={styles.payButtonLabel}
              onPress={handlePayButtonClick}
            >
              {paymentMethod === 'card' ? 'Continue to Card Payment' : 'Confirm Cash Payment'}
            </Button>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  fareContainer: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  totalFare: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A80F0',
  },
  fareLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  divider: {
    width: '100%',
    marginVertical: 16,
  },
  fareBreakdown: {
    width: '100%',
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  fareItemLabel: {
    fontSize: 14,
    color: '#666',
  },
  fareItemValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tripDetailsContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  locationsContainer: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  verticalLine: {
    width: 1,
    height: 20,
    backgroundColor: '#CCCCCC',
    marginLeft: 8,
  },
  locationText: {
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
  },
  tripInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  tripInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripInfoText: {
    marginLeft: 8,
    fontSize: 14,
  },
  tipContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  tipButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tipButton: {
    flex: 0.3,
    borderColor: '#4A80F0',
  },
  paymentMethodContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  payButton: {
    marginTop: 8,
    marginBottom: 24,
    paddingVertical: 8,
    backgroundColor: '#4A80F0',
  },
  payButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;
