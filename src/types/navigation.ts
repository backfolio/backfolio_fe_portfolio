export interface NavigationMenuProps {
    isCollapsed?: boolean
    setIsCollapsed?: (collapsed: boolean) => void
}

export interface NavigationHooks {
    navigate: (path: string) => void
    location: { pathname: string }
    user: any
    logout: () => void
    theme: string
    toggleTheme: () => void
    isDark: boolean
    prefetchStrategies: () => void
    prefetchDeployments: () => void
    openSettings: () => void
    showAuthModal: (feature: 'dashboard' | 'saved-strategies') => void
    // Advisor branding
    userType: 'personal' | 'advisor' | null
    firmLogoUrl: string | null
}

export interface MobileMenuProps extends NavigationHooks {
    showMobileMenu: boolean
    setShowMobileMenu: (show: boolean) => void
}

export interface DesktopSidebarProps extends NavigationHooks {
    isCollapsed: boolean
    setIsCollapsed: (collapsed: boolean) => void
}