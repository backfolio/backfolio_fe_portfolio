// Monte Carlo Configuration Constants

export const SIMULATION_MODES = [
    { count: 50, label: 'Quick', description: '~1s', requiresAuth: false },
    { count: 75, label: 'Standard', description: '~1-2s', requiresAuth: false },
    { count: 150, label: 'Thorough', description: '~2-3s', requiresAuth: true },
    { count: 500, label: 'Deep', description: '~7s', requiresAuth: true },
    { count: 1000, label: 'Full', description: '~15s', requiresAuth: true }
] as const

// Free tier simulation counts (available without authentication)
export const FREE_SIMULATION_COUNTS = [50, 75] as const

export const PROJECTION_PERIODS = [
    { years: 1, label: '1 Year', description: 'Very short' },
    { years: 2, label: '2 Years', description: 'Short' },
    { years: 5, label: '5 Years', description: 'Medium' },
    { years: 10, label: '10 Years', description: 'Recommended' },
    { years: 20, label: '20 Years', description: 'Long-term' },
    { years: 30, label: '30 Years', description: 'Full career' }
] as const

export const getEstimatedTime = (simulations: number, years: number): string => {
    const baseTimePerSim = 0.015 * (years / 10)
    const overhead = 0.5  // Fixed overhead for data loading
    const totalSeconds = Math.max(1, Math.round(overhead + simulations * baseTimePerSim))

    if (totalSeconds >= 60) return `~${Math.round(totalSeconds / 60)}min`
    if (totalSeconds <= 2) return '~1-2s'
    return `~${totalSeconds}s`
}

