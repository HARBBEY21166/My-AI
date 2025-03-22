import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Title, Button, Surface, Divider, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { LocationContext } from '../context/LocationContext';
import { RideContext } from '../context/RideContext';
import Map from '../components/Map';
import RideTypeSelector from '../components/RideTypeSelector';
import PriceEstimate from '../components/PriceEstimate';
import LoadingOverlay from '../components/LoadingOverlay';

const RideRequestScreen = ({ navigation, route }) => {
  const { destination } = route.params;
  const { currentLocation } = useContext(LocationContext);
  const { requestRide, isLoading, error: rideError } = useContext(RideContext);
  
  const [selectedRideType, setSelectedRideType] = useState('standard');
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  
  useEffect(() => {
    // Calculate estimated price and time based on origin, destination and ride type
    // In a real app, this would be an API call to the backend
    
    // Mock calculation for now
    const distance = calculateDistance(currentLocation, destination);
    
    let basePrice;
    let timeMultiplier;
    
    switch (selectedRideType) {
      case 'economy':
        basePrice = 5;
        timeMultiplier = 1;
        break;
      case 'standard':
        basePrice = 10;
        timeMultiplier = 0.9;
        break;
      case 'premium':
        basePrice = 20;
        timeMultiplier = 0.8;
        break;
      default:
        basePrice = 10;
        timeMultiplier = 1;
    }
    
    const price = basePrice + (distance * 2.5);
    const time = Math.round((distance / 0.5) * timeMultiplier); // Assuming 0.5 km per minute
    
    setEstimatedPrice(price.toFixed(2));
    setEstimatedTime(time);
    
  }, [currentLocation, destination, selectedRideType]);
  
  // Calculate distance between two points (simplified)
  const calculateDistance = (origin, destination) => {
    if (!origin || !destination) return 0;
    
    // Simple Euclidean distance for demo purposes
    // In a real app, you'd use Google Distance Matrix API or similar
    const latDiff = origin.latitude - destination.latitude;
    const lngDiff = origin.longitude - destination.longitude;
    
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // rough conversion to km
  };
  
  const handleRequestRide = async () => {
    try {
      const response = await requestRide({
        origin: currentLocation,
        destination,
        rideType: selectedRideType,
        estimatedPrice,
        estimatedTime
      });
      
      // Navigate to driver matching screen
      navigation.navigate('DriverMatching', { 
        rideId: response.rideId,
        origin: currentLocation,
        destination,
        estimatedTime
      });
    } catch (error) {
      console.error('Error requesting ride:', error);
    }
  };

  if (isLoading) {
    return <LoadingOverlay message="Processing your ride request..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Title style={styles.headerTitle}>Request Ride</Title>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.mapContainer}>
        <Map 
          currentLocation={currentLocation} 
          destination={destination}
          showRoute
        />
      </View>
      
      <ScrollView style={styles.content}>
        <Surface style={styles.locationCard}>
          <View style={styles.locationRow}>
            <MaterialIcons name="my-location" size={20} color="#4A80F0" />
            <Text style={styles.locationText}>
              {currentLocation?.address || 'Current Location'}
            </Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={20} color="#F49D37" />
            <Text style={styles.locationText}>
              {destination?.address || 'Destination'}
            </Text>
          </View>
        </Surface>
        
        <Title style={styles.sectionTitle}>Select Ride Type</Title>
        
        <RideTypeSelector
          selectedType={selectedRideType}
          onSelectType={setSelectedRideType}
        />
        
        {estimatedPrice && estimatedTime && (
          <PriceEstimate
            price={estimatedPrice}
            time={estimatedTime}
            distance={calculateDistance(currentLocation, destination).toFixed(1)}
          />
        )}
        
        {rideError && (
          <Text style={styles.errorText}>
            Error: {rideError}
          </Text>
        )}
        
        <Button
          mode="contained"
          style={styles.requestButton}
          labelStyle={styles.buttonLabel}
          onPress={handleRequestRide}
        >
          Confirm Ride
        </Button>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  mapContainer: {
    height: 250,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  locationCard: {
    padding: 16,
    marginBottom: 20,
    borderRadius: 8,
    elevation: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  locationText: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
  },
  divider: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  requestButton: {
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: '#4A80F0',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 16,
  },
});

export default RideRequestScreen;
