/**
 * BrandingSection - Advisor firm branding settings with logo upload
 * 
 * Features:
 * - Drag-and-drop logo upload
 * - URL fallback for externally hosted logos
 * - Live preview of how branding appears on reports
 * - Image validation (type, size)
 */

import { useState, useRef, useCallback } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { uploadLogo, deleteLogo } from '../../services/api'

interface BrandingSectionProps {
    firmName: string
    firmLogoUrl: string
    onFirmNameChange: (name: string) => void
    onFirmLogoUrlChange: (url: string) => void
    onSave: () => Promise<void>
    isSaving: boolean
}

export const BrandingSection = ({
    firmName,
    firmLogoUrl,
    onFirmNameChange,
    onFirmLogoUrlChange,
    onSave,
    isSaving
}: BrandingSectionProps) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [useUrlMode, setUseUrlMode] = useState(!firmLogoUrl || !firmLogoUrl.includes('blob.core.windows.net'))
    
    // Allowed file types
    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']
    const MAX_SIZE_MB = 5
    
    const validateFile = useCallback((file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return 'Invalid file type. Please upload PNG, JPEG, GIF, WebP, or SVG.'
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            return `File too large. Maximum size is ${MAX_SIZE_MB}MB.`
        }
        return null
    }, [])
    
    const handleUpload = useCallback(async (file: File) => {
        const error = validateFile(file)
        if (error) {
            setUploadError(error)
            return
        }
        
        setUploadError(null)
        setIsUploading(true)
        
        try {
            const result = await uploadLogo(file)
            if (result.success && result.blob_url) {
                onFirmLogoUrlChange(result.blob_url)
                setUseUrlMode(false)
            } else {
                setUploadError(result.error || 'Upload failed')
            }
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setIsUploading(false)
        }
    }, [validateFile, onFirmLogoUrlChange])
    
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        
        const files = e.dataTransfer.files
        if (files.length > 0) {
            handleUpload(files[0])
        }
    }, [handleUpload])
    
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])
    
    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])
    
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            handleUpload(files[0])
        }
    }, [handleUpload])
    
    const handleRemoveLogo = useCallback(async () => {
        if (firmLogoUrl && firmLogoUrl.includes('blob.core.windows.net')) {
            try {
                await deleteLogo()
            } catch (err) {
                console.error('Failed to delete logo:', err)
            }
        }
        onFirmLogoUrlChange('')
    }, [firmLogoUrl, onFirmLogoUrlChange])
    
    const handleBrowseClick = useCallback(() => {
        fileInputRef.current?.click()
    }, [])
    
    return (
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/10' : 'bg-purple-100'}`}>
                    <svg className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <div>
                    <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Firm Branding
                    </h2>
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Your branding appears on PDF reports and results modals shared with clients
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Firm Name */}
                <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Firm Name
                    </label>
                    <input
                        type="text"
                        value={firmName}
                        onChange={(e) => onFirmNameChange(e.target.value)}
                        placeholder="e.g., Smith Wealth Management"
                        className={`w-full px-4 py-3 rounded-lg transition-colors ${isDark
                            ? 'bg-gray-700 text-white border-gray-600 focus:border-purple-500 placeholder-gray-400'
                            : 'bg-white text-gray-900 border-gray-300 focus:border-purple-500 placeholder-gray-400'
                        } border focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                </div>

                {/* Logo Section */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Firm Logo
                        </label>
                        <button
                            type="button"
                            onClick={() => setUseUrlMode(!useUrlMode)}
                            className={`text-xs ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
                        >
                            {useUrlMode ? 'Upload file instead' : 'Use URL instead'}
                        </button>
                    </div>
                    
                    {useUrlMode ? (
                        /* URL Input Mode */
                        <div>
                            <input
                                type="url"
                                value={firmLogoUrl}
                                onChange={(e) => onFirmLogoUrlChange(e.target.value)}
                                placeholder="https://yourfirm.com/logo.png"
                                className={`w-full px-4 py-3 rounded-lg transition-colors ${isDark
                                    ? 'bg-gray-700 text-white border-gray-600 focus:border-purple-500 placeholder-gray-400'
                                    : 'bg-white text-gray-900 border-gray-300 focus:border-purple-500 placeholder-gray-400'
                                } border focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                            />
                            <p className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                Enter a URL to your firm's logo. Recommended: PNG or SVG, max 200x60px
                            </p>
                        </div>
                    ) : (
                        /* Upload Mode */
                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".png,.jpg,.jpeg,.gif,.webp,.svg"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            
                            {firmLogoUrl ? (
                                /* Logo Preview */
                                <div className={`relative p-4 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'}`}>
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={firmLogoUrl}
                                            alt="Firm logo"
                                            className="h-12 w-auto object-contain max-w-[200px]"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect fill="%23ddd" width="48" height="48"/><text x="50%" y="50%" font-size="10" text-anchor="middle" dy=".3em" fill="%23999">Error</text></svg>'
                                            }}
                                        />
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                Logo uploaded
                                            </p>
                                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Click below to replace
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveLogo}
                                            className={`p-2 rounded-lg transition-colors ${isDark 
                                                ? 'hover:bg-red-500/20 text-red-400' 
                                                : 'hover:bg-red-50 text-red-500'}`}
                                            title="Remove logo"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleBrowseClick}
                                        className={`mt-3 w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${isDark
                                            ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                        }`}
                                    >
                                        Replace Logo
                                    </button>
                                </div>
                            ) : (
                                /* Drop Zone */
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onClick={handleBrowseClick}
                                    className={`relative p-8 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
                                        isDragging
                                            ? isDark
                                                ? 'border-purple-500 bg-purple-500/10'
                                                : 'border-purple-500 bg-purple-50'
                                            : isDark
                                                ? 'border-gray-600 hover:border-gray-500 bg-gray-700/30'
                                                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                                    }`}
                                >
                                    {isUploading ? (
                                        <div className="flex flex-col items-center">
                                            <svg className={`w-8 h-8 animate-spin ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Uploading...
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <svg className={`w-10 h-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className={`mt-3 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Drop your logo here or <span className={isDark ? 'text-purple-400' : 'text-purple-600'}>browse</span>
                                            </p>
                                            <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                PNG, JPG, GIF, WebP, or SVG. Max {MAX_SIZE_MB}MB.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {uploadError && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {uploadError}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Preview Section */}
                {(firmName || firmLogoUrl) && (
                    <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                        <p className={`text-xs uppercase tracking-wider mb-3 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            PDF Report Header Preview
                        </p>
                        <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            {firmLogoUrl ? (
                                <img
                                    src={firmLogoUrl}
                                    alt="Firm logo"
                                    className="h-8 w-auto object-contain max-w-[120px]"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none'
                                    }}
                                />
                            ) : (
                                <div className={`w-8 h-8 rounded flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    <svg className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {firmName || 'Your Firm Name'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <button
                    onClick={onSave}
                    disabled={isSaving || isUploading}
                    className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-all ${isDark
                        ? 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-purple-800'
                        : 'bg-purple-500 hover:bg-purple-600 text-white disabled:bg-purple-300'
                    } disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                    {isSaving ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Saving...
                        </>
                    ) : (
                        'Save Branding'
                    )}
                </button>
            </div>
        </div>
    )
}

