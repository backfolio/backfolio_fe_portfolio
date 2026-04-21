import Layout from '../components/Layout'
import { useTacticalStrategy } from '../hooks/useTacticalStrategy'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api/client'
import { getStrategy, getShare, trackShareImport } from '../services/api'
import type { StrategyDSL } from '../types/strategy'
import { STRATEGY_PRESETS } from '../constants/strategy'

// Components
import BacktestResultsModal from '../components/backtest/BacktestResultsModal'
import { StrategyCanvas } from '../components/backtest/StrategyCanvas'

// Type for navigation state when loading a saved strategy
interface LocationState {
    strategyId?: string;
    strategyName?: string;
    // Direct strategy DSL for loading optimized strategies from AI insights
    optimizedStrategyDsl?: StrategyDSL;
}

const Backtest = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const locationState = location.state as LocationState | null;

    const tacticalStrategyHook = useTacticalStrategy();
    const {
        strategy,
        buildBacktestRequest,
        hasDisconnectedChains,
    } = tacticalStrategyHook;

    const [backtestResult, setBacktestResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>('')
    const [loadingProgress, setLoadingProgress] = useState(0)
    const [showModal, setShowModal] = useState(false)
    const [edges, setEdges] = useState<Array<{ source: string; target: string }>>([])
    const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map())

    // Monte Carlo auto-start state - when true, opens modal to Monte Carlo tab after backtest
    const [autoStartMonteCarlo, setAutoStartMonteCarlo] = useState(false)
    const [isMonteCarloLoading, setIsMonteCarloLoading] = useState(false)

    // Ticker validation status from StrategyCanvas
    const [hasInvalidTickers, setHasInvalidTickers] = useState(false)
    const [invalidPortfolios, setInvalidPortfolios] = useState<{ name: string; tickers: string[] }[]>([])

    // Track if canvas is restoring state (to suppress validation errors during load)
    const [isCanvasRestoring, setIsCanvasRestoring] = useState(false)

    // Handler for validation status changes from StrategyCanvas
    const handleValidationStatusChange = useCallback((hasInvalid: boolean, invalidList: { name: string; tickers: string[] }[]) => {
        setHasInvalidTickers(hasInvalid);
        setInvalidPortfolios(invalidList);
    }, []);

    // Loaded strategy context - for save/update operations
    const [loadedStrategyId, setLoadedStrategyId] = useState<string | null>(null)
    const [loadedStrategyName, setLoadedStrategyName] = useState<string | null>(null)
    const hasLoadedStrategy = useRef(false)

    // Auto-run backtest when loading from a shared link
    const [pendingAutoRun, setPendingAutoRun] = useState(false)

    // Override body/html overflow for this page to prevent scrolling
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, []);

    // Auto-fade error messages after 8 seconds (longer for user to read)
    useEffect(() => {
        if (error) {
            const timeoutId = setTimeout(() => {
                setError('');
            }, 8000);

            return () => clearTimeout(timeoutId);
        }
    }, [error]);

    // Show start modal on first load if strategy is empty
    // DISABLED: setShowStartModal not defined - empty state is handled by StrategyCanvas
    // useEffect(() => {
    //     const isEmpty = Object.keys(strategy.allocations).length === 0 && 
    //                    (!strategy.switching_logic || strategy.switching_logic.length === 0);
    //     
    //     if (isEmpty && !locationState?.strategyId && !locationState?.optimizedStrategyDsl) {
    //         setShowStartModal(true);
    //     }
    // }, []);

    // Removed: Real-time disconnected chain warning
    // Better UX: Only validate when user clicks "Run Backtest"
    // The validity indicator in the canvas provides passive awareness

    // Load strategy from navigation state (when clicking Edit from Portfolios page)
    useEffect(() => {
        const loadSavedStrategy = async () => {
            if (!locationState?.strategyId || hasLoadedStrategy.current) return;

            hasLoadedStrategy.current = true;

            try {
                const response = await getStrategy(locationState.strategyId);

                if (response.success && response.strategy) {
                    const savedStrategy = response.strategy;

                    // Store strategy context for save operations
                    setLoadedStrategyId(savedStrategy.strategy_id);
                    setLoadedStrategyName(savedStrategy.name);

                    // Convert saved strategy DSL to frontend StrategyDSL format
                    const strategyDsl = savedStrategy.strategy_dsl;
                    const canvasState = savedStrategy.canvas_state;

                    // Build the full strategy for the canvas
                    // CLEAN API V4.0: entry_condition is embedded in allocations
                    const loadedStrategy: StrategyDSL = {
                        start_date: '',
                        end_date: '',
                        initial_capital: 100000,
                        allocations: {},
                        fallback_allocation: strategyDsl.fallback_allocation || '',
                        allocation_order: (strategyDsl as Record<string, any>).allocation_order || [],
                        // Restore canvas state if available
                        canvas_edges: canvasState?.edges || [],
                        canvas_positions: canvasState?.positions || {},
                        canvas_viewport: canvasState?.viewport,
                    };

                    // CLEAN API V4.0: allocations are already in AllocationWithRebalancing format
                    // The API returns them as-is from how SaveStrategyModal saved them
                    if (strategyDsl.allocations) {
                        Object.entries(strategyDsl.allocations).forEach(([name, alloc]) => {
                            const allocData = alloc as Record<string, any>;

                            // Data should already be in correct format from SaveStrategyModal
                            // which sends strategy.allocations directly (AllocationWithRebalancing)
                            loadedStrategy.allocations[name] = {
                                allocation: allocData.allocation || {},
                                rebalancing_frequency: allocData.rebalancing_frequency || 'none',
                                ...(allocData.entry_condition ? { entry_condition: allocData.entry_condition } : {})
                            };
                        });
                    }

                    // Load the strategy into the tactical strategy hook
                    tacticalStrategyHook.loadStrategyFromTemplate(loadedStrategy);

                    // Clear navigation state to prevent reloading on refresh
                    navigate(location.pathname, { replace: true, state: null });
                }
            } catch (err) {
                console.error('Failed to load strategy:', err);
                setError('Failed to load strategy. Please try again.');
            }
        };

        loadSavedStrategy();
    }, [locationState?.strategyId]);

    // Load optimized strategy DSL directly (from AI Insights optimization)
    useEffect(() => {
        if (!locationState?.optimizedStrategyDsl || hasLoadedStrategy.current) return;

        hasLoadedStrategy.current = true;

        const dsl = locationState.optimizedStrategyDsl;

        // Build the full strategy for the canvas
        // CLEAN API V4.0: entry_condition is embedded in allocations
        const loadedStrategy: StrategyDSL = {
            start_date: dsl.start_date || '',
            end_date: dsl.end_date || '',
            initial_capital: dsl.initial_capital || 100000,
            allocations: dsl.allocations || {},
            fallback_allocation: dsl.fallback_allocation || '',
            allocation_order: dsl.allocation_order || [],
            // Clear canvas state for fresh layout
            canvas_edges: [],
            canvas_positions: {},
        };

        // Load the strategy into the tactical strategy hook
        tacticalStrategyHook.loadStrategyFromTemplate(loadedStrategy);

        // Clear navigation state to prevent reloading on refresh
        navigate(location.pathname, { replace: true, state: null });
    }, [locationState?.optimizedStrategyDsl]);

    // Load optimized strategy from localStorage (opened via "Open in New Window" button)
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const loadOptimized = searchParams.get('loadOptimized');

        if (!loadOptimized || hasLoadedStrategy.current) return;

        const OPTIMIZED_STRATEGY_KEY = 'backfolio_optimized_strategy_new_window';

        try {
            const stored = localStorage.getItem(OPTIMIZED_STRATEGY_KEY);
            if (stored) {
                hasLoadedStrategy.current = true;

                const dsl = JSON.parse(stored) as StrategyDSL;

                // Normalize allocations to ensure proper nested structure
                // CLEAN API V4.0: { allocation: {...}, rebalancing_frequency: '...', entry_condition?: {...} }
                const normalizedAllocations: StrategyDSL['allocations'] = {};
                if (dsl.allocations) {
                    for (const [name, alloc] of Object.entries(dsl.allocations)) {
                        if (alloc && typeof alloc === 'object') {
                            if ('allocation' in alloc) {
                                // Already nested structure - preserve entry_condition if present
                                normalizedAllocations[name] = {
                                    allocation: alloc.allocation || {},
                                    rebalancing_frequency: alloc.rebalancing_frequency || 'none',
                                    ...(alloc.entry_condition ? { entry_condition: alloc.entry_condition } : {})
                                };
                            } else {
                                // Flat structure (ticker -> weight) - wrap it
                                normalizedAllocations[name] = {
                                    allocation: alloc as Record<string, number>,
                                    rebalancing_frequency: 'none'
                                };
                            }
                        }
                    }
                }

                // Build the full strategy for the canvas
                // CLEAN API V4.0: entry_condition is embedded in allocations
                const loadedStrategy: StrategyDSL = {
                    start_date: dsl.start_date || '',
                    end_date: dsl.end_date || '',
                    initial_capital: dsl.initial_capital || 100000,
                    allocations: normalizedAllocations,
                    fallback_allocation: dsl.fallback_allocation || '',
                    allocation_order: dsl.allocation_order || [],
                    // Restore canvas state if available
                    canvas_edges: dsl.canvas_edges || [],
                    canvas_positions: dsl.canvas_positions || {},
                    canvas_viewport: dsl.canvas_viewport,
                };

                // Load the strategy into the tactical strategy hook
                tacticalStrategyHook.loadStrategyFromTemplate(loadedStrategy);

                // Clear localStorage to prevent reloading
                localStorage.removeItem(OPTIMIZED_STRATEGY_KEY);

                // Clear URL parameter to prevent confusion
                navigate(location.pathname, { replace: true });

                // Auto-run backtest so user immediately sees results
                setPendingAutoRun(true);
            }
        } catch (err) {
            console.error('Failed to load optimized strategy from localStorage:', err);
            // Clear URL parameter even on error
            navigate(location.pathname, { replace: true });
        }
    }, [location.search]);

    // Load shared strategy from URL parameter (?share=xxxxx)
    useEffect(() => {
        const loadSharedStrategy = async () => {
            const searchParams = new URLSearchParams(location.search);
            const shareId = searchParams.get('share');

            if (!shareId || hasLoadedStrategy.current) return;

            hasLoadedStrategy.current = true;

            try {
                const response = await getShare(shareId);

                if (response.success && response.share) {
                    const shared = response.share;
                    const dsl = shared.strategy_dsl as unknown as StrategyDSL;
                    const canvasState = shared.canvas_state as { edges?: any[]; positions?: Record<string, any>; viewport?: any } | undefined;

                    // Build the full strategy for the canvas
                    // CLEAN API V4.0: entry_condition is embedded in allocations
                    const loadedStrategy: StrategyDSL = {
                        start_date: dsl.start_date || '',
                        end_date: dsl.end_date || '',
                        initial_capital: dsl.initial_capital || 100000,
                        allocations: dsl.allocations || {},
                        fallback_allocation: dsl.fallback_allocation || '',
                        allocation_order: dsl.allocation_order || [],
                        // Restore canvas state if available
                        canvas_edges: canvasState?.edges || [],
                        canvas_positions: canvasState?.positions || {},
                        canvas_viewport: canvasState?.viewport,
                    };

                    // Load the strategy into the tactical strategy hook
                    tacticalStrategyHook.loadStrategyFromTemplate(loadedStrategy);

                    // Track the import (fire and forget)
                    trackShareImport(shareId);

                    // Clear URL parameter to prevent reloading on refresh
                    navigate(location.pathname, { replace: true });

                    // Trigger auto-run after a short delay to let the canvas initialize
                    setPendingAutoRun(true);
                }
            } catch (err) {
                console.error('Failed to load shared strategy:', err);
                setError('Failed to load shared strategy. The link may be invalid or expired.');
                // Clear URL parameter even on error
                navigate(location.pathname, { replace: true });
            }
        };

        loadSharedStrategy();
    }, [location.search]);

    // Load preset strategy from URL parameter (?preset=Strategy Name)
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const presetName = searchParams.get('preset');

        if (!presetName || hasLoadedStrategy.current) return;

        const decodedPresetName = decodeURIComponent(presetName);
        const preset = STRATEGY_PRESETS[decodedPresetName];

        if (!preset) {
            console.warn(`Preset "${decodedPresetName}" not found in STRATEGY_PRESETS`);
            navigate(location.pathname, { replace: true });
            return;
        }

        hasLoadedStrategy.current = true;

        // Auto-generate canvas edges from allocation_order
        // CLEAN API V4.0: use allocation_order to determine chain
        const allocationNames = Object.keys(preset.allocations || {});
        const allocationOrder = preset.allocation_order || allocationNames;

        // Build edge chain based on allocation_order
        const generatedEdges: Array<{ source: string; target: string }> = [];

        // Connect portfolios in chain based on allocation_order
        if (allocationOrder.length > 1) {
            for (let i = 0; i < allocationOrder.length - 1; i++) {
                const source = allocationOrder[i];
                const target = allocationOrder[i + 1];
                if (source && target && source !== target) {
                    generatedEdges.push({ source, target });
                }
            }
        }

        // Generate positions for portfolios (centered horizontal layout)
        const generatedPositions: Record<string, { x: number; y: number }> = {};
        const spacing = 350;

        // Use allocation_order for positioning
        const orderedAllocations = allocationOrder.length > 0 ? allocationOrder : allocationNames;

        // Center the portfolios (assuming ~1200px canvas width)
        const totalWidth = (orderedAllocations.length - 1) * spacing;
        const startX = Math.max(100, (1200 - totalWidth) / 2);

        orderedAllocations.forEach((name, index) => {
            generatedPositions[name] = {
                x: startX + (index * spacing),
                y: 200
            };
        });

        // Build the full strategy for the canvas
        // CLEAN API V4.0: entry_condition is embedded in allocations
        const loadedStrategy: StrategyDSL = {
            start_date: preset.start_date || '',
            end_date: preset.end_date || '',
            initial_capital: preset.initial_capital || 100000,
            allocations: preset.allocations || {},
            fallback_allocation: preset.fallback_allocation || '',
            allocation_order: preset.allocation_order || [],
            evaluation_frequency: preset.evaluation_frequency || 'daily',
            // Add generated canvas state
            canvas_edges: generatedEdges,
            canvas_positions: generatedPositions,
        };

        // Load the strategy into the tactical strategy hook
        tacticalStrategyHook.loadStrategyFromTemplate(loadedStrategy);

        // Clear URL parameter to prevent reloading on refresh
        navigate(location.pathname, { replace: true });

        // Don't auto-run - let user explore the preset first
    }, [location.search]);

    // Auto-run backtest when loading from a shared link
    // Waits until canvas is fully restored (isCanvasRestoring becomes false)
    useEffect(() => {
        if (!pendingAutoRun) return;

        // Don't run while canvas is still restoring
        if (isCanvasRestoring) return;

        // Check if strategy has allocations (canvas is ready)
        const hasAllocations = Object.keys(strategy.allocations).length > 0;
        if (!hasAllocations) return;

        // Verify edges are synced with strategy (prevents race condition)
        // If strategy has edges but local edges array is empty/mismatched, wait for sync
        const expectedEdgeCount = strategy.canvas_edges?.length || 0;
        if (edges.length !== expectedEdgeCount) return;

        // Add a small delay to ensure all React state updates have settled
        // This prevents race conditions where isCanvasRestoring becomes false
        // but the edges state hasn't fully propagated from the canvas yet
        const timeoutId = setTimeout(() => {
            // Double-check edges are still in sync after the delay
            if (edges.length === expectedEdgeCount) {
                setPendingAutoRun(false);
                runBacktest();
            }
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [pendingAutoRun, isCanvasRestoring, strategy.allocations, strategy.canvas_edges, edges.length]);

    const runBacktest = async () => {
        // Prevent running during canvas restoration (edges may not be loaded yet)
        if (isCanvasRestoring) {
            return;
        }

        // Check for invalid tickers (validated proactively when portfolios are saved)
        if (hasInvalidTickers && invalidPortfolios.length > 0) {
            const details = invalidPortfolios
                .map(p => `${p.name}: ${p.tickers.join(', ')}`)
                .join('; ');
            setError(`Cannot run backtest: Invalid ticker(s) detected. ${details}. Please fix the invalid symbols in your portfolios.`);
            return;
        }

        // Check for disconnected chains
        if (hasDisconnectedChains(edges)) {
            setError('Cannot run backtest: Multiple disconnected portfolio chains detected. Connect all portfolios or remove disconnected ones.');
            setShowModal(true);
            return;
        }

        // Validate date order
        if (strategy.start_date && strategy.end_date && strategy.start_date >= strategy.end_date) {
            setError('Invalid date range: Start date must be before end date. Please adjust your dates in the settings.');
            return;
        }

        // Validate directly using current strategy state
        const allocationGroups = Object.keys(strategy.allocations);
        if (allocationGroups.length === 0) {
            setError('Please add at least one portfolio allocation');
            return;
        }

        // Show modal immediately for better UX - no lag between click and feedback
        setLoading(true)
        setError('')
        setBacktestResult(null)
        setLoadingProgress(0)
        setShowModal(true)

        // Animate progress bar
        const progressInterval = setInterval(() => {
            setLoadingProgress(prev => {
                const next = prev + 2
                return next >= 95 ? 95 : next
            })
        }, 50)

        try {
            // Build single backtest request with node positions for allocation_order
            const backtestRequest = buildBacktestRequest(nodePositions)

            const response = await fetch(`${API_BASE_URL}/api/v1/backtest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(backtestRequest)
            })

            // Parse JSON with NaN handling
            const responseText = await response.text()
            let data
            try {
                // Replace NaN with null before parsing
                const sanitizedText = responseText.replace(/:\s*NaN\b/g, ': null')
                data = JSON.parse(sanitizedText)
            } catch (parseError) {
                console.error('JSON parse error:', parseError)
                console.error('Response text:', responseText)
                throw new Error('Invalid JSON response from server')
            }

            // Handle error responses per API spec
            if (!response.ok) {
                // 400 Bad Request: validation errors
                if (response.status === 400 && data.errors) {
                    throw new Error(`Validation errors:\n${data.errors.join('\n')}`)
                }
                // Standard error format: {success: false, error: string}
                throw new Error(data.error || 'Backtest failed')
            }

            // Check success field in response
            if (!data.success) {
                throw new Error(data.error || 'Backtest failed')
            }

            // Complete the progress
            clearInterval(progressInterval)
            setLoadingProgress(100)

            // Brief pause to show 100% completion
            setTimeout(() => {
                setBacktestResult(data)
                setLoading(false)
            }, 600)
        } catch (error: any) {
            clearInterval(progressInterval)
            setShowModal(false)
            setError(error.message || 'An error occurred while running the backtest')
            setLoading(false)
            setTimeout(() => setLoadingProgress(0), 500)
            // Error will auto-fade after 5 seconds via useEffect
        }
    }

    // Run Monte Carlo - runs backtest first, then auto-starts Monte Carlo simulation
    const runMonteCarlo = async () => {
        // Set flags for Monte Carlo auto-start
        setAutoStartMonteCarlo(true)
        setIsMonteCarloLoading(true)

        // Run the backtest (Monte Carlo will auto-start when modal opens)
        await runBacktest()

        // Reset loading state after backtest completes
        // (Monte Carlo loading is handled internally by the tab)
        setIsMonteCarloLoading(false)
    }

    // Reset Monte Carlo flag when modal closes
    const handleModalClose = () => {
        setShowModal(false)
        setAutoStartMonteCarlo(false)
    }

    return (
        <Layout>
            {/* Full-screen container - Negative margins to counteract Layout padding, then fills viewport */}
            <div className="-mt-20 lg:mt-0 h-screen flex flex-col overflow-hidden bg-white">
                {/* Canvas Area - fills entire space */}
                <div className="flex-1 bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden relative">
                    <div className="absolute inset-0">
                        {/* Canvas Mode - Graph-based Strategy Builder */}
                        <StrategyCanvas
                            hook={tacticalStrategyHook}
                            onRunBacktest={runBacktest}
                            onRunMonteCarlo={runMonteCarlo}
                            isBacktestLoading={loading}
                            isMonteCarloLoading={isMonteCarloLoading}
                            onEdgesChange={setEdges}
                            onNodePositionsChange={setNodePositions}
                            onValidationStatusChange={handleValidationStatusChange}
                            onRestoringStatusChange={setIsCanvasRestoring}
                        />



                        {/* Error Display */}
                        {error && !backtestResult && (
                            <div className="absolute top-4 right-4 w-96 z-40 animate-in slide-in-from-right-5 duration-300">
                                <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800/50 rounded-2xl p-6 shadow-2xl">
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex-shrink-0">
                                                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">
                                                {error.includes('Warning') ? 'Warning' : 'Error'}
                                            </h3>
                                        </div>
                                        <button
                                            onClick={() => setError('')}
                                            className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            aria-label="Dismiss error"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-4">
                                        <p className="text-red-800 dark:text-red-200 text-sm leading-relaxed">{error}</p>
                                    </div>
                                    {/* Auto-dismiss indicator */}
                                    <div className="mt-3 h-1 bg-red-100 dark:bg-red-900/30 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-red-400 dark:bg-red-500 rounded-full animate-shrink-width"
                                            style={{ animationDuration: '8s', animationTimingFunction: 'linear' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}


                    </div>
                </div>
            </div>

            {/* Modals rendered via portal to document.body for true viewport centering */}
            {showModal && createPortal(
                loading ? (
                    // Loading state in modal
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 md:p-8">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-8 md:p-12 shadow-2xl max-w-2xl w-full border border-transparent dark:border-slate-800 transition-all duration-300">
                            <div className="text-center">
                                {/* Logo/Branding */}
                                <div className="mb-6 md:mb-8">
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                        Running Backtest Analysis
                                    </h2>
                                    <p className="text-gray-600 dark:text-slate-400 text-base md:text-lg">
                                        Analyzing your strategy performance...
                                    </p>
                                </div>

                                {/* Animated spinner */}
                                <div className="mb-8 md:mb-10 flex justify-center">
                                    <div className="relative">
                                        <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-gray-100 dark:border-slate-800 rounded-full"></div>
                                        <div className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 border-4 border-transparent border-t-purple-600 dark:border-t-purple-500 rounded-full animate-spin"></div>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full max-w-md mx-auto">
                                    <div className="h-2.5 md:h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 transition-all duration-300 ease-out rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                            style={{ width: `${loadingProgress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-3 md:mt-4 px-1">
                                        <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-slate-500">Processing</span>
                                        <span className="text-base md:text-lg font-bold text-gray-900 dark:text-white tabular-nums">
                                            {loadingProgress}%
                                        </span>
                                    </div>
                                </div>

                                {/* Cancel button */}
                                <button
                                    onClick={() => {
                                        setLoading(false);
                                        setShowModal(false);
                                        setLoadingProgress(0);
                                    }}
                                    className="mt-8 px-6 py-2.5 text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Results state
                    backtestResult && (
                        <BacktestResultsModal
                            result={backtestResult}
                            strategy={strategy}
                            canvasState={{
                                edges: edges,
                                positions: Object.fromEntries(nodePositions),
                            }}
                            onClose={() => {
                                setBacktestResult(null)
                                handleModalClose()
                                setLoadingProgress(0)
                            }}
                            autoStartMonteCarlo={autoStartMonteCarlo}
                            existingStrategyId={loadedStrategyId}
                            existingStrategyName={loadedStrategyName}
                            onStrategySaved={(strategyId, strategyName) => {
                                // Update loaded strategy context after saving
                                setLoadedStrategyId(strategyId);
                                setLoadedStrategyName(strategyName);
                            }}
                        />
                    )
                ),
                document.body
            )}
        </Layout>
    )
}

export default Backtest