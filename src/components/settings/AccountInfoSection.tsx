import { useTheme } from '../../context/ThemeContext'
import { SettingRow } from './SettingRow'

interface AccountInfoSectionProps {
    email: string
    username: string
    onChangeEmail: () => void
    onEditUsername: () => void
}

export const AccountInfoSection = ({ email, username, onChangeEmail, onEditUsername }: AccountInfoSectionProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <div className={`backdrop-blur-2xl rounded-3xl p-8 shadow-[0_0_50px_rgba(255,255,255,0.06)] ${isDark ? 'bg-white/[0.02] border border-white/[0.15]' : 'bg-white border border-gray-200'
            }`}>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Account Information
                    </h2>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Manage your account details</p>
                </div>
            </div>

            <div className="mt-6 space-y-4">
                <SettingRow
                    label="Email Address"
                    value={email}
                    buttonText="Change Email"
                    onButtonClick={onChangeEmail}
                />
                <SettingRow
                    label="Username"
                    value={username}
                    buttonText="Edit Username"
                    onButtonClick={onEditUsername}
                />
            </div>
        </div>
    )
}
