import React, { useState } from 'react';
import { Card } from './Card';
import Button from './Button';

export default function MessagesPanel({ messages = [], onSendMessage }) {
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage?.(newMessage);
      setNewMessage('');
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="border-b border-gray-100 p-4">
        <h3 className="font-semibold">Messages</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-sm text-gray-500 text-center">No messages yet</p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl p-3 ${
                message.isOwn
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                  : 'bg-gray-100'
              }`}
            >
              {message.from && (
                <p className="text-xs font-medium mb-1">{message.from}</p>
              )}
              <p className="text-sm">{message.preview || message.content}</p>
              <span className="text-xs opacity-75 mt-1 block">
                {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Type a message..."
          />
          <Button 
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2"
          >
            Send
          </Button>
        </form>
      </div>
    </Card>
  )
}
