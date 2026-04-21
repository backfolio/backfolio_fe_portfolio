import { useState, useEffect, useRef } from 'react';
import { StrategyDSL, CanvasEdge, CanvasPosition, CanvasViewport } from '../../../types/strategy';
import { useTheme } from '../../../context/ThemeContext';

interface JsonEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    strategy: StrategyDSL;
    edges?: CanvasEdge[];
    nodePositions?: Map<string, CanvasPosition>;
    viewport?: CanvasViewport;
    onSave: (strategy: StrategyDSL, edges?: CanvasEdge[], positions?: Map<string, CanvasPosition>, viewport?: CanvasViewport) => void;
}

export const JsonEditorModal: React.FC<JsonEditorModalProps> = ({
    isOpen,
    onClose,
    strategy,
    edges,
    nodePositions,
    viewport,
    onSave,
}) => {
    const [jsonText, setJsonText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Track if modal was previously open to only initialize on open transition
    const wasOpenRef = useRef(false);

    useEffect(() => {
        // Only initialize JSON when modal transitions from closed to open
        if (isOpen && !wasOpenRef.current) {
            // CLEAN API V4.0: entry_condition is embedded directly in allocations
            // No more switching_logic or allocation_rules arrays

            // Create a complete export that includes canvas state
            const exportData: StrategyDSL = {
                ...strategy,
                // Include canvas edges for visual connections
                canvas_edges: edges || [],
                // Convert Map to plain object for JSON serialization
                canvas_positions: nodePositions
                    ? Object.fromEntries(nodePositions)
                    : {},
                // Include viewport (pan + zoom)
                canvas_viewport: viewport,
            };
            setJsonText(JSON.stringify(exportData, null, 2));
            setError(null);
        }
        wasOpenRef.current = isOpen;
    }, [isOpen, strategy, edges, nodePositions, viewport]);

    const handleSave = () => {
        try {
            const parsed = JSON.parse(jsonText) as StrategyDSL;

            // Extract canvas state from parsed JSON
            const canvasEdges = parsed.canvas_edges;
            const canvasPositions = parsed.canvas_positions;
            const canvasViewport = parsed.canvas_viewport;

            // Convert positions back to Map if present
            const positionsMap = canvasPositions
                ? new Map(Object.entries(canvasPositions))
                : undefined;

            // Call onSave with strategy and optional canvas state
            onSave(parsed, canvasEdges, positionsMap, canvasViewport);
            onClose();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Invalid JSON');
        }
    };

    const handleFormat = () => {
        try {
            const parsed = JSON.parse(jsonText);
            setJsonText(JSON.stringify(parsed, null, 2));
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Invalid JSON');
        }
    };

    const handleClose = () => {
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col ${isDark ? 'bg-black border border-white/[0.15]' : 'bg-white'
                }`}>
                <div className={`px-6 py-4 flex items-center justify-between ${isDark ? 'border-b border-white/[0.15]' : 'border-b border-slate-200'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl shadow-sm ${isDark ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20' : 'bg-gradient-to-br from-amber-100 to-orange-100'
                            }`}>
                            <svg className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>JSON Strategy Editor</h2>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Edit strategy directly in JSON format</p>
                        </div>
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
                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className={`mb-4 p-4 rounded-lg ${isDark ? 'bg-red-500/20 border border-red-500/30' : 'bg-red-50 border border-red-200'
                            }`}>
                            <p className={`text-sm font-medium ${isDark ? 'text-red-300' : 'text-red-800'}`}>
                                {error}
                            </p>
                        </div>
                    )}
                    <textarea
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        className={`w-full h-[500px] p-4 rounded-lg font-mono text-sm focus:ring-2 focus:outline-none ${isDark
                            ? 'bg-white/[0.05] border border-white/[0.15] text-white focus:ring-purple-500 focus:border-purple-500'
                            : 'bg-white border border-slate-300 text-slate-900 focus:ring-amber-500 focus:border-amber-500'
                            }`}
                        spellCheck={false}
                    />
                </div>
                <div className={`px-6 py-4 flex items-center justify-end gap-3 ${isDark ? 'border-t border-white/[0.15]' : 'border-t border-slate-200'
                    }`}>
                    <button
                        onClick={handleFormat}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark
                            ? 'bg-white/[0.05] hover:bg-white/[0.1] text-gray-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                    >
                        Format JSON
                    </button>
                    <button
                        onClick={handleClose}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark
                            ? 'bg-white/[0.05] hover:bg-white/[0.1] text-gray-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all ${isDark
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-amber-500/25'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/25'
                            }`}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
