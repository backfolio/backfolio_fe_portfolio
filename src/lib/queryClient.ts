import { QueryClient } from '@tanstack/react-query'
import {
    getCachedListResponse,
    cacheListResponse,
    isListCacheValid,
} from './strategiesCache'
import type { ListStrategiesParams, ListStrategiesResponse } from '../types/strategy'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Cache strategies and deployments for 5 minutes
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 30 * 60 * 1000, // 30 minutes (increased for better persistence)
            retry: (failureCount, error) => {
                // Don't retry on 401/403 (auth errors)
                if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
                    return false
                }
                return failureCount < 3
            },
            refetchOnWindowFocus: false,
            refetchOnMount: true, // Only refetch if stale
            networkMode: 'offlineFirst', // Show cached data immediately
        },
        mutations: {
            retry: 1
        }
    }
})

// ============================================================================
// STRATEGIES CACHE INTEGRATION
// Provides instant loading from localStorage cache
// ============================================================================

/**
 * Get initial data for strategies query from localStorage cache
 * This enables instant UI rendering before network request completes
 */
export const getStrategiesInitialData = (params?: ListStrategiesParams): ListStrategiesResponse | undefined => {
    const cached = getCachedListResponse(params)
    if (cached) {
        return cached
    }
    return undefined
}

/**
 * Determine if we should skip refetch based on cache validity
 */
export const shouldSkipStrategiesRefetch = (params?: ListStrategiesParams): boolean => {
    return isListCacheValid(params)
}

/**
 * Cache strategies response after successful fetch
 */
export const cacheStrategiesResponse = (params: ListStrategiesParams | undefined, data: ListStrategiesResponse): void => {
    cacheListResponse(params, data)
}

// Query keys factory for consistency
export const queryKeys = {
    strategies: {
        all: ['strategies'] as const,
        lists: () => [...queryKeys.strategies.all, 'list'] as const,
        list: (params?: any) => [...queryKeys.strategies.lists(), params] as const,
        details: () => [...queryKeys.strategies.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.strategies.details(), id] as const,
    },
    deployments: {
        all: ['deployments'] as const,
        lists: () => [...queryKeys.deployments.all, 'list'] as const,
        list: (params?: any) => [...queryKeys.deployments.lists(), params] as const,
        details: () => [...queryKeys.deployments.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.deployments.details(), id] as const,
    },
    rules: {
        all: ['rules'] as const,
        lists: () => [...queryKeys.rules.all, 'list'] as const,
        list: (params?: any) => [...queryKeys.rules.lists(), params] as const,
        details: () => [...queryKeys.rules.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.rules.details(), id] as const,
    },
} as const