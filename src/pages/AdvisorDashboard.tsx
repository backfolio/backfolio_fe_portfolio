/**
 * AdvisorDashboard - Dashboard tailored for financial advisors.
 * 
 * Focuses on:
 * - Quick actions for retirement analysis, portfolio backtesting, and reports
 * - List of saved analyses ready to share with clients
 * - Firm branding display
 */

import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Layout from '../components/Layout'
import { useStrategies } from '../hooks/useApi'

const AdvisorDashboard = () => {
    const { user, firmName } = useAuth()
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    // Fetch saved strategies for the analyses list
    const { data: strategiesResponse, isLoading: strategiesLoading } = useStrategies({
        sort_by: 'recent',
        limit: 5,
    })

    const strategies = strategiesResponse?.strategies ?? []
    const hasStrategies = strategies.length > 0

    return (
        <Layout>
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Dashboard
                            </h1>
                            <p className={`text-sm sm:text-base lg:text-lg mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Welcome back, {user?.name || user?.email?.split('@')[0]}
                            </p>
                        </div>
                        {firmName && (
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'}`}>
                                <svg className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className={`font-medium ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                                    {firmName}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-10">
                    <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Retirement Analysis */}
                        <Link
                            to="/retirement"
                            className={`group p-6 rounded-xl border transition-all duration-300 ${isDark
                                ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 hover:border-emerald-400/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                                : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 hover:border-emerald-300 hover:shadow-lg'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDark
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-emerald-100 text-emerald-600'
                            }`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Retirement Analysis
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Run Monte Carlo simulations for retirement planning
                            </p>
                        </Link>

                        {/* Portfolio Backtest */}
                        <Link
                            to="/backtest"
                            className={`group p-6 rounded-xl border transition-all duration-300 ${isDark
                                ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 hover:border-purple-400/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]'
                                : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 hover:border-purple-300 hover:shadow-lg'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDark
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-purple-100 text-purple-600'
                            }`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Analyze Portfolio
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Backtest strategies and compare performance
                            </p>
                        </Link>

                        {/* View Reports */}
                        <Link
                            to="/portfolios?tab=saved"
                            className={`group p-6 rounded-xl border transition-all duration-300 ${isDark
                                ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]'
                                : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:border-amber-300 hover:shadow-lg'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDark
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-amber-100 text-amber-600'
                            }`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Saved Analyses
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                View and export your saved strategies
                            </p>
                        </Link>
                    </div>
                </div>

                {/* Saved Analyses */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Recent Analyses
                        </h2>
                        {hasStrategies && (
                            <Link
                                to="/portfolios?tab=saved"
                                className={`text-sm font-medium ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
                            >
                                View All →
                            </Link>
                        )}
                    </div>

                    {strategiesLoading ? (
                        <div className={`p-8 rounded-xl border ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-center justify-center">
                                <svg className={`w-6 h-6 animate-spin ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            </div>
                        </div>
                    ) : hasStrategies ? (
                        <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-white border-gray-200'}`}>
                            <div className="divide-y divide-gray-200 dark:divide-white/[0.1]">
                                {strategies.map((strategy) => (
                                    <div
                                        key={strategy.strategy_id}
                                        className={`p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-purple-500/10' : 'bg-purple-100'}`}>
                                                <svg className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {strategy.name}
                                                </h4>
                                                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                    {strategy.metrics?.cagr != null ? `${(strategy.metrics.cagr * 100).toFixed(1)}% CAGR` : 'No metrics'}
                                                    {' · '}
                                                    {new Date(strategy.updated_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                to={`/backtest`}
                                                state={{ strategyId: strategy.strategy_id, strategyName: strategy.name }}
                                                className={`p-2 rounded-lg transition-colors ${isDark
                                                    ? 'hover:bg-white/[0.05] text-gray-400 hover:text-white'
                                                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                                                }`}
                                                title="Edit"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Empty State */
                        <div className={`p-8 rounded-xl border text-center ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-gray-50 border-gray-200'}`}>
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-500/10' : 'bg-purple-100'}`}>
                                <svg className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                No analyses yet
                            </h3>
                            <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Create your first retirement analysis or portfolio backtest
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    to="/retirement"
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDark
                                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                    }`}
                                >
                                    Start Retirement Analysis
                                </Link>
                                <Link
                                    to="/backtest"
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDark
                                        ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30'
                                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                    }`}
                                >
                                    Create Portfolio Backtest
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tips for Advisors */}
                <div className={`p-6 rounded-xl border ${isDark ? 'bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-blue-500/20' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'}`}>
                    <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                            <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Pro Tip
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Use the Retirement Analysis tool to show clients their probability of success with Monte Carlo simulations. 
                                After running an analysis, you can export a branded PDF report to share with them.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default AdvisorDashboard

