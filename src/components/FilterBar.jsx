import React from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';

const FilterBar = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center p-4 bg-white rounded-lg shadow-md space-y-4 md:space-y-0 md:space-x-4">
      <Input type="text" placeholder="Search by chef, cuisine, or location..." className="w-full md:w-auto flex-1" />
      <Button className="w-full md:w-auto">Search</Button>
    </div>
  );
};

export default FilterBar;