import React from 'react'

export default function StatsCard({ title, value, delta }) {
  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {delta && <div className="text-sm text-emerald-600">{delta}</div>}
    </div>
  )
}
