import { useState, useEffect } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { Allocation, Condition, CompositeCondition } from '../../../types/strategy';
import { useTheme } from '../../../context/ThemeContext';
import { ALLOCATION_PRESETS } from '../../../constants/strategy';
import { TickerSearchInput } from '../components/TickerSearchInput';

type RebalancingFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

const REBALANCING_OPTIONS: { value: RebalancingFrequency; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
];

export type TickerValidationStatus = 'valid' | 'invalid' | 'validating' | 'unknown';

/**
 * Format a signal into human-readable text
 */
const formatSignal = (signal: Condition['left']) => {
    if (signal.type === 'constant' && signal.value !== undefined) {
        return String(signal.value);
    }
    if (signal.type === 'Price') {
        return `${signal.symbol}`;
    }
    // All indicator types: SMA, EMA, RSI, HV, DD, ROC, BB, MACD
    return `${signal.type}(${signal.symbol}, ${signal.window})`;
};

/**
 * Format a simple condition into human-readable text
 * e.g., "HV(QQQ, 20) < 0.15"
 */
const formatSimpleCondition = (condition: Condition): string => {
    const left = formatSignal(condition.left);
    const right = formatSignal(condition.right);
    const op = condition.comparison || '>';
    return `${left} ${op} ${right}`;
};

/**
 * Get condition parts for display (array of conditions and operators)
 * Returns { conditions: string[], operator: 'AND' | 'OR' | null }
 */
const getConditionParts = (condition: Condition | CompositeCondition): { conditions: string[], operator: 'AND' | 'OR' | null } => {
    // Composite condition (AND/OR)
    if ('op' in condition && 'conditions' in condition) {
        const parts: string[] = [];
        condition.conditions.forEach(c => {
            if ('left' in c && 'right' in c) {
                parts.push(formatSimpleCondition(c as Condition));
            } else {
                // Nested composite - just format it inline
                const nested = getConditionParts(c as CompositeCondition);
                parts.push(...nested.conditions);
            }
        });
        return { conditions: parts, operator: condition.op };
    }

    // Simple condition
    if ('left' in condition && 'right' in condition) {
        return { conditions: [formatSimpleCondition(condition)], operator: null };
    }

    return { conditions: ['Custom condition'], operator: null };
};

interface AllocationNodeData {
    name: string;
    allocation: Allocation;
    isFallback?: boolean;
    entryCondition?: Condition | CompositeCondition; // CLEAN API V4.0: The actual entry_condition
    isNewlyCreated?: boolean;
    rebalancingFrequency?: RebalancingFrequency;
    canDuplicate?: boolean; // Whether the duplicate button is enabled (false when at 6 portfolio limit)
    validationStatus?: TickerValidationStatus; // Ticker validation status
    invalidTickers?: string[]; // List of invalid tickers if any
    onUpdate: (allocation: Allocation, rebalancingFrequency?: RebalancingFrequency) => void;
    onRename: (newName: string) => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onManageRules: () => void;
    onClearRules: () => void;
    onFitView?: () => void;
}

export const AllocationNode = ({ data, selected }: NodeProps<AllocationNodeData>) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [isEditing, setIsEditing] = useState(data.isNewlyCreated || false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(data.name);
    const [showTemplates, setShowTemplates] = useState(false);
    const [rebalancingFrequency, setRebalancingFrequency] = useState<RebalancingFrequency>(data.rebalancingFrequency || 'yearly');

    // Create stable keys for allocation entries to prevent input focus loss
    const [allocationEntries, setAllocationEntries] = useState<Array<{ id: string; symbol: string; weight: number }>>(
        () => Object.entries(data.allocation || {}).map(([symbol, weight], idx) => ({
            id: `entry-${idx}-${symbol}`,
            symbol,
            weight
        }))
    );

    // Sync entries when entering edit mode or when data.allocation changes
    useEffect(() => {
        if (isEditing) {
            const entries = Object.entries(data.allocation || {}).map(([symbol, weight], idx) => ({
                id: `entry-${idx}-${symbol}`,
                symbol,
                weight
            }));
            setAllocationEntries(entries);
        }
    }, [isEditing, data.allocation]);

    // Sync entries with editedAllocation whenever it changes from template or external updates
    const syncEntriesFromAllocation = (allocation: Allocation) => {
        const entries = Object.entries(allocation).map(([symbol, weight], idx) => ({
            id: allocationEntries[idx]?.id || `entry-${Date.now()}-${idx}`,
            symbol,
            weight
        }));
        setAllocationEntries(entries);
    };

    const total = allocationEntries.reduce((sum, entry) => sum + entry.weight, 0);
    const isValid = Math.abs(total - 1.0) < 0.001;

    // Define handles for all 4 sides
    const handlePositions = [
        { position: Position.Top, name: 'top' },
        { position: Position.Right, name: 'right' },
        { position: Position.Bottom, name: 'bottom' },
        { position: Position.Left, name: 'left' },
    ];

    const handleSave = () => {
        if (isValid && data.onUpdate) {
            const allocation: Allocation = {};
            allocationEntries.forEach(entry => {
                if (entry.symbol) {
                    allocation[entry.symbol] = entry.weight;
                }
            });
            data.onUpdate(allocation, rebalancingFrequency);
            setIsEditing(false);
            setShowTemplates(false);
        }
    };

    const handleRebalancingChange = (newFrequency: RebalancingFrequency) => {
        setRebalancingFrequency(newFrequency);
        // Immediately update if not in editing mode
        if (!isEditing && data.onUpdate) {
            data.onUpdate(data.allocation || {}, newFrequency);
        }
    };

    const handleLoadTemplate = (templateName: string) => {
        const allocation = ALLOCATION_PRESETS[templateName as keyof typeof ALLOCATION_PRESETS];
        syncEntriesFromAllocation(allocation);
        setShowTemplates(false);

        // First, save the allocation from template
        if (data.onUpdate) {
            data.onUpdate(allocation, rebalancingFrequency);
            setIsEditing(false);
        }

        // Then update portfolio name to match template name (after allocation is saved)
        if (data.onRename && templateName !== data.name) {
            setEditedName(templateName);
            // Use setTimeout to ensure allocation update completes first
            setTimeout(() => {
                if (data.onRename) {
                    data.onRename(templateName);
                }
                // Center and fit the view after template is loaded
                if (data.onFitView) {
                    setTimeout(() => {
                        data.onFitView?.();
                    }, 150);
                }
            }, 0);
        }
    };

    const handleSaveName = () => {
        if (editedName.trim() && editedName !== data.name && data.onRename) {
            data.onRename(editedName.trim());
        }
        setIsEditingName(false);
    };

    const handleAddAsset = () => {
        // Limit to 6 assets per portfolio
        if (allocationEntries.length >= 6) {
            return;
        }
        setAllocationEntries([
            ...allocationEntries,
            {
                id: `entry-${Date.now()}`,
                symbol: '',
                weight: 0
            }
        ]);
    };

    const handleRemoveAsset = (entryId: string) => {
        setAllocationEntries(allocationEntries.filter(entry => entry.id !== entryId));
    };

    const handleUpdateSymbol = (entryId: string, newSymbol: string) => {
        setAllocationEntries(allocationEntries.map(entry =>
            entry.id === entryId ? { ...entry, symbol: newSymbol.toUpperCase() } : entry
        ));
    };

    const handleUpdateWeight = (entryId: string, weight: number) => {
        setAllocationEntries(allocationEntries.map(entry =>
            entry.id === entryId ? { ...entry, weight: weight / 100 } : entry
        ));
    };

    return (
        <div
            className={`
                rounded-lg shadow-md border transition-all duration-200 min-w-[300px] max-w-[340px]
                ${isDark ? 'bg-slate-900/95' : 'bg-white'}
                ${selected
                    ? isDark
                        ? 'border-purple-400/70 shadow-lg'
                        : 'border-purple-500 shadow-lg'
                    : isDark
                        ? 'border-slate-700/80'
                        : 'border-slate-200'
                }
                ${data.isFallback ? 'border-l-2 border-l-emerald-500' : ''}
            `}
        >
            {/* Render ONE handle per side - React Flow will handle bidirectional connections */}
            {handlePositions.map(({ position, name }) => (
                <Handle
                    key={name}
                    type="source"
                    position={position}
                    id={`${data.name}-${name}`}
                    className={`!w-2.5 !h-2.5 !border transition-colors ${data.isFallback
                        ? '!bg-emerald-500 !border-emerald-400'
                        : isDark ? '!bg-slate-500 !border-slate-400 hover:!bg-purple-500 hover:!border-purple-400' : '!bg-slate-400 !border-slate-300 hover:!bg-purple-500 hover:!border-purple-400'
                        }`}
                    isConnectableStart={true}
                    isConnectableEnd={true}
                />
            ))}

            {/* Header - Simplified and Cleaner */}
            <div className="px-4 py-2.5">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {/* Status dot - reflects ticker validation status */}
                        <div className="relative group/status flex-shrink-0">
                            <div className={`w-1.5 h-1.5 rounded-full ${data.validationStatus === 'invalid'
                                ? 'bg-red-500'
                                : data.validationStatus === 'validating'
                                    ? 'bg-amber-500 animate-pulse'
                                    : data.validationStatus === 'valid'
                                        ? 'bg-emerald-500'
                                        : data.isFallback
                                            ? 'bg-emerald-500'
                                            : isDark ? 'bg-slate-500' : 'bg-slate-400'
                                }`}></div>
                            {/* Tooltip for invalid tickers */}
                            {data.validationStatus === 'invalid' && data.invalidTickers && data.invalidTickers.length > 0 && (
                                <div className={`absolute left-0 top-full mt-1 z-50 opacity-0 group-hover/status:opacity-100 pointer-events-none transition-opacity whitespace-nowrap px-2 py-1 rounded text-[10px] shadow-lg ${isDark ? 'bg-red-900/90 text-red-200' : 'bg-red-100 text-red-800'
                                    }`}>
                                    Invalid: {data.invalidTickers.join(', ')}
                                </div>
                            )}
                            {data.validationStatus === 'validating' && (
                                <div className={`absolute left-0 top-full mt-1 z-50 opacity-0 group-hover/status:opacity-100 pointer-events-none transition-opacity whitespace-nowrap px-2 py-1 rounded text-[10px] shadow-lg ${isDark ? 'bg-amber-900/90 text-amber-200' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                    Validating tickers...
                                </div>
                            )}
                        </div>
                        {isEditingName ? (
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onBlur={handleSaveName}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveName();
                                    if (e.key === 'Escape') {
                                        setEditedName(data.name);
                                        setIsEditingName(false);
                                    }
                                }}
                                className={`font-semibold text-sm px-1.5 py-0.5 border rounded flex-1 ${isDark
                                    ? 'bg-white/[0.05] border-purple-500/50 text-white'
                                    : 'bg-white border-purple-300 text-slate-900'
                                    }`}
                                autoFocus
                            />
                        ) : (
                            <h3
                                className={`font-semibold text-sm cursor-pointer transition-colors truncate ${isDark
                                    ? 'text-slate-100 hover:text-purple-300'
                                    : 'text-slate-900 hover:text-purple-600'
                                    }`}
                                onClick={() => setIsEditingName(true)}
                                title="Click to edit name"
                            >
                                {data.name}
                            </h3>
                        )}
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`p-1.5 rounded transition-colors ${isDark
                                ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/50'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                }`}
                            title="Edit allocation"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <div className="relative group">
                            <button
                                onClick={data.onDuplicate}
                                disabled={data.canDuplicate === false}
                                className={`p-1.5 rounded transition-colors ${data.canDuplicate === false
                                    ? 'opacity-40 cursor-not-allowed'
                                    : ''
                                    } ${isDark
                                        ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/50'
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                    } ${data.canDuplicate === false ? 'hover:bg-transparent' : ''}`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                            <div className={`absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-white'}`}>
                                {data.canDuplicate === false ? 'Max 6 portfolios' : 'Duplicate'}
                            </div>
                        </div>
                        <button
                            onClick={data.onDelete}
                            className={`p-1.5 rounded transition-colors ${isDark
                                ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                                : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                                }`}
                            title="Delete portfolio"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Rules Section - CLEAN API V4.0: Show entry_condition status */}
                {data.isFallback ? (
                    <div className={`mt-2 px-3 py-2 rounded-md ${isDark
                        ? 'bg-emerald-500/5 border border-emerald-500/20'
                        : 'bg-emerald-50/80 border border-emerald-200'
                        }`}>
                        <div className={`text-[11px] font-medium mb-1 flex items-center gap-1.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Default Portfolio
                        </div>
                        <div className={`text-[10px] leading-relaxed mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Active when no conditions match
                        </div>
                        <button
                            onClick={data.onManageRules}
                            className={`w-full px-2 py-1.5 text-[11px] font-medium rounded transition-colors ${isDark
                                ? 'text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20'
                                : 'text-emerald-700 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200'
                                }`}
                        >
                            + Add Entry Condition
                        </button>
                    </div>
                ) : data.entryCondition ? (
                    (() => {
                        const { conditions, operator } = getConditionParts(data.entryCondition);
                        return (
                            <div className={`mt-2 px-3 py-2 rounded-md ${isDark
                                ? 'bg-purple-500/5 border border-purple-500/20'
                                : 'bg-purple-50/80 border border-purple-200'
                                }`}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className={`text-[11px] font-medium ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                                        Active when:
                                    </div>
                                    <button
                                        onClick={data.onClearRules}
                                        className={`p-0.5 rounded transition-colors ${isDark
                                            ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                                            : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                                            }`}
                                        title="Clear condition"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                <div className={`font-mono text-[10px] px-2 py-1.5 rounded mb-2 space-y-1 ${isDark
                                    ? 'bg-black/30'
                                    : 'bg-purple-100'
                                    }`}>
                                    {conditions.map((cond, idx) => (
                                        <div key={idx}>
                                            <div className={isDark ? 'text-purple-200' : 'text-purple-800'}>
                                                {cond}
                                            </div>
                                            {operator && idx < conditions.length - 1 && (
                                                <div className={`text-[9px] font-semibold mt-0.5 ${operator === 'AND'
                                                    ? isDark ? 'text-slate-400' : 'text-slate-600'
                                                    : isDark ? 'text-emerald-400' : 'text-emerald-600'
                                                    }`}>
                                                    {operator}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={data.onManageRules}
                                    className={`text-[11px] font-medium transition-colors ${isDark
                                        ? 'text-purple-400 hover:text-purple-300'
                                        : 'text-purple-600 hover:text-purple-700'
                                        }`}
                                >
                                    Edit Condition →
                                </button>
                            </div>
                        );
                    })()
                ) : (
                    <button
                        onClick={data.onManageRules}
                        className={`mt-2 w-full px-3 py-2 text-[11px] font-medium border border-dashed rounded transition-colors ${isDark
                            ? 'text-slate-500 hover:text-slate-300 border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                            : 'text-slate-400 hover:text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        + Add Entry Condition
                    </button>
                )}
            </div>

            {/* Body */}
            <div className="p-4">
                {isEditing ? (
                    <div className="space-y-2.5">
                        {/* Compact Template Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowTemplates(!showTemplates)}
                                className={`w-full px-3 py-2 text-[11px] font-medium border rounded transition-colors flex items-center justify-between ${showTemplates
                                    ? isDark
                                        ? 'bg-slate-700/50 border-slate-600 text-slate-200'
                                        : 'bg-slate-100 border-slate-300 text-slate-700'
                                    : isDark
                                        ? 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-600'
                                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                <span>{showTemplates ? 'Choose Template' : 'Load Template'}</span>
                                <svg className={`w-3 h-3 transition-transform ${showTemplates ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showTemplates && (
                                <div className={`absolute z-10 w-full mt-1 rounded border shadow-lg ${isDark
                                    ? 'bg-slate-800 border-slate-700'
                                    : 'bg-white border-slate-200'
                                    }`}>
                                    {Object.entries(ALLOCATION_PRESETS).map(([name, allocation]) => (
                                        <button
                                            key={name}
                                            onClick={() => handleLoadTemplate(name)}
                                            className={`w-full text-left px-3 py-2 text-[11px] transition-colors first:rounded-t last:rounded-b ${isDark
                                                ? 'hover:bg-slate-700/50 border-b border-slate-700 last:border-0'
                                                : 'hover:bg-slate-50 border-b border-slate-100 last:border-0'
                                                }`}
                                        >
                                            <div className={`font-medium mb-0.5 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                                                {name}
                                            </div>
                                            <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {Object.entries(allocation)
                                                    .map(([sym, w]) => `${sym} ${Math.round(w * 100)}%`)
                                                    .join(' · ')}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Asset List - Cleaner Layout */}
                        <div className="space-y-1.5">
                            {allocationEntries.map((entry) => (
                                <div key={entry.id} className={`flex items-center gap-2 p-2 rounded-lg transition-all ${isDark
                                    ? 'bg-white/[0.02] hover:bg-white/[0.04]'
                                    : 'bg-slate-50 hover:bg-slate-100'
                                    }`}>
                                    <TickerSearchInput
                                        value={entry.symbol}
                                        onChange={(newSymbol) => handleUpdateSymbol(entry.id, newSymbol)}
                                        placeholder="SYMBOL"
                                        className="flex-1 px-2.5 py-1.5 text-xs font-medium border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                                    />
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            value={Math.round(entry.weight * 100)}
                                            onChange={(e) => handleUpdateWeight(entry.id, Number(e.target.value))}
                                            min="0"
                                            max="100"
                                            className={`w-14 px-2 py-1.5 text-xs font-semibold text-right border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDark
                                                ? 'bg-white/[0.05] border-white/[0.12] text-white'
                                                : 'bg-white border-slate-300 text-slate-900'
                                                }`}
                                        />
                                        <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>%</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveAsset(entry.id)}
                                        className={`p-1 rounded transition-colors ${isDark
                                            ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                                            : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                                            }`}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleAddAsset}
                            disabled={allocationEntries.length >= 6}
                            className={`w-full px-3 py-2 text-[11px] font-medium border border-dashed rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${isDark
                                ? 'text-slate-400 hover:text-slate-300 border-slate-700 hover:border-slate-600 hover:bg-slate-800/50 disabled:hover:bg-transparent'
                                : 'text-slate-500 hover:text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50 disabled:hover:bg-transparent'
                                }`}
                        >
                            + Add Asset {allocationEntries.length >= 6 ? '(Max 6)' : `(${allocationEntries.length}/6)`}
                        </button>

                        {/* Rebalancing Frequency Selector */}
                        <div className={`flex items-center justify-between px-2 py-2 rounded-lg ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                Rebalance
                            </span>
                            <select
                                value={rebalancingFrequency}
                                onChange={(e) => setRebalancingFrequency(e.target.value as RebalancingFrequency)}
                                className={`text-xs font-semibold px-2 py-1 rounded border-0 focus:ring-1 focus:outline-none cursor-pointer ${isDark
                                    ? 'bg-white/[0.05] text-gray-300 focus:ring-purple-500'
                                    : 'bg-white text-slate-700 focus:ring-purple-500'
                                    }`}
                            >
                                {REBALANCING_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value} className={isDark ? 'bg-slate-800' : ''}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Save Bar */}
                        <div className={`flex items-center justify-between pt-2.5 ${isDark ? 'border-t border-white/[0.08]' : 'border-t border-slate-200'
                            }`}>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-semibold flex items-center gap-1 ${isValid
                                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                    : isDark ? 'text-red-400' : 'text-red-600'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isValid ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                    {Math.round(total * 100)}%
                                </span>
                                {!isValid && (
                                    <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                                        Must equal 100%
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        syncEntriesFromAllocation(data.allocation || {});
                                        setIsEditing(false);
                                        setShowTemplates(false);
                                    }}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${isDark
                                        ? 'text-gray-400 hover:text-gray-300 hover:bg-white/[0.05]'
                                        : 'text-slate-600 hover:text-slate-700 hover:bg-slate-100'
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!isValid}
                                    className={`px-4 py-1.5 text-xs font-semibold text-white rounded-md transition-all disabled:cursor-not-allowed ${isDark
                                        ? 'bg-purple-500 hover:bg-purple-600 disabled:bg-slate-700 disabled:text-slate-500'
                                        : 'bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:text-slate-500'
                                        }`}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {/* Allocation Display */}
                        <div className="space-y-1">
                            {Object.entries(data.allocation || {}).map(([symbol, weight]) => (
                                <div key={symbol} className={`flex items-center justify-between px-2 py-1.5 rounded transition-colors ${isDark
                                    ? 'hover:bg-slate-800/50'
                                    : 'hover:bg-slate-50'
                                    }`}>
                                    <span className={`font-medium text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        {symbol}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-20 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'
                                            }`}>
                                            <div
                                                className={`h-full transition-all ${data.isFallback
                                                    ? 'bg-emerald-500'
                                                    : isDark ? 'bg-purple-400' : 'bg-purple-500'
                                                    }`}
                                                style={{ width: `${weight * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className={`font-semibold text-xs w-10 text-right tabular-nums ${isDark ? 'text-slate-400' : 'text-slate-600'
                                            }`}>
                                            {Math.round(weight * 100)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Rebalancing Frequency Selector */}
                        <div className={`flex items-center justify-between px-2.5 py-2 rounded-lg ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                Rebalance
                            </span>
                            <select
                                value={rebalancingFrequency}
                                onChange={(e) => handleRebalancingChange(e.target.value as RebalancingFrequency)}
                                className={`text-xs font-semibold px-2 py-1 rounded border-0 focus:ring-1 focus:outline-none cursor-pointer ${isDark
                                    ? 'bg-white/[0.05] text-gray-300 focus:ring-purple-500'
                                    : 'bg-white text-slate-700 focus:ring-purple-500'
                                    }`}
                            >
                                {REBALANCING_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value} className={isDark ? 'bg-slate-800' : ''}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

AllocationNode.displayName = 'AllocationNode';
