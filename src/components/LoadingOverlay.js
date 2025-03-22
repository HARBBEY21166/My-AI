import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';

const LoadingOverlay = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4A80F0" />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  loader: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 200,
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default LoadingOverlay;
