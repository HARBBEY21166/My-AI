"use client"

import { useState, useEffect, useRef } from "react"
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert } from "react-native"
import { Card, Button, Icon } from "@rneui/themed"
import MapView, { Marker, PROVIDER_OPENSTREETMAP } from "react-native-maps"
import * as Location from "expo-location"
import { supabase } from "../lib/supabase"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"

export default function DriverModeScreen() {
  const navigation = useNavigation()
  const [location, setLocation] = useState(null)
  const [availableRides, setAvailableRides] = useState([])
  const [currentRide, setCurrentRide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const mapRef = useRef(null)

  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Error", "Permission to access location was denied")
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      setLocation(location)
    })()

    // Check if driver has an active ride
    checkCurrentRide()

    // If no active ride, fetch available rides
    if (!currentRide) {
      fetchAvailableRides()
    }

    // Subscribe to new ride requests
    const subscription = supabase
      .channel("public:rides")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "rides",
          filter: "status=eq.requested",
        },
        (payload) => {
          setAvailableRides((prev) => [payload.new, ...prev])
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkCurrentRide = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data, error } = await supabase
        .from("rides")
        .select("*")
        .eq("driver_id", user.id)
        .in("status", ["accepted", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (!error && data) {
        setCurrentRide(data)
      }
    }
    setLoading(false)
  }

  const fetchAvailableRides = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("rides")
      .select("*")
      .eq("status", "requested")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setAvailableRides(data)
    }
    setLoading(false)
  }

  const acceptRide = async (rideId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data, error } = await supabase
        .from("rides")
        .update({
          driver_id: user.id,
          status: "accepted",
        })
        .eq("id", rideId)
        .select()
        .single()

      if (error) {
        Alert.alert("Error", error.message)
      } else if (data) {
        setCurrentRide(data)
        setAvailableRides([])
      }
    }
  }

  const startRide = async () => {
    if (currentRide) {
      const { error } = await supabase.from("rides").update({ status: "in_progress" }).eq("id", currentRide.id)

      if (error) {
        Alert.alert("Error", error.message)
      } else {
        setCurrentRide((prev) => ({ ...prev, status: "in_progress" }))
      }
    }
  }

  const completeRide = async () => {
    if (currentRide) {
      const { error } = await supabase.from("rides").update({ status: "completed" }).eq("id", currentRide.id)

      if (error) {
        Alert.alert("Error", error.message)
      } else {
        setCurrentRide(null)
        fetchAvailableRides()
      }
    }
  }

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline)
    if (!isOnline) {
      fetchAvailableRides()
    }
  }

  const renderRideItem = ({ item }) => (
    <Card containerStyle={styles.rideCard}>
      <View style={styles.rideHeader}>
        <Text style={styles.rideDestination}>{item.destination}</Text>
        <Text style={styles.rideTime}>{new Date(item.created_at).toLocaleTimeString()}</Text>
      </View>
      <Card.Divider />
      <View style={styles.rideDetails}>
        <View style={styles.rideDetail}>
          <Icon name="map-marker" type="font-awesome" size={16} color="#666" />
          <Text style={styles.rideDetailText}>
            Pickup: {item.pickup_lat.toFixed(4)}, {item.pickup_lng.toFixed(4)}
          </Text>
        </View>
      </View>
      <Button
        title="Accept Ride"
        onPress={() => acceptRide(item.id)}
        buttonStyle={styles.acceptButton}
        containerStyle={styles.buttonContainer}
      />
    </Card>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Driver Mode</Text>
        <TouchableOpacity
          style={[styles.statusButton, isOnline ? styles.onlineButton : styles.offlineButton]}
          onPress={toggleOnlineStatus}
        >
          <Text style={styles.statusText}>{isOnline ? "Online" : "Offline"}</Text>
        </TouchableOpacity>
      </View>

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
              title="Your Location"
            />
            {currentRide && (
              <Marker
                coordinate={{
                  latitude: currentRide.pickup_lat,
                  longitude: currentRide.pickup_lng,
                }}
                title="Pickup Location"
                pinColor="green"
              />
            )}
          </MapView>
        ) : (
          <View style={styles.loadingMap}>
            <Text>Loading map...</Text>
          </View>
        )}
      </View>

      {currentRide ? (
        <View style={styles.currentRideContainer}>
          <Card containerStyle={styles.currentRideCard}>
            <Card.Title>Current Ride</Card.Title>
            <Card.Divider />
            <Text style={styles.rideDestination}>To: {currentRide.destination}</Text>
            <Text style={styles.rideStatus}>Status: {currentRide.status}</Text>

            {currentRide.status === "accepted" ? (
              <Button
                title="Start Ride"
                onPress={startRide}
                buttonStyle={styles.startButton}
                containerStyle={styles.buttonContainer}
              />
            ) : (
              <Button
                title="Complete Ride"
                onPress={completeRide}
                buttonStyle={styles.completeButton}
                containerStyle={styles.buttonContainer}
              />
            )}
          </Card>
        </View>
      ) : (
        <View style={styles.availableRidesContainer}>
          <Text style={styles.sectionTitle}>Available Rides</Text>
          {isOnline ? (
            <FlatList
              data={availableRides}
              renderItem={renderRideItem}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={<Text style={styles.emptyText}>No available rides at the moment</Text>}
            />
          ) : (
            <View style={styles.offlineMessage}>
              <Icon name="power-off" type="font-awesome" size={40} color="#ccc" />
              <Text style={styles.offlineText}>You're currently offline</Text>
              <Text style={styles.offlineSubtext}>Go online to receive ride requests</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  onlineButton: {
    backgroundColor: "#4cd964",
  },
  offlineButton: {
    backgroundColor: "#ff3b30",
  },
  statusText: {
    color: "white",
    fontWeight: "bold",
  },
  mapContainer: {
    height: "40%",
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
  currentRideContainer: {
    flex: 1,
    padding: 10,
  },
  currentRideCard: {
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 0,
  },
  rideDestination: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  rideStatus: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  availableRidesContainer: {
    flex: 1,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 5,
  },
  rideCard: {
    borderRadius: 10,
    marginHorizontal: 0,
    marginBottom: 10,
  },
  rideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rideTime: {
    fontSize: 12,
    color: "#666",
  },
  rideDetails: {
    marginVertical: 10,
  },
  rideDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  rideDetailText: {
    marginLeft: 10,
  },
  buttonContainer: {
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: "#4a80f5",
    borderRadius: 8,
  },
  startButton: {
    backgroundColor: "#4cd964",
    borderRadius: 8,
  },
  completeButton: {
    backgroundColor: "#4a80f5",
    borderRadius: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#666",
  },
  offlineMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  offlineText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    color: "#666",
  },
  offlineSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
  },
})

