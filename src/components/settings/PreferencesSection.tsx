import { useTheme } from '../../context/ThemeContext'

interface Preferences {
    emailNotifications: boolean
    phoneNotifications: boolean
    marketingEmails: boolean
    currency: string
    timezone: string
}

interface PreferencesSectionProps {
    preferences: Preferences
    onPreferencesChange: (preferences: Preferences) => void
    onSave: () => void
    isLoading: boolean
}

export const PreferencesSection = ({ preferences, onPreferencesChange, onSave, isLoading }: PreferencesSectionProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <div className={`backdrop-blur-2xl rounded-3xl p-8 shadow-[0_0_50px_rgba(255,255,255,0.06)] ${isDark ? 'bg-white/[0.02] border border-white/[0.15]' : 'bg-white border border-gray-200'
            }`}>
            <div className="mb-6">
                <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Application Preferences
                </h2>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Customize your investment dashboard experience
                </p>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Notifications
                    </h3>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={preferences.emailNotifications}
                                onChange={(e) => onPreferencesChange({ ...preferences, emailNotifications: e.target.checked })}
                                className={`w-5 h-5 ${isDark ? 'accent-purple-500' : 'accent-primary-500'}`}
                            />
                            <div>
                                <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Email Notifications
                                </div>
                                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Portfolio alerts and performance updates via email
                                </div>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={preferences.phoneNotifications}
                                onChange={(e) => onPreferencesChange({ ...preferences, phoneNotifications: e.target.checked })}
                                className={`w-5 h-5 ${isDark ? 'accent-purple-500' : 'accent-primary-500'}`}
                            />
                            <div>
                                <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    SMS Notifications
                                </div>
                                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Critical alerts and urgent updates via text message
                                </div>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={preferences.marketingEmails}
                                onChange={(e) => onPreferencesChange({ ...preferences, marketingEmails: e.target.checked })}
                                className={`w-5 h-5 ${isDark ? 'accent-purple-500' : 'accent-primary-500'}`}
                            />
                            <div>
                                <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Product Updates
                                </div>
                                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    New features and platform improvements
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className={`block mb-2 text-sm font-bold uppercase tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            Default Currency
                        </label>
                        <select
                            value={preferences.currency}
                            onChange={(e) => onPreferencesChange({ ...preferences, currency: e.target.value })}
                            className={`rounded-lg w-full px-4 py-3 focus:outline-none transition-all duration-300 ${isDark
                                ? 'bg-white/[0.05] border border-white/[0.1] text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20'
                                : 'bg-white border border-gray-300 text-gray-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20'
                                }`}
                        >
                            <option value="USD" className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
                                USD - US Dollar
                            </option>
                            <option value="EUR" className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
                                EUR - Euro
                            </option>
                            <option value="GBP" className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
                                GBP - British Pound
                            </option>
                            <option value="JPY" className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
                                JPY - Japanese Yen
                            </option>
                            <option value="CAD" className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
                                CAD - Canadian Dollar
                            </option>
                        </select>
                    </div>
                    <div>
                        <label className={`block mb-2 text-sm font-bold uppercase tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            Timezone
                        </label>
                        <select
                            value={preferences.timezone}
                            onChange={(e) => onPreferencesChange({ ...preferences, timezone: e.target.value })}
                            className={`rounded-lg w-full px-4 py-3 focus:outline-none transition-all duration-300 ${isDark
                                ? 'bg-white/[0.05] border border-white/[0.1] text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20'
                                : 'bg-white border border-gray-300 text-gray-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20'
                                }`}
                        >
                            <option value="UTC" className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
                                UTC
                            </option>
                            <option value="EST" className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
                                Eastern Time
                            </option>
                            <option value="PST" className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
                                Pacific Time
                            </option>
                            <option value="GMT" className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
                                Greenwich Mean Time
                            </option>
                            <option value="CET" className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
                                Central European Time
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={onSave}
                    disabled={isLoading}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 ${isDark
                        ? 'bg-purple-500/90 hover:bg-purple-600 text-white border border-purple-400/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                        : 'bg-gray-900 hover:bg-gray-800 text-white shadow-sm hover:shadow-md'
                        }`}
                >
                    {isLoading ? 'Saving...' : 'Save Preferences'}
                </button>
            </div>
        </div>
    )
}
