import { useTheme } from '../../context/ThemeContext'

interface SettingRowProps {
    label: string
    value: string
    buttonText: string
    onButtonClick: () => void
    buttonClassName?: string
}

export const SettingRow = ({ label, value, buttonText, onButtonClick, buttonClassName }: SettingRowProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    const defaultButtonClass = isDark
        ? "bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] hover:border-white/[0.2] rounded-lg px-4 py-2 text-sm font-semibold text-gray-300 transition-all duration-300"
        : "bg-gray-100 border border-gray-200 hover:bg-gray-200 hover:border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-300"

    return (
        <div className={`flex items-center justify-between py-4 border-b ${isDark ? 'border-white/[0.1]' : 'border-gray-200'}`}>
            <div>
                <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</div>
                <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{value}</div>
            </div>
            <button
                onClick={onButtonClick}
                className={buttonClassName || defaultButtonClass}
            >
                {buttonText}
            </button>
        </div>
    )
}
