import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { useTheme } from '../context/ThemeContext'
import {
    SavedBacktestCard,
} from '../components/portfolios'
import { useStrategies, usePrefetchAdjacentPages } from '../hooks/useApi'
import type { ListStrategiesParams } from '../types/strategy'

type SortOption = 'recent' | 'name' | 'return' | 'cagr' | 'sharpe' | 'drawdown'
type FilterOption = 'all' | 'deployed' | 'not-deployed' | 'aggressive' | 'defensive' | 'balanced'

const ITEMS_PER_PAGE = 10

const Portfolios = () => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const [searchParams, setSearchParams] = useSearchParams()

    const initialPage = parseInt(searchParams.get('page') || '1', 10)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(initialPage)
    const [sortBy, setSortBy] = useState<SortOption>('recent')
    const [filterBy, setFilterBy] = useState<FilterOption>('all')

    // Build API params for pagination and sorting
    const apiParams: ListStrategiesParams = {
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        sort_by: sortBy,
        // Only pass deployment filter if specifically selected
        ...(filterBy === 'deployed' && { is_deployed: true }),
        ...(filterBy === 'not-deployed' && { is_deployed: false }),
        // Only pass risk level if specifically selected
        ...((filterBy === 'aggressive' || filterBy === 'defensive' || filterBy === 'balanced') && { risk_level: filterBy }),
    }

    // API data using React Query with pagination
    const {
        data: strategiesData,
        isLoading: loading,
        error: strategiesError,
        isFetching,
    } = useStrategies(apiParams)

    const strategies = strategiesData?.strategies || []
    const totalStrategies = strategiesData?.total || 0
    const totalPages = strategiesData?.pages || 1
    const error = strategiesError?.message || null

    // Prefetch adjacent pages for smoother pagination
    const prefetchAdjacentPages = usePrefetchAdjacentPages()

    // Prefetch next/previous pages when current page loads
    useEffect(() => {
        if (!loading && totalPages > 1) {
            const baseParams = {
                limit: ITEMS_PER_PAGE,
                sort_by: sortBy,
                ...(filterBy === 'deployed' && { is_deployed: true }),
                ...(filterBy === 'not-deployed' && { is_deployed: false }),
                ...((filterBy === 'aggressive' || filterBy === 'defensive' || filterBy === 'balanced') && { risk_level: filterBy }),
            }
            prefetchAdjacentPages(currentPage, totalPages, baseParams)
        }
    }, [currentPage, totalPages, loading, sortBy, filterBy, prefetchAdjacentPages])

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev)
            newParams.set('page', '1')
            return newParams
        })
    }, [sortBy, filterBy, setSearchParams])

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev)
            newParams.set('page', String(page))
            return newParams
        })
        // Scroll to top of list
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Client-side search filter only (pagination, sorting, and main filters are server-side)
    const filteredBacktests = strategies.filter((strategy) => {
        if (searchQuery && !strategy.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false
        }
        return true
    })

    return (
        <Layout>
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8 lg:mb-12">
                    <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Strategy Library
                    </h1>
                    <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Browse and deploy your saved backtests
                    </p>
                </div>
                {/* Header with Search and Filters */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4 mb-6">
                        <div>
                            <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Saved Backtests
                            </h2>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {totalStrategies} strategies in your library
                            </p>
                        </div>
                        <Link
                            to="/backtest"
                            className={`w-full sm:w-auto text-center py-3 sm:py-2.5 px-5 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] flex items-center justify-center ${isDark
                                ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/50'
                                : 'bg-purple-600 text-white hover:bg-purple-700'
                                }`}
                        >
                            New Backtest
                        </Link>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search strategies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-lg text-sm transition-all duration-200 min-h-[44px] ${isDark
                                    ? 'bg-white/[0.05] border border-white/[0.15] text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20'
                                    }`}
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className={`w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-lg text-sm transition-all duration-200 min-h-[44px] ${isDark
                                ? 'bg-white/[0.05] border border-white/[0.15] text-white focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20'
                                : 'bg-white border border-gray-300 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20'
                                }`}
                        >
                            <option value="recent">Recent First</option>
                            <option value="cagr">Best CAGR</option>
                            <option value="return">Best Return</option>
                            <option value="sharpe">Best Sharpe</option>
                            <option value="drawdown">Lowest Drawdown</option>
                            <option value="name">Name (A-Z)</option>
                        </select>
                        <select
                            value={filterBy}
                            onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                            className={`w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-lg text-sm transition-all duration-200 min-h-[44px] ${isDark
                                ? 'bg-white/[0.05] border border-white/[0.15] text-white focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20'
                                : 'bg-white border border-gray-300 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20'
                                }`}
                        >
                            <option value="all">All Strategies</option>
                            <option value="deployed">Deployed</option>
                            <option value="not-deployed">Not Deployed</option>
                            <option value="aggressive">Aggressive</option>
                            <option value="defensive">Defensive</option>
                            <option value="balanced">Balanced</option>
                        </select>
                    </div>
                </div>

                {/* Backtests List */}
                <div className="relative">
                    {/* Loading overlay for page transitions */}
                    {isFetching && !loading && (
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        </div>
                    )}

                    {loading ? (
                        <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
                            <p>Loading strategies...</p>
                        </div>
                    ) : error ? (
                        <div className={`text-center py-12 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                            <p>Error: {error}</p>
                        </div>
                    ) : filteredBacktests.length === 0 ? (
                        <div
                            className={`backdrop-blur-2xl rounded-lg p-8 sm:p-12 lg:p-16 text-center ${isDark
                                ? 'bg-white/[0.02] border border-white/[0.15]'
                                : 'bg-white border border-gray-200'
                                }`}
                        >
                            <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-500/10' : 'bg-gray-100'}`}>
                                <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className={`text-lg sm:text-xl font-semibold mb-2 sm:mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                No strategies found
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {totalStrategies === 0 ? 'Create your first backtest to get started' : 'Try adjusting your search or filters'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {filteredBacktests.map((strategy) => {
                                // Transform SavedStrategy to SavedBacktest UI format
                                const allocations = strategy.strategy_dsl?.allocations || {}
                                const metrics = strategy.metrics

                                // CLEAN API V4.0: Count entry_conditions in allocations
                                const rulesCount = Object.values(allocations).filter(
                                    (alloc: any) => alloc?.entry_condition
                                ).length

                                const uiBacktest = {
                                    id: strategy.strategy_id,
                                    name: strategy.name,
                                    version: strategy.version,
                                    timestamp: strategy.created_at,
                                    // Use stored metrics if available
                                    totalReturn: metrics?.total_return ?? null,
                                    cagr: metrics?.cagr ?? null,
                                    sharpeRatio: metrics?.sharpe_ratio ?? null,
                                    maxDrawdown: metrics?.max_drawdown ?? null,
                                    moneyWeightedReturn: metrics?.money_weighted_return ?? null,
                                    rules: `${Object.keys(allocations).length} allocations, ${rulesCount} rules`,
                                    isDeployed: strategy.is_deployed,
                                    riskLevel: strategy.risk_level
                                }

                                return (
                                    <SavedBacktestCard
                                        key={strategy.strategy_id}
                                        backtest={uiBacktest}
                                        strategyDSL={strategy.strategy_dsl}
                                        fallbackAllocation={strategy.strategy_dsl?.fallback_allocation}
                                        canvasState={strategy.canvas_state}
                                    />
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && !loading && !error && (
                    <div className={`mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        {/* Page info */}
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalStrategies)} of {totalStrategies} strategies
                        </p>

                        {/* Pagination controls */}
                        <div className="flex items-center gap-2">
                            {/* Previous button */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-lg transition-all duration-200 min-h-[40px] min-w-[40px] flex items-center justify-center ${currentPage === 1
                                    ? isDark
                                        ? 'bg-white/[0.02] text-gray-600 cursor-not-allowed'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : isDark
                                        ? 'bg-white/[0.05] text-gray-300 hover:bg-white/[0.1] border border-white/[0.1]'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            {/* Page numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(page => {
                                        // Show first, last, current, and adjacent pages
                                        if (page === 1 || page === totalPages) return true
                                        if (Math.abs(page - currentPage) <= 1) return true
                                        return false
                                    })
                                    .reduce((acc: (number | 'ellipsis')[], page, idx, arr) => {
                                        // Add ellipsis where there are gaps
                                        if (idx > 0 && arr[idx - 1] !== page - 1) {
                                            acc.push('ellipsis')
                                        }
                                        acc.push(page)
                                        return acc
                                    }, [])
                                    .map((item, idx) => (
                                        item === 'ellipsis' ? (
                                            <span key={`ellipsis-${idx}`} className={`px-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={item}
                                                onClick={() => handlePageChange(item)}
                                                className={`min-h-[40px] min-w-[40px] rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === item
                                                    ? isDark
                                                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                                                        : 'bg-purple-600 text-white'
                                                    : isDark
                                                        ? 'text-gray-400 hover:bg-white/[0.05]'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {item}
                                            </button>
                                        )
                                    ))
                                }
                            </div>

                            {/* Next button */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-lg transition-all duration-200 min-h-[40px] min-w-[40px] flex items-center justify-center ${currentPage === totalPages
                                    ? isDark
                                        ? 'bg-white/[0.02] text-gray-600 cursor-not-allowed'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : isDark
                                        ? 'bg-white/[0.05] text-gray-300 hover:bg-white/[0.1] border border-white/[0.1]'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default Portfolios
