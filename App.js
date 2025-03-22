import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import { RideProvider } from './src/context/RideContext';
import * as Permissions from './src/utils/permissions';

// Custom theme for React Native Paper
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4A80F0',
    accent: '#F49D37',
    background: '#F8F8F8',
    text: '#333333',
    error: '#D32F2F',
  },
  roundness: 8,
};

export default function App() {
  useEffect(() => {
    // Request location permissions when the app starts
    const requestPermissions = async () => {
      try {
        await Permissions.requestLocationPermission();
      } catch (error) {
        console.log('Error requesting permission:', error);
      }
    };

    requestPermissions();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <LocationProvider>
            <RideProvider>
              <AppNavigator />
              <StatusBar style="auto" />
            </RideProvider>
          </LocationProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
