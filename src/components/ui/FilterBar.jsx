import React from 'react'

export default function FilterBar() {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm flex flex-wrap gap-3 items-center">
      <input className="px-3 py-2 border rounded-md w-48" placeholder="Location" />
      <select className="px-3 py-2 border rounded-md">
        <option>All cuisines</option>
        <option>South African</option>
        <option>Italian</option>
      </select>
      <select className="px-3 py-2 border rounded-md">
        <option>Dietary</option>
        <option>Vegetarian</option>
        <option>Gluten-free</option>
      </select>
      <input className="px-3 py-2 border rounded-md w-36" placeholder="Party size" />
      <button className="ml-auto px-3 py-2 bg-emerald-600 text-white rounded-md">Apply</button>
    </div>
  )
}
