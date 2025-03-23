import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import { toast } from 'sonner-native';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string; // Added timestamp for messages
}

const SYSTEM_MESSAGE: Message = {
  role: 'system',
  content: `You are an expert programming assistant. When providing code solutions:
- Write clean, well-commented code
- Explain your solution steps
- Consider edge cases
- Suggest optimizations
- Use modern best practices
- Provide working examples`
};

const isCodeBlock = (text: string) => {
  return text.includes('```') || text.includes('    ') || /^[a-z]+:\/\//.test(text);
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([SYSTEM_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const maxInputLength = 1000; // Maximum input length

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    toast.success('Copied to clipboard!');
  };

  const formatMessage = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const code = part.replace(/```(\w+)?\n?/g, '').replace(/```$/, '');
        return (
          <View key={index} style={styles.codeBlock}>
            <Text style={styles.codeText}>{code}</Text>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={() => copyToClipboard(code)}
            >
              <MaterialIcons name="content-copy" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        );
      }
      return <Text key={index} style={styles.messageText}>{part}</Text>;
    });
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = { 
      role: 'user', 
      content: inputText.trim(),
      timestamp: new Date().toLocaleTimeString() // Add timestamp
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.a0.dev/ai/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.completion,
        timestamp: new Date().toLocaleTimeString() // Add timestamp
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Code Assistant</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.filter(m => m.role !== 'system').map((message, index) => (
          <Animated.View
            key={index}
            entering={FadeInUp.delay(index * 100)}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userBubble : styles.aiBubble,
            ]}
          >
            {formatMessage(message.content)}
            <Text style={styles.timestamp}>{message.timestamp}</Text> {/* Display timestamp */}
          </Animated.View>
        ))}
        {isLoading && (
          <View style={[styles.messageBubble, styles.aiBubble]}>
            <ActivityIndicator color="#fff" />
          </View>
        )}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Describe your coding problem..."
            placeholderTextColor="#666"
            multiline
            maxLength={maxInputLength}
          />
          <Text style={styles.charCount}>{`${inputText.length}/${maxInputLength}`}</Text> {/* Character count */}
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={24}
              color={inputText.trim() && !isLoading ? '#007AFF' : '#666'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  header: {
    padding: 16,
    backgroundColor: '#252526',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 20,
    marginVertical: 4,
  },
  userBubble: {
    backgroundColor: '#0D47A1',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#2C2C2C',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  codeBlock: {
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    position: 'relative',
  },
  codeText: {
    color: '#D4D4D4',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
  },
  copyButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#252526',
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 120,
    fontSize: 16,
    color: '#fff',
  },
  charCount: {
    color: '#666',
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});