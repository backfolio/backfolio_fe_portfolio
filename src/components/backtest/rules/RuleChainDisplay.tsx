import { useTheme } from '../../../context/ThemeContext';
import { LogicalOperator } from './RuleComposite';

interface RuleChainDisplayProps {
    ruleNames: string[];
    operators: LogicalOperator[];
    expression: string;
    onRemove: (index: number) => void;
    onOperatorChange: (index: number, operator: LogicalOperator) => void;
}

export const RuleChainDisplay: React.FC<RuleChainDisplayProps> = ({
    ruleNames,
    operators,
    expression,
    onRemove,
    onOperatorChange,
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    if (ruleNames.length === 0) return null;

    return (
        <div
            className={`mb-6 p-4 rounded-xl border-2 ${isDark
                    ? 'bg-purple-500/10 border-purple-500/30'
                    : 'bg-purple-50 border-purple-200'
                }`}
        >
            <div className="flex items-center gap-2 mb-3">
                <svg
                    className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                </svg>
                <h3 className={`font-bold ${isDark ? 'text-purple-300' : 'text-purple-900'}`}>
                    Rule Expression
                </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {ruleNames.map((ruleName, index) => (
                    <div key={index} className="flex items-center gap-2">
                        {/* Rule Pill */}
                        <div
                            className={`flex items-center gap-2 border-2 rounded-lg px-3 py-2 shadow-sm ${isDark
                                    ? 'bg-white/[0.05] border-purple-500/50'
                                    : 'bg-white border-purple-300'
                                }`}
                        >
                            <span
                                className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'
                                    }`}
                            >
                                {ruleName}
                            </span>
                            <button
                                onClick={() => onRemove(index)}
                                className={`p-0.5 rounded transition-colors ${isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-100'
                                    }`}
                            >
                                <svg
                                    className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-600'
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Operator Toggle */}
                        {index < ruleNames.length - 1 && (
                            <div
                                className={`flex gap-1 rounded-lg p-1 ${isDark ? 'bg-white/[0.05]' : 'bg-slate-100'
                                    }`}
                            >
                                <button
                                    onClick={() => onOperatorChange(index, 'AND')}
                                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${operators[index] === 'AND'
                                            ? 'bg-blue-500 text-white shadow'
                                            : isDark
                                                ? 'bg-transparent text-gray-400 hover:bg-white/[0.05]'
                                                : 'bg-transparent text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    AND
                                </button>
                                <button
                                    onClick={() => onOperatorChange(index, 'OR')}
                                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${operators[index] === 'OR'
                                            ? 'bg-emerald-500 text-white shadow'
                                            : isDark
                                                ? 'bg-transparent text-gray-400 hover:bg-white/[0.05]'
                                                : 'bg-transparent text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    OR
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div
                className={`mt-3 text-xs font-mono p-2 rounded border ${isDark
                        ? 'text-gray-300 bg-black/30 border-purple-500/30'
                        : 'text-slate-600 bg-white border-purple-200'
                    }`}
            >
                {expression}
            </div>
        </div>
    );
};
