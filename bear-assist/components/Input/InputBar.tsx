import React from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../types';

interface InputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  theme: Theme;
  disabled?: boolean;
  maxLength?: number;
}

const InputBar: React.FC<InputBarProps> = ({
  value,
  onChangeText,
  onSend,
  theme,
  disabled = false,
  maxLength = 2000
}) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.container, { backgroundColor: theme.header }]}>
        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: theme.inputBackground,
              color: theme.text,
            }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder="Type your message..."
          placeholderTextColor={theme.timestamp}
          multiline
          maxLength={maxLength}
          enablesReturnKeyAutomatically
          returnKeyType="send"
          onSubmitEditing={onSend}
        />
        
        <Text style={[styles.counter, { color: theme.timestamp }]}>
          {value.length}/{maxLength}
        </Text>
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: theme.inputBackground },
            disabled && styles.disabledButton
          ]}
          onPress={onSend}
          disabled={disabled}
        >
          <Ionicons
            name="send"
            size={24}
            color={!disabled ? theme.bubbleUser : theme.timestamp}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    maxHeight: 120,
    fontSize: 16,
  },
  counter: {
    marginRight: 8,
    alignSelf: 'flex-end',
    fontSize: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default InputBar;