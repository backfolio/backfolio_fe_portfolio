import React from 'react'
import { useTheme } from '../../../context/ThemeContext'

export interface ToastMessage {
    id: string
    message: string
    type: 'error' | 'warning' | 'info' | 'success'
}

interface ToastProps {
    toast: ToastMessage
    onDismiss: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    // Auto-dismiss after 4 seconds
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(toast.id)
        }, 4000)
        return () => clearTimeout(timer)
    }, [toast.id, onDismiss])

    const typeStyles = {
        error: {
            bg: isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200',
            text: isDark ? 'text-red-300' : 'text-red-800',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        warning: {
            bg: isDark ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border-orange-200',
            text: isDark ? 'text-orange-300' : 'text-orange-800',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
        },
        info: {
            bg: isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200',
            text: isDark ? 'text-blue-300' : 'text-blue-800',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        success: {
            bg: isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200',
            text: isDark ? 'text-green-300' : 'text-green-800',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    }

    const styles = typeStyles[toast.type]

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm animate-slide-in ${styles.bg}`}
            role="alert"
        >
            <span className={styles.text}>{styles.icon}</span>
            <p className={`text-sm font-medium flex-1 ${styles.text}`}>{toast.message}</p>
            <button
                onClick={() => onDismiss(toast.id)}
                className={`p-1 rounded-md hover:bg-black/10 transition-colors ${styles.text}`}
                aria-label="Dismiss"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    )
}

interface ToastContainerProps {
    toasts: ToastMessage[]
    onDismiss: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
    if (toasts.length === 0) return null

    return (
        <div className="fixed top-4 right-4 z-[9998] flex flex-col gap-2 max-w-md">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    )
}

// Hook for managing toasts
export const useToast = () => {
    const [toasts, setToasts] = React.useState<ToastMessage[]>([])

    const showToast = React.useCallback((message: string, type: ToastMessage['type'] = 'info') => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        setToasts(prev => [...prev, { id, message, type }])
    }, [])

    const dismissToast = React.useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return { toasts, showToast, dismissToast }
}

