import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme, Model } from '../types';

interface HeaderProps {
  theme: Theme;
  activeModel: Model;
  onAuthPress: () => void;
  onSettingsPress: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  theme, 
  activeModel, 
  onAuthPress, 
  onSettingsPress 
}) => {
  return (
    <View style={[styles.container, { backgroundColor: theme.header }]}>
      <TouchableOpacity onPress={onAuthPress} style={styles.button}>
        <Ionicons name="person" size={24} color={theme.text} />
      </TouchableOpacity>
      
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.text }]}>Code Assistant</Text>
        <Text style={[styles.modelName, { color: theme.timestamp }]}>
          {activeModel.name}
        </Text>
      </View>
      
      <TouchableOpacity onPress={onSettingsPress} style={styles.button}>
        <Ionicons name="settings" size={24} color={theme.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modelName: {
    fontSize: 12,
    marginTop: 2,
  },
  button: {
    padding: 8,
  },
});

export default Header;