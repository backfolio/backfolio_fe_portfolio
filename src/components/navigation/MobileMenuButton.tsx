interface MobileMenuButtonProps {
    isDark: boolean
    showMobileMenu: boolean
    setShowMobileMenu: (show: boolean) => void
}

export const MobileMenuButton = ({ isDark, showMobileMenu, setShowMobileMenu }: MobileMenuButtonProps) => {
    return (
        <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className={`lg:hidden fixed top-4 left-4 z-50 p-3 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl border transition-all hover:scale-105 ${isDark
                ? 'bg-black/80 border-white/[0.15] hover:bg-black/90 hover:shadow-purple-500/20'
                : 'bg-white/95 border-slate-200/50 hover:bg-white'
                }`}
            title="Menu"
        >
            <svg className={`w-5 h-5 ${isDark ? 'text-white' : 'text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    )
}