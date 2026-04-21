import { useState } from 'react';
import { Allocation, AllocationWithRebalancing } from '../../../types/strategy';
import { useTheme } from '../../../context/ThemeContext';

type RebalancingFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

interface PortfolioCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, allocationWithRebalancing: AllocationWithRebalancing) => void;
}

import { ALLOCATION_PRESETS } from '../../../constants/strategy';

const TEMPLATES = ALLOCATION_PRESETS;

const REBALANCING_OPTIONS: { value: RebalancingFrequency; label: string; description: string }[] = [
    { value: 'none', label: 'None (Buy & Hold)', description: 'No rebalancing - let weights drift naturally' },
    { value: 'daily', label: 'Daily', description: 'Rebalance every trading day' },
    { value: 'weekly', label: 'Weekly', description: 'Rebalance every Monday' },
    { value: 'monthly', label: 'Monthly', description: 'Rebalance first trading day of each month' },
    { value: 'quarterly', label: 'Quarterly', description: 'Rebalance first trading day of each quarter' },
    { value: 'yearly', label: 'Yearly', description: 'Rebalance first trading day of each year' },
];

export const PortfolioCreationModal: React.FC<PortfolioCreationModalProps> = ({
    isOpen,
    onClose,
    onCreate,
}) => {
    const [mode, setMode] = useState<'template' | 'custom'>('template');
    const [portfolioName, setPortfolioName] = useState('');
    const [assets, setAssets] = useState<Array<{ symbol: string; weight: number }>>([
        { symbol: '', weight: 0 },
    ]);
    const [rebalancingFrequency, setRebalancingFrequency] = useState<RebalancingFrequency>('none');
    const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof TEMPLATES | null>(null);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    if (!isOpen) return null;

    const handleTemplateSelect = (templateKey: string) => {
        setSelectedTemplate(templateKey as any);
    };

    const handleTemplateConfirm = () => {
        if (!selectedTemplate) return;
        const templateName = selectedTemplate as string;
        const templateAllocation = TEMPLATES[templateName as keyof typeof TEMPLATES];
        
        // Use the template key (name) as the portfolio name
        onCreate(templateName, { allocation: templateAllocation, rebalancing_frequency: rebalancingFrequency });
        handleClose();
    };

    const handleCustomCreate = () => {
        const allocation: Allocation = {};
        assets.forEach((asset) => {
            if (asset.symbol.trim()) {
                allocation[asset.symbol.trim().toUpperCase()] = asset.weight / 100;
            }
        });

        const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
        if (Math.abs(total - 1.0) > 0.001) {
            alert('Allocations must total 100%');
            return;
        }

        if (!portfolioName.trim()) {
            alert('Please enter a portfolio name');
            return;
        }

        onCreate(portfolioName.trim(), {
            allocation,
            rebalancing_frequency: rebalancingFrequency
        });
        handleClose();
    };

    const handleClose = () => {
        setMode('template');
        setPortfolioName('');
        setAssets([{ symbol: '', weight: 0 }]);
        setRebalancingFrequency('none');
        setSelectedTemplate(null);
        onClose();
    };

    const addAsset = () => {
        setAssets([...assets, { symbol: '', weight: 0 }]);
    };

    const updateAsset = (index: number, field: 'symbol' | 'weight', value: string | number) => {
        const newAssets = [...assets];
        newAssets[index] = { ...newAssets[index], [field]: value };
        setAssets(newAssets);
    };

    const removeAsset = (index: number) => {
        if (assets.length > 1) {
            setAssets(assets.filter((_, i) => i !== index));
        }
    };

    const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDark ? 'bg-black border border-white/[0.15]' : 'bg-white'
                }`}>
                {/* Header */}
                <div className={`px-6 py-4 flex items-center justify-between sticky top-0 z-10 ${isDark ? 'bg-black border-b border-white/[0.15]' : 'bg-white border-b border-slate-200'
                    }`}>
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Create New Portfolio</h2>
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

                {/* Mode Toggle */}
                <div className={`px-6 py-4 ${isDark ? 'border-b border-white/[0.15]' : 'border-b border-slate-200'}`}>
                    <div className={`flex gap-2 rounded-lg p-1 ${isDark ? 'bg-white/[0.05]' : 'bg-slate-100'}`}>
                        <button
                            onClick={() => setMode('template')}
                            className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all ${mode === 'template'
                                ? isDark
                                    ? 'bg-purple-500/20 text-purple-300 shadow-sm border border-purple-500/30'
                                    : 'bg-white text-purple-700 shadow-sm'
                                : isDark
                                    ? 'text-gray-400 hover:text-gray-200'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Choose Template
                        </button>
                        <button
                            onClick={() => setMode('custom')}
                            className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all ${mode === 'custom'
                                ? isDark
                                    ? 'bg-purple-500/20 text-purple-300 shadow-sm border border-purple-500/30'
                                    : 'bg-white text-purple-700 shadow-sm'
                                : isDark
                                    ? 'text-gray-400 hover:text-gray-200'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Create Custom
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                    {mode === 'template' ? (
                        <div className="space-y-3">
                            {!selectedTemplate ? (
                                <>
                                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                                        Select a pre-configured portfolio template to get started quickly
                                    </p>
                                    {Object.entries(TEMPLATES).map(([key, allocation]) => (
                                        <button
                                            key={key}
                                            onClick={() => handleTemplateSelect(key)}
                                            className={`w-full p-4 border-2 rounded-xl transition-all text-left group ${isDark
                                                ? 'border-white/[0.15] hover:border-purple-500/50 hover:bg-purple-500/10'
                                                : 'border-slate-200 hover:border-purple-500 hover:bg-purple-50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className={`font-bold ${isDark ? 'text-white group-hover:text-purple-300' : 'text-slate-900 group-hover:text-purple-700'
                                                        }`}>
                                                        {key}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {Object.entries(allocation).map(([symbol, weight]) => (
                                                            <span
                                                                key={symbol}
                                                                className={`text-xs px-2 py-1 rounded-md font-medium ${isDark
                                                                    ? 'bg-white/[0.1] group-hover:bg-purple-500/20 text-gray-300 group-hover:text-purple-300'
                                                                    : 'bg-slate-100 group-hover:bg-purple-100 text-slate-700 group-hover:text-purple-700'
                                                                    }`}
                                                            >
                                                                {symbol}: {Math.round(weight * 100)}%
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <svg
                                                    className={`w-5 h-5 ${isDark ? 'text-gray-500 group-hover:text-purple-400' : 'text-slate-400 group-hover:text-purple-600'}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </button>
                                    ))}
                                </>
                            ) : (
                                <>
                                    {/* Selected Template Summary */}
                                    <div className={`p-4 border-2 rounded-xl ${isDark
                                        ? 'border-purple-500/50 bg-purple-500/10'
                                        : 'border-purple-500 bg-purple-50'
                                        }`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className={`font-bold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                                                {selectedTemplate}
                                            </h3>
                                            <button
                                                onClick={() => setSelectedTemplate(null)}
                                                className={`text-xs px-2 py-1 rounded-md ${isDark
                                                    ? 'text-gray-400 hover:text-white hover:bg-white/[0.1]'
                                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                                                    }`}
                                            >
                                                Change
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedTemplate && TEMPLATES[selectedTemplate] && Object.entries(TEMPLATES[selectedTemplate]).map(([symbol, weight]) => (
                                                <span
                                                    key={symbol}
                                                    className={`text-xs px-2 py-1 rounded-md font-medium ${isDark
                                                        ? 'bg-purple-500/20 text-purple-300'
                                                        : 'bg-purple-100 text-purple-700'
                                                        }`}
                                                >
                                                    {symbol}: {Math.round(weight * 100)}%
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Rebalancing Frequency Selector */}
                                    <div className="mt-4">
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                            Rebalancing Frequency
                                        </label>
                                        <select
                                            value={rebalancingFrequency}
                                            onChange={(e) => setRebalancingFrequency(e.target.value as RebalancingFrequency)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${isDark
                                                ? 'bg-white/[0.05] border-white/[0.15] text-white focus:ring-purple-500 focus:border-purple-500'
                                                : 'border-slate-300 focus:ring-purple-500 focus:border-transparent'
                                                }`}
                                        >
                                            {REBALANCING_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value} className={isDark ? 'bg-slate-800' : ''}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                                            {REBALANCING_OPTIONS.find(o => o.value === rebalancingFrequency)?.description}
                                        </p>
                                    </div>

                                    {/* Create Button */}
                                    <button
                                        onClick={handleTemplateConfirm}
                                        className={`mt-4 w-full px-6 py-3 font-bold rounded-lg transition-all ${isDark
                                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                                            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                                            }`}
                                    >
                                        Create Portfolio
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                                Build your portfolio from scratch by adding assets and setting allocations
                            </p>

                            {/* Portfolio Name */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    Portfolio Name
                                </label>
                                <input
                                    type="text"
                                    value={portfolioName}
                                    onChange={(e) => setPortfolioName(e.target.value)}
                                    placeholder="e.g., My Custom Strategy"
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${isDark
                                        ? 'bg-white/[0.05] border-white/[0.15] text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500'
                                        : 'border-slate-300 focus:ring-purple-500 focus:border-transparent'
                                        }`}
                                />
                            </div>

                            {/* Assets */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    Asset Allocation
                                </label>
                                <div className="space-y-2">
                                    {assets.map((asset, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={asset.symbol}
                                                onChange={(e) => updateAsset(index, 'symbol', e.target.value)}
                                                placeholder="Symbol (e.g., SPY)"
                                                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none text-sm ${isDark
                                                    ? 'bg-white/[0.05] border-white/[0.15] text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500'
                                                    : 'border-slate-300 focus:ring-purple-500 focus:border-transparent'
                                                    }`}
                                            />
                                            <input
                                                type="number"
                                                value={asset.weight}
                                                onChange={(e) => updateAsset(index, 'weight', Number(e.target.value))}
                                                min="0"
                                                max="100"
                                                placeholder="%"
                                                className={`w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none text-sm ${isDark
                                                    ? 'bg-white/[0.05] border-white/[0.15] text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500'
                                                    : 'border-slate-300 focus:ring-purple-500 focus:border-transparent'
                                                    }`}
                                            />
                                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>%</span>
                                            <button
                                                onClick={() => removeAsset(index)}
                                                className={`p-2 rounded-lg transition-colors ${isDark
                                                    ? 'text-red-400 hover:bg-red-500/10'
                                                    : 'text-red-500 hover:bg-red-50'
                                                    }`}
                                                disabled={assets.length === 1}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={addAsset}
                                    className={`mt-2 w-full px-4 py-2 border-2 border-dashed rounded-lg text-sm font-medium transition-all ${isDark
                                        ? 'border-white/[0.15] hover:border-purple-500/50 hover:bg-purple-500/10 text-gray-300 hover:text-purple-300'
                                        : 'border-slate-300 hover:border-purple-500 hover:bg-purple-50 text-slate-600 hover:text-purple-700'
                                        }`}
                                >
                                    + Add Asset
                                </button>

                                {/* Total Weight Indicator */}
                                <div className={`mt-3 flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-white/[0.05]' : 'bg-slate-50'
                                    }`}>
                                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Total Allocation</span>
                                    <span
                                        className={`text-sm font-bold ${Math.abs(totalWeight - 100) < 0.1
                                            ? 'text-emerald-500'
                                            : 'text-red-500'
                                            }`}
                                    >
                                        {totalWeight.toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            {/* Rebalancing Frequency */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    Rebalancing Frequency
                                </label>
                                <select
                                    value={rebalancingFrequency}
                                    onChange={(e) => setRebalancingFrequency(e.target.value as RebalancingFrequency)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${isDark
                                        ? 'bg-white/[0.05] border-white/[0.15] text-white focus:ring-purple-500 focus:border-purple-500'
                                        : 'border-slate-300 focus:ring-purple-500 focus:border-transparent'
                                        }`}
                                >
                                    {REBALANCING_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value} className={isDark ? 'bg-slate-800' : ''}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                                    {REBALANCING_OPTIONS.find(o => o.value === rebalancingFrequency)?.description}
                                </p>
                            </div>

                            {/* Create Button */}
                            <button
                                onClick={handleCustomCreate}
                                disabled={Math.abs(totalWeight - 100) > 0.1 || !portfolioName.trim()}
                                className={`w-full px-6 py-3 font-bold rounded-lg transition-all ${isDark
                                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed'
                                    }`}
                            >
                                Create Portfolio
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
