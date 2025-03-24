"use client"

import { useState, useEffect } from "react"
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from "react-native"
import { Card, Icon } from "@rneui/themed"
import { supabase } from "../lib/supabase"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"

export default function RideHistoryScreen() {
  const navigation = useNavigation()
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRideHistory()
  }, [])

  const fetchRideHistory = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data, error } = await supabase
        .from("rides")
        .select("*")
        .or(`rider_id.eq.${user.id},driver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })

      if (!error && data) {
        setRides(data)
      }
    }
    setLoading(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#4cd964"
      case "cancelled":
        return "#ff3b30"
      case "in_progress":
        return "#4a80f5"
      default:
        return "#ffcc00"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  const renderRideItem = ({ item }) => (
    <Card containerStyle={styles.rideCard}>
      <View style={styles.rideHeader}>
        <View style={styles.destinationContainer}>
          <Icon name="map-marker" type="font-awesome" size={16} color="#666" />
          <Text style={styles.destination}>{item.destination}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Card.Divider />
      <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
      <TouchableOpacity style={styles.viewButton} onPress={() => navigation.navigate("Ride", { rideId: item.id })}>
        <Text style={styles.viewButtonText}>View Details</Text>
      </TouchableOpacity>
    </Card>
  )

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Ride History</Text>
      <FlatList
        data={rides}
        renderItem={renderRideItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="history" type="font-awesome" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No ride history yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 15,
  },
  listContent: {
    padding: 10,
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
  destinationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  destination: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  dateText: {
    color: "#666",
    fontSize: 14,
    marginVertical: 5,
  },
  viewButton: {
    alignSelf: "flex-end",
    marginTop: 10,
  },
  viewButtonText: {
    color: "#4a80f5",
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
})

