import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import {
    listStrategies,
    listDeployments,
    createStrategy,
    deleteStrategy,
    createDeployment,
    updateDeploymentStatus
} from '../services/api'
import {
    queryKeys,
    getStrategiesInitialData,
    cacheStrategiesResponse
} from '../lib/queryClient'
import {
    addStrategyToCache,
    removeStrategyFromCache,
    getCachedStrategy,
} from '../lib/strategiesCache'
import type {
    ListStrategiesParams,
    ListDeploymentsParams,
    CreateStrategyRequest,
    CreateDeploymentRequest,
    UpdateDeploymentStatusRequest,
    ListStrategiesResponse,
    SavedStrategy,
} from '../types/strategy'

// ============================================================================
// QUERY HOOKS
// ============================================================================

export const useStrategies = (params?: ListStrategiesParams, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: queryKeys.strategies.list(params),
        queryFn: async () => {
            const response = await listStrategies(params)
            // Cache the response for instant loading next time
            cacheStrategiesResponse(params, response)
            return response
        },
        staleTime: 5 * 60 * 1000, // 5 minutes - strategies don't change often
        gcTime: 30 * 60 * 1000, // 30 minutes in garbage collection
        placeholderData: (previousData) => {
            // First try previous data (for pagination)
            if (previousData) return previousData
            // Then try localStorage cache for instant loading
            return getStrategiesInitialData(params)
        },
        enabled: options?.enabled ?? true, // Allow disabling the query (e.g., for unauthenticated users)
    })
}

export const useDeployments = (params?: ListDeploymentsParams) => {
    return useQuery({
        queryKey: queryKeys.deployments.list(params),
        queryFn: () => listDeployments(params),
        staleTime: 2 * 60 * 1000, // 2 minutes - deployments may change more frequently
    })
}

// ============================================================================
// MUTATION HOOKS WITH OPTIMISTIC UPDATES
// ============================================================================

export const useCreateStrategy = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (request: CreateStrategyRequest) => createStrategy(request),
        onMutate: async (newStrategy) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: queryKeys.strategies.lists() })

            // Create optimistic strategy object
            const optimisticStrategy: SavedStrategy = {
                strategy_id: `temp-${Date.now()}`, // Temporary ID until server responds
                user_id: '', // Will be set by server
                name: newStrategy.name,
                version: newStrategy.version || 1,
                strategy_dsl: newStrategy.strategy_dsl,
                is_deployed: false,
                risk_level: newStrategy.risk_level || 'balanced',
                tags: newStrategy.tags || [],
                notes: newStrategy.notes,
                canvas_state: newStrategy.canvas_state,
                metrics: newStrategy.metrics,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            // Add to localStorage cache immediately
            addStrategyToCache(optimisticStrategy)

            // Update all list queries optimistically
            queryClient.setQueriesData<ListStrategiesResponse>(
                { queryKey: queryKeys.strategies.lists() },
                (old) => {
                    if (!old) return old
                    return {
                        ...old,
                        strategies: [optimisticStrategy, ...old.strategies],
                        total: old.total + 1,
                    }
                }
            )

            return { optimisticStrategy }
        },
        onSuccess: (response, _variables, context) => {
            // Replace temp ID with real ID in cache
            if (context?.optimisticStrategy) {
                const realStrategy = {
                    ...context.optimisticStrategy,
                    strategy_id: response.strategy_id,
                }

                // Update localStorage cache with real ID
                removeStrategyFromCache(context.optimisticStrategy.strategy_id)
                addStrategyToCache(realStrategy)

                // Update React Query cache
                queryClient.setQueriesData<ListStrategiesResponse>(
                    { queryKey: queryKeys.strategies.lists() },
                    (old) => {
                        if (!old) return old
                        return {
                            ...old,
                            strategies: old.strategies.map(s =>
                                s.strategy_id === context.optimisticStrategy.strategy_id
                                    ? realStrategy
                                    : s
                            ),
                        }
                    }
                )
            }
        },
        onError: (_error, _variables, context) => {
            // Rollback optimistic update on error
            if (context?.optimisticStrategy) {
                removeStrategyFromCache(context.optimisticStrategy.strategy_id)

                queryClient.setQueriesData<ListStrategiesResponse>(
                    { queryKey: queryKeys.strategies.lists() },
                    (old) => {
                        if (!old) return old
                        return {
                            ...old,
                            strategies: old.strategies.filter(
                                s => s.strategy_id !== context.optimisticStrategy.strategy_id
                            ),
                            total: old.total - 1,
                        }
                    }
                )
            }
        },
    })
}

export const useDeleteStrategy = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (strategyId: string) => deleteStrategy(strategyId),
        onMutate: async (strategyId) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: queryKeys.strategies.lists() })

            // Save the strategy being deleted for potential rollback
            const deletedStrategy = getCachedStrategy(strategyId)

            // Remove from localStorage cache immediately
            removeStrategyFromCache(strategyId)

            // Update all list queries optimistically
            queryClient.setQueriesData<ListStrategiesResponse>(
                { queryKey: queryKeys.strategies.lists() },
                (old) => {
                    if (!old) return old
                    return {
                        ...old,
                        strategies: old.strategies.filter(s => s.strategy_id !== strategyId),
                        total: Math.max(0, old.total - 1),
                    }
                }
            )

            return { deletedStrategy }
        },
        onError: (_error, _strategyId, context) => {
            // Rollback: restore the deleted strategy
            if (context?.deletedStrategy) {
                addStrategyToCache(context.deletedStrategy)

                queryClient.setQueriesData<ListStrategiesResponse>(
                    { queryKey: queryKeys.strategies.lists() },
                    (old) => {
                        if (!old) return old
                        return {
                            ...old,
                            strategies: [context.deletedStrategy!, ...old.strategies],
                            total: old.total + 1,
                        }
                    }
                )
            }
        },
    })
}

export const useCreateDeployment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (request: CreateDeploymentRequest) => createDeployment(request),
        onSuccess: () => {
            // Invalidate deployments list
            queryClient.invalidateQueries({ queryKey: queryKeys.deployments.lists() })
            // Update strategies list to reflect deployment status
            queryClient.invalidateQueries({ queryKey: queryKeys.strategies.lists() })
        },
    })
}

export const useUpdateDeploymentStatus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ deploymentId, request }: { deploymentId: string; request: UpdateDeploymentStatusRequest }) =>
            updateDeploymentStatus(deploymentId, request),
        onSuccess: () => {
            // Invalidate deployments list
            queryClient.invalidateQueries({ queryKey: queryKeys.deployments.lists() })
        },
    })
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Prefetch strategies data - useful for anticipated navigation
 */
export const usePrefetchStrategies = () => {
    const queryClient = useQueryClient()

    return useCallback((params?: ListStrategiesParams) => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.strategies.list(params),
            queryFn: async () => {
                const response = await listStrategies(params)
                // Also cache to localStorage for persistence
                cacheStrategiesResponse(params, response)
                return response
            },
            staleTime: 5 * 60 * 1000,
        })
    }, [queryClient])
}

/**
 * Prefetch adjacent pages for smoother pagination
 */
export const usePrefetchAdjacentPages = () => {
    const prefetch = usePrefetchStrategies()

    return useCallback((currentPage: number, totalPages: number, baseParams: Omit<ListStrategiesParams, 'offset'>) => {
        const limit = baseParams.limit || 10

        // Prefetch next page if not on last page
        if (currentPage < totalPages) {
            const nextOffset = currentPage * limit
            prefetch({ ...baseParams, offset: nextOffset })
        }

        // Prefetch previous page if not on first page
        if (currentPage > 1) {
            const prevOffset = (currentPage - 2) * limit
            prefetch({ ...baseParams, offset: prevOffset })
        }
    }, [prefetch])
}

/**
 * Prefetch deployments data
 */
export const usePrefetchDeployments = () => {
    const queryClient = useQueryClient()

    return useCallback((params?: ListDeploymentsParams) => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.deployments.list(params),
            queryFn: () => listDeployments(params),
            staleTime: 2 * 60 * 1000,
        })
    }, [queryClient])
}

/**
 * Hook to get a single strategy from cache (instant) or fetch it
 */
export const useStrategy = (strategyId: string | null) => {
    return useQuery({
        queryKey: queryKeys.strategies.detail(strategyId || ''),
        queryFn: async () => {
            // This would need an API endpoint, for now return from cache
            const cached = getCachedStrategy(strategyId || '')
            if (cached) return cached
            throw new Error('Strategy not found in cache')
        },
        enabled: !!strategyId,
        staleTime: 5 * 60 * 1000,
        initialData: () => {
            // Try to get from cache for instant loading
            return strategyId ? getCachedStrategy(strategyId) ?? undefined : undefined
        },
    })
}