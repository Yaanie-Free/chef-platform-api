import React from 'react'
import Button from './Button'

export default function ChefDetailModal({ chef = {}, onClose = () => {} }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 overflow-hidden">
        <div className="p-6 flex gap-6">
          <img src={chef.hero || '/img/chef-large.jpg'} alt={chef.name} className="w-48 h-48 rounded-lg object-cover" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{chef.name || 'Chef Name'}</h2>
            <p className="mt-2 text-gray-600">{chef.bio || 'Experienced private chef specializing in contemporary South African cuisine.'}</p>
            <div className="mt-4 flex gap-3">
              <Button>Message</Button>
              <Button variant="primary">Request Booking</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
