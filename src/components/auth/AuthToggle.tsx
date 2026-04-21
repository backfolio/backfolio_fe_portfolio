import { Link } from 'react-router-dom'

interface AuthToggleProps {
    isSignupMode: boolean
}

export const AuthToggle = ({ isSignupMode }: AuthToggleProps) => {
    return (
        <div className="mt-8 text-center">
            <p className="text-white/60">
                {isSignupMode ? 'Already have an account?' : "Don't have an account?"}{' '}
                <Link
                    to={isSignupMode ? '/login' : '/login?mode=signup'}
                    className="text-white hover:text-white/80 font-semibold transition-colors"
                >
                    {isSignupMode ? 'Sign In' : 'Get Started'}
                </Link>
            </p>
        </div>
    )
}
