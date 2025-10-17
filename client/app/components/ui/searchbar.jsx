import React from 'react';
import Input from './input';

const SearchBar = ({ onSearch }) => {
  return (
    <div className="w-full flex items-center gap-3">
      <Input placeholder="Search chefs, cuisine, location..." className="flex-1" />
      <button className="px-4 py-2 bg-white border rounded-lg">Filters</button>
    </div>
  );
};

export default SearchBar;
