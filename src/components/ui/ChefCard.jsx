import React from 'react'
import Avatar from './Avatar'
import Button from './Button'

export default function ChefCard({ chef = {} }) {
  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 flex gap-4 items-center">
        <Avatar src={chef.avatarUrl} alt={chef.name} size={64} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{chef.name || 'Chef Name'}</h3>
          <p className="text-sm text-muted-foreground">{chef.specialties?.join(', ') || 'Contemporary, South African'}</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <span>⭐ {chef.rating ?? 4.8}</span>
            <span>•</span>
            <span>R{chef.price ?? '900'} / person</span>
          </div>
        </div>
        <div>
          <Button variant="primary">View</Button>
        </div>
      </div>
    </article>
  )
}
