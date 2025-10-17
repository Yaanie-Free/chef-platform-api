import React, { useState } from 'react';

const ImageWithFallback = ({ src, alt, className = '', fallback, ...props }) => {
  const [errored, setErrored] = useState(false);
  const fallbackSrc = fallback || 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <img
      src={errored ? fallbackSrc : src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
      {...props}
    />
  );
};

export default ImageWithFallback;
