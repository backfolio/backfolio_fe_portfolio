// ============================================================================
// STRATEGIES CACHE SERVICE
// Provides localStorage persistence and optimistic cache management
// ============================================================================

import type { SavedStrategy, ListStrategiesResponse, ListStrategiesParams } from '../types/strategy'

const CACHE_KEY_PREFIX = 'backfolio_strategies_'
const CACHE_VERSION = 'v1'
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes

interface CacheEntry<T> {
    data: T
    timestamp: number
    version: string
}

interface StrategiesCache {
    strategies: Map<string, SavedStrategy> // strategy_id -> strategy
    listResponses: Map<string, CacheEntry<ListStrategiesResponse>> // serialized params -> response
    lastFullSync: number | null
}

// In-memory cache for fast access
let memoryCache: StrategiesCache = {
    strategies: new Map(),
    listResponses: new Map(),
    lastFullSync: null,
}

// ============================================================================
// LOCAL STORAGE HELPERS
// ============================================================================

const getStorageKey = (suffix: string) => `${CACHE_KEY_PREFIX}${CACHE_VERSION}_${suffix}`

const saveToStorage = (key: string, data: unknown) => {
    try {
        localStorage.setItem(getStorageKey(key), JSON.stringify(data))
    } catch (error) {
        // localStorage might be full or disabled
        console.warn('[StrategiesCache] Failed to save to localStorage:', error)
    }
}

const loadFromStorage = <T>(key: string): T | null => {
    try {
        const stored = localStorage.getItem(getStorageKey(key))
        if (stored) {
            return JSON.parse(stored) as T
        }
    } catch (error) {
        console.warn('[StrategiesCache] Failed to load from localStorage:', error)
    }
    return null
}

const clearStorageKey = (key: string) => {
    try {
        localStorage.removeItem(getStorageKey(key))
    } catch (error) {
        console.warn('[StrategiesCache] Failed to clear localStorage:', error)
    }
}

// ============================================================================
// PARAM SERIALIZATION
// ============================================================================

const serializeParams = (params?: ListStrategiesParams): string => {
    if (!params) return 'default'
    return JSON.stringify(params, Object.keys(params).sort())
}

// ============================================================================
// CACHE INITIALIZATION
// ============================================================================

export const initializeCache = (): void => {
    // Load strategies map from storage
    const storedStrategies = loadFromStorage<[string, SavedStrategy][]>('strategies_map')
    if (storedStrategies) {
        memoryCache.strategies = new Map(storedStrategies)
    }

    // Load list responses from storage
    const storedListResponses = loadFromStorage<[string, CacheEntry<ListStrategiesResponse>][]>('list_responses')
    if (storedListResponses) {
        memoryCache.listResponses = new Map(storedListResponses)
    }

    // Load last sync timestamp
    const lastSync = loadFromStorage<number>('last_sync')
    if (lastSync) {
        memoryCache.lastFullSync = lastSync
    }

    console.log('[StrategiesCache] Initialized with', memoryCache.strategies.size, 'cached strategies')
}

// Initialize on module load
if (typeof window !== 'undefined') {
    initializeCache()
}

// ============================================================================
// CACHE PERSISTENCE
// ============================================================================

const persistStrategiesMap = () => {
    saveToStorage('strategies_map', Array.from(memoryCache.strategies.entries()))
}

const persistListResponses = () => {
    // Only persist recent list responses
    const entries = Array.from(memoryCache.listResponses.entries())
        .filter(([, entry]) => Date.now() - entry.timestamp < CACHE_TTL_MS)
    saveToStorage('list_responses', entries)
}

// ============================================================================
// CACHE OPERATIONS
// ============================================================================

/**
 * Check if a cached list response is still valid
 */
export const isListCacheValid = (params?: ListStrategiesParams): boolean => {
    const key = serializeParams(params)
    const entry = memoryCache.listResponses.get(key)
    if (!entry) return false
    return Date.now() - entry.timestamp < CACHE_TTL_MS
}

/**
 * Get cached list response
 */
export const getCachedListResponse = (params?: ListStrategiesParams): ListStrategiesResponse | null => {
    const key = serializeParams(params)
    const entry = memoryCache.listResponses.get(key)
    if (!entry) return null

    // Check if cache is still valid
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        memoryCache.listResponses.delete(key)
        return null
    }

    return entry.data
}

/**
 * Cache a list response
 */
export const cacheListResponse = (params: ListStrategiesParams | undefined, response: ListStrategiesResponse): void => {
    const key = serializeParams(params)
    memoryCache.listResponses.set(key, {
        data: response,
        timestamp: Date.now(),
        version: CACHE_VERSION,
    })

    // Also cache individual strategies
    response.strategies.forEach(strategy => {
        memoryCache.strategies.set(strategy.strategy_id, strategy)
    })

    // Persist to storage
    persistStrategiesMap()
    persistListResponses()
}

/**
 * Get a single cached strategy by ID
 */
export const getCachedStrategy = (strategyId: string): SavedStrategy | null => {
    return memoryCache.strategies.get(strategyId) || null
}

/**
 * Cache a single strategy
 */
export const cacheStrategy = (strategy: SavedStrategy): void => {
    memoryCache.strategies.set(strategy.strategy_id, strategy)
    persistStrategiesMap()
}

/**
 * Add a new strategy to cache (optimistic update)
 * Updates all relevant list caches
 */
export const addStrategyToCache = (strategy: SavedStrategy): void => {
    // Add to strategies map
    memoryCache.strategies.set(strategy.strategy_id, strategy)

    // Update list responses - add to beginning of each list
    memoryCache.listResponses.forEach((entry, key) => {
        const updatedData = { ...entry.data }
        updatedData.strategies = [strategy, ...updatedData.strategies]
        updatedData.total += 1
        updatedData.pages = Math.ceil(updatedData.total / 10) // Assuming 10 per page

        memoryCache.listResponses.set(key, {
            ...entry,
            data: updatedData,
        })
    })

    // Persist changes
    persistStrategiesMap()
    persistListResponses()
}

/**
 * Remove a strategy from cache (optimistic update)
 */
export const removeStrategyFromCache = (strategyId: string): void => {
    // Remove from strategies map
    memoryCache.strategies.delete(strategyId)

    // Update list responses - remove from each list
    memoryCache.listResponses.forEach((entry, key) => {
        const updatedData = { ...entry.data }
        updatedData.strategies = updatedData.strategies.filter(s => s.strategy_id !== strategyId)
        updatedData.total = Math.max(0, updatedData.total - 1)
        updatedData.pages = Math.max(1, Math.ceil(updatedData.total / 10))

        memoryCache.listResponses.set(key, {
            ...entry,
            data: updatedData,
        })
    })

    // Persist changes
    persistStrategiesMap()
    persistListResponses()
}

/**
 * Update a strategy in cache
 */
export const updateStrategyInCache = (strategyId: string, updates: Partial<SavedStrategy>): void => {
    const existing = memoryCache.strategies.get(strategyId)
    if (existing) {
        const updated = { ...existing, ...updates }
        memoryCache.strategies.set(strategyId, updated)

        // Update in list responses
        memoryCache.listResponses.forEach((entry, key) => {
            const updatedData = { ...entry.data }
            updatedData.strategies = updatedData.strategies.map(s =>
                s.strategy_id === strategyId ? { ...s, ...updates } : s
            )
            memoryCache.listResponses.set(key, {
                ...entry,
                data: updatedData,
            })
        })

        persistStrategiesMap()
        persistListResponses()
    }
}

/**
 * Invalidate all list caches (force refetch on next query)
 */
export const invalidateListCaches = (): void => {
    memoryCache.listResponses.clear()
    clearStorageKey('list_responses')
}

/**
 * Clear all caches
 */
export const clearAllCaches = (): void => {
    memoryCache = {
        strategies: new Map(),
        listResponses: new Map(),
        lastFullSync: null,
    }
    clearStorageKey('strategies_map')
    clearStorageKey('list_responses')
    clearStorageKey('last_sync')
}

/**
 * Get all cached strategies as an array
 */
export const getAllCachedStrategies = (): SavedStrategy[] => {
    return Array.from(memoryCache.strategies.values())
}

/**
 * Get cache statistics for debugging
 */
export const getCacheStats = () => {
    return {
        strategiesCount: memoryCache.strategies.size,
        listResponsesCount: memoryCache.listResponses.size,
        lastFullSync: memoryCache.lastFullSync,
        cacheVersion: CACHE_VERSION,
    }
}

