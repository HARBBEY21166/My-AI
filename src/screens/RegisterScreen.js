import React, { useState, useContext } from 'react';
import { StyleSheet, View, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Title, Text, HelperText } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import LoadingOverlay from '../components/LoadingOverlay';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  
  // Form validation errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const { signUp, error: authError, isLoading } = useContext(AuthContext);

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^\d{10}$/;
    return re.test(phone);
  };

  const handleRegister = async () => {
    // Reset errors
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    setConfirmPasswordError('');
    
    // Validate inputs
    let hasError = false;
    
    if (!name.trim()) {
      setNameError('Name is required');
      hasError = true;
    }
    
    if (!email.trim()) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      hasError = true;
    }
    
    if (!phone.trim()) {
      setPhoneError('Phone number is required');
      hasError = true;
    } else if (!validatePhone(phone)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      hasError = true;
    }
    
    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    }
    
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }
    
    if (!hasError) {
      // Attempt registration
      await signUp({ name, email, phone, password });
    }
  };

  if (isLoading) {
    return <LoadingOverlay message="Creating your account..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Title style={styles.headerTitle}>Create Account</Title>
            <View style={styles.placeholderView} />
          </View>
          
          {authError ? (
            <HelperText type="error" style={styles.errorText}>
              {authError}
            </HelperText>
          ) : null}
          
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            left={<TextInput.Icon name="account" color="#4A80F0" />}
            error={!!nameError}
          />
          {nameError ? <HelperText type="error">{nameError}</HelperText> : null}
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            left={<TextInput.Icon name="email" color="#4A80F0" />}
            error={!!emailError}
          />
          {emailError ? <HelperText type="error">{emailError}</HelperText> : null}
          
          <TextInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            keyboardType="phone-pad"
            left={<TextInput.Icon name="phone" color="#4A80F0" />}
            error={!!phoneError}
          />
          {phoneError ? <HelperText type="error">{phoneError}</HelperText> : null}
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureTextEntry}
            style={styles.input}
            left={<TextInput.Icon name="lock" color="#4A80F0" />}
            right={
              <TextInput.Icon
                name={secureTextEntry ? "eye-off" : "eye"}
                onPress={() => setSecureTextEntry(!secureTextEntry)}
                color="#4A80F0"
              />
            }
            error={!!passwordError}
          />
          {passwordError ? <HelperText type="error">{passwordError}</HelperText> : null}
          
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={confirmSecureTextEntry}
            style={styles.input}
            left={<TextInput.Icon name="lock" color="#4A80F0" />}
            right={
              <TextInput.Icon
                name={confirmSecureTextEntry ? "eye-off" : "eye"}
                onPress={() => setConfirmSecureTextEntry(!confirmSecureTextEntry)}
                color="#4A80F0"
              />
            }
            error={!!confirmPasswordError}
          />
          {confirmPasswordError ? <HelperText type="error">{confirmPasswordError}</HelperText> : null}
          
          <Button
            mode="contained"
            onPress={handleRegister}
            style={styles.registerButton}
            labelStyle={styles.buttonLabel}
          >
            Sign Up
          </Button>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholderView: {
    width: 34, // Same width as back button for alignment
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#F8F8F8',
  },
  registerButton: {
    marginTop: 24,
    paddingVertical: 8,
    backgroundColor: '#4A80F0',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#666',
  },
  loginText: {
    color: '#4A80F0',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 16,
  },
});

export default RegisterScreen;
