import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { setAuthenticatedUser, clearAuthenticatedUser, trackUserLogin, trackUserLogout } from '../services/appInsights'
import { clearAllCaches } from '../lib/strategiesCache'
import { getUserProfile, updateUserProfile, type UserType } from '../services/api'

interface AuthContextType {
    isAuthenticated: boolean
    isLoading: boolean
    user: {
        email?: string
        name?: string
        picture?: string
        sub?: string
    } | null
    // User profile data
    userType: UserType
    firmName: string | null
    firmLogoUrl: string | null
    isProfileLoading: boolean
    needsOnboarding: boolean
    // Profile actions
    setUserType: (type: UserType) => Promise<void>
    refetchProfile: () => Promise<void>
    // Auth actions
    login: () => void
    signup: () => void
    logout: () => void
    getAccessToken: () => Promise<string | undefined>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const {
        isAuthenticated,
        isLoading,
        user: auth0User,
        loginWithRedirect,
        logout: auth0Logout,
        getAccessTokenSilently,
    } = useAuth0()

    const [user, setUser] = useState<AuthContextType['user']>(null)

    // Profile state
    const [userType, setUserTypeState] = useState<UserType>(null)
    const [firmName, setFirmName] = useState<string | null>(null)
    const [firmLogoUrl, setFirmLogoUrl] = useState<string | null>(null)
    const [isProfileLoading, setIsProfileLoading] = useState(false)
    const [profileFetched, setProfileFetched] = useState(false)

    // Fetch user profile from backend
    const fetchProfile = useCallback(async () => {
        if (!isAuthenticated) return

        setIsProfileLoading(true)
        try {
            const response = await getUserProfile()
            if (response.success && response.profile) {
                setUserTypeState(response.profile.user_type)
                setFirmName(response.profile.firm_name)
                setFirmLogoUrl(response.profile.firm_logo_url)
            }
            setProfileFetched(true)
        } catch (error) {
            console.error('[AuthContext] Failed to fetch profile:', error)
            setProfileFetched(true) // Still mark as fetched to prevent infinite retries
        } finally {
            setIsProfileLoading(false)
        }
    }, [isAuthenticated])

    // Set user type (called during onboarding)
    const setUserType = useCallback(async (type: UserType) => {
        try {
            const response = await updateUserProfile({ user_type: type })
            if (response.success && response.profile) {
                setUserTypeState(response.profile.user_type)
                setFirmName(response.profile.firm_name)
                setFirmLogoUrl(response.profile.firm_logo_url)
            }
        } catch (error) {
            console.error('[AuthContext] Failed to set user type:', error)
            throw error
        }
    }, [])

    // Refetch profile (for use after settings changes)
    const refetchProfile = useCallback(async () => {
        await fetchProfile()
    }, [fetchProfile])

    // Determine if user needs onboarding (user_type is null)
    const needsOnboarding = isAuthenticated && profileFetched && userType === null

    useEffect(() => {
        if (isAuthenticated && auth0User) {
            setUser({
                email: auth0User.email,
                name: auth0User.name,
                picture: auth0User.picture,
                sub: auth0User.sub,
            })

            // Set authenticated user context in Application Insights
            // Use email as the userId for easy identification in logs
            // and sub (Auth0 user ID) as the accountId for uniqueness
            if (auth0User.email) {
                setAuthenticatedUser(auth0User.email, auth0User.sub)
                trackUserLogin({ provider: 'auth0' })
            }

            // Fetch user profile from backend
            if (!profileFetched && !isProfileLoading) {
                fetchProfile()
            }
        } else {
            setUser(null)
            // Clear profile state
            setUserTypeState(null)
            setFirmName(null)
            setFirmLogoUrl(null)
            setProfileFetched(false)
            // Clear authenticated user context when logged out
            clearAuthenticatedUser()
        }
    }, [isAuthenticated, auth0User, profileFetched, isProfileLoading, fetchProfile])

    const login = () => {
        // Store the intended return URL (default to /portfolios)
        const returnTo = new URLSearchParams(window.location.search).get('redirect') || '/portfolios'
        sessionStorage.setItem('auth_return_to', returnTo)

        loginWithRedirect({
            appState: { returnTo },
        })
    }

    const signup = () => {
        // Store the intended return URL (default to /portfolios)
        sessionStorage.setItem('auth_return_to', '/portfolios')

        loginWithRedirect({
            authorizationParams: {
                screen_hint: 'signup',
            },
            appState: { returnTo: '/portfolios' },
        })
    }

    const logout = () => {
        // Track logout in Application Insights and clear user context
        trackUserLogout()

        // Clear strategies cache on logout (user-specific data)
        clearAllCaches()

        auth0Logout({
            logoutParams: {
                returnTo: window.location.origin,
            },
        })
    }

    const getAccessToken = async (): Promise<string | undefined> => {
        try {
            if (isAuthenticated) {
                const token = await getAccessTokenSilently({
                    authorizationParams: {
                        audience: 'https://api.backfolio.io',
                        scope: 'openid profile email',
                    },
                    // Set a reasonable timeout for token refresh
                    timeoutInSeconds: 60,
                })
                return token
            } else {
                console.warn('[AuthContext] User not authenticated, cannot get token')
            }
        } catch (error: any) {
            // Check if it's a recoverable error
            if (error?.error === 'login_required' || error?.error === 'consent_required') {
                console.warn('[AuthContext] Re-authentication required:', error.error)
                // Don't throw - let the API layer handle this and trigger logout if needed
            } else if (error?.error === 'timeout') {
                console.warn('[AuthContext] Token refresh timed out, trying with cached token')
                // Try again without refresh for immediate response
                try {
                    const cachedToken = await getAccessTokenSilently({
                        authorizationParams: {
                            audience: 'https://api.backfolio.io',
                            scope: 'openid profile email',
                        },
                        cacheMode: 'cache-only',
                    })
                    return cachedToken
                } catch {
                    // No cached token available
                }
            } else {
                console.error('[AuthContext] Error getting access token:', error)
            }
        }
        return undefined
    }

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                user,
                // Profile data
                userType,
                firmName,
                firmLogoUrl,
                isProfileLoading,
                needsOnboarding,
                // Profile actions
                setUserType,
                refetchProfile,
                // Auth actions
                login,
                signup,
                logout,
                getAccessToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
