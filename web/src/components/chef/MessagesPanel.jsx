"use client";
import React, { useState } from 'react';
import { Search, MessageSquare, Send, Paperclip, MoreVertical } from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function MessagesPanel({ chefData }) {
  const [selectedConversation, setSelectedConversation] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');

  const mockConversations = [
    { id: '1', clientName: 'Sarah Johnson', clientImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', lastMessage: 'Thank you so much! Looking forward to it.', timestamp: '2 hours ago', unread: 0, online: true },
    { id: '2', clientName: 'Michael Chen', clientImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', lastMessage: 'Can we discuss the menu options?', timestamp: '5 hours ago', unread: 2, online: false },
    { id: '3', clientName: 'Lisa van der Berg', clientImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', lastMessage: 'Perfect! See you on Saturday.', timestamp: '1 day ago', unread: 0, online: true }
  ];

  const mockMessages = [
    { id: '1', senderId: '1', text: "Hi! I'd love to book you for a dinner party next week. Are you available on the 15th?", timestamp: '10:30 AM', isOwn: false },
    { id: '2', senderId: 'chef', text: "Hello Sarah! Yes, I'm available on the 15th. How many guests are you expecting?", timestamp: '10:35 AM', isOwn: true },
    { id: '3', senderId: '1', text: "We'll be 8 people. I was thinking Italian cuisine with wine pairings. What do you think?", timestamp: '10:38 AM', isOwn: false },
    { id: '4', senderId: 'chef', text: "That sounds wonderful! I can prepare a beautiful 3-course Italian menu with carefully selected wine pairings. I'll send you a proposed menu shortly.", timestamp: '10:42 AM', isOwn: true },
    { id: '5', senderId: '1', text: 'Thank you so much! Looking forward to it.', timestamp: '11:15 AM', isOwn: false }
  ];

  const filteredConversations = mockConversations.filter((conv) => conv.clientName.toLowerCase().includes(searchQuery.toLowerCase()));
  const selectedConv = mockConversations.find((c) => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log('Sending message:', messageInput);
      setMessageInput('');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl">Messages</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-300px)]">
        <Card className="rounded-3xl border-border/40 overflow-hidden col-span-1">
          <div className="p-4 border-b border-border/40">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search conversations" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 rounded-2xl" />
            </div>
          </div>

          <ScrollArea className="h-[calc(100%-80px)]">
            <div className="p-2">
              {filteredConversations.map((conv) => (
                <button key={conv.id} onClick={() => setSelectedConversation(conv.id)} className={`w-full p-4 rounded-2xl flex items-start gap-3 mb-2 transition-all duration-200 ${selectedConversation === conv.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                  <div className="relative">
                    <ImageWithFallback src={conv.clientImage} alt={conv.clientName} className="w-12 h-12 rounded-2xl object-cover" />
                    {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />}
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm truncate">{conv.clientName}</h4>
                      {conv.unread > 0 && (
                        <Badge className="rounded-full w-5 h-5 p-0 flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-500 text-white text-xs border-none">{conv.unread}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    <p className="text-xs text-muted-foreground mt-1">{conv.timestamp}</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="rounded-3xl border-border/40 overflow-hidden col-span-1 lg:col-span-2">
          {selectedConv ? (
            <>
              <div className="p-4 border-b border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <ImageWithFallback src={selectedConv.clientImage} alt={selectedConv.clientName} className="w-10 h-10 rounded-2xl object-cover" />
                    {selectedConv.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />}
                  </div>
                  <div>
                    <h4>{selectedConv.clientName}</h4>
                    <p className="text-xs text-muted-foreground">{selectedConv.online ? 'Online' : 'Offline'}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-2xl">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              <ScrollArea className="h-[calc(100%-140px)] p-4">
                <div className="space-y-4">
                  {mockMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-3 ${message.isOwn ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white' : 'bg-white/10'}`}>
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${message.isOwn ? 'text-white/70' : 'text-muted-foreground'}`}>{message.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-2xl flex-shrink-0">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Input placeholder="Type your message..." value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} className="rounded-2xl" />
                  <Button onClick={handleSendMessage} className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 flex-shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg mb-2">No conversation selected</h3>
                <p className="text-muted-foreground">Select a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
