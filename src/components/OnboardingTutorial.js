import React from 'react';
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native';
import { COLORS } from '../utils/constants';

const { width } = Dimensions.get('window');

const OnboardingTutorial = ({ step, stepNumber, totalSteps }) => {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={step.imageSource} 
          style={styles.image} 
          resizeMode="contain" 
        />
      </View>
      
      <Text style={styles.title}>{step.title}</Text>
      <Text style={styles.description}>{step.description}</Text>
      
      <View style={styles.progressContainer}>
        {Array(totalSteps).fill(0).map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.progressDot, 
              index === stepNumber - 1 ? styles.activeDot : null
            ]} 
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  imageContainer: {
    height: 280,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.7,
    height: 280,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 20,
  },
});

export default OnboardingTutorial;