// AI Insights / Optimizer Utility Functions

import type { CanvasState } from './types'

/**
 * Merge optimized weights from backend with original strategy structure.
 * The backend already returns complete optimized_dsl with correct weights.
 * This function adds canvas state (positions, edges) which is stored separately.
 */
export const mergeOptimizedWeights = (
    originalStrategy: Record<string, any> | undefined,
    optimizedDsl: Record<string, any>,
    canvasState?: CanvasState
): Record<string, any> => {
    // The backend returns complete optimized_dsl with correct nested structure
    // We just need to add canvas state on top
    const merged = JSON.parse(JSON.stringify(optimizedDsl))

    // Add canvas state if available (stored separately from strategy DSL)
    if (canvasState) {
        merged.canvas_edges = canvasState.edges || []
        merged.canvas_positions = canvasState.positions || {}
        if (canvasState.viewport) {
            merged.canvas_viewport = canvasState.viewport
        }
    } else if (originalStrategy) {
        // Fall back to canvas state from original strategy if available
        if (originalStrategy.canvas_edges) {
            merged.canvas_edges = originalStrategy.canvas_edges
        }
        if (originalStrategy.canvas_positions) {
            merged.canvas_positions = originalStrategy.canvas_positions
        }
        if (originalStrategy.canvas_viewport) {
            merged.canvas_viewport = originalStrategy.canvas_viewport
        }
    }

    // Preserve allocation_order from original if not in optimized
    if (originalStrategy?.allocation_order && !merged.allocation_order) {
        merged.allocation_order = originalStrategy.allocation_order
    }

    return merged
}

/**
 * Safe number helper to handle null/NaN values
 */
export const safeNum = (val: number | null | undefined, defaultVal: number = 0): number => {
    if (val === null || val === undefined || Number.isNaN(val)) return defaultVal
    return val
}

/**
 * Format a decimal value as a percentage with sign
 */
export const formatPercent = (val: number): string => {
    return `${val >= 0 ? '+' : ''}${(val * 100).toFixed(1)}%`
}

/**
 * Format a percentage change value
 */
export const formatChange = (val: number): string => {
    return `${val >= 0 ? '+' : ''}${val.toFixed(0)}%`
}

