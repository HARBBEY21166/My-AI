import React, { useContext, useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, Image } from 'react-native';
import { Text, Title, Button, Avatar, Divider, List, Switch, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import * as Permissions from '../utils/permissions';

const ProfileScreen = () => {
  const { authState, signOut, updateProfile } = useContext(AuthContext);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  
  const { user } = authState;

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // In a real app, you'd save this preference to the API
  };

  const toggleLocationSharing = async () => {
    if (!locationSharing) {
      // If turning on location sharing, request permissions
      try {
        const granted = await Permissions.requestLocationPermission();
        if (granted) {
          setLocationSharing(true);
        }
      } catch (error) {
        Alert.alert(
          'Permission Error',
          'We could not get location permissions. Please enable them in your device settings.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // Simply turning off location sharing
      setLocationSharing(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: signOut, style: 'destructive' }
      ]
    );
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Profile</Title>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <Avatar.Text
            size={80}
            label={getInitials(user?.name || 'User')}
            style={styles.avatar}
          />
          <Title style={styles.name}>{user?.name || 'User'}</Title>
          <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
          <Text style={styles.phone}>{user?.phone || '+1 (123) 456-7890'}</Text>
          
          <Button
            mode="outlined"
            style={styles.editButton}
            icon="pencil"
            onPress={() => Alert.alert('Edit Profile', 'This feature would allow you to edit your profile details.')}
          >
            Edit Profile
          </Button>
        </View>
        
        <Divider />
        
        <View style={styles.settingsSection}>
          <List.Section>
            <List.Subheader style={styles.sectionTitle}>Settings</List.Subheader>
            
            <List.Item
              title="Payment Methods"
              left={() => <List.Icon icon="credit-card" color="#4A80F0" />}
              right={() => <IconButton icon="chevron-right" />}
              onPress={() => Alert.alert('Payment Methods', 'This would show your saved payment methods.')}
            />
            
            <List.Item
              title="Notifications"
              left={() => <List.Icon icon="bell" color="#4A80F0" />}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={toggleNotifications}
                  color="#4A80F0"
                />
              )}
            />
            
            <List.Item
              title="Location Sharing"
              left={() => <List.Icon icon="map-marker" color="#4A80F0" />}
              right={() => (
                <Switch
                  value={locationSharing}
                  onValueChange={toggleLocationSharing}
                  color="#4A80F0"
                />
              )}
            />
            
            <List.Item
              title="Help Center"
              left={() => <List.Icon icon="help-circle" color="#4A80F0" />}
              right={() => <IconButton icon="chevron-right" />}
              onPress={() => Alert.alert('Help Center', 'This would open the help center.')}
            />
            
            <List.Item
              title="About"
              left={() => <List.Icon icon="information" color="#4A80F0" />}
              right={() => <IconButton icon="chevron-right" />}
              onPress={() => Alert.alert('About', 'RideShare v1.0.0')}
            />
          </List.Section>
        </View>
        
        <Button
          mode="contained"
          style={styles.signOutButton}
          icon="logout"
          onPress={handleSignOut}
        >
          Sign Out
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    backgroundColor: '#4A80F0',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginVertical: 4,
  },
  phone: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  editButton: {
    marginTop: 10,
    borderColor: '#4A80F0',
  },
  settingsSection: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  signOutButton: {
    marginTop: 30,
    marginBottom: 20,
    backgroundColor: '#F44336',
  },
});

export default ProfileScreen;
