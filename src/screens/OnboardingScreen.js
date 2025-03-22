import React, { useContext, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import OnboardingTutorial from '../components/OnboardingTutorial';

const OnboardingScreen = ({ navigation }) => {
  const { updateOnboardingStatus } = useContext(AuthContext);

  const handleOnboardingComplete = async () => {
    try {
      // Mark onboarding as completed in AsyncStorage
      await AsyncStorage.setItem('onboarding_completed', 'true');
      
      // Update context if needed
      if (updateOnboardingStatus) {
        updateOnboardingStatus(true);
      }
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  return (
    <View style={styles.container}>
      <OnboardingTutorial 
        navigation={navigation} 
        onComplete={handleOnboardingComplete} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default OnboardingScreen;