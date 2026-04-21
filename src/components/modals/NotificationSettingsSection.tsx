import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTheme } from '../../context/ThemeContext'
import { updateNotificationPreferences, type NotificationPreferences } from '../../services/api'

interface NotificationSettingsSectionProps {
    deploymentId: string
    initialPreferences: NotificationPreferences
    userEmail?: string
}

export const NotificationSettingsSection = ({
    deploymentId,
    initialPreferences,
    userEmail
}: NotificationSettingsSectionProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const queryClient = useQueryClient()
    
    // Form state
    const [emailEnabled, setEmailEnabled] = useState(initialPreferences.email_enabled ?? true)
    const [smsEnabled, setSmsEnabled] = useState(initialPreferences.sms_enabled ?? false)
    const [phone, setPhone] = useState(initialPreferences.phone ?? '')
    const [intradayEnabled, setIntradayEnabled] = useState(initialPreferences.intraday_alerts_enabled ?? true)
    const [headsUpThreshold, setHeadsUpThreshold] = useState((initialPreferences.heads_up_threshold ?? 0.02) * 100)
    
    const [hasChanges, setHasChanges] = useState(false)
    
    // Track changes
    useEffect(() => {
        const changed = 
            emailEnabled !== (initialPreferences.email_enabled ?? true) ||
            smsEnabled !== (initialPreferences.sms_enabled ?? false) ||
            phone !== (initialPreferences.phone ?? '') ||
            intradayEnabled !== (initialPreferences.intraday_alerts_enabled ?? true) ||
            headsUpThreshold !== ((initialPreferences.heads_up_threshold ?? 0.02) * 100)
        setHasChanges(changed)
    }, [emailEnabled, smsEnabled, phone, intradayEnabled, headsUpThreshold, initialPreferences])
    
    const mutation = useMutation({
        mutationFn: (prefs: NotificationPreferences) => 
            updateNotificationPreferences(deploymentId, prefs),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })
            queryClient.invalidateQueries({ queryKey: ['deployments'] })
            setHasChanges(false)
        }
    })
    
    const handleSave = () => {
        mutation.mutate({
            email_enabled: emailEnabled,
            sms_enabled: smsEnabled,
            phone: phone || null,
            intraday_alerts_enabled: intradayEnabled,
            heads_up_threshold: headsUpThreshold / 100
        })
    }
    
    const formatPhoneNumber = (value: string) => {
        // Remove non-digits except leading +
        let cleaned = value.startsWith('+') 
            ? '+' + value.slice(1).replace(/\D/g, '')
            : value.replace(/\D/g, '')
        
        // Add + prefix if user is entering digits without it
        if (cleaned.length > 0 && !cleaned.startsWith('+')) {
            cleaned = '+' + cleaned
        }
        
        return cleaned
    }
    
    return (
        <div className="space-y-4">
            {/* Section Header */}
            <div className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="font-medium">Alert Notifications</span>
            </div>
            
            {/* Email Alerts */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-white/[0.02] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <label className="flex items-center justify-between cursor-pointer">
                    <div>
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Email Alerts
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {userEmail || 'Receive alerts via email'}
                        </div>
                    </div>
                    <div className={`relative w-11 h-6 rounded-full transition-colors ${
                        emailEnabled 
                            ? 'bg-green-500' 
                            : isDark ? 'bg-gray-700' : 'bg-gray-300'
                    }`}>
                        <input
                            type="checkbox"
                            checked={emailEnabled}
                            onChange={(e) => setEmailEnabled(e.target.checked)}
                            className="sr-only"
                        />
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                            emailEnabled ? 'translate-x-5' : ''
                        }`} />
                    </div>
                </label>
            </div>
            
            {/* SMS Alerts */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-white/[0.02] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <label className="flex items-center justify-between cursor-pointer mb-3">
                    <div>
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            SMS Alerts
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Get text messages for urgent alerts
                        </div>
                    </div>
                    <div className={`relative w-11 h-6 rounded-full transition-colors ${
                        smsEnabled 
                            ? 'bg-green-500' 
                            : isDark ? 'bg-gray-700' : 'bg-gray-300'
                    }`}>
                        <input
                            type="checkbox"
                            checked={smsEnabled}
                            onChange={(e) => setSmsEnabled(e.target.checked)}
                            className="sr-only"
                        />
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                            smsEnabled ? 'translate-x-5' : ''
                        }`} />
                    </div>
                </label>
                
                {smsEnabled && (
                    <div className="mt-3">
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                            placeholder="+1234567890"
                            className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                                isDark
                                    ? 'bg-gray-800 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                            } focus:outline-none focus:ring-1 focus:ring-purple-500`}
                        />
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Include country code (e.g., +1 for US)
                        </p>
                    </div>
                )}
            </div>
            
            {/* Intraday Alerts */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-white/[0.02] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <label className="flex items-center justify-between cursor-pointer mb-3">
                    <div>
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Intraday Alerts
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Get alerts during market hours
                        </div>
                    </div>
                    <div className={`relative w-11 h-6 rounded-full transition-colors ${
                        intradayEnabled 
                            ? 'bg-green-500' 
                            : isDark ? 'bg-gray-700' : 'bg-gray-300'
                    }`}>
                        <input
                            type="checkbox"
                            checked={intradayEnabled}
                            onChange={(e) => setIntradayEnabled(e.target.checked)}
                            className="sr-only"
                        />
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                            intradayEnabled ? 'translate-x-5' : ''
                        }`} />
                    </div>
                </label>
                
                {intradayEnabled && (
                    <div className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                        <div className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            ALERT SCHEDULE (Eastern Time)
                        </div>
                        <div className="space-y-1.5">
                            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                <span className="text-yellow-500">⚠️</span>
                                <span className="font-medium">1:00 PM</span>
                                <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>— Heads up if conditions approaching</span>
                            </div>
                            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                <span className="text-red-500">🔔</span>
                                <span className="font-medium">3:45 PM</span>
                                <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>— Final check before market close</span>
                            </div>
                        </div>
                        
                        <div className="mt-4">
                            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Heads-Up Sensitivity
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={headsUpThreshold}
                                    onChange={(e) => setHeadsUpThreshold(Number(e.target.value))}
                                    className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer ${
                                        isDark ? 'bg-gray-700' : 'bg-gray-200'
                                    }`}
                                />
                                <span className={`text-sm font-mono w-12 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {headsUpThreshold.toFixed(0)}%
                                </span>
                            </div>
                            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                Alert when conditions are within {headsUpThreshold.toFixed(0)}% of triggering
                            </p>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Save Button */}
            {hasChanges && (
                <button
                    onClick={handleSave}
                    disabled={mutation.isPending}
                    className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        isDark
                            ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/50'
                            : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                    } disabled:opacity-50`}
                >
                    {mutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Notification Settings
                        </>
                    )}
                </button>
            )}
            
            {/* Success Message */}
            {mutation.isSuccess && !hasChanges && (
                <div className={`p-3 rounded-lg ${isDark ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'}`}>
                    <p className={`text-sm text-center ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        Notification settings saved!
                    </p>
                </div>
            )}
            
            {/* Error Message */}
            {mutation.isError && (
                <div className={`p-3 rounded-lg ${isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        {mutation.error?.message || 'Failed to save settings'}
                    </p>
                </div>
            )}
        </div>
    )
}

