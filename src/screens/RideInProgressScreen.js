import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Text, Title, Surface, Avatar, Chip, Button, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Map from '../components/Map';
import { RideContext } from '../context/RideContext';
import LoadingOverlay from '../components/LoadingOverlay';

const RideInProgressScreen = ({ navigation, route }) => {
  const { rideId, driver, origin, destination, estimatedTime } = route.params;
  const { getRideStatus, updateRideStatus } = useContext(RideContext);
  
  const [rideStatus, setRideStatus] = useState('picking_up');
  const [currentProgress, setCurrentProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(estimatedTime);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get initial ride status
  useEffect(() => {
    const fetchRideStatus = async () => {
      try {
        const status = await getRideStatus(rideId);
        setRideStatus(status.status);
        setIsLoading(false);
      } catch (error) {
        console.error('Error getting ride status:', error);
        setIsLoading(false);
      }
    };
    
    fetchRideStatus();
  }, []);
  
  // Update progress and remaining time
  useEffect(() => {
    if (rideStatus === 'in_progress') {
      const interval = setInterval(() => {
        setCurrentProgress(prev => {
          const newProgress = prev + (1 / (estimatedTime * 60));
          return newProgress > 1 ? 1 : newProgress;
        });
        
        setRemainingTime(prev => {
          const newTime = prev - (1 / 60);
          return newTime < 0 ? 0 : newTime;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [rideStatus, estimatedTime]);
  
  // Simulate ride progress updates
  useEffect(() => {
    if (rideStatus === 'picking_up') {
      // Simulate driver arriving after a short delay
      const pickupTimeout = setTimeout(() => {
        setRideStatus('arrived');
        updateRideStatus(rideId, 'arrived');
      }, 10000); // 10 seconds
      
      return () => clearTimeout(pickupTimeout);
    } else if (rideStatus === 'arrived') {
      // Simulate ride starting after a delay
      const startRideTimeout = setTimeout(() => {
        setRideStatus('in_progress');
        updateRideStatus(rideId, 'in_progress');
      }, 5000); // 5 seconds
      
      return () => clearTimeout(startRideTimeout);
    } else if (rideStatus === 'in_progress' && currentProgress >= 1) {
      // When progress is complete, navigate to payment screen
      navigation.replace('Payment', {
        rideId,
        driver,
        origin,
        destination,
        estimatedTime
      });
    }
  }, [rideStatus, currentProgress]);
  
  const getStatusMessage = () => {
    switch (rideStatus) {
      case 'picking_up':
        return 'Your driver is on the way';
      case 'arrived':
        return 'Your driver has arrived';
      case 'in_progress':
        return 'Ride in progress';
      default:
        return 'Updating ride status...';
    }
  };
  
  const formatTime = (timeInMinutes) => {
    const mins = Math.floor(timeInMinutes);
    const secs = Math.floor((timeInMinutes - mins) * 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleEmergency = () => {
    Alert.alert(
      'Emergency Assistance',
      'Do you need emergency assistance?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call Emergency Services', 
          onPress: () => console.log('Call emergency services'),
          style: 'destructive'
        },
        { 
          text: 'Contact Support',
          onPress: () => console.log('Contact support')
        }
      ]
    );
  };

  if (isLoading) {
    return <LoadingOverlay message="Preparing your ride..." />;
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
        <View style={styles.statusBar}>
          <Title style={styles.statusTitle}>{getStatusMessage()}</Title>
          {rideStatus === 'in_progress' && (
            <View style={styles.progressContainer}>
              <ProgressBar 
                progress={currentProgress} 
                color="#4A80F0" 
                style={styles.progressBar}
              />
              <Text style={styles.timeRemaining}>
                {formatTime(remainingTime)} remaining
              </Text>
            </View>
          )}
        </View>
        
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
        </View>
        
        <Button 
          mode="contained" 
          icon="alert" 
          style={styles.emergencyButton}
          onPress={handleEmergency}
        >
          Emergency
        </Button>
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
  statusBar: {
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  timeRemaining: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#666',
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
  locationsContainer: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
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
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  actionChip: {
    flex: 0.45,
  },
  emergencyButton: {
    backgroundColor: '#D32F2F',
  },
});

export default RideInProgressScreen;
