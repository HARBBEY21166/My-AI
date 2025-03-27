import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { MaterialIcons } from '@expo/vector-icons';
import { Message, Theme } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  theme: Theme;
  onCopy: (text: string) => void;
  onRunCode?: (code: string, language: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isUser, 
  theme, 
  onCopy, 
  onRunCode 
}) => {
  return (
    <View style={[
      styles.container,
      isUser ? styles.userBubble : styles.aiBubble,
      { backgroundColor: isUser ? theme.bubbleUser : theme.bubbleAI }
    ]}>
      <View style={styles.header}>
        <Text style={[
          styles.roleText, 
          { color: isUser ? theme.bubbleTextUser : theme.bubbleTextAI }
        ]}>
          {isUser ? 'You' : 'Assistant'}
        </Text>
        <View style={styles.actions}>
          {!isUser && message.language && (
            <TouchableOpacity 
              onPress={() => onRunCode?.(message.content, message.language!)}
              style={styles.actionButton}
            >
              <MaterialIcons 
                name="play-arrow" 
                size={18} 
                color={isUser ? theme.bubbleTextUser : theme.bubbleTextAI} 
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={() => onCopy(message.content)}
            style={styles.actionButton}
          >
            <MaterialIcons 
              name="content-copy" 
              size={18} 
              color={isUser ? theme.bubbleTextUser : theme.bubbleTextAI} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <Markdown style={getMarkdownStyles(theme, isUser)}>
        {message.content}
      </Markdown>

      {message.timestamp && (
        <Text style={[styles.timestamp, { color: theme.timestamp }]}>
          {message.timestamp}
        </Text>
      )}
    </View>
  );
};

const getMarkdownStyles = (theme: Theme, isUser: boolean) => ({
  body: { 
    color: isUser ? theme.bubbleTextUser : theme.bubbleTextAI,
    fontSize: 16,
    lineHeight: 22
  },
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
    marginVertical: 8,
  }
});

const styles = StyleSheet.create({
  container: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  roleText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 10,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
});

export default MessageBubble;