import { useTheme } from '../../context/ThemeContext'
import type { UserTier } from '../../types/dashboard'

interface UpgradePromptProps {
    userTier: UserTier
    deployedCount: number
    maxStrategies: number
}

export const UpgradePrompt = ({ userTier, deployedCount, maxStrategies }: UpgradePromptProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    if (deployedCount < maxStrategies) {
        return null
    }

    return (
        <div
            className={`backdrop-blur-2xl rounded-lg p-6 transition-all duration-300 ${isDark
                ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30'
                : 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'
                }`}
        >
            <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <svg className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h3
                    className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                        }`}
                >
                    {userTier === 'pro' ? 'Upgrade to Premium' : 'Unlock More Strategies'}
                </h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Currently deployed: {deployedCount}/{maxStrategies} ({userTier === 'pro' ? 'Pro' : 'Free'} limit reached)
                </p>

                <div className={`text-xs mb-4 text-left space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="flex items-start gap-2">
                        <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Deploy up to {userTier === 'pro' ? '3' : '1'} strateg{userTier === 'pro' ? 'ies' : 'y'} simultaneously</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>SMS + Email alerts</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Priority support</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-all duration-200 ${isDark
                            ? 'bg-white/[0.02] text-gray-400 hover:bg-white/[0.05] border border-white/[0.15]'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                    >
                        View Plans
                    </button>
                    <button
                        className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-all duration-200 ${isDark
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                            }`}
                    >
                        Upgrade to {userTier === 'pro' ? 'Premium' : 'Pro'}
                    </button>
                </div>
            </div>
        </div>
    )
}
