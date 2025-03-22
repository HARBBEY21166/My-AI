import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  Dimensions, 
  TouchableOpacity, 
  Animated,
  FlatList
} from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { SvgUri } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Helper function to generate local or remote URI for SVG files
const getSvgUri = (filename) => {
  if (__DEV__) {
    // In development, use local path
    return { uri: `assets/onboarding/${filename}.svg` };
  } else {
    // In production, could use a remote URL
    return { uri: `https://your-domain.com/assets/onboarding/${filename}.svg` };
  }
};

// Onboarding tutorial data with character-driven storytelling
const tutorialData = [
  {
    id: '1',
    title: "Meet RideMate!",
    description: "Hey there! I'm RideMate, your friendly guide to this awesome ride-sharing app. I'll help you discover all the cool features!",
    imageName: 'character-welcome',
    backgroundColor: '#4A80F0',
    characterPosition: 'center',
    actionText: "Let's Go!"
  },
  {
    id: '2',
    title: "Finding Your Ride",
    description: "Just type where you want to go, and I'll find the perfect ride for you! You can choose from different ride types based on your needs.",
    imageName: 'character-map',
    backgroundColor: '#7C4DFF',
    characterPosition: 'right',
    actionText: "Cool!"
  },
  {
    id: '3',
    title: "Track Your Journey",
    description: "Watch your driver approach in real-time on the map. I'll keep you updated every step of the way!",
    imageName: 'character-tracking',
    backgroundColor: '#43A047',
    characterPosition: 'left',
    actionText: "Awesome!"
  },
  {
    id: '4',
    title: "Easy Payments",
    description: "Pay securely with your preferred method. I'll make sure your transaction goes smoothly, every time!",
    imageName: 'character-payment',
    backgroundColor: '#FF5722',
    characterPosition: 'right',
    actionText: "Got it!"
  },
  {
    id: '5',
    title: "Ready to Ride?",
    description: "You're all set to go! Remember, I'm always here if you need any help. Let's make every journey a great one!",
    imageName: 'character-ready',
    backgroundColor: '#00BCD4',
    characterPosition: 'center',
    actionText: "Start Riding!"
  }
];

const OnboardingTutorial = ({ navigation, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  // Animation values
  const characterOpacity = useRef(new Animated.Value(0)).current;
  const characterTranslate = useRef(new Animated.Value(50)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(20)).current;

  // Trigger animations when index changes
  useEffect(() => {
    // Reset animations
    characterOpacity.setValue(0);
    characterTranslate.setValue(50);
    textOpacity.setValue(0);
    textTranslate.setValue(20);

    // Start animations
    Animated.parallel([
      Animated.timing(characterOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(characterTranslate, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslate, {
        toValue: 0,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < tutorialData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Last slide, complete onboarding
      if (onComplete) {
        onComplete();
      }
      
      // Navigate to home or login screen
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    // Skip to the end of the tutorial
    flatListRef.current?.scrollToIndex({
      index: tutorialData.length - 1,
      animated: true,
    });
  };

  const renderDotIndicator = () => {
    return (
      <View style={styles.dotContainer}>
        {tutorialData.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp',
          });
          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });
          
          return (
            <Animated.View 
              key={`dot-${index}`} 
              style={[
                styles.dot,
                { 
                  width: dotWidth,
                  opacity: dotOpacity,
                  backgroundColor: currentIndex === index ? '#FFFFFF' : 'rgba(255,255,255,0.5)'
                }
              ]}
            />
          );
        })}
      </View>
    );
  };

  const renderItem = ({ item, index }) => {
    const backgroundColor = { backgroundColor: item.backgroundColor };
    
    return (
      <View style={[styles.slide, backgroundColor]}>
        <View style={styles.contentContainer}>
          <Animated.View 
            style={[
              styles.imageContainer,
              { 
                opacity: characterOpacity,
                transform: [{ translateY: characterTranslate }],
                alignItems: item.characterPosition === 'center' ? 'center' : 
                            item.characterPosition === 'left' ? 'flex-start' : 'flex-end',
              }
            ]}
          >
            {/* Render SVG from assets */}
            <SvgUri
              width={width * 0.8}
              height={height * 0.4}
              uri={getSvgUri(item.imageName).uri}
            />
          </Animated.View>

          <Animated.View 
            style={[
              styles.textContainer,
              {
                opacity: textOpacity,
                transform: [{ translateY: textTranslate }]
              }
            ]}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </Animated.View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.skipButtonContainer}>
        {currentIndex < tutorialData.length - 1 && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={tutorialData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={16}
      />

      {renderDotIndicator()}

      <View style={styles.bottomContainer}>
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.nextButton}
          labelStyle={styles.nextButtonLabel}
        >
          {tutorialData[currentIndex]?.actionText || 'Next'}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  slide: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    maxHeight: height * 0.5,
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dotContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextButton: {
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  nextButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  skipButtonContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  }
});

export default OnboardingTutorial;