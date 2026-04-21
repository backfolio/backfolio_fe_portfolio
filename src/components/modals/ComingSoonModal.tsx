import { useTheme } from '../../context/ThemeContext'

interface ComingSoonModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    message?: string
    isClosing?: boolean
}

export const ComingSoonModal = ({ 
    isOpen, 
    onClose, 
    title = "AI Insights Coming Soon!",
    message = "We're building powerful AI-driven analysis to help you optimize your strategies. Get ready for personalized recommendations, risk assessments, and actionable insights!",
    isClosing = false
}: ComingSoonModalProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    if (!isOpen) return null

    return (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-150 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
            <div
                className={`relative w-full max-w-md rounded-2xl shadow-2xl p-8 text-center transition-all duration-150 ${
                    isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10' : 'bg-white border border-gray-200'
                } ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
            >
                {/* Title */}
                <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {title}
                </h2>

                {/* Message */}
                <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {message}
                </p>

                {/* Button */}
                <button
                    onClick={onClose}
                    className={`w-full px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                        isDark
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                    }`}
                >
                    Continue
                </button>
            </div>
        </div>
    )
}
