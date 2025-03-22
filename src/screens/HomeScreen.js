import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, StatusBar } from 'react-native';
import { Button, Surface, Text, Title } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LocationContext } from '../context/LocationContext';
import { AuthContext } from '../context/AuthContext';
import Map from '../components/Map';
import LocationInput from '../components/LocationInput';
import LoadingOverlay from '../components/LoadingOverlay';

const windowHeight = Dimensions.get('window').height;

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { currentLocation, isLocationLoading, error: locationError } = useContext(LocationContext);
  const { authState } = useContext(AuthContext);
  const [destination, setDestination] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Set isReady to true once we have the current location
    if (currentLocation) {
      setIsReady(true);
    }
  }, [currentLocation]);

  const handleRequestRide = () => {
    if (destination) {
      navigation.navigate('RideRequest', { destination });
    }
  };

  if (isLocationLoading) {
    return <LoadingOverlay message="Getting your location..." />;
  }

  if (locationError) {
    return (
      <View style={[styles.container, { marginTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.errorText}>
          Error accessing your location: {locationError.message}
        </Text>
        <Button mode="contained" onPress={() => navigation.navigate('Profile')}>
          Check App Permissions
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {isReady && (
        <>
          <View style={styles.mapContainer}>
            <Map currentLocation={currentLocation} destination={destination} />
          </View>
          
          <Surface style={[styles.bottomSheet, { paddingBottom: insets.bottom }]}>
            <Title style={styles.greeting}>Hello, {authState.user?.name || 'Rider'}</Title>
            <Text style={styles.question}>Where are you going today?</Text>
            
            <LocationInput
              placeholder="Enter destination"
              onLocationSelected={(location) => setDestination(location)}
              style={styles.destinationInput}
            />
            
            <Button
              mode="contained"
              style={styles.requestButton}
              labelStyle={styles.buttonLabel}
              disabled={!destination}
              onPress={handleRequestRide}
            >
              Request Ride
            </Button>
          </Surface>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  mapContainer: {
    height: windowHeight * 0.6,
    width: '100%',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    backgroundColor: 'white',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  question: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  destinationInput: {
    marginBottom: 20,
  },
  requestButton: {
    marginTop: 10,
    marginBottom: 20,
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
    margin: 20,
  },
});

export default HomeScreen;
