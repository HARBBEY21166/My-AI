import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Modal 
} from 'react-native';
import { Theme } from '../../types';

interface AuthModalProps {
  visible: boolean;
  theme: Theme;
  onLogin: (email: string, password: string) => void;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  visible, 
  theme, 
  onLogin, 
  onClose 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    onLogin(email, password);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          Login to Code Assistant
        </Text>
        
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.inputBackground, color: theme.text }
          ]}
          placeholder="Email"
          placeholderTextColor={theme.timestamp}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.inputBackground, color: theme.text }
          ]}
          placeholder="Password"
          placeholderTextColor={theme.timestamp}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.bubbleUser }]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.inputBackground }]}
            onPress={onClose}
          >
            <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AuthModal;