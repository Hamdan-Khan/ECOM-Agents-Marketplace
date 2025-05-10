"use client"

import { create } from 'zustand'
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

interface ToastData {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  action?: ToastActionElement
}

interface ToastState {
  toasts: ToastData[]
  toast: (toast: Omit<ToastData, 'id'>) => void
  dismiss: (id: string) => void
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  toast: (toast) => {
    const id = Math.random().toString(36).substring(7)
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, 5000)
  },
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))
