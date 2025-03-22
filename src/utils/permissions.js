import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';

// Request location permission
export const requestLocationPermission = async () => {
  try {
    // Check current permission status
    const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
    
    // Return early if permission is already granted
    if (existingStatus === 'granted') {
      return true;
    }
    
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status === 'granted') {
      return true;
    }
    
    // If permission is denied, show alert with option to open settings
    if (status === 'denied') {
      Alert.alert(
        'Location Permission Required',
        'RideShare needs access to your location to find rides near you. Please enable location services in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openSettings }
        ]
      );
    }
    
    return false;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

// Request background location permission
export const requestBackgroundLocationPermission = async () => {
  try {
    // First, check if foreground permission is granted
    const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      // Need foreground permission first
      const granted = await requestLocationPermission();
      if (!granted) return false;
    }
    
    // Check current background permission status
    const { status: existingStatus } = await Location.getBackgroundPermissionsAsync();
    
    // Return early if permission is already granted
    if (existingStatus === 'granted') {
      return true;
    }
    
    // Request background permission
    const { status } = await Location.requestBackgroundPermissionsAsync();
    
    if (status === 'granted') {
      return true;
    }
    
    // If permission is denied, show alert with option to open settings
    if (status === 'denied') {
      Alert.alert(
        'Background Location Permission Required',
        'RideShare needs access to your location in the background to track your ride. Please enable background location in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openSettings }
        ]
      );
    }
    
    return false;
  } catch (error) {
    console.error('Error requesting background location permission:', error);
    return false;
  }
};

// Open device settings
const openSettings = () => {
  Linking.openSettings().catch(() => {
    Alert.alert('Unable to open settings');
  });
};

// Export permissions functions
export default {
  requestLocationPermission,
  requestBackgroundLocationPermission,
};
