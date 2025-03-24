"use client"

import { useState, useEffect } from "react"
import { StyleSheet, View, Text, Alert } from "react-native"
import { Button, Card, Icon } from "@rneui/themed"
import MapView, { Marker, PROVIDER_OPENSTREETMAP } from "react-native-maps"
import { supabase } from "../lib/supabase"
import { useNavigation, useRoute } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function RideScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { rideId } = route.params

  const [ride, setRide] = useState(null)
  const [driver, setDriver] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRideDetails()

    // Subscribe to changes on this ride
    const subscription = supabase
      .channel(`ride:${rideId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rides",
          filter: `id=eq.${rideId}`,
        },
        (payload) => {
          setRide(payload.new)
          if (payload.new.driver_id && !driver) {
            fetchDriverDetails(payload.new.driver_id)
          }
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [rideId])

  const fetchRideDetails = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("rides").select("*").eq("id", rideId).single()

    if (error) {
      Alert.alert("Error", error.message)
    } else if (data) {
      setRide(data)
      if (data.driver_id) {
        fetchDriverDetails(data.driver_id)
      }
    }
    setLoading(false)
  }

  const fetchDriverDetails = async (driverId) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", driverId).single()

    if (!error && data) {
      setDriver(data)
    }
  }

  const cancelRide = async () => {
    Alert.alert("Cancel Ride", "Are you sure you want to cancel this ride?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: async () => {
          const { error } = await supabase.from("rides").update({ status: "cancelled" }).eq("id", rideId)

          if (error) {
            Alert.alert("Error", error.message)
          } else {
            navigation.goBack()
          }
        },
      },
    ])
  }

  const completeRide = async () => {
    const { error } = await supabase.from("rides").update({ status: "completed" }).eq("id", rideId)

    if (error) {
      Alert.alert("Error", error.message)
    } else {
      Alert.alert("Success", "Ride completed!", [
        {
          text: "Rate Driver",
          onPress: () => {
            // Navigate to rating screen (not implemented in this example)
            navigation.goBack()
          },
        },
        {
          text: "Skip",
          onPress: () => navigation.goBack(),
        },
      ])
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading ride details...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        {ride && (
          <MapView
            provider={PROVIDER_OPENSTREETMAP}
            style={styles.map}
            initialRegion={{
              latitude: ride.pickup_lat,
              longitude: ride.pickup_lng,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{
                latitude: ride.pickup_lat,
                longitude: ride.pickup_lng,
              }}
              title="Pickup Location"
              pinColor="green"
            />
          </MapView>
        )}
      </View>

      <View style={styles.rideInfoContainer}>
        <Card containerStyle={styles.card}>
          <Card.Title>Ride Status: {ride?.status.toUpperCase()}</Card.Title>
          <Card.Divider />

          <Text style={styles.destinationText}>
            <Icon name="location-arrow" type="font-awesome" size={16} color="#666" /> Destination: {ride?.destination}
          </Text>

          {driver ? (
            <View style={styles.driverInfo}>
              <Text style={styles.driverTitle}>Your Driver</Text>
              <View style={styles.driverDetails}>
                <Icon name="user-circle" type="font-awesome" size={40} color="#4a80f5" />
                <View style={styles.driverTextContainer}>
                  <Text style={styles.driverName}>{driver.full_name || "Driver"}</Text>
                  <Text>License: {driver.license_plate || "N/A"}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.waitingDriver}>
              <Text style={styles.waitingText}>Waiting for a driver...</Text>
            </View>
          )}

          {ride?.status === "requested" && (
            <Button
              title="Cancel Ride"
              onPress={cancelRide}
              buttonStyle={styles.cancelButton}
              containerStyle={styles.buttonContainer}
            />
          )}

          {ride?.status === "in_progress" && (
            <Button
              title="Complete Ride"
              onPress={completeRide}
              buttonStyle={styles.completeButton}
              containerStyle={styles.buttonContainer}
            />
          )}

          {ride?.status === "completed" && (
            <View style={styles.completedContainer}>
              <Icon name="check-circle" type="font-awesome" size={50} color="green" />
              <Text style={styles.completedText}>Ride Completed</Text>
            </View>
          )}
        </Card>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapContainer: {
    height: "50%",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  rideInfoContainer: {
    flex: 1,
    padding: 10,
  },
  card: {
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 0,
  },
  destinationText: {
    fontSize: 16,
    marginBottom: 20,
  },
  driverInfo: {
    marginVertical: 15,
  },
  driverTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  driverDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverTextContainer: {
    marginLeft: 15,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  waitingDriver: {
    alignItems: "center",
    padding: 20,
  },
  waitingText: {
    fontSize: 16,
    color: "#666",
  },
  buttonContainer: {
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#ff6b6b",
    borderRadius: 8,
  },
  completeButton: {
    backgroundColor: "#4a80f5",
    borderRadius: 8,
  },
  completedContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  completedText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "green",
  },
})

