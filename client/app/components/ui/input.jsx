import React from 'react';

const Input = ({ label, className = '', error, ...props }) => {
  return (
    <label className="block">
      {label && <span className="text-sm text-gray-700 mb-1 block">{label}</span>}
      <input className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300 ${error ? 'border-red-400' : 'border-gray-200'} ${className}`} {...props} />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </label>
  );
};

export default Input;
