"use client"

import { useState, useEffect, useRef } from "react"
import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button, Input, Icon } from "@rneui/themed"
import MapView, { Marker, PROVIDER_OPENSTREETMAP } from "react-native-maps"
import * as Location from "expo-location"
import { supabase } from "../lib/supabase"
import { useNavigation } from "@react-navigation/native"

export default function HomeScreen() {
  const navigation = useNavigation()
  const [location, setLocation] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [destination, setDestination] = useState("")
  const [isDriverMode, setIsDriverMode] = useState(false)
  const mapRef = useRef(null)

  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied")
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      setLocation(location)
    })()

    // Check if user is registered as a driver
    checkDriverStatus()
  }, [])

  const checkDriverStatus = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase.from("profiles").select("is_driver").eq("id", user.id).single()

      if (data) {
        setIsDriverMode(data.is_driver)
      }
    }
  }

  const requestRide = async () => {
    if (!destination) {
      Alert.alert("Error", "Please enter a destination")
      return
    }

    if (!location) {
      Alert.alert("Error", "Unable to get your current location")
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data, error } = await supabase
        .from("rides")
        .insert([
          {
            rider_id: user.id,
            pickup_lat: location.coords.latitude,
            pickup_lng: location.coords.longitude,
            destination: destination,
            status: "requested",
          },
        ])
        .select()

      if (error) {
        Alert.alert("Error", error.message)
      } else if (data && data[0]) {
        navigation.navigate("Ride", { rideId: data[0].id })
      }
    }
  }

  const toggleDriverMode = () => {
    if (isDriverMode) {
      navigation.navigate("DriverMode")
    } else {
      // Prompt to become a driver
      Alert.alert("Become a Driver", "Would you like to register as a driver?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            const {
              data: { user },
            } = await supabase.auth.getUser()
            if (user) {
              const { error } = await supabase.from("profiles").upsert({ id: user.id, is_driver: true })

              if (error) {
                Alert.alert("Error", error.message)
              } else {
                setIsDriverMode(true)
                navigation.navigate("DriverMode")
              }
            }
          },
        },
      ])
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            ref={mapRef}
            provider={PROVIDER_OPENSTREETMAP}
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="You are here"
            />
          </MapView>
        ) : (
          <View style={styles.loadingMap}>
            <Text>{errorMsg || "Loading map..."}</Text>
          </View>
        )}
      </View>

      <View style={styles.ridePanel}>
        <Text style={styles.panelTitle}>Where to?</Text>
        <Input
          placeholder="Enter destination"
          leftIcon={{ type: "font-awesome", name: "search", color: "#666" }}
          onChangeText={setDestination}
          value={destination}
          containerStyle={styles.inputContainer}
        />
        <Button
          title="Request Ride"
          onPress={requestRide}
          buttonStyle={styles.requestButton}
          containerStyle={styles.buttonContainer}
        />
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("RideHistory")}>
          <Icon name="history" type="font-awesome" color="#333" />
          <Text style={styles.navText}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={toggleDriverMode}>
          <Icon name="car" type="font-awesome" color={isDriverMode ? "#4a80f5" : "#333"} />
          <Text style={[styles.navText, isDriverMode && styles.activeNavText]}>
            {isDriverMode ? "Driver Mode" : "Drive"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Profile")}>
          <Icon name="user" type="font-awesome" color="#333" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  loadingMap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  ridePanel: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  inputContainer: {
    paddingHorizontal: 0,
  },
  buttonContainer: {
    marginTop: 10,
  },
  requestButton: {
    backgroundColor: "#4a80f5",
    borderRadius: 8,
    padding: 12,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  navButton: {
    alignItems: "center",
    padding: 10,
  },
  navText: {
    marginTop: 5,
    fontSize: 12,
  },
  activeNavText: {
    color: "#4a80f5",
  },
})

