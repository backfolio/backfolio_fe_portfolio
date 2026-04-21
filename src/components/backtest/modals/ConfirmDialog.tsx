import { useTheme } from '../../../context/ThemeContext'

interface ConfirmDialogProps {
    isOpen: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'danger' | 'warning' | 'info'
    onConfirm: () => void
    onCancel: () => void
}

export const ConfirmDialog = ({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'warning',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    if (!isOpen) return null

    const variantStyles = {
        danger: {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            iconBg: isDark ? 'bg-red-500/20' : 'bg-red-100',
            iconColor: isDark ? 'text-red-400' : 'text-red-600',
            confirmBg: isDark
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-red-600 hover:bg-red-700',
        },
        warning: {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            iconBg: isDark ? 'bg-orange-500/20' : 'bg-orange-100',
            iconColor: isDark ? 'text-orange-400' : 'text-orange-600',
            confirmBg: isDark
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-orange-600 hover:bg-orange-700',
        },
        info: {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            iconBg: isDark ? 'bg-blue-500/20' : 'bg-blue-100',
            iconColor: isDark ? 'text-blue-400' : 'text-blue-600',
            confirmBg: isDark
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-blue-600 hover:bg-blue-700',
        },
    }

    const styles = variantStyles[variant]

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 ${
                    isDark ? 'bg-slate-900 border border-white/10' : 'bg-white border border-gray-200'
                }`}
            >
                {/* Header with Icon */}
                <div className="flex items-start gap-4 mb-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${styles.iconBg} ${styles.iconColor}`}>
                        {styles.icon}
                    </div>
                    <div className="flex-1 pt-1">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {title}
                        </h3>
                        <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {message}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end mt-6">
                    <button
                        onClick={onCancel}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            isDark
                                ? 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                        }`}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-all ${styles.confirmBg}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

