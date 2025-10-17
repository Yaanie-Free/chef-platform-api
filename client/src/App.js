import React from 'react';
import './index.css';
import Header from './components/Header';
import ChefDiscovery from './components/ChefDiscovery';
import FilterBar from './components/FilterBar';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Header />
      <main className="container mx-auto mt-8">
        <FilterBar />
        <ChefDiscovery />
      </main>
    </div>
  );
};

export default App;