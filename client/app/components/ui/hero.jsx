import React from 'react';
import ImageWithFallback from './ImageWithFallback';

const Hero = ({ title, subtitle, cta }) => {
  return (
    <section className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-3xl p-8 mb-6">
      <div className="container mx-auto flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-3">{title}</h1>
          <p className="text-gray-700 mb-4">{subtitle}</p>
          {cta}
        </div>
        <div className="w-full md:w-1/3">
          <ImageWithFallback src="https://images.unsplash.com/photo-1543353071-087092ec393f" alt="Chef plating" className="rounded-2xl w-full h-56 object-cover" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
