/**
 * useRuleLibrary Hook
 * 
 * Manages the user's rule library - saved switching rules that can be reused
 * across multiple strategies.
 * 
 * Uses React Query for:
 * - Request deduplication (multiple components share the same cached data)
 * - Automatic caching (no redundant API calls)
 * - Optimistic updates for instant UI feedback
 * 
 * For unauthenticated users:
 * - Rules are stored in sessionStorage (ephemeral, cleared on browser close)
 * - Rules are marked with isEphemeral: true
 * - Full CRUD operations are supported locally
 */

import { useCallback, useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    SavedRule,
    RuleCategory,
    Condition,
    CompositeCondition,
    ListRulesParams,
    ListRulesResponse,
} from '../types/strategy'
import {
    listRules,
    createRule,
    updateRule,
    deleteRule,
    duplicateRule,
} from '../services/api'
import { queryKeys } from '../lib/queryClient'
import { useAuth } from '../context/AuthContext'

// Session storage key for ephemeral rules
const EPHEMERAL_RULES_KEY = 'backfolio_ephemeral_rules'

// Helper to get ephemeral rules from sessionStorage
const getEphemeralRules = (): SavedRule[] => {
    try {
        const stored = sessionStorage.getItem(EPHEMERAL_RULES_KEY)
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

// Helper to save ephemeral rules to sessionStorage
const setEphemeralRules = (rules: SavedRule[]) => {
    try {
        sessionStorage.setItem(EPHEMERAL_RULES_KEY, JSON.stringify(rules))
    } catch (e) {
        console.error('Failed to save ephemeral rules:', e)
    }
}

export interface UseRuleLibraryReturn {
    // State
    rules: SavedRule[]
    isLoading: boolean
    error: string | null
    totalRules: number
    /** Whether rules are ephemeral (unauthenticated user) */
    isEphemeral: boolean

    // Actions
    fetchRules: (params?: ListRulesParams) => Promise<void>
    saveRule: (
        name: string,
        condition: Condition | CompositeCondition,
        options?: {
            description?: string
            category?: RuleCategory
            tags?: string[]
        }
    ) => Promise<SavedRule | null>
    modifyRule: (
        ruleId: string,
        updates: {
            name?: string
            description?: string
            condition?: Condition | CompositeCondition
            category?: RuleCategory
            tags?: string[]
        }
    ) => Promise<SavedRule | null>
    removeRule: (ruleId: string) => Promise<boolean>
    copyRule: (ruleId: string) => Promise<SavedRule | null>
    clearError: () => void
}

export function useRuleLibrary(): UseRuleLibraryReturn {
    const queryClient = useQueryClient()
    const { isAuthenticated } = useAuth()

    // Ephemeral rules state for unauthenticated users
    const [ephemeralRules, setEphemeralRulesState] = useState<SavedRule[]>(() => getEphemeralRules())

    // Sync ephemeral rules from sessionStorage on mount
    useEffect(() => {
        if (!isAuthenticated) {
            setEphemeralRulesState(getEphemeralRules())
        }
    }, [isAuthenticated])

    // Fetch rules using React Query - automatically deduplicated and cached
    // Only fetch if user is authenticated - unauthenticated users use ephemeral rules
    const {
        data: rulesData,
        isLoading: isLoadingApi,
        error: queryError,
        refetch,
    } = useQuery({
        queryKey: queryKeys.rules.list(),
        queryFn: () => listRules(),
        staleTime: 5 * 60 * 1000, // 5 minutes - rules don't change often
        gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
        enabled: isAuthenticated, // Only fetch when authenticated
    })

    // Use API rules for authenticated users, ephemeral rules for unauthenticated
    const rules = isAuthenticated ? (rulesData?.rules || []) : ephemeralRules
    const totalRules = isAuthenticated ? (rulesData?.total || 0) : ephemeralRules.length
    const isLoading = isAuthenticated ? isLoadingApi : false
    // Don't show error for unauthenticated users
    const error = isAuthenticated ? (queryError?.message || null) : null
    const isEphemeral = !isAuthenticated

    // Fetch rules manually (for retry scenarios)
    const fetchRules = useCallback(async (_params?: ListRulesParams) => {
        await refetch()
    }, [refetch])

    // Create rule mutation with optimistic update
    const createRuleMutation = useMutation({
        mutationFn: async ({
            name,
            condition,
            options,
        }: {
            name: string
            condition: Condition | CompositeCondition
            options?: {
                description?: string
                category?: RuleCategory
                tags?: string[]
            }
        }) => {
            return createRule({
                name,
                condition,
                description: options?.description,
                category: options?.category,
                tags: options?.tags,
            })
        },
        onMutate: async ({ name, condition, options }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: queryKeys.rules.lists() })

            // Snapshot previous data
            const previousRules = queryClient.getQueryData<ListRulesResponse>(queryKeys.rules.list())

            // Create optimistic rule
            const optimisticRule: SavedRule = {
                id: `temp-${Date.now()}`,
                name,
                description: options?.description || '',
                condition,
                condition_summary: '',
                category: options?.category || 'custom',
                tags: options?.tags || [],
                usage_count: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            // Optimistically update cache
            queryClient.setQueryData<ListRulesResponse>(queryKeys.rules.list(), (old) => {
                if (!old) return old
                return {
                    ...old,
                    rules: [optimisticRule, ...old.rules],
                    total: old.total + 1,
                }
            })

            return { previousRules, optimisticRule }
        },
        onSuccess: (response, _variables, context) => {
            // Replace temp ID with real ID
            if (context?.optimisticRule) {
                const realRule: SavedRule = {
                    ...context.optimisticRule,
                    id: response.rule_id,
                    created_at: response.created_at,
                    updated_at: response.created_at,
                }

                queryClient.setQueryData<ListRulesResponse>(queryKeys.rules.list(), (old) => {
                    if (!old) return old
                    return {
                        ...old,
                        rules: old.rules.map(r =>
                            r.id === context.optimisticRule.id ? realRule : r
                        ),
                    }
                })
            }
        },
        onError: (_error, _variables, context) => {
            // Rollback on error
            if (context?.previousRules) {
                queryClient.setQueryData(queryKeys.rules.list(), context.previousRules)
            }
        },
    })

    // Generate condition summary for display
    const generateConditionSummary = (condition: Condition | CompositeCondition): string => {
        if ('left' in condition && 'right' in condition && 'comparison' in condition) {
            const c = condition as Condition
            const leftStr = c.left.type === 'Price'
                ? `Price(${c.left.symbol})`
                : c.left.type === 'constant'
                    ? String((c.left as any).value)
                    : `${c.left.type}(${c.left.symbol},${(c.left as any).window})`
            const rightStr = c.right.type === 'Price'
                ? `Price(${c.right.symbol})`
                : c.right.type === 'constant'
                    ? String((c.right as any).value)
                    : `${c.right.type}(${c.right.symbol},${(c.right as any).window})`
            return `${leftStr} ${c.comparison} ${rightStr}`
        }
        return 'Complex condition'
    }

    // Save a new rule
    const saveRule = useCallback(async (
        name: string,
        condition: Condition | CompositeCondition,
        options?: {
            description?: string
            category?: RuleCategory
            tags?: string[]
        }
    ): Promise<SavedRule | null> => {
        // For unauthenticated users, save to sessionStorage
        if (!isAuthenticated) {
            const newRule: SavedRule = {
                id: `ephemeral-${Date.now()}`,
                name,
                description: options?.description || '',
                condition,
                condition_summary: generateConditionSummary(condition),
                category: options?.category || 'custom',
                tags: options?.tags || [],
                usage_count: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            const updatedRules = [newRule, ...ephemeralRules]
            setEphemeralRulesState(updatedRules)
            setEphemeralRules(updatedRules)
            return newRule
        }

        // For authenticated users, use API
        try {
            const result = await createRuleMutation.mutateAsync({ name, condition, options })

            // Return the created rule
            return {
                id: result.rule_id,
                name: result.name,
                description: options?.description || '',
                condition,
                condition_summary: '',
                category: options?.category || 'custom',
                tags: options?.tags || [],
                usage_count: 0,
                created_at: result.created_at,
                updated_at: result.created_at,
            }
        } catch (err) {
            console.error('Error saving rule:', err)
            return null
        }
    }, [createRuleMutation, isAuthenticated, ephemeralRules])

    // Update rule mutation with optimistic update
    const updateRuleMutation = useMutation({
        mutationFn: async ({
            ruleId,
            updates,
        }: {
            ruleId: string
            updates: {
                name?: string
                description?: string
                condition?: Condition | CompositeCondition
                category?: RuleCategory
                tags?: string[]
            }
        }) => {
            return updateRule(ruleId, updates)
        },
        onMutate: async ({ ruleId, updates }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.rules.lists() })
            const previousRules = queryClient.getQueryData<ListRulesResponse>(queryKeys.rules.list())

            queryClient.setQueryData<ListRulesResponse>(queryKeys.rules.list(), (old) => {
                if (!old) return old
                return {
                    ...old,
                    rules: old.rules.map(r =>
                        r.id === ruleId ? { ...r, ...updates, updated_at: new Date().toISOString() } : r
                    ),
                }
            })

            return { previousRules }
        },
        onError: (_error, _variables, context) => {
            if (context?.previousRules) {
                queryClient.setQueryData(queryKeys.rules.list(), context.previousRules)
            }
        },
    })

    // Modify an existing rule
    const modifyRule = useCallback(async (
        ruleId: string,
        updates: {
            name?: string
            description?: string
            condition?: Condition | CompositeCondition
            category?: RuleCategory
            tags?: string[]
        }
    ): Promise<SavedRule | null> => {
        // For unauthenticated users, update in sessionStorage
        if (!isAuthenticated) {
            const updatedRules = ephemeralRules.map(r => {
                if (r.id === ruleId) {
                    const updated = {
                        ...r,
                        ...updates,
                        condition_summary: updates.condition
                            ? generateConditionSummary(updates.condition)
                            : r.condition_summary,
                        updated_at: new Date().toISOString(),
                    }
                    return updated
                }
                return r
            })
            setEphemeralRulesState(updatedRules)
            setEphemeralRules(updatedRules)
            return updatedRules.find(r => r.id === ruleId) || null
        }

        // For authenticated users, use API
        try {
            await updateRuleMutation.mutateAsync({ ruleId, updates })

            // Return the updated rule from cache
            const currentData = queryClient.getQueryData<ListRulesResponse>(queryKeys.rules.list())
            return currentData?.rules.find(r => r.id === ruleId) || null
        } catch (err) {
            console.error('Error updating rule:', err)
            return null
        }
    }, [updateRuleMutation, queryClient, isAuthenticated, ephemeralRules])

    // Delete rule mutation with optimistic update
    const deleteRuleMutation = useMutation({
        mutationFn: (ruleId: string) => deleteRule(ruleId),
        onMutate: async (ruleId) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.rules.lists() })
            const previousRules = queryClient.getQueryData<ListRulesResponse>(queryKeys.rules.list())
            const deletedRule = previousRules?.rules.find(r => r.id === ruleId)

            queryClient.setQueryData<ListRulesResponse>(queryKeys.rules.list(), (old) => {
                if (!old) return old
                return {
                    ...old,
                    rules: old.rules.filter(r => r.id !== ruleId),
                    total: Math.max(0, old.total - 1),
                }
            })

            return { previousRules, deletedRule }
        },
        onError: (_error, _ruleId, context) => {
            if (context?.previousRules) {
                queryClient.setQueryData(queryKeys.rules.list(), context.previousRules)
            }
        },
    })

    // Remove a rule
    const removeRule = useCallback(async (ruleId: string): Promise<boolean> => {
        // For unauthenticated users, remove from sessionStorage
        if (!isAuthenticated) {
            const updatedRules = ephemeralRules.filter(r => r.id !== ruleId)
            setEphemeralRulesState(updatedRules)
            setEphemeralRules(updatedRules)
            return true
        }

        // For authenticated users, use API
        try {
            await deleteRuleMutation.mutateAsync(ruleId)
            return true
        } catch (err) {
            console.error('Error deleting rule:', err)
            return false
        }
    }, [deleteRuleMutation, isAuthenticated, ephemeralRules])

    // Duplicate rule mutation
    const duplicateRuleMutation = useMutation({
        mutationFn: (ruleId: string) => duplicateRule(ruleId),
        onSuccess: (response, ruleId) => {
            // Get the original rule to create the duplicate
            const currentData = queryClient.getQueryData<ListRulesResponse>(queryKeys.rules.list())
            const original = currentData?.rules.find(r => r.id === ruleId)

            if (original) {
                const newRule: SavedRule = {
                    ...original,
                    id: response.new_rule_id,
                    name: response.name,
                    usage_count: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }

                queryClient.setQueryData<ListRulesResponse>(queryKeys.rules.list(), (old) => {
                    if (!old) return old
                    return {
                        ...old,
                        rules: [newRule, ...old.rules],
                        total: old.total + 1,
                    }
                })
            }
        },
    })

    // Duplicate a rule
    const copyRule = useCallback(async (ruleId: string): Promise<SavedRule | null> => {
        // For unauthenticated users, duplicate in sessionStorage
        if (!isAuthenticated) {
            const original = ephemeralRules.find(r => r.id === ruleId)
            if (!original) return null

            const newRule: SavedRule = {
                ...original,
                id: `ephemeral-${Date.now()}`,
                name: `${original.name} (copy)`,
                usage_count: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            const updatedRules = [newRule, ...ephemeralRules]
            setEphemeralRulesState(updatedRules)
            setEphemeralRules(updatedRules)
            return newRule
        }

        // For authenticated users, use API
        try {
            const response = await duplicateRuleMutation.mutateAsync(ruleId)

            // Get the duplicated rule from cache
            const currentData = queryClient.getQueryData<ListRulesResponse>(queryKeys.rules.list())
            return currentData?.rules.find(r => r.id === response.new_rule_id) || null
        } catch (err) {
            console.error('Error duplicating rule:', err)
            return null
        }
    }, [duplicateRuleMutation, queryClient, isAuthenticated, ephemeralRules])

    // Clear error (no-op now since React Query manages errors)
    const clearError = useCallback(() => {
        // React Query manages error state automatically
    }, [])

    return {
        rules,
        isLoading,
        error,
        totalRules,
        isEphemeral,
        fetchRules,
        saveRule,
        modifyRule,
        removeRule,
        copyRule,
        clearError,
    }
}
