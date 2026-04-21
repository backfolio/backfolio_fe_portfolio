import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { API_BASE_URL } from '../../api/client'
import { BacktestResultsModalProps, TabType } from './types/backtestResults'
import { useBacktestChartData } from './hooks/useBacktestChartData'
import { useTheme } from '../../context/ThemeContext'
import { ModalHeader } from './components/ModalHeader'
import { TabBar } from './components/TabBar'
import { OverviewTab } from './tabs/OverviewTab'
import { ChartsTab } from './tabs/ChartsTab'
import { ReturnsTab } from './tabs/ReturnsTab'
import { AnalyticsTab } from './tabs/AnalyticsTab'
import { AllocationsTab } from './tabs/AllocationsTab'
import { LiveStatusTab } from './tabs/LiveStatusTab'
import { MonteCarloTab } from './tabs/monte-carlo'
import { StrategyOptimizerTab } from './tabs/strategy-optimizer'
import type { OptimizerPersistedState } from './tabs/strategy-optimizer'
import { SaveStrategyModal } from './modals/SaveStrategyModal'
import { EnhancementSettingsModal } from './modals/EnhancementSettingsModal'
import { ComparisonModal } from './modals/ComparisonModal'
import type { MonteCarloStatusResponse } from '../../types/strategy'

// Persisted state types for tabs that run long operations
type TabViewState = 'config' | 'progress' | 'results' | 'error'

interface MonteCarloPersistedState {
    view: TabViewState
    status: MonteCarloStatusResponse | null
    error: string | null
}

// OptimizerPersistedState is now imported from strategy-optimizer

interface CanvasState {
    edges: Array<{ source: string; target: string }>;
    positions: { [key: string]: { x: number; y: number } };
    viewport?: { x: number; y: number; zoom: number };
}

interface ExtendedBacktestResultsModalProps extends BacktestResultsModalProps {
    existingStrategyId?: string | null;
    existingStrategyName?: string | null;
    onStrategySaved?: (strategyId: string, strategyName: string) => void;
    // Canvas state for AI Insights tab
    canvasState?: CanvasState;
    // Cached result display options
    isUsingCachedResult?: boolean;
    cachedAt?: string;
    onRerunBacktest?: () => void;
    // Auto-start Monte Carlo with default parameters (75 sims × 10 years)
    autoStartMonteCarlo?: boolean;
}

const BacktestResultsModal: React.FC<ExtendedBacktestResultsModalProps> = ({
    result,
    onClose,
    strategy,
    onOptimizedStrategy,
    existingStrategyId,
    existingStrategyName,
    onStrategySaved,
    canvasState,
    isUsingCachedResult,
    cachedAt,
    onRerunBacktest,
    autoStartMonteCarlo = false
}) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    const [activeTab, setActiveTab] = useState<TabType>('overview')
    const [visitedTabs, setVisitedTabs] = useState<Set<TabType>>(new Set(['overview'])) // Track visited tabs per backtest
    const contentRef = React.useRef<HTMLDivElement>(null) // Ref to scroll content to top
    const [showSaveModal, setShowSaveModal] = useState(false)
    const [showEnhancementSettings, setShowEnhancementSettings] = useState(false)
    const [enhancing, setEnhancing] = useState(false)
    const [enhancementMessage, setEnhancementMessage] = useState<string | null>(null)
    const [showComparison, setShowComparison] = useState(false)
    const [optimizationResult, setOptimizationResult] = useState<any>(null)

    // Persisted state for Monte Carlo and Optimizer tabs (so results survive tab switches)
    const [monteCarloState, setMonteCarloState] = useState<MonteCarloPersistedState>({
        view: 'config',
        status: null,
        error: null
    })
    const [optimizerState, setOptimizerState] = useState<OptimizerPersistedState>({
        view: 'config',
        mode: 'allocations',
        allocationsStatus: null,
        rulesStatus: null,
        error: null
    })

    // Auto-navigate to Monte Carlo tab when autoStartMonteCarlo is true
    React.useEffect(() => {
        if (autoStartMonteCarlo) {
            setActiveTab('monte_carlo')
            setVisitedTabs(prev => new Set([...prev, 'monte_carlo']))
        }
    }, [autoStartMonteCarlo])

    // Wrapped state setters with scroll-to-top on results
    const handleMonteCarloStateChange = (newState: MonteCarloPersistedState) => {
        const wasNotResults = monteCarloState.view !== 'results'
        setMonteCarloState(newState)
        // Scroll to top when transitioning to results view
        if (wasNotResults && newState.view === 'results') {
            contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handleOptimizerStateChange = (newState: OptimizerPersistedState) => {
        const wasNotResults = optimizerState.view !== 'results'
        setOptimizerState(newState)
        // Scroll to top when transitioning to results view
        if (wasNotResults && newState.view === 'results') {
            contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    if (!result || !result.success) return null

    const { result: apiResult } = result

    // Handler for tab changes with scroll-to-top logic
    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab)

        // Scroll to top only if this is the first time visiting this tab in this backtest session
        if (!visitedTabs.has(tab)) {
            contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
            setVisitedTabs(prev => new Set([...prev, tab]))
        }
    }


    // Use custom hook for data transformations (single strategy)
    const {
        portfolioData,
        returnsData,
        drawdownData,
        allocationData
    } = useBacktestChartData(result)

    const handleEnhanceWithMetrics = async (selectedMetrics: string[]) => {
        if (!strategy) return

        setEnhancing(true)
        setEnhancementMessage(null)

        try {
            // API key is optional - backend will use algorithmic mode if not provided
            const apiKey = localStorage.getItem('openai_api_key')

            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }

            // Add API key header only if present (enables AI mode)
            if (apiKey) {
                headers['X-OpenAI-API-Key'] = apiKey
            }

            // Create AbortController for timeout management (30 seconds for optimization)
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000)

            const response = await fetch(`${API_BASE_URL}/api/ai/optimize-strategy`, {
                method: 'POST',
                headers,
                signal: controller.signal,
                body: JSON.stringify({
                    strategy: strategy,
                    results: apiResult,
                    prioritize_metrics: selectedMetrics.length > 0 ? selectedMetrics : undefined,
                    num_attempts: 3  // Try 3 variations and pick the best
                })
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                setEnhancementMessage(`Enhancement failed: ${errorData.error || errorData.message || 'HTTP ' + response.status}`)
                return
            }

            const data = await response.json()

            if (data.success) {
                // Verify we have the necessary metrics for comparison
                if (data.new_metrics && data.original_metrics) {
                    // Store optimization result for comparison modal
                    setOptimizationResult(data)

                    // Show comparison modal instead of just a message
                    setShowComparison(true)

                    // Keep the old message fallback for backwards compatibility
                    const methodBadge = data.optimization_method === 'ai'
                        ? 'Enhanced by AI'
                        : 'Enhanced by Algorithm'

                    setEnhancementMessage(`${methodBadge} - Click to view detailed comparison`)
                } else {
                    // Optimization succeeded but no backtest results - show text message
                    setEnhancementMessage(`Strategy optimized (${data.optimization_method || 'algorithmic'} mode)\n\n${data.explanation || 'Strategy has been optimized.'}\n\nNo backtest comparison available. Please run backtest manually to see improvements.`)
                }
            } else {
                setEnhancementMessage(`Enhancement failed: ${data.error || 'Unknown error'}`)
            }
        } catch (error: any) {
            console.error('Enhancement error:', error)

            // Handle different error types
            if (error.name === 'AbortError') {
                setEnhancementMessage(`Enhancement timed out after 30 seconds. The optimization is taking longer than expected. Please try again with fewer num_attempts or simpler strategy.`)
            } else if (error.message && error.message.includes('Failed to fetch')) {
                setEnhancementMessage(`Network error: Cannot connect to backend server. Please ensure the backend is running on port 8000.`)
            } else {
                setEnhancementMessage(`Enhancement failed: ${error.message || 'Unknown error occurred'}`)
            }
        } finally {
            setEnhancing(false)
        }
    }

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 md:p-4">
            <div className={`border rounded-md shadow-xl w-full max-w-7xl h-[98vh] md:h-[95vh] overflow-hidden flex flex-col ${isDark ? 'bg-black border-white/[0.08]' : 'bg-white border-gray-200'
                }`}>
                {/* Header */}
                <ModalHeader
                    result={result}
                    portfolioData={portfolioData}
                    returnsData={returnsData}
                    onClose={onClose}
                    onSaveStrategy={strategy ? () => setShowSaveModal(true) : undefined}
                    strategy={strategy}
                    canvasState={canvasState}
                />

                {/* Tabs */}
                <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

                {/* Content */}
                <div ref={contentRef} className={`flex-1 overflow-y-auto p-4 md:p-6 ${isDark ? 'bg-black' : 'bg-gray-50/50'}`}>

                    {/* Cached Result Indicator */}
                    {isUsingCachedResult && (
                        <div className={`border rounded-md p-5 mb-6 ${isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`flex items-center justify-center w-9 h-9 rounded-md ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                                        <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className={`text-sm font-semibold ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
                                            Cached Results
                                        </span>
                                        {cachedAt && (
                                            <span className={`text-xs ml-2 ${isDark ? 'text-blue-400/70' : 'text-blue-600/70'}`}>
                                                from {new Date(cachedAt).toLocaleDateString()} {new Date(cachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {onRerunBacktest && (
                                    <button
                                        onClick={onRerunBacktest}
                                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${isDark
                                            ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30'
                                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
                                            }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Re-run with latest data
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Enhancement Loading/Message */}
                    {enhancing && (
                        <div className={`border rounded-md p-5 mb-6 ${isDark ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'
                            }`}>
                            <div className="flex items-center gap-3">
                                <div className="animate-spin">
                                    <svg className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <span className={`text-sm font-semibold ${isDark ? 'text-purple-300' : 'text-purple-900'}`}>
                                    Enhancing strategy with AI... This may take a moment.
                                </span>
                            </div>
                        </div>
                    )}

                    {enhancementMessage && (
                        <div className={`border rounded-md p-5 mb-6 ${enhancementMessage.toLowerCase().includes('failed') || enhancementMessage.toLowerCase().includes('error') || enhancementMessage.toLowerCase().includes('timed out')
                            ? isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
                            : isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                            }`}>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                    {enhancementMessage.toLowerCase().includes('failed') || enhancementMessage.toLowerCase().includes('error') || enhancementMessage.toLowerCase().includes('timed out') ? (
                                        <svg className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : (
                                        <svg className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm whitespace-pre-line ${enhancementMessage.toLowerCase().includes('failed') || enhancementMessage.toLowerCase().includes('error') || enhancementMessage.toLowerCase().includes('timed out')
                                        ? isDark ? 'text-red-300' : 'text-red-900'
                                        : isDark ? 'text-emerald-300' : 'text-emerald-900'
                                        }`}>
                                        {enhancementMessage}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setEnhancementMessage(null)}
                                    className={`flex-shrink-0 p-1 rounded-md transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 
                      Tab content - only render active tab.
                      Previous caching approach caused void scrolling space.
                      Charts use memo() and ref-based animation tracking to prevent re-render issues.
                    */}
                    {activeTab === 'overview' && (
                        <OverviewTab
                            result={result}
                            portfolioData={portfolioData}
                            strategy={strategy}
                            strategyName={existingStrategyName || undefined}
                        />
                    )}

                    {activeTab === 'charts' && (
                        <ChartsTab returnsData={returnsData} drawdownData={drawdownData} />
                    )}

                    {activeTab === 'returns' && (
                        <ReturnsTab result={result} />
                    )}

                    {activeTab === 'analytics' && (
                        <AnalyticsTab result={result} />
                    )}

                    {activeTab === 'allocations' && (
                        <AllocationsTab result={result} allocationData={allocationData} strategy={strategy} />
                    )}

                    {activeTab === 'live_status' && (
                        <LiveStatusTab strategy={strategy} />
                    )}

                    {activeTab === 'monte_carlo' && (
                        <MonteCarloTab
                            result={result}
                            strategyName={existingStrategyName || 'Current Strategy'}
                            strategyDsl={strategy}
                            persistedState={monteCarloState}
                            onStateChange={handleMonteCarloStateChange}
                            autoStart={autoStartMonteCarlo}
                        />
                    )}

                    {activeTab === 'insights' && (
                        <StrategyOptimizerTab
                            result={result}
                            strategyId={existingStrategyId}
                            strategyName={existingStrategyName || 'Current Strategy'}
                            strategyDsl={strategy}
                            originalStrategy={strategy}
                            canvasState={canvasState}
                            onLoadStrategy={onOptimizedStrategy ? (dsl) => onOptimizedStrategy(dsl as any) : undefined}
                            persistedState={optimizerState}
                            onStateChange={handleOptimizerStateChange}
                        />
                    )}

                    {/* Warnings */}
                    {apiResult.warnings && apiResult.warnings.length > 0 && (
                        <div className={`border rounded-md p-5 mt-6 ${isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <svg className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <h3 className={`text-lg font-semibold ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
                                    Warnings
                                </h3>
                            </div>
                            <ul className="space-y-2">
                                {apiResult.warnings.map((warning, idx) => (
                                    <li key={idx} className={`text-sm flex items-start gap-2 ${isDark ? 'text-amber-200' : 'text-amber-800'
                                        }`}>
                                        <span className={isDark ? 'text-amber-400' : 'text-amber-600'}>•</span>
                                        <span>{warning}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Save Strategy Modal */}
            {strategy && (
                <SaveStrategyModal
                    isOpen={showSaveModal}
                    onClose={() => setShowSaveModal(false)}
                    strategy={strategy}
                    backtestResult={apiResult}
                    existingStrategyId={existingStrategyId}
                    existingStrategyName={existingStrategyName}
                    onSaved={(strategyId, strategyName) => {
                        // Strategy saved successfully
                        setShowSaveModal(false)
                        // Notify parent to update loaded strategy context
                        onStrategySaved?.(strategyId, strategyName)
                    }}
                />
            )}

            {/* Enhancement Settings Modal */}
            <EnhancementSettingsModal
                isOpen={showEnhancementSettings}
                onClose={() => setShowEnhancementSettings(false)}
                onEnhance={handleEnhanceWithMetrics}
                isDark={isDark}
            />

            {/* Comparison Modal */}
            {optimizationResult && optimizationResult.new_metrics && optimizationResult.original_metrics && (
                <ComparisonModal
                    isOpen={showComparison}
                    onClose={() => {
                        setShowComparison(false)
                        setEnhancementMessage(null)
                    }}
                    originalMetrics={optimizationResult.original_metrics}
                    optimizedMetrics={optimizationResult.new_metrics}
                    explanation={optimizationResult.explanation || 'Strategy has been optimized'}
                    optimizationMethod={optimizationResult.optimization_method || 'algorithmic'}
                    onAccept={() => {
                        // Apply optimized strategy
                        if (onOptimizedStrategy && optimizationResult.optimized_strategy) {
                            onOptimizedStrategy(optimizationResult.optimized_strategy)
                        }

                        // Show success message
                        setEnhancementMessage('Optimized strategy applied!\n\nClick "Run Backtest" button to verify the results with a fresh backtest.')
                        setShowComparison(false)

                        // Close modals after showing message
                        setTimeout(() => {
                            setEnhancementMessage(null)
                            onClose()
                        }, 3000)
                    }}
                    isDark={isDark}
                />
            )}
        </div>,
        document.body
    )
}

export default BacktestResultsModal
