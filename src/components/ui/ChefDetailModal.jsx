import React, { useState } from 'react';
import Button from './Button';
import { Badge } from './badge';
import { Card } from './Card';

export default function ChefDetailModal({ chef = {}, onClose = () => {}, onMessage, onBook }) {
  const [activeTab, setActiveTab] = useState('about');

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'menu', label: 'Sample Menu' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'availability', label: 'Availability' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <Card className="w-full max-w-4xl mx-4 z-10 overflow-hidden">
        <div className="relative h-64">
          <img 
            src={chef.hero || '/img/chef-large.jpg'} 
            alt={chef.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold">{chef.name || 'Chef Name'}</h2>
              <div className="mt-2 flex gap-2">
                {chef.specialties?.map(specialty => (
                  <Badge key={specialty} variant="secondary">{specialty}</Badge>
                ))}
              </div>
              <p className="mt-4 text-gray-600 max-w-2xl">
                {chef.bio || 'Experienced private chef specializing in contemporary South African cuisine.'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={onMessage} variant="outline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Message
              </Button>
              <Button onClick={onBook} variant="default">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book Now
              </Button>
            </div>
          </div>

          <div className="mt-8 border-b">
            <div className="flex gap-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 px-2 font-medium transition-colors relative ${
                    activeTab === tab.id 
                      ? 'text-emerald-600 border-b-2 border-emerald-600' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-6">
            {activeTab === 'about' && (
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">Experience</h3>
                  <ul className="space-y-3">
                    {chef.experience?.map((exp, i) => (
                      <li key={i} className="flex gap-4">
                        <div className="w-2 h-2 mt-2 rounded-full bg-emerald-600" />
                        <div>
                          <p className="font-medium">{exp.role}</p>
                          <p className="text-sm text-gray-600">{exp.place}</p>
                          <p className="text-sm text-gray-500">{exp.duration}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Cuisine Specialties</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {chef.cuisineTypes?.map(cuisine => (
                      <div key={cuisine} className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{cuisine}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
