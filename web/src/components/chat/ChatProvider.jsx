"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children, user }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.token) return;

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
      auth: {
        token: user.token
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    newSocket.on('auth_error', (error) => {
      console.error('Chat authentication error:', error);
    });

    newSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
      
      // Update conversation last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === message.chat_id 
            ? { ...conv, lastMessage: message.message, timestamp: message.timestamp }
            : conv
        )
      );

      // Update unread count if not active conversation
      if (activeConversation?.id !== message.chat_id) {
        setUnreadCount(prev => prev + 1);
      }
    });

    newSocket.on('user_joined_chat', (data) => {
      console.log('User joined chat:', data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user?.token]);

  const joinChat = (chatId) => {
    if (socket && chatId) {
      socket.emit('join_chat', chatId);
      setActiveConversation(conversations.find(c => c.id === chatId));
    }
  };

  const sendMessage = (message, chatId) => {
    if (socket && message.trim()) {
      socket.emit('send_message', {
        chatId,
        message: message.trim()
      });
    }
  };

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/chats', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const value = {
    socket,
    isConnected,
    conversations,
    activeConversation,
    messages,
    unreadCount,
    joinChat,
    sendMessage,
    loadConversations,
    loadMessages,
    setActiveConversation
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};