"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRealEstateMentor } from '@/hooks/useRealEstateMentor';
import { ChatMessage } from '@/types/aiTypes';

const RealEstateMentor: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    chatState,
    sendMessage,
    clearChat,
    setContext,
    setUserLevel,
    canSendMessage,
    getChatSummary,
    exportChat
  } = useRealEstateMentor({
    defaultContext: 'general',
    defaultUserLevel: 'beginner'
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !canSendMessage) return;
    
    const message = inputMessage;
    setInputMessage('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  // Example questions for different contexts
  const exampleQuestions = {
    general: [
      "How do I start my career in real estate?",
      "What should I know about Pune property market?",
      "How to identify good investment properties?",
      "Tell me about different areas in Pune"
    ],
    training: [
      "What skills do I need as a real estate broker?",
      "How to build client relationships?",
      "What are the best practices for property valuation?",
      "How to handle difficult negotiations?"
    ],
    legal: [
      "What documents are needed for property registration?",
      "Explain RERA compliance requirements",
      "What is 7/12 extract and its importance?",
      "How to verify property ownership?"
    ],
    market: [
      "Which areas in Pune have good growth potential?",
      "How is the rental market in IT corridors?",
      "What is the average price per sq ft in Baner?",
      "When is the best time to invest in real estate?"
    ]
  };

  if (!showChat) {
    return (
      <div className="mb-6">
        <Button
          onClick={() => setShowChat(true)}
          className="btn-3d bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:scale-105 hover:shadow-lg transition-all duration-200"
        >
          💬 Chat with Kaka
        </Button>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-2xl p-6 mb-6 hover:bg-white/10 hover:border-white/30 transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🏠</span>
            </div>
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-300 hover:to-emerald-300 transition-all duration-300">
              Real Estate Mentor (Kaka)
            </h3>
          </div>
          <div className="text-sm text-white/60 hover:text-white/80 transition-colors duration-200">
            Experienced Pune broker • {getChatSummary()}
          </div>
        </div>
        <Button
          onClick={() => setShowChat(false)}
          variant="outline"
          size="sm"
        >
          Close
        </Button>
      </div>

      {/* Context and Level Settings */}
      <div className="mb-6 p-4 bg-white/5 border border-white/20 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Conversation Context
            </label>
            <select
              value={chatState.currentContext}
              onChange={(e) => setContext(e.target.value as 'training' | 'legal' | 'market' | 'general')}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="general">🏠 General Real Estate</option>
              <option value="training">📚 Broker Training</option>
              <option value="legal">⚖️ Legal & Documentation</option>
              <option value="market">📊 Market Analysis</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Your Experience Level
            </label>
            <select
              value={chatState.userLevel}
              onChange={(e) => setUserLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="beginner">🌱 Beginner (New to Real Estate)</option>
              <option value="intermediate">📈 Intermediate (Some Experience)</option>
              <option value="advanced">🎯 Advanced (Experienced Professional)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Example Questions */}
      {chatState.messages.length === 0 && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-200 mb-3">
            💡 Try asking Kaka about:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {exampleQuestions[chatState.currentContext].map((question: string, index: number) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="text-left text-xs text-blue-300 hover:text-blue-200 p-2 rounded hover:bg-blue-500/20 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="mb-6">
        <div className="h-96 overflow-y-auto bg-white/5 border border-white/20 rounded-lg p-4 space-y-4">
          {chatState.messages.length === 0 ? (
            <div className="text-center text-white/60 py-12">
              <div className="text-4xl mb-4">🏠</div>
              <div className="text-lg font-semibold mb-2">Welcome to Real Estate Mentor!</div>
              <div className="text-sm">
                I&apos;m Kaka, your experienced Pune real estate guide. Ask me anything about properties, 
                legalities, market trends, or how to become a successful broker!
              </div>
            </div>
          ) : (
            chatState.messages.map((message: ChatMessage, index: number) => (
              <ChatMessageBubble key={index} message={message} />
            ))
          )}
          
          {chatState.isLoading && (
            <div className="flex items-center gap-3 p-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <div className="text-sm">🏠</div>
              </div>
              <div className="flex-1 bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  <span className="text-white/60 text-sm ml-2">Kaka is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error Display */}
      {chatState.error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg">
          <div className="text-red-200 text-sm">
            <strong>Error:</strong> {chatState.error}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="mb-4">
        <div className="flex gap-3">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Kaka anything about real estate in Pune..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 resize-none"
            rows={3}
            disabled={!canSendMessage}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || !canSendMessage}
            className={`px-6 py-3 ${
              !inputMessage.trim() || !canSendMessage
                ? 'bg-gray-500/50 cursor-not-allowed'
                : 'btn-3d bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
            } text-white`}
          >
            {chatState.isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-white/40 border-t-white rounded-full animate-spin"></div>
                <span>Sending...</span>
              </div>
            ) : (
              <span>Send 📤</span>
            )}
          </Button>
        </div>
      </div>

      {/* Chat Controls */}
      {chatState.messages.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-white/60">
            {chatState.messages.length} messages • Context: {chatState.currentContext} • Level: {chatState.userLevel}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                const chatExport = exportChat();
                navigator.clipboard.writeText(chatExport);
                // Could add a toast notification here
              }}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              📋 Copy Chat
            </Button>
            <Button
              onClick={clearChat}
              variant="outline"
              size="sm"
              className="text-xs text-red-400 hover:text-red-300"
            >
              🗑️ Clear Chat
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Chat Message Bubble Component
const ChatMessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
          <div className="text-sm">🏠</div>
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div className={`rounded-lg p-3 ${
          isUser 
            ? 'bg-blue-600/30 border border-blue-500/30 text-blue-100' 
            : 'bg-white/10 border border-white/20 text-white'
        }`}>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
        <div className={`text-xs text-white/40 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {isUser ? 'You' : 'Kaka'} • {timestamp}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
          <div className="text-sm">👤</div>
        </div>
      )}
    </div>
  );
};

export default RealEstateMentor;
