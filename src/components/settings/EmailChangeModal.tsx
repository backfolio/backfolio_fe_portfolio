import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'

interface EmailChangeModalProps {
    isOpen: boolean
    currentEmail: string
    onClose: () => void
    onSave: (newEmail: string) => Promise<void>
}

export const EmailChangeModal = ({ isOpen, currentEmail, onClose, onSave }: EmailChangeModalProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const [newEmail, setNewEmail] = useState(currentEmail)
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    if (!isOpen) return null

    const handleSave = async () => {
        setIsLoading(true)
        await onSave(newEmail)
        setPassword('')
        setIsLoading(false)
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`backdrop-blur-2xl rounded-3xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(255,255,255,0.08)] ${isDark ? 'bg-white/[0.03] border border-white/[0.15]' : 'bg-white border border-gray-200'
                }`}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Change Email
                    </h3>
                    <button
                        onClick={onClose}
                        className={`text-2xl transition-colors ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className={`block mb-2 text-sm font-bold uppercase tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            Current Email
                        </label>
                        <input
                            type="email"
                            value={currentEmail}
                            disabled
                            className={`rounded-lg w-full px-4 py-3 opacity-70 ${isDark
                                    ? 'bg-white/[0.03] border border-white/[0.08] text-gray-500'
                                    : 'bg-gray-100 border border-gray-300 text-gray-500'
                                }`}
                        />
                    </div>
                    <div>
                        <label className={`block mb-2 text-sm font-bold uppercase tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            New Email Address
                        </label>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className={`rounded-lg w-full px-4 py-3 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all duration-300 ${isDark
                                    ? 'bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-gray-500'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400'
                                }`}
                            placeholder="Enter new email address"
                        />
                    </div>
                    <div>
                        <label className={`block mb-2 text-sm font-bold uppercase tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`rounded-lg w-full px-4 py-3 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all duration-300 ${isDark
                                    ? 'bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-gray-500'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400'
                                }`}
                            placeholder="Enter your password to confirm"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className={`rounded-lg flex-1 py-3 font-semibold transition-all duration-300 ${isDark
                                ? 'bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] hover:border-white/[0.2] text-gray-300'
                                : 'bg-gray-100 border border-gray-200 hover:bg-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className={`rounded-lg flex-1 py-3 font-semibold transition-all duration-300 shadow-sm hover:shadow-md ${isDark
                                ? 'bg-white/[0.1] hover:bg-white/[0.15] text-white border border-white/[0.15]'
                                : 'bg-gray-900 hover:bg-gray-800 text-white'
                            }`}
                    >
                        {isLoading ? 'Updating...' : 'Update Email'}
                    </button>
                </div>
            </div>
        </div>
    )
}
