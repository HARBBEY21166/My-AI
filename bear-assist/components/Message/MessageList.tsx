import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import MessageBubble from './MessageBubble';
import { Message, Theme } from '../../types';

interface MessageListProps {
  messages: Message[];
  theme: Theme;
  onCopy: (text: string) => void;
  onRunCode: (code: string, language: string) => void;
  scrollViewRef: React.RefObject<ScrollView>;
  isLoading?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  theme,
  onCopy,
  onRunCode,
  scrollViewRef,
  isLoading
}) => {
  const renderItem = useCallback((message: Message, index: number) => {
    if (message.role === 'system') return null;
    
    return (
      <Animated.View
        key={message.id || index}
        entering={message.role === 'user' ? FadeInUp : FadeInDown}
      >
        <MessageBubble
          message={message}
          isUser={message.role === 'user'}
          theme={theme}
          onCopy={onCopy}
          onRunCode={onRunCode}
        />
      </Animated.View>
    );
  }, [theme, onCopy, onRunCode]);

  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={styles.container}
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
    >
      {messages.map(renderItem)}
      
      {isLoading && (
        <View style={[styles.loadingBubble, { backgroundColor: theme.bubbleAI }]}>
          <ActivityIndicator color={theme.bubbleTextAI} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingBubble: {
    maxWidth: '85%',
    padding: 20,
    borderRadius: 12,
    marginVertical: 4,
    alignSelf: 'flex-start',
  },
});

export default MessageList;