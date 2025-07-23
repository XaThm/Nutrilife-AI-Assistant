import React, { useState } from 'react';
import Card from './common/Card';
import { useHistory } from '../hooks/useHistory';
import type { ProductHistoryItem, OverhaulHistoryItem, Alternative } from '../types';
import { HistoryIcon, SparklesIcon, AlertTriangleIcon, CheckCircleIcon, TrashIcon } from './common/Icon';
import Modal from './common/Modal';

const ScoreBadge: React.FC<{ score: ProductHistoryItem['overallScore'] }> = ({ score }) => {
    const scoreColorMap = {
        'A': 'border-emerald-300 bg-emerald-50 text-emerald-800', 'B': 'border-green-300 bg-green-50 text-green-800', 
        'C': 'border-yellow-300 bg-yellow-50 text-yellow-800', 'D': 'border-orange-300 bg-orange-50 text-orange-800', 
        'F': 'border-red-300 bg-red-50 text-red-800',
    };
    return (
        <div className={`text-center p-2 rounded-lg border w-24 flex-shrink-0 ${scoreColorMap[score]}`}>
            <p className="text-4xl font-bold font-manrope">{score}</p>
        </div>
    );
};

const AlternativeCard: React.FC<{ alt: Alternative }> = ({ alt }) => (
    <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
        <h4 className="font-semibold text-sm text-sky-800">{alt.productName}</h4>
        <p className="text-slate-600 text-xs mt-1">{alt.reason}</p>
    </div>
);

const ProductHistoryCard: React.FC<{ item: ProductHistoryItem }> = ({ item }) => (
    <Card className="!p-0 overflow-hidden transition-shadow hover:shadow-xl">
        <div className="p-4 flex gap-4">
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg font-manrope">{item.productName}</p>
                        <p className="text-xs text-slate-500">Analyzed on {new Date(item.timestamp).toLocaleDateString()}</p>
                    </div>
                    <ScoreBadge score={item.overallScore} />
                </div>
                 {item.allergens.length > 0 && (
                    <div className="mt-2 text-xs flex items-center p-1.5 bg-amber-50 border border-amber-200 rounded-md">
                        <AlertTriangleIcon className="text-amber-500 h-4 w-4 mr-1.5" />
                        <span className="font-semibold text-amber-800">Allergens: {item.allergens.join(', ')}</span>
                    </div>
                )}
            </div>
        </div>
         <details className="text-sm border-t border-slate-200">
            <summary className="cursor-pointer text-sky-600 hover:underline p-4 font-medium list-none">View Full Analysis</summary>
            <div className="p-4 bg-slate-50 space-y-4">
                <div>
                    <h4 className="font-semibold">Summary</h4>
                    <p className="text-slate-700">{item.summary}</p>
                </div>
                 <div>
                    <h4 className="font-semibold flex items-center mb-2"><SparklesIcon className="text-sky-500 mr-2 h-5 w-5" /> Healthier Alternatives</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {item.alternatives.map((alt, i) => <AlternativeCard key={i} alt={alt} />)}
                    </div>
                </div>
            </div>
        </details>
    </Card>
);

const OverhaulHistoryCard: React.FC<{ item: OverhaulHistoryItem }> = ({ item }) => (
     <Card className="!p-0 overflow-hidden transition-shadow hover:shadow-xl">
        <div className="p-4">
            <p className="font-bold text-lg font-manrope">Lifestyle Plan</p>
            <p className="text-sm text-slate-500">Generated on {new Date(item.timestamp).toLocaleDateString()}</p>
            <p className="text-xs text-slate-400 mt-1 italic">Based on {item.actionPlan.length} products</p>
        </div>
        <details className="text-sm border-t border-slate-200">
            <summary className="cursor-pointer text-sky-600 hover:underline p-4 font-medium list-none">View Full Plan</summary>
            <div className="p-4 bg-slate-50 space-y-4">
                 <div>
                    <h4 className="font-semibold">Overall Summary</h4>
                    <p className="text-slate-700">{item.overallSummary}</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Action Plan</h4>
                     <div className="space-y-3">
                        {item.actionPlan.map((actionItem, i) => (
                            <div key={i} className="p-3 bg-white rounded-lg border">
                                <p className="font-semibold">{actionItem.originalProduct}</p>
                                <p className="text-xs text-slate-500 mb-2">{actionItem.reason}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {actionItem.suggestedSwaps.map((swap, j) => (
                                    <AlternativeCard key={j} alt={swap as Alternative} />
                                ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                     <h4 className="font-semibold mb-2 flex items-center"><SparklesIcon className="text-sky-500 mr-2 h-5 w-5" />General Advice</h4>
                     <ul className="space-y-1.5">
                         {item.generalAdvice.map((advice, i) => (
                             <li key={i} className="flex items-start">
                                 <CheckCircleIcon className="h-4 w-4 text-sky-500 flex-shrink-0 mt-0.5 mr-2"/>
                                 <span className="text-slate-700">{advice}</span>
                             </li>
                         ))}
                     </ul>
                </div>
            </div>
        </details>
    </Card>
);

const History: React.FC = () => {
    const { history, clearHistory } = useHistory();
    const [filter, setFilter] = useState<'all' | 'products' | 'overhauls'>('all');
    const [isClearModalOpen, setClearModalOpen] = useState(false);

    const hasHistory = history.products.length > 0 || history.overhauls.length > 0;
    
    const filteredProducts = history.products.filter(() => filter === 'all' || filter === 'products');
    const filteredOverhauls = history.overhauls.filter(() => filter === 'all' || filter === 'overhauls');

    const handleClearHistory = () => {
        clearHistory();
        setClearModalOpen(false);
    };

    return (
        <>
        <Card>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold flex items-center font-manrope">
                    <HistoryIcon className="mr-3 text-sky-500 h-8 w-8"/>
                    Analysis History
                </h2>
                {hasHistory && (
                    <div className="flex items-center gap-2">
                        <select 
                            value={filter} 
                            onChange={e => setFilter(e.target.value as any)}
                            className="text-sm border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                        >
                            <option value="all">Show All</option>
                            <option value="products">Products Only</option>
                            <option value="overhauls">Overhauls Only</option>
                        </select>
                        <button 
                            onClick={() => setClearModalOpen(true)}
                            className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 font-medium p-2 rounded-md hover:bg-red-100 transition-colors"
                        >
                            <TrashIcon className="h-4 w-4" />
                            Clear All
                        </button>
                    </div>
                )}
            </div>

            {!hasHistory ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                    <HistoryIcon className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-4 text-lg font-medium text-slate-900">No history yet</h3>
                    <p className="mt-1 text-sm text-slate-500">Your past analyses will appear here once you run them.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredProducts.length > 0 && (
                        <div className="space-y-4">
                            {filteredProducts.map(item => <ProductHistoryCard key={item.id} item={item} />)}
                        </div>
                    )}
                    {filteredOverhauls.length > 0 && (
                         <div className="space-y-4">
                            {filteredOverhauls.map(item => <OverhaulHistoryCard key={item.id} item={item} />)}
                        </div>
                    )}
                    {filteredProducts.length === 0 && filteredOverhauls.length === 0 && (
                         <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
                            <p className="text-sm text-slate-500">No items match your filter.</p>
                        </div>
                    )}
                </div>
            )}
        </Card>
        <Modal isOpen={isClearModalOpen} onClose={() => setClearModalOpen(false)}>
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                   <TrashIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mt-3 text-lg leading-6 font-medium text-slate-900">Clear History</h3>
                <div className="mt-2 px-7 py-3">
                    <p className="text-sm text-slate-500">
                        Are you sure you want to delete all of your analysis history? This action cannot be undone.
                    </p>
                </div>
                <div className="mt-4 flex justify-center space-x-3">
                     <button
                        type="button"
                        className="px-4 py-2 bg-white text-sm font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50"
                        onClick={() => setClearModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 bg-red-600 text-sm font-medium text-white rounded-md hover:bg-red-700"
                        onClick={handleClearHistory}
                    >
                        Clear History
                    </button>
                </div>
            </div>
        </Modal>
        </>
    );
};

export default History;