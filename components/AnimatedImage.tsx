'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedImageProps {
  src: string
  alt: string
  className?: string
  delay?: number
}

export default function AnimatedImage({ src, alt, className = '', delay = 0 }: AnimatedImageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true)
            }, delay * 1000)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [delay])

  return (
    <div
      ref={ref}
      className={`overflow-hidden ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-700 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}
        style={{
          transitionDelay: `${delay}s`,
        }}
      />
    </div>
  )
}

