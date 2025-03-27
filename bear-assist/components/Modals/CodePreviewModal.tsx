import React from 'react';
import { Modal, SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { Theme } from '../../types';

interface CodePreviewModalProps {
  visible: boolean;
  code: string;
  theme: Theme;
  onClose: () => void;
}

const CodePreviewModal: React.FC<CodePreviewModalProps> = ({ 
  visible, 
  code, 
  theme, 
  onClose 
}) => {
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={[styles.header, { backgroundColor: theme.header }]}>
          <Text style={[styles.title, { color: theme.text }]}>Code Preview</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        
        <WebView
          originWhitelist={['*']}
          source={{ html: generateHtmlPreview(code, theme) }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </SafeAreaView>
    </Modal>
  );
};

const generateHtmlPreview = (code: string, theme: Theme) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          background-color: ${theme.background};
          color: ${theme.text};
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        pre {
          background-color: ${theme.codeBlock};
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
      <pre><code>${escapeHtml(code)}</code></pre>
      <script>
        try {
          // Only evaluate JavaScript code in preview
          ${code.includes('function') ? code : 'console.log("Python code cannot be executed client-side");'}
        } catch(e) {
          document.body.innerHTML += '<div style="color:red;">Error: ' + e.message + '</div>';
        }
      </script>
    </body>
  </html>
`;

const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CodePreviewModal;