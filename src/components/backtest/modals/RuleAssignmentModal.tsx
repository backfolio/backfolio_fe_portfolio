import { useState, useEffect } from 'react';
import { SavedRule, SwitchingRule, Condition } from '../../../types/strategy';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useRuleLibrary } from '../../../hooks/useRuleLibrary';
import {
    LogicalOperator,
    RuleChainDisplay,
} from '../rules';

// Inline component for library rules
interface LibraryRuleCardProps {
    rule: SavedRule;
    timesInChain: number;
    isChainEmpty: boolean;
    onAdd: (operator?: 'AND' | 'OR') => void;
}

const LibraryRuleCard: React.FC<LibraryRuleCardProps> = ({
    rule,
    timesInChain,
    isChainEmpty,
    onAdd,
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div
            className={`w-full p-4 border-2 rounded-xl transition-all ${isDark
                ? 'border-white/[0.1] bg-white/[0.02] hover:border-white/[0.25]'
                : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                }`}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {rule.name}
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
                                {(rule.condition as Condition).left.type}
                            </span>
                            {(rule.condition as Condition).left.symbol && (
                                <span className={isDark ? 'text-gray-500' : 'text-slate-500'}>
                                    ({(rule.condition as Condition).left.symbol}, {(rule.condition as Condition).left.window}d)
                                </span>
                            )}
                            <span className="mx-1 text-purple-600 font-bold">
                                {(rule.condition as Condition).comparison}
                            </span>
                            <span className="font-semibold text-blue-500">
                                {(rule.condition as Condition).right.value !== undefined
                                    ? (rule.condition as Condition).right.value
                                    : (rule.condition as Condition).right.type}
                            </span>
                            {(rule.condition as Condition).right.value === undefined && (rule.condition as Condition).right.symbol && (
                                <span className={isDark ? 'text-gray-500' : 'text-slate-500'}>
                                    ({(rule.condition as Condition).right.symbol}, {(rule.condition as Condition).right.window}d)
                                </span>
                            )}
                        </div>
                    )}
                    {rule.condition_summary && !('left' in rule.condition) && (
                        <p className={`text-xs mt-1 font-mono ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                            {rule.condition_summary}
                        </p>
                    )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
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

// Temporary rule card component (for session-only rules)
interface TemporaryRuleCardProps {
    rule: SwitchingRule;
    ruleName: string;
    timesInChain: number;
    isChainEmpty: boolean;
    onAdd: (operator?: 'AND' | 'OR') => void;
}

const TemporaryRuleCard: React.FC<TemporaryRuleCardProps> = ({
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
            className={`w-full p-4 border-2 rounded-xl transition-all border-l-4 ${isDark
                ? 'border-white/[0.1] border-l-amber-500/60 bg-white/[0.02] hover:border-white/[0.25]'
                : 'border-slate-200 border-l-amber-400 bg-slate-50/50 hover:border-slate-300'
                }`}
            title="This rule is only available in the current session"
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {ruleName}
                        </h3>
                        {timesInChain > 0 && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDark
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                ×{timesInChain}
                            </span>
                        )}
                    </div>
                    {rule.condition && 'left' in rule.condition && (
                        <div
                            className={`text-xs mt-2 font-mono p-2 rounded ${isDark ? 'bg-black/30 text-gray-300' : 'bg-white text-slate-600'
                                }`}
                        >
                            <span className="font-semibold text-purple-500">
                                {(rule.condition as Condition).left.type}
                            </span>
                            {(rule.condition as Condition).left.symbol && (
                                <span className={isDark ? 'text-gray-500' : 'text-slate-500'}>
                                    ({(rule.condition as Condition).left.symbol}, {(rule.condition as Condition).left.window}d)
                                </span>
                            )}
                            <span className="mx-1 text-purple-600 font-bold">
                                {(rule.condition as Condition).comparison}
                            </span>
                            <span className="font-semibold text-blue-500">
                                {(rule.condition as Condition).right.value !== undefined
                                    ? (rule.condition as Condition).right.value
                                    : (rule.condition as Condition).right.type}
                            </span>
                            {(rule.condition as Condition).right.value === undefined && (rule.condition as Condition).right.symbol && (
                                <span className={isDark ? 'text-gray-500' : 'text-slate-500'}>
                                    ({(rule.condition as Condition).right.symbol}, {(rule.condition as Condition).right.window}d)
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
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

interface RuleAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (ruleExpression: string) => void;
    onClear: () => void;
    onCreateRule?: () => void;
    targetAllocation: string | null;
    currentRules?: string | string[];
    // Temporary rules in the current strategy session (not saved to library)
    temporaryRules?: SwitchingRule[];
}

export const RuleAssignmentModal: React.FC<RuleAssignmentModalProps> = ({
    isOpen,
    onClose,
    onAssign,
    onClear,
    onCreateRule,
    targetAllocation,
    currentRules,
    temporaryRules = [],
}) => {
    const [ruleNames, setRuleNames] = useState<string[]>([]);
    const [operators, setOperators] = useState<LogicalOperator[]>([]);
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { isAuthenticated } = useAuth();

    // Pull rules from the library (API for authenticated, sessionStorage for unauthenticated)
    const { rules: libraryRules, isLoading: isLoadingLibrary, isEphemeral } = useRuleLibrary();

    // Reset state when modal opens to ensure clean slate
    useEffect(() => {
        if (isOpen) {
            setRuleNames([]);
            setOperators([]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const hasCurrentRules =
        currentRules &&
        (typeof currentRules === 'string' ? currentRules.length > 0 : currentRules.length > 0);

    // Build expression from current state
    const buildExpression = (names: string[], ops: LogicalOperator[]): string => {
        if (names.length === 0) return '';
        if (names.length === 1) return names[0];

        // Build expression: "Rule1 AND Rule2 OR Rule3"
        const parts: string[] = [];
        for (let i = 0; i < names.length; i++) {
            parts.push(names[i]);
            if (i < ops.length && i < names.length - 1) {
                parts.push(ops[i]);
            }
        }
        return parts.join(' ');
    };

    const handleAssign = () => {
        const expression = buildExpression(ruleNames, operators);
        if (expression) {
            onAssign(expression);
            setRuleNames([]);
            setOperators([]);
            onClose();
        }
    };

    const handleClose = () => {
        setRuleNames([]);
        setOperators([]);
        onClose();
    };

    const addRuleToChain = (ruleName: string, operator: LogicalOperator = 'OR') => {
        // Validate rule exists in library OR in temporary rules
        const libraryRule = libraryRules.find(r => r.name === ruleName);
        const tempRule = temporaryRules.find(r => r.name === ruleName);

        // For unauthenticated users, only check temporary rules
        // For authenticated users, check both library and temporary rules
        if (!libraryRule && !tempRule) {
            return;
        }

        // Check if this is the first rule BEFORE updating state
        const isFirstRule = ruleNames.length === 0;

        // Use functional setState to avoid stale closure issues
        setRuleNames(prev => [...prev, ruleName]);

        // Store operator for the connection BEFORE this rule (only if not first rule)
        if (!isFirstRule) {
            setOperators(prev => [...prev, operator]);
        }
    };

    // Check if user is not signed in (unauthenticated users use session rules only)
    const isUnauthenticated = !isAuthenticated;

    // Total available rules (library + temporary, deduplicated)
    // When not authenticated, library rules will be empty, but session rules should still show
    const libraryRuleNames = new Set(libraryRules.map(r => r.name));
    const uniqueTemporaryRules = temporaryRules.filter(r => r.name && !libraryRuleNames.has(r.name));
    const totalRulesCount = libraryRules.length + uniqueTemporaryRules.length;

    const removeRuleFromChain = (index: number) => {
        const newNames = ruleNames.filter((_, i) => i !== index);

        // When removing a rule, also remove the operator after it (if exists)
        // or the operator before it (if it's the last rule)
        let newOperators = [...operators];
        if (index > 0 && index < operators.length) {
            // Remove operator before this rule
            newOperators.splice(index - 1, 1);
        } else if (index === 0 && operators.length > 0) {
            // Removing first rule, remove first operator
            newOperators.splice(0, 1);
        }

        setRuleNames(newNames);
        setOperators(newOperators);
    };

    const updateOperator = (index: number, operator: LogicalOperator) => {
        const newOperators = [...operators];
        newOperators[index] = operator;
        setOperators(newOperators);
    };

    const countRuleInChain = (ruleName: string): number => {
        return ruleNames.filter(name => name === ruleName).length;
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`rounded-2xl shadow-2xl max-w-lg w-full ${isDark ? 'bg-black border border-white/[0.15]' : 'bg-white'
                }`}>
                {/* Header */}
                <div className={`px-6 py-4 flex items-center justify-between ${isDark ? 'border-b border-white/[0.15]' : 'border-b border-slate-200'
                    }`}>
                    <div>
                        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Manage Portfolio Rules</h2>
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                            Assign switching rules to <span className="font-semibold text-purple-500">{targetAllocation}</span>
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                            Rules determine when stay or switch TO this portfolio
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-slate-100'
                            }`}
                    >
                        <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
                    {/* Rule Chain Builder */}
                    <RuleChainDisplay
                        ruleNames={ruleNames}
                        operators={operators}
                        expression={buildExpression(ruleNames, operators)}
                        onRemove={removeRuleFromChain}
                        onOperatorChange={updateOperator}
                    />

                    {/* Available Rules */}
                    <div>
                        <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                            {ruleNames.length === 0 ? 'Select a rule to start' : 'Add another rule'}
                        </h3>

                        {/* Loading state - only show if authenticated and no session rules yet */}
                        {isLoadingLibrary && !isUnauthenticated && temporaryRules.length === 0 ? (
                            <div className={`flex flex-col items-center justify-center py-8 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                <div className="animate-spin w-8 h-8 border-2 border-current border-t-transparent rounded-full mb-3"></div>
                                <p className="text-sm">Loading your rules...</p>
                            </div>
                        ) : totalRulesCount === 0 ? (
                            /* Empty state - no rules at all */
                            <div className="text-center py-8">
                                <svg className={`w-16 h-16 mx-auto mb-3 ${isDark ? 'text-gray-700' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <p className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>No rules available</p>
                                <p className={`text-sm mb-4 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                                    Create a rule to define when to switch portfolios
                                </p>
                                <button
                                    onClick={() => {
                                        handleClose();
                                        onCreateRule?.();
                                    }}
                                    className={`px-4 py-2.5 rounded-lg transition-colors font-medium flex items-center gap-2 mx-auto ${isDark
                                        ? 'bg-purple-500 hover:bg-purple-600 text-white'
                                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                                        }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create Your First Rule
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {/* Session Rules (unsaved) */}
                                {uniqueTemporaryRules.map((rule, index) => {
                                    const ruleName = rule.name || `Rule ${index + 1}`;
                                    const timesInChain = countRuleInChain(ruleName);

                                    return (
                                        <TemporaryRuleCard
                                            key={`temp-${index}`}
                                            rule={rule}
                                            ruleName={ruleName}
                                            timesInChain={timesInChain}
                                            isChainEmpty={ruleNames.length === 0}
                                            onAdd={(operator) => addRuleToChain(ruleName, operator)}
                                        />
                                    );
                                })}

                                {/* Library Rules */}
                                {libraryRules.map((rule) => {
                                    const timesInChain = countRuleInChain(rule.name);

                                    return (
                                        <LibraryRuleCard
                                            key={rule.id}
                                            rule={rule}
                                            timesInChain={timesInChain}
                                            isChainEmpty={ruleNames.length === 0}
                                            onAdd={(operator) => addRuleToChain(rule.name, operator)}
                                        />
                                    );
                                })}

                                {/* Ephemeral rules notice for unauthenticated users */}
                                {isEphemeral && libraryRules.length > 0 && (
                                    <div className={`mt-3 p-3 rounded-lg border ${isDark
                                        ? 'bg-amber-500/10 border-amber-500/30'
                                        : 'bg-amber-50 border-amber-200'
                                        }`}>
                                        <p className={`text-xs ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                                            Session rules — will be cleared on refresh. Sign in to save permanently.
                                        </p>
                                    </div>
                                )}

                                {/* Create New Rule button */}
                                {onCreateRule && (
                                    <button
                                        onClick={() => {
                                            handleClose();
                                            onCreateRule();
                                        }}
                                        className={`w-full mt-3 px-4 py-2.5 rounded-lg border-2 border-dashed transition-all flex items-center justify-center gap-2 ${isDark
                                            ? 'border-white/20 hover:border-purple-500/50 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10'
                                            : 'border-slate-300 hover:border-purple-400 text-slate-500 hover:text-purple-600 hover:bg-purple-50'
                                            }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span className="font-medium">Create New Rule</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                {totalRulesCount > 0 && (
                    <div className={`px-6 py-4 ${isDark ? 'border-t border-white/[0.15]' : 'border-t border-slate-200'}`}>
                        {/* Show clear button if there are current rules */}
                        {hasCurrentRules && (
                            <button
                                onClick={() => {
                                    onClear();
                                    handleClose();
                                }}
                                className={`w-full mb-3 px-4 py-2 border-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${isDark
                                    ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                                    : 'border-red-300 text-red-600 hover:bg-red-50'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Clear All Rules
                            </button>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className={`flex-1 px-4 py-2 border rounded-lg transition-colors font-medium ${isDark
                                    ? 'border-white/[0.15] text-gray-300 hover:bg-white/[0.05]'
                                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                disabled={ruleNames.length === 0}
                                className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${isDark
                                    ? 'bg-purple-500 hover:bg-purple-600 text-white disabled:bg-slate-700 disabled:cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-slate-300 disabled:cursor-not-allowed'
                                    }`}
                            >
                                Assign Expression
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
