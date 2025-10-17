import React from 'react';
import FilterBar from './FilterBar';
import ChefDiscovery from './ChefDiscovery';

const HomePage = () => {
  return (
    <main className="container mx-auto mt-8">
      <FilterBar />
      <ChefDiscovery />
    </main>
  );
};

export default HomePage;