'use client'

import { useEffect } from 'react'
import { HiX, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  isOpen: boolean
  onClose: () => void
  duration?: number
}

export default function Toast({
  message,
  type = 'info',
  isOpen,
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  if (!isOpen) return null

  const bgColor = {
    success: 'bg-dashboard-success',
    error: 'bg-dashboard-alert',
    info: 'bg-dashboard-info',
  }[type]

  const Icon = {
    success: HiCheckCircle,
    error: HiExclamationCircle,
    info: HiExclamationCircle,
  }[type]

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-in">
      <div className={`${bgColor} !text-white rounded-lg shadow-modal p-4 flex items-center gap-3 min-w-[300px] max-w-md`}>
        <Icon className="text-xl flex-shrink-0 !text-white" />
        <p className="dashboard-text flex-1 !text-white">{message}</p>
        <button
          onClick={onClose}
          className="!text-white/80 hover:!text-white transition flex-shrink-0"
          aria-label="Fermer"
        >
          <HiX className="text-xl !text-white" />
        </button>
      </div>
    </div>
  )
}

