'use client'

import { ReactNode } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string | ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay sombre */}
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-modal p-6 w-full max-w-md mx-4 z-10">
        {/* Titre */}
        <h3 className="dashboard-h2 mb-4 font-semibold">
          {title}
        </h3>
        
        {/* Message */}
        <div className="dashboard-text text-dashboard-text-main mb-6">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
        
        {/* Boutons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="bg-white border border-dashboard-border text-dashboard-text-main rounded-lg px-6 py-2 dashboard-text font-semibold hover:bg-dashboard-hover transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="bg-dashboard-primary hover:bg-dashboard-primary/90 !text-white px-6 py-2 rounded-lg dashboard-text font-semibold transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

