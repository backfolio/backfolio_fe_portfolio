import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const LandingPage = () => {
    const navigate = useNavigate()
    const { isAuthenticated, isLoading } = useAuth()
    const [isYearly, setIsYearly] = useState(true)

    // Redirect authenticated users to portfolios
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate('/portfolios', { replace: true })
        }
    }, [isAuthenticated, isLoading, navigate])

    const handleStartBacktest = () => {
        // Redirect to login with a redirect parameter to backtest page
        navigate('/login?redirect=/backtest')
    }

    return (
        <div className="relative overflow-hidden min-h-screen flex flex-col bg-black">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 py-6 px-8 backdrop-blur-2xl bg-black/60 border-b border-white/5">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-12">
                        {/* Logo */}
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="text-2xl font-bold bg-gradient-to-r from-primary-400 via-purple-400 to-blue-400 bg-clip-text text-transparent hover:from-primary-300 hover:via-purple-300 hover:to-blue-300 transition-all duration-300 transform hover:scale-105"
                        >
                            Back<span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">folio</span>
                        </button>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a
                                href="#features"
                                className="text-sm font-semibold text-white/70 hover:text-white transition-all duration-200 relative group"
                                onClick={(e) => {
                                    e.preventDefault()
                                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                                }}
                            >
                                Features
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-200 group-hover:w-full"></span>
                            </a>
                            <a
                                href="#pricing"
                                className="text-sm font-semibold text-white/70 hover:text-white transition-all duration-200 relative group"
                                onClick={(e) => {
                                    e.preventDefault()
                                    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
                                }}
                            >
                                Pricing
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-200 group-hover:w-full"></span>
                            </a>
                            <a
                                href="#docs"
                                className="text-sm font-semibold text-white/70 hover:text-white transition-all duration-200 relative group"
                                onClick={(e) => {
                                    e.preventDefault()
                                    document.getElementById('docs')?.scrollIntoView({ behavior: 'smooth' })
                                }}
                            >
                                Docs
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-200 group-hover:w-full"></span>
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-white/60 hover:text-white transition-all duration-300 px-5 py-2.5 rounded-xl hover:bg-white/5"
                        >
                            Log In
                        </Link>
                        <Link
                            to="/login?mode=signup"
                            className="bg-white text-black text-sm font-semibold px-7 py-2.5 rounded-xl transition-all duration-300 hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transform hover:scale-[1.02]"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Background gradients */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-black"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>
                <div className="absolute top-40 left-20 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-40 right-20 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-32 w-full flex-1 flex items-center">
                {/* Hero Content */}
                <div className="text-center w-full">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-sm font-medium text-white/80 mb-12 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                        AI That Actually Uses Your Data
                        <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>

                    <h1 className="text-7xl lg:text-8xl xl:text-9xl font-bold text-white mb-10 leading-[0.9] tracking-[-0.04em]">
                        Build Tactical
                        <span className="block bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent mt-3">
                            Strategies Visually
                        </span>
                    </h1>

                    <p className="text-xl lg:text-2xl text-white/50 max-w-3xl mx-auto mb-8 leading-relaxed font-normal tracking-wide">
                        Design dynamic portfolio strategies with conditional rules. <span className="text-white/70">Switch allocations automatically based on market indicators</span>—no coding required.
                    </p>

                    {/* Quote */}
                    <div className="max-w-2xl mx-auto mb-16">
                        <p className="text-lg italic text-white/40 font-light">
                            "History doesn't repeat itself, but it often rhymes"
                        </p>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex flex-wrap justify-center gap-6 lg:gap-10 mb-16">
                        <div className="flex items-center gap-3 px-5 py-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                            <div className="flex items-center justify-center w-11 h-11 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="font-medium text-white/80">Real-time Data.</span>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all duration-300 hover:border-primary-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                            <div className="flex items-center justify-center w-11 h-11 bg-primary-500/10 rounded-xl border border-primary-500/20">
                                <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <span className="font-medium text-white/80">Advanced Analytics</span>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(147,51,234,0.1)] transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(147,51,234,0.2)]">
                            <div className="flex items-center justify-center w-11 h-11 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <span className="font-medium text-white/80">Grounded AI Analysis</span>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                            <div className="flex items-center justify-center w-11 h-11 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <span className="font-medium text-white/80">Smart Alerts</span>
                        </div>
                    </div>

                    {/* Start Backtest Button */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                        <button
                            onClick={handleStartBacktest}
                            className="group relative px-12 py-6 bg-white text-black font-semibold text-lg rounded-2xl hover:bg-white/90 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300 overflow-hidden min-w-[300px]"
                        >
                            <div className="relative flex items-center justify-center gap-3">
                                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>Start Your Analysis</span>
                            </div>
                        </button>

                        <div className="flex items-center gap-2 text-white/40 text-sm font-normal">
                            <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Free to start • No credit card required
                        </div>
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <section id="features" className="relative py-20 bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Why Backfolio Section */}
                    <div className="text-center mb-32">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-sm font-medium text-white/70 mb-8">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Why Backfolio?
                        </div>
                        <h2 className="text-5xl lg:text-6xl font-bold text-white mb-12 leading-[1.1] tracking-[-0.02em]">
                            Portfolio backtesting with
                            <span className="block bg-gradient-to-r from-primary-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mt-2">
                                evidence-based AI
                            </span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {/* Visual Strategy Building */}
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-all duration-500"></div>
                                <div className="relative bg-white/[0.02] backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-emerald-500/30 transition-all duration-500 h-full">
                                    <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 mx-auto">
                                        <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4">Intuitive Visual Interface</h3>
                                    <p className="text-white/60 leading-relaxed">
                                        Design sophisticated tactical strategies with leverage using our drag-and-drop canvas. No spreadsheets, no coding—just strategy.
                                    </p>
                                </div>
                            </div>

                            {/* AI That Doesn't Hallucinate */}
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
                                <div className="relative bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl p-8 border-2 border-purple-500/40 hover:border-purple-400/60 transition-all duration-500 h-full transform hover:scale-105">
                                    <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 mx-auto">
                                        <svg className="w-7 h-7 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <div className="inline-block px-3 py-1 bg-purple-400/20 border border-purple-400/30 rounded-full text-xs font-bold text-purple-200 mb-4">
                                        ⭐ Our Superpower
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4">Evidence-Based AI Recommendations</h3>
                                    <p className="text-white/70 leading-relaxed font-medium">
                                        Our platform <span className="text-purple-300">validates every strategy through rigorous backtesting</span> using historical market data—delivering insights you can trust.
                                    </p>
                                </div>
                            </div>

                            {/* Smart Monitoring */}
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-all duration-500"></div>
                                <div className="relative bg-white/[0.02] backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-amber-500/30 transition-all duration-500 h-full">
                                    <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 mx-auto">
                                        <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4">Automated Monitoring</h3>
                                    <p className="text-white/60 leading-relaxed">
                                        Execute with discipline. Receive notifications only when market conditions align with your strategy—no more emotional trading.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Comparison Note */}
                        <div className="mt-12 max-w-3xl mx-auto">
                            <p className="text-white/40 text-sm leading-relaxed">
                                Unlike traditional backtesting platforms, Backfolio integrates <span className="text-white/60 font-medium">visual strategy design</span>, <span className="text-purple-300 font-medium">AI-validated recommendations</span>, and <span className="text-white/60 font-medium">real-time monitoring</span> into a unified workflow.
                            </p>
                        </div>
                    </div>

                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-sm font-medium text-white/70 mb-8">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            How It Works
                        </div>
                        <h2 className="text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-[-0.02em]">
                            Three steps to
                            <span className="block text-white/60 mt-2">
                                smarter strategies
                            </span>
                        </h2>
                    </div>

                    {/* Visual Steps */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-32">
                        {/* Step 1 */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-all duration-500"></div>
                            <div className="relative bg-white/[0.02] backdrop-blur-xl rounded-3xl p-10 border border-white/10 hover:border-white/20 transition-all duration-500">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-purple-500/30">
                                        1
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-semibold text-white tracking-tight">Create Portfolio Nodes</h3>
                                        <p className="text-sm text-white/40">Define your allocations</p>
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-white/70 text-sm font-medium">Conservative Portfolio</span>
                                    </div>
                                    <div className="space-y-2 text-sm font-mono text-white/60">
                                        <div className="flex justify-between">
                                            <span>SPY (S&P 500)</span>
                                            <span className="text-white/80">60%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>TLT (Bonds)</span>
                                            <span className="text-white/80">40%</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-white/50 text-sm leading-relaxed">
                                    Drag nodes onto the canvas and configure your asset allocations. Visually design your portfolio mix with any combination of ETFs, stocks, or indices.
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-all duration-500"></div>
                            <div className="relative bg-white/[0.02] backdrop-blur-xl rounded-3xl p-10 border border-white/10 hover:border-white/20 transition-all duration-500">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/30">
                                        2
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-semibold text-white tracking-tight">Define Switching Rules</h3>
                                        <p className="text-sm text-white/40">Set market conditions</p>
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span className="text-white/70 text-sm font-medium">Risk-Off Rule</span>
                                    </div>
                                    <div className="text-sm font-mono text-center py-3 bg-black/30 rounded-lg">
                                        <span className="text-purple-400">SMA</span>
                                        <span className="text-white/60">(SPY, 50d)</span>
                                        <span className="text-white/90 mx-2">&lt;</span>
                                        <span className="text-blue-400">SMA</span>
                                        <span className="text-white/60">(SPY, 200d)</span>
                                    </div>
                                </div>
                                <p className="text-white/50 text-sm leading-relaxed">
                                    Create conditional rules using SMA, RSI, momentum, and more. Set precise thresholds that trigger portfolio switches based on real market data.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-all duration-500"></div>
                            <div className="relative bg-white/[0.02] backdrop-blur-xl rounded-3xl p-10 border border-white/10 hover:border-white/20 transition-all duration-500">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-green-500/30">
                                        3
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-semibold text-white tracking-tight">Connect & Backtest</h3>
                                        <p className="text-sm text-white/40">Test historical performance</p>
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm text-white/60">Annualized Return</span>
                                        <span className="text-xl font-bold text-green-400">+12.4%</span>
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm text-white/60">Max Drawdown</span>
                                        <span className="text-xl font-bold text-red-400">-8.2%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-white/60">Sharpe Ratio</span>
                                        <span className="text-xl font-bold text-blue-400">1.85</span>
                                    </div>
                                </div>
                                <p className="text-white/50 text-sm leading-relaxed">
                                    Link portfolios with arrows and run comprehensive backtests against historical data. See exactly how your strategy would have performed.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="group p-8 bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/5 hover:border-purple-500/30 hover:bg-white/[0.03] transition-all duration-500">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-all">
                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-3">Disciplined Execution</h3>
                            <p className="text-sm text-white/50 leading-relaxed">Maintain patience and discipline. Receive targeted notifications only when your strategy triggers—eliminating emotional decision-making.</p>
                        </div>

                        <div className="group p-8 bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.03] transition-all duration-500">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-all">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-3">Data-Driven AI Analysis</h3>
                            <p className="text-sm text-white/50 leading-relaxed">Our AI delivers evidence-based recommendations by running actual backtests with real market data—not hypothetical suggestions or code snippets.</p>
                        </div>

                        <div className="group p-8 bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/5 hover:border-green-500/30 hover:bg-white/[0.03] transition-all duration-500">
                            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-all">
                                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-3">Monte Carlo Simulations</h3>
                            <p className="text-sm text-white/50 leading-relaxed">Run forward-looking probabilistic simulations to understand potential future outcomes and risk scenarios.</p>
                        </div>

                        <div className="group p-8 bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/5 hover:border-amber-500/30 hover:bg-white/[0.03] transition-all duration-500">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-all">
                                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-3">Team Collaboration</h3>
                            <p className="text-sm text-white/50 leading-relaxed">Work together on the same canvas. Multiple team members can design and refine strategies collaboratively.</p>
                        </div>

                        <div className="group p-8 bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.03] transition-all duration-500">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-all">
                                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-3">Backtest Engine API</h3>
                            <p className="text-sm text-white/50 leading-relaxed">Programmatic access to our backtesting engine. Integrate tactical strategies into your own tools and workflows.</p>
                        </div>

                        <div className="group p-8 bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/5 hover:border-pink-500/30 hover:bg-white/[0.03] transition-all duration-500">
                            <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-pink-500/20 transition-all">
                                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-3">Custom Events</h3>
                            <p className="text-sm text-white/50 leading-relaxed">Define custom rebalancing schedules, portfolio switches, and event triggers beyond standard technical indicators.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="relative py-20 bg-black">
                <div className="absolute inset-0">
                    <div className="absolute top-40 left-40 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-40 right-40 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[100px]"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-24">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-sm font-medium text-white/70 mb-8">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            Pricing Plans
                        </div>
                        <h2 className="text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-[-0.02em]">
                            Simple pricing for
                            <span className="block text-white/60 mt-2">
                                powerful strategies
                            </span>
                        </h2>
                        <p className="text-xl text-white/40 max-w-3xl mx-auto leading-relaxed">
                            Start free and scale as your portfolio grows. No hidden fees, cancel anytime.
                        </p>
                    </div>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-16">
                        <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-white' : 'text-white/40'}`}>
                            Monthly
                        </span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className="relative w-14 h-7 bg-white/10 rounded-full transition-all duration-300 hover:bg-white/20"
                        >
                            <div className={`absolute top-1 left-1 w-5 h-5 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-transform duration-300 ${isYearly ? 'translate-x-7' : 'translate-x-0'}`}></div>
                        </button>
                        <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-white' : 'text-white/40'}`}>
                            Yearly
                        </span>
                        <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-bold text-emerald-300">
                            Save 30%
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
                        {/* Starter (Free) */}
                        <div className="bg-white/[0.02] backdrop-blur-xl rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-all duration-500">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-sm font-medium text-white/60 mb-6">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Starter
                                </div>
                                <div className="text-5xl font-bold text-white mb-3">Free</div>
                                <p className="text-base text-white/50">Explore visual strategy building</p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/70 text-sm">Up to 3 portfolios per strategy</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/70 text-sm">10 backtests per month</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/70 text-sm">Basic indicators (SMA, RSI)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/70 text-sm">1 saved strategy</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-white/30 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="text-white/40 text-sm line-through">AI assistant & researcher</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-white/30 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="text-white/40 text-sm line-through">Real-time alerts</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-white/30 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="text-white/40 text-sm line-through">Monte Carlo simulations</span>
                                </li>
                            </ul>

                            <button className="w-full bg-white/[0.08] hover:bg-white/[0.12] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/20 transform hover:scale-105 border border-white/[0.15]">
                                Start Free
                            </button>
                        </div>

                        {/* Basic */}
                        <div className="bg-white/[0.02] backdrop-blur-xl rounded-3xl p-8 border border-emerald-500/30 hover:border-emerald-400/50 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-500">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full text-sm font-medium text-emerald-300 mb-6">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    Basic
                                </div>
                                <div className="text-5xl font-bold text-white mb-3">
                                    ${isYearly ? '5' : '8'}
                                    <span className="text-xl font-semibold text-white/60">/mo</span>
                                </div>
                                <p className="text-base text-white/50">Test strategies seriously</p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/70 text-sm">Up to 5 portfolios per strategy</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/70 text-sm">Unlimited backtests</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/70 text-sm">All technical indicators</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/70 text-sm">1 PDF report/week with AI commentary</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/70 text-sm">Up to 10 saved strategies</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-white/30 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="text-white/40 text-sm line-through">AI assistant & researcher</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-white/30 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="text-white/40 text-sm line-through">Real-time alerts</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-white/30 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="text-white/40 text-sm line-through">Monte Carlo simulations</span>
                                </li>
                            </ul>

                            <button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40 transform hover:scale-105">
                                Start Basic
                            </button>
                        </div>

                        {/* Pro (Recommended) */}
                        <div className="bg-white/[0.02] backdrop-blur-sm rounded-3xl p-8 border-2 border-primary-500/50 relative hover:border-primary-400 hover:shadow-2xl hover:shadow-primary-500/30 transition-all duration-300 transform hover:-translate-y-2 scale-105">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <div className="bg-gradient-to-r from-primary-500 via-purple-500 to-blue-500 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-primary-500/30">
                                    ⭐ Most Popular
                                </div>
                            </div>

                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500/20 to-purple-500/20 backdrop-blur-sm border border-primary-500/30 rounded-full text-sm font-bold text-primary-300 mb-6">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                    Pro
                                </div>
                                <div className="text-5xl font-bold text-white mb-3">
                                    ${isYearly ? '20' : '29'}
                                    <span className="text-xl font-semibold text-white/60">/mo</span>
                                </div>
                                <p className="text-base text-white/70 font-medium">For serious strategy builders</p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/80 text-sm font-medium">Unlimited portfolios & strategies</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/80 text-sm font-medium">Unlimited backtests</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/80 text-sm font-medium">All technical indicators</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/80 text-sm font-medium">Real-time alerts (email/SMS)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/80 text-sm font-medium">Monte Carlo simulations</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/80 text-sm font-medium">AI assistant & researcher</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/80 text-sm font-medium">AI strategy enhancement</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/80 text-sm font-medium">PDF reports with AI commentary</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/80 text-sm font-medium">Multi-asset support (ETFs, crypto)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/80 text-sm font-medium">Priority support</span>
                                </li>
                            </ul>

                            <button className="w-full bg-gradient-to-r from-primary-600 via-purple-600 to-blue-600 hover:from-primary-500 hover:via-purple-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/40 transform hover:scale-105">
                                Start Pro Trial
                            </button>
                        </div>

                        {/* Team */}
                        <div className="bg-gradient-to-br from-white/[0.02] to-indigo-900/10 backdrop-blur-sm rounded-3xl p-8 border border-indigo-500/30 hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-2">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm border border-indigo-500/30 rounded-full text-sm font-bold text-indigo-300 mb-6">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Team
                                </div>
                                <div className="text-5xl font-bold text-white mb-3">
                                    ${isYearly ? '69' : '99'}
                                    <span className="text-xl font-semibold text-white/60">/mo</span>
                                </div>
                                <p className="text-base text-white/70 font-medium">For collaborative investing</p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/80 text-sm font-medium">Everything in Pro, plus:</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/80 text-sm font-medium">Up to 5 team members</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/80 text-sm font-medium">Real-time collaboration canvas</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/80 text-sm font-medium">Shared strategy workspace</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/80 text-sm font-medium">Role-based permissions</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/80 text-sm font-medium">Backtest engine API access</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/80 text-sm font-medium">Custom data sources</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white/80 text-sm font-medium">Dedicated account manager</span>
                                </li>
                            </ul>

                            <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/40 transform hover:scale-105">
                                Start Team Trial
                            </button>
                        </div>
                    </div>

                    {/* Enterprise Banner */}
                    <div className="mt-16 max-w-5xl mx-auto">
                        <div className="bg-gradient-to-r from-white/[0.02] to-white/[0.04] backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                                        <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <h3 className="text-2xl font-bold text-white">Enterprise</h3>
                                    </div>
                                    <p className="text-white/60 text-base mb-2">
                                        Custom solutions for institutional needs. Advanced integrations, dedicated support, and tailored SLAs.
                                    </p>
                                    <div className="flex flex-wrap gap-3 justify-center md:justify-start mt-4">
                                        <span className="text-xs px-3 py-1 bg-white/5 rounded-full text-white/70 border border-white/10">Custom API limits</span>
                                        <span className="text-xs px-3 py-1 bg-white/5 rounded-full text-white/70 border border-white/10">SSO & SAML</span>
                                        <span className="text-xs px-3 py-1 bg-white/5 rounded-full text-white/70 border border-white/10">White-label options</span>
                                        <span className="text-xs px-3 py-1 bg-white/5 rounded-full text-white/70 border border-white/10">99.9% uptime SLA</span>
                                    </div>
                                </div>
                                <button className="bg-white text-black font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transform hover:scale-105 whitespace-nowrap">
                                    Contact Sales
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Docs Section */}
            <section id="docs" className="relative py-16 bg-black">
                <div className="absolute inset-0">
                    <div className="absolute top-10 left-20 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-950/50 via-purple-950/50 to-blue-950/50 backdrop-blur-sm border border-primary-500/20 rounded-full text-sm font-semibold text-primary-300 mb-8 shadow-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Get Started Today
                    </div>
                    <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                        Ready to transform
                        <span className="block bg-gradient-to-r from-primary-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                            your portfolio?
                        </span>
                    </h2>
                    <p className="text-xl lg:text-2xl text-white/60 max-w-4xl mx-auto mb-12 leading-relaxed">
                        Join thousands of investors who trust Backfolio for comprehensive documentation,
                        tutorials, and examples to master portfolio backtesting.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <button
                            onClick={handleStartBacktest}
                            className="group bg-gradient-to-r from-primary-600 via-purple-600 to-blue-600 hover:from-primary-500 hover:via-purple-500 hover:to-blue-500 text-white font-bold px-10 py-5 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/40 transform hover:scale-105 min-w-[260px]"
                        >
                            <div className="flex items-center justify-center gap-3">
                                <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Start Your First Backtest
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </button>
                        <a
                            href="#"
                            className="group border-2 border-white/[0.15] hover:border-white/30 text-white/70 hover:text-white font-bold px-10 py-5 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-white/20 hover:bg-white/5 backdrop-blur-sm transform hover:scale-105 min-w-[260px]"
                        >
                            <div className="flex items-center justify-center gap-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                View Documentation
                            </div>
                        </a>
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-16 pt-12 border-t border-white/[0.08]">
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-white/60">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">Free to start</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span className="font-medium">Bank-grade security</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">24/7 support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default LandingPage
