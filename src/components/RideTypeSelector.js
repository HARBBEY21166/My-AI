import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const RideTypeSelector = ({ selectedType, onSelectType }) => {
  const rideTypes = [
    {
      id: 'economy',
      title: 'Economy',
      description: 'Affordable rides for everyday use',
      icon: 'directions-car',
      price: '$',
      wait: '5-10 min',
    },
    {
      id: 'standard',
      title: 'Standard',
      description: 'Comfortable rides for up to 4 people',
      icon: 'local-taxi',
      price: '$$',
      wait: '3-7 min',
    },
    {
      id: 'premium',
      title: 'Premium',
      description: 'Luxury vehicles with top-rated drivers',
      icon: 'stars',
      price: '$$$',
      wait: '5-10 min',
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {rideTypes.map((type) => (
        <TouchableOpacity
          key={type.id}
          onPress={() => onSelectType(type.id)}
          activeOpacity={0.7}
        >
          <Surface
            style={[
              styles.card,
              selectedType === type.id && styles.selectedCard,
            ]}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons 
                name={type.icon} 
                size={24} 
                color={selectedType === type.id ? '#FFFFFF' : '#4A80F0'} 
              />
            </View>
            
            <Text style={[
              styles.title,
              selectedType === type.id && styles.selectedText,
            ]}>
              {type.title}
            </Text>
            
            <Text style={[
              styles.price,
              selectedType === type.id && styles.selectedText,
            ]}>
              {type.price}
            </Text>
            
            <Text style={[
              styles.description,
              selectedType === type.id && styles.selectedSubText,
            ]}>
              {type.description}
            </Text>
            
            <Text style={[
              styles.wait,
              selectedType === type.id && styles.selectedSubText,
            ]}>
              Wait: {type.wait}
            </Text>
          </Surface>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  card: {
    width: 160,
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: '#4A80F0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A80F0',
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  wait: {
    fontSize: 12,
    color: '#666666',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  selectedSubText: {
    color: '#E0E0FF',
  },
});

export default RideTypeSelector;
