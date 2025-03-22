import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { Text, Title, Surface, Avatar, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Map from '../components/Map';
import { RideContext } from '../context/RideContext';
import LoadingOverlay from '../components/LoadingOverlay';

const DriverMatchingScreen = ({ navigation, route }) => {
  const { rideId, origin, destination, estimatedTime } = route.params;
  const { findDriver, cancelRide } = useContext(RideContext);
  
  const [searchingAnimation] = useState(new Animated.Value(0));
  const [searchingSeconds, setSearchingSeconds] = useState(0);
  const [driver, setDriver] = useState(null);
  const [driverEta, setDriverEta] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Animate the pulsing effect
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(searchingAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(searchingAnimation, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  // Increment the searching timer
  useEffect(() => {
    if (!driver) {
      const interval = setInterval(() => {
        setSearchingSeconds(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [driver]);
  
  // Simulate finding a driver after a delay
  useEffect(() => {
    const findDriverTimeout = setTimeout(async () => {
      try {
        const driverData = await findDriver(rideId);
        setDriver(driverData);
        setDriverEta(driverData.eta);
        setIsLoading(false);
        
        // After driver is found, simulate arrival and navigate to ride in progress
        const arrivalTimeout = setTimeout(() => {
          navigation.replace('RideInProgress', {
            rideId,
            driver: driverData,
            origin,
            destination,
            estimatedTime
          });
        }, driverData.eta * 1000); // Convert ETA to milliseconds
        
        return () => clearTimeout(arrivalTimeout);
      } catch (error) {
        console.error('Error finding driver:', error);
        setIsLoading(false);
      }
    }, 5000); // Find driver after 5 seconds
    
    return () => clearTimeout(findDriverTimeout);
  }, [rideId]);
  
  // Handle ride cancellation
  const handleCancel = () => {
    cancelRide(rideId);
    navigation.navigate('Home');
  };
  
  const interpolatedScale = searchingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isLoading && !driver) {
    return <LoadingOverlay message="Finding your driver..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <Map
          currentLocation={origin}
          destination={destination}
          driverLocation={driver?.location}
          showRoute
        />
      </View>
      
      <Surface style={styles.contentCard}>
        {!driver ? (
          <View style={styles.searchingContainer}>
            <Animated.View
              style={[
                styles.pulseCircle, 
                { transform: [{ scale: interpolatedScale }] }
              ]}
            >
              <MaterialIcons name="search" size={30} color="#FFFFFF" />
            </Animated.View>
            
            <Title style={styles.searchingTitle}>Finding your driver</Title>
            <Text style={styles.searchingTime}>Searching for {formatTime(searchingSeconds)}</Text>
            
            <Chip 
              mode="outlined" 
              icon="close" 
              style={styles.cancelChip}
              onPress={handleCancel}
            >
              Cancel Ride
            </Chip>
          </View>
        ) : (
          <View style={styles.driverFoundContainer}>
            <View style={styles.driverInfo}>
              <Avatar.Image 
                source={{ uri: driver.photo }}
                size={60} 
                style={styles.driverPhoto}
              />
              
              <View style={styles.driverDetails}>
                <Title style={styles.driverName}>{driver.name}</Title>
                <View style={styles.ratingContainer}>
                  <MaterialIcons name="star" size={16} color="#F49D37" />
                  <Text style={styles.ratingText}>{driver.rating}</Text>
                </View>
                <Text style={styles.carInfo}>
                  {driver.car.model} · {driver.car.color} · {driver.car.plate}
                </Text>
              </View>
            </View>
            
            <View style={styles.etaContainer}>
              <Text style={styles.etaLabel}>Driver arriving in</Text>
              <Text style={styles.etaTime}>{driverEta} min</Text>
            </View>
            
            <View style={styles.actionsContainer}>
              <Chip 
                icon="phone" 
                style={styles.actionChip}
                onPress={() => console.log('Call driver')}
              >
                Call
              </Chip>
              
              <Chip 
                icon="message" 
                style={styles.actionChip}
                onPress={() => console.log('Message driver')}
              >
                Message
              </Chip>
              
              <Chip 
                icon="close" 
                style={styles.actionChip}
                onPress={handleCancel}
              >
                Cancel
              </Chip>
            </View>
          </View>
        )}
      </Surface>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  mapContainer: {
    flex: 1,
  },
  contentCard: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
  },
  searchingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  pulseCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A80F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  searchingTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  cancelChip: {
    marginTop: 16,
  },
  driverFoundContainer: {
    padding: 10,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverPhoto: {
    marginRight: 16,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
  },
  carInfo: {
    fontSize: 14,
    color: '#666',
  },
  etaContainer: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
  },
  etaLabel: {
    fontSize: 14,
    color: '#666',
  },
  etaTime: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A80F0',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionChip: {
    flex: 0.3,
  },
});

export default DriverMatchingScreen;
