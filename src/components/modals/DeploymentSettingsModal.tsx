import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTheme } from '../../context/ThemeContext'
import { updateDeploymentStatus, updateDeploymentSettings, type NotificationPreferences } from '../../services/api'
import { NotificationSettingsSection } from './NotificationSettingsSection'

interface DeploymentSettingsModalProps {
    isOpen: boolean
    onClose: () => void
    deploymentId: string
    strategyName: string
    currentStatus: 'active' | 'paused' | 'stopped'
    deployedAt?: string
    initialCapital?: number
    notificationPreferences?: NotificationPreferences
    userEmail?: string
}

export const DeploymentSettingsModal = ({
    isOpen,
    onClose,
    deploymentId,
    strategyName,
    currentStatus,
    deployedAt,
    initialCapital,
    notificationPreferences = {},
    userEmail
}: DeploymentSettingsModalProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const queryClient = useQueryClient()
    const [confirmStop, setConfirmStop] = useState(false)
    
    // Settings form state
    const [deployDate, setDeployDate] = useState('')
    const [capital, setCapital] = useState('')
    const [settingsChanged, setSettingsChanged] = useState(false)
    
    // Initialize form values when modal opens
    useEffect(() => {
        if (isOpen && deployedAt) {
            // Extract YYYY-MM-DD from ISO string
            setDeployDate(deployedAt.slice(0, 10))
        }
        if (isOpen && initialCapital) {
            setCapital(initialCapital.toString())
        }
    }, [isOpen, deployedAt, initialCapital])
    
    // Check if settings have changed
    useEffect(() => {
        const originalDate = deployedAt?.slice(0, 10) || ''
        const originalCapital = initialCapital?.toString() || ''
        setSettingsChanged(
            deployDate !== originalDate || capital !== originalCapital
        )
    }, [deployDate, capital, deployedAt, initialCapital])

    const updateStatusMutation = useMutation({
        mutationFn: (newStatus: 'active' | 'paused' | 'stopped') =>
            updateDeploymentStatus(deploymentId, { status: newStatus }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })
            queryClient.invalidateQueries({ queryKey: ['deployments'] })
            queryClient.invalidateQueries({ queryKey: ['livePerformance'] })
            onClose()
        }
    })
    
    const updateSettingsMutation = useMutation({
        mutationFn: (settings: { deployed_at?: string; initial_capital?: number }) =>
            updateDeploymentSettings(deploymentId, settings),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })
            queryClient.invalidateQueries({ queryKey: ['deployments'] })
            queryClient.invalidateQueries({ queryKey: ['livePerformance'] })
            // Reset changed state
            setSettingsChanged(false)
        }
    })
    
    const handleSaveSettings = () => {
        const updates: { deployed_at?: string; initial_capital?: number } = {}
        
        if (deployDate && deployDate !== deployedAt?.slice(0, 10)) {
            updates.deployed_at = deployDate
        }
        if (capital && parseFloat(capital) !== initialCapital) {
            updates.initial_capital = parseFloat(capital)
        }
        
        if (Object.keys(updates).length > 0) {
            updateSettingsMutation.mutate(updates)
        }
    }

    if (!isOpen) return null

    const handlePauseResume = () => {
        const newStatus = currentStatus === 'active' ? 'paused' : 'active'
        updateStatusMutation.mutate(newStatus)
    }

    const handleStop = () => {
        if (!confirmStop) {
            setConfirmStop(true)
            return
        }
        updateStatusMutation.mutate('stopped')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`relative w-full max-w-md rounded-xl shadow-2xl ${
                isDark ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200'
            }`}>
                {/* Header */}
                <div className={`px-6 py-5 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Deployment Settings
                            </h2>
                            <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {strategyName}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg transition-colors ${
                                isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5 space-y-4">
                    {/* Deploy Date Setting */}
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-white/[0.02] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Investment Start Date
                        </label>
                        <input
                            type="date"
                            value={deployDate}
                            onChange={(e) => setDeployDate(e.target.value)}
                            max={new Date().toISOString().slice(0, 10)}
                            className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                                isDark
                                    ? 'bg-gray-800 border border-white/10 text-white focus:border-purple-500'
                                    : 'bg-white border border-gray-300 text-gray-900 focus:border-purple-500'
                            } focus:outline-none focus:ring-1 focus:ring-purple-500`}
                        />
                        <p className={`text-xs mt-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Set when you started following this strategy
                        </p>
                    </div>
                    
                    {/* Initial Capital Setting */}
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-white/[0.02] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Initial Capital
                        </label>
                        <div className="relative">
                            <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>$</span>
                            <input
                                type="number"
                                value={capital}
                                onChange={(e) => setCapital(e.target.value)}
                                min="1"
                                step="1"
                                className={`w-full pl-7 pr-3 py-2 rounded-lg text-sm transition-colors ${
                                    isDark
                                        ? 'bg-gray-800 border border-white/10 text-white focus:border-purple-500'
                                        : 'bg-white border border-gray-300 text-gray-900 focus:border-purple-500'
                                } focus:outline-none focus:ring-1 focus:ring-purple-500`}
                            />
                        </div>
                        <p className={`text-xs mt-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Amount you invested when starting
                        </p>
                    </div>
                    
                    {/* Save Settings Button */}
                    {settingsChanged && (
                        <button
                            onClick={handleSaveSettings}
                            disabled={updateSettingsMutation.isPending}
                            className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                                isDark
                                    ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/50'
                                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                            } disabled:opacity-50`}
                        >
                            {updateSettingsMutation.isPending ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Save Changes
                                </>
                            )}
                        </button>
                    )}
                    
                    {updateSettingsMutation.isSuccess && !settingsChanged && (
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'}`}>
                            <p className={`text-sm text-center ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                Settings saved successfully!
                            </p>
                        </div>
                    )}
                    
                    {updateSettingsMutation.isError && (
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
                            <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                {updateSettingsMutation.error?.message || 'Failed to save settings'}
                            </p>
                        </div>
                    )}
                    
                    {/* Divider */}
                    <div className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`} />
                    
                    {/* Notification Settings */}
                    <NotificationSettingsSection
                        deploymentId={deploymentId}
                        initialPreferences={notificationPreferences}
                        userEmail={userEmail}
                    />
                    
                    {/* Divider */}
                    <div className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`} />
                    
                    {/* Current Status */}
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-white/[0.02] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Current Status
                                </div>
                                <div className={`text-lg font-semibold mt-1 capitalize ${
                                    currentStatus === 'active' 
                                        ? isDark ? 'text-green-400' : 'text-green-600'
                                        : currentStatus === 'paused'
                                            ? isDark ? 'text-yellow-400' : 'text-yellow-600'
                                            : isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    {currentStatus}
                                </div>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${
                                currentStatus === 'active' 
                                    ? 'bg-green-500'
                                    : currentStatus === 'paused'
                                        ? 'bg-yellow-500'
                                        : 'bg-gray-500'
                            }`} />
                        </div>
                    </div>

                    {/* Pause/Resume Button */}
                    {currentStatus !== 'stopped' && (
                        <button
                            onClick={handlePauseResume}
                            disabled={updateStatusMutation.isPending}
                            className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                                currentStatus === 'active'
                                    ? isDark
                                        ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/50'
                                        : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                                    : isDark
                                        ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/50'
                                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                            } disabled:opacity-50`}
                        >
                            {updateStatusMutation.isPending ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : currentStatus === 'active' ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Pause Strategy
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Resume Strategy
                                </>
                            )}
                        </button>
                    )}

                    {/* Stop Button */}
                    {currentStatus !== 'stopped' && (
                        <div>
                            <button
                                onClick={handleStop}
                                disabled={updateStatusMutation.isPending}
                                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                                    confirmStop
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : isDark
                                            ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/50'
                                            : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                } disabled:opacity-50`}
                            >
                                {updateStatusMutation.isPending ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                        </svg>
                                        {confirmStop ? 'Click Again to Confirm Stop' : 'Stop Deployment'}
                                    </>
                                )}
                            </button>
                            {confirmStop && (
                                <p className={`text-xs mt-2 text-center ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                    This action cannot be undone. You'll need to redeploy the strategy.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Stopped message */}
                    {currentStatus === 'stopped' && (
                        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                This deployment has been stopped. To continue tracking this strategy, redeploy it from your saved strategies.
                            </p>
                        </div>
                    )}

                    {/* Error message */}
                    {updateStatusMutation.isError && (
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
                            <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                {updateStatusMutation.error?.message || 'Failed to update deployment status'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`px-6 py-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    <button
                        onClick={() => {
                            setConfirmStop(false)
                            onClose()
                        }}
                        className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isDark
                                ? 'bg-white/[0.05] text-gray-300 hover:bg-white/[0.1] border border-white/[0.15]'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

