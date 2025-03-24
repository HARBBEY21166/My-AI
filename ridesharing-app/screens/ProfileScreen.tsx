"use client"

import { useState, useEffect } from "react"
import { StyleSheet, View, Text, Alert, ScrollView } from "react-native"
import { Button, Input, Avatar, Card } from "@rneui/themed"
import { supabase } from "../lib/supabase"
import { SafeAreaView } from "react-native-safe-area-context"

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null)
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [licensePlate, setLicensePlate] = useState("")
  const [loading, setLoading] = useState(false)
  const [isDriver, setIsDriver] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (!error && data) {
        setProfile(data)
        setFullName(data.full_name || "")
        setPhone(data.phone || "")
        setLicensePlate(data.license_plate || "")
        setIsDriver(data.is_driver || false)
      }
    }
    setLoading(false)
  }

  const updateProfile = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const updates = {
        id: user.id,
        full_name: fullName,
        phone: phone,
        license_plate: licensePlate,
        is_driver: isDriver,
        updated_at: new Date(),
      }

      const { error } = await supabase.from("profiles").upsert(updates)

      if (error) {
        Alert.alert("Error", error.message)
      } else {
        Alert.alert("Success", "Profile updated successfully")
        fetchProfile()
      }
    }
    setLoading(false)
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) Alert.alert("Error", error.message)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarContainer}>
          <Avatar size={100} rounded icon={{ name: "user", type: "font-awesome" }} containerStyle={styles.avatar} />
          <Text style={styles.email}>{profile?.email || ""}</Text>
        </View>

        <Card containerStyle={styles.card}>
          <Card.Title>Personal Information</Card.Title>
          <Card.Divider />

          <Input
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            containerStyle={styles.inputContainer}
          />

          {isDriver && (
            <Input
              label="License Plate"
              value={licensePlate}
              onChangeText={setLicensePlate}
              placeholder="Enter your license plate"
              containerStyle={styles.inputContainer}
            />
          )}

          <Button
            title="Update Profile"
            onPress={updateProfile}
            loading={loading}
            buttonStyle={styles.updateButton}
            containerStyle={styles.buttonContainer}
          />
        </Card>

        <Button
          title="Sign Out"
          onPress={signOut}
          buttonStyle={styles.signOutButton}
          containerStyle={[styles.buttonContainer, styles.signOutContainer]}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 15,
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatar: {
    backgroundColor: "#4a80f5",
  },
  email: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  card: {
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 0,
  },
  inputContainer: {
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 10,
  },
  updateButton: {
    backgroundColor: "#4a80f5",
    borderRadius: 8,
  },
  signOutButton: {
    backgroundColor: "#ff6b6b",
    borderRadius: 8,
  },
  signOutContainer: {
    marginTop: 30,
  },
})

