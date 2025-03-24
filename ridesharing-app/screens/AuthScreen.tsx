"use client"

import { useState } from "react"
import { StyleSheet, View, Text, Alert, TouchableOpacity, Image, ScrollView } from "react-native"
import { supabase } from "../lib/supabase"
import { Input, Button } from "@rneui/themed"
import { SafeAreaView } from "react-native-safe-area-context"

export default function AuthScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert("Error", error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) {
      Alert.alert("Error", error.message)
    } else {
      Alert.alert("Success", "Check your email for the confirmation link!")
    }
    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image source={{ uri: "/placeholder.svg?height=100&width=100" }} style={styles.logo} />
          <Text style={styles.appName}>RideShare</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.headerText}>{isLogin ? "Sign In" : "Create Account"}</Text>

          <Input
            label="Email"
            leftIcon={{ type: "font-awesome", name: "envelope", color: "#666" }}
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="email@address.com"
            autoCapitalize="none"
            keyboardType="email-address"
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Password"
            leftIcon={{ type: "font-awesome", name: "lock", color: "#666" }}
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize="none"
            containerStyle={styles.inputContainer}
          />

          <Button
            title={isLogin ? "Sign In" : "Sign Up"}
            onPress={isLogin ? signInWithEmail : signUpWithEmail}
            disabled={loading}
            loading={loading}
            buttonStyle={styles.primaryButton}
            containerStyle={styles.buttonContainer}
          />

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Text>
          </TouchableOpacity>
        </View>
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
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  inputContainer: {
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#4a80f5",
    borderRadius: 8,
    padding: 12,
  },
  switchText: {
    textAlign: "center",
    color: "#4a80f5",
    marginTop: 10,
  },
})

