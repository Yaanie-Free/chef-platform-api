import React from 'react'

export default function BookingCalendar({ selectedDate, onSelect = () => {} }) {
  // Simple skeleton calendar UI (non-functional)
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Select a date</h3>
        <div className="text-sm text-gray-500">{new Date().toLocaleString()}</div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-2 text-center">
        {days.map(d => (
          <div key={d} className="text-sm text-gray-600">{d}</div>
        ))}
        {Array.from({length: 28}).map((_,i) => (
          <button key={i} onClick={() => onSelect(i+1)} className="p-2 rounded hover:bg-emerald-50">{i+1}</button>
        ))}
      </div>
    </div>
  )
}
