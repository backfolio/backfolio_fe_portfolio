import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'

interface PasswordChangeModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (passwords: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<void>
}

export const PasswordChangeModal = ({ isOpen, onClose, onSave }: PasswordChangeModalProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [isLoading, setIsLoading] = useState(false)

    if (!isOpen) return null

    const handleSave = async () => {
        setIsLoading(true)
        await onSave(passwords)
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setIsLoading(false)
    }

    const isValid = passwords.currentPassword && passwords.newPassword && passwords.newPassword === passwords.confirmPassword

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`backdrop-blur-2xl rounded-3xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(255,255,255,0.08)] ${isDark ? 'bg-white/[0.03] border border-white/[0.15]' : 'bg-white border border-gray-200'
                }`}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Change Password
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
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                            className={`rounded-lg w-full px-4 py-3 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all duration-300 ${isDark
                                    ? 'bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-gray-500'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400'
                                }`}
                            placeholder="Enter current password"
                        />
                    </div>
                    <div>
                        <label className={`block mb-2 text-sm font-bold uppercase tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            New Password
                        </label>
                        <input
                            type="password"
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            className={`rounded-lg w-full px-4 py-3 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all duration-300 ${isDark
                                    ? 'bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-gray-500'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400'
                                }`}
                            placeholder="Enter new password"
                        />
                    </div>
                    <div>
                        <label className={`block mb-2 text-sm font-bold uppercase tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            className={`rounded-lg w-full px-4 py-3 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all duration-300 ${isDark
                                    ? 'bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-gray-500'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400'
                                }`}
                            placeholder="Confirm new password"
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
                        disabled={isLoading || !isValid}
                        className={`rounded-lg flex-1 py-3 font-semibold disabled:opacity-50 transition-all duration-300 shadow-sm hover:shadow-md ${isDark
                                ? 'bg-white/[0.1] hover:bg-white/[0.15] text-white border border-white/[0.15]'
                                : 'bg-gray-900 hover:bg-gray-800 text-white'
                            }`}
                    >
                        {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </div>
        </div>
    )
}
