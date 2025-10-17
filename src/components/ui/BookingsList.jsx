import React from 'react'

export default function BookingsList({ bookings = [] }) {
  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <h3 className="text-lg font-medium">Bookings</h3>
      <ul className="mt-3 space-y-2">
        {bookings.length === 0 && <li className="text-sm text-gray-500">No bookings yet</li>}
        {bookings.map(b => (
          <li key={b.id} className="flex items-center justify-between border-b py-2">
            <div>
              <div className="font-medium">{b.title}</div>
              <div className="text-sm text-gray-500">{b.date}</div>
            </div>
            <div className="text-sm text-gray-600">{b.status}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
