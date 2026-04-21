import { useState, useEffect, useRef, useCallback } from 'react'
import { searchStocks, StockSearchResult } from '../services/api'

interface UseTickerSearchOptions {
    debounceMs?: number
    minQueryLength?: number
    maxResults?: number
}

interface UseTickerSearchReturn {
    query: string
    setQuery: (query: string) => void
    results: StockSearchResult[]
    isLoading: boolean
    error: string | null
    clearResults: () => void
}

/**
 * Hook for searching stocks/ETFs with debouncing
 * 
 * @example
 * ```tsx
 * const { query, setQuery, results, isLoading } = useTickerSearch({
 *     debounceMs: 300,
 *     minQueryLength: 1,
 *     maxResults: 8
 * })
 * ```
 */
export function useTickerSearch(options: UseTickerSearchOptions = {}): UseTickerSearchReturn {
    const {
        debounceMs = 300,
        minQueryLength = 1,
        maxResults = 8,
    } = options

    const [query, setQuery] = useState('')
    const [results, setResults] = useState<StockSearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const abortControllerRef = useRef<AbortController | null>(null)

    const clearResults = useCallback(() => {
        setResults([])
        setError(null)
    }, [])

    useEffect(() => {
        // Clear previous timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        // Don't search if query is too short
        if (query.length < minQueryLength) {
            setResults([])
            setIsLoading(false)
            setError(null)
            return
        }

        setIsLoading(true)
        setError(null)

        // Debounce the search
        debounceTimerRef.current = setTimeout(async () => {
            try {
                // Create new abort controller for this request
                abortControllerRef.current = new AbortController()

                const response = await searchStocks(query, maxResults)
                setResults(response.results)
                setError(null)
            } catch (err) {
                // Ignore abort errors
                if (err instanceof Error && err.name === 'AbortError') {
                    return
                }
                console.error('Stock search error:', err)
                setError(err instanceof Error ? err.message : 'Search failed')
                setResults([])
            } finally {
                setIsLoading(false)
            }
        }, debounceMs)

        // Cleanup on unmount
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [query, debounceMs, minQueryLength, maxResults])

    return {
        query,
        setQuery,
        results,
        isLoading,
        error,
        clearResults,
    }
}

