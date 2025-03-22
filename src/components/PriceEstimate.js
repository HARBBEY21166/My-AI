import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Surface, Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const PriceEstimate = ({ price, time, distance }) => {
  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Ride Summary</Text>
      </View>
      
      <Divider />
      
      <View style={styles.content}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Estimated Fare</Text>
          <Text style={styles.priceValue}>${price}</Text>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <MaterialIcons name="access-time" size={20} color="#4A80F0" />
            <Text style={styles.detailText}>{time} min</Text>
          </View>
          
          <View style={styles.dividerVertical} />
          
          <View style={styles.detailItem}>
            <MaterialIcons name="timeline" size={20} color="#4A80F0" />
            <Text style={styles.detailText}>{distance} km</Text>
          </View>
        </View>
        
        <View style={styles.paymentMethod}>
          <MaterialIcons name="credit-card" size={18} color="#666666" />
          <Text style={styles.paymentText}>Payment: Credit Card</Text>
          <MaterialIcons name="keyboard-arrow-right" size={18} color="#666666" />
        </View>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 16,
    elevation: 2,
  },
  header: {
    padding: 12,
    backgroundColor: '#F5F5F5',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 16,
    color: '#333333',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A80F0',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerVertical: {
    width: 1,
    height: '100%',
    backgroundColor: '#DDDDDD',
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333333',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  paymentText: {
    flex: 1,
    marginLeft: 8,
    color: '#666666',
    fontSize: 14,
  },
});

export default PriceEstimate;
