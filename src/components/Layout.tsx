import { ReactNode, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { NavigationMenu } from './NavigationMenu'

interface LayoutProps {
    children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    // Initialize from localStorage, default to false if not set
    const [isCollapsed, setIsCollapsedState] = useState(() => {
        const stored = localStorage.getItem('sidebarCollapsed')
        return stored === 'true'
    })

    // Persist to localStorage whenever it changes
    const setIsCollapsed = (value: boolean) => {
        setIsCollapsedState(value)
        localStorage.setItem('sidebarCollapsed', String(value))
    }

    return (
        <div className={`min-h-screen relative ${isDark ? 'bg-black' : 'bg-white'}`}>
            {/* Subtle grid overlay for dark mode - clean and minimal */}
            {isDark && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
                </div>
            )}

            {/* Navigation */}
            <NavigationMenu isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            {/* Main Content Area - Offset for desktop sidebar, padding for mobile hamburger */}
            <main className={`w-full min-h-screen relative z-10 transition-all duration-300 pt-20 lg:pt-0 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
                {children}
            </main>
        </div>
    )
}

export default Layout