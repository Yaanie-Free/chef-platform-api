"use client";
import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <main className="relative">
        <section className="relative z-10 px-4 pt-20 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Discover Amazing</span>
              <span className="block text-primary">Private Chefs</span>
            </h1>
            <p className="max-w-md mx-auto mt-3 text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Connect with talented private chefs in your area for unique dining experiences.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature cards will go here */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">Discover Chefs</h3>
                <p className="mt-2 text-gray-600">Find talented chefs in your area.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">Book Experiences</h3>
                <p className="mt-2 text-gray-600">Book unique dining experiences.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">Enjoy Dining</h3>
                <p className="mt-2 text-gray-600">Enjoy restaurant-quality meals at home.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}