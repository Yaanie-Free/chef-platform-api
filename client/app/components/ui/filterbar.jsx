import React from 'react';
import Badge from './badge';

const FilterBar = ({ filters = [] }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.length === 0 ? (
        <p className="text-sm text-gray-500">No filters applied</p>
      ) : (
        filters.map((f, i) => <Badge key={i} className="px-3 py-1">{f}</Badge>)
      )}
    </div>
  );
};

export default FilterBar;
