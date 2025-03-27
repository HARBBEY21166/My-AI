import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { PROVIDER_OPENSTREETMAP } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

const App = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      const hasLocationPermission = await requestLocationPermission();
      if (!hasLocationPermission) {
        setErrorMsg('Location permission not granted');
        return;
      }

      Geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
        },
        (error) => {
          setErrorMsg(error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 1000
        }
      );
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_OPENSTREETMAP}
        showsUserLocation={true}
        followsUserLocation={true}
        initialRegion={{
          latitude: -26.2041, // Johannesburg center
          longitude: 28.0473,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
});

export default App;