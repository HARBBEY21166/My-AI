import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
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
  Modal,
  Alert,
  Appearance,
  useColorScheme,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome, Feather } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import { toast } from 'sonner-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Markdown from 'react-native-markdown-display';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  id?: string;
}

const SYSTEM_MESSAGE: Message = {
  role: 'system',
  content: `You are an expert programming assistant. When providing code solutions:
- Write clean, well-commented code
- Explain your solution steps
- Consider edge cases
- Suggest optimizations
- Use modern best practices
- Provide working examples`,
  id: 'system-msg'
};

const INITIAL_PROMPTS = [
  "How do I optimize React performance?",
  "Explain async/await in JavaScript",
  "Show me a Python Flask REST API example",
  "What's the difference between useState and useEffect?",
  "How to implement authentication in Next.js?"
];

const THEMES = {
  light: {
    background: '#FFFFFF',
    text: '#000000',
    inputBackground: '#F5F5F5',
    bubbleUser: '#007AFF',
    bubbleAI: '#E5E5EA',
    bubbleTextUser: '#FFFFFF',
    bubbleTextAI: '#000000',
    header: '#F8F8F8',
    codeBlock: '#2C2C2E',
    codeText: '#FFFFFF',
    timestamp: '#8E8E93',
  },
  dark: {
    background: '#1E1E1E',
    text: '#FFFFFF',
    inputBackground: '#252526',
    bubbleUser: '#0D47A1',
    bubbleAI: '#2C2C2C',
    bubbleTextUser: '#FFFFFF',
    bubbleTextAI: '#FFFFFF',
    header: '#252526',
    codeBlock: '#1E1E1E',
    codeText: '#D4D4D4',
    timestamp: '#AAAAAA',
  }
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([SYSTEM_MESSAGE]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<Message[][]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [showPrompts, setShowPrompts] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [modelTemperature, setModelTemperature] = useState<number>(0.7);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [apiEndpoint, setApiEndpoint] = useState<string>('https://api.a0.dev/ai/llm');
  const scrollViewRef = useRef<ScrollView>(null);
  const maxInputLength = 2000;
  const colorScheme = useColorScheme();
  const theme = THEMES[colorScheme || 'dark'];

  // Load saved data on initial render
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const [history, endpoint, temp] = await Promise.all([
          AsyncStorage.getItem('chatHistory'),
          AsyncStorage.getItem('apiEndpoint'),
          AsyncStorage.getItem('modelTemperature')
        ]);
        
        if (history) setChatHistory(JSON.parse(history));
        if (endpoint) setApiEndpoint(endpoint);
        if (temp) setModelTemperature(parseFloat(temp));
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    };

    loadSavedData();
  }, []);

  // Save data when it changes
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem('apiEndpoint', apiEndpoint);
        await AsyncStorage.setItem('modelTemperature', modelTemperature.toString());
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    };

    saveSettings();
  }, [apiEndpoint, modelTemperature]);

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    toast.success('Copied to clipboard!');
  };

  const formatMessage = (content: string) => {
    return (
      <Markdown style={{
        body: { color: theme.bubbleTextAI },
        code_inline: { 
          backgroundColor: theme.codeBlock,
          color: theme.codeText,
          padding: 4,
          borderRadius: 4,
          fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        },
        fence: {
          backgroundColor: theme.codeBlock,
          color: theme.codeText,
          padding: 16,
          borderRadius: 8,
          fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        },
        code_block: {
          backgroundColor: theme.codeBlock,
          color: theme.codeText,
          padding: 16,
          borderRadius: 8,
          fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        }
      }}>
        {content}
      </Markdown>
    );
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = { 
      role: 'user', 
      content: inputText.trim(),
      timestamp: new Date().toLocaleTimeString(),
      id: Date.now().toString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setShowPrompts(false);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          temperature: modelTemperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.completion,
        timestamp: new Date().toLocaleTimeString(),
        id: Date.now().toString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('API Error:', error);
      toast.error('Failed to get response. Please check your API endpoint and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = async () => {
    if (messages.length > 1) {
      Alert.alert(
        'Start New Chat',
        'Are you sure you want to start a new chat?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'New Chat',
            onPress: async () => {
              const updatedHistory = [...chatHistory, messages];
              setChatHistory(updatedHistory);
              await AsyncStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
              setMessages([SYSTEM_MESSAGE]);
              setShowPrompts(true);
            },
          },
        ]
      );
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const selectChatFromHistory = (chat: Message[]) => {
    setMessages(chat);
    setShowHistory(false);
    setShowPrompts(false);
  };

  const deleteChatFromHistory = async (index: number) => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            const updatedHistory = chatHistory.filter((_, i) => i !== index);
            setChatHistory(updatedHistory);
            await AsyncStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
            toast.success('Chat deleted successfully!');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const clearChatHistory = async () => {
    Alert.alert(
      'Clear All History',
      'This will permanently delete all your chat history. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          onPress: async () => {
            setChatHistory([]);
            await AsyncStorage.removeItem('chatHistory');
            toast.success('Chat history cleared!');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const filteredChatHistory = chatHistory.filter(chat => 
    chat.some(message => 
      message.content.toLowerCase().includes(searchText.toLowerCase()) &&
      message.role !== 'system'
    )
  );

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const toggleSpeech = () => {
    // Implement text-to-speech functionality here
    setIsSpeaking(!isSpeaking);
    toast.info('Text-to-speech coming soon!');
  };

  const handleLinkPress = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    if (isSystem) return null;

    return (
      <Animated.View
        key={message.id || index}
        entering={isUser ? FadeInUp.delay(index * 100) : FadeInDown.delay(index * 100)}
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
          {
            backgroundColor: isUser ? theme.bubbleUser : theme.bubbleAI,
          },
        ]}
      >
        <View style={styles.messageHeader}>
          <Text style={[styles.messageRole, { color: isUser ? theme.bubbleTextUser : theme.bubbleTextAI }]}>
            {isUser ? 'You' : 'Assistant'}
          </Text>
          <View style={styles.messageActions}>
            {!isUser && (
              <>
                <TouchableOpacity onPress={() => copyToClipboard(message.content)}>
                  <MaterialIcons 
                    name="content-copy" 
                    size={18} 
                    color={theme.bubbleTextAI} 
                    style={styles.actionIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleSpeech}>
                  <Feather 
                    name={isSpeaking ? "volume-x" : "volume-2"} 
                    size={18} 
                    color={theme.bubbleTextAI} 
                    style={styles.actionIcon}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        
        {formatMessage(message.content)}
        
        <Text style={[styles.timestamp, { color: theme.timestamp }]}>
          {message.timestamp}
        </Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.header }]}>
        <TouchableOpacity onPress={toggleHistory} style={styles.headerButton}>
          <Ionicons name="time-outline" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.text }]}>Code Assistant</Text>
        
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.headerButton}>
            <Ionicons name="settings-outline" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={startNewChat} style={styles.headerButton}>
            <Ionicons name="add" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        keyboardDismissMode="interactive"
      >
        {messages.filter(m => m.role !== 'system').map(renderMessage)}
        
        {isLoading && (
          <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: theme.bubbleAI }]}>
            <ActivityIndicator color={theme.bubbleTextAI} />
          </View>
        )}

        {showPrompts && messages.length <= 1 && (
          <Animated.View entering={FadeInUp} style={styles.promptsContainer}>
            <Text style={[styles.promptsTitle, { color: theme.text }]}>Quick Prompts</Text>
            <View style={styles.promptsGrid}>
              {INITIAL_PROMPTS.map((prompt, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.promptButton, { backgroundColor: theme.inputBackground }]}
                  onPress={() => handleQuickPrompt(prompt)}
                >
                  <Text style={[styles.promptText, { color: theme.text }]}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputContainer, { backgroundColor: theme.header }]}>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: theme.inputBackground,
                color: theme.text,
              }
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Describe your coding problem..."
            placeholderTextColor={theme.timestamp}
            multiline
            maxLength={maxInputLength}
            enablesReturnKeyAutomatically
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <Text style={[styles.charCount, { color: theme.timestamp }]}>
            {`${inputText.length}/${maxInputLength}`}
          </Text>
          <TouchableOpacity
            style={[
              styles.sendButton, 
              !inputText.trim() && styles.sendButtonDisabled,
              { backgroundColor: theme.inputBackground }
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={24}
              color={inputText.trim() && !isLoading ? theme.bubbleUser : theme.timestamp}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Chat History Modal */}
      <Modal visible={showHistory} animationType="slide">
        <SafeAreaView style={[styles.historyContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.historyHeader, { backgroundColor: theme.header }]}>
            <Text style={[styles.historyTitle, { color: theme.text }]}>Chat History</Text>
            <TouchableOpacity onPress={toggleHistory}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={[
              styles.searchInput, 
              { 
                backgroundColor: theme.inputBackground,
                color: theme.text,
              }
            ]}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search chats..."
            placeholderTextColor={theme.timestamp}
          />
          
          <ScrollView style={styles.historyScroll}>
            {filteredChatHistory.length === 0 ? (
              <Text style={[styles.noHistoryText, { color: theme.text }]}>
                {chatHistory.length === 0 ? 'No chat history yet' : 'No matching chats found'}
              </Text>
            ) : (
              filteredChatHistory.map((chat, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.historyChat, 
                    { backgroundColor: theme.inputBackground }
                  ]}
                >
                  <TouchableOpacity 
                    style={styles.historyChatContent}
                    onPress={() => selectChatFromHistory(chat)}
                  >
                    <Text 
                      style={[styles.historyMessage, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {chat.find(m => m.role === 'user')?.content || 'Empty chat'}
                    </Text>
                    <Text style={[styles.historyTimestamp, { color: theme.timestamp }]}>
                      {chat.find(m => m.role === 'user')?.timestamp}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => deleteChatFromHistory(index)} 
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
          
          <TouchableOpacity 
            onPress={clearChatHistory} 
            style={[
              styles.clearHistoryButton, 
              { backgroundColor: '#FF3B30' }
            ]}
          >
            <Text style={styles.clearHistoryText}>Clear All History</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="slide">
        <SafeAreaView style={[styles.settingsContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.settingsHeader, { backgroundColor: theme.header }]}>
            <Text style={[styles.settingsTitle, { color: theme.text }]}>Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.settingsScroll}>
            <View style={styles.settingGroup}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>API Endpoint</Text>
              <TextInput
                style={[
                  styles.settingInput,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.timestamp,
                  }
                ]}
                value={apiEndpoint}
                onChangeText={setApiEndpoint}
                placeholder="https://api.example.com/chat"
                placeholderTextColor={theme.timestamp}
              />
            </View>
            
            <View style={styles.settingGroup}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                Model Temperature: {modelTemperature.toFixed(1)}
              </Text>
              <View style={styles.sliderContainer}>
                <Text style={[styles.sliderValue, { color: theme.text }]}>0.0</Text>
                <View style={styles.sliderTrack}>
                  <View 
                    style={[
                      styles.sliderProgress,
                      { 
                        width: `${modelTemperature * 100}%`,
                        backgroundColor: theme.bubbleUser,
                      }
                    ]}
                  />
                  <View style={styles.sliderThumbContainer}>
                    <View 
                      style={[
                        styles.sliderThumb,
                        { backgroundColor: theme.bubbleUser }
                      ]}
                    />
                  </View>
                </View>
                <Text style={[styles.sliderValue, { color: theme.text }]}>1.0</Text>
              </View>
              <Text style={[styles.settingDescription, { color: theme.timestamp }]}>
                Higher values make output more random, lower values make it more deterministic.
              </Text>
            </View>
            
            <View style={styles.settingGroup}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Appearance</Text>
              <View style={styles.themeButtons}>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    colorScheme === 'light' && styles.themeButtonActive,
                    { borderColor: theme.timestamp }
                  ]}
                  onPress={() => Appearance.setColorScheme('light')}
                >
                  <Text style={[styles.themeButtonText, { color: theme.text }]}>Light</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    colorScheme === 'dark' && styles.themeButtonActive,
                    { borderColor: theme.timestamp }
                  ]}
                  onPress={() => Appearance.setColorScheme('dark')}
                >
                  <Text style={[styles.themeButtonText, { color: theme.text }]}>Dark</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    !colorScheme && styles.themeButtonActive,
                    { borderColor: theme.timestamp }
                  ]}
                  onPress={() => Appearance.setColorScheme(null)}
                >
                  <Text style={[styles.themeButtonText, { color: theme.text }]}>System</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.settingGroup}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>About</Text>
              <Text style={[styles.settingDescription, { color: theme.timestamp }]}>
                Code Assistant v1.0.0
              </Text>
              <Text style={[styles.settingDescription, { color: theme.timestamp }]}>
                A programming assistant powered by AI
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 80,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  messageRole: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  messageActions: {
    flexDirection: 'row',
  },
  actionIcon: {
    marginLeft: 10,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  inputContainer: {
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
  charCount: {
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
  sendButtonDisabled: {
    opacity: 0.5,
  },
  historyContainer: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchInput: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
    fontSize: 16,
  },
  historyScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  noHistoryText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  historyChat: {
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  historyChatContent: {
    flex: 1,
    padding: 12,
  },
  historyMessage: {
    fontSize: 16,
  },
  historyTimestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  deleteButton: {
    padding: 12,
  },
  clearHistoryButton: {
    borderRadius: 20,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  clearHistoryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  promptsContainer: {
    marginTop: 20,
  },
  promptsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  promptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  promptButton: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  promptText: {
    fontSize: 14,
  },
  settingsContainer: {
    flex: 1,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsScroll: {
    flex: 1,
    padding: 16,
  },
  settingGroup: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  settingInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 8,
    position: 'relative',
  },
  sliderProgress: {
    height: '100%',
    borderRadius: 2,
    position: 'absolute',
  },
  sliderThumbContainer: {
    position: 'absolute',
    left: '50%',
    top: -10,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
  },
  sliderValue: {
    fontSize: 14,
    width: 32,
    textAlign: 'center',
  },
  themeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  themeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  themeButtonActive: {
    borderWidth: 2,
  },
  themeButtonText: {
    fontSize: 14,
  },
});