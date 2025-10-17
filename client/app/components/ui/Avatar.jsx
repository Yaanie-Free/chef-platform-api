import React from 'react'
import Image from 'next/image'

export default function Avatar({ src, alt = 'avatar', size = 40, className = '' }) {
  const s = size
  // Next/Image provides built-in optimization (formats, srcset) when used in Next.js apps
  return (
    <div style={{ width: s, height: s, position: 'relative' }} className={`rounded-full overflow-hidden ${className}`}>
      <Image
        src={src || '/img/avatar-placeholder.png'}
        alt={alt}
        sizes={`${s}px`}
        fill
        style={{ objectFit: 'cover' }}
      />
    </div>
  )
}
