import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const Map = ({ 
  currentLocation, 
  destination, 
  driverLocation,
  showRoute = false 
}) => {
  const mapRef = useRef(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  
  // Create a fitting map region based on markers
  const getMapRegion = () => {
    if (!currentLocation) {
      return {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }
    
    if (!destination) {
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    
    // Calculate the bounding box for all points
    const points = [currentLocation];
    if (destination) points.push(destination);
    if (driverLocation) points.push(driverLocation);
    
    let minLat = points[0].latitude;
    let maxLat = points[0].latitude;
    let minLng = points[0].longitude;
    let maxLng = points[0].longitude;
    
    points.forEach(point => {
      minLat = Math.min(minLat, point.latitude);
      maxLat = Math.max(maxLat, point.latitude);
      minLng = Math.min(minLng, point.longitude);
      maxLng = Math.max(maxLng, point.longitude);
    });
    
    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    
    // Add some padding
    const latDelta = (maxLat - minLat) * 1.5;
    const lngDelta = (maxLng - minLng) * 1.5;
    
    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: latDelta || 0.01,
      longitudeDelta: lngDelta || 0.01,
    };
  };
  
  // Create the route between origin and destination
  useEffect(() => {
    if (showRoute && currentLocation && destination) {
      // In a real app, you'd use a service like Google Directions API
      // Here we'll create a simplified direct line for the demo
      
      const simulateRoute = () => {
        // Create a simple route with a few points
        const numPoints = 10;
        const latStep = (destination.latitude - currentLocation.latitude) / numPoints;
        const lngStep = (destination.longitude - currentLocation.longitude) / numPoints;
        
        const route = [];
        for (let i = 0; i <= numPoints; i++) {
          route.push({
            latitude: currentLocation.latitude + (latStep * i),
            longitude: currentLocation.longitude + (lngStep * i),
          });
        }
        
        setRouteCoordinates(route);
      };
      
      simulateRoute();
    }
  }, [currentLocation, destination, showRoute]);
  
  // Fit map to markers when they change
  useEffect(() => {
    if (mapRef.current) {
      // Wait a bit for the map to initialize fully
      const timer = setTimeout(() => {
        mapRef.current.animateToRegion(getMapRegion(), 1000);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentLocation, destination, driverLocation]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={getMapRegion()}
      >
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Your Location"
          >
            <View style={styles.userMarker}>
              <MaterialIcons name="my-location" size={20} color="#FFFFFF" />
            </View>
          </Marker>
        )}
        
        {destination && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title={destination.address || "Destination"}
          >
            <View style={styles.destinationMarker}>
              <MaterialIcons name="location-on" size={22} color="#FFFFFF" />
            </View>
          </Marker>
        )}
        
        {driverLocation && (
          <Marker
            coordinate={{
              latitude: driverLocation.latitude,
              longitude: driverLocation.longitude,
            }}
            title="Driver"
          >
            <View style={styles.driverMarker}>
              <MaterialIcons name="local-taxi" size={20} color="#FFFFFF" />
            </View>
          </Marker>
        )}
        
        {showRoute && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor="#4A80F0"
            lineDashPattern={[1]}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  userMarker: {
    backgroundColor: '#4A80F0',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  destinationMarker: {
    backgroundColor: '#F49D37',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  driverMarker: {
    backgroundColor: '#33AA33',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default Map;
