import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoSvg from '../../logo.svg'

const LandingPageBeta = () => {
    const navigate = useNavigate()
    const { isAuthenticated, isLoading } = useAuth()
    const [isVisible, setIsVisible] = useState(false)
    const [openFaq, setOpenFaq] = useState<number | null>(null)

    useEffect(() => {
        setIsVisible(true)
    }, [])

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate('/portfolios', { replace: true })
        }
    }, [isAuthenticated, isLoading, navigate])

    useEffect(() => {
        document.title = 'Portfolio Backtesting Tool | Monte Carlo Simulation & AI Optimization - Backfolio'
    }, [])

    const handleStartBacktest = () => {
        navigate('/backtest')
    }

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white antialiased relative">
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#0a0a0b] to-[#0a0a0b] pointer-events-none z-0" />

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-6 h-14 flex justify-between items-center">
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="flex items-center"
                    >
                        <img src={logoSvg} alt="Backfolio" className="h-6 w-auto" />
                    </button>
                    <div className="flex items-center gap-4">
                        <a href="#demo" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">Demo</a>
                        <a href="#faq" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">FAQ</a>
                        <div className="h-4 w-px bg-white/10 hidden sm:block" />
                        <Link to="/login" className="text-sm text-zinc-300 hover:text-white transition-colors">Log in</Link>
                        <Link to="/login?mode=signup" className="bg-white text-black px-3.5 py-1.5 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors">Sign up</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <header className="relative z-10 pt-28 pb-16 md:pt-36 md:pb-20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className={`flex justify-center mb-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                            20+ Years of Market Data
                        </div>
                    </div>

                    <div className={`text-center mb-6 transition-all duration-500 delay-75 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-4">
                            Portfolio Backtesting{' '}
                            <br className="hidden md:block" />
                            <span className="text-zinc-400">Made Simple</span>
                        </h1>
                        <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
                            Test strategies against 20+ years of data. Monte Carlo simulation. AI optimization. No signup required.
                        </p>
                    </div>

                    <div className={`flex flex-col items-center gap-3 mb-12 transition-all duration-500 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                        <button
                            onClick={handleStartBacktest}
                            className="h-11 px-6 rounded-md bg-white text-black font-medium hover:bg-zinc-100 transition-colors flex items-center gap-2"
                        >
                            Start Backtesting
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                        <span className="text-zinc-500 text-sm">No signup required to try</span>
                    </div>

                    {/* Screenshot */}
                    <div className={`relative max-w-5xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="relative rounded-lg border border-white/10 bg-zinc-900/50 overflow-hidden shadow-2xl shadow-black/50">
                            <div className="h-8 bg-zinc-900 border-b border-white/5 flex items-center px-3 gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                                <span className="ml-3 text-[11px] text-zinc-500 font-mono">backfolio.io/backtest</span>
                            </div>
                            <img
                                src="/media/tactical-builder.png"
                                alt="Backfolio portfolio backtesting interface"
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Features - Condensed */}
            <section className="relative z-10 py-16 border-t border-white/5">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        <article className="bg-zinc-900/50 border border-white/5 rounded-lg p-6">
                            <div className="w-10 h-10 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Historical Backtesting</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Test portfolios against real market data. 7,000+ ETFs supported. CAGR, Sharpe, max drawdown, and 15+ metrics.
                            </p>
                        </article>

                        <article className="bg-zinc-900/50 border border-white/5 rounded-lg p-6">
                            <div className="w-10 h-10 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Monte Carlo Simulation</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Run thousands of simulations. See probability of success, Value at Risk, and worst-case scenarios.
                            </p>
                        </article>

                        <article className="bg-zinc-900/50 border border-white/5 rounded-lg p-6">
                            <div className="w-10 h-10 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">AI Optimization</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                AI optimization finds optimal weights. Maximize Sharpe, Sortino, or custom objectives automatically.
                            </p>
                        </article>
                    </div>
                </div>
            </section>

            {/* Demo Video */}
            <section id="demo" className="relative z-10 py-16 border-t border-white/5 bg-zinc-900/30">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold mb-2">See It in Action</h2>
                        <p className="text-zinc-400 text-sm">Full walkthrough: backtest, Monte Carlo, and AI optimization</p>
                    </div>

                    <div className="relative rounded-lg overflow-hidden border border-white/10 shadow-xl aspect-video bg-black">
                        <video controls className="w-full h-full object-contain" poster="/media/tactical-builder.png">
                            <source src="https://backfoliostorage.blob.core.windows.net/videos/demo-strategy-backtest.mov?st=2025-12-01&se=2035-12-31&sp=r&spr=https&sv=2022-11-02&sr=b&sig=%2B9vy4%2Fyc3UVNa4JbAEBwtrLuHEoVKYULcdtlIy2dQ9Q%3D" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            </section>

            {/* FAQ - Condensed */}
            <section id="faq" className="relative z-10 py-16 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold mb-2">FAQ</h2>
                    </div>

                    <div className="space-y-3">
                        {[
                            {
                                question: "What is Monte Carlo simulation?",
                                answer: "Monte Carlo generates thousands of possible future scenarios based on historical patterns. It shows probability of success, Value at Risk (VaR), and worst-case outcomes — not just what happened, but what could happen."
                            },
                            {
                                question: "Can I backtest leveraged ETFs?",
                                answer: "Yes! TQQQ, UPRO, SOXL, and more. See how volatility decay affects returns and test tactical strategies that switch between leveraged and defensive positions."
                            },
                            {
                                question: "How does AI optimization work?",
                                answer: "Our optimizer tests hundreds of weight combinations to maximize Sharpe, Sortino, Calmar, or custom objectives. Like having a quant team optimize your portfolio automatically."
                            },
                            {
                                question: "What's included?",
                                answer: "Backtesting, retirement simulation, and portfolio comparison are free. Advanced features like Monte Carlo, AI optimization, PDF exports, and rebalance alerts require a Pro subscription."
                            }
                        ].map((faq, index) => (
                            <div key={index} className="border border-white/5 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                                >
                                    <h3 className="font-medium text-white">{faq.question}</h3>
                                    <svg className={`w-5 h-5 text-zinc-400 flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {openFaq === index && (
                                    <div className="px-5 pb-4">
                                        <p className="text-sm text-zinc-400 leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative z-10 py-16 border-t border-white/5">
                <div className="max-w-2xl mx-auto px-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to test your strategy?</h2>
                    <p className="text-zinc-400 mb-6">Start backtesting in seconds. No signup required.</p>
                    <button
                        onClick={handleStartBacktest}
                        className="h-11 px-6 rounded-md bg-white text-black font-medium hover:bg-zinc-100 transition-colors inline-flex items-center gap-2"
                    >
                        Start Backtesting
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-8">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <img src={logoSvg} alt="Backfolio" className="h-5 w-auto opacity-60" />
                            <span className="text-zinc-500 text-sm">© 2025</span>
                        </div>
                        <div className="flex gap-6 text-sm text-zinc-500">
                            <a href="mailto:contact@backfolio.io" className="hover:text-white transition-colors">Contact</a>
                            <a href="mailto:bugs@backfolio.io" className="hover:text-white transition-colors">Report Bug</a>
                        </div>
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-relaxed max-w-2xl">
                        Disclaimer: Backfolio is for informational purposes only. Not financial advice. Past performance doesn't guarantee future results.
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default LandingPageBeta
