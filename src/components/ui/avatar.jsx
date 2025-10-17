import React from 'react';

const Avatar = ({ src, alt, size = 48, className = '' }) => {
  const initials = alt ? alt.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : 'U';
  return (
    <div className={`rounded-full overflow-hidden bg-gray-200 inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {src ? <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span className="text-sm font-semibold text-gray-700">{initials}</span>}
    </div>
  );
};

export default Avatar;
