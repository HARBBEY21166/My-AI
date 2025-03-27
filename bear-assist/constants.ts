import { Theme, Model } from './types';

export const THEMES = {
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

export const DEFAULT_MODELS: Model[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    endpoint: 'https://api.yourservice.com/v1/chat/completions',
    systemPrompt: `You are an expert programming assistant. Follow these rules:
1. Provide clean, well-commented code
2. Explain complex concepts clearly
3. Offer multiple solutions when appropriate
4. Highlight potential edge cases`,
    isDefault: true
  },
  {
    id: 'claude-3',
    name: 'Claude 3',
    endpoint: 'https://api.anthropic.com/v1/messages',
    systemPrompt: `You are a precise coding assistant. Your responses should:
- Be technically accurate
- Include type definitions where applicable
- Suggest performance optimizations
- Provide examples when helpful`
  }
];