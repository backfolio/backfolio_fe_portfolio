// ============================================================================
// API SERVICE - BACKTESTING API V3.0
// ============================================================================

import type {
    BacktestRequest,
    BacktestResult,
    CreateStrategyRequest,
    CreateStrategyResponse,
    ListStrategiesParams,
    ListStrategiesResponse,
    GetStrategyResponse,
    UpdateStrategyRequest,
    UpdateStrategyResponse,
    DuplicateStrategyResponse,
    CreateDeploymentRequest,
    CreateDeploymentResponse,
    ListDeploymentsParams,
    ListDeploymentsResponse,
    GetDeploymentResponse,
    UpdateDeploymentStatusRequest,
    UpdateDeploymentStatusResponse,
    GetPerformanceHistoryParams,
    GetPerformanceHistoryResponse,
    // Rule Library types
    CreateRuleRequest,
    CreateRuleResponse,
    ListRulesParams,
    ListRulesResponse,
    GetRuleResponse,
    UpdateRuleRequest,
    UpdateRuleResponse,
    DuplicateRuleResponse,
    // AI Insights types
    StartInsightsRequest,
    StartInsightsResponse,
    InsightsStatusResponse,
    InsightsReportResponse,
    InsightsJobListResponse,
    // Standalone Monte Carlo types
    StartMonteCarloRequest,
    StartMonteCarloResponse,
    MonteCarloStatusResponse,
    // Standalone Optimizer types
    StartOptimizerRequest,
    StartOptimizerResponse,
    OptimizerStatusResponse,
    // Rules Optimizer types
    StartRulesOptimizerRequest,
    StartRulesOptimizerResponse,
    RulesOptimizerStatusResponse,
    // Full Optimizer types
    StartFullOptimizerRequest,
    StartFullOptimizerResponse,
    FullOptimizerStatusResponse,
    // Evaluation History types
    GetEvaluationHistoryParams,
    GetEvaluationHistoryResponse,
} from '../types/strategy'
import { API_BASE_URL } from '../api/client'

// Re-export for backwards compatibility
export { API_BASE_URL }

// ============================================================================
// CONFIGURATION
// ============================================================================

// Store the token getter function to be set by AuthContext
let tokenGetter: (() => Promise<string | undefined>) | null = null

// Store the logout function to be called on auth failures
let logoutHandler: (() => void) | null = null

export const setTokenGetter = (getter: () => Promise<string | undefined>) => {
    tokenGetter = getter
}

export const setLogoutHandler = (handler: () => void) => {
    logoutHandler = handler
}

// Check if the token getter is ready (for query enabling)
export const isAuthReady = (): boolean => {
    return tokenGetter !== null
}

// Export function to get just the token (useful for SSE connections)
export const getAuthToken = async (): Promise<string | undefined> => {
    if (tokenGetter) {
        try {
            return await tokenGetter()
        } catch (error) {
            console.error('[API Auth] Error getting auth token:', error)
            // Token refresh failed - trigger logout
            handleAuthFailure()
        }
    }
    return undefined
}

// Handle authentication failures - redirect to login
const handleAuthFailure = () => {
    console.warn('[API Auth] Authentication failed - redirecting to login')
    if (logoutHandler) {
        logoutHandler()
    } else {
        // Fallback: redirect to login page
        window.location.href = '/login'
    }
}

// Helper to get authorization headers with Bearer token
const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }

    if (tokenGetter) {
        try {
            const token = await tokenGetter()
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }
        } catch (error) {
            console.error('[API Auth] Error getting auth token:', error)
            // Token refresh failed - this will be handled by the fetch wrapper
        }
    }

    return headers
}

// Wrapper for fetch that handles 401 errors with automatic retry
const fetchWithAuth = async (
    url: string,
    options: RequestInit = {},
    isRetry: boolean = false
): Promise<Response> => {
    const response = await fetch(url, options)

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401 && !isRetry) {
        console.warn('[API Auth] Received 401 - attempting silent token refresh')

        // Try to get a fresh token and retry the request once
        if (tokenGetter) {
            try {
                const freshToken = await tokenGetter()
                if (freshToken) {
                    // Retry with fresh token
                    const retryHeaders = {
                        ...options.headers,
                        'Authorization': `Bearer ${freshToken}`,
                    }
                    return fetchWithAuth(url, { ...options, headers: retryHeaders }, true)
                }
            } catch (refreshError) {
                console.error('[API Auth] Token refresh failed:', refreshError)
            }
        }

        // Token refresh failed - trigger logout
        handleAuthFailure()
        throw new Error('Session expired. Please log in again.')
    }

    // If still 401 after retry, logout
    if (response.status === 401) {
        console.warn('[API Auth] 401 after retry - session truly expired')
        handleAuthFailure()
        throw new Error('Session expired. Please log in again.')
    }

    return response
}

// ============================================================================
// STOCK SEARCH ENDPOINTS
// ============================================================================

export interface StockSearchResult {
    ticker: string
    name: string
    exchange: string
    assetType: 'Stock' | 'ETF'
    isActive: boolean
}

export interface StockSearchResponse {
    results: StockSearchResult[]
    count: number
    query: string
}

export interface TickerDateInfo {
    startDate: string
    endDate: string
    name: string
}

export interface EarliestCommonDateResponse {
    earliest_common_date: string | null
    ticker_dates: Record<string, TickerDateInfo>
    tickers_found: number
    tickers_missing: string[]
}

/**
 * Search for stocks/ETFs by name or ticker
 */
export const searchStocks = async (
    query: string,
    limit: number = 10
): Promise<StockSearchResponse> => {
    if (!query.trim()) {
        return { results: [], count: 0, query: '' }
    }

    const queryParams = new URLSearchParams({
        query: query.trim(),
        limit: String(limit),
    })

    const headers = await getAuthHeaders()
    delete headers['Content-Type'] // Not needed for GET

    const response = await fetch(
        `${API_BASE_URL}/api/v1/stocks/search?${queryParams.toString()}`,
        { headers }
    )

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to search stocks')
    }

    return response.json()
}

/**
 * Get the earliest date where all provided tickers have data available.
 * This is essential for fair strategy comparison.
 */
export const getEarliestCommonDate = async (
    tickers: string[],
    options?: { signal?: AbortSignal }
): Promise<EarliestCommonDateResponse> => {
    if (!tickers.length) {
        return {
            earliest_common_date: null,
            ticker_dates: {},
            tickers_found: 0,
            tickers_missing: []
        }
    }

    const headers = await getAuthHeaders()

    const response = await fetch(
        `${API_BASE_URL}/api/v1/stocks/earliest-date`,
        {
            method: 'POST',
            headers,
            body: JSON.stringify({ tickers }),
            signal: options?.signal
        }
    )

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get earliest common date')
    }

    return response.json()
}

// ============================================================================
// BACKTESTING ENDPOINTS
// ============================================================================

/**
 * Get backtest examples
 */
export const getBacktestExamples = async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/backtest/examples`)

    if (!response.ok) {
        throw new Error('Failed to fetch backtest examples')
    }

    return response.json()
}

/**
 * Run a backtest
 */
export const runBacktest = async (request: BacktestRequest): Promise<BacktestResult> => {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}/api/v1/backtest`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
    })

    // Parse JSON with NaN/Infinity handling
    const responseText = await response.text()
    let data
    try {
        // Replace NaN/Infinity with null before parsing (not valid JSON)
        const sanitizedText = responseText.replace(/:\s*(-?Infinity|NaN)\b/g, ': null')
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

    return data
}

// ============================================================================
// STRATEGY MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * Create a new strategy (save backtest result)
 */
export const createStrategy = async (
    request: CreateStrategyRequest
): Promise<CreateStrategyResponse> => {
    const headers = await getAuthHeaders()

    const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/strategies`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create strategy')
    }

    return response.json()
}

/**
 * List strategies with filtering and sorting
 */
export const listStrategies = async (
    params?: ListStrategiesParams
): Promise<ListStrategiesResponse> => {
    const queryParams = new URLSearchParams()

    if (params?.is_deployed !== undefined) {
        queryParams.append('is_deployed', String(params.is_deployed))
    }
    if (params?.risk_level) {
        queryParams.append('risk_level', params.risk_level)
    }
    if (params?.sort_by) {
        queryParams.append('sort_by', params.sort_by)
    }
    if (params?.limit) {
        queryParams.append('limit', String(params.limit))
    }
    if (params?.offset) {
        queryParams.append('offset', String(params.offset))
    }

    const url = `${API_BASE_URL}/api/v1/strategies${queryParams.toString() ? `?${queryParams.toString()}` : ''
        }`

    const headers = await getAuthHeaders()
    delete headers['Content-Type'] // Not needed for GET

    const response = await fetchWithAuth(url, { headers })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch strategies')
    }

    return response.json()
}

/**
 * Get strategy details by ID
 */
export const getStrategy = async (strategyId: string): Promise<GetStrategyResponse> => {
    const headers = await getAuthHeaders()
    delete headers['Content-Type'] // Not needed for GET

    const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/strategies/${strategyId}`, {
        headers,
    })

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Strategy not found')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch strategy')
    }

    return response.json()
}

/**
 * Update strategy metadata
 */
export const updateStrategy = async (
    strategyId: string,
    request: UpdateStrategyRequest
): Promise<UpdateStrategyResponse> => {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}/api/v1/strategies/${strategyId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        if (response.status === 409) {
            throw new Error('Cannot update deployed strategy')
        }
        if (response.status === 404) {
            throw new Error('Strategy not found')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update strategy')
    }

    return response.json()
}

/**
 * Delete strategy
 */
export const deleteStrategy = async (strategyId: string): Promise<{ success: boolean }> => {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}/api/v1/strategies/${strategyId}`, {
        method: 'DELETE',
        headers,
    })

    if (!response.ok) {
        if (response.status === 409) {
            throw new Error('Cannot delete deployed strategy')
        }
        if (response.status === 404) {
            throw new Error('Strategy not found')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete strategy')
    }

    return response.json()
}

/**
 * Duplicate strategy
 */
export const duplicateStrategy = async (
    strategyId: string
): Promise<DuplicateStrategyResponse> => {
    const headers = await getAuthHeaders()

    const response = await fetch(
        `${API_BASE_URL}/api/v1/strategies/${strategyId}/duplicate`,
        {
            method: 'POST',
            headers,
        }
    )

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Strategy not found')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to duplicate strategy')
    }

    return response.json()
}

// ============================================================================
// DEPLOYMENT MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * Deploy a strategy to live trading
 */
export const createDeployment = async (
    request: CreateDeploymentRequest
): Promise<CreateDeploymentResponse> => {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}/api/v1/deployments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Strategy not found')
        }
        if (response.status === 409) {
            throw new Error('Strategy already has an active deployment')
        }
        if (response.status === 403) {
            throw new Error('Active deployment limit reached for your tier')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create deployment')
    }

    return response.json()
}

/**
 * List deployments
 */
export const listDeployments = async (
    params?: ListDeploymentsParams
): Promise<ListDeploymentsResponse> => {
    const queryParams = new URLSearchParams()

    if (params?.status) {
        queryParams.append('status', params.status)
    }
    if (params?.limit) {
        queryParams.append('limit', String(params.limit))
    }
    if (params?.offset) {
        queryParams.append('offset', String(params.offset))
    }

    const url = `${API_BASE_URL}/api/v1/deployments${queryParams.toString() ? `?${queryParams.toString()}` : ''
        }`

    const headers = await getAuthHeaders()
    delete headers['Content-Type'] // Not needed for GET

    const response = await fetch(url, { headers })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch deployments')
    }

    return response.json()
}

/**
 * Get deployment details
 */
export const getDeployment = async (deploymentId: string): Promise<GetDeploymentResponse> => {
    const headers = await getAuthHeaders()
    delete headers['Content-Type'] // Not needed for GET

    const response = await fetch(`${API_BASE_URL}/api/v1/deployments/${deploymentId}`, {
        headers,
    })

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Deployment not found')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch deployment')
    }

    return response.json()
}

/**
 * Update deployment status (pause, resume, stop)
 */
export const updateDeploymentStatus = async (
    deploymentId: string,
    request: UpdateDeploymentStatusRequest
): Promise<UpdateDeploymentStatusResponse> => {
    const headers = await getAuthHeaders()

    const response = await fetch(
        `${API_BASE_URL}/api/v1/deployments/${deploymentId}/status`,
        {
            method: 'PATCH',
            headers,
            body: JSON.stringify(request),
        }
    )

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Deployment not found')
        }
        if (response.status === 400) {
            throw new Error('Invalid status')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update deployment status')
    }

    return response.json()
}

/**
 * Update deployment settings (deploy date, initial capital)
 */
export const updateDeploymentSettings = async (
    deploymentId: string,
    request: { deployed_at?: string; initial_capital?: number }
): Promise<{ success: boolean; deployment_id: string; deployed_at: string; initial_capital: number }> => {
    const headers = await getAuthHeaders()

    const response = await fetch(
        `${API_BASE_URL}/api/v1/deployments/${deploymentId}/settings`,
        {
            method: 'PATCH',
            headers,
            body: JSON.stringify(request),
        }
    )

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Deployment not found')
        }
        if (response.status === 400) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Invalid settings')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update deployment settings')
    }

    return response.json()
}

/**
 * Update deployment notification preferences
 */
export interface NotificationPreferences {
    email_enabled?: boolean
    sms_enabled?: boolean
    email?: string | null
    phone?: string | null
    notify_on_switch?: boolean
    notify_on_rebalance?: boolean
    notify_on_significant_drift?: boolean
    drift_threshold?: number
    intraday_alerts_enabled?: boolean
    heads_up_threshold?: number
}

export const updateNotificationPreferences = async (
    deploymentId: string,
    preferences: NotificationPreferences
): Promise<{ success: boolean; deployment_id: string; notification_preferences: NotificationPreferences }> => {
    const headers = await getAuthHeaders()

    const response = await fetch(
        `${API_BASE_URL}/api/v1/deployments/${deploymentId}/notifications`,
        {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ notification_preferences: preferences }),
        }
    )

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Deployment not found')
        }
        if (response.status === 400) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Invalid preferences')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update notification preferences')
    }

    return response.json()
}

// ============================================================================
// PERFORMANCE & DASHBOARD ENDPOINTS
// ============================================================================

/**
 * Get performance history for a deployment
 */
export const getPerformanceHistory = async (
    deploymentId: string,
    params?: GetPerformanceHistoryParams
): Promise<GetPerformanceHistoryResponse> => {
    const headers = await getAuthHeaders()
    delete headers['Content-Type'] // Not needed for GET

    const queryParams = new URLSearchParams()

    if (params?.days) {
        queryParams.append('days', String(params.days))
    }

    const url = `${API_BASE_URL}/api/v1/deployments/${deploymentId}/performance${queryParams.toString() ? `?${queryParams.toString()}` : ''
        }`

    const response = await fetchWithAuth(url, { headers })

    if (!response.ok) {
        if (response.status === 400) {
            throw new Error('Invalid days parameter')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch performance history')
    }

    return response.json()
}

/**
 * Get evaluation history for a deployment (notification/rebalance history)
 */
export const getEvaluationHistory = async (
    deploymentId: string,
    params?: GetEvaluationHistoryParams
): Promise<GetEvaluationHistoryResponse> => {
    const queryParams = new URLSearchParams()

    if (params?.limit) {
        queryParams.append('limit', String(params.limit))
    }
    if (params?.include_no_action !== undefined) {
        queryParams.append('include_no_action', String(params.include_no_action))
    }

    const url = `${API_BASE_URL}/api/v1/deployments/${deploymentId}/evaluations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const headers = await getAuthHeaders()
    delete headers['Content-Type'] // Not needed for GET

    const response = await fetchWithAuth(url, { headers })

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Deployment not found')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch evaluation history')
    }

    return response.json()
}

// ============================================================================
// LIVE PERFORMANCE ENDPOINTS (On-Demand Calculation)
// ============================================================================

export interface LivePerformanceResult {
    deployment_id: string
    strategy_name: string
    deployed_at: string
    calculation_date: string
    days_deployed: number

    ideal_return: number
    ideal_cagr: number
    actual_return: number | null
    actual_cagr: number | null

    monte_carlo_median: number | null
    monte_carlo_p10: number | null
    monte_carlo_p90: number | null
    current_percentile: number | null

    current_allocation: string
    current_weights: Record<string, number>
    current_prices: Record<string, number>
    portfolio_value: number

    allocation_switches: Array<{
        date: string
        from_allocation: string
        to_allocation: string
        portfolio_value: number
    }>
    daily_values: Array<{
        date: string
        value: number
        return: number
    }>
}

export interface LivePerformanceResponse {
    success: boolean
    performance: LivePerformanceResult
}

export interface LivePerformanceSummary {
    calculation_date: string
    total_deployments: number
    total_portfolio_value: number
    weighted_avg_return: number
    deployments: LivePerformanceResult[]
}

export interface LivePerformanceSummaryResponse {
    success: boolean
    summary: LivePerformanceSummary
}

/**
 * Get on-demand live performance for a deployment.
 * Re-runs the strategy from deployment date to today using live EODHD prices.
 */
export const getLivePerformance = async (
    deploymentId: string,
    asOfDate?: string
): Promise<LivePerformanceResponse> => {
    const headers = await getAuthHeaders()
    delete headers['Content-Type']

    const queryParams = new URLSearchParams()
    if (asOfDate) {
        queryParams.append('as_of_date', asOfDate)
    }

    const url = `${API_BASE_URL}/api/v1/deployments/${deploymentId}/live-performance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const response = await fetchWithAuth(url, { headers })

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Deployment not found')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to calculate live performance')
    }

    return response.json()
}

/**
 * Debug endpoint to see actual indicator values for a deployment.
 * Helps diagnose why a strategy is in a certain allocation.
 */
export const getDebugSignals = async (
    deploymentId: string,
    asOfDate?: string
): Promise<any> => {
    const headers = await getAuthHeaders()
    delete headers['Content-Type']

    const queryParams = new URLSearchParams()
    if (asOfDate) {
        queryParams.append('as_of_date', asOfDate)
    }

    const url = `${API_BASE_URL}/api/v1/deployments/${deploymentId}/debug-signals${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const response = await fetchWithAuth(url, { headers })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get debug signals')
    }

    return response.json()
}


/**
 * Get live performance summary for all active deployments.
 * Returns aggregated metrics across all deployments with Monte Carlo comparison.
 */
export const getLivePerformanceSummary = async (
    asOfDate?: string
): Promise<LivePerformanceSummaryResponse> => {
    const headers = await getAuthHeaders()
    delete headers['Content-Type']

    const queryParams = new URLSearchParams()
    if (asOfDate) {
        queryParams.append('as_of_date', asOfDate)
    }

    const url = `${API_BASE_URL}/api/v1/deployments/live-performance-summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const response = await fetchWithAuth(url, { headers })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to calculate live performance summary')
    }

    return response.json()
}

// ============================================================================
// RULE LIBRARY ENDPOINTS
// ============================================================================

/**
 * Create a new rule in the user's library
 */
export const createRule = async (
    request: CreateRuleRequest
): Promise<CreateRuleResponse> => {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}/api/v1/rules`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create rule')
    }

    return response.json()
}

/**
 * List user's saved rules with filtering and sorting
 */
export const listRules = async (
    params?: ListRulesParams
): Promise<ListRulesResponse> => {
    const queryParams = new URLSearchParams()

    if (params?.category) {
        queryParams.append('category', params.category)
    }
    if (params?.search) {
        queryParams.append('search', params.search)
    }
    if (params?.sort_by) {
        queryParams.append('sort_by', params.sort_by)
    }
    if (params?.limit) {
        queryParams.append('limit', String(params.limit))
    }
    if (params?.offset) {
        queryParams.append('offset', String(params.offset))
    }

    const url = `${API_BASE_URL}/api/v1/rules${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const headers = await getAuthHeaders()
    delete headers['Content-Type'] // Not needed for GET

    const response = await fetchWithAuth(url, { headers })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch rules')
    }

    return response.json()
}

/**
 * Get rule details by ID
 */
export const getRule = async (ruleId: string): Promise<GetRuleResponse> => {
    const headers = await getAuthHeaders()
    delete headers['Content-Type'] // Not needed for GET

    const response = await fetch(`${API_BASE_URL}/api/v1/rules/${ruleId}`, {
        headers,
    })

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Rule not found')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch rule')
    }

    return response.json()
}

/**
 * Update a rule
 */
export const updateRule = async (
    ruleId: string,
    request: UpdateRuleRequest
): Promise<UpdateRuleResponse> => {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}/api/v1/rules/${ruleId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Rule not found')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update rule')
    }

    return response.json()
}

/**
 * Delete a rule
 */
export const deleteRule = async (ruleId: string): Promise<{ success: boolean }> => {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}/api/v1/rules/${ruleId}`, {
        method: 'DELETE',
        headers,
    })

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Rule not found')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete rule')
    }

    return response.json()
}

/**
 * Duplicate a rule
 */
export const duplicateRule = async (
    ruleId: string
): Promise<DuplicateRuleResponse> => {
    const headers = await getAuthHeaders()

    const response = await fetch(
        `${API_BASE_URL}/api/v1/rules/${ruleId}/duplicate`,
        {
            method: 'POST',
            headers,
        }
    )

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Rule not found')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to duplicate rule')
    }

    return response.json()
}

// ============================================================================
// AI INSIGHTS ENDPOINTS
// ============================================================================

/**
 * Start an AI insights job for a strategy
 * Runs Monte Carlo simulation and other analyses in the background
 */
export const startInsightsJob = async (
    strategyId: string,
    request?: StartInsightsRequest
): Promise<StartInsightsResponse> => {
    const headers = await getAuthHeaders()

    const response = await fetch(
        `${API_BASE_URL}/api/v1/strategies/${strategyId}/insights`,
        {
            method: 'POST',
            headers,
            body: JSON.stringify(request || {}),
        }
    )

    if (!response.ok) {
        if (response.status === 400) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'No backtest result available')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to start insights job')
    }

    return response.json()
}

/**
 * Get the current status of an insights job
 * Poll this endpoint every 2-5 seconds until status is 'complete' or 'failed'
 */
export const getInsightsStatus = async (
    jobId: string
): Promise<InsightsStatusResponse> => {
    const headers = await getAuthHeaders()
    delete headers['Content-Type']

    const response = await fetch(
        `${API_BASE_URL}/api/v1/insights/${jobId}/status`,
        { headers }
    )

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Job not found')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get insights status')
    }

    return response.json()
}

/**
 * Get the full insights report for a completed job
 */
export const getInsightsReport = async (
    jobId: string
): Promise<InsightsReportResponse> => {
    const headers = await getAuthHeaders()
    delete headers['Content-Type']

    const response = await fetch(
        `${API_BASE_URL}/api/v1/insights/${jobId}/report`,
        { headers }
    )

    if (!response.ok) {
        if (response.status === 400) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Report not ready')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get insights report')
    }

    return response.json()
}

/**
 * Get all insights jobs for a strategy
 */
export const getStrategyInsightsJobs = async (
    strategyId: string
): Promise<InsightsJobListResponse> => {
    const headers = await getAuthHeaders()
    delete headers['Content-Type']

    const response = await fetch(
        `${API_BASE_URL}/api/v1/strategies/${strategyId}/insights`,
        { headers }
    )

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get insights jobs')
    }

    return response.json()
}

/**
 * Cancel a running insights job
 */
export const cancelInsightsJob = async (
    jobId: string
): Promise<{ success: boolean; message: string }> => {
    const headers = await getAuthHeaders()

    const response = await fetch(
        `${API_BASE_URL}/api/v1/insights/${jobId}`,
        {
            method: 'DELETE',
            headers,
        }
    )

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to cancel insights job')
    }

    return response.json()
}

// ============================================================================
// STANDALONE MONTE CARLO (No saved strategy required)
// ============================================================================

/**
 * Start a Monte Carlo simulation without requiring a saved strategy.
 * Starts a background job and returns job_id for polling.
 */
export const startMonteCarloRun = async (
    request: StartMonteCarloRequest
): Promise<StartMonteCarloResponse> => {
    const headers = await getAuthHeaders()

    const response = await fetch(
        `${API_BASE_URL}/api/v1/monte-carlo`,
        {
            method: 'POST',
            headers,
            body: JSON.stringify(request),
        }
    )

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to start Monte Carlo simulation')
    }

    return response.json()
}

/**
 * Get the status of a standalone Monte Carlo simulation job.
 * Poll this endpoint every 2-5 seconds until status is 'complete' or 'failed'.
 */
export const getMonteCarloStatus = async (
    jobId: string
): Promise<MonteCarloStatusResponse> => {
    const headers = await getAuthHeaders()
    delete headers['Content-Type']

    const response = await fetch(
        `${API_BASE_URL}/api/v1/monte-carlo/${jobId}/status`,
        { headers }
    )

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Job not found')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get Monte Carlo status')
    }

    return response.json()
}

// ============================================================================
// STANDALONE OPTIMIZER (No saved strategy required)
// ============================================================================

/**
 * Start an allocation optimization without requiring a saved strategy.
 * Starts a background job and returns job_id for polling.
 */
export const startOptimizerRun = async (
    request: StartOptimizerRequest
): Promise<StartOptimizerResponse> => {
    const headers = await getAuthHeaders()

    const response = await fetch(
        `${API_BASE_URL}/api/v1/optimizer`,
        {
            method: 'POST',
            headers,
            body: JSON.stringify(request),
        }
    )

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to start optimization')
    }

    return response.json()
}

/**
 * Get the status of a standalone optimizer job (polling fallback).
 * Prefer using streamOptimizerProgress for real-time SSE updates.
 */
export const getOptimizerStatus = async (
    jobId: string
): Promise<OptimizerStatusResponse> => {
    const headers = await getAuthHeaders()
    delete headers['Content-Type']

    const response = await fetch(
        `${API_BASE_URL}/api/v1/optimizer/${jobId}/status`,
        { headers }
    )

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Job not found')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get optimizer status')
    }

    // Parse JSON with NaN/Infinity handling (optimizer can return NaN values from calculations)
    const responseText = await response.text()
    try {
        // Replace NaN/Infinity with null before parsing (not valid JSON)
        const sanitizedText = responseText.replace(/:\s*(-?Infinity|NaN)\b/g, ': null')
        return JSON.parse(sanitizedText)
    } catch (parseError) {
        console.error('JSON parse error:', parseError)
        throw new Error('Invalid JSON response from optimizer')
    }
}

/**
 * Stream optimizer progress via Server-Sent Events (SSE).
 * This eliminates polling - the server pushes progress updates in real-time.
 * 
 * @param jobId - The optimizer job ID
 * @param onProgress - Callback for progress updates
 * @param onComplete - Callback when optimization completes
 * @param onError - Callback when an error occurs
 * @returns Function to close the connection
 */
export const streamOptimizerProgress = async (
    jobId: string,
    onProgress: (status: OptimizerStatusResponse) => void,
    onComplete: (status: OptimizerStatusResponse) => void,
    onError: (error: string) => void
): Promise<() => void> => {
    // Get auth token if available (optional for anonymous users)
    const token = await getAuthToken()

    // Build URL with token if available
    const url = token
        ? `${API_BASE_URL}/api/v1/optimizer/${jobId}/stream?token=${encodeURIComponent(token)}`
        : `${API_BASE_URL}/api/v1/optimizer/${jobId}/stream`
    const eventSource = new EventSource(url)

    eventSource.onmessage = (event) => {
        try {
            // Parse JSON with NaN/Infinity handling
            const sanitizedData = event.data.replace(/:\s*(-?Infinity|NaN)\b/g, ': null')
            const data: OptimizerStatusResponse = JSON.parse(sanitizedData)

            if (data.status === 'complete') {
                onComplete(data)
                eventSource.close()
            } else if (data.status === 'failed' || data.status === 'not_found') {
                onError(data.error || 'Optimization failed')
                eventSource.close()
            } else {
                onProgress(data)
            }
        } catch (parseError) {
            console.error('SSE parse error:', parseError)
        }
    }

    eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        // Close immediately on any error to prevent EventSource auto-reconnect
        eventSource.close()
        onError('Connection to server lost')
    }

    // Return cleanup function
    return () => {
        eventSource.close()
    }
}

// ============================================================================
// RULES OPTIMIZER (Discover switching rules between portfolios)
// ============================================================================

/**
 * Start a rules optimization to discover switching rules between portfolios.
 * Starts a background job and returns job_id for progress streaming.
 */
export const startRulesOptimizerRun = async (
    request: StartRulesOptimizerRequest
): Promise<StartRulesOptimizerResponse> => {
    const headers = await getAuthHeaders()

    const response = await fetch(
        `${API_BASE_URL}/api/v1/rules-optimizer`,
        {
            method: 'POST',
            headers,
            body: JSON.stringify(request),
        }
    )

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to start rules optimization')
    }

    return response.json()
}

/**
 * Get the status of a rules optimizer job (polling fallback).
 * Prefer using streamRulesOptimizerProgress for real-time SSE updates.
 */
export const getRulesOptimizerStatus = async (
    jobId: string
): Promise<RulesOptimizerStatusResponse> => {
    const headers = await getAuthHeaders()
    delete headers['Content-Type']

    const response = await fetch(
        `${API_BASE_URL}/api/v1/rules-optimizer/${jobId}/status`,
        { headers }
    )

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Job not found')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get rules optimizer status')
    }

    const responseText = await response.text()
    try {
        const sanitizedText = responseText.replace(/:\s*(-?Infinity|NaN)\b/g, ': null')
        return JSON.parse(sanitizedText)
    } catch (parseError) {
        console.error('JSON parse error:', parseError)
        throw new Error('Invalid JSON response from rules optimizer')
    }
}

/**
 * Stream rules optimizer progress via Server-Sent Events (SSE).
 * 
 * @param jobId - The rules optimizer job ID
 * @param onProgress - Callback for progress updates
 * @param onComplete - Callback when optimization completes
 * @param onError - Callback when an error occurs
 * @returns Function to close the connection
 */
export const streamRulesOptimizerProgress = async (
    jobId: string,
    onProgress: (status: RulesOptimizerStatusResponse) => void,
    onComplete: (status: RulesOptimizerStatusResponse) => void,
    onError: (error: string) => void
): Promise<() => void> => {
    const token = await getAuthToken()

    const url = token
        ? `${API_BASE_URL}/api/v1/rules-optimizer/${jobId}/stream?token=${encodeURIComponent(token)}`
        : `${API_BASE_URL}/api/v1/rules-optimizer/${jobId}/stream`
    const eventSource = new EventSource(url)

    eventSource.onmessage = (event) => {
        try {
            const sanitizedData = event.data.replace(/:\s*(-?Infinity|NaN)\b/g, ': null')
            const data: RulesOptimizerStatusResponse = JSON.parse(sanitizedData)

            if (data.status === 'complete') {
                onComplete(data)
                eventSource.close()
            } else if (data.status === 'failed' || data.status === 'not_found') {
                onError(data.error || 'Rules optimization failed')
                eventSource.close()
            } else {
                onProgress(data)
            }
        } catch (parseError) {
            console.error('SSE parse error:', parseError)
        }
    }

    eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        // Close immediately on any error to prevent EventSource auto-reconnect
        eventSource.close()
        onError('Connection to server lost')
    }

    return () => {
        eventSource.close()
    }
}

// ============================================================================
// FULL OPTIMIZER (Rules + Allocations sequential optimization)
// ============================================================================

/**
 * Start a full strategy optimization: Rules Discovery → Allocation Optimization.
 * Starts a background job and returns job_id for progress streaming.
 */
export const startFullOptimizerRun = async (
    request: StartFullOptimizerRequest
): Promise<StartFullOptimizerResponse> => {
    const headers = await getAuthHeaders()

    const response = await fetch(
        `${API_BASE_URL}/api/v1/full-optimizer`,
        {
            method: 'POST',
            headers,
            body: JSON.stringify(request),
        }
    )

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to start full optimization')
    }

    return response.json()
}

/**
 * Get the status of a full optimizer job (polling fallback).
 * Prefer using streamFullOptimizerProgress for real-time SSE updates.
 */
export const getFullOptimizerStatus = async (
    jobId: string
): Promise<FullOptimizerStatusResponse> => {
    const headers = await getAuthHeaders()
    delete headers['Content-Type']

    const response = await fetch(
        `${API_BASE_URL}/api/v1/full-optimizer/${jobId}/status`,
        { headers }
    )

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Job not found')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get full optimizer status')
    }

    const responseText = await response.text()
    try {
        const sanitizedText = responseText.replace(/:\s*(-?Infinity|NaN)\b/g, ': null')
        return JSON.parse(sanitizedText)
    } catch (parseError) {
        console.error('JSON parse error:', parseError)
        throw new Error('Invalid JSON response from full optimizer')
    }
}

/**
 * Stream full optimizer progress via Server-Sent Events (SSE).
 * Progress includes phase information ('rules' or 'allocations').
 * 
 * @param jobId - The full optimizer job ID
 * @param onProgress - Callback for progress updates
 * @param onComplete - Callback when optimization completes
 * @param onError - Callback when an error occurs
 * @returns Function to close the connection
 */
export const streamFullOptimizerProgress = async (
    jobId: string,
    onProgress: (status: FullOptimizerStatusResponse) => void,
    onComplete: (status: FullOptimizerStatusResponse) => void,
    onError: (error: string) => void
): Promise<() => void> => {
    const token = await getAuthToken()

    const url = token
        ? `${API_BASE_URL}/api/v1/full-optimizer/${jobId}/stream?token=${encodeURIComponent(token)}`
        : `${API_BASE_URL}/api/v1/full-optimizer/${jobId}/stream`
    const eventSource = new EventSource(url)

    eventSource.onmessage = (event) => {
        try {
            const sanitizedData = event.data.replace(/:\s*(-?Infinity|NaN)\b/g, ': null')
            const data: FullOptimizerStatusResponse = JSON.parse(sanitizedData)

            // Debug log to verify best_metrics and phase are coming through
            if (data.progress?.best_metrics) {
                console.log('[Full Optimizer SSE] Phase:', data.progress.phase, 'best_metrics:', data.progress.best_metrics)
            }

            if (data.status === 'complete') {
                onComplete(data)
                eventSource.close()
            } else if (data.status === 'failed' || data.status === 'not_found') {
                onError(data.error || 'Full optimization failed')
                eventSource.close()
            } else {
                onProgress(data)
            }
        } catch (parseError) {
            console.error('SSE parse error:', parseError)
        }
    }

    eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        // Close immediately on any error to prevent EventSource auto-reconnect
        eventSource.close()
        onError('Connection to server lost')
    }

    return () => {
        eventSource.close()
    }
}

// ============================================================================
// SHARE API
// ============================================================================

export interface CreateShareRequest {
    strategy_dsl: Record<string, unknown>
    canvas_state?: Record<string, unknown>
    title?: string
    description?: string
}

export interface CreateShareResponse {
    success: boolean
    share_id: string
    share_url: string
    created_at: string
    error?: string
}

export interface GetShareResponse {
    success: boolean
    share: {
        share_id: string
        strategy_dsl: Record<string, unknown>
        canvas_state?: Record<string, unknown>
        title?: string
        description?: string
        creator_name?: string
        view_count: number
        import_count: number
        allow_import: boolean
        created_at: string
    }
    error?: string
}

/**
 * Create a shareable link for a strategy.
 * Returns a short URL that can be shared on social media.
 */
export const createShare = async (
    request: CreateShareRequest
): Promise<CreateShareResponse> => {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}/api/v1/share`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to create share link' }))
        throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
}

/**
 * Get a shared strategy by its short ID.
 * This is a public endpoint - no auth required.
 */
export const getShare = async (shareId: string): Promise<GetShareResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/share/${shareId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Share not found' }))
        throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
}

/**
 * Track when a shared strategy is imported to someone's canvas.
 */
export const trackShareImport = async (shareId: string): Promise<void> => {
    try {
        await fetch(`${API_BASE_URL}/api/v1/share/${shareId}/import`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
    } catch {
        // Fire and forget - don't throw on tracking failures
    }
}

// ============================================================================
// RETIREMENT SIMULATION
// ============================================================================

export interface RetirementSimulationRequest {
    current_age: number
    retirement_age: number
    life_expectancy: number
    initial_savings: number
    monthly_contribution: number
    monthly_spending: number
    portfolio: Record<string, number>
    rebalancing?: 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    n_simulations?: number
}

export interface RetirementSimulationResults {
    success_rate: number
    ruin_probability: number
    median_final_value: number
    scenarios: {
        pessimistic: {
            final_value: number
            ruin_age: number | null
        }
        median: {
            final_value: number
        }
        optimistic: {
            final_value: number
        }
    }
    percentile_values: {
        p10: number
        p25: number
        p50: number
        p75: number
        p90: number
    }
    // Optional percentiles format returned by API for chart data
    percentiles?: {
        p10?: Array<{ age: number; value: number }>
        p25?: Array<{ age: number; value: number }>
        p50?: Array<{ age: number; value: number }>
        p75?: Array<{ age: number; value: number }>
        p90?: Array<{ age: number; value: number }>
    }
    path_percentiles: {
        years: number[]
        percentiles: {
            p10: number[]
            p25: number[]
            p50: number[]
            p75: number[]
            p90: number[]
        }
    }
    value_at_retirement: number
    metadata: {
        simulations_run: number
        years_to_retirement: number
        years_in_retirement: number
        total_years: number
        initial_savings: number
        monthly_contribution: number
        monthly_spending: number
        rebalancing?: string
        engine_available?: boolean
    }
}

export interface RetirementSimulationResponse {
    success: boolean
    results?: RetirementSimulationResults
    error?: string
}

/**
 * Run a retirement simulation with Monte Carlo projections.
 * 
 * Simulates portfolio growth through accumulation (contributions) and
 * drawdown (spending) phases to calculate retirement success probability.
 */
export const runRetirementSimulation = async (
    request: RetirementSimulationRequest
): Promise<RetirementSimulationResponse> => {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}/api/v1/retirement-simulation`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Simulation failed' }))
        throw new Error(error.error || error.message || `HTTP ${response.status}`)
    }

    return response.json()
}

// ============================================================================
// SAFE WITHDRAWAL CALCULATOR
// ============================================================================

export interface SafeWithdrawalRequest {
    current_age: number
    retirement_age: number
    life_expectancy: number
    initial_savings: number
    monthly_contribution: number
    portfolio: Record<string, number>
    rebalancing?: 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    target_success_rates?: number[]
}

export interface SafeWithdrawalThreshold {
    monthly: number
    annual: number
    success_rate: number
}

export interface SafeWithdrawalResponse {
    success: boolean
    safe_withdrawals?: Record<string, SafeWithdrawalThreshold>
    recommended?: {
        monthly: number
        annual: number
        confidence: number
    }
    simulation_results?: RetirementSimulationResults
    metadata?: {
        current_age: number
        retirement_age: number
        life_expectancy: number
        initial_savings: number
        monthly_contribution: number
        rebalancing: string
        years_to_retirement: number
        years_in_retirement: number
    }
    error?: string
}

/**
 * Calculate safe monthly withdrawal amounts at multiple confidence levels.
 * 
 * Uses Monte Carlo simulation to project portfolio values at retirement,
 * then calculates sustainable withdrawals from percentile outcomes.
 */
export const calculateSafeWithdrawal = async (
    request: SafeWithdrawalRequest
): Promise<SafeWithdrawalResponse> => {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}/api/v1/safe-withdrawal`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Calculation failed' }))
        throw new Error(error.error || error.message || `HTTP ${response.status}`)
    }

    return response.json()
}

// ============================================================================
// USER PROFILE API
// ============================================================================

export type UserType = 'personal' | 'advisor' | null

export interface UserProfile {
    email: string
    name: string | null
    picture: string | null
    user_type: UserType
    subscription_tier: string
    firm_name: string | null
    firm_logo_url: string | null
    is_new_user: boolean
}

export interface GetUserProfileResponse {
    success: boolean
    profile?: UserProfile
    error?: string
}

export interface UpdateUserProfileRequest {
    user_type?: UserType
    firm_name?: string | null
    firm_logo_url?: string | null
}

export interface UpdateUserProfileResponse {
    success: boolean
    profile?: UserProfile
    error?: string
}

/**
 * Get current user's profile.
 * 
 * Returns user_type, firm_name, and other profile data.
 * Used to determine dashboard routing and onboarding status.
 */
export const getUserProfile = async (): Promise<GetUserProfileResponse> => {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}/api/v1/user/profile`, {
        method: 'GET',
        headers,
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to get profile' }))
        throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
}

/**
 * Update user profile fields.
 * 
 * Called during onboarding (to set user_type) and from settings (to update firm info).
 */
export const updateUserProfile = async (
    request: UpdateUserProfileRequest
): Promise<UpdateUserProfileResponse> => {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}/api/v1/user/profile`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to update profile' }))
        throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
}

// ============================================================================
// LOGO UPLOAD API
// ============================================================================

export interface UploadLogoResponse {
    success: boolean
    blob_url?: string
    message?: string
    error?: string
}

/**
 * Upload a logo image for the current user/firm.
 * 
 * The user's profile is automatically updated with the new logo URL.
 */
export const uploadLogo = async (file: File): Promise<UploadLogoResponse> => {
    const token = tokenGetter ? await tokenGetter() : undefined

    const formData = new FormData()
    formData.append('file', file)

    const headers: HeadersInit = {}
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/uploads/logo`, {
        method: 'POST',
        headers,
        body: formData,
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Upload failed' }))
        return { success: false, error: error.error || `HTTP ${response.status}` }
    }

    return response.json()
}

/**
 * Delete the current user's logo.
 * 
 * Removes the logo from storage and clears firm_logo_url from profile.
 */
export const deleteLogo = async (): Promise<{ success: boolean; error?: string }> => {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}/api/v1/uploads/logo`, {
        method: 'DELETE',
        headers,
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Delete failed' }))
        return { success: false, error: error.error || `HTTP ${response.status}` }
    }

    return response.json()
}
