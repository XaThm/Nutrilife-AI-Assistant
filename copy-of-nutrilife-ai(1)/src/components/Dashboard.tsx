import React, { useState } from 'react';
import { useHistory } from '../hooks/useHistory';
import { getRecommendations } from '../services/geminiService';
import type { Recommendation, RecommendationResult, View, ProductHistoryItem, OverhaulHistoryItem } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { AlertTriangleIcon, SparklesIcon, ShoppingBagIcon, BeakerIcon, ClipboardListIcon, HistoryIcon } from './common/Icon';
import { motion, AnimatePresence } from 'framer-motion';

const RecommendationCard: React.FC<{ item: Recommendation }> = ({ item }) => (
    <Card className="flex flex-col !p-0 overflow-hidden h-full">
        <img 
            src={`https://source.unsplash.com/400x300/?${encodeURIComponent(item.imageSearchTerm)}`} 
            alt={item.productName}
            className="w-full h-40 object-cover bg-slate-200" 
            aria-hidden="true"
        />
        <div className="p-4 flex flex-col flex-1">
            <h3 className="font-bold font-manrope text-lg text-slate-800">{item.productName}</h3>
            <p className="text-sm text-slate-600 mt-2 flex-1">{item.reason}</p>
            <a 
                href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(item.productName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 transition-all transform hover:scale-105"
                aria-label={`Find ${item.productName} online`}
            >
                <ShoppingBagIcon className="h-4 w-4" />
                Find Online
            </a>
        </div>
    </Card>
);

function ActivityItem({ item, onClick }: { item: (ProductHistoryItem & {type: 'product'}) | (OverhaulHistoryItem & {type: 'overhaul'}), onClick: () => void }) {
    const ScoreBadgeMini: React.FC<{ score: ProductHistoryItem['overallScore'] }> = ({ score }) => {
        const scoreColorMap = {
            'A': 'bg-emerald-500', 'B': 'bg-green-500', 'C': 'bg-yellow-500', 'D': 'bg-orange-500', 'F': 'bg-red-500',
        };
        return <div className={`w-3 h-3 rounded-full ${scoreColorMap[score]}`} title={`Score: ${score}`}></div>;
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={onClick}
            className="flex items-center p-3 bg-white rounded-lg cursor-pointer hover:bg-slate-50 transition-colors border border-slate-100 shadow-sm"
        >
            {item.type === 'product' ?
                <BeakerIcon className="h-5 w-5 text-sky-500 flex-shrink-0" /> :
                <ClipboardListIcon className="h-5 w-5 text-indigo-500 flex-shrink-0" />
            }
            <div className="ml-3 flex-1 min-w-0">
                <p className="font-semibold text-sm truncate text-slate-700">{item.type === 'product' ? item.productName : 'Lifestyle Plan'}</p>
                <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleDateString()}</p>
            </div>
            {item.type === 'product' && <ScoreBadgeMini score={item.overallScore} />}
        </motion.div>
    );
};


const Dashboard: React.FC<{ setActiveView: (view: View) => void }> = ({ setActiveView }) => {
    const { history } = useHistory();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<RecommendationResult>(null);

    const hasHistory = history.products.length > 0 || history.overhauls.length > 0;

    const fetchRecommendations = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // TODO: Refactor this to be more robust later
            const recs = await getRecommendations(history);
            setRecommendations(recs);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setRecommendations(null);
        } finally {
            setIsLoading(false);
        }
    };
    
    const recentActivity = [
        ...history.products.map(p => ({ ...p, type: 'product' as const })),
        ...history.overhauls.map(o => ({ ...o, type: 'overhaul' as const }))
    ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);
    
    return (
        <div className="space-y-8">
            <Card>
                <div className="text-center">
                    <h2 className="text-3xl font-bold font-manrope text-slate-800">Welcome to Your Dashboard</h2>
                    <p className="text-slate-500 mt-1">Your personalized space for a healthier lifestyle.</p>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    <Card>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center border-4 border-white shadow-md mb-4">
                                <SparklesIcon className="h-8 w-8 text-sky-500" />
                            </div>
                            <h3 className="text-2xl font-bold font-manrope">Personalized Recommendations</h3>
                            <p className="text-slate-500 mt-2 max-w-2xl">
                                {hasHistory 
                                    ? "Based on your analysis history, we can generate a list of new healthy products you might love." 
                                    : "Analyze some products first, and then come back here to get personalized recommendations!"
                                }
                            </p>
                            <button
                                onClick={fetchRecommendations}
                                disabled={!hasHistory || isLoading}
                                className="mt-6 flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100"
                            >
                                {isLoading ? <Spinner /> : 'Generate My Recommendations'}
                            </button>
                        </div>
                    </Card>
            
                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                                <Card className="bg-red-50 border-red-200">
                                    <div className="flex items-center">
                                        <AlertTriangleIcon className="text-red-500 h-5 w-5" />
                                        <p className="ml-3 text-red-700 font-medium text-sm">{error}</p>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {recommendations && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h3 className="text-2xl font-bold font-manrope mb-4 text-slate-800 px-2">For You to Try</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {recommendations.map((rec, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 } }}>
                                            <RecommendationCard item={rec} />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!hasHistory && !isLoading && !recommendations && (
                        <Card>
                            <div className="text-center">
                                <BeakerIcon className="mx-auto h-10 w-10 text-slate-400" />
                                <h3 className="mt-2 text-lg font-medium text-slate-900">Start Your Journey</h3>
                                <p className="mt-1 text-sm text-slate-500">
                                Analyze a product to unlock recommendations.
                                </p>
                                <button
                                    onClick={() => setActiveView('analyzer')}
                                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700"
                                >
                                    Go to Product Analyzer
                                </button>
                            </div>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold font-manrope text-slate-800">Recent Activity</h3>
                            <HistoryIcon className="h-6 w-6 text-slate-400" />
                        </div>
                        {recentActivity.length > 0 ? (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {recentActivity.map(item => <ActivityItem key={item.id} item={item} onClick={() => setActiveView('history')} />)}
                                </AnimatePresence>
                                <button
                                    onClick={() => setActiveView('history')}
                                    className="w-full mt-2 text-center text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors py-2 rounded-lg hover:bg-slate-100"
                                >
                                    View All History
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                                <HistoryIcon className="mx-auto h-10 w-10 text-slate-400" />
                                <h4 className="mt-4 font-semibold text-slate-700">No activity yet</h4>
                                <p className="mt-1 text-sm text-slate-500">Your past analyses will appear here.</p>
                                <button onClick={() => setActiveView('analyzer')} className="mt-4 text-sm font-medium text-sky-600 hover:underline">
                                    Analyze your first product
                                </button>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;