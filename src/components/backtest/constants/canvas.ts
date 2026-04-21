/**
 * Constants for the StrategyCanvas component
 * Centralizes magic numbers and configuration values for maintainability
 */

// Portfolio constraints
export const MAX_PORTFOLIOS_PER_STRATEGY = 6;

// Grid layout for default node positioning
export const GRID_LAYOUT = {
    START_X: 100,
    START_Y: 100,
    COLUMN_SPACING: 350,
    ROW_SPACING: 250,
    COLUMNS: 3, // Number of columns before wrapping to next row
} as const;

// Node duplication offset
export const DUPLICATE_NODE_OFFSET = {
    X: 300,
    Y: 0,
} as const;

// Animation and timing durations (in milliseconds)
export const TIMING = {
    VIEWPORT_RESTORE_DELAY: 150,
    CANVAS_STATE_SETTLE: 100,
    FIT_VIEW_DELAY: 50,
    PRESET_FIT_VIEW_DELAY: 250,
    VIEWPORT_ANIMATION: 200,
    FIT_VIEW_ANIMATION: 300,
} as const;

// Viewport defaults
export const DEFAULT_VIEWPORT = {
    X: 0,
    Y: 0,
    ZOOM: 0.75,
    MIN_ZOOM: 0.5,
    MAX_ZOOM: 2,
} as const;

// Canvas bounds (for translateExtent)
export const CANVAS_BOUNDS = {
    MIN_X: -1000,
    MIN_Y: -1000,
    MAX_X: 3000,
    MAX_Y: 2500,
} as const;

// Default allocation for new portfolios
export const DEFAULT_PORTFOLIO_ALLOCATION = {
    SPY: 1.0,
} as const;

// Edge styling
export const EDGE_COLORS = {
    ARROW: '#8b5cf6', // Purple
} as const;

// Fit view padding
export const FIT_VIEW_PADDING = 0.2;
export const PRESET_FIT_VIEW_PADDING = 0.15;

// Fit view zoom constraints - prevents over-zooming with few nodes
export const FIT_VIEW_MAX_ZOOM = 1; // Never zoom in past 100% when fitting view
export const FIT_VIEW_MIN_ZOOM = 0.5; // Never zoom out past 50%

/**
 * Calculate default position for a new node based on index
 */
export const getDefaultNodePosition = (index: number) => ({
    x: GRID_LAYOUT.START_X + (index % GRID_LAYOUT.COLUMNS) * GRID_LAYOUT.COLUMN_SPACING,
    y: GRID_LAYOUT.START_Y + Math.floor(index / GRID_LAYOUT.COLUMNS) * GRID_LAYOUT.ROW_SPACING,
});

