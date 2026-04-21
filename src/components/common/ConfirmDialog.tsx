import { createPortal } from 'react-dom'
import { useTheme } from '../../context/ThemeContext'

interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    danger?: boolean
    loading?: boolean
}

export const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    danger = false,
    loading = false
}: ConfirmDialogProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    if (!isOpen) return null

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !loading) {
            onClose()
        }
    }

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleOverlayClick}
        >
            <div
                className={`relative w-full max-w-md rounded-xl shadow-2xl ${isDark ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200'
                    }`}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10">
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {title}
                    </h3>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-white/10 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isDark
                                ? 'bg-white/[0.05] text-gray-300 hover:bg-white/[0.1] border border-white/[0.15] disabled:opacity-50'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 disabled:opacity-50'
                            }`}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${danger
                                ? isDark
                                    ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/50 disabled:opacity-50'
                                    : 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50'
                                : isDark
                                    ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/50 disabled:opacity-50'
                                    : 'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50'
                            }`}
                    >
                        {loading ? 'Loading...' : confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}