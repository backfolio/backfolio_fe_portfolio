import { useState, useEffect } from 'react';
import { SwitchingRule, Condition, SavedRule } from '../../../types/strategy';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useRuleLibrary } from '../../../hooks/useRuleLibrary';
import { TickerSearchInput } from '../components/TickerSearchInput';
import { RULE_PRESETS } from '../../../constants/strategy';

interface RuleCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (rule: Partial<SwitchingRule>) => void;
    /** Rules currently in the strategy (session rules) */
    strategyRules?: SwitchingRule[];
    /** Callback to update a session rule */
    onUpdateRule?: (ruleName: string, updates: Partial<SwitchingRule>) => void;
    /** Callback to delete a session rule */
    onDeleteRule?: (ruleName: string) => void;
}

// Convert RULE_PRESETS to RULE_TEMPLATES format
const RULE_TEMPLATES: { [key: string]: { name: string; condition: Condition } } = Object.entries(RULE_PRESETS).reduce((acc, [key, preset]) => {
    acc[key.toLowerCase().replace(/\s+/g, '_')] = {
        name: preset.name,
        condition: preset.condition as Condition
    };
    return acc;
}, {} as { [key: string]: { name: string; condition: Condition } });

export const RuleCreationModal: React.FC<RuleCreationModalProps> = ({
    isOpen,
    onClose,
    onCreate,
    strategyRules = [],
    onUpdateRule,
    onDeleteRule,
}) => {
    const [mode, setMode] = useState<'library' | 'custom' | 'template'>('library');
    const [ruleName, setRuleName] = useState('');
    const [ruleDescription, setRuleDescription] = useState('');
    const [addedTemplates, setAddedTemplates] = useState<Set<string>>(new Set());
    const [justCreatedRule, setJustCreatedRule] = useState<string | null>(null);
    const [saveToLibrary, setSaveToLibrary] = useState(true);
    const [editingRule, setEditingRule] = useState<SavedRule | null>(null);
    const [editingSessionRule, setEditingSessionRule] = useState<SwitchingRule | null>(null);
    const [templateBenchmark, setTemplateBenchmark] = useState('SPY');
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { isAuthenticated } = useAuth();

    // Rule library hook (fetches for authenticated users, uses sessionStorage for unauthenticated)
    const {
        rules: libraryRules,
        isLoading: isLoadingLibrary,
        error: libraryError,
        isEphemeral,
        saveRule,
        modifyRule,
        removeRule,
        copyRule,
        fetchRules,
    } = useRuleLibrary();

    // Check if user is not signed in (unauthenticated users use ephemeral rules)
    const isUnauthenticated = !isAuthenticated;

    useEffect(() => {
        if (!isOpen) {
            setAddedTemplates(new Set());
            setJustCreatedRule(null);
            setEditingRule(null);
            setEditingSessionRule(null);
            setRuleName('');
            setRuleDescription('');
            setSaveToLibrary(true);
        }
    }, [isOpen]);

    // Ensure saveToLibrary is always true for ephemeral users (no reason not to save to session)
    useEffect(() => {
        if (isOpen && isEphemeral) {
            setSaveToLibrary(true);
        }
    }, [isOpen, isEphemeral]);

    const [leftType, setLeftType] = useState('sma');
    const [leftSymbol, setLeftSymbol] = useState('SPY');
    const [leftPeriod, setLeftPeriod] = useState(50);
    const [comparison, setComparison] = useState<'>' | '<' | '>=' | '<=' | '=='>('>=');
    const [rightType, setRightType] = useState('constant');
    const [rightSymbol, setRightSymbol] = useState('SPY');
    const [rightPeriod, setRightPeriod] = useState(50);
    const [rightValue, setRightValue] = useState(0);

    // Smart constraint logic for condition builder
    // Bounded indicators (output in fixed range, should compare to constants)
    const OSCILLATOR_TYPES = ['rsi', 'hv', 'dd', 'roc', 'bb', 'macd'];
    // Price-derivative indicators (output in price units, can compare to each other)
    const PRICE_BASED_TYPES = ['price', 'sma', 'ema'];

    // Determine which right-side types are valid based on left-side type
    const getValidRightTypes = (leftType: string): string[] => {
        if (OSCILLATOR_TYPES.includes(leftType)) {
            // RSI and HV should only compare to constants
            return ['constant'];
        }
        // Price-based types can compare to constants or other price-based types
        return ['constant', ...PRICE_BASED_TYPES];
    };

    // Check if ticker should be locked to left side
    const shouldLockTicker = (leftType: string, rightType: string): boolean => {
        // If both sides are price-based, ticker must match
        return PRICE_BASED_TYPES.includes(leftType) && PRICE_BASED_TYPES.includes(rightType);
    };

    // Get helper text for right side constraints
    const getRightSideHelperText = (): string | null => {
        if (OSCILLATOR_TYPES.includes(leftType)) {
            const indicatorName = leftType.toUpperCase();
            const rangeHint = {
                rsi: '0-100, typically 30 (oversold) or 70 (overbought)',
                hv: '0-1, typically 0.15 (low vol) or 0.25 (high vol)',
                dd: '-1 to 0, typically -0.10 (10% dip) or -0.20 (20% dip)',
                roc: '%, typically ±5% for momentum shifts',
                bb: '0-1, typically 0.2 (oversold) or 0.8 (overbought)',
                macd: 'histogram value, 0 = neutral, >0 bullish, <0 bearish'
            }[leftType] || 'fixed range';
            return `${indicatorName} is a bounded indicator (${rangeHint}). Compare to a fixed threshold.`;
        }
        if (shouldLockTicker(leftType, rightType)) {
            return `Ticker automatically synced with left side for meaningful comparison.`;
        }
        return null;
    };

    // Auto-adjust right side when left side changes
    useEffect(() => {
        const validTypes = getValidRightTypes(leftType);
        if (!validTypes.includes(rightType)) {
            setRightType('constant');
        }
    }, [leftType]);

    // Auto-sync ticker when both sides are price-based
    useEffect(() => {
        if (shouldLockTicker(leftType, rightType)) {
            setRightSymbol(leftSymbol);
        }
    }, [leftSymbol, leftType, rightType]);

    // Load rule data into editor for editing
    const loadRuleForEditing = (rule: SavedRule) => {
        setEditingRule(rule);
        setRuleName(rule.name);
        setRuleDescription(rule.description || '');

        // Load condition into form if it's a simple condition
        if ('left' in rule.condition && 'right' in rule.condition) {
            const condition = rule.condition as Condition;

            // Left side
            const leftOp = condition.left;
            if (leftOp.type === 'Price') {
                setLeftType('price');
                setLeftSymbol(leftOp.symbol || 'SPY');
            } else if (leftOp.type === 'constant') {
                setLeftType('constant');
            } else {
                setLeftType(leftOp.type.toLowerCase());
                setLeftSymbol(leftOp.symbol || 'SPY');
                setLeftPeriod(leftOp.window || 50);
            }

            // Comparison
            setComparison(condition.comparison);

            // Right side
            const rightOp = condition.right;
            if (rightOp.type === 'Price') {
                setRightType('price');
                setRightSymbol(rightOp.symbol || 'SPY');
            } else if (rightOp.type === 'constant') {
                setRightType('constant');
                setRightValue(rightOp.value || 0);
            } else {
                setRightType(rightOp.type.toLowerCase());
                setRightSymbol(rightOp.symbol || 'SPY');
                setRightPeriod(rightOp.window || 50);
            }
        }

        setMode('custom');
    };

    // Load session rule (from current strategy) for editing
    const loadSessionRuleForEditing = (rule: SwitchingRule) => {
        setEditingSessionRule(rule);
        setEditingRule(null); // Clear library rule editing
        setRuleName(rule.name || '');
        setRuleDescription('');

        // Load condition into form
        if ('left' in rule.condition && 'right' in rule.condition) {
            const condition = rule.condition as Condition;

            // Left side
            const leftOp = condition.left;
            if (leftOp.type === 'Price') {
                setLeftType('price');
                setLeftSymbol(leftOp.symbol || 'SPY');
            } else if (leftOp.type === 'constant') {
                setLeftType('constant');
            } else {
                setLeftType(leftOp.type.toLowerCase());
                setLeftSymbol(leftOp.symbol || 'SPY');
                setLeftPeriod(leftOp.window || 50);
            }

            // Comparison
            setComparison(condition.comparison);

            // Right side
            const rightOp = condition.right;
            if (rightOp.type === 'Price') {
                setRightType('price');
                setRightSymbol(rightOp.symbol || 'SPY');
            } else if (rightOp.type === 'constant') {
                setRightType('constant');
                setRightValue(rightOp.value || 0);
            } else {
                setRightType(rightOp.type.toLowerCase());
                setRightSymbol(rightOp.symbol || 'SPY');
                setRightPeriod(rightOp.window || 50);
            }
        }

        setMode('custom');
    };

    const handleDeleteSessionRule = (ruleName: string) => {
        if (onDeleteRule && window.confirm(`Delete "${ruleName}" from this strategy? This cannot be undone.`)) {
            onDeleteRule(ruleName);
        }
    };

    const buildCondition = (): Condition => {
        // Indicator types must be fully uppercase for the backend
        type IndicatorType = 'SMA' | 'EMA' | 'RSI' | 'HV' | 'DD' | 'ROC' | 'BB' | 'MACD';
        const capitalizeType = (type: string): IndicatorType => {
            return type.toUpperCase() as IndicatorType;
        };

        // Build left side
        const leftSide: any = leftType === 'price'
            ? { type: 'Price', symbol: leftSymbol }
            : { type: capitalizeType(leftType), symbol: leftSymbol, window: leftPeriod };

        // Build right side
        const rightSide: any = rightType === 'constant'
            ? { type: 'constant', value: rightValue }
            : rightType === 'price'
                ? { type: 'Price', symbol: rightSymbol }
                : { type: capitalizeType(rightType), symbol: rightSymbol, window: rightPeriod };

        return {
            left: leftSide,
            comparison: comparison,
            right: rightSide,
        };
    };

    const generateRuleName = (): string => {
        const leftPreview = leftType === 'price'
            ? `Price(${leftSymbol})`
            : `${leftType.toUpperCase()}(${leftSymbol},${leftPeriod})`;

        const rightPreview = rightType === 'constant'
            ? String(rightValue)
            : rightType === 'price'
                ? `Price(${rightSymbol})`
                : `${rightType.toUpperCase()}(${rightSymbol},${rightPeriod})`;

        return `${leftPreview} ${comparison} ${rightPreview}`;
    };

    const handleCustomCreate = async () => {
        const condition = buildCondition();
        const finalName = ruleName.trim() || generateRuleName();

        // If editing a library rule, update it
        if (editingRule) {
            await modifyRule(editingRule.id, {
                name: finalName,
                description: ruleDescription,
                condition,
            });
            setEditingRule(null);
            setJustCreatedRule(finalName);
            setTimeout(() => setJustCreatedRule(null), 2000);
            resetForm();
            return;
        }

        // If editing a session rule, update it via callback
        if (editingSessionRule && onUpdateRule && editingSessionRule.name) {
            onUpdateRule(editingSessionRule.name, {
                name: finalName,
                condition,
                target_allocation: editingSessionRule.target_allocation, // preserve assignment
            });
            setEditingSessionRule(null);
            setJustCreatedRule(finalName);
            setTimeout(() => setJustCreatedRule(null), 2000);
            resetForm();
            return;
        }

        // Create the rule for the current strategy
        onCreate({
            name: finalName,
            target_allocation: undefined,
            condition,
        });

        // Save to library if checkbox is checked (works for both authenticated and unauthenticated)
        if (saveToLibrary) {
            await saveRule(finalName, condition, {
                description: ruleDescription,
            });
        }

        setJustCreatedRule(finalName);
        setTimeout(() => setJustCreatedRule(null), 2000);

        resetForm();
    };

    const resetForm = () => {
        setRuleName('');
        setRuleDescription('');
        setLeftType('sma');
        setLeftSymbol('SPY');
        setLeftPeriod(50);
        setComparison('>=');
        setRightType('constant');
        setRightSymbol('SPY');
        setRightPeriod(50);
        setRightValue(0);
        setEditingSessionRule(null);
    };

    const handleTemplateSelect = async (templateKey: string) => {
        const template = RULE_TEMPLATES[templateKey];
        if (!template) return;

        // Clone the condition and replace SPY with selected benchmark
        const condition: Condition = JSON.parse(JSON.stringify(template.condition));

        // Replace symbols in left side
        if (condition.left.symbol && condition.left.symbol === 'SPY') {
            condition.left.symbol = templateBenchmark;
        }

        // Replace symbols in right side
        if (condition.right.type !== 'constant' && condition.right.symbol && condition.right.symbol === 'SPY') {
            condition.right.symbol = templateBenchmark;
        }

        // Update name if benchmark changed from SPY
        let ruleName = template.name;
        if (templateBenchmark !== 'SPY') {
            ruleName = template.name.replace('SPY', templateBenchmark);
        }

        // Create the rule for the current strategy
        onCreate({
            name: ruleName,
            target_allocation: undefined,
            condition,
        });

        // Also save to library (ephemeral for unauthenticated, API for authenticated)
        await saveRule(ruleName, condition, {
            description: `Template rule: ${template.name}`,
        });

        // Mark as added with 3-second green checkmark animation
        setAddedTemplates(prev => new Set([...prev, templateKey]));
        setJustCreatedRule(ruleName);
        setTimeout(() => {
            setAddedTemplates(prev => {
                const next = new Set(prev);
                next.delete(templateKey);
                return next;
            });
            setJustCreatedRule(null);
        }, 3000);
    };

    // Set sensible default values when switching to oscillator types
    useEffect(() => {
        if (leftType === 'rsi') {
            setLeftPeriod(14); // Standard RSI period
            if (rightType === 'constant' && (rightValue === 0 || rightValue === 50)) {
                setRightValue(30); // Default to oversold threshold
            }
        } else if (leftType === 'hv') {
            setLeftPeriod(20); // Standard HV period
            if (rightType === 'constant' && (rightValue === 0 || rightValue === 30 || rightValue === 70)) {
                setRightValue(0.25); // Default to 25% volatility threshold
            }
        } else if (leftType === 'dd') {
            setLeftPeriod(50); // Standard DD lookback
            if (rightType === 'constant') {
                setRightValue(-0.10); // Default to -10% drawdown threshold
            }
        } else if (leftType === 'roc') {
            setLeftPeriod(10); // Standard ROC period
            if (rightType === 'constant') {
                setRightValue(5); // Default to +5% momentum threshold
            }
        } else if (leftType === 'bb') {
            setLeftPeriod(20); // Standard Bollinger period
            if (rightType === 'constant') {
                setRightValue(0.2); // Default to oversold threshold
            }
        } else if (leftType === 'macd') {
            setLeftPeriod(12); // Use for display, actual MACD uses 12,26,9
            if (rightType === 'constant') {
                setRightValue(0); // Default to zero crossing
            }
        }
    }, [leftType]);

    const handleClose = () => {
        resetForm();
        setAddedTemplates(new Set());
        setJustCreatedRule(null);
        setEditingRule(null);
        setEditingSessionRule(null);
        onClose();
    };

    const handleDuplicateLibraryRule = async (rule: SavedRule) => {
        const newRule = await copyRule(rule.id);
        if (newRule) {
            // Optionally switch to editing the duplicated rule
            // loadRuleForEditing(newRule);
        }
    };

    const handleDeleteLibraryRule = async (rule: SavedRule) => {
        if (window.confirm(`Delete "${rule.name}" from your library? This cannot be undone.`)) {
            await removeRule(rule.id);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className={`relative w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isDark ? 'bg-[#0f0f0f] border-2 border-white/[0.08]' : 'bg-white border-2 border-slate-200'
                    }`}
            >
                {/* Header */}
                <div className="px-6 py-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {(editingRule || editingSessionRule) ? 'Edit Rule' : 'Manage Rules'}
                        </h2>
                        <button
                            onClick={handleClose}
                            className={`p-2 rounded-lg transition-colors ${isDark
                                ? 'text-gray-400 hover:bg-white/[0.05] hover:text-white'
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 3-Tab Navigation */}
                <div className={`px-6 py-3 flex-shrink-0 ${isDark ? 'border-b border-white/[0.08]' : 'border-b border-slate-200'}`}>
                    <div className={`inline-flex gap-1 rounded-lg p-1 w-full ${isDark ? 'bg-white/[0.03]' : 'bg-slate-100'}`}>
                        <button
                            onClick={() => setMode('library')}
                            className={`flex-1 px-3 py-2 rounded-md font-medium text-sm transition-all ${mode === 'library'
                                ? isDark
                                    ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/30'
                                    : 'bg-white text-emerald-700 shadow-sm border border-emerald-200'
                                : isDark
                                    ? 'text-gray-400 hover:text-gray-200'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-1.5">
                                <span>Library</span>
                                {libraryRules.length > 0 && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${mode === 'library'
                                        ? isDark ? 'bg-emerald-500/30 text-emerald-200' : 'bg-emerald-200 text-emerald-700'
                                        : isDark ? 'bg-white/[0.1] text-gray-500' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                        {libraryRules.length}
                                    </span>
                                )}
                            </div>
                        </button>
                        <button
                            onClick={() => { setMode('custom'); setEditingRule(null); }}
                            className={`flex-1 px-3 py-2 rounded-md font-medium text-sm transition-all ${mode === 'custom'
                                ? isDark
                                    ? 'bg-purple-500/20 text-purple-300 shadow-sm border border-purple-500/30'
                                    : 'bg-white text-purple-700 shadow-sm border border-purple-200'
                                : isDark
                                    ? 'text-gray-400 hover:text-gray-200'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Custom
                        </button>
                        <button
                            onClick={() => setMode('template')}
                            className={`flex-1 px-3 py-2 rounded-md font-medium text-sm transition-all ${mode === 'template'
                                ? isDark
                                    ? 'bg-purple-500/20 text-purple-300 shadow-sm border border-purple-500/30'
                                    : 'bg-white text-purple-700 shadow-sm border border-purple-200'
                                : isDark
                                    ? 'text-gray-400 hover:text-gray-200'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Templates
                        </button>
                    </div>
                </div>

                {/* Content - Scrollable with fixed height for consistency */}
                <div className="h-[550px] overflow-y-auto px-6 py-4">
                    {/* Library Tab - Session Rules + Saved Rules */}
                    {mode === 'library' && (
                        <div className="space-y-4">
                            {/* Session Rules Section - Always show if there are rules in current strategy */}
                            {strategyRules.length > 0 && (
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                                            <svg className={`w-3 h-3 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p className={`text-xs font-semibold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                                            Current Strategy Rules
                                        </p>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
                                            {strategyRules.length}
                                        </span>
                                    </div>
                                    <p className={`text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                                        Rules in this strategy session — edit or delete them here
                                    </p>
                                    {strategyRules.map((rule) => {
                                        // Generate condition summary - handles both simple and composite conditions
                                        const getConditionSummary = (): string => {
                                            const condition = rule.condition;
                                            if ('left' in condition && 'right' in condition && 'comparison' in condition) {
                                                const simpleCondition = condition as Condition;
                                                const left = simpleCondition.left;
                                                const right = simpleCondition.right;
                                                const leftStr = left.type === 'Price'
                                                    ? `Price(${left.symbol})`
                                                    : left.type === 'constant'
                                                        ? String((left as any).value)
                                                        : `${left.type}(${left.symbol},${(left as any).window})`;
                                                const rightStr = right.type === 'Price'
                                                    ? `Price(${right.symbol})`
                                                    : right.type === 'constant'
                                                        ? String((right as any).value)
                                                        : `${right.type}(${right.symbol},${(right as any).window})`;
                                                return `${leftStr} ${simpleCondition.comparison} ${rightStr}`;
                                            }
                                            return 'Complex condition';
                                        };

                                        return (
                                            <div
                                                key={rule.name}
                                                className={`group p-4 rounded-xl border-2 transition-all ${isDark
                                                    ? 'border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40'
                                                    : 'border-amber-200 bg-amber-50/50 hover:border-amber-300'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                                {rule.name}
                                                            </h3>
                                                        </div>
                                                        <p className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                                                            {getConditionSummary()}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {onUpdateRule && (
                                                            <button
                                                                onClick={() => loadSessionRuleForEditing(rule)}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isDark
                                                                    ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                                                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                                    }`}
                                                                title="Edit this rule"
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
                                                        {onDeleteRule && rule.name && (
                                                            <button
                                                                onClick={() => handleDeleteSessionRule(rule.name!)}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isDark
                                                                    ? 'text-red-400 hover:bg-red-500/20'
                                                                    : 'text-red-600 hover:bg-red-100'
                                                                    }`}
                                                                title="Delete this rule"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Divider between session and library rules */}
                            {strategyRules.length > 0 && !isUnauthenticated && (
                                <div className={`border-t ${isDark ? 'border-white/[0.08]' : 'border-slate-200'}`} />
                            )}

                            {/* Library Rules Section */}
                            {isLoadingLibrary ? (
                                <div className={`flex flex-col items-center justify-center h-32 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                    <div className="animate-spin w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                                    <p className="text-xs">Loading your rule library...</p>
                                </div>
                            ) : libraryError ? (
                                /* Other errors - show error state */
                                <div className={`flex flex-col items-center justify-center py-8 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                                    <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-sm font-medium mb-1">Failed to load library</p>
                                    <p className="text-xs mb-2">{libraryError}</p>
                                    <button
                                        onClick={() => fetchRules()}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-200 hover:bg-slate-300'}`}
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : libraryRules.length > 0 ? (
                                <div className="space-y-2.5">
                                    {/* Ephemeral banner for unauthenticated users */}
                                    {isEphemeral && (
                                        <div className={`p-3 rounded-lg border ${isDark ? 'border-amber-500/30 bg-amber-500/10' : 'border-amber-200 bg-amber-50'}`}>
                                            <div className="flex items-start gap-2">
                                                <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div>
                                                    <p className={`text-xs font-medium ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                                                        Session rules — will be cleared on refresh
                                                    </p>
                                                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-amber-400/70' : 'text-amber-600/80'}`}>
                                                        Sign in to save rules permanently across sessions
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isEphemeral
                                            ? (isDark ? 'bg-amber-500/20' : 'bg-amber-100')
                                            : (isDark ? 'bg-emerald-500/20' : 'bg-emerald-100')
                                            }`}>
                                            <svg className={`w-3 h-3 ${isEphemeral
                                                ? (isDark ? 'text-amber-400' : 'text-amber-600')
                                                : (isDark ? 'text-emerald-400' : 'text-emerald-600')
                                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                            </svg>
                                        </div>
                                        <p className={`text-xs font-semibold ${isEphemeral
                                            ? (isDark ? 'text-amber-300' : 'text-amber-700')
                                            : (isDark ? 'text-emerald-300' : 'text-emerald-700')
                                            }`}>
                                            {isEphemeral ? 'Session Library' : 'Saved Library'}
                                        </p>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isEphemeral
                                            ? (isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700')
                                            : (isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700')
                                            }`}>
                                            {libraryRules.length}
                                        </span>
                                    </div>
                                    <p className={`text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                                        {isEphemeral
                                            ? 'Your rules for this session — reusable across strategies'
                                            : 'Your saved rules — available across all strategies'
                                        }
                                    </p>
                                    {libraryRules.map((rule) => (
                                        <div
                                            key={rule.id}
                                            className={`group p-4 rounded-xl border-2 transition-all ${isEphemeral
                                                ? (isDark
                                                    ? 'border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40'
                                                    : 'border-amber-200 bg-amber-50/50 hover:border-amber-300')
                                                : (isDark
                                                    ? 'border-white/[0.1] bg-white/[0.02] hover:border-white/[0.2]'
                                                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300')
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`font-bold truncate mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                        {rule.name}
                                                    </h3>
                                                    <p className={`text-xs font-mono mb-2 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                                                        {rule.condition_summary || 'Complex condition'}
                                                    </p>
                                                    {rule.description && (
                                                        <p className={`text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                                                            {rule.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => loadRuleForEditing(rule)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isDark
                                                            ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                                                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                            }`}
                                                        title="Edit this rule"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDuplicateLibraryRule(rule)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isDark
                                                            ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                                                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                                            }`}
                                                        title="Duplicate this rule"
                                                    >
                                                        Copy
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteLibraryRule(rule)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isDark
                                                            ? 'text-red-400 hover:bg-red-500/20'
                                                            : 'text-red-600 hover:bg-red-100'
                                                            }`}
                                                        title="Delete this rule"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            {/* Empty state - show if both session and library are empty */}
                            {strategyRules.length === 0 && libraryRules.length === 0 && !isLoadingLibrary && !libraryError && (
                                <div className={`flex flex-col items-center justify-center h-64 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                    <svg className={`w-16 h-16 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <p className="text-sm font-medium mb-1">No rules yet</p>
                                    <p className="text-xs mb-4 text-center max-w-xs">
                                        {isEphemeral
                                            ? 'Create rules using the Custom or Templates tab. Rules will be saved for this session.'
                                            : 'Create custom rules using the Custom tab'
                                        }
                                    </p>
                                    <button
                                        onClick={() => setMode('custom')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark
                                            ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                            }`}
                                    >
                                        Create Your First Rule
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Template Tab */}
                    {mode === 'template' && (
                        <div className="space-y-3">
                            {/* Benchmark Selector */}
                            <div className="flex items-center gap-3 pb-2 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                                <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    Benchmark:
                                </label>
                                <select
                                    value={templateBenchmark}
                                    onChange={(e) => setTemplateBenchmark(e.target.value)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${isDark
                                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                        : 'bg-white border-slate-200 text-slate-900 hover:border-purple-300'
                                        }`}
                                >
                                    <option value="SPY" className={isDark ? 'bg-slate-800 text-white' : ''}>SPY (S&P 500)</option>
                                    <option value="QQQ" className={isDark ? 'bg-slate-800 text-white' : ''}>QQQ (Nasdaq 100)</option>
                                    <option value="IWM" className={isDark ? 'bg-slate-800 text-white' : ''}>IWM (Russell 2000)</option>
                                    <option value="DIA" className={isDark ? 'bg-slate-800 text-white' : ''}>DIA (Dow Jones)</option>
                                    <option value="VTI" className={isDark ? 'bg-slate-800 text-white' : ''}>VTI (Total Market)</option>
                                </select>
                            </div>

                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                Select a template to create a new rule
                            </p>
                            {Object.entries(RULE_TEMPLATES).map(([key, template]) => {
                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleTemplateSelect(String(key))}
                                        className={`group w-full p-4 rounded-xl border-2 transition-all text-left hover:scale-[1.01] active:scale-[0.99] ${isDark
                                            ? 'border-white/[0.1] bg-white/[0.02] hover:border-purple-500/30 hover:bg-purple-500/5'
                                            : 'border-slate-200 bg-slate-50/50 hover:border-purple-300 hover:bg-purple-50/50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex-1">
                                                <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                    {templateBenchmark !== 'SPY' ? template.name.replace('SPY', templateBenchmark) : template.name}
                                                </h3>
                                                <p className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                                                    {template.condition.left.symbol ? templateBenchmark : ''}{' '}
                                                    {template.condition.left.type}
                                                    {(template.condition.left as any).window && `(${(template.condition.left as any).window})`}
                                                    {' '}{template.condition.comparison}{' '}
                                                    {template.condition.right.type === 'constant'
                                                        ? (template.condition.right as any).value
                                                        : `${templateBenchmark} ${template.condition.right.type}${(template.condition.right as any).window ? `(${(template.condition.right as any).window})` : ''}`}
                                                </p>
                                            </div>
                                            {addedTemplates.has(key) ? (
                                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                                    <svg className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <svg
                                                    className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${isDark ? 'text-gray-500 group-hover:text-purple-400' : 'text-slate-400 group-hover:text-purple-600'
                                                        }`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Custom Tab */}
                    {mode === 'custom' && (
                        <div className="space-y-4">
                            {/* Rule Name Input */}
                            <div>
                                <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    Rule Name {editingRule ? '' : '(optional)'}
                                </label>
                                <input
                                    type="text"
                                    value={ruleName}
                                    onChange={(e) => setRuleName(e.target.value)}
                                    placeholder={editingRule ? "Enter rule name" : "Leave empty for auto-generated name"}
                                    className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark
                                        ? 'bg-white/[0.03] border-white/[0.1] text-white placeholder-gray-500'
                                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                                        }`}
                                />
                            </div>

                            {/* Description Input (for library) */}
                            <div>
                                <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    Description (optional)
                                </label>
                                <input
                                    type="text"
                                    value={ruleDescription}
                                    onChange={(e) => setRuleDescription(e.target.value)}
                                    placeholder="Brief description for your rule library"
                                    className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark
                                        ? 'bg-white/[0.03] border-white/[0.1] text-white placeholder-gray-500'
                                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                                        }`}
                                />
                            </div>

                            {/* Condition Builder */}
                            <div className={`pt-3 border-t ${isDark ? 'border-white/[0.08]' : 'border-slate-200'}`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={`w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0`}>
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        Build Condition
                                    </h3>
                                </div>

                                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
                                    {/* Left Side */}
                                    <div className={`p-4 rounded-lg border ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>LEFT SIDE</p>
                                            {OSCILLATOR_TYPES.includes(leftType) && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
                                                    Oscillator
                                                </span>
                                            )}
                                            {PRICE_BASED_TYPES.includes(leftType) && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                                                    Price-based
                                                </span>
                                            )}
                                        </div>
                                        <select
                                            value={leftType}
                                            onChange={(e) => setLeftType(e.target.value)}
                                            className={`w-full mb-3 px-3 py-2 rounded border text-sm ${isDark ? 'bg-black/30 border-white/[0.1] text-white' : 'bg-white border-slate-300 text-slate-900'
                                                }`}
                                        >
                                            <optgroup label="Price-Based">
                                                <option value="price">Price - Close Price</option>
                                                <option value="sma">SMA - Simple Moving Avg</option>
                                                <option value="ema">EMA - Exponential Moving Avg</option>
                                            </optgroup>
                                            <optgroup label="Momentum (TIER 1)">
                                                <option value="rsi">RSI - Relative Strength Index (0-100)</option>
                                                <option value="roc">ROC - Rate of Change (%)</option>
                                                <option value="macd">MACD - Histogram</option>
                                            </optgroup>
                                            <optgroup label="Mean Reversion (TIER 1)">
                                                <option value="dd">DD - Drawdown from High (%)</option>
                                            </optgroup>
                                            <optgroup label="Volatility-Adjusted (TIER 2)">
                                                <option value="hv">HV - Historical Volatility</option>
                                                <option value="bb">BB - Bollinger %B (0-1)</option>
                                            </optgroup>
                                        </select>

                                        <TickerSearchInput
                                            value={leftSymbol}
                                            onChange={setLeftSymbol}
                                            placeholder="Symbol (e.g., SPY)"
                                            className={`w-full mb-2 px-3 py-2 rounded border text-sm ${isDark ? 'bg-black/30 border-white/[0.1] text-white placeholder-gray-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                                                }`}
                                        />

                                        {leftType !== 'price' && (
                                            <input
                                                type="number"
                                                value={leftPeriod}
                                                onChange={(e) => setLeftPeriod(parseInt(e.target.value, 10))}
                                                placeholder={leftType === 'rsi' ? "Period (default: 14)" : leftType === 'hv' ? "Period (default: 20)" : "Period (days)"}
                                                className={`w-full px-3 py-2 rounded border text-sm ${isDark ? 'bg-black/30 border-white/[0.1] text-white placeholder-gray-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                                                    }`}
                                            />
                                        )}
                                    </div>

                                    {/* Operator */}
                                    <div className="flex items-center justify-center pt-8">
                                        <select
                                            value={comparison}
                                            onChange={(e) => setComparison(e.target.value as any)}
                                            className={`px-3 py-2 rounded-lg border font-mono text-sm ${isDark ? 'bg-purple-500/20 border-purple-500/30 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'
                                                }`}
                                        >
                                            <option value=">">{'>'}</option>
                                            <option value="<">{'<'}</option>
                                            <option value=">=">{'>='}</option>
                                            <option value="<=">{'<='}</option>
                                            <option value="==">{'=='}</option>
                                        </select>
                                    </div>

                                    {/* Right Side */}
                                    <div className={`p-4 rounded-lg border ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
                                        <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>RIGHT SIDE</p>
                                        <select
                                            value={rightType}
                                            onChange={(e) => setRightType(e.target.value)}
                                            className={`w-full mb-3 px-3 py-2 rounded border text-sm ${isDark ? 'bg-black/30 border-white/[0.1] text-white' : 'bg-white border-slate-300 text-slate-900'
                                                }`}
                                        >
                                            <option value="constant">Constant - Fixed Number</option>
                                            {getValidRightTypes(leftType).includes('price') && (
                                                <option value="price">Price - Close Price</option>
                                            )}
                                            {getValidRightTypes(leftType).includes('sma') && (
                                                <option value="sma">SMA - Simple Moving Avg</option>
                                            )}
                                            {getValidRightTypes(leftType).includes('ema') && (
                                                <option value="ema">EMA - Exponential Moving Avg</option>
                                            )}
                                        </select>

                                        {rightType === 'constant' ? (
                                            <div>
                                                <input
                                                    type="number"
                                                    value={rightValue}
                                                    onChange={(e) => setRightValue(parseFloat(e.target.value))}
                                                    placeholder={leftType === 'rsi' ? "e.g., 30 or 70" : leftType === 'hv' ? "e.g., 0.25" : "Value"}
                                                    className={`w-full px-3 py-2 rounded border text-sm ${isDark ? 'bg-black/30 border-white/[0.1] text-white placeholder-gray-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                                                        }`}
                                                />
                                                {/* Quick preset buttons for RSI */}
                                                {leftType === 'rsi' && (
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setRightValue(30)}
                                                            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${rightValue === 30
                                                                ? isDark ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'bg-purple-100 text-purple-700 border border-purple-300'
                                                                : isDark ? 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.1]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                                }`}
                                                        >
                                                            30 (Oversold)
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setRightValue(70)}
                                                            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${rightValue === 70
                                                                ? isDark ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'bg-purple-100 text-purple-700 border border-purple-300'
                                                                : isDark ? 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.1]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                                }`}
                                                        >
                                                            70 (Overbought)
                                                        </button>
                                                    </div>
                                                )}
                                                {/* Quick preset buttons for HV */}
                                                {leftType === 'hv' && (
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setRightValue(0.15)}
                                                            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${rightValue === 0.15
                                                                ? isDark ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'bg-purple-100 text-purple-700 border border-purple-300'
                                                                : isDark ? 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.1]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                                }`}
                                                        >
                                                            15% (Low)
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setRightValue(0.25)}
                                                            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${rightValue === 0.25
                                                                ? isDark ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'bg-purple-100 text-purple-700 border border-purple-300'
                                                                : isDark ? 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.1]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                                }`}
                                                        >
                                                            25% (High)
                                                        </button>
                                                    </div>
                                                )}
                                                {/* Quick preset buttons for DD (Drawdown) */}
                                                {leftType === 'dd' && (
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setRightValue(-0.10)}
                                                            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${rightValue === -0.10
                                                                ? isDark ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'bg-purple-100 text-purple-700 border border-purple-300'
                                                                : isDark ? 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.1]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                                }`}
                                                        >
                                                            -10% (Dip)
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setRightValue(-0.20)}
                                                            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${rightValue === -0.20
                                                                ? isDark ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'bg-purple-100 text-purple-700 border border-purple-300'
                                                                : isDark ? 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.1]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                                }`}
                                                        >
                                                            -20% (Major)
                                                        </button>
                                                    </div>
                                                )}
                                                {/* Quick preset buttons for ROC (Rate of Change) */}
                                                {leftType === 'roc' && (
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setRightValue(5)}
                                                            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${rightValue === 5
                                                                ? isDark ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'bg-purple-100 text-purple-700 border border-purple-300'
                                                                : isDark ? 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.1]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                                }`}
                                                        >
                                                            +5% (Bullish)
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setRightValue(-5)}
                                                            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${rightValue === -5
                                                                ? isDark ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'bg-purple-100 text-purple-700 border border-purple-300'
                                                                : isDark ? 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.1]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                                }`}
                                                        >
                                                            -5% (Bearish)
                                                        </button>
                                                    </div>
                                                )}
                                                {/* Quick preset buttons for BB (Bollinger %B) */}
                                                {leftType === 'bb' && (
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setRightValue(0.2)}
                                                            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${rightValue === 0.2
                                                                ? isDark ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'bg-purple-100 text-purple-700 border border-purple-300'
                                                                : isDark ? 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.1]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                                }`}
                                                        >
                                                            0.2 (Oversold)
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setRightValue(0.8)}
                                                            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${rightValue === 0.8
                                                                ? isDark ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'bg-purple-100 text-purple-700 border border-purple-300'
                                                                : isDark ? 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.1]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                                }`}
                                                        >
                                                            0.8 (Overbought)
                                                        </button>
                                                    </div>
                                                )}
                                                {/* Quick preset buttons for MACD */}
                                                {leftType === 'macd' && (
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setRightValue(0)}
                                                            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${rightValue === 0
                                                                ? isDark ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'bg-purple-100 text-purple-700 border border-purple-300'
                                                                : isDark ? 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.1]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                                }`}
                                                        >
                                                            0 (Zero Cross)
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                <div className="relative">
                                                    {shouldLockTicker(leftType, rightType) ? (
                                                        /* Locked ticker - show simple display */
                                                        <div className={`w-full mb-2 px-3 py-2 rounded border text-sm flex items-center justify-between ${isDark
                                                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                                                            : 'bg-purple-50 border-purple-200 text-purple-700'
                                                            }`}
                                                        >
                                                            <span className="font-medium">{rightSymbol}</span>
                                                            <svg className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        /* Unlocked - show autocomplete */
                                                        <TickerSearchInput
                                                            value={rightSymbol}
                                                            onChange={setRightSymbol}
                                                            placeholder="Symbol (e.g., SPY)"
                                                            className={`w-full mb-2 px-3 py-2 rounded border text-sm ${isDark
                                                                ? 'bg-black/30 border-white/[0.1] text-white placeholder-gray-500'
                                                                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                                                                }`}
                                                        />
                                                    )}
                                                </div>
                                                {rightType !== 'price' && (
                                                    <input
                                                        type="number"
                                                        value={rightPeriod}
                                                        onChange={(e) => setRightPeriod(parseInt(e.target.value, 10))}
                                                        placeholder="Period (days)"
                                                        className={`w-full px-3 py-2 rounded border text-sm ${isDark ? 'bg-black/30 border-white/[0.1] text-white placeholder-gray-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                                                            }`}
                                                    />
                                                )}
                                            </>
                                        )}

                                        {/* Helper text explaining constraints */}
                                        {getRightSideHelperText() && (
                                            <div className={`mt-2 flex items-start gap-1.5 text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                                                <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>{getRightSideHelperText()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Save to Library Checkbox (only for authenticated users creating new rules) */}
                                {/* For ephemeral users, rules are always saved to session library automatically */}
                                {!editingRule && !editingSessionRule && !isEphemeral && (
                                    <div className="mt-4">
                                        <div className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                            <input
                                                type="checkbox"
                                                id="saveToLibrary"
                                                checked={saveToLibrary}
                                                onChange={(e) => setSaveToLibrary(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                            />
                                            <label htmlFor="saveToLibrary" className="text-sm cursor-pointer">
                                                Save to my rule library for future use
                                            </label>
                                        </div>
                                        {!saveToLibrary && (
                                            <p className={`mt-1.5 text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                                                Won't be saved for future use
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Editing indicator for session rules */}
                                {editingSessionRule && (
                                    <div className={`mt-4 p-3 rounded-lg border ${isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
                                        <div className="flex items-center gap-2">
                                            <svg className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            <span className={`text-xs font-medium ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                                                Editing: {editingSessionRule.name}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Create/Update Button */}
                                <div className="mt-4">
                                    <button
                                        onClick={handleCustomCreate}
                                        className={`w-full px-6 py-3 font-bold text-sm rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 ${justCreatedRule
                                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                                            : editingSessionRule
                                                ? isDark
                                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white hover:shadow-amber-500/30'
                                                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                                                : isDark
                                                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white hover:shadow-purple-500/30'
                                                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                                            }`}
                                    >
                                        {justCreatedRule ? (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span>{(editingRule || editingSessionRule) ? 'Rule Updated!' : 'Rule Created!'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={(editingRule || editingSessionRule) ? "M5 13l4 4L19 7" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                                                </svg>
                                                <span>{editingRule ? 'Update Library Rule' : editingSessionRule ? 'Update Rule' : 'Create Rule'}</span>
                                            </>
                                        )}
                                    </button>
                                    {(editingRule || editingSessionRule) && (
                                        <button
                                            onClick={() => {
                                                setEditingRule(null);
                                                setEditingSessionRule(null);
                                                resetForm();
                                            }}
                                            className={`w-full mt-2 px-6 py-2 font-medium text-sm rounded-lg transition-all ${isDark
                                                ? 'bg-white/[0.05] text-gray-300 hover:bg-white/[0.1]'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            Cancel Editing
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
