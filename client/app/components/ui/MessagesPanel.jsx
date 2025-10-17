import React from 'react'

export default function MessagesPanel({ messages = [] }) {
  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <h3 className="text-lg font-medium">Messages</h3>
      <ul className="mt-3 space-y-2 max-h-64 overflow-auto">
        {messages.length === 0 && <li className="text-sm text-gray-500">No messages</li>}
        {messages.map(m => (
          <li key={m.id} className="py-2 border-b">
            <div className="font-medium">{m.from}</div>
            <div className="text-sm text-gray-600">{m.preview}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
