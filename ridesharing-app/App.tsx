"use client"

import "react-native-url-polyfill/auto"
import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "./lib/supabase"
import { ThemeProvider } from './components/theme-provider';

// Screens
import AuthScreen from "./screens/AuthScreen"
import HomeScreen from "./screens/HomeScreen"
import RideScreen from "./screens/RideScreen"
import ProfileScreen from "./screens/ProfileScreen"
import DriverModeScreen from "./screens/DriverModeScreen"
import RideHistoryScreen from "./screens/RideHistoryScreen"

const Stack = createNativeStackNavigator()

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (loading) {
    return null // Or a loading screen
  }

  return (
    <ThemeProvider>
    <NavigationContainer>
      <Stack.Navigator>
        {session && session.user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Ride" component={RideScreen} options={{ title: "Your Ride" }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
            <Stack.Screen name="DriverMode" component={DriverModeScreen} options={{ title: "Driver Mode" }} />
            <Stack.Screen name="RideHistory" component={RideHistoryScreen} options={{ title: "Ride History" }} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </ThemeProvider>
  )
}

