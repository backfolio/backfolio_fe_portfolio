import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { usePrefetchStrategies, usePrefetchDeployments } from '../hooks/useApi'
import { MobileMenuButton, MobileMenuPanel, DesktopSidebar } from './navigation'
import { NavigationMenuProps } from '../types/navigation'
import { AuthRequiredModal } from './modals/AuthRequiredModal'

export const NavigationMenu = ({ isCollapsed: externalIsCollapsed, setIsCollapsed: externalSetIsCollapsed }: NavigationMenuProps = {}) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout, userType, firmLogoUrl } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'
    const [internalIsCollapsed, setInternalIsCollapsed] = useState(false)
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const [authModalFeature, setAuthModalFeature] = useState<'dashboard' | 'saved-strategies' | null>(null)

    // Prefetch hooks for performance
    const prefetchStrategies = usePrefetchStrategies()
    const prefetchDeployments = usePrefetchDeployments()

    // Use external state if provided, otherwise use internal state
    const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed
    const setIsCollapsed = externalSetIsCollapsed || setInternalIsCollapsed

    // Shared navigation hooks
    const navigationHooks = {
        navigate,
        location,
        user,
        logout,
        theme,
        toggleTheme,
        isDark,
        prefetchStrategies,
        prefetchDeployments,
        openSettings: () => navigate('/settings'),
        showAuthModal: (feature: 'dashboard' | 'saved-strategies') => setAuthModalFeature(feature),
        // Advisor branding
        userType,
        firmLogoUrl
    }

    return (
        <>
            <MobileMenuButton
                isDark={isDark}
                showMobileMenu={showMobileMenu}
                setShowMobileMenu={setShowMobileMenu}
            />

            <MobileMenuPanel
                {...navigationHooks}
                showMobileMenu={showMobileMenu}
                setShowMobileMenu={setShowMobileMenu}
            />

            <DesktopSidebar
                {...navigationHooks}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            <AuthRequiredModal
                isOpen={authModalFeature !== null}
                onClose={() => setAuthModalFeature(null)}
                feature={authModalFeature || 'general'}
            />
        </>
    )
}
