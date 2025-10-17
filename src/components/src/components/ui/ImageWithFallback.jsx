import React, { useState } from "react";

const ImageWithFallback = ({ 
  src, 
  fallbackSrc = "/placeholder-chef.jpg", 
  alt = "Chef image", 
  className = "",
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

export default ImageWithFallback;nano src/components/ui/input.jsx