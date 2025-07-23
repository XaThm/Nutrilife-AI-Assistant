import React, { useState, useCallback } from 'react';
import { getLifestyleOverhaul } from '../services/geminiService';
import { useHistory } from '../hooks/useHistory';
import type { OverhaulResult, ActionPlanItem, SuggestedSwap } from '../types';
import Spinner from './common/Spinner';
import Card from './common/Card';
import { AlertTriangleIcon, CheckCircleIcon, SparklesIcon, InformationCircleIcon, XIcon } from './common/Icon';
import { motion, AnimatePresence } from 'framer-motion';

const PriorityBadge: React.FC<{ priority: ActionPlanItem['priority'] }> = ({ priority }) => {
    const priorityInfo = {
        High: 'bg-red-100 text-red-800 border-red-200',
        Medium: 'bg-amber-100 text-amber-800 border-amber-200',
        Low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    };
    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${priorityInfo[priority]}`}>
            {priority} Priority
        </span>
    );
};

const SwapItem: React.FC<{ swap: SuggestedSwap }> = ({ swap }) => (
    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
        <h6 className="font-semibold text-sky-700">{swap.productName}</h6>
        <p className="text-sm text-slate-600">{swap.reason}</p>
    </div>
);

const LifestyleOverhaul: React.FC = () => {
    const [productListInput, setProductListInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<OverhaulResult>(null);
    const [showHistoryWarning, setShowHistoryWarning] = useState(false);
    const { addOverhaulToHistory, isHistoryEnabled } = useHistory();

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const query = productListInput.trim();
        if (!query) {
            setError('Please enter a list of products.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);
        setShowHistoryWarning(false);

        try {
            const overhaulResult = await getLifestyleOverhaul(query);
            setResult(overhaulResult);
            if (isHistoryEnabled) {
                addOverhaulToHistory({
                    ...overhaulResult,
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    query: query,
                });
            } else {
                setShowHistoryWarning(true);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [productListInput, addOverhaulToHistory, isHistoryEnabled]);

    return (
        <div>
            <Card>
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold font-manrope text-slate-800">Lifestyle Overhaul</h2>
                    <p className="text-slate-500 mt-1">Get a personalized action plan to improve your daily habits.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="productList" className="sr-only">
                            Your Daily Products
                        </label>
                        <textarea
                            id="productList"
                            rows={10}
                            value={productListInput}
                            onChange={(e) => setProductListInput(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                            placeholder="e.g.,&#10;Breakfast: Krave Cereal, Tropicana Orange Juice&#10;Skincare: Cetaphil Face Wash&#10;Snack: Doritos"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100"
                    >
                        {isLoading ? <Spinner /> : 'Generate My Lifestyle Plan'}
                    </button>
                </form>
            </Card>

            <AnimatePresence>
             {showHistoryWarning && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                    <Card className="mt-6 bg-sky-50 border-sky-200">
                        <div className="flex items-center">
                            <InformationCircleIcon className="text-sky-500 h-5 w-5 flex-shrink-0" />
                            <p className="ml-3 text-sky-800 font-medium text-sm">
                                Sign in to save this plan to your history.
                            </p>
                            <button onClick={() => setShowHistoryWarning(false)} className="ml-auto p-1 rounded-full hover:bg-sky-200 transition-colors">
                                <XIcon className="h-4 w-4 text-sky-700" />
                            </button>
                        </div>
                    </Card>
                </motion.div>
            )}

            {error && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                    <Card className="mt-6 bg-red-50 border-red-200">
                        <div className="flex items-center">
                            <AlertTriangleIcon className="text-red-500 h-5 w-5" />
                            <p className="ml-3 text-red-700 font-medium text-sm">{error}</p>
                        </div>
                    </Card>
                </motion.div>
            )}

            {result && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { staggerChildren: 0.1 } }} className="mt-8 space-y-6">
                    <Card>
                        <h2 className="text-3xl font-bold font-manrope mb-3">Your Lifestyle Overhaul Plan</h2>
                        <p className="text-slate-600 leading-relaxed">{result.overallSummary}</p>
                    </Card>

                    <Card>
                        <h3 className="text-2xl font-bold font-manrope mb-4">Prioritized Action Plan</h3>
                        <div className="space-y-6">
                            {result.actionPlan.map((item, index) => (
                                <div key={index} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-lg font-semibold text-slate-800">{item.originalProduct}</h4>
                                        <PriorityBadge priority={item.priority} />
                                    </div>
                                    <p className="text-sm text-slate-500 mb-4">{item.reason}</p>
                                    
                                    <h5 className="font-semibold text-sm mb-2 text-sky-800">Suggested Swaps:</h5>
                                    <div className="space-y-3">
                                      {item.suggestedSwaps.map((swap, swapIndex) => (
                                        <SwapItem key={swapIndex} swap={swap} />
                                      ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-2xl font-bold font-manrope mb-4 flex items-center">
                            <SparklesIcon className="text-sky-500 mr-2 h-6 w-6"/> General Wellness Advice
                        </h3>
                        <ul className="space-y-3">
                            {result.generalAdvice.map((advice, index) => (
                                <li key={index} className="flex items-start space-x-3">
                                    <CheckCircleIcon className="h-5 w-5 text-sky-500 flex-shrink-0 mt-0.5"/>
                                    <p className="text-slate-600">{advice}</p>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default LifestyleOverhaul;