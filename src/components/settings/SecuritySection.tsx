import { useTheme } from '../../context/ThemeContext'
import { SettingRow } from './SettingRow'

interface SecuritySectionProps {
    onChangePassword: () => void
    onEnable2FA: () => void
}

export const SecuritySection = ({ onChangePassword, onEnable2FA }: SecuritySectionProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <div className={`backdrop-blur-2xl rounded-3xl p-8 shadow-[0_0_50px_rgba(255,255,255,0.06)] ${isDark ? 'bg-white/[0.02] border border-white/[0.15]' : 'bg-white border border-gray-200'
            }`}>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Security
                    </h2>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Manage your account security</p>
                </div>
            </div>

            <div className="mt-6 space-y-4">
                <SettingRow
                    label="Password"
                    value="Last updated 3 months ago"
                    buttonText="Change Password"
                    onButtonClick={onChangePassword}
                />
                <SettingRow
                    label="Two-Factor Authentication"
                    value="Not enabled"
                    buttonText="Enable 2FA"
                    onButtonClick={onEnable2FA}
                    buttonClassName="bg-purple-500/90 hover:bg-purple-600 border border-purple-400/30 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-300"
                />
            </div>
        </div>
    )
}
