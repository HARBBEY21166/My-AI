import React, { useContext, useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RideRequestScreen from '../screens/RideRequestScreen';
import DriverMatchingScreen from '../screens/DriverMatchingScreen';
import RideInProgressScreen from '../screens/RideInProgressScreen';
import PaymentScreen from '../screens/PaymentScreen';
import RideHistoryScreen from '../screens/RideHistoryScreen';
import RatingScreen from '../screens/RatingScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// Context
import { AuthContext } from '../context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const RideStack = createStackNavigator();

// Ride Flow Stack Navigator
const RideStackNavigator = () => {
  return (
    <RideStack.Navigator screenOptions={{ headerShown: false }}>
      <RideStack.Screen name="Home" component={HomeScreen} />
      <RideStack.Screen name="RideRequest" component={RideRequestScreen} />
      <RideStack.Screen name="DriverMatching" component={DriverMatchingScreen} />
      <RideStack.Screen name="RideInProgress" component={RideInProgressScreen} />
      <RideStack.Screen name="Payment" component={PaymentScreen} />
      <RideStack.Screen name="Rating" component={RatingScreen} />
    </RideStack.Navigator>
  );
};

// Main Tab Navigator for authenticated users
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Ride') {
            iconName = 'local-taxi';
          } else if (route.name === 'History') {
            iconName = 'history';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4A80F0',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Ride" component={RideStackNavigator} />
      <Tab.Screen name="History" component={RideHistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  const { authState, isLoading, onboardingCompleted } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4A80F0" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!onboardingCompleted ? (
          // Show onboarding first if not completed
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : authState.token ? (
          // User is authenticated, show main app
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          // User is not authenticated, show auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
