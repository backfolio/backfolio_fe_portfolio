/**
 * React Query hooks for user profile management.
 * 
 * Handles fetching and updating user profile data including:
 * - user_type: 'personal' | 'advisor' | null
 * - firm_name, firm_logo_url (for advisors)
 * - subscription_tier
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getUserProfile,
    updateUserProfile,
    type UserProfile,
    type UpdateUserProfileRequest,
    type UserType,
} from '../services/api'

// Query key for user profile
export const USER_PROFILE_KEY = ['user', 'profile']

/**
 * Hook to fetch the current user's profile.
 * 
 * Returns profile data including user_type for routing decisions.
 * Only enabled when user is authenticated.
 */
export function useUserProfile(enabled: boolean = true) {
    return useQuery({
        queryKey: USER_PROFILE_KEY,
        queryFn: async () => {
            const response = await getUserProfile()
            if (!response.success || !response.profile) {
                throw new Error(response.error || 'Failed to fetch profile')
            }
            return response.profile
        },
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes (previously cacheTime)
        retry: 1,
    })
}

/**
 * Hook to update user profile.
 * 
 * Invalidates profile query on success to refresh data.
 */
export function useUpdateUserProfile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (request: UpdateUserProfileRequest) => {
            const response = await updateUserProfile(request)
            if (!response.success || !response.profile) {
                throw new Error(response.error || 'Failed to update profile')
            }
            return response.profile
        },
        onSuccess: (data) => {
            // Update the cached profile data
            queryClient.setQueryData(USER_PROFILE_KEY, data)
        },
    })
}

/**
 * Hook to set user type during onboarding.
 * 
 * Convenience wrapper around useUpdateUserProfile specifically for onboarding.
 */
export function useSetUserType() {
    const mutation = useUpdateUserProfile()

    const setUserType = async (userType: UserType) => {
        return mutation.mutateAsync({ user_type: userType })
    }

    return {
        setUserType,
        isLoading: mutation.isPending,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
    }
}

// Re-export types for convenience
export type { UserProfile, UserType, UpdateUserProfileRequest }

