import { FormEvent } from 'react'

interface AuthFormProps {
    isSignupMode: boolean
    email: string
    password: string
    confirmPassword: string
    isLoading: boolean
    onEmailChange: (value: string) => void
    onPasswordChange: (value: string) => void
    onConfirmPasswordChange: (value: string) => void
    onSubmit: (e: FormEvent) => void
}

export const AuthForm = ({
    isSignupMode,
    email,
    password,
    confirmPassword,
    isLoading,
    onEmailChange,
    onPasswordChange,
    onConfirmPasswordChange,
    onSubmit
}: AuthFormProps) => {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div>
                <label htmlFor="email" className="block text-white/80 mb-3 text-sm font-medium tracking-wide">
                    Email Address
                </label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    className="w-full px-5 py-4 bg-white/[0.07] border border-white/[0.15] rounded-xl text-white placeholder-white/40 font-normal focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-200"
                    placeholder="Enter your email address"
                    required
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-white/80 mb-3 text-sm font-medium tracking-wide">
                    Password
                </label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    className="w-full px-5 py-4 bg-white/[0.07] border border-white/[0.15] rounded-xl text-white placeholder-white/40 font-normal focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-200"
                    placeholder="Enter your password"
                    required
                />
            </div>

            {isSignupMode && (
                <div>
                    <label htmlFor="confirmPassword" className="block text-white/80 mb-3 text-sm font-medium tracking-wide">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => onConfirmPasswordChange(e.target.value)}
                        className="w-full px-5 py-4 bg-white/[0.07] border border-white/[0.15] rounded-xl text-white placeholder-white/40 font-normal focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-200"
                        placeholder="Confirm your password"
                        required
                    />
                </div>
            )}

            {!isSignupMode && (
                <div className="flex justify-between items-center">
                    <label className="flex items-center">
                        <input type="checkbox" className="mr-2 accent-white rounded" />
                        <span className="text-sm text-white/60">Remember me</span>
                    </label>
                    <button type="button" className="text-sm text-white/80 hover:text-white font-medium transition-colors">
                        Forgot password?
                    </button>
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black py-4 rounded-xl text-base font-semibold hover:bg-white/90 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        Please wait...
                    </div>
                ) : (
                    isSignupMode ? 'Create Account' : 'Sign In'
                )}
            </button>
        </form>
    )
}
