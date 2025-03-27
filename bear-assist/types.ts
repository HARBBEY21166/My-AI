export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    id?: string;
    timestamp?: string;
    language?: 'javascript' | 'python';
  }
  
  export interface Theme {
    background: string;
    text: string;
    inputBackground: string;
    bubbleUser: string;
    bubbleAI: string;
    bubbleTextUser: string;
    bubbleTextAI: string;
    header: string;
    codeBlock: string;
    codeText: string;
    timestamp: string;
  }
  
  export interface Model {
    id: string;
    name: string;
    endpoint: string;
    systemPrompt: string;
    isDefault?: boolean;
  }