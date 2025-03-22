import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const StarRating = ({ 
  rating, 
  maxStars = 5, 
  starSize = 24, 
  color = '#F49D37', 
  emptyColor = '#DDDDDD',
  onRatingChange 
}) => {
  const handlePress = (selectedRating) => {
    if (onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= maxStars; i++) {
      const iconName = i <= rating ? 'star' : 'star-border';
      stars.push(
        <TouchableOpacity 
          key={i} 
          onPress={() => handlePress(i)}
          activeOpacity={0.7}
          style={[
            styles.starContainer, 
            { padding: starSize / 6 }
          ]}
        >
          <MaterialIcons 
            name={iconName} 
            size={starSize} 
            color={i <= rating ? color : emptyColor} 
          />
        </TouchableOpacity>
      );
    }
    
    return stars;
  };

  return (
    <View style={styles.container}>
      {renderStars()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  starContainer: {
    padding: 4,
  },
});

export default StarRating;
