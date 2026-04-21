import React, { useState } from 'react';

interface DocumentationModalProps {
    isOpen: boolean;
    onClose: () => void;
    isDark: boolean;
}

type TabId = 'overview' | 'portfolios' | 'rules' | 'connections' | 'settings' | 'results' | 'tips';

const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '○' },
    { id: 'portfolios', label: 'Portfolios', icon: '▣' },
    { id: 'rules', label: 'Rules', icon: '→' },
    { id: 'connections', label: 'Connections', icon: '―' },
    { id: 'settings', label: 'Settings', icon: '◎' },
    { id: 'results', label: 'Results', icon: '▤' },
    { id: 'tips', label: 'Pro Tips', icon: '•' },
];

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose, isDark }) => {
    const [activeTab, setActiveTab] = useState<TabId>('overview');

    if (!isOpen) return null;

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                What is Backfolio?
                            </h3>
                            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                Backfolio is a visual strategy builder that lets you create, test, and analyze tactical portfolio strategies.
                                Using a node-based canvas, you can design complex allocation strategies that automatically switch between
                                different portfolios based on market conditions.
                            </p>
                        </section>

                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                How It Works
                            </h3>
                            <div className="space-y-3">
                                <div className={`flex items-start gap-3 p-3 rounded-lg ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                                    <span className={`text-lg font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>1</span>
                                    <div>
                                        <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Create Portfolios</p>
                                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Add portfolio nodes with ticker allocations (e.g., 60% SPY, 40% TLT)</p>
                                    </div>
                                </div>
                                <div className={`flex items-start gap-3 p-3 rounded-lg ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                                    <span className={`text-lg font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>2</span>
                                    <div>
                                        <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Define Rules</p>
                                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Create switching conditions using technical indicators (SMA, RSI, etc.)</p>
                                    </div>
                                </div>
                                <div className={`flex items-start gap-3 p-3 rounded-lg ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                                    <span className={`text-lg font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>3</span>
                                    <div>
                                        <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Connect & Assign</p>
                                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Link portfolios together and assign rules to trigger switches</p>
                                    </div>
                                </div>
                                <div className={`flex items-start gap-3 p-3 rounded-lg ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                                    <span className={`text-lg font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>4</span>
                                    <div>
                                        <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Run Backtest</p>
                                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Test your strategy against historical data and analyze results</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Toolbar Quick Reference
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className={`p-2.5 rounded-lg flex items-center gap-2 ${isDark ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'}`}>
                                    <span className={`font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>+</span>
                                    <span className={isDark ? 'text-purple-300' : 'text-purple-700'}>Add Portfolio</span>
                                </div>
                                <div className={`p-2.5 rounded-lg flex items-center gap-2 ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                                    <svg className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    <span className={isDark ? 'text-blue-300' : 'text-blue-700'}>Create Rule</span>
                                </div>
                                <div className={`p-2.5 rounded-lg flex items-center gap-2 ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                                    <svg className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>Settings</span>
                                </div>
                                <div className={`p-2.5 rounded-lg flex items-center gap-2 ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
                                    <svg className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>Run Backtest</span>
                                </div>
                            </div>
                        </section>
                    </div>
                );

            case 'portfolios':
                return (
                    <div className="space-y-6">
                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Creating Portfolios
                            </h3>
                            <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                Each portfolio node represents a specific asset allocation. You can have up to <strong>6 portfolios</strong> per strategy,
                                with up to <strong>6 assets</strong> in each portfolio.
                            </p>
                            <div className={`p-4 rounded-lg border ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-slate-50 border-slate-200'}`}>
                                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>To create a portfolio:</p>
                                <ol className="text-sm space-y-1.5 ml-4 list-decimal list-inside">
                                    <li className={isDark ? 'text-gray-300' : 'text-slate-700'}>Click the <strong>+ button</strong> in the toolbar</li>
                                    <li className={isDark ? 'text-gray-300' : 'text-slate-700'}>A new node appears on the canvas with a default SPY allocation</li>
                                    <li className={isDark ? 'text-gray-300' : 'text-slate-700'}>Click on the node to expand and edit allocations</li>
                                </ol>
                            </div>
                        </section>

                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Editing Allocations
                            </h3>
                            <ul className="text-sm space-y-2">
                                <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <span className={`flex-shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>•</span>
                                    <span><strong>Ticker Search:</strong> Type to search for any stock, ETF, or index ticker</span>
                                </li>
                                <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <span className={`flex-shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>•</span>
                                    <span><strong>Weights:</strong> Allocate percentages that must sum to 100%</span>
                                </li>
                                <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <span className={`flex-shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>•</span>
                                    <span><strong>Templates:</strong> Use pre-built allocations (60/40, All Weather, etc.)</span>
                                </li>
                                <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <span className={`flex-shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>•</span>
                                    <span><strong>CASH Ticker:</strong> Use "CASH" for cash/money market positions</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Rebalancing Options
                            </h3>
                            <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                Set how often the portfolio should rebalance back to target weights:
                            </p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                {['None', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'].map(freq => (
                                    <div key={freq} className={`p-2 rounded text-center ${isDark ? 'bg-white/[0.03] text-gray-300' : 'bg-slate-100 text-slate-700'}`}>
                                        {freq}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Node Actions
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className={`p-3 rounded-lg ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Rename</p>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Double-click the title</p>
                                </div>
                                <div className={`p-3 rounded-lg ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Duplicate</p>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Click copy icon on node</p>
                                </div>
                                <div className={`p-3 rounded-lg ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Delete</p>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Click X icon on node</p>
                                </div>
                                <div className={`p-3 rounded-lg ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Assign Rules</p>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Click lightning icon</p>
                                </div>
                            </div>
                        </section>
                    </div>
                );

            case 'rules':
                return (
                    <div className="space-y-6">
                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                What Are Switching Rules?
                            </h3>
                            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                Rules define <strong>when</strong> to switch from one portfolio to another based on market conditions.
                                When a rule evaluates to <strong>true</strong>, the strategy moves to the connected portfolio.
                            </p>
                        </section>

                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Rule Structure
                            </h3>
                            <div className={`p-4 rounded-lg border font-mono text-sm ${isDark ? 'bg-black/30 border-white/[0.1] text-purple-300' : 'bg-slate-900 border-slate-700 text-purple-300'}`}>
                                IF [Left Indicator] [Comparison] [Right Value] THEN switch
                            </div>
                            <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                                Example: IF SMA(SPY, 50) &gt; SMA(SPY, 200) THEN switch to Risk-On portfolio
                            </p>
                        </section>

                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Available Indicators
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    { name: 'Price', desc: 'Current closing price of a ticker' },
                                    { name: 'SMA', desc: 'Simple Moving Average over N days' },
                                    { name: 'EMA', desc: 'Exponential Moving Average over N days' },
                                    { name: 'RSI', desc: 'Relative Strength Index (0-100 scale)' },
                                    { name: 'HV', desc: 'Historical Volatility over N days' },
                                ].map(ind => (
                                    <div key={ind.name} className={`flex items-center gap-3 p-2.5 rounded-lg ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                                        <span className={`font-mono font-bold text-sm w-12 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{ind.name}</span>
                                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{ind.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Comparison Operators
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {['>', '<', '>=', '<=', '=='].map(op => (
                                    <span key={op} className={`px-3 py-1.5 rounded-lg font-mono text-sm ${isDark ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-100 text-purple-700 border border-purple-200'}`}>
                                        {op}
                                    </span>
                                ))}
                            </div>
                        </section>

                        {/* Combining Rules Section */}
                        <section className={`p-4 rounded-xl border ${isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
                            <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Combining Multiple Rules
                            </h3>
                            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                You can assign multiple rules to a portfolio using <strong>AND</strong> / <strong>OR</strong> operators.
                            </p>

                            <div className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-black/30' : 'bg-white'}`}>
                                <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                    PEMDAS Operator Precedence
                                </p>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    Rules follow <strong>standard boolean logic</strong> (like most programming languages):
                                </p>
                                <ul className={`text-sm mt-2 space-y-1 ml-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <li>• <strong>AND</strong> has <strong>higher precedence</strong> than OR (evaluated first)</li>
                                    <li>• Like math: AND is like multiplication, OR is like addition</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <div className={`p-3 rounded-lg ${isDark ? 'bg-black/30' : 'bg-white'}`}>
                                    <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Example 1: A AND B OR C</p>
                                    <p className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                        Evaluates as: <span className={isDark ? 'text-purple-400' : 'text-purple-600'}>(A AND B) OR C</span>
                                    </p>
                                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                                        Result: TRUE if (A is true AND B is true) OR C is true
                                    </p>
                                </div>

                                <div className={`p-3 rounded-lg border-2 ${isDark ? 'bg-black/30 border-purple-500/30' : 'bg-white border-purple-200'}`}>
                                    <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>Example 2: A OR B AND C (Key difference!)</p>
                                    <p className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                        Evaluates as: <span className={isDark ? 'text-purple-400' : 'text-purple-600'}>A OR (B AND C)</span>
                                    </p>
                                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                                        Result: TRUE if A is true OR (B is true AND C is true)
                                    </p>
                                    <p className={`text-xs mt-1 ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                                        Note: AND binds tighter, so B AND C is grouped first.
                                    </p>
                                </div>

                                <div className={`p-3 rounded-lg ${isDark ? 'bg-black/30' : 'bg-white'}`}>
                                    <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Example 3: A OR B AND C OR D</p>
                                    <p className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                        Evaluates as: <span className={isDark ? 'text-purple-400' : 'text-purple-600'}>A OR (B AND C) OR D</span>
                                    </p>
                                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                                        Result: TRUE if A is true OR (B AND C are both true) OR D is true
                                    </p>
                                </div>

                                <div className={`p-3 rounded-lg ${isDark ? 'bg-black/30' : 'bg-white'}`}>
                                    <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Example 4: A AND B OR C AND D</p>
                                    <p className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                        Evaluates as: <span className={isDark ? 'text-purple-400' : 'text-purple-600'}>(A AND B) OR (C AND D)</span>
                                    </p>
                                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                                        Result: TRUE if (A AND B are both true) OR (C AND D are both true)
                                    </p>
                                </div>
                            </div>

                            <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                                <p className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                                    <strong>Remember:</strong> Think of AND like × and OR like +.
                                    Just like <code className="px-1 rounded bg-black/20">2 + 3 × 4 = 14</code> (not 20),
                                    <code className="px-1 rounded bg-black/20">A OR B AND C</code> groups the AND first.
                                </p>
                            </div>

                            <div className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'}`}>
                                <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                                    Pro Tip: Reuse Rules for Complex Logic
                                </p>
                                <p className={`text-xs ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>
                                    You can use the <strong>same rule multiple times</strong> in an expression! This lets you build complex conditions:
                                </p>
                                <div className={`mt-2 p-2 rounded font-mono text-xs ${isDark ? 'bg-black/30 text-gray-300' : 'bg-white text-slate-700'}`}>
                                    <p><span className={isDark ? 'text-gray-500' : 'text-slate-400'}>Expression:</span> A AND B OR A AND C</p>
                                    <p><span className={isDark ? 'text-gray-500' : 'text-slate-400'}>Evaluates:</span> <span className={isDark ? 'text-purple-400' : 'text-purple-600'}>(A AND B) OR (A AND C)</span></p>
                                </div>
                                <p className={`text-xs mt-2 ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>
                                    This means: "A must be true, AND either B or C must also be true"
                                </p>
                            </div>
                        </section>

                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Rule Templates
                            </h3>
                            <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                Quick-start with pre-configured rules:
                            </p>
                            <div className="space-y-2 text-sm">
                                {[
                                    { name: 'SMA Crossover', desc: 'SMA(50) > SMA(200) - Golden cross' },
                                    { name: 'EMA Crossover', desc: 'EMA(12) > EMA(26) - Fast/slow cross' },
                                    { name: 'RSI Oversold', desc: 'RSI(14) < 30 - Oversold condition' },
                                    { name: 'RSI Overbought', desc: 'RSI(14) > 70 - Overbought condition' },
                                    { name: 'Price Above SMA', desc: 'Price > SMA(200) - Trend filter' },
                                ].map(t => (
                                    <div key={t.name} className={`p-3 rounded-lg ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                                        <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.name}</p>
                                        <p className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{t.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                );

            case 'connections':
                return (
                    <div className="space-y-6">
                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                The Linked-List System
                            </h3>
                            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                Portfolios are connected in a <strong>linked-list structure</strong>. Each portfolio can have at most
                                one incoming and one outgoing connection, creating a clear flow for your strategy.
                            </p>
                        </section>

                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Creating Connections
                            </h3>
                            <div className={`p-4 rounded-lg border ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-slate-50 border-slate-200'}`}>
                                <ol className="text-sm space-y-2 ml-4 list-decimal list-inside">
                                    <li className={isDark ? 'text-gray-300' : 'text-slate-700'}>Hover over a portfolio node to see the <strong>connection handles</strong> (dots on each side)</li>
                                    <li className={isDark ? 'text-gray-300' : 'text-slate-700'}>Click and drag from any handle to another node's handle</li>
                                    <li className={isDark ? 'text-gray-300' : 'text-slate-700'}>An arrow appears showing the connection direction</li>
                                    <li className={isDark ? 'text-gray-300' : 'text-slate-700'}>Assign a rule to the source portfolio to define when to switch</li>
                                </ol>
                            </div>
                        </section>

                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Assigning Rules to Portfolios
                            </h3>
                            <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                Rules are assigned to the <strong>source portfolio</strong>. When the rule condition is true,
                                the strategy switches from the source to the target (connected) portfolio.
                            </p>
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                                <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                                    <strong>Click the rule icon</strong> on any portfolio to manage its switching rules
                                </p>
                            </div>
                        </section>

                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Fallback Portfolios
                            </h3>
                            <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                The first portfolio in a chain <strong>without any rules</strong> becomes the <strong>fallback</strong>.
                                When no rules are triggered, the strategy stays in (or returns to) the fallback portfolio.
                            </p>
                            <div className={`p-3 rounded-lg flex items-center gap-3 ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <span className={`text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                                    Fallback portfolios are highlighted with a green indicator
                                </span>
                            </div>
                        </section>

                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Connection Rules
                            </h3>
                            <ul className="text-sm space-y-2">
                                <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <span className={`flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>•</span>
                                    <span>Maximum <strong>1 outbound</strong> connection per portfolio</span>
                                </li>
                                <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <span className={`flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>•</span>
                                    <span>Maximum <strong>1 inbound</strong> connection per portfolio</span>
                                </li>
                                <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <span className={`flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>•</span>
                                    <span>You can have <strong>multiple separate chains</strong> in one strategy</span>
                                </li>
                            </ul>
                        </section>
                    </div>
                );

            case 'settings':
                return (
                    <div className="space-y-6">
                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Basic Settings
                            </h3>
                            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                Configure these in the toolbar or click the settings button:
                            </p>
                            <div className="space-y-3">
                                <div className={`p-4 rounded-lg ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Date Range</span>
                                    </div>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                                        Set the start and end dates for your backtest period. Historical data availability varies by ticker.
                                    </p>
                                </div>
                                <div className={`p-4 rounded-lg ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Initial Capital</span>
                                    </div>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                                        Starting balance for the backtest (minimum $1,000). Affects position sizing and final value calculations.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Advanced Settings
                            </h3>
                            <div className="space-y-3">
                                <div className={`p-4 rounded-lg ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Evaluation Frequency</span>
                                    </div>
                                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                                        How often switching rules are checked:
                                    </p>
                                    <div className="flex gap-2 text-xs">
                                        <span className={`px-2 py-1 rounded ${isDark ? 'bg-white/[0.05]' : 'bg-slate-200'}`}>Daily</span>
                                        <span className={`px-2 py-1 rounded ${isDark ? 'bg-white/[0.05]' : 'bg-slate-200'}`}>Weekly</span>
                                        <span className={`px-2 py-1 rounded ${isDark ? 'bg-white/[0.05]' : 'bg-slate-200'}`}>Monthly</span>
                                    </div>
                                </div>
                                <div className={`p-4 rounded-lg ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                        <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Transaction Costs</span>
                                    </div>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                                        Flat fee charged each time the strategy switches portfolios. Simulates real-world trading costs.
                                    </p>
                                </div>
                                <div className={`p-4 rounded-lg ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Periodic Cashflow</span>
                                    </div>
                                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                                        Simulate regular contributions or withdrawals:
                                    </p>
                                    <ul className={`text-xs space-y-1 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                                        <li>• <strong>Positive amounts</strong> = contributions (DCA investing)</li>
                                        <li>• <strong>Negative amounts</strong> = withdrawals</li>
                                        <li>• Choose frequency: weekly, monthly, quarterly, etc.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                JSON Editor
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                Click the <strong>{"</>"}</strong> button in the toolbar to view and edit the raw strategy JSON.
                                Useful for advanced users or importing/exporting strategies.
                            </p>
                        </section>
                    </div>
                );

            case 'results':
                return (
                    <div className="space-y-6">
                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Understanding Your Results
                            </h3>
                            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                After running a backtest, you'll see comprehensive analytics including performance metrics,
                                charts, and allocation history.
                            </p>
                        </section>

                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Key Metrics Explained
                            </h3>
                            <div className="space-y-2">
                                {[
                                    { name: 'Total Return', desc: 'Overall percentage gain/loss from start to end', color: 'emerald' },
                                    { name: 'CAGR', desc: 'Compound Annual Growth Rate - annualized return', color: 'blue' },
                                    { name: 'Max Drawdown', desc: 'Largest peak-to-trough decline during the period', color: 'red' },
                                    { name: 'Sharpe Ratio', desc: 'Risk-adjusted return (higher = better). >1 is good, >2 is excellent', color: 'purple' },
                                    { name: 'Calmar Ratio', desc: 'CAGR divided by Max Drawdown - reward vs. risk', color: 'amber' },
                                    { name: 'Volatility', desc: 'Annualized standard deviation of returns', color: 'slate' },
                                ].map(m => (
                                    <div key={m.name} className={`p-3 rounded-lg ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                                        <span className={`font-medium text-sm ${isDark ? `text-${m.color}-400` : `text-${m.color}-600`}`}>{m.name}</span>
                                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{m.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Charts & Visualizations
                            </h3>
                            <ul className="text-sm space-y-2">
                                <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <span className={`flex-shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>•</span>
                                    <span><strong>Portfolio Value Chart:</strong> Equity curve over time with optional log scale</span>
                                </li>
                                <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <span className={`flex-shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>•</span>
                                    <span><strong>Drawdown Chart:</strong> Visual representation of drawdown periods</span>
                                </li>
                                <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <span className={`flex-shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>•</span>
                                    <span><strong>Allocation Distribution:</strong> Time spent in each portfolio</span>
                                </li>
                                <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <span className={`flex-shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>•</span>
                                    <span><strong>Returns Analysis:</strong> Monthly/yearly returns breakdown</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Result Tabs
                            </h3>
                            <div className="flex flex-wrap gap-2 text-xs">
                                {['Overview', 'Charts', 'Returns', 'Allocations', 'Analytics'].map(tab => (
                                    <span key={tab} className={`px-3 py-1.5 rounded-lg ${isDark ? 'bg-white/[0.05] text-gray-300' : 'bg-slate-100 text-slate-700'}`}>
                                        {tab}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </div>
                );

            case 'tips':
                return (
                    <div className="space-y-6">
                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Getting Started
                            </h3>
                            <ul className="text-sm space-y-2">
                                <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <span className="flex-shrink-0">•</span>
                                    <span>Start simple: 2 portfolios (e.g., Stocks & Bonds) with 1 rule</span>
                                </li>
                                <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <span className="flex-shrink-0">•</span>
                                    <span>Use templates to quickly test classic strategies (60/40, SMA crossover)</span>
                                </li>
                                <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <span className="flex-shrink-0">•</span>
                                    <span>Test over different time periods to check robustness</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Strategy Building Tips
                            </h3>
                            <ul className="text-sm space-y-2">
                                <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <span className="flex-shrink-0">•</span>
                                    <span>The <strong>SMA 50/200 crossover</strong> is a classic trend-following signal</span>
                                </li>
                                <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <span className="flex-shrink-0">•</span>
                                    <span>RSI works best for mean-reversion strategies in range-bound markets</span>
                                </li>
                                <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <span className="flex-shrink-0">•</span>
                                    <span>Consider using CASH positions during high volatility periods</span>
                                </li>
                                <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <span className="flex-shrink-0">•</span>
                                    <span>Multiple chains can create diversified strategies within one backtest</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Common Pitfalls
                            </h3>
                            <ul className="text-sm space-y-2">
                                <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <span className={`flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-500'}`}>×</span>
                                    <span><strong>Overfitting:</strong> Too many rules can fit past data but fail going forward</span>
                                </li>
                                <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <span className={`flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-500'}`}>×</span>
                                    <span><strong>Survivorship bias:</strong> Test with tickers that existed during the period</span>
                                </li>
                                <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                    <span className={`flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-500'}`}>×</span>
                                    <span><strong>Ignoring costs:</strong> Set realistic transaction costs</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Example Strategies
                            </h3>
                            <div className="space-y-3">
                                <div className={`p-4 rounded-lg border ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-slate-50 border-slate-200'}`}>
                                    <p className={`font-medium text-sm mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Trend Following</p>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                                        100% SPY when SMA(50) &gt; SMA(200), otherwise 100% TLT (bonds)
                                    </p>
                                </div>
                                <div className={`p-4 rounded-lg border ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-slate-50 border-slate-200'}`}>
                                    <p className={`font-medium text-sm mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Risk Parity Light</p>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                                        60/40 portfolio with monthly rebalancing, switch to 40/60 when RSI &gt; 70
                                    </p>
                                </div>
                                <div className={`p-4 rounded-lg border ${isDark ? 'bg-white/[0.02] border-white/[0.1]' : 'bg-slate-50 border-slate-200'}`}>
                                    <p className={`font-medium text-sm mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Defensive Rotation</p>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                                        100% stocks → 50/50 → 100% CASH as market conditions deteriorate
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className={`rounded-lg p-4 border ${isDark
                            ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20'
                            : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200'
                            }`}>
                            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Power User Tips
                            </h3>
                            <ul className="text-sm space-y-1">
                                <li className={isDark ? 'text-gray-300' : 'text-slate-700'}>• Press the JSON button to import/export strategies</li>
                                <li className={isDark ? 'text-gray-300' : 'text-slate-700'}>• Duplicate portfolios to quickly test variations</li>
                                <li className={isDark ? 'text-gray-300' : 'text-slate-700'}>• Use keyboard shortcuts: scroll to zoom, drag to pan</li>
                                <li className={isDark ? 'text-gray-300' : 'text-slate-700'}>• The reset button clears everything for a fresh start</li>
                            </ul>
                        </section>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-50 backdrop-blur-sm ${isDark ? 'bg-black/60' : 'bg-black/40'}`}
                onClick={onClose}
            />
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
                <div className={`rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border flex flex-col ${isDark
                    ? 'bg-black/95 backdrop-blur-xl border-white/[0.15]'
                    : 'bg-white border-slate-200'
                    }`}>
                    {/* Header */}
                    <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${isDark ? 'border-white/[0.1]' : 'border-slate-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark
                                ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20'
                                : 'bg-gradient-to-br from-purple-100 to-blue-100'
                                }`}>
                                <svg className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    Backfolio Documentation
                                </h2>
                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Learn how to build and test portfolio strategies
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg transition-all ${isDark
                                ? 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar Navigation */}
                        <div className={`w-48 flex-shrink-0 border-r overflow-y-auto ${isDark ? 'border-white/[0.1] bg-white/[0.02]' : 'border-slate-200 bg-slate-50'}`}>
                            <nav className="p-2 space-y-1">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${activeTab === tab.id
                                            ? isDark
                                                ? 'bg-purple-500/20 text-purple-300 font-medium'
                                                : 'bg-purple-100 text-purple-700 font-medium'
                                            : isDark
                                                ? 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                                            }`}
                                    >
                                        <span>{tab.icon}</span>
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Content Area */}
                        <div className={`flex-1 overflow-y-auto p-6 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                            {renderContent()}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={`px-6 py-3 border-t flex-shrink-0 ${isDark ? 'border-white/[0.1]' : 'border-slate-200'}`}>
                        <p className={`text-xs text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Press <kbd className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-white/[0.1]' : 'bg-slate-200'}`}>?</kbd> anytime to open this help
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};
