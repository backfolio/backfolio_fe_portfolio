import React from 'react';
import { Panel } from 'reactflow';
import { SwitchingRule, AllocationRule } from '../../types/strategy';

interface StrategyRulesPanelProps {
    isOpen: boolean;
    onClose: () => void;
    rules: SwitchingRule[];
    allocationRules?: AllocationRule[];
    onDeleteRule: (index: number) => void;
    isDark: boolean;
}

export const StrategyRulesPanel: React.FC<StrategyRulesPanelProps> = ({
    isOpen,
    onClose,
    rules,
    allocationRules = [],
    onDeleteRule,
    isDark
}) => {
    if (!isOpen) return null;

    return (
        <Panel position="bottom-right" className={`backdrop-blur rounded-lg shadow-lg border max-w-sm max-h-[70vh] overflow-y-auto ${isDark ? 'bg-slate-900/95 border-white/[0.15]' : 'bg-white/95 border-slate-200'}`}>
            <div className={`p-3 border-b sticky top-0 backdrop-blur ${isDark ? 'bg-slate-900/95 border-white/[0.15]' : 'bg-white/95 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Rules</h3>
                    <button
                        onClick={onClose}
                        className={`p-1 rounded transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/[0.08]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="p-3 space-y-2">
                {rules.length === 0 ? (
                    <div className={`text-center py-6 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                        <svg className={`w-10 h-10 mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <p className="text-xs font-medium">No rules yet</p>
                    </div>
                ) : (
                    rules.map((rule, index) => (
                        <div key={index} className={`rounded-lg p-2.5 border transition-colors ${isDark ? 'bg-slate-800/50 border-white/[0.1] hover:border-white/[0.2]' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                            <div className="flex items-start justify-between mb-1.5">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <span className={`font-medium text-xs truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{rule.name || `Rule ${index + 1}`}</span>
                                    {rule.target_allocation && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300`}>
                                            → {rule.target_allocation}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-0.5 flex-shrink-0 ml-1">
                                    <button
                                        onClick={() => alert('Rule editing coming soon! Use JSON editor for now.')}
                                        className={`p-1 rounded transition-colors ${isDark ? 'text-slate-400 hover:text-blue-400 hover:bg-blue-500/20' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                        title="Edit"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onDeleteRule(index)}
                                        className={`p-1 rounded transition-colors ${isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/20' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                                        title="Delete"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Compact Condition Display */}
                            {rule.condition && 'left' in rule.condition && (
                                <div className={`border rounded p-1.5 mb-1.5 ${isDark ? 'bg-slate-900/50 border-white/[0.1]' : 'bg-white border-slate-200'}`}>
                                    <div className={`text-center font-mono text-[10px] leading-tight ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        <span className={`font-semibold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                            {rule.condition.left.type}
                                        </span>
                                        {rule.condition.left.symbol && (
                                            <span className={`text-[9px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                ({rule.condition.left.symbol}, {rule.condition.left.window}d)
                                            </span>
                                        )}
                                        <span className={`mx-1 font-bold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                                            {rule.condition.comparison}
                                        </span>
                                        <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                            {rule.condition.right.value !== undefined ?
                                                rule.condition.right.value :
                                                rule.condition.right.type
                                            }
                                        </span>
                                        {rule.condition.right.value === undefined && rule.condition.right.symbol && (
                                            <span className={`text-[9px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                ({rule.condition.right.symbol}, {rule.condition.right.window}d)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Assigned To - Compact */}
                            <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {allocationRules.filter(ar => ar.rules.includes(rule.name || '')).length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {allocationRules
                                            .filter(ar => ar.rules.includes(rule.name || ''))
                                            .map(ar => (
                                                <span key={ar.allocation} className={`inline-block px-1.5 py-0.5 rounded ${isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                                                    {ar.allocation}
                                                </span>
                                            ))
                                        }
                                    </div>
                                ) : (
                                    <span className={`italic ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Not assigned</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Panel>
    );
};
