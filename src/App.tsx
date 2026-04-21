import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ComparisonProvider } from './context/ComparisonContext'
import { setTokenGetter, setLogoutHandler } from './services/api'
import LoadingTransition from './components/LoadingTransition'
import LandingPage from './pages/LandingPage'
import LandingPageBeta from './pages/LandingPageBeta'
import LoginPage from './pages/LoginPage'
import Backtest from './pages/Backtest'
import Portfolios from './pages/Portfolios'
import Compare from './pages/Compare'
import Settings from './pages/Settings'
import RetirementPlanner from './pages/RetirementPlanner'
import ProtectedRoute from './components/ProtectedRoute'

function AppRoutes() {
    const { getAccessToken, logout } = useAuth()
    const { isLoading: auth0Loading, isAuthenticated, error } = useAuth0()
    const navigate = useNavigate()

    useEffect(() => {
        // Connect the API service with the auth token getter and logout handler
        setTokenGetter(getAccessToken)
        setLogoutHandler(logout)
    }, [getAccessToken, logout])

    // Handle Auth0 callback and redirect
    useEffect(() => {
        const handleCallback = async () => {
            // Check if we're returning from Auth0 (has code/state in URL)
            const searchParams = new URLSearchParams(window.location.search)
            const hasAuthParams = searchParams.has('code') && searchParams.has('state')

            // Wait for Auth0 to finish processing
            if (hasAuthParams) {
                if (!auth0Loading) {
                    if (isAuthenticated) {
                        // Auth0 has processed the callback, redirect to portfolios
                        const returnTo = sessionStorage.getItem('auth_return_to') || '/portfolios'
                        sessionStorage.removeItem('auth_return_to')

                        // Clean URL and navigate
                        window.history.replaceState({}, document.title, '/')
                        navigate(returnTo, { replace: true })
                    } else if (error) {
                        console.error('Auth0 error:', error)
                        // Clean URL and redirect to login
                        window.history.replaceState({}, document.title, '/login')
                        navigate('/login', { replace: true })
                    }
                }
            }
        }

        handleCallback()
    }, [auth0Loading, isAuthenticated, error, navigate])

    // Show loading during Auth0 callback processing
    if (auth0Loading && window.location.search.includes('code=')) {
        return <LoadingTransition message="Completing sign in..." />
    }

    return (
        <>
            <Routes>
                <Route path="/" element={<LandingPageBeta />} />
                <Route path="/landing-original" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/backtest"
                    element={<Backtest />}
                />
                <Route
                    path="/portfolios"
                    element={
                        <ProtectedRoute>
                            <Portfolios />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/compare"
                    element={<Compare />}
                />
                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/retirement"
                    element={<RetirementPlanner />}
                />
            </Routes>
        </>
    )
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ComparisonProvider>
                    <Router>
                        <AppRoutes />
                    </Router>
                </ComparisonProvider>
            </AuthProvider>
        </ThemeProvider>
    )
}

export default App
