// API client for backend communication
export const API_BASE_URL = import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:8000'
        : 'https://backfolio-backend-dtf4azfmgqh6d4b3.canadacentral-01.azurewebsites.net')

export interface AIMessageRequest {
    message: string
    sessionId?: string
    context?: {
        strategy_json?: any
        backtest_results?: any
    }
}

export interface AIMessageResponse {
    type: 'explanation' | 'generated_strategy' | 'backtest_results' | 'combined'
    explanation: string
    strategy_json?: any
    should_run_backtest?: boolean
    backtest_results?: any
    follow_up_questions?: string[]
    error?: string
    requires_api_key?: boolean
    quota_exceeded?: boolean
}

class APIClient {
    private baseURL: string

    constructor(baseURL: string = API_BASE_URL) {
        this.baseURL = baseURL
    }

    private getAuthHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        }

        // Get token from localStorage (Auth0 stores it there)
        const token = localStorage.getItem('access_token')
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        return headers
    }

    async get<T = any>(path: string): Promise<{ data: T }> {
        const response = await fetch(`${this.baseURL}${path}`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
            throw new Error(error.error || `Request failed: ${response.status}`)
        }

        const data = await response.json()
        return { data }
    }

    async post<T = any>(path: string, body?: any): Promise<{ data: T }> {
        const response = await fetch(`${this.baseURL}${path}`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: body ? JSON.stringify(body) : undefined,
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
            throw new Error(error.error || `Request failed: ${response.status}`)
        }

        const data = await response.json()
        return { data }
    }

    async delete<T = any>(path: string): Promise<{ data: T }> {
        const response = await fetch(`${this.baseURL}${path}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
            throw new Error(error.error || `Request failed: ${response.status}`)
        }

        const data = await response.json()
        return { data }
    }

    async sendAIMessage(request: AIMessageRequest, apiKey?: string): Promise<AIMessageResponse> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        }

        // Add API key header if provided (for user-provided keys)
        if (apiKey) {
            headers['X-OpenAI-API-Key'] = apiKey
        }

        try {
            const response = await fetch(`${this.baseURL}/api/ai/message`, {
                method: 'POST',
                headers,
                body: JSON.stringify(request),
            })

            // Parse response body for all status codes
            const data = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))

            // For 401 (invalid key) or 429 (quota exceeded), return the data as-is
            // It contains explanation, quota_exceeded, requires_api_key flags
            if (response.status === 401 || response.status === 429) {
                return data as AIMessageResponse
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send message')
            }

            return data
        } catch (error) {
            // Network error or fetch failed
            if (error instanceof TypeError) {
                throw new Error(`Cannot connect to backend at ${this.baseURL}. Please ensure the backend is running.`)
            }
            throw error
        }
    }

    async checkAIHealth(): Promise<{ ai_available: boolean; backtest_available: boolean; status: string }> {
        const response = await fetch(`${this.baseURL}/api/ai/health`)
        return response.json()
    }
}

export const apiClient = new APIClient()
