import React from 'react'

export default function Avatar({ src, alt = 'avatar', size = 40, className = '' }) {
  const s = size
  return (
    <img
      src={src || '/img/avatar-placeholder.png'}
      alt={alt}
      width={s}
      height={s}
      className={`rounded-full object-cover ${className}`}
    />
  )
}
