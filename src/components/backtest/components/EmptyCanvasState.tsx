import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

interface EmptyCanvasStateProps {
    onBuildOwn: () => void;
    onLoadPresets: () => void;
    onLoadSaved: () => void;
}

// Sophisticated canvas preview showing what users will build
const CanvasPreview: React.FC<{ isDark: boolean }> = ({ isDark }) => (
    <div className="relative w-full h-28 overflow-hidden rounded-xl mb-8">
        {/* Dot grid background */}
        <div
            className={`absolute inset-0 ${isDark ? 'bg-white/[0.015]' : 'bg-slate-50/80'}`}
            style={{
                backgroundImage: isDark
                    ? 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)'
                    : 'radial-gradient(circle, rgba(100,116,139,0.08) 1px, transparent 1px)',
                backgroundSize: '16px 16px'
            }}
        />

        {/* Strategy flow visualization */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-3">
                {/* Portfolio Node 1 */}
                <div
                    className={`relative px-4 py-2.5 rounded-lg border shadow-sm animate-float ${isDark
                        ? 'bg-emerald-500/[0.08] border-emerald-500/20'
                        : 'bg-emerald-50/80 border-emerald-200/60'
                        }`}
                    style={{ animationDelay: '0s' }}
                >
                    <div className={`text-[11px] font-semibold tracking-wide ${isDark ? 'text-emerald-400/90' : 'text-emerald-700'}`}>
                        Growth
                    </div>
                    <div className={`text-[9px] mt-0.5 font-medium ${isDark ? 'text-emerald-400/50' : 'text-emerald-600/60'}`}>
                        SPY · QQQ · VTI
                    </div>
                </div>

                {/* Connection with rule indicator */}
                <div className="flex items-center">
                    <div className={`w-6 h-px ${isDark ? 'bg-gradient-to-r from-emerald-500/40 to-amber-500/40' : 'bg-gradient-to-r from-emerald-300 to-amber-300'}`} />
                    <div className={`px-2 py-0.5 rounded text-[8px] font-semibold tracking-wider uppercase ${isDark ? 'bg-amber-500/10 text-amber-400/70 border border-amber-500/20' : 'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}>
                        SMA
                    </div>
                    <div className={`w-6 h-px ${isDark ? 'bg-gradient-to-r from-amber-500/40 to-blue-500/40' : 'bg-gradient-to-r from-amber-300 to-blue-300'}`} />
                </div>

                {/* Portfolio Node 2 */}
                <div
                    className={`relative px-4 py-2.5 rounded-lg border shadow-sm animate-float ${isDark
                        ? 'bg-blue-500/[0.08] border-blue-500/20'
                        : 'bg-blue-50/80 border-blue-200/60'
                        }`}
                    style={{ animationDelay: '0.3s' }}
                >
                    <div className={`text-[11px] font-semibold tracking-wide ${isDark ? 'text-blue-400/90' : 'text-blue-700'}`}>
                        Defensive
                    </div>
                    <div className={`text-[9px] mt-0.5 font-medium ${isDark ? 'text-blue-400/50' : 'text-blue-600/60'}`}>
                        BND · TLT · GLD
                    </div>
                </div>
            </div>
        </div>

        {/* Soft edge fade */}
        <div className={`absolute inset-0 pointer-events-none ${isDark
            ? 'bg-gradient-to-r from-[#09090b] via-transparent to-[#09090b]'
            : 'bg-gradient-to-r from-white via-transparent to-white'
            }`} />
    </div>
);

// Strategy author pill - professional look
const StrategyAuthor: React.FC<{ name: string; isDark: boolean }> = ({ name, isDark }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded text-[11px] font-medium tracking-wide transition-colors ${isDark
        ? 'bg-white/[0.04] text-white/50 hover:text-white/70'
        : 'bg-slate-100 text-slate-500 hover:text-slate-700'
        }`}>
        {name}
    </span>
);

/**
 * EmptyCanvasState - Professional onboarding for the strategy canvas
 * Clearly communicates what Backfolio does while maintaining an elegant, trustworthy aesthetic
 */
export const EmptyCanvasState: React.FC<EmptyCanvasStateProps> = ({
    onBuildOwn,
    onLoadPresets,
    onLoadSaved,
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none px-4">
            {/* Subtle ambient background */}
            <div className={`absolute inset-0 ${isDark ? 'bg-[#09090b]' : 'bg-gradient-to-br from-slate-50 via-white to-slate-50'}`}>
                {isDark && (
                    <>
                        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-purple-500/[0.02] rounded-full blur-[120px]" />
                        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-blue-500/[0.02] rounded-full blur-[100px]" />
                    </>
                )}
            </div>

            <div className={`relative max-w-xl w-full pointer-events-auto rounded-2xl border overflow-hidden ${isDark
                ? 'bg-zinc-900/80 backdrop-blur-2xl border-white/[0.06] shadow-2xl shadow-black/50'
                : 'bg-white/95 backdrop-blur-xl border-slate-200 shadow-xl shadow-slate-200/50'
                }`}>
                {/* Subtle top border accent */}
                <div className={`absolute top-0 inset-x-0 h-px ${isDark
                    ? 'bg-gradient-to-r from-transparent via-white/10 to-transparent'
                    : 'bg-gradient-to-r from-transparent via-slate-300 to-transparent'
                    }`} />

                <div className="p-8 sm:p-10">
                    {/* Header section */}
                    <div className="text-center mb-2">
                        <h1 className={`text-2xl sm:text-3xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                            Tactical Strategy Builder
                        </h1>
                        <p className={`mt-2.5 text-[15px] leading-relaxed max-w-sm mx-auto ${isDark ? 'text-white/40' : 'text-slate-500'
                            }`}>
                            Backtest portfolios against historical data—from simple allocations to dynamic rule-based strategies
                        </p>
                    </div>

                    {/* Canvas preview */}
                    <CanvasPreview isDark={isDark} />

                    {/* Action cards */}
                    <div className="space-y-3">
                        {/* Primary: Presets - Best for first-time users */}
                        <button
                            onClick={onLoadPresets}
                            className={`w-full p-5 rounded-xl text-left transition-all duration-200 group ${isDark
                                ? 'bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.1]'
                                : 'bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark
                                    ? 'bg-purple-500/10 text-purple-400'
                                    : 'bg-purple-100 text-purple-600'
                                    }`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className={`text-[15px] font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            Start with a Preset Strategy
                                        </h3>
                                        <svg className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${isDark ? 'text-white/20' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                    <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                                        17 portfolios—from classic allocations to tactical strategies
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        <StrategyAuthor name="60/40" isDark={isDark} />
                                        <StrategyAuthor name="All Weather" isDark={isDark} />
                                        <StrategyAuthor name="Golden Butterfly" isDark={isDark} />
                                        <span className={`text-[11px] px-2 py-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>+14</span>
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* Secondary row: Build own + Load saved */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={onBuildOwn}
                                className={`p-4 rounded-xl text-left transition-all duration-200 group ${isDark
                                    ? 'bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08]'
                                    : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${isDark
                                    ? 'bg-white/[0.04] text-white/50'
                                    : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </div>
                                <h3 className={`text-sm font-medium ${isDark ? 'text-white/80' : 'text-slate-900'}`}>
                                    Build Custom
                                </h3>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-white/30' : 'text-slate-500'}`}>
                                    Start from scratch
                                </p>
                            </button>

                            <button
                                onClick={onLoadSaved}
                                className={`p-4 rounded-xl text-left transition-all duration-200 group ${isDark
                                    ? 'bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08]'
                                    : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${isDark
                                    ? 'bg-white/[0.04] text-white/50'
                                    : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                                    </svg>
                                </div>
                                <h3 className={`text-sm font-medium ${isDark ? 'text-white/80' : 'text-slate-900'}`}>
                                    Load Saved
                                </h3>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-white/30' : 'text-slate-500'}`}>
                                    Continue previous work
                                </p>
                            </button>
                        </div>
                    </div>

                    {/* Footer hint */}
                    <div className={`mt-6 pt-5 border-t text-center ${isDark ? 'border-white/[0.04]' : 'border-slate-100'}`}>
                        <p className={`text-[11px] tracking-wide ${isDark ? 'text-white/25' : 'text-slate-400'}`}>
                            Press <kbd className={`mx-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${isDark ? 'bg-white/[0.06] text-white/40' : 'bg-slate-100 text-slate-500'}`}>?</kbd> for documentation
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
