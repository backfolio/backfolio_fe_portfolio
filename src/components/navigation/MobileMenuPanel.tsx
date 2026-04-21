import { MobileMenuProps } from '../../types/navigation'
import logoSvg from '../../../logo.svg'

export const MobileMenuPanel = ({
    navigate,
    location,
    user,
    logout,
    isDark,
    toggleTheme,
    prefetchStrategies,
    prefetchDeployments,
    showMobileMenu,
    setShowMobileMenu,
    openSettings,
    showAuthModal,
}: MobileMenuProps) => {
    // Portal always shows Backfolio branding
    // Advisor logo only appears on PDFs and results modals

    if (!showMobileMenu) return null

    return (
        <>
            <div
                className={`lg:hidden fixed inset-0 z-40 backdrop-blur-sm ${isDark ? 'bg-black/40' : 'bg-black/20'}`}
                onClick={() => setShowMobileMenu(false)}
            />
            <div className={`lg:hidden fixed left-4 top-4 w-80 rounded-2xl shadow-2xl z-50 border ${isDark
                ? 'bg-black/95 backdrop-blur-xl border-white/[0.15]'
                : 'bg-white border-slate-200/50'
                }`}>
                <div className="p-6">
                    <div className={`flex items-center justify-between mb-6 pb-4 border-b ${isDark ? 'border-white/[0.1]' : 'border-slate-200'
                        }`}>
                        <button
                            onClick={() => {
                                navigate(user ? '/portfolios' : '/')
                                setShowMobileMenu(false)
                            }}
                            className="cursor-pointer transition-opacity hover:opacity-80"
                            title={user ? 'Go to Portfolios' : 'Go to Home'}
                        >
                        <img 
                            src={logoSvg} 
                            alt="Backfolio" 
                            className="h-7 w-auto"
                        />
                        </button>
                        <button
                            onClick={() => setShowMobileMenu(false)}
                            className={`p-1.5 rounded-lg transition-all ${isDark
                                ? 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="space-y-1 mb-6">
                        <button
                            onClick={() => {
                                if (!user) {
                                    setShowMobileMenu(false)
                                    showAuthModal('saved-strategies')
                                } else {
                                    navigate('/portfolios')
                                    setShowMobileMenu(false)
                                }
                            }}
                            onMouseEnter={() => {
                                // Prefetch data when user hovers over the link
                                if (user) {
                                    prefetchStrategies()
                                    prefetchDeployments()
                                }
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${location.pathname === '/portfolios'
                                ? isDark
                                    ? 'bg-purple-500/20 text-white border border-purple-500/30'
                                    : 'bg-slate-100 text-slate-900'
                                : isDark
                                    ? 'text-gray-300 hover:bg-white/[0.05] hover:text-white'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span className="text-sm">Portfolios</span>
                        </button>

                        <button
                            onClick={() => {
                                navigate('/backtest')
                                setShowMobileMenu(false)
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${location.pathname === '/backtest'
                                ? isDark
                                    ? 'bg-purple-500/20 text-white border border-purple-500/30'
                                    : 'bg-slate-100 text-slate-900'
                                : isDark
                                    ? 'text-gray-300 hover:bg-white/[0.05] hover:text-white'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                            <span className="text-sm">Backtest</span>
                        </button>

                        <button
                            onClick={() => {
                                navigate('/compare')
                                setShowMobileMenu(false)
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${location.pathname === '/compare'
                                ? isDark
                                    ? 'bg-purple-500/20 text-white border border-purple-500/30'
                                    : 'bg-slate-100 text-slate-900'
                                : isDark
                                    ? 'text-gray-300 hover:bg-white/[0.05] hover:text-white'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            <span className="text-sm">Compare</span>
                        </button>

                        <button
                            onClick={() => {
                                navigate('/retirement')
                                setShowMobileMenu(false)
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${location.pathname === '/retirement'
                                ? isDark
                                    ? 'bg-purple-500/20 text-white border border-purple-500/30'
                                    : 'bg-slate-100 text-slate-900'
                                : isDark
                                    ? 'text-gray-300 hover:bg-white/[0.05] hover:text-white'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm">Retirement</span>
                        </button>

                    </div>

                    {/* Divider */}
                    <div className={`border-t my-4 ${isDark ? 'border-white/[0.1]' : 'border-slate-200'}`} />

                    {/* Theme Toggle */}
                    <div className={`flex items-center justify-between px-4 py-3 rounded-lg mb-3 ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'
                        }`}>
                        <div className="flex items-center gap-3">
                            <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                            <div>
                                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    Theme
                                </div>
                                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                    {isDark ? 'Dark mode' : 'Light mode'}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${isDark ? 'bg-purple-500' : 'bg-slate-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${isDark ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Divider */}
                    <div className={`border-t my-4 ${isDark ? 'border-white/[0.1]' : 'border-slate-200'}`} />

                    {/* User Section */}
                    <div className="space-y-2">
                        {user ? (
                            <>
                                <button
                                    onClick={() => {
                                        openSettings()
                                        setShowMobileMenu(false)
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${location.pathname === '/settings'
                                        ? isDark
                                            ? 'bg-purple-500/20 border border-purple-500/30'
                                            : 'bg-slate-100'
                                        : isDark
                                            ? 'bg-white/[0.05] hover:bg-white/[0.1]'
                                            : 'bg-slate-50 hover:bg-slate-100'
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {user.email?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'
                                            }`}>
                                            {user.email}
                                        </div>
                                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                            View settings
                                        </div>
                                    </div>
                                    <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => {
                                        logout()
                                        navigate('/')
                                    }}
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-semibold ${isDark
                                        ? 'bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white border border-white/[0.1]'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                        }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    navigate('/login')
                                    setShowMobileMenu(false)
                                }}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-semibold ${isDark
                                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25'
                                    : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}