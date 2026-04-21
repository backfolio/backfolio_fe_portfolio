/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary Purple (Investment Theme)
                primary: {
                    50: '#faf5ff',
                    100: '#f3e8ff',
                    200: '#e9d5ff',
                    300: '#d8b4fe',
                    400: '#c084fc',
                    500: '#a855f7',
                    600: '#9333ea',
                    700: '#7e22ce',
                    800: '#6b21a8',
                    900: '#581c87',
                },
                // Secondary Accent Color (Deep Blue for contrast)
                secondary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
                // Premium Neutrals (Dark Theme)
                premium: {
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#e5e5e5',
                    300: '#d4d4d4',
                    400: '#a3a3a3',
                    500: '#737373',
                    600: '#525252',
                    700: '#404040',
                    800: '#262626',
                    900: '#171717',
                },
                // Modern Slate Neutrals
                slate: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                },
                // Status Colors
                success: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                },
                danger: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626',
                    700: '#b91c1c',
                },
                warning: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                },
                // Investment Performance Colors
                bullish: {
                    50: '#ecfdf5',
                    500: '#22c55e',
                    600: '#16a34a',
                },
                bearish: {
                    50: '#fef2f2',
                    500: '#ef4444',
                    600: '#dc2626',
                },
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
            },
            fontSize: {
                '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
                '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
            },
            backgroundImage: {
                // Primary Investment Gradients
                'gradient-primary': 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                'gradient-primary-light': 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)',
                'gradient-secondary': 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',

                // Background Gradients
                'gradient-hero': 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 50%, #faf5ff 100%)',
                'gradient-dark': 'linear-gradient(135deg, #171717 0%, #262626 50%, #404040 100%)',
                'gradient-dark-subtle': 'linear-gradient(to bottom right, #262626, #171717, #0f0f0f)',

                // Glass & Card Effects
                'gradient-glass': 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                'gradient-glass-dark': 'linear-gradient(145deg, rgba(23, 23, 23, 0.9) 0%, rgba(38, 38, 38, 0.7) 100%)',
                'gradient-card': 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 245, 255, 0.9) 100%)',

                // Investment Performance Gradients
                'gradient-bullish': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                'gradient-bearish': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',

                // Legacy gradients (keeping for compatibility)
                'gradient-light': 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 50%, #e0f2fe 100%)',
                'gradient-light-subtle': 'linear-gradient(to bottom right, #f8fafc, #ffffff, #f1f5f9)',
                'gradient-purple-light': 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)',
                'gradient-purple-subtle': 'linear-gradient(to right, #e9d5ff, #f3e8ff, #faf5ff)',
            },
            boxShadow: {
                // Professional Investment Tool Shadows
                'investment': '0 4px 20px rgba(168, 85, 247, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
                'investment-lg': '0 12px 40px rgba(168, 85, 247, 0.12), 0 4px 6px rgba(0, 0, 0, 0.05)',
                'investment-xl': '0 20px 60px rgba(168, 85, 247, 0.15), 0 8px 10px rgba(0, 0, 0, 0.08)',

                // Glass & Elevated Effects
                'glass': '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                'glass-dark': '0 4px 20px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                'elevated': '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
                'elevated-lg': '0 8px 25px rgba(0, 0, 0, 0.08), 0 3px 10px rgba(0, 0, 0, 0.05)',

                // Interactive Shadows
                'interactive': '0 2px 8px rgba(168, 85, 247, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)',
                'interactive-hover': '0 8px 30px rgba(168, 85, 247, 0.25), 0 3px 10px rgba(0, 0, 0, 0.15)',

                // Status Shadows
                'success': '0 4px 20px rgba(34, 197, 94, 0.15)',
                'danger': '0 4px 20px rgba(239, 68, 68, 0.15)',
                'warning': '0 4px 20px rgba(245, 158, 11, 0.15)',

                // Legacy shadows (keeping for compatibility)
                'premium': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'premium-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
                'premium-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                'premium-purple': '0 10px 30px -5px rgba(168, 85, 247, 0.3)',
            },
            backdropBlur: {
                'xtract': '20px',
            },
            borderRadius: {
                'xtract': '16px',
            },
        },
    },
    plugins: [],
}
