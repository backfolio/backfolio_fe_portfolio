import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

interface AuthRequiredModalProps {
    isOpen: boolean
    onClose: () => void
    feature?: 'monte-carlo' | 'optimizer' | 'general' | 'dashboard' | 'saved-strategies'
}

const FEATURE_CONTENT = {
    'monte-carlo': {
        title: 'Unlock Monte Carlo Simulation',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        benefits: [
            'Generate 1000s of future scenarios',
            'See probability of reaching your goals',
            'Understand worst-case risk exposure',
            'Make data-driven investment decisions'
        ],
        gradient: 'from-purple-500 to-indigo-600'
    },
    'optimizer': {
        title: 'Unlock AI Optimization',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        ),
        benefits: [
            'AI finds optimal asset allocations',
            'AI optimization explores possibilities',
            'Validated with Monte Carlo simulation',
            'One-click to load optimized strategy'
        ],
        gradient: 'from-blue-500 to-purple-600'
    },
    'general': {
        title: 'Unlock Premium Features',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        benefits: [
            'Run advanced simulations',
            'AI-powered optimization',
            'Save and track strategies',
            'Full backtesting capabilities'
        ],
        gradient: 'from-emerald-500 to-cyan-600'
    },
    'dashboard': {
        title: 'Access Your Dashboard',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        benefits: [
            'View all your portfolio performance at a glance',
            'Track strategy returns over time',
            'Monitor deployed strategies in real-time',
            'Get personalized insights and alerts'
        ],
        gradient: 'from-amber-500 to-orange-600'
    },
    'saved-strategies': {
        title: 'Access Saved Strategies',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        benefits: [
            'Save unlimited strategies to your account',
            'Load and edit strategies anytime',
            'Compare performance across strategies',
            'Share strategies with a single link'
        ],
        gradient: 'from-emerald-500 to-teal-600'
    }
}

export const AuthRequiredModal = ({
    isOpen,
    onClose,
    feature = 'general'
}: AuthRequiredModalProps) => {
    const { theme } = useTheme()
    const { login } = useAuth()
    const isDark = theme === 'dark'

    const content = FEATURE_CONTENT[feature]

    if (!isOpen) return null

    const handleSignUp = () => {
        // Store that they wanted to use this feature (for post-signup redirect)
        sessionStorage.setItem('auth_intent', feature)
        login()
    }

    const handleLogin = () => {
        sessionStorage.setItem('auth_intent', feature)
        login()
    }

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scaleIn ${isDark
                        ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800'
                        : 'bg-white'
                    }`}
            >
                {/* Decorative gradient header */}
                <div className={`h-2 bg-gradient-to-r ${content.gradient}`} />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${isDark
                            ? 'text-gray-400 hover:text-white hover:bg-white/10'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-8 pt-6">
                    {/* Icon */}
                    <div className="flex justify-center mb-5">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${content.gradient} text-white shadow-lg`}>
                            {content.icon}
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className={`text-xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {content.title}
                    </h2>

                    {/* Subtitle */}
                    <p className={`text-sm text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Create a free account to access this feature
                    </p>

                    {/* Benefits list */}
                    <div className={`rounded-xl p-4 mb-6 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <ul className="space-y-3">
                            {content.benefits.map((benefit, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 bg-gradient-to-br ${content.gradient}`}>
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {benefit}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleSignUp}
                            className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r ${content.gradient} hover:opacity-90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Sign Up Free
                        </button>

                        <button
                            onClick={handleLogin}
                            className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${isDark
                                    ? 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                }`}
                        >
                            Already have an account? Log in
                        </button>
                    </div>

                </div>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.15s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.2s ease-out;
                }
            `}</style>
        </div>
    )
}

