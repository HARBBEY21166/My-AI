import React, { useState, useContext } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Title, TextInput, Button, Surface, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RideContext } from '../context/RideContext';
import StarRating from '../components/StarRating';
import LoadingOverlay from '../components/LoadingOverlay';

const RatingScreen = ({ navigation, route }) => {
  const { rideId, driver, fare } = route.params;
  const { submitRating } = useContext(RideContext);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const handleSubmitRating = async () => {
    setIsSending(true);
    
    try {
      await submitRating(rideId, {
        rating,
        comment,
        driverId: driver.id
      });
      
      // Navigate to home screen after rating
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
      setIsSending(false);
      Alert.alert('Error', 'Could not submit your rating. Please try again.');
    }
  };
  
  const handleSkip = () => {
    // Navigate to home without submitting rating
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  if (isSending) {
    return <LoadingOverlay message="Submitting your rating..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Title style={styles.headerTitle}>Rate Your Trip</Title>
          </View>
          
          <View style={styles.thanksContainer}>
            <Title style={styles.thanksText}>Thanks for riding with us!</Title>
            <Text style={styles.fareText}>You paid ${fare}</Text>
          </View>
          
          <Surface style={styles.driverCard}>
            <Text style={styles.rateText}>How was your trip with</Text>
            <Avatar.Image 
              source={{ uri: driver.photo }}
              size={80} 
              style={styles.driverPhoto}
            />
            <Title style={styles.driverName}>{driver.name}</Title>
            
            <View style={styles.ratingContainer}>
              <StarRating
                rating={rating}
                maxStars={5}
                starSize={36}
                onRatingChange={setRating}
              />
            </View>
          </Surface>
          
          <Surface style={styles.commentCard}>
            <Text style={styles.commentLabel}>Leave a comment (optional)</Text>
            <TextInput
              mode="outlined"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              placeholder="Share your experience..."
              style={styles.commentInput}
            />
          </Surface>
          
          <Button
            mode="contained"
            style={styles.submitButton}
            labelStyle={styles.buttonLabel}
            onPress={handleSubmitRating}
          >
            Submit Rating
          </Button>
          
          <Button
            mode="text"
            style={styles.skipButton}
            onPress={handleSkip}
          >
            Skip
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  thanksContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  thanksText: {
    fontSize: 20,
    color: '#4A80F0',
  },
  fareText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  driverCard: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  rateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  driverPhoto: {
    marginBottom: 12,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingContainer: {
    marginTop: 16,
  },
  commentCard: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: 16,
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: '#F8F8F8',
  },
  submitButton: {
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: '#4A80F0',
  },
  skipButton: {
    marginTop: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RatingScreen;
