import React, { useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { TextInput, List, ActivityIndicator, Surface } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { locationApi } from '../api/locationApi';

const LocationInput = ({ placeholder, onLocationSelected, style }) => {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  
  // Fetch location predictions based on user input
  const fetchPredictions = async (text) => {
    setQuery(text);
    
    if (text.length > 2) {
      setIsLoading(true);
      setShowPredictions(true);
      
      try {
        const result = await locationApi.searchPlaces(text);
        setPredictions(result);
      } catch (error) {
        console.error('Error fetching predictions:', error);
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  };
  
  // Handle location selection
  const handleSelectLocation = async (placeId, description) => {
    setIsLoading(true);
    
    try {
      const details = await locationApi.getPlaceDetails(placeId);
      
      onLocationSelected({
        placeId,
        address: description,
        latitude: details.latitude,
        longitude: details.longitude,
      });
      
      setQuery(description);
      setShowPredictions(false);
    } catch (error) {
      console.error('Error getting place details:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <View style={[styles.container, style]}>
      <TextInput
        placeholder={placeholder || "Enter location"}
        value={query}
        onChangeText={fetchPredictions}
        style={styles.input}
        left={<TextInput.Icon name="map-marker" color="#4A80F0" />}
        right={
          isLoading ? 
          <TextInput.Icon name={() => <ActivityIndicator size={20} color="#4A80F0" />} /> :
          query.length > 0 ? 
          <TextInput.Icon name="close" onPress={() => { setQuery(''); setPredictions([]); }} /> :
          null
        }
        onFocus={() => {
          if (query.length > 2) {
            setShowPredictions(true);
          }
        }}
      />
      
      {showPredictions && predictions.length > 0 && (
        <Surface style={styles.predictionsContainer}>
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.predictionItem}
                onPress={() => handleSelectLocation(item.id, item.description)}
              >
                <MaterialIcons name="location-on" size={20} color="#4A80F0" style={styles.predictionIcon} />
                <List.Item
                  title={item.description}
                  titleNumberOfLines={1}
                  titleStyle={styles.predictionText}
                  style={styles.listItem}
                />
              </TouchableOpacity>
            )}
            style={styles.predictionsList}
            keyboardShouldPersistTaps="handled"
          />
        </Surface>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  input: {
    backgroundColor: '#F5F5F5',
  },
  predictionsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    maxHeight: 200,
    borderRadius: 4,
    elevation: 4,
    zIndex: 2,
  },
  predictionsList: {
    borderRadius: 4,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  predictionIcon: {
    marginRight: 8,
  },
  predictionText: {
    fontSize: 14,
  },
  listItem: {
    paddingVertical: 4,
  },
});

export default LocationInput;
