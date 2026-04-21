import { SwitchingRule } from '../../../types/strategy';
import { useTheme } from '../../../context/ThemeContext';

interface RuleCardProps {
    rule: SwitchingRule;
    ruleName: string;
    timesInChain: number;  // How many times this rule appears in the chain
    isChainEmpty: boolean;
    onAdd: (operator?: 'AND' | 'OR') => void;
}

export const RuleCard: React.FC<RuleCardProps> = ({
    rule,
    ruleName,
    timesInChain,
    isChainEmpty,
    onAdd,
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div
            className={`w-full p-4 border-2 rounded-xl transition-all ${isDark
                ? 'border-white/[0.15] hover:border-white/[0.25] hover:bg-white/[0.02]'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {ruleName}
                        </h3>
                        {timesInChain > 0 && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDark
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                ×{timesInChain} in expression
                            </span>
                        )}
                    </div>
                    {rule.condition && 'left' in rule.condition && (
                        <div
                            className={`text-xs mt-2 font-mono p-2 rounded ${isDark ? 'bg-black/30 text-gray-300' : 'bg-white text-slate-600'
                                }`}
                        >
                            <span className="font-semibold text-purple-500">
                                {rule.condition.left.type}
                            </span>
                            {rule.condition.left.symbol && (
                                <span className={isDark ? 'text-gray-500' : 'text-slate-500'}>
                                    ({rule.condition.left.symbol}, {rule.condition.left.window}d)
                                </span>
                            )}
                            <span className="mx-1 text-purple-600 font-bold">
                                {rule.condition.comparison}
                            </span>
                            <span className="font-semibold text-blue-500">
                                {rule.condition.right.value !== undefined
                                    ? rule.condition.right.value
                                    : rule.condition.right.type}
                            </span>
                            {rule.condition.right.value === undefined && rule.condition.right.symbol && (
                                <span className={isDark ? 'text-gray-500' : 'text-slate-500'}>
                                    ({rule.condition.right.symbol}, {rule.condition.right.window}d)
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    {!isChainEmpty && (
                        <>
                            <button
                                onClick={() => onAdd('AND')}
                                className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                + AND
                            </button>
                            <button
                                onClick={() => onAdd('OR')}
                                className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                                + OR
                            </button>
                        </>
                    )}
                    {isChainEmpty && (
                        <button
                            onClick={() => onAdd()}
                            className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${isDark
                                ? 'bg-purple-500 hover:bg-purple-600 text-white'
                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                                }`}
                        >
                            Add
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
