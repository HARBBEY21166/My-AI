import React, { useRef, useState } from 'react';
import { SafeAreaView, ActivityIndicator } from 'react-native';
import { useColorScheme } from 'react-native';
import { THEMES } from '../constants';
import Header from '../components/Header';
import MessageList from '../components/Message/MessageList';
import InputBar from '../components/Input/InputBar';
import AuthModal from '../components/Modals/AuthModal';
import CodePreviewModal from '../components/Modals/CodePreviewModal';
import SettingsModal from '../components/Modals/SettingsModal';
import { Message, Model } from '../types';

const HomeScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const theme = THEMES[colorScheme || 'dark'];
  const scrollViewRef = useRef<ScrollView>(null);
  
  // State management
  // State variables
const [messages, setMessages] = useState<Message[]>([]);
const [inputText, setInputText] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [chatHistory, setChatHistory] = useState<Message[][]>([]);
const [showAuth, setShowAuth] = useState(false);
const [showCodePreview, setShowCodePreview] = useState(false);
const [codeToExecute, setCodeToExecute] = useState('');
const [executionLanguage, setExecutionLanguage] = useState<'javascript' | 'python'>('javascript');
const [showSettings, setShowSettings] = useState(false);
const [models, setModels] = useState<Model[]>(DEFAULT_MODELS);
const [activeModel, setActiveModel] = useState<Model>(DEFAULT_MODELS[0]);
const [userEmail, setUserEmail] = useState('');
const [password, setPassword] = useState('');


  // Handler functions would remain here
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
  
    // Create user message
    const userMessage: Message = {
      role: 'user',
      content: inputText.trim(),
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  
    // Update UI immediately
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    scrollViewRef.current?.scrollToEnd({ animated: true });
  
    try {
      // API call to your backend/LLM
      const response = await fetch(activeModel.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR_API_KEY` // If needed
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: activeModel.systemPrompt },
            ...messages.filter(m => m.role !== 'system'),
            userMessage
          ],
          model: activeModel.id,
          temperature: 0.7
        }),
      });
  
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices?.[0]?.message?.content || data.completion || "I couldn't generate a response",
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: detectLanguage(data.choices?.[0]?.message?.content || data.completion)
      };
  
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save to Firestore if authenticated
      if (auth.currentUser) {
        await saveChatToFirestore([...messages, userMessage, assistantMessage]);
      }
    } catch (error) {
      console.error('API Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper to detect code language
  const detectLanguage = (text: string): 'javascript' | 'python' | undefined => {
    if (text.includes('function(') || text.includes('const ') || text.includes('let ')) {
      return 'javascript';
    }
    if (text.includes('def ') || text.includes('import ')) {
      return 'python';
    }
    return undefined;
  };

  const copyToClipboard = async (text: string) => {
  try {
    await Clipboard.setStringAsync(text);
    toast.success('Copied to clipboard!', {
      position: 'top-center',
      duration: 2000
    });
  } catch (error) {
    console.error('Copy failed:', error);
    toast.error('Failed to copy', {
      position: 'top-center',
      duration: 2000
    });
  }
};

const executeCode = (code: string, language: 'javascript' | 'python') => {
  // Extract code from markdown code blocks if present
  const cleanedCode = code.replace(/```[\s\S]*?\n|```/g, '').trim();
  
  setCodeToExecute(cleanedCode);
  setExecutionLanguage(language);
  setShowCodePreview(true);
  
  // Analytics event if you're tracking
  logEvent('CODE_EXECUTION_ATTEMPT', { 
    language,
    length: cleanedCode.length 
  });
};

const handleLogin = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Load user's previous chats
    const userChats = await loadUserChats(user.uid);
    if (userChats.length > 0) {
      setChatHistory(userChats);
    }
    
    setShowAuth(false);
    toast.success(`Welcome back, ${user.email}!`);
  } catch (error: any) {
    console.error('Login error:', error);
    toast.error(error.message || 'Login failed');
  }
};

const saveChatToFirestore = async (messages: Message[]) => {
  if (!auth.currentUser) return;

  try {
    const chatRef = doc(collection(db, 'chats'));
    await setDoc(chatRef, {
      userId: auth.currentUser.uid,
      messages,
      createdAt: serverTimestamp(),
      modelUsed: activeModel.id,
      title: messages.find(m => m.role === 'user')?.content.substring(0, 50) || 'New Chat'
    });
  } catch (error) {
    console.error('Firestore save error:', error);
  }
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <Header 
        theme={theme}
        activeModel={activeModel}
        onAuthPress={() => setShowAuth(true)}
        onSettingsPress={() => setShowSettings(true)}
      />
      
      <MessageList
        messages={messages}
        theme={theme}
        onCopy={copyToClipboard}
        onRunCode={executeCode}
        scrollViewRef={scrollViewRef}
        isLoading={isLoading}
      />
      
      <InputBar
        value={inputText}
        onChangeText={setInputText}
        onSend={sendMessage}
        theme={theme}
        disabled={!inputText.trim() || isLoading}
      />
      
      <AuthModal
        visible={showAuth}
        theme={theme}
        onLogin={handleLogin}
        onClose={() => setShowAuth(false)}
      />
      
      <CodePreviewModal
        visible={showCodePreview}
        code={codeToExecute}
        theme={theme}
        onClose={() => setShowCodePreview(false)}
      />
      
      <SettingsModal
        visible={showSettings}
        theme={theme}
        models={models}
        activeModel={activeModel}
        onSelectModel={setActiveModel}
        onClose={() => setShowSettings(false)}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;