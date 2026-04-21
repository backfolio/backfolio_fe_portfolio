import { useAuth } from '../context/AuthContext'

const OWNER_SUB = 'auth0|69192fa932381333b424ef90'

const OWNER_LIMITS = {
    max_monte_carlo_sims: 1000,
    max_rules_trials: 5000,
    max_allocations_trials: 250,
}

const DEFAULT_LIMITS = {
    max_monte_carlo_sims: 75,
    max_rules_trials: 200,
    max_allocations_trials: 100,
}

export const useUserLimits = () => {
    const { user } = useAuth()
    return user?.sub === OWNER_SUB ? OWNER_LIMITS : DEFAULT_LIMITS
}
