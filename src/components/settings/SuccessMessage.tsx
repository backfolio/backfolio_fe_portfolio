import { useTheme } from '../../context/ThemeContext'

interface SuccessMessageProps {
    message: string
}

export const SuccessMessage = ({ message }: SuccessMessageProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    if (!message) return null

    return (
        <div className={`mb-8 p-4 rounded-xl font-semibold border-2 ${isDark
                ? 'bg-success-500/20 border-success-500/30 text-success-400'
                : 'bg-success-50 border-success-300 text-success-700'
            }`}>
            {message}
        </div>
    )
}
