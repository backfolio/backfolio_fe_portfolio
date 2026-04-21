import { DesktopSidebarProps } from '../../types/navigation'
import logoSvg from '../../../logo.svg'

export const DesktopSidebar = ({
    navigate,
    location,
    user,
    logout,
    isDark,
    toggleTheme,
    prefetchStrategies,
    prefetchDeployments,
    isCollapsed,
    setIsCollapsed,
    openSettings,
    showAuthModal,
}: DesktopSidebarProps) => {
    // Portal always shows Backfolio branding
    // Advisor logo only appears on PDFs and results modals
    return (
        <aside
            className={`hidden lg:flex fixed left-0 top-0 h-full z-30 flex-col border-r transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
                } ${isDark
                    ? 'bg-black/95 backdrop-blur-xl border-white/[0.15]'
                    : 'bg-white border-slate-200/50'
                }`}
        >
            {/* Header with Logo */}
            <div className={`flex items-center justify-center p-6 border-b ${isDark ? 'border-white/[0.1]' : 'border-slate-200'
                }`}>
                <button
                    onClick={() => navigate(user ? '/portfolios' : '/')}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    title={user ? 'Go to Portfolios' : 'Go to Home'}
                >
                    {isCollapsed ? (
                        /* Compact Logo - Backfolio "B" icon */
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-base text-white transition-transform hover:scale-105 shadow-lg shadow-purple-500/25">
                            B
                        </div>
                    ) : (
                        /* Expanded Logo - Backfolio logo */
                        <img 
                            src={logoSvg} 
                            alt="Backfolio" 
                            className="h-8 w-auto"
                        />
                    )}
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                <button
                    onClick={() => {
                        if (!user) {
                            showAuthModal('saved-strategies')
                        } else {
                            navigate('/portfolios')
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
                    title={isCollapsed ? 'Portfolios' : ''}
                >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {!isCollapsed && <span className="text-sm">Portfolios</span>}
                </button>

                <button
                    onClick={() => navigate('/backtest')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${location.pathname === '/backtest'
                        ? isDark
                            ? 'bg-purple-500/20 text-white border border-purple-500/30'
                            : 'bg-slate-100 text-slate-900'
                        : isDark
                            ? 'text-gray-300 hover:bg-white/[0.05] hover:text-white'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    title={isCollapsed ? 'Backtest' : ''}
                >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    {!isCollapsed && <span className="text-sm">Backtest</span>}
                </button>

                <button
                    onClick={() => navigate('/compare')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${location.pathname === '/compare'
                        ? isDark
                            ? 'bg-purple-500/20 text-white border border-purple-500/30'
                            : 'bg-slate-100 text-slate-900'
                        : isDark
                            ? 'text-gray-300 hover:bg-white/[0.05] hover:text-white'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    title={isCollapsed ? 'Compare' : ''}
                >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    {!isCollapsed && <span className="text-sm">Compare</span>}
                </button>

                <button
                    onClick={() => navigate('/retirement')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${location.pathname === '/retirement'
                        ? isDark
                            ? 'bg-purple-500/20 text-white border border-purple-500/30'
                            : 'bg-slate-100 text-slate-900'
                        : isDark
                            ? 'text-gray-300 hover:bg-white/[0.05] hover:text-white'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    title={isCollapsed ? 'Retirement' : ''}
                >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {!isCollapsed && <span className="text-sm">Retirement</span>}
                </button>

            </nav>

            {/* Collapse Button Section */}
            <div className={`px-4 py-3 border-t ${isDark ? 'border-white/[0.1]' : 'border-slate-200'}`}>
                {isCollapsed ? (
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`w-full p-3 rounded-lg transition-all ${isDark
                            ? 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                            }`}
                        title="Expand sidebar"
                    >
                        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    </button>
                ) : (
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${isDark
                            ? 'text-gray-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.1]'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200'
                            }`}
                        title="Collapse sidebar"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                        <span>Collapse</span>
                    </button>
                )}
            </div>

            {/* Bottom Section: Theme Toggle & User */}
            <div className={`p-4 border-t space-y-3 ${isDark ? 'border-white/[0.1]' : 'border-slate-200'}`}>
                {/* Theme Toggle */}
                {!isCollapsed ? (
                    <div className={`flex items-center justify-between px-4 py-3 rounded-lg ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'
                        }`}>
                        <div className="flex items-center gap-3">
                            <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                            <div>
                                <div className={`text-xs font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {isDark ? 'Dark' : 'Light'}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isDark ? 'bg-purple-500' : 'bg-slate-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${isDark ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={toggleTheme}
                        className={`w-full p-3 rounded-lg transition-all ${isDark
                            ? 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                            }`}
                        title="Toggle theme"
                    >
                        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    </button>
                )}

                {/* User Section */}
                {user ? (
                    !isCollapsed ? (
                        <>
                            <button
                                onClick={openSettings}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${location.pathname === '/settings'
                                    ? isDark
                                        ? 'bg-purple-500/20 border border-purple-500/30'
                                        : 'bg-slate-100'
                                    : isDark
                                        ? 'bg-white/[0.05] hover:bg-white/[0.1]'
                                        : 'bg-slate-50 hover:bg-slate-100'
                                    }`}
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                    {user.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <div className={`text-xs font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'
                                        }`}>
                                        {user.email}
                                    </div>
                                    <div className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                        Settings
                                    </div>
                                </div>
                                <svg className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            <button
                                onClick={() => {
                                    logout()
                                    navigate('/')
                                }}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all text-xs font-semibold ${isDark
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
                        <>
                            <button
                                onClick={openSettings}
                                className={`w-full p-3 rounded-lg transition-all ${location.pathname === '/settings'
                                    ? isDark
                                        ? 'bg-purple-500/20 border border-purple-500/30 text-white'
                                        : 'bg-slate-100 text-slate-900'
                                    : isDark
                                        ? 'hover:bg-white/[0.05]'
                                        : 'hover:bg-slate-100'
                                    }`}
                                title="Settings"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs mx-auto">
                                    {user.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    logout()
                                    navigate('/')
                                }}
                                className={`w-full p-3 rounded-lg transition-all ${isDark
                                    ? 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                    }`}
                                title="Sign Out"
                            >
                                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </>
                    )
                ) : (
                    <button
                        onClick={() => navigate('/login')}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all font-semibold ${isCollapsed ? 'text-xs p-3' : 'text-xs'
                            } ${isDark
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25'
                                : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg'
                            }`}
                        title={isCollapsed ? 'Sign In' : ''}
                    >
                        <svg className={`w-4 h-4 ${isCollapsed ? 'mx-auto' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {!isCollapsed && <span>Sign In</span>}
                    </button>
                )}
            </div>
        </aside>
    )
}