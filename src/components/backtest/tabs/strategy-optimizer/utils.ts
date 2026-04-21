// Strategy Optimizer Utilities

import type { StrategyDSL } from '../../../../types/strategy'
import type { StrategyInfo, OptimizerMode, CanvasState } from './types'

/**
 * Analyze strategy to determine what optimization modes are available
 * and which is recommended.
 */
export function analyzeStrategy(
    strategyDsl: StrategyDSL | Record<string, any> | undefined
): StrategyInfo {
    const defaultInfo: StrategyInfo = {
        numPortfolios: 0,
        portfolioNames: [],
        hasMultipleAssets: false,
        hasSwitchingLogic: false,
        canOptimizeAllocations: false,
        canOptimizeRules: false,
        recommendedMode: 'allocations',
        recommendation: 'Add portfolios to your strategy to enable optimization.'
    }

    if (!strategyDsl || !strategyDsl.allocations) {
        return defaultInfo
    }

    const allocations = strategyDsl.allocations as Record<string, any>
    const portfolioNames = Object.keys(allocations)
    const numPortfolios = portfolioNames.length

    // Check if any portfolio has multiple assets
    let hasMultipleAssets = false
    for (const name of portfolioNames) {
        const alloc = allocations[name]
        const weights = alloc?.allocation || alloc
        if (typeof weights === 'object' && Object.keys(weights).length >= 2) {
            hasMultipleAssets = true
            break
        }
    }

    // Check for existing entry_condition in allocations (CLEAN API V4.0)
    let hasSwitchingLogic = false
    for (const name of portfolioNames) {
        const alloc = allocations[name]
        if (alloc?.entry_condition) {
            hasSwitchingLogic = true
            break
        }
    }

    // Determine available modes
    const canOptimizeAllocations = hasMultipleAssets
    const canOptimizeRules = numPortfolios >= 2

    // Determine recommended mode
    let recommendedMode: OptimizerMode = 'allocations'
    let recommendation = ''

    if (numPortfolios === 0) {
        recommendation = 'Add portfolios to your strategy to enable optimization.'
    } else if (numPortfolios === 1) {
        if (hasMultipleAssets) {
            recommendedMode = 'allocations'
            recommendation = 'Single portfolio with multiple assets - optimize allocation weights.'
        } else {
            recommendation = 'Add more assets to your portfolio or create additional portfolios.'
        }
    } else {
        // 2+ portfolios
        if (hasMultipleAssets) {
            recommendedMode = 'full'
            recommendation = 'Multiple portfolios with diversified assets - full optimization recommended for maximum gains.'
        } else {
            recommendedMode = 'rules'
            recommendation = 'Multiple portfolios detected - discover when to switch between them.'
        }
    }

    return {
        numPortfolios,
        portfolioNames,
        hasMultipleAssets,
        hasSwitchingLogic,
        canOptimizeAllocations,
        canOptimizeRules,
        recommendedMode,
        recommendation
    }
}

/**
 * Get portfolio tickers for signal selection
 */
export function getPortfolioTickers(
    strategyDsl: StrategyDSL | Record<string, any> | undefined
): Record<string, string[]> {
    const result: Record<string, string[]> = {}
    
    if (!strategyDsl?.allocations) return result
    
    const allocations = strategyDsl.allocations as Record<string, any>
    for (const [name, alloc] of Object.entries(allocations)) {
        const weights = (alloc as any)?.allocation || alloc
        if (typeof weights === 'object') {
            result[name] = Object.keys(weights)
        }
    }
    
    return result
}

/**
 * Get the first (or most significant) ticker in a portfolio
 */
export function getPrimaryTicker(
    strategyDsl: StrategyDSL | Record<string, any> | undefined,
    portfolioName: string
): string | null {
    if (!strategyDsl?.allocations) return null
    
    const allocations = strategyDsl.allocations as Record<string, any>
    const alloc = allocations[portfolioName]
    if (!alloc) return null
    
    const weights = alloc?.allocation || alloc
    if (typeof weights !== 'object') return null
    
    // Return ticker with highest weight
    const entries = Object.entries(weights) as [string, number][]
    if (entries.length === 0) return null
    
    entries.sort((a, b) => (b[1] || 0) - (a[1] || 0))
    return entries[0][0]
}

/**
 * Safe number conversion
 */
export function safeNum(value: any, defaultValue: number = 0): number {
    if (value === null || value === undefined) return defaultValue
    const num = Number(value)
    if (isNaN(num) || !isFinite(num)) return defaultValue
    return num
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number): string {
    return `${(value * 100).toFixed(1)}%`
}

/**
 * Format change percentage with sign
 */
export function formatChange(value: number): string {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
}

/**
 * Merge optimized weights into the original strategy DSL
 * 
 * CLEAN API V4.0:
 * - entry_condition is embedded directly in each allocation
 * - No more switching_logic or allocation_rules arrays
 * - Preserves: canvas state, rebalancing_frequency, and entry_condition
 */
export function mergeOptimizedWeights(
    originalStrategy: Record<string, any> | undefined,
    optimizedDsl: Record<string, any>,
    canvasState?: CanvasState
): Record<string, any> {
    // If no original, just return the optimized with canvas state
    if (!originalStrategy) {
        return {
            ...optimizedDsl,
            canvas_edges: canvasState?.edges || [],
            canvas_positions: canvasState?.positions || {},
            canvas_viewport: canvasState?.viewport
        }
    }

    // Start with a copy of the original to preserve all structure
    const merged: Record<string, any> = JSON.parse(JSON.stringify(originalStrategy))
    
    // Always preserve canvas state from canvasState param or original
    merged.canvas_edges = canvasState?.edges || originalStrategy.canvas_edges || []
    merged.canvas_positions = canvasState?.positions || originalStrategy.canvas_positions || {}
    merged.canvas_viewport = canvasState?.viewport || originalStrategy.canvas_viewport

    // Selectively merge from optimizedDsl - only take what we need
    // CLEAN API V4.0: allocation_order and fallback_allocation are the key fields
    const fieldsToUpdate = ['fallback_allocation', 'allocation_order', 'start_date', 'end_date']
    for (const field of fieldsToUpdate) {
        if (optimizedDsl[field] !== undefined) {
            merged[field] = optimizedDsl[field]
        }
    }

    // Merge allocations - preserve structure, update weights AND entry_condition
    // CLEAN API V4.0: entry_condition is embedded in each allocation
    if (optimizedDsl.allocations && originalStrategy.allocations) {
        merged.allocations = {}
        
        // First, copy all original allocations with their full structure
        for (const [name, origAlloc] of Object.entries(originalStrategy.allocations as Record<string, any>)) {
            merged.allocations[name] = JSON.parse(JSON.stringify(origAlloc))
            // Remove old entry_condition - we'll copy from optimized if present
            delete merged.allocations[name].entry_condition
        }
        
        // Then update from optimized DSL
        for (const [name, optAlloc] of Object.entries(optimizedDsl.allocations as Record<string, any>)) {
            const origAlloc = (originalStrategy.allocations as Record<string, any>)[name]
            
            // Get the optimized weights (handle both nested and flat formats)
            const optWeights = (optAlloc as any)?.allocation || optAlloc
            
            // Get original rebalancing frequency, default to 'none'
            let rebalancingFreq = 'none'
            if (origAlloc && typeof origAlloc === 'object') {
                if ('rebalancing_frequency' in origAlloc) {
                    rebalancingFreq = origAlloc.rebalancing_frequency
                } else if ('allocation' in origAlloc) {
                    rebalancingFreq = origAlloc.rebalancing_frequency || 'none'
                }
            }
            
            // Create proper nested structure with entry_condition from optimized DSL
            merged.allocations[name] = {
                allocation: optWeights,
                rebalancing_frequency: rebalancingFreq
            }
            
            // CLEAN API V4.0: Copy entry_condition from optimized if present
            const optEntryCondition = (optAlloc as any)?.entry_condition
            if (optEntryCondition) {
                merged.allocations[name].entry_condition = optEntryCondition
            }
        }
    } else if (optimizedDsl.allocations) {
        // No original allocations, but we have optimized ones - ensure proper structure
        merged.allocations = {}
        for (const [name, optAlloc] of Object.entries(optimizedDsl.allocations as Record<string, any>)) {
            const optWeights = (optAlloc as any)?.allocation || optAlloc
            merged.allocations[name] = {
                allocation: optWeights,
                rebalancing_frequency: (optAlloc as any)?.rebalancing_frequency || 'none'
            }
            
            // Copy entry_condition if present
            const optEntryCondition = (optAlloc as any)?.entry_condition
            if (optEntryCondition) {
                merged.allocations[name].entry_condition = optEntryCondition
            }
        }
    }

    return merged
}

/**
 * Merge rules into strategy DSL (for rules optimizer results)
 * 
 * CLEAN API V4.0: entry_condition is now embedded in allocations,
 * so this just delegates to mergeOptimizedWeights which handles everything.
 */
export function mergeRulesIntoStrategy(
    originalStrategy: Record<string, any> | undefined,
    optimizedDsl: Record<string, any>,
    canvasState?: CanvasState
): Record<string, any> {
    // mergeOptimizedWeights now handles entry_condition in allocations
    return mergeOptimizedWeights(originalStrategy, optimizedDsl, canvasState)
}

