import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, SafeAreaView, StatusBar } from 'react-native';
import { Button } from 'react-native-paper';
import OnboardingTutorial from '../components/OnboardingTutorial';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../utils/constants';

const OnboardingScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { updateOnboardingStatus } = useContext(AuthContext);
  
  // Tutorial content for each step
  const tutorialSteps = [
    {
      title: "Welcome to RideShare!",
      description: "We're excited to have you on board. Let us guide you through our app features.",
      imageSource: require('../../assets/onboarding/character-welcome.png'),
    },
    {
      title: "Find Rides Anywhere",
      description: "Enter your destination and we'll show you available rides nearby. It's that simple!",
      imageSource: require('../../assets/onboarding/character-map.png'),
    },
    {
      title: "Real-time Tracking",
      description: "Track your driver in real-time and share your trip details with friends and family for added safety.",
      imageSource: require('../../assets/onboarding/character-tracking.png'),
    },
    {
      title: "Easy Payments",
      description: "Pay for your ride securely through the app using your preferred payment method.",
      imageSource: require('../../assets/onboarding/character-payment.png'),
    },
    {
      title: "Ready to Go!",
      description: "You're all set! Start your first ride and enjoy the RideShare experience.",
      imageSource: require('../../assets/onboarding/character-ready.png'),
    },
  ];

  // Handle next step
  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding complete - update status and navigate to appropriate screen
      completeOnboarding();
    }
  };

  // Handle skip
  const handleSkip = () => {
    completeOnboarding();
  };

  // Handle back
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    await updateOnboardingStatus(true);
    // No need to navigate here, the AppNavigator will handle navigation based on onboardingCompleted state
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      <View style={styles.tutorialContainer}>
        <OnboardingTutorial 
          step={tutorialSteps[currentStep]} 
          stepNumber={currentStep + 1} 
          totalSteps={tutorialSteps.length}
        />
      </View>
      
      <View style={styles.buttonsContainer}>
        {currentStep > 0 ? (
          <Button 
            mode="text" 
            onPress={handleBack} 
            style={styles.backButton}
            labelStyle={styles.backButtonText}
          >
            Back
          </Button>
        ) : (
          <Button 
            mode="text" 
            onPress={handleSkip} 
            style={styles.skipButton}
            labelStyle={styles.skipButtonText}
          >
            Skip
          </Button>
        )}
        
        <Button 
          mode="contained" 
          onPress={handleNext} 
          style={styles.nextButton}
          labelStyle={styles.nextButtonText}
        >
          {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tutorialContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  backButton: {
    minWidth: 100,
  },
  skipButton: {
    minWidth: 100,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    minWidth: 140,
  },
  backButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  skipButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;