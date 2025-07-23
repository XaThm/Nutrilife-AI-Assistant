import { useState, useEffect, useCallback } from 'react';
import type { HistoryData, ProductHistoryItem, OverhaulHistoryItem } from '../types';

const HISTORY_KEY = 'nutrilife_history';
const MAX_HISTORY_ITEMS = 50; // Keep the last 50 items of each type

const getInitialState = (): HistoryData => {
    try {
        const item = window.localStorage.getItem(HISTORY_KEY);
        if (item) {
            const data = JSON.parse(item);
            // Basic validation to prevent app crash on malformed data
            if (data && Array.isArray(data.products) && Array.isArray(data.overhauls)) {
                return data;
            }
        }
    } catch (error) {
        console.error("Error reading history from localStorage", error);
        // In case of error, return a clean state
        return { products: [], overhauls: [] };
    }
    return { products: [], overhauls: [] };
};

export const useHistory = () => {
    const [history, setHistory] = useState<HistoryData>(getInitialState);

    // Persist history to localStorage whenever it changes
    useEffect(() => {
        try {
            window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        } catch (error) {
            console.error("Error saving history to localStorage", error);
        }
    }, [history]);

    const addProductToHistory = useCallback((item: ProductHistoryItem) => {
        setHistory(prev => ({
            ...prev,
            products: [item, ...prev.products].slice(0, MAX_HISTORY_ITEMS)
        }));
    }, []);

    const addOverhaulToHistory = useCallback((item: OverhaulHistoryItem) => {
        setHistory(prev => ({
            ...prev,
            overhauls: [item, ...prev.overhauls].slice(0, MAX_HISTORY_ITEMS)
        }));
    }, []);

    const clearHistory = useCallback(() => {
        setHistory({ products: [], overhauls: [] });
    }, []);

    return { history, addProductToHistory, addOverhaulToHistory, clearHistory };
};