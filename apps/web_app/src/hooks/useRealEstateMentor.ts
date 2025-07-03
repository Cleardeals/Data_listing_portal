// React hook for AI Real Estate Mentor chat functionality
"use client";

import { useState, useCallback } from 'react';
import { 
  ChatMessage, 
  RealEstateMentorRequest, 
  RealEstateMentorResponse, 
  MentorChatState 
} from '@/types/aiTypes';

export interface UseRealEstateMentorOptions {
  maxChatHistory?: number;
  defaultContext?: 'training' | 'legal' | 'market' | 'general';
  defaultUserLevel?: 'beginner' | 'intermediate' | 'advanced';
  onMessageSent?: (message: string) => void;
  onResponseReceived?: (response: RealEstateMentorResponse) => void;
  onError?: (error: string) => void;
}

export interface UseRealEstateMentorReturn {
  // Chat state
  chatState: MentorChatState;
  
  // Chat functions
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  setContext: (context: 'training' | 'legal' | 'market' | 'general') => void;
  setUserLevel: (level: 'beginner' | 'intermediate' | 'advanced') => void;
  
  // Utilities
  canSendMessage: boolean;
  getChatSummary: () => string;
  exportChat: () => string;
}

export const useRealEstateMentor = (options: UseRealEstateMentorOptions = {}): UseRealEstateMentorReturn => {
  const {
    maxChatHistory = 20,
    defaultContext = 'general',
    defaultUserLevel = 'beginner',
    onMessageSent,
    onResponseReceived,
    onError
  } = options;

  // Chat state
  const [chatState, setChatState] = useState<MentorChatState>({
    isLoading: false,
    messages: [],
    currentContext: defaultContext,
    userLevel: defaultUserLevel,
    error: null
  });

  // Send message to mentor
  const sendMessage = useCallback(async (message: string) => {
    if (!message || message.trim().length === 0) {
      setChatState(prev => ({
        ...prev,
        error: 'Please enter a message'
      }));
      return;
    }

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    setChatState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      messages: [...prev.messages, userMessage].slice(-maxChatHistory)
    }));

    // Call message sent callback
    if (onMessageSent) {
      onMessageSent(message);
    }

    try {
      const requestBody: RealEstateMentorRequest = {
        message: message.trim(),
        chatHistory: chatState.messages.slice(-10), // Send recent history
        context: chatState.currentContext,
        userLevel: chatState.userLevel
      };

      const response = await fetch('/api/ai/real-estate-mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data: RealEstateMentorResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get mentor response');
      }

      // Add assistant message to chat
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };

      setChatState(prev => ({
        ...prev,
        isLoading: false,
        messages: [...prev.messages, assistantMessage].slice(-maxChatHistory),
        error: null
      }));

      // Call response received callback
      if (onResponseReceived) {
        onResponseReceived(data);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      // Call error callback
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [chatState.messages, chatState.currentContext, chatState.userLevel, maxChatHistory, onMessageSent, onResponseReceived, onError]);

  // Clear chat history
  const clearChat = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      messages: [],
      error: null
    }));
  }, []);

  // Set conversation context
  const setContext = useCallback((context: 'training' | 'legal' | 'market' | 'general') => {
    setChatState(prev => ({
      ...prev,
      currentContext: context
    }));
  }, []);

  // Set user level
  const setUserLevel = useCallback((level: 'beginner' | 'intermediate' | 'advanced') => {
    setChatState(prev => ({
      ...prev,
      userLevel: level
    }));
  }, []);

  // Get chat summary
  const getChatSummary = useCallback(() => {
    if (chatState.messages.length === 0) {
      return 'No messages in this chat yet';
    }
    
    const userMessages = chatState.messages.filter(msg => msg.role === 'user').length;
    const assistantMessages = chatState.messages.filter(msg => msg.role === 'assistant').length;
    
    return `${chatState.messages.length} messages (${userMessages} from you, ${assistantMessages} from Kaka)`;
  }, [chatState.messages]);

  // Export chat as text
  const exportChat = useCallback(() => {
    if (chatState.messages.length === 0) {
      return 'No chat history to export';
    }

    const chatExport = chatState.messages.map(msg => {
      const timestamp = new Date(msg.timestamp).toLocaleString();
      const role = msg.role === 'user' ? 'You' : 'Kaka (Real Estate Mentor)';
      return `[${timestamp}] ${role}: ${msg.content}`;
    }).join('\n\n');

    return `Real Estate Mentor Chat Export\nContext: ${chatState.currentContext}\nUser Level: ${chatState.userLevel}\n\n${chatExport}`;
  }, [chatState]);

  const canSendMessage = !chatState.isLoading;

  return {
    chatState,
    sendMessage,
    clearChat,
    setContext,
    setUserLevel,
    canSendMessage,
    getChatSummary,
    exportChat
  };
};
