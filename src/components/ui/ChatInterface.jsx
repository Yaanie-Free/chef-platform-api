"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Phone, Video, MoreVertical, Search } from 'lucide-react';
import { Button } from './Button';
import { Input } from './input';
import { ScrollArea } from './ScrollArea';
import { Badge } from './badge';
import { ImageWithFallback } from './ImageWithFallback';
import { useChat } from './ChatProvider';

export function ChatInterface() {
  const {
    conversations,
    activeConversation,
    messages,
    unreadCount,
    joinChat,
    sendMessage,
    loadConversations,
    loadMessages,
    setActiveConversation
  } = useChat();

  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
      joinChat(activeConversation.id);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && activeConversation) {
      sendMessage(messageInput, activeConversation.id);
      setMessageInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setIsTyping(true);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.chefName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-GB', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-background rounded-3xl border border-border/40 overflow-hidden">
      <div className="w-80 border-r border-border/40 flex flex-col">
        <div className="p-4 border-b border-border/40">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Messages</h2>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                  {unreadCount}
                </Badge>
              )}
              <Button variant="ghost" size="icon" className="rounded-2xl">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-2xl"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setActiveConversation(conversation)}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 mb-2 ${
                  activeConversation?.id === conversation.id
                    ? 'bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-200/20'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <ImageWithFallback
                      src={conversation.clientImage || conversation.chefImage}
                      alt={conversation.clientName || conversation.chefName}
                      className="w-12 h-12 rounded-2xl object-cover"
                    />
                    {conversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium truncate">
                        {conversation.clientName || conversation.chefName}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground truncate mb-1">
                      {conversation.lastMessage}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {conversation.bookingStatus && (
                          <Badge variant="outline" className="text-xs">
                            {conversation.bookingStatus}
                          </Badge>
                        )}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ImageWithFallback
                    src={activeConversation.clientImage || activeConversation.chefImage}
                    alt={activeConversation.clientName || activeConversation.chefName}
                    className="w-10 h-10 rounded-2xl object-cover"
                  />
                  {activeConversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium">{activeConversation.clientName || activeConversation.chefName}</h4>
                  <p className="text-xs text-muted-foreground">
                    {activeConversation.online ? 'Online' : 'Last seen recently'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-2xl">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-2xl">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-2xl">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'customer' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl p-3 ${
                        message.sender_type === 'customer'
                          ? 'bg-white/10'
                          : 'bg-gradient-to-br from-pink-500 to-rose-500 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender_type === 'customer'
                            ? 'text-muted-foreground'
                            : 'text-white/70'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 rounded-2xl p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border/40">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-2xl flex-shrink-0">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  className="rounded-2xl flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
              <p className="text-muted-foreground">
                Select a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}