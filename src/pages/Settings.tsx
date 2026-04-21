import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Layout from '../components/Layout'
import {
    SuccessMessage,
    PreferencesSection,
    BrandingSection
} from '../components/settings'
import { updateUserProfile } from '../services/api'

const Settings = () => {
    const { user, userType, firmName: currentFirmName, firmLogoUrl: currentFirmLogoUrl, refetchProfile } = useAuth()
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        phoneNotifications: false,
        marketingEmails: false,
        currency: 'USD',
        timezone: 'UTC'
    })

    // Firm branding state (for advisors only)
    const [firmName, setFirmName] = useState('')
    const [firmLogoUrl, setFirmLogoUrl] = useState('')
    const [isBrandingLoading, setIsBrandingLoading] = useState(false)
    const [isUserTypeLoading, setIsUserTypeLoading] = useState(false)

    // Initialize firm branding from context
    useEffect(() => {
        if (currentFirmName) setFirmName(currentFirmName)
        if (currentFirmLogoUrl) setFirmLogoUrl(currentFirmLogoUrl)
    }, [currentFirmName, currentFirmLogoUrl])

    const [isLoading, setIsLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    const showSuccessMessage = (message: string) => {
        setSuccessMessage(message)
        setTimeout(() => setSuccessMessage(''), 3000)
    }

    const handlePreferencesSave = async () => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        showSuccessMessage('Preferences updated successfully!')
        setIsLoading(false)
    }

    // Save firm branding (for advisors)
    const handleBrandingSave = async () => {
        setIsBrandingLoading(true)
        try {
            await updateUserProfile({
                firm_name: firmName || null,
                firm_logo_url: firmLogoUrl || null,
            })
            await refetchProfile()
            showSuccessMessage('Firm branding updated successfully!')
        } catch (error) {
            console.error('Failed to save branding:', error)
            setSuccessMessage('')
        } finally {
            setIsBrandingLoading(false)
        }
    }

    // Toggle user type
    const handleUserTypeChange = async (newType: 'personal' | 'advisor') => {
        if (newType === userType) return
        
        setIsUserTypeLoading(true)
        try {
            await updateUserProfile({ user_type: newType })
            await refetchProfile()
            showSuccessMessage(`Switched to ${newType === 'advisor' ? 'Advisor' : 'Personal'} mode!`)
        } catch (error) {
            console.error('Failed to change user type:', error)
        } finally {
            setIsUserTypeLoading(false)
        }
    }

    // Check if user can change password (only database users, not social login)
    const canChangePassword = user?.sub?.startsWith('auth0|')
    
    const handleChangePassword = async () => {
        if (!user?.email) return
        
        setIsLoading(true)
        try {
            // Fetch runtime config
            let config
            try {
                const response = await fetch('/api/config')
                if (response.ok) {
                    config = await response.json()
                }
            } catch {
                const response = await fetch('/config.json')
                config = await response.json()
            }

            const domain = config?.auth0?.domain
            const clientId = config?.auth0?.clientId
            
            if (!domain || !clientId) {
                throw new Error('Auth0 config not found')
            }
            
            // Call Auth0's change password endpoint
            const response = await fetch(`https://${domain}/dbconnections/change_password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: clientId,
                    email: user.email,
                    connection: 'Username-Password-Authentication'
                })
            })
            
            if (response.ok) {
                showSuccessMessage('Password reset email sent! Check your inbox.')
            } else {
                throw new Error('Failed to send reset email')
            }
        } catch (error) {
            console.error('Failed to send password reset:', error)
            setSuccessMessage('')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Account Settings
                    </h1>
                    <p className={`text-sm sm:text-base lg:text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Manage your account preferences and security settings
                    </p>
                </div>

                <SuccessMessage message={successMessage} />

                <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                    {/* Account Info */}
                    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Account Information
                        </h2>

                        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                            {user?.picture && (
                                <img
                                    src={user.picture}
                                    alt={user.name || 'User'}
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-primary-500 self-center sm:self-start"
                                />
                            )}
                            <div className="flex-1 w-full">
                                <div className="mb-4">
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Name
                                    </label>
                                    <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} break-words`}>
                                        {user?.name || 'Not set'}
                                    </div>
                                </div>

                                <div className="mb-4 sm:mb-6">
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Email
                                    </label>
                                    <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} break-words`}>
                                        {user?.email || 'Not set'}
                                    </div>
                                </div>

                                {canChangePassword ? (
                                    <>
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={isLoading}
                                            className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-all ${isDark
                                                ? 'bg-primary-600 hover:bg-primary-700 text-white disabled:bg-primary-800'
                                                : 'bg-primary-500 hover:bg-primary-600 text-white disabled:bg-primary-300'
                                                } disabled:cursor-not-allowed`}
                                        >
                                            {isLoading ? 'Sending...' : 'Change Password'}
                                        </button>
                                        <p className={`mt-2 sm:mt-3 text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            We'll send a password reset link to your email
                                        </p>
                                    </>
                                ) : (
                                    <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        You signed in with a social account. Manage your password through your identity provider (Google, GitHub, etc.)
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Account Type Toggle */}
                    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3 mb-4 sm:mb-6">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-100'}`}>
                                <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Account Type
                                </h2>
                                <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Choose how you use Backfolio
                                </p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {/* Personal Option */}
                            <button
                                onClick={() => handleUserTypeChange('personal')}
                                disabled={isUserTypeLoading}
                                className={`relative p-4 sm:p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                                    userType === 'personal'
                                        ? isDark
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-blue-500 bg-blue-50'
                                        : isDark
                                            ? 'border-gray-700 hover:border-gray-600 bg-gray-700/30'
                                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                                } ${isUserTypeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {/* Selection indicator */}
                                <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    userType === 'personal'
                                        ? 'border-blue-500 bg-blue-500'
                                        : isDark ? 'border-gray-600' : 'border-gray-300'
                                }`}>
                                    {userType === 'personal' && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>

                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                                    userType === 'personal'
                                        ? 'bg-blue-500 text-white'
                                        : isDark ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-500'
                                }`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>

                                <h3 className={`text-base sm:text-lg font-semibold mb-1 ${
                                    userType === 'personal'
                                        ? isDark ? 'text-blue-300' : 'text-blue-700'
                                        : isDark ? 'text-white' : 'text-gray-900'
                                }`}>
                                    Personal Use
                                </h3>
                                <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Manage your own investment portfolios
                                </p>
                            </button>

                            {/* Advisor Option */}
                            <button
                                onClick={() => handleUserTypeChange('advisor')}
                                disabled={isUserTypeLoading}
                                className={`relative p-4 sm:p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                                    userType === 'advisor'
                                        ? isDark
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : 'border-purple-500 bg-purple-50'
                                        : isDark
                                            ? 'border-gray-700 hover:border-gray-600 bg-gray-700/30'
                                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                                } ${isUserTypeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {/* Selection indicator */}
                                <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    userType === 'advisor'
                                        ? 'border-purple-500 bg-purple-500'
                                        : isDark ? 'border-gray-600' : 'border-gray-300'
                                }`}>
                                    {userType === 'advisor' && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>

                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                                    userType === 'advisor'
                                        ? 'bg-purple-500 text-white'
                                        : isDark ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-500'
                                }`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>

                                <h3 className={`text-base sm:text-lg font-semibold mb-1 ${
                                    userType === 'advisor'
                                        ? isDark ? 'text-purple-300' : 'text-purple-700'
                                        : isDark ? 'text-white' : 'text-gray-900'
                                }`}>
                                    Financial Advisor
                                </h3>
                                <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Professional tools for client analysis
                                </p>
                            </button>
                        </div>

                        {isUserTypeLoading && (
                            <div className="mt-4 flex items-center gap-2">
                                <svg className={`w-4 h-4 animate-spin ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Updating account type...
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Firm Branding - Only for Advisors */}
                    {userType === 'advisor' && (
                        <BrandingSection
                            firmName={firmName}
                            firmLogoUrl={firmLogoUrl}
                            onFirmNameChange={setFirmName}
                            onFirmLogoUrlChange={setFirmLogoUrl}
                            onSave={handleBrandingSave}
                            isSaving={isBrandingLoading}
                        />
                    )}

                    <PreferencesSection
                        preferences={preferences}
                        onPreferencesChange={setPreferences}
                        onSave={handlePreferencesSave}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </Layout>
    )
}

export default Settings
