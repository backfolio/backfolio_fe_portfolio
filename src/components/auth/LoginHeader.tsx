import { Link } from 'react-router-dom'

interface LoginHeaderProps {
    isSignupMode: boolean
}

export const LoginHeader = ({ isSignupMode }: LoginHeaderProps) => {
    return (
        <>
            <div className="text-center mb-12 mt-8">
                <Link to="/" className="text-3xl font-bold text-white hover:text-white/90 transition-colors inline-block tracking-tight">
                    Back<span className="bg-gradient-to-r from-primary-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">folio</span>
                </Link>
            </div>

            <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
                    {isSignupMode ? 'Start Your Research' : 'Welcome Back'}
                </h2>
                <p className="text-white/70 text-base">
                    {isSignupMode
                        ? 'Build, backtest, and optimize portfolio strategies'
                        : 'Continue your portfolio research'
                    }
                </p>
            </div>
        </>
    )
}
