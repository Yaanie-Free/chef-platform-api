import React from 'react'
import Button from './Button'

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-emerald-600 to-emerald-400 text-white py-20 px-6 rounded-lg">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-8">
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold leading-tight">Private chefs for unforgettable meals</h1>
          <p className="mt-4 text-lg opacity-90">Find and book professional private chefs across South Africa for dinner parties, events, and special occasions.</p>
          <div className="mt-6 flex gap-4">
            <Button>Explore Chefs</Button>
            <Button variant="ghost">How it works</Button>
          </div>
        </div>
        <div className="flex-1">
          <img src="/img/hero-chef.jpg" alt="Chef" className="rounded-lg shadow-md w-full object-cover max-h-72" />
        </div>
      </div>
    </section>
  )
}
