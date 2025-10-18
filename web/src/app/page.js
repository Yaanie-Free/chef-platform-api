"use client";
import React from 'react';
import UniversalHero from '@/components/sections/UniversalHero';
import ChefDiscovery from '@/components/chef/ChefDiscovery';
import HowItWorks from '@/components/sections/HowItWorks';
import Testimonials from '@/components/sections/Testimonials';
import Pricing from '@/components/sections/Pricing';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <UniversalHero />
      <ChefDiscovery />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
}