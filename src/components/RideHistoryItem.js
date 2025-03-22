import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Surface, Chip } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const RideHistoryItem = ({ ride, onPress }) => {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status color and icon
  const getStatusDetails = (status) => {
    switch(status) {
      case 'completed':
        return { 
          color: '#4CAF50', 
          icon: 'check-circle', 
          label: 'Completed' 
        };
      case 'cancelled':
        return { 
          color: '#F44336', 
          icon: 'cancel', 
          label: 'Cancelled' 
        };
      case 'in_progress':
        return { 
          color: '#2196F3', 
          icon: 'directions-car', 
          label: 'In Progress' 
        };
      default:
        return { 
          color: '#9E9E9E', 
          icon: 'help', 
          label: 'Unknown' 
        };
    }
  };
  
  const statusDetails = getStatusDetails(ride.status);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Surface style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.date}>{formatDate(ride.date)}</Text>
          <Chip 
            mode="outlined" 
            style={[styles.statusChip, { borderColor: statusDetails.color }]}
            textStyle={{ color: statusDetails.color }}
            icon={() => <MaterialIcons name={statusDetails.icon} size={16} color={statusDetails.color} />}
          >
            {statusDetails.label}
          </Chip>
        </View>
        
        <View style={styles.locationsContainer}>
          <View style={styles.locationRow}>
            <MaterialIcons name="fiber-manual-record" size={14} color="#4A80F0" />
            <Text 
              style={styles.locationText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {ride.origin.address}
            </Text>
          </View>
          
          <View style={styles.verticalLine} />
          
          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={14} color="#F49D37" />
            <Text 
              style={styles.locationText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {ride.destination.address}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <MaterialIcons name="access-time" size={16} color="#666666" />
            <Text style={styles.detailText}>{ride.duration} min</Text>
          </View>
          
          <View style={styles.detailItem}>
            <MaterialIcons name="timeline" size={16} color="#666666" />
            <Text style={styles.detailText}>{ride.distance} km</Text>
          </View>
          
          <View style={styles.detailItem}>
            <MaterialIcons name="attach-money" size={16} color="#666666" />
            <Text style={styles.detailText}>${ride.fare}</Text>
          </View>
          
          {ride.driver && (
            <View style={styles.detailItem}>
              <MaterialIcons name="person" size={16} color="#666666" />
              <Text style={styles.detailText}>{ride.driver.name}</Text>
            </View>
          )}
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    color: '#666666',
  },
  statusChip: {
    height: 28,
  },
  locationsContainer: {
    marginBottom: 12,
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  verticalLine: {
    width: 1,
    height: 16,
    backgroundColor: '#DDDDDD',
    marginLeft: 7,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666666',
  },
});

export default RideHistoryItem;
