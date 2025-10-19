import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 ${className}`}>
      {children}
    </div>
  );
};

export default Card;