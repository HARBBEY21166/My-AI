import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, Title, Searchbar, ActivityIndicator, Surface, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { RideContext } from '../context/RideContext';
import RideHistoryItem from '../components/RideHistoryItem';
import LoadingOverlay from '../components/LoadingOverlay';

const RideHistoryScreen = ({ navigation }) => {
  const { getRideHistory } = useContext(RideContext);
  
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'cancelled'
  
  // Fetch ride history
  useEffect(() => {
    const fetchRideHistory = async () => {
      try {
        const history = await getRideHistory();
        setRides(history);
        setFilteredRides(history);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching ride history:', error);
        setIsLoading(false);
        Alert.alert('Error', 'Could not retrieve ride history. Please try again.');
      }
    };
    
    fetchRideHistory();
  }, []);
  
  // Filter rides based on search query and filter selection
  useEffect(() => {
    let results = rides;
    
    // Apply status filter
    if (filter !== 'all') {
      results = results.filter(ride => ride.status === filter);
    }
    
    // Apply search filter if there's a query
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      results = results.filter(ride => 
        ride.destination.address.toLowerCase().includes(lowerCaseQuery) ||
        ride.driver.name.toLowerCase().includes(lowerCaseQuery) ||
        ride.date.toLowerCase().includes(lowerCaseQuery)
      );
    }
    
    setFilteredRides(results);
  }, [searchQuery, filter, rides]);
  
  const handleViewRideDetails = (ride) => {
    // Navigate to a detailed view of the ride (not implemented in this example)
    Alert.alert('Ride Details', `You selected the ride to ${ride.destination.address}`);
  };
  
  const onChangeSearch = query => setSearchQuery(query);
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="history" size={60} color="#CCCCCC" />
      <Text style={styles.emptyText}>No ride history found</Text>
      {searchQuery || filter !== 'all' ? (
        <Text style={styles.emptySubtext}>
          Try adjusting your search or filters
        </Text>
      ) : (
        <Text style={styles.emptySubtext}>
          Your completed rides will appear here
        </Text>
      )}
    </View>
  );

  if (isLoading) {
    return <LoadingOverlay message="Loading ride history..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Your Rides</Title>
      </View>
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search destinations, drivers..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>
      
      <View style={styles.filterContainer}>
        <Chip
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
          style={[styles.filterChip, filter === 'all' && styles.selectedChip]}
          textStyle={filter === 'all' && styles.selectedChipText}
        >
          All
        </Chip>
        
        <Chip
          selected={filter === 'completed'}
          onPress={() => setFilter('completed')}
          style={[styles.filterChip, filter === 'completed' && styles.selectedChip]}
          textStyle={filter === 'completed' && styles.selectedChipText}
        >
          Completed
        </Chip>
        
        <Chip
          selected={filter === 'cancelled'}
          onPress={() => setFilter('cancelled')}
          style={[styles.filterChip, filter === 'cancelled' && styles.selectedChip]}
          textStyle={filter === 'cancelled' && styles.selectedChipText}
        >
          Cancelled
        </Chip>
      </View>
      
      <FlatList
        data={filteredRides}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RideHistoryItem
            ride={item}
            onPress={() => handleViewRideDetails(item)}
          />
        )}
        contentContainerStyle={
          filteredRides.length === 0 ? { flex: 1 } : styles.listContent
        }
        ListEmptyComponent={renderEmptyList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  selectedChip: {
    backgroundColor: '#4A80F0',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default RideHistoryScreen;
