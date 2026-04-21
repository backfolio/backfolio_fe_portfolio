import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingTransition from '../components/LoadingTransition'
import {
    LoginHeader,
    BackgroundEffects
} from '../components/auth'

const LoginPage = () => {
    const [searchParams] = useSearchParams()
    const isSignupMode = searchParams.get('mode') === 'signup'
    const navigate = useNavigate()

    const { isAuthenticated, isLoading, login, signup } = useAuth()

    // Redirect authenticated users away from login page
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            // Default to portfolios
            const redirectTo = searchParams.get('redirect') || '/portfolios'
            console.log('Already authenticated, redirecting to:', redirectTo)
            navigate(redirectTo, { replace: true })
        }
    }, [isAuthenticated, isLoading, navigate, searchParams])

    const handleAuth = () => {
        if (isSignupMode) {
            signup()
        } else {
            login()
        }
    }

    // Show loading during authentication
    if (isLoading) {
        return <LoadingTransition message="Loading..." />
    }

    // Don't show login form if already authenticated
    if (isAuthenticated) {
        return <LoadingTransition message="Redirecting..." />
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
            <BackgroundEffects />

            <div className="w-full max-w-md relative z-10">
                <LoginHeader isSignupMode={isSignupMode} />

                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.15] rounded-3xl p-10 shadow-[0_0_50px_rgba(255,255,255,0.08)]">
                    <div className="space-y-4">
                        <button
                            onClick={handleAuth}
                            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                        >
                            {isSignupMode ? 'Sign Up with Auth0' : 'Log In with Auth0'}
                        </button>

                        <div className="text-center">
                            <p className="text-gray-400 text-sm">
                                {isSignupMode ? 'Already have an account?' : "Don't have an account?"}
                                {' '}
                                <a
                                    href={isSignupMode ? '/login' : '/login?mode=signup'}
                                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                >
                                    {isSignupMode ? 'Log In' : 'Sign Up'}
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
