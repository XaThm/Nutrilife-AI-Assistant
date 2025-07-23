
import React, { useState, useCallback, useEffect } from 'react';
import { analyzeProduct } from '../services/geminiService';
import type { AnalysisResult, ProductAnalysis } from '../types';
import { useHistory } from '../hooks/useHistory';
import Spinner from './common/Spinner';
import Card from './common/Card';
import { UploadIcon, AlertTriangleIcon, CheckCircleIcon, XCircleIcon, SparklesIcon, ZapIcon } from './common/Icon';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_IMAGE_DIMENSION = 1024;

const resizeAndEncodeImage = (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            if (!event.target?.result) {
                return reject(new Error("Couldn't read file."));
            }
            const img = new Image();
            img.src = event.target.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                if (width > height) {
                    if (width > MAX_IMAGE_DIMENSION) {
                        height = Math.round(height * (MAX_IMAGE_DIMENSION / width));
                        width = MAX_IMAGE_DIMENSION;
                    }
                } else {
                    if (height > MAX_IMAGE_DIMENSION) {
                        width = Math.round(width * (MAX_IMAGE_DIMENSION / height));
                        height = MAX_IMAGE_DIMENSION;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }
                ctx.drawImage(img, 0, 0, width, height);

                const mimeType = 'image/jpeg';
                const base64 = canvas.toDataURL(mimeType, 0.9).split(',')[1];
                resolve({ base64, mimeType });
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

const ScoreBadge: React.FC<{ score: ProductAnalysis['overallScore'] }> = ({ score }) => {
    const scoreInfo = {
        'A': { color: 'bg-emerald-100 text-emerald-800 border-emerald-300', text: 'Excellent' },
        'B': { color: 'bg-green-100 text-green-800 border-green-300', text: 'Good' },
        'C': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', text: 'Moderate' },
        'D': { color: 'bg-orange-100 text-orange-800 border-orange-300', text: 'Poor' },
        'F': { color: 'bg-red-100 text-red-800 border-red-300', text: 'Very Poor' },
    };

    return (
        <div className={`text-center p-6 rounded-xl border-2 ${scoreInfo[score].color}`}>
            <p className="text-7xl font-bold font-manrope">{score}</p>
            <p className="text-lg font-semibold mt-1">{scoreInfo[score].text}</p>
        </div>
    );
};

const IngredientItem: React.FC<{ ingredient: ProductAnalysis['ingredients'][0] }> = ({ ingredient }) => {
    const impactInfo = {
        Positive: { icon: <CheckCircleIcon className="text-emerald-500" />, color: 'text-emerald-700' },
        Neutral: { icon: <ZapIcon className="text-slate-500" />, color: 'text-slate-700' },
        Negative: { icon: <XCircleIcon className="text-red-500" />, color: 'text-red-700' },
        Controversial: { icon: <AlertTriangleIcon className="text-amber-500" />, color: 'text-amber-700' },
    };

    return (
        <li className="flex items-start space-x-4 py-3">
            <div className="flex-shrink-0 mt-1">{impactInfo[ingredient.impact].icon}</div>
            <div>
                <p className={`font-semibold ${impactInfo[ingredient.impact].color}`}>{ingredient.name}</p>
                <p className="text-slate-600 text-sm">{ingredient.description}</p>
            </div>
        </li>
    );
};


const ProductAnalyzer: React.FC = () => {
    const [productInfo, setProductInfo] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResult>(null);
    const { addProductToHistory } = useHistory();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
             if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(URL.createObjectURL(file));
            setProductInfo(current => current || file.name.split('.')[0].replace(/_/g, ' '));
        }
    };
    
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const query = productInfo.trim();
        if (!query && !imageFile) {
            setError('Please provide a product name, ingredients, or an image.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            let imageBase64: string | undefined = undefined;
            let mimeType: string | undefined = undefined;
            if (imageFile) {
                const resized = await resizeAndEncodeImage(imageFile);
                imageBase64 = resized.base64;
                mimeType = resized.mimeType;
            }
            const analysisResult = await analyzeProduct(query, imageBase64, mimeType);
            setResult(analysisResult);
            addProductToHistory({
                ...analysisResult,
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                query: query || 'Image Analysis'
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [productInfo, imageFile, addProductToHistory]);

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    return (
        <div>
            <Card>
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold font-manrope text-slate-800">Product Analyzer</h2>
                    <p className="text-slate-500 mt-1">Get an instant health score for any food or cosmetic.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="productInfo" className="sr-only">Product Name or Ingredients</label>
                        <textarea
                            id="productInfo"
                            rows={4}
                            value={productInfo}
                            onChange={(e) => setProductInfo(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                            placeholder="e.g., 'Krave Cereal' or paste the full ingredient list here..."
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-slate-500">OR</span>
                        </div>
                    </div>
                    <div>
                         <label htmlFor="imageUpload" className="relative block w-full h-32 border-2 border-slate-300 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-sky-400 transition-colors">
                            <div className="flex flex-col items-center justify-center h-full">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Product Preview" className="max-h-full w-auto rounded-md object-contain" />
                                ) : (
                                  <>
                                    <UploadIcon className="mx-auto h-8 w-8 text-slate-400" />
                                    <span className="mt-2 text-sm text-slate-600">
                                        Upload an image
                                    </span>
                                    <span className="text-xs text-slate-500">{imageFile ? imageFile.name : 'PNG, JPG, up to 10MB'}</span>
                                  </>
                                )}
                            </div>
                            <input id="imageUpload" name="imageUpload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100"
                    >
                        {isLoading ? <Spinner /> : 'Analyze Product'}
                    </button>
                </form>
            </Card>

            <AnimatePresence>
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
                            <div className="grid md:grid-cols-3 gap-6 items-center">
                                <div className="md:col-span-2">
                                   <h2 className="text-3xl font-bold font-manrope mb-2">{result.productName}</h2>
                                    <p className="text-slate-600 leading-relaxed">{result.summary}</p>
                                    {result.allergens.length > 0 && (
                                         <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                            <div className="flex items-center">
                                                <AlertTriangleIcon className="text-amber-500 h-5 w-5" />
                                                <p className="ml-2 text-sm text-amber-800 font-semibold">
                                                    Contains Allergens: <span className="font-normal">{result.allergens.join(', ')}</span>
                                                </p>
                                            </div>
                                         </div>
                                    )}
                                </div>
                                <div className="md:col-span-1">
                                    <ScoreBadge score={result.overallScore} />
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-2xl font-bold font-manrope mb-3">Ingredient Analysis</h3>
                            <ul className="divide-y divide-slate-200">
                               {result.ingredients.map((ing, i) => <IngredientItem key={i} ingredient={ing} />)}
                            </ul>
                        </Card>

                        <Card>
                            <h3 className="text-2xl font-bold font-manrope mb-4 flex items-center">
                              <SparklesIcon className="text-sky-500 mr-2 h-6 w-6" /> Healthier Alternatives
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {result.alternatives.map((alt, i) => (
                                    <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md hover:border-sky-200 transition-all">
                                        <h4 className="font-semibold text-sky-800">{alt.productName}</h4>
                                        <p className="text-slate-600 text-sm mt-1">{alt.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductAnalyzer;