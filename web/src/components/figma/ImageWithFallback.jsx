import React from "react";

export function ImageWithFallback({ src, alt, className, fallbackSrc = "/vercel.svg" }) {
  const [error, setError] = React.useState(false);

  const safeSrc = !error && src ? src : fallbackSrc;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={safeSrc}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
      decoding="async"
    />
  );
}
